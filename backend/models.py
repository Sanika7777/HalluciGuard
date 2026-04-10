# ML Inference Engine and Explanation Logic

import pickle
import time
import re
import numpy as np
from pathlib import Path

from logger import log, log_error

PKL_DIR = Path(__file__).parent / "pkl"

RISKY_PATTERNS = [
    (
        r"\b(best|worst|greatest|most|least|top|number one)\b",
        "Superlative — forces LLM to rank without basis",
        ["Be specific about criteria", "Add a timeframe or domain"],
    ),
    (
        r"\b(recently|latest|current|now|today|new|modern|upcoming)\b",
        "Temporal vagueness — LLM knowledge has a cutoff",
        ["Specify the exact year or date", "Mention the source you want cited"],
    ),
    (
        r"\b(everyone|nobody|always|never|all|none|every)\b",
        "Universal claim — LLMs hallucinate broad generalizations",
        ["Narrow scope to specific group", "Ask for examples instead"],
    ),
    (
        r"\b(prove|fact|truth|definitely|certainly|obviously|clearly)\b",
        "Epistemic overconfidence — invites fabricated certainty",
        ["Ask for 'evidence suggests' framing", "Request citations"],
    ),
    (
        r"\b(secret|hidden|unknown|rare|obscure|little.known)\b",
        "Obscure knowledge request — high hallucination risk zone",
        ["Specify your source domain", "Ask LLM to say if unsure"],
    ),
    (
        r"\b(why did|why does|reason for|cause of)\b",
        "Causal reasoning — LLMs often confabulate causes",
        ["Ask for multiple possible reasons", "Request 'may be' framing"],
    ),
    (
        r"\b(who invented|who discovered|who created|who made)\b",
        "Attribution claim — commonly hallucinated",
        ["Specify the domain or era", "Cross-check with Wikipedia first"],
    ),
    (
        r"\b(exact|precisely|exactly|specific number|how many)\b",
        "Exact quantity request — LLMs guess numbers",
        ["Ask for approximate ranges", "Request a citation for the number"],
    ),
    (
        r"\b(compare|difference between|vs|versus|better than)\b",
        "Comparative claim — may fabricate differences",
        ["List specific attributes to compare", "Specify the use case"],
    ),
    (
        r"\b(should i|recommend|advice|suggest|tell me what to)\b",
        "Advice request — LLM may confabulate recommendations",
        ["Add your specific constraints", "Specify your domain/context"],
    ),
]

ABSTENTION_PATTERNS = [
    (
        r"\b(recently|latest|current|2024|2025|today|this year)\b",
        "major_context",
        "Requires up-to-date info beyond training data",
    ),
    (
        r"\b(my|our|this company|this project|local|personal)\b",
        "major_context",
        "Requires private/personal context LLM cannot know",
    ),
    (
        r"\b(predict|will|future|forecast|next year)\b",
        "unanswerable",
        "Future prediction — inherently unanswerable with certainty",
    ),
    (
        r"\b(secret|classified|private|internal|confidential)\b",
        "unanswerable",
        "Requests non-public information",
    ),
    (
        r"\b(exact|precisely|specific number)\b",
        "minor_context",
        "Exact figures need a cited source",
    ),
]


#model store to hold loaded ML models in memory for fast inference without reloading from disk on every request
class ModelStore:
    prompt_model: dict = None
    response_model: dict = None
    loaded: bool = False

    @classmethod
    def load(cls):
        try:
            log.info("Loading prompt risk model from pkl...")
            with open(PKL_DIR / "prompt_risk_model.pkl", "rb") as f:
                cls.prompt_model = pickle.load(f)

            log.info("Loading response hallucination model from pkl...")
            with open(PKL_DIR / "response_hallucination_model.pkl", "rb") as f:
                cls.response_model = pickle.load(f)

            cls.loaded = True
            log.info("All models loaded successfully.")
        except Exception as e:
            log_error("ModelStore.load", e)
            raise RuntimeError(f"Failed to load models: {e}")


#word highlighting --doesnt work properly yet
def get_word_highlights(text: str, risky_features: dict, top_n: int = 10) -> list[dict]:
    """
    Tokenize text, score each token against TF-IDF risky features,
    then enrich with pattern-based reasons for tooltip display.
    Returns list of highlight dicts with char positions.
    """
    highlights = []
    seen_words = set()

    word_scores = []
    for orig_match, lower_match in zip(
        re.finditer(r"\b\w+\b", text), re.finditer(r"\b\w+\b", text.lower())
    ):
        word = lower_match.group()
        score = risky_features.get(word, 0.0)

        # Also check bigrams (word + next)
        bigram_score = 0.0
        for feature, feat_score in risky_features.items():
            if " " in feature and word in feature:
                bigram_score = max(bigram_score, feat_score * 0.7)

        total_score = max(score, bigram_score)
        if total_score > 0.1:
            word_scores.append((orig_match, word, total_score))

    # Sort by score, take top_n
    word_scores.sort(key=lambda x: x[2], reverse=True)

    for orig_match, word, score in word_scores[:top_n]:
        if word in seen_words:
            continue
        seen_words.add(word)

        # Find matching pattern for reason + suggestions
        reason = "Statistically associated with hallucination risk"
        suggestions = ["Add more context around this term", "Be more specific"]

        for pattern, pat_reason, pat_suggestions in RISKY_PATTERNS:
            if re.search(pattern, word, re.IGNORECASE):
                reason = pat_reason
                suggestions = pat_suggestions
                break

        # Normalize score to 0-1
        normalized = min(float(score) / (max(risky_features.values()) + 1e-9), 1.0)

        highlights.append(
            {
                "word": orig_match.group(),
                "start": orig_match.start(),
                "end": orig_match.end(),
                "risk_score": round(normalized, 3),
                "reason": reason,
                "suggestions": suggestions,
            }
        )

    return highlights


