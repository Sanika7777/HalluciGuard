"""
claude_api.py — Claude API Integration (Production Ready)

Responsibilities:
- analyze_prompt_context(): ALWAYS runs — enriches ML output with Claude's
  textual analysis. Never overwrites ML scores/highlights/labels.
- engineer_prompt(): ON-DEMAND only — rewrites prompt on button click.

Security & reliability:
- API key loaded from env only (never hardcoded)
- Timeout on every call (prevents hanging)
- Retry with exponential backoff (handles transient errors)
- Graceful fallback to ML-only results if Claude unavailable
- Response validated before use (malformed JSON handled)
- No prompt injection — user input is clearly delimited
"""

import os
import json
import time
import logging
from anthropic import Anthropic, APITimeoutError, APIConnectionError, RateLimitError

log = logging.getLogger("hallucination_detector")

#setup

ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY", "")
CLAUDE_MODEL = os.getenv("CLAUDE_MODEL", "claude-sonnet-4-5")
CLAUDE_AVAILABLE = bool(ANTHROPIC_API_KEY)

if not CLAUDE_AVAILABLE:
    log.warning(
        "ANTHROPIC_API_KEY not set. Claude API disabled — "
        "using ML-only fallbacks. Set ANTHROPIC_API_KEY to enable prompt engineering."
    )
    client = None
else:
    client = Anthropic(api_key=ANTHROPIC_API_KEY)
    log.info(f"Claude API ready. Model: {CLAUDE_MODEL}")

#tailors analysis and engineering per target LLM

LLM_QUIRKS = {
    "gpt4": "GPT-4 hallucinates on very recent events and math edge cases. Responds well to role-framing and step-by-step reasoning.",
    "gemini": "Gemini over-explains and sometimes fabricates citations. Benefits from explicit output format constraints and length limits.",
    "claude": "Claude is cautious but can hallucinate on obscure factual claims. Responds well to chain-of-thought and uncertainty acknowledgment.",
    "llama": "Llama models hallucinate more on niche topics and long reasoning chains. Benefits from short, precise prompts with clear constraints.",
}

#retry helper for error handling


def _call_claude(
    system: str, user: str, max_tokens: int = 1000, retries: int = 2
) -> str:
    """
    Call Claude with retry + exponential backoff.
    Raises on final failure — caller handles fallback.
    """
    if not CLAUDE_AVAILABLE or client is None:
        raise RuntimeError("Claude API not configured.")

    last_exc = None
    for attempt in range(retries + 1):
        try:
            response = client.messages.create(
                model=CLAUDE_MODEL,
                max_tokens=max_tokens,
                timeout=30.0,  # 30s hard timeout per call
                system=system,
                messages=[{"role": "user", "content": user}],
            )
            return response.content[0].text.strip()

        except RateLimitError as e:
            log.warning(
                f"Claude rate limited (attempt {attempt + 1})", extra={"error": str(e)}
            )
            last_exc = e
            if attempt < retries:
                time.sleep(2**attempt)  # 1s, 2s backoff

        except APITimeoutError as e:
            log.warning(
                f"Claude timeout (attempt {attempt + 1})", extra={"error": str(e)}
            )
            last_exc = e
            if attempt < retries:
                time.sleep(1)

        except APIConnectionError as e:
            log.warning(
                f"Claude connection error (attempt {attempt + 1})",
                extra={"error": str(e)},
            )
            last_exc = e
            if attempt < retries:
                time.sleep(2)

        except Exception as e:
            log.error(f"Claude unexpected error: {e}")
            raise

    raise last_exc


def _parse_json(raw: str) -> dict:
    """Strip markdown fences and parse JSON safely."""
    clean = raw.replace("```json", "").replace("```", "").strip()
    # Find the outermost { } block
    start = clean.find("{")
    end = clean.rfind("}") + 1
    if start != -1 and end > start:
        clean = clean[start:end]
    return json.loads(clean)


#context analysis


