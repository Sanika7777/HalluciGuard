# OLLAMA API INTEGRATION

import json
import time
import requests
from logger import log, log_error

OLLAMA_BASE = "http://localhost:11434"
OLLAMA_MODEL = "phi3"  # change to "mistral", "phi3", "gemma2" etc.
TIMEOUT = 60  # in seconds

LLM_QUIRKS = {
    "gpt4": "GPT-4 hallucinate on recent events and math edge cases. Responds well to role-framing and step-by-step.",
    "gemini": "Gemini over-explains and fabricates citations. Benefits from explicit output format constraints.",
    "claude": "Claude hallucinate on obscure facts. Responds well to chain-of-thought prompting.",
    "llama": "Llama hallucinates more on niche topics and long reasoning. Needs short, precise prompts.",
}


# HEALTH CHECK
def check_ollama_running() -> bool:
    try:
        r = requests.get(f"{OLLAMA_BASE}/api/tags", timeout=3)
        return r.status_code == 200
    except Exception:
        return False


def ollama_generate(prompt: str, system: str = "") -> str:
    """
    Single call to Ollama's /api/generate endpoint.
    Returns the response text or raises on failure.
    """
    if not check_ollama_running():
        raise RuntimeError(
            "Ollama is not running. Start it with: ollama serve\n"
            "Then pull a model: ollama pull phi3"
        )

    full_prompt = f"{system}\n\n{prompt}" if system else prompt

    payload = {
        "model": OLLAMA_MODEL,
        "prompt": full_prompt,
        "stream": False,
        "options": {
            "temperature": 0.3,  # low temp = more consistent JSON output
            "top_p": 0.9,
            "num_predict": 1024,
        },
    }

    response = requests.post(
        f"{OLLAMA_BASE}/api/generate", json=payload, timeout=TIMEOUT
    )
    response.raise_for_status()
    return response.json().get("response", "").strip()


def parse_json_response(raw: str) -> dict:
    """Strip markdown fences and parse JSON safely."""
    clean = raw.replace("```json", "").replace("```", "").strip()
    # Find first { and last } to extract JSON block
    start = clean.find("{")
    end = clean.rfind("}") + 1
    if start != -1 and end > start:
        clean = clean[start:end]
    return json.loads(clean)


# CONTEXT ANALYSIS
def analyze_prompt_context(
    prompt: str, risk_result: dict, llm_target: str = "gpt4"
) -> dict:
    t0 = time.perf_counter()

    llm_quirk = LLM_QUIRKS.get(llm_target, LLM_QUIRKS["gpt4"])
    highlights_summary = [h["reason"] for h in risk_result.get("highlights", [])[:5]]

    system = (
        "You are an expert in LLM hallucination analysis. "
        "Analyze prompts and identify hallucination risks. "
        "You ALWAYS respond with valid JSON only. "
        "No markdown, no explanation outside JSON. "
        "Keep all bullet points to 5-8 words maximum."
    )

    user = f"""Analyze this prompt for hallucination risk:

PROMPT: "{prompt}"

TARGET LLM: {llm_target}
LLM CHARACTERISTICS: {llm_quirk}
ML MODEL RISK SCORE: {risk_result.get('risk_percent', 0)}%
ML DETECTED ISSUES: {json.dumps(highlights_summary)}

Respond ONLY with this exact JSON structure, nothing else:
{{
  "missing_context": ["specific missing element", "another missing element"],
  "why_risky": ["5-8 word reason", "another short reason"],
  "abstention_needed": {{
    "level": "none|low|medium|high",
    "reason": "one sentence why",
    "what_context_required": ["exactly what background info is needed", "another requirement"]
  }},
  "what_to_add": ["specific addition to improve prompt", "another concrete suggestion"],
  "llm_specific_warning": "one sentence about this LLM weakness with this prompt"
}}"""

    try:
        raw = ollama_generate(user, system)
        result = parse_json_response(raw)

        duration_ms = round((time.perf_counter() - t0) * 1000, 2)
        log.info(
            "Ollama context analysis complete",
            extra={"model": OLLAMA_MODEL, "duration_ms": duration_ms},
        )
        return result

    except json.JSONDecodeError as e:
        log_error(
            "analyze_prompt_context JSON parse",
            e,
            {"raw": raw[:200] if "raw" in dir() else ""},
        )
        return _fallback_context(risk_result)
    except Exception as e:
        log_error("analyze_prompt_context", e)
        return _fallback_context(risk_result)


# PROMPT ENGINEERING