def get_response_highlights(
    response_text: str, prompt_text: str, vectorizer, classifier
) -> list[dict]:

    highlights = []
    seen = set()

    feature_names = vectorizer.get_feature_names_out()
    coefs = (
        classifier.coef_[0]
        if hasattr(classifier, "coef_")
        else np.zeros(len(feature_names))
    )
    risky_features = {
        feature_names[i]: float(coefs[i]) for i in np.argsort(coefs)[-300:]
    }

    for orig_match, lower_match in zip(
        re.finditer(r"\b\w+\b", response_text),
        re.finditer(r"\b\w+\b", response_text.lower()),
    ):
        word = lower_match.group()
        score = risky_features.get(word, 0.0)

        if score > 0.05 and word not in seen:
            seen.add(word)
            reason = "Term statistically linked to hallucinated responses"
            suggestions = [
                "Verify this claim independently",
                "Check against authoritative source",
            ]

            for pattern, pat_reason, pat_suggestions in RISKY_PATTERNS:
                if re.search(pattern, word, re.IGNORECASE):
                    reason = pat_reason
                    suggestions = pat_suggestions
                    break

            max_coef = max(risky_features.values()) + 1e-9
            highlights.append(
                {
                    "word": orig_match.group(),
                    "start": orig_match.start(),
                    "end": orig_match.end(),
                    "risk_score": round(min(score / max_coef, 1.0), 3),
                    "reason": reason,
                    "suggestions": suggestions,
                }
            )

    highlights.sort(key=lambda x: x["risk_score"], reverse=True)
    return highlights[:8]


#score breakdown logic
def compute_score_breakdown(prompt: str, base_confidence: float) -> dict:
    words = prompt.lower().split()
    word_count = len(words)

    # Ambiguity: vague words, short prompts, no constraints
    vague_words = {
        "something",
        "thing",
        "stuff",
        "it",
        "they",
        "someone",
        "anyone",
        "good",
        "bad",
        "nice",
    }
    vague_count = sum(1 for w in words if w in vague_words)
    ambiguity = min(
        1.0,
        (vague_count / max(word_count, 1)) * 3 + (1 - min(word_count / 20, 1)) * 0.4,
    )

    # Specificity
    has_numbers = bool(re.search(r"\d+", prompt))
    has_quotes = bool(re.search(r'["\']', prompt))
    has_proper_nouns = bool(re.search(r"\b[A-Z][a-z]+\b", prompt))
    specificity_score = has_numbers * 0.3 + has_quotes * 0.3 + has_proper_nouns * 0.2
    specificity_risk = max(0.0, 1.0 - specificity_score - (word_count / 50) * 0.2)

    #words that are used for better context
    context_words = {
        "because",
        "since",
        "given",
        "context",
        "background",
        "specifically",
        "in",
        "for",
        "about",
    }
    context_count = sum(1 for w in words if w in context_words)
    context_risk = max(
        0.0, 1.0 - (context_count / max(word_count, 1)) * 5 - (word_count / 30) * 0.3
    )

    # Blend with model confidence
    blend = 0.4
    return {
        "ambiguity": round(
            min(1.0, ambiguity * (1 - blend) + base_confidence * blend), 3
        ),
        "specificity": round(
            min(1.0, specificity_risk * (1 - blend) + base_confidence * blend), 3
        ),
        "context": round(
            min(1.0, context_risk * (1 - blend) + base_confidence * blend), 3
        ),
    }


#abstention logic
def detect_abstention(prompt: str) -> tuple[str, str, list[str]]:

    level = "self_contained"
    reason = "Prompt appears self-contained"
    missing = []

    for pattern, pat_level, pat_reason in ABSTENTION_PATTERNS:
        if re.search(pattern, prompt, re.IGNORECASE):
            # Escalate level
            levels_order = [
                "self_contained",
                "minor_context",
                "major_context",
                "unanswerable",
            ]
            if levels_order.index(pat_level) > levels_order.index(level):
                level = pat_level
                reason = pat_reason

    # Build missing context list
    if not re.search(
        r"\b(in|for|about|regarding)\b.{1,30}\b(field|domain|industry|context)\b",
        prompt,
        re.IGNORECASE,
    ):
        missing.append("Domain or field of application")
    if not re.search(r"\b(20\d\d|\d{4}|year|date|period|era)\b", prompt, re.IGNORECASE):
        missing.append("Time period or date reference")
    if not re.search(r"\b(because|since|given that|assuming)\b", prompt, re.IGNORECASE):
        missing.append("Background context or assumptions")
    if len(prompt.split()) < 8:
        missing.append("More detail about what you're looking for")

    return level, reason, missing


