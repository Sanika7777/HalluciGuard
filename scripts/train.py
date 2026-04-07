#EXPERIMENT 1: PROMPT HALLUCINATION DETECTION MODELS

import os
import pickle
import logging
import numpy as np
import pandas as pd
from pathlib import Path
from datasets import load_dataset
from sklearn.pipeline import Pipeline
from sklearn.linear_model import LogisticRegression
from sklearn.multiclass import OneVsRestClassifier
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score
from sklearn.preprocessing import LabelEncoder

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
log = logging.getLogger(__name__)

PKL_DIR = Path(__file__).parent.parent / "backend" / "pkl"
PKL_DIR.mkdir(parents=True, exist_ok=True)


#dataset loading and preprocessing functions
def load_truthfulqa():
   
    log.info("Loading TruthfulQA dataset...")
    ds = load_dataset("truthfulqa/truthful_qa", "generation")
    df = pd.DataFrame(ds["validation"])

    risky = pd.DataFrame({
        "text": df["question"],
        "label": 1,  # risky
        "category": df["category"]
    })

    safe_questions = [
        "What is the capital of France?",
        "Who wrote Romeo and Juliet?",
        "What year did World War II end?",
        "What is the speed of light?",
        "Who invented the telephone?",
        "What is the boiling point of water?",
        "How many continents are there?",
        "What is the largest planet in our solar system?",
        "Who painted the Mona Lisa?",
        "What is photosynthesis?",
        "What is the chemical formula for water?",
        "How many bones are in the human body?",
        "What language is spoken in Brazil?",
        "What is the square root of 144?",
        "Who was the first US president?",
        "What is the tallest mountain in the world?",
        "What is the currency of Japan?",
        "How many days are in a leap year?",
        "What organ pumps blood through the body?",
        "What is the atomic number of carbon?",
    ] * 20  # repeat to balance classes

    safe = pd.DataFrame({
        "text": safe_questions[:len(risky)],
        "label": 0,  # safe
        "category": "factual"
    })

    combined = pd.concat([risky, safe], ignore_index=True).sample(frac=1, random_state=42)
    log.info(f"TruthfulQA: {len(risky)} risky + {len(safe)} safe = {len(combined)} total")
    return combined


def load_halueval():
   
    log.info("Loading HaluEval dataset...")
    all_records = []

    try:
        ds_qa = load_dataset("pminervini/HaluEval", "qa_samples")
        df_qa = pd.DataFrame(ds_qa["data"])
        log.info(f"HaluEval QA: {len(df_qa)} records, columns: {df_qa.columns.tolist()}")

        for _, row in df_qa.iterrows():
            question = str(row.get("question", row.get("input", "")))
            
            answer = str(row.get("answer", ""))
            is_hallucinated = str(row.get("hallucination", "no")).strip().lower() == "yes"
            if answer:
                all_records.append({
                    "text": f"PROMPT: {question} RESPONSE: {answer}",
                    "hallucinated": 1 if is_hallucinated else 0,
                    "hallucination_type": "factual_hallucination" if is_hallucinated else "none"
                })
    except Exception as e:
        log.warning(f"HaluEval QA failed: {e}")

    # Load summarization split  
    try:
        ds_sum = load_dataset("pminervini/HaluEval", "summarization_samples")
        df_sum = pd.DataFrame(ds_sum["data"])
        log.info(f"HaluEval Summarization: {len(df_sum)} records")

        for _, row in df_sum.iterrows():
            doc = str(row.get("document", ""))[:300]
            
            right_sum = str(row.get("right_summary", ""))
            if right_sum:
                all_records.append({
                    "text": f"PROMPT: Summarize: {doc} RESPONSE: {right_sum}",
                    "hallucinated": 0,
                    "hallucination_type": "none"
                })

            is_hall = str(row.get("hallucination", "no")).strip().lower() == "yes"
            right_sum = str(row.get("right_summary", row.get("summary", "")))
            if right_sum:
                all_records.append({
                    "text": f"PROMPT: Summarize: {doc} RESPONSE: {right_sum}",
                    "hallucinated": 1 if is_hall else 0,
                    "hallucination_type": "entity_hallucination" if is_hall else "none"
                })
    except Exception as e:
        log.warning(f"HaluEval Summarization failed: {e}")

    # Load dialogue split
    try:
        ds_dlg = load_dataset("pminervini/HaluEval", "dialogue_samples")
        df_dlg = pd.DataFrame(ds_dlg["data"])
        log.info(f"HaluEval Dialogue: {len(df_dlg)} records")

        for _, row in df_dlg.iterrows():
            history = str(row.get("dialogue_history", ""))[:200]
            
            right_resp = str(row.get("right_response", ""))
            if right_resp:
                all_records.append({
                    "text": f"PROMPT: {history} RESPONSE: {right_resp}",
                    "hallucinated": 0,
                    "hallucination_type": "none"
                })

            hall_resp = str(row.get("hallucinated_response", ""))
            if hall_resp and hall_resp != right_resp:
                all_records.append({
                    "text": f"PROMPT: {history} RESPONSE: {hall_resp}",
                    "hallucinated": 1,
                    "hallucination_type": "reasoning_hallucination"
                })
    except Exception as e:
        log.warning(f"HaluEval Dialogue failed: {e}")

    if not all_records:
        raise RuntimeError("No HaluEval data loaded. Check dataset availability.")

    df = pd.DataFrame(all_records).dropna().sample(frac=1, random_state=42).reset_index(drop=True)
    log.info(f"HaluEval total: {len(df)} records | Hallucinated: {df['hallucinated'].sum()}")
    log.info(f"Hallucination types: {df['hallucination_type'].value_counts().to_dict()}")
    return df