def engineer_prompt(
    prompt: str, llm_target: str = "gpt4", risk_context: dict = None
) -> dict:

    t0 = time.perf_counter()

    llm_quirk = LLM_QUIRKS.get(llm_target, LLM_QUIRKS["gpt4"])
    context_str = json.dumps(risk_context or {})

    system = (
        "You are a world-class prompt engineer specializing in eliminating LLM hallucinations. "
        "Rewrite prompts to be precise, grounded, and hallucination-resistant. "
        "You ALWAYS respond with valid JSON only. No markdown, no preamble."
    )

    user = f"""Engineer this prompt to minimize hallucination risk for {llm_target}:

ORIGINAL PROMPT: "{prompt}"
TARGET LLM: {llm_target}
LLM CHARACTERISTICS: {llm_quirk}
RISK CONTEXT: {context_str}

Apply these techniques:
1. Add specificity constraints (who, what, when, where)
2. Replace vague terms with precise language
3. Add uncertainty acknowledgment ("If unsure, say so")
4. Add output format constraints
5. Tailor for {llm_target}'s known weaknesses

Respond ONLY with this exact JSON, nothing else:
{{
  "engineered_prompt": "the full rewritten prompt here",
  "diff": [
    {{
      "original": "original phrase",
      "engineered": "what it became",
      "reason": "why this reduces hallucination"
    }}
  ],
  "improvements": ["specific improvement and why it helps", "another improvement"],
  "overall_improvement": "one sentence summary of changes",
  "estimated_risk_reduction": "low|medium|high"
}}"""

    try:
        raw = ollama_generate(user, system)
        result = parse_json_response(raw)

        duration_ms = round((time.perf_counter() - t0) * 1000, 2)
        log.info(
            "Ollama prompt engineering complete",
            extra={
                "model": OLLAMA_MODEL,
                "llm_target": llm_target,
                "duration_ms": duration_ms,
                "risk_reduction": result.get("estimated_risk_reduction"),
            },
        )

        return {
            "original_prompt": prompt,
            "engineered_prompt": result.get("engineered_prompt", prompt),
            "diff": result.get("diff", []),
            "improvements": result.get("improvements", []),
            "overall_improvement": result.get("overall_improvement", ""),
            "estimated_risk_reduction": result.get(
                "estimated_risk_reduction", "medium"
            ),
            "llm_target": llm_target,
        }

    except json.JSONDecodeError as e:
        log_error(
            "engineer_prompt JSON parse",
            e,
            {"raw": raw[:200] if "raw" in dir() else ""},
        )
        return _fallback_engineer(prompt, llm_target)
    except Exception as e:
        log_error("engineer_prompt", e)
        return _fallback_engineer(prompt, llm_target)


# FALLBACKS
def _fallback_context(risk_result: dict) -> dict:
    return {
        "missing_context": risk_result.get(
            "missing_context",
            [
                "Domain or field of application",
                "Time period or date reference",
                "Background assumptions",
            ],
        ),
        "why_risky": risk_result.get(
            "why_risky",
            ["Prompt lacks sufficient specificity", "No context constraints provided"],
        ),
        "abstention_needed": {
            "level": "medium",
            "reason": "Prompt requires additional context for accurate response",
            "what_context_required": [
                "Background information",
                "Specific domain or use case",
            ],
        },
        "what_to_add": risk_result.get(
            "what_to_add",
            ["Add domain context", "Specify time period", "Include your constraints"],
        ),
        "llm_specific_warning": f"Ollama ({OLLAMA_MODEL}) unavailable — using ML model analysis only. Run: ollama serve",
    }


def _fallback_engineer(prompt: str, llm_target: str) -> dict:
    engineered = (
        f"Please provide a detailed and accurate response to the following. "
        f"If you are unsure about any specific facts, explicitly state your uncertainty "
        f"rather than guessing. Cite sources where possible and avoid speculation.\n\n{prompt}"
    )
    return {
        "original_prompt": prompt,
        "engineered_prompt": engineered,
        "diff": [
            {
                "original": prompt[:60] + "...",
                "engineered": "Added uncertainty and citation instructions",
                "reason": "Reduces fabrication by asking model to flag uncertainty",
            }
        ],
        "improvements": [
            "Added explicit uncertainty acknowledgment instruction",
            "Requested citations to ground factual claims",
        ],
        "overall_improvement": "Added basic hallucination guardrails",
        "estimated_risk_reduction": "low",
        "llm_target": llm_target,
    }