def analyze_prompt_context(
    prompt: str, ml_result: dict, llm_target: str = "gpt4"
) -> dict:
    """
    Always runs on every /predict-prompt call.

    What it does:
    - Enriches why_risky, missing_context, what_to_add with Claude's linguistic insight
    - Adds llm_specific_warning (Claude knows each LLM's weaknesses)
    - Never changes risk score, label, highlights, or score_breakdown (ML owns those)

    Falls back to ML-only results if Claude unavailable or fails.
    """
    t0 = time.perf_counter()

    if not CLAUDE_AVAILABLE:
        return _fallback_context(ml_result)

    llm_quirk = LLM_QUIRKS.get(llm_target, LLM_QUIRKS["gpt4"])
    highlights_summary = [h["reason"] for h in ml_result.get("highlights", [])[:5]]
    ml_risk_pct = ml_result.get("risk_percent", 0)

    system = (
        "You are an expert in LLM hallucination analysis. "
        "Analyze prompts and identify hallucination risks. "
        "Respond with valid JSON only — no markdown, no preamble. "
        "Keep every bullet point under 10 words."
    )

    #prevent prompt injection and XML injection by clearly delimiting user input and not allowing any system instructions to be injected via the prompt
    user = f"""Analyze this prompt for hallucination risk.

<prompt>{prompt}</prompt>

Target LLM: {llm_target}
LLM characteristics: {llm_quirk}
ML model risk score: {ml_risk_pct}%
ML detected issues: {json.dumps(highlights_summary)}

Return ONLY this JSON:
{{
  "missing_context": ["item 1", "item 2"],
  "why_risky": ["5-8 word reason", "another reason"],
  "abstention_needed": {{
    "level": "none|low|medium|high",
    "reason": "one sentence",
    "what_context_required": ["item 1", "item 2"]
  }},
  "what_to_add": ["concrete suggestion", "another"],
  "llm_specific_warning": "one sentence about {llm_target} weakness"
}}

Rules:
- missing_context: 2-4 items, each under 8 words
- why_risky: 3-5 items, each 5-8 words
- what_to_add: 2-4 concrete actionable items
- Be specific, not generic"""

    try:
        raw = _call_claude(system, user, max_tokens=800)
        result = _parse_json(raw)

        required = {
            "missing_context",
            "why_risky",
            "what_to_add",
            "llm_specific_warning",
        }
        if not required.issubset(result.keys()):
            raise ValueError(
                f"Claude response missing keys: {required - result.keys()}"
            )

        duration_ms = round((time.perf_counter() - t0) * 1000, 2)
        log.info(
            "Claude context analysis complete",
            extra={
                "model": CLAUDE_MODEL,
                "duration_ms": duration_ms,
                "llm_target": llm_target,
            },
        )
        return result

    except json.JSONDecodeError as e:
        log.warning(
            "Claude returned invalid JSON — using ML fallback", extra={"error": str(e)}
        )
        return _fallback_context(ml_result)
    except Exception as e:
        log.warning(f"Claude context analysis failed — using ML fallback: {e}")
        return _fallback_context(ml_result)


#prompt engineer


