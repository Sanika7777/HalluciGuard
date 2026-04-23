#Expt covered: 2 (endpoints) + 3 (logging/errors) + 4 (auth) + rate limiting

import os
import time
from contextlib import asynccontextmanager

from fastapi import FastAPI, Depends, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from prometheus_fastapi_instrumentator import Instrumentator
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address

from auth import verify_api_key
from claude_api import CLAUDE_AVAILABLE as claude_ok
from claude_api import analyze_prompt_context, engineer_prompt
from logger import LoggingMiddleware, log, log_error, log_prediction_event
from models import ModelStore, predict_prompt_risk, predict_response_hallucination
from schemas import (
    AbstentionLevel,
    EngineerPromptRequest,
    EngineerPromptResponse,
    ErrorResponse,
    HallucinationType,
    HealthResponse,
    PromptDiff,
    PromptRiskRequest,
    PromptRiskResponse,
    ResponseHallucinationRequest,
    ResponseHallucinationResponse,
    ScoreBreakdown,
    WordHighlight,
)

#Environment config

_raw_origins = os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173"
)
ALLOWED_ORIGINS = [o.strip() for o in _raw_origins.split(",") if o.strip()]

MAX_REQUEST_SIZE = int(os.getenv("MAX_REQUEST_SIZE", str(10 * 1024 * 1024)))

#Rate limiter

limiter = Limiter(key_func=get_remote_address)


#Lifespan

@asynccontextmanager
async def lifespan(app: FastAPI):
    log.info("Starting HalluciGuard API...")
    try:
        ModelStore.load()
        log.info("ML models loaded successfully.")
    except Exception as e:
        log_error("startup", e)
        raise
    log.info(f"Claude API: {'enabled' if claude_ok else 'disabled (no key)'}")
    log.info(f"Allowed origins: {ALLOWED_ORIGINS}")
    yield
    log.info("API shutting down.")


#App init

app = FastAPI(
    title="HalluciGuard API",
    description="ML-powered hallucination risk analysis with Claude prompt engineering.",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs" if os.getenv("ENABLE_DOCS", "true").lower() == "true" else None,
    redoc_url=None,
)

Instrumentator().instrument(app).expose(app, endpoint="/metrics")

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

#CORS middleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type", "X-API-Key"],
)

app.add_middleware(LoggingMiddleware)


#security headers middleware

@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    """Add security headers to every response."""
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()"
    if os.getenv("PRODUCTION", "false").lower() == "true":
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    return response


#request size limiter middleware

@app.middleware("http")
async def limit_request_size(request: Request, call_next):
    """Reject requests with body larger than MAX_REQUEST_SIZE."""
    content_length = request.headers.get("content-length")
    if content_length and int(content_length) > MAX_REQUEST_SIZE:
        return JSONResponse(
            status_code=413,
            content={"error": "Request body too large.", "status_code": 413}
        )
    return await call_next(request)


#exception handling

@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    log.warning("HTTP exception", extra={
        "path": request.url.path,
        "status_code": exc.status_code,
        "detail": exc.detail,
    })
    return JSONResponse(
        status_code=exc.status_code,
        content=ErrorResponse(
            error=exc.detail,
            status_code=exc.status_code
        ).model_dump()
    )


@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    log_error("unhandled_exception", exc, {"path": request.url.path})
    return JSONResponse(
        status_code=500,
        content=ErrorResponse(
            error="Internal server error. Please try again.",
            status_code=500
        ).model_dump()
    )


#main logic**

def _merge_claude_into_result(result: dict, claude: dict) -> dict:
    """
    Merge Claude's enrichment into ML result.

    Rules:
    - ML ALWAYS owns: risk score, label, confidence, highlights, score_breakdown, abstention_level
    - Claude ENRICHES: why_risky, missing_context, what_to_add (only if non-empty)
    - Claude EXCLUSIVELY provides: llm_specific_warning, abstention_reason
    - If Claude returns empty/invalid lists, keep ML defaults — never blank out ML results
    """
    def _is_valid_list(val) -> bool:
        return isinstance(val, list) and len(val) > 0

    if _is_valid_list(claude.get("why_risky")):
        result["why_risky"] = claude["why_risky"]

    if _is_valid_list(claude.get("missing_context")):
        result["missing_context"] = claude["missing_context"]

    if _is_valid_list(claude.get("what_to_add")):
        result["what_to_add"] = claude["what_to_add"]

    abstention = claude.get("abstention_needed", {})
    if isinstance(abstention, dict) and abstention.get("reason"):
        result["abstention_reason"] = abstention["reason"]

    result["llm_specific_warning"] = claude.get("llm_specific_warning", "")

    return result


#routing

@app.get("/health", response_model=HealthResponse, tags=["System"])
async def health_check():
    """Public health check — no auth required. Used by Docker and monitoring."""
    return HealthResponse(
        status="ok",
        models_loaded=ModelStore.loaded,
        version="1.0.0",
        claude_api=claude_ok,
    )