#model training functions
def train_prompt_risk_model(df: pd.DataFrame):

    log.info("Training Prompt Risk Classifier...")

    X = df["text"].astype(str)
    y = df["label"]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    pipeline = Pipeline([
        ("tfidf", TfidfVectorizer(
            ngram_range=(1, 3),
            max_features=15000,
            min_df=1,
            sublinear_tf=True,
            analyzer="word"
        )),
        ("clf", LogisticRegression(
            max_iter=1000,
            C=1.0,
            class_weight="balanced",
            random_state=42
        ))
    ])

    pipeline.fit(X_train, y_train)

    y_pred = pipeline.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    log.info(f"Prompt Risk Model Accuracy: {acc:.4f}")
    log.info(f"\n{classification_report(y_test, y_pred, target_names=['safe', 'risky'])}")

    vectorizer = pipeline.named_steps["tfidf"]
    classifier = pipeline.named_steps["clf"]
    feature_names = vectorizer.get_feature_names_out()
    
    risky_coefs = classifier.coef_[0]
    top_risky_indices = np.argsort(risky_coefs)[-200:]
    risky_features = {feature_names[i]: float(risky_coefs[i]) for i in top_risky_indices}

    model_data = {
        "pipeline": pipeline,
        "risky_features": risky_features,
        "classes": ["safe", "risky"],
        "accuracy": acc,
        "feature_names": feature_names
    }

    path = PKL_DIR / "prompt_risk_model.pkl"
    with open(path, "wb") as f:
        pickle.dump(model_data, f)
    log.info(f"Saved prompt risk model → {path}")
    return model_data