#main inference engine - main prediction


def predict_prompt_risk(prompt: str, llm_target: str = "gpt4") -> dict:
    """Full prompt risk analysis pipeline."""
    t0 = time.perf_counter()

    model = ModelStore.prompt_model
    pipeline = model["pipeline"]
    risky_features = model["risky_features"]

    # Model prediction
    proba = pipeline.predict_proba([prompt])[0]
    risky_idx = list(pipeline.classes_).index(1) if 1 in pipeline.classes_ else 1
    confidence = float(proba[risky_idx])
    label = "risky" if confidence >= 0.5 else "safe"

    # Word highlights
    highlights = get_word_highlights(prompt, risky_features)

    # Score breakdown
    breakdown = compute_score_breakdown(prompt, confidence)

    # Abstention
    abstention_level, abstention_reason, missing_context = detect_abstention(prompt)

    # Why risky bullets (derived from highlights + patterns)
    why_risky = []
    seen_reasons = set()
    for h in highlights[:5]:
        short_reason = h["reason"].split("—")[0].strip()
        if short_reason not in seen_reasons:
            why_risky.append(short_reason)
            seen_reasons.add(short_reason)
    if not why_risky:
        why_risky = ["Prompt lacks specificity and context"]

    # What to add
    what_to_add = []
    for h in highlights[:3]:
        if h["suggestions"]:
            what_to_add.append(h["suggestions"][0])
    if missing_context:
        what_to_add.extend(missing_context[:2])
    what_to_add = list(dict.fromkeys(what_to_add))[:5]  # dedupe

    duration_ms = round((time.perf_counter() - t0) * 1000, 2)
    log.info(
        "Prompt risk predicted",
        extra={
            "label": label,
            "confidence": confidence,
            "highlights_count": len(highlights),
            "duration_ms": duration_ms,
        },
    )

    return {
        "label": label,
        "confidence": round(confidence, 4),
        "risk_percent": int(confidence * 100),
        "score_breakdown": breakdown,
        "highlights": highlights,
        "abstention_level": abstention_level,
        "abstention_reason": abstention_reason,
        "missing_context": missing_context,
        "why_risky": why_risky,
        "what_to_add": what_to_add,
        "llm_target": llm_target,
    }


def predict_response_hallucination(prompt: str, response: str) -> dict:
    """Full response hallucination analysis pipeline."""
    t0 = time.perf_counter()

    model = ModelStore.response_model
    vectorizer = model["vectorizer"]
    binary_clf = model["binary_clf"]
    type_clf = model["type_clf"]
    le = model["label_encoder"]
    type_labels = model["type_labels"]

    combined_text = f"PROMPT: {prompt} RESPONSE: {response}"
    X = vectorizer.transform([combined_text])

    # Binary prediction
    bin_proba = binary_clf.predict_proba(X)[0]
    hallucinated = bool(binary_clf.predict(X)[0])
    confidence = float(max(bin_proba))

    # Type classification (model-predicted, not hardcoded)
    hallucination_type = None
    if hallucinated:
        type_proba = type_clf.predict_proba(X)[0]
        type_pred_idx = int(type_proba.argmax())
        type_pred = type_pred_idx
        type_label_raw = le.classes_[type_pred]
        type_confidence = float(max(type_proba))
        type_description = type_labels.get(
            type_label_raw, type_label_raw.replace("_", " ").title()
        )
        hallucination_type = {
            "type_label": type_label_raw,
            "type_description": type_description,
            "confidence": round(type_confidence, 4),
        }

    # Response highlights
    highlights = get_response_highlights(response, prompt, vectorizer, binary_clf)

    # Explanation bullets
    explanation = []
    if hallucinated:
        explanation.append(
            "Response contains statistically hallucination-prone patterns"
        )
        if hallucination_type:
            explanation.append(
                f"Detected type: {hallucination_type['type_description']}"
            )
        for h in highlights[:2]:
            explanation.append(h["reason"].split("—")[0].strip())
    else:
        explanation.append("Response appears grounded and factually consistent")
        explanation.append("No strong hallucination signals detected by model")

    duration_ms = round((time.perf_counter() - t0) * 1000, 2)
    log.info(
        "Response hallucination predicted",
        extra={
            "hallucinated": hallucinated,
            "confidence": confidence,
            "type": hallucination_type,
            "duration_ms": duration_ms,
        },
    )

    return {
        "hallucinated": hallucinated,
        "confidence": round(confidence, 4),
        "risk_percent": int(confidence * 100),
        "hallucination_type": hallucination_type,
        "explanation": explanation,
        "highlights": highlights,
    }