@app.post(
    "/predict-prompt",
    response_model=PromptRiskResponse,
    tags=["Prediction"],
    summary="Analyze a prompt for hallucination risk",
)
@limiter.limit("30/minute")
async def predict_prompt(
    request: Request,
    body: PromptRiskRequest,
    api_key: str = Depends(verify_api_key),
):
    """
    ML model analyzes prompt and returns:
    - Risk label + confidence score
    - Word-level highlights with reasons (hover tooltips)
    - Score breakdown: ambiguity, specificity, context gap
    - Abstention level (self_contained -> unanswerable)
    - Claude-enriched: why risky, missing context, what to add, LLM warning
    """
    t0 = time.perf_counter()

    if not ModelStore.loaded:
        raise HTTPException(status_code=503, detail="ML models not loaded. Try again in a moment.")

    try:
        result = predict_prompt_risk(body.prompt, body.llm_target.value)

        try:
            claude_analysis = analyze_prompt_context(body.prompt, result, body.llm_target.value)
            result = _merge_claude_into_result(result, claude_analysis)
        except Exception as e:
            log_error("claude_enrichment", e)
            result["llm_specific_warning"] = ""

        response = PromptRiskResponse(
            label=result["label"],
            confidence=result["confidence"],
            risk_percent=result["risk_percent"],
            score_breakdown=ScoreBreakdown(**result["score_breakdown"]),
            highlights=[WordHighlight(**h) for h in result["highlights"]],
            abstention_level=AbstentionLevel(result.get("abstention_level", "none")),
            abstention_reasons=result.get("abstention_reasons", []),
            missing_context=result.get("missing_context", []),
            why_risky=result.get("why_risky", []),
            what_to_add=result.get("what_to_add", []),
            llm_target=result["llm_target"],
            llm_specific_warning=result.get("llm_specific_warning", ""),
        )

        duration_ms = round((time.perf_counter() - t0) * 1000, 2)
        log_prediction_event(
            endpoint="/predict-prompt",
            input_data={"prompt": body.prompt[:100], "llm_target": body.llm_target.value},
            result={"label": result["label"], "risk_percent": result["risk_percent"]},
            duration_ms=duration_ms,
        )
        return response

    except HTTPException:
        raise
    except Exception as e:
        log_error("/predict-prompt", e)
        raise HTTPException(status_code=500, detail="Prediction failed. Please try again.")


@app.post(
    "/predict-response",
    response_model=ResponseHallucinationResponse,
    tags=["Prediction"],
    summary="Detect hallucination in an LLM response",
)
@limiter.limit("30/minute")
async def predict_response(
    request: Request,
    body: ResponseHallucinationRequest,
    api_key: str = Depends(verify_api_key),
):
    """
    ML model analyzes a prompt+response pair and returns:
    - Hallucinated boolean + confidence
    - Model-predicted hallucination type (not hardcoded)
    - Word-level highlights in the response
    - Explanation bullets
    """
    t0 = time.perf_counter()

    if not ModelStore.loaded:
        raise HTTPException(status_code=503, detail="ML models not loaded.")

    try:
        result = predict_response_hallucination(body.prompt, body.response)

        response = ResponseHallucinationResponse(
            hallucinated=result["hallucinated"],
            confidence=result["confidence"],
            risk_percent=result["risk_percent"],
            hallucination_type=(
                HallucinationType(**result["hallucination_type"])
                if result["hallucination_type"] else None
            ),
            explanation=result["explanation"],
            highlights=[WordHighlight(**h) for h in result["highlights"]],
        )

        duration_ms = round((time.perf_counter() - t0) * 1000, 2)
        log_prediction_event(
            endpoint="/predict-response",
            input_data={"prompt": body.prompt[:80], "response": body.response[:80]},
            result={"hallucinated": result["hallucinated"], "confidence": result["confidence"]},
            duration_ms=duration_ms,
        )
        return response

    except HTTPException:
        raise
    except Exception as e:
        log_error("/predict-response", e)
        raise HTTPException(status_code=500, detail="Prediction failed. Please try again.")


@app.post(
    "/engineer-prompt",
    response_model=EngineerPromptResponse,
    tags=["Prompt Engineering"],
    summary="Rewrite a prompt to reduce hallucination risk (on-demand)",
)
@limiter.limit("10/minute")
async def engineer_prompt_endpoint(
    request: Request,
    body: EngineerPromptRequest,
    api_key: str = Depends(verify_api_key),
):
    """
    Called ONLY when user explicitly clicks 'Prompt Engineer This'.
    Uses Claude API to rewrite the prompt with detailed diff of changes.
    Falls back to rule-based rewrite if Claude API is unavailable.
    """
    t0 = time.perf_counter()

    try:
        result = engineer_prompt(
            prompt=body.prompt,
            llm_target=body.llm_target.value,
            risk_context=body.risk_context,
        )

        diff_items = []
        for d in result.get("diff", []):
            diff_items.append(PromptDiff(
                original_word=d.get("original_word") or d.get("original", ""),
                engineered_word=d.get("engineered_word") or d.get("engineered", ""),
                reason=d.get("reason", ""),
            ))

        response = EngineerPromptResponse(
            original_prompt=result["original_prompt"],
            engineered_prompt=result["engineered_prompt"],
            diff=diff_items,
            improvements=result.get("improvements", []),
            llm_target=result["llm_target"],
        )

        duration_ms = round((time.perf_counter() - t0) * 1000, 2)
        log_prediction_event(
            endpoint="/engineer-prompt",
            input_data={"prompt": body.prompt[:100], "llm_target": body.llm_target.value},
            result={"engineered": result["engineered_prompt"][:100]},
            duration_ms=duration_ms,
        )
        return response

    except HTTPException:
        raise
    except Exception as e:
        log_error("/engineer-prompt", e)
        raise HTTPException(status_code=500, detail="Prompt engineering failed. Please try again.")


#entry point for docker

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=int(os.getenv("PORT", "8000")),
        reload=os.getenv("RELOAD", "false").lower() == "true",
        workers=int(os.getenv("WORKERS", "1")),
    )