def train_response_hallucination_model(df: pd.DataFrame):
    """
    Model 1 (Binary): Is the response hallucinated?
    Model 2 (Multi-class): What TYPE of hallucination? (model-predicted, not hardcoded)
    """
    log.info("Training Response Hallucination Classifier...")

    X = df["text"].astype(str)
    y_binary = df["hallucinated"]
    y_type = df["hallucination_type"]

    vectorizer = TfidfVectorizer(
        ngram_range=(1, 3),
        max_features=20000,
        min_df=1,
        sublinear_tf=True
    )
    X_vec = vectorizer.fit_transform(X)

    X_train, X_test, y_train, y_test = train_test_split(
        X_vec, y_binary, test_size=0.2, random_state=42, stratify=y_binary
    )
    binary_clf = LogisticRegression(
        max_iter=1000, C=1.0, class_weight="balanced", random_state=42
    )
    binary_clf.fit(X_train, y_train)
    y_pred = binary_clf.predict(X_test)
    acc_bin = accuracy_score(y_test, y_pred)
    log.info(f"Response Hallucination Binary Accuracy: {acc_bin:.4f}")
    log.info(f"\n{classification_report(y_test, y_pred, target_names=['clean', 'hallucinated'])}")

    hall_mask = df["hallucinated"] == 1
    df_hall = df[hall_mask].copy()

    le = LabelEncoder()
    
    type_labels = {
        "factual_hallucination": "Factual Hallucination — model states incorrect facts",
        "entity_hallucination": "Entity Hallucination — wrong names, places, or entities",
        "reasoning_hallucination": "Reasoning Hallucination — flawed logic or inference",
        "temporal_hallucination": "Temporal Hallucination — wrong dates or time references",
        "none": "No Hallucination"
    }

    y_type_hall = le.fit_transform(df_hall["hallucination_type"].astype(str))
    X_hall = vectorizer.transform(df_hall["text"].astype(str))

    X_train_t, X_test_t, y_train_t, y_test_t = train_test_split(
        X_hall, y_type_hall, test_size=0.2, random_state=42
    )
    type_clf = Pipeline([
        ("clf", LogisticRegression(
            max_iter=1000, C=1.0, class_weight="balanced", random_state=42
        ))
    ])
    type_clf.fit(X_train_t, y_train_t)
    y_pred_t = type_clf.predict(X_test_t)
    acc_type = accuracy_score(y_test_t, y_pred_t)
    log.info(f"Hallucination Type Classifier Accuracy: {acc_type:.4f}")
    log.info(f"\n{classification_report(y_test_t, y_pred_t, target_names=le.classes_)}")

    model_data = {
        "vectorizer": vectorizer,
        "binary_clf": binary_clf,
        "type_clf": type_clf,
        "label_encoder": le,
        "type_labels": type_labels,
        "binary_classes": ["clean", "hallucinated"],
        "type_classes": le.classes_.tolist(),
        "accuracy_binary": acc_bin,
        "accuracy_type": acc_type,
        "feature_names": vectorizer.get_feature_names_out()
    }

    path = PKL_DIR / "response_hallucination_model.pkl"
    with open(path, "wb") as f:
        pickle.dump(model_data, f)
    log.info(f"Saved response hallucination model → {path}")
    return model_data


#verification function to ensure models load correctly and can make predictions
def verify_models():
    log.info("Verifying model loading...")

    # Verify prompt risk model
    with open(PKL_DIR / "prompt_risk_model.pkl", "rb") as f:
        prompt_model = pickle.load(f)
    test_prompt = "What is the best cure for cancer according to the latest research?"
    prob = prompt_model["pipeline"].predict_proba([test_prompt])[0]
    label = prompt_model["classes"][np.argmax(prob)]
    log.info(f"Prompt model verification → label: {label}, confidence: {max(prob):.4f}")
    assert "pipeline" in prompt_model and "risky_features" in prompt_model

    # Verify response hallucination model
    with open(PKL_DIR / "response_hallucination_model.pkl", "rb") as f:
        resp_model = pickle.load(f)
    test_text = "PROMPT: Who invented electricity? RESPONSE: Albert Einstein invented electricity in 1879."
    X_test = resp_model["vectorizer"].transform([test_text])
    bin_pred = resp_model["binary_clf"].predict(X_test)[0]
    bin_prob = resp_model["binary_clf"].predict_proba(X_test)[0]
    log.info(f"Response model verification → hallucinated: {bool(bin_pred)}, confidence: {max(bin_prob):.4f}")
    assert "vectorizer" in resp_model and "binary_clf" in resp_model and "type_clf" in resp_model

    log.info("All models verified successfully!")


#main function to orchestrate the entire training pipeline
def main():
    log.info("=" * 60)
    log.info("Starting Model Training Pipeline")
    log.info("=" * 60)

    df_prompt = load_truthfulqa()
    df_response = load_halueval()

    train_prompt_risk_model(df_prompt)
    train_response_hallucination_model(df_response)

    verify_models()

    log.info("=" * 60)
    log.info("Training Complete. PKL files saved to backend/pkl/")
    log.info(f"  → {PKL_DIR / 'prompt_risk_model.pkl'}")
    log.info(f"  → {PKL_DIR / 'response_hallucination_model.pkl'}")
    log.info("=" * 60)


if __name__ == "__main__":
    main()