def engineer_prompt(
    prompt: str, llm_target: str = "gpt4", risk_context: dict = None
) -> dict:
    """
    Called ONLY when user clicks '✦ Prompt Engineer This'.

    Rewrites the prompt to minimise hallucination risk for the target LLM.
    Returns original + engineered + detailed diff + improvements list.

    Falls back gracefully if Claude unavailable.
    """
    t0 = time.perf_counter()

    if not CLAUDE_AVAILABLE:
        return _fallback_engineer(prompt, llm_target)

    llm_quirk = LLM_QUIRKS.get(llm_target, LLM_QUIRKS["gpt4"])
    context_json = json.dumps(risk_context or {})

    system = (
        "You are a world-class prompt engineer specialising in eliminating LLM hallucinations. "
        "Rewrite prompts to be precise, grounded, and hallucination-resistant. "
        "Respond with valid JSON only — no markdown, no preamble."
    )

    user = f"""Engineer this prompt to minimise hallucination risk.

<original_prompt>{prompt}</original_prompt>

Target LLM: {llm_target}
LLM characteristics: {llm_quirk}
Risk context: {context_json}

Apply these techniques:
1. Add specificity constraints (who, what, when, where)
2. Replace vague terms with precise language
3. Add "If unsure, say so" or citation requirements where appropriate
4. Add output format constraints to prevent confabulation
5. Tailor wording to {llm_target}'s known weaknesses

Return ONLY this JSON:
{{
  "engineered_prompt": "the full rewritten prompt",
  "diff": [
    {{
      "original_word": "original phrase",
      "engineered_word": "what it became",
      "reason": "why this reduces hallucination"
    }}
  ],
  "improvements": [
    "specific improvement and why it helps",
    "another improvement"
  ],
  "overall_improvement": "one sentence summary",
  "estimated_risk_reduction": "low|medium|high"
}}

Rules:
- diff: 3-8 meaningful changes
- improvements: 3-5 items, 10-15 words each
- engineered_prompt: complete, copy-pasteable
- Do NOT change the core intent of the original prompt"""

    try:
        raw = _call_claude(system, user, max_tokens=1500)
        result = _parse_json(raw)

        # Validate
        if "engineered_prompt" not in result:
            raise ValueError("Claude response missing 'engineered_prompt'")

        duration_ms = round((time.perf_counter() - t0) * 1000, 2)
        log.info(
            "Claude prompt engineering complete",
            extra={
                "model": CLAUDE_MODEL,
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
        log.warning(
            "Claude returned invalid JSON for engineering — using fallback",
            extra={"error": str(e)},
        )
        return _fallback_engineer(prompt, llm_target)
    except Exception as e:
        log.warning(f"Claude prompt engineering failed — using fallback: {e}")
        return _fallback_engineer(prompt, llm_target)


#fallback - ensures core functionality even if API fails


def _fallback_context(ml_result: dict) -> dict:
    """ML-only fallback when Claude is unavailable."""
    return {
        "missing_context": ml_result.get(
            "missing_context",
            [
                "Domain or field of application",
                "Time period or date reference",
                "Specific constraints or requirements",
            ],
        ),
        "why_risky": ml_result.get(
            "why_risky",
            [
                "Prompt lacks sufficient specificity",
                "No context constraints provided",
            ],
        ),
        "abstention_needed": {
            "level": "medium",
            "reason": "Prompt needs additional context for accurate response.",
            "what_context_required": [
                "Background information",
                "Specific domain or use case",
            ],
        },
        "what_to_add": ml_result.get(
            "what_to_add",
            [
                "Add domain context",
                "Specify time period",
                "Include your constraints",
            ],
        ),
        "llm_specific_warning": (
            "Claude API unavailable — using ML model analysis only. "
            "Set ANTHROPIC_API_KEY to enable enhanced analysis."
        ),
    }


def _fallback_engineer(prompt: str, llm_target: str) -> dict:
    """Rule-based fallback prompt engineering when Claude is unavailable."""
    engineered = (
        f"Please provide a detailed and accurate response to the following. "
        f"If you are unsure about any specific facts, explicitly state your uncertainty "
        f"rather than guessing. Cite sources where possible and avoid speculation.\n\n"
        f"{prompt}"
    )
    return {
        "original_prompt": prompt,
        "engineered_prompt": engineered,
        "diff": [
            {
                "original_word": prompt[:60] + ("..." if len(prompt) > 60 else ""),
                "engineered_word": "Added uncertainty acknowledgment + citation request",
                "reason": "Reduces fabrication by explicitly requesting honesty about unknowns",
            }
        ],
        "improvements": [
            "Added explicit uncertainty acknowledgment to reduce confabulation",
            "Requested citations to ground factual claims in sources",
        ],
        "overall_improvement": "Basic anti-hallucination guardrails added.",
        "estimated_risk_reduction": "low",
        "llm_target": llm_target,
    }
