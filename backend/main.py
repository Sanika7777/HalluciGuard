"""
main.py — FastAPI Application (Production Ready)
"""

import os
import time
from contextlib import asynccontextmanager

from fastapi import FastAPI, Depends, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from auth import verify_api_key
from logger import LoggingMiddleware, log, log_prediction_event, log_error
from models import ModelStore, predict_prompt_risk, predict_response_hallucination
from claude_api import (
    analyze_prompt_context,
    engineer_prompt,
    CLAUDE_AVAILABLE as claude_ok,
)
from schemas import (
    PromptRiskRequest,
    PromptRiskResponse,
    ResponseHallucinationRequest,
    ResponseHallucinationResponse,
    EngineerPromptRequest,
    EngineerPromptResponse,
    ErrorResponse,
    HealthResponse,
    WordHighlight,
    ScoreBreakdown,
    HallucinationType,
    AbstentionLevel,
    PromptDiff,
)

from prometheus_fastapi_instrumentator import Instrumentator

# ── Environment config ─────────────────────────────────────────

_raw_origins = os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173",
)
ALLOWED_ORIGINS = [o.strip() for o in _raw_origins.split(",") if o.strip()]

MAX_REQUEST_SIZE = int(os.getenv("MAX_REQUEST_SIZE", str(10 * 1024 * 1024)))

limiter = Limiter(key_func=get_remote_address)

# ── Lifespan ───────────────────────────────────────────────────


@asynccontextmanager
async def lifespan(app: FastAPI):
    log.info("Starting HalluciGuard API...")
    try:
        ModelStore.load()
        log.info("ML models loaded successfully.")
    except Exception as e:
        log_error("startup", e)
        raise
    log.info(f"Claude API: {'enabled' if claude_ok else 'disabled'}")
    log.info(f"Allowed origins: {ALLOWED_ORIGINS}")
    yield
    log.info("API shutting down.")


# ── App init ───────────────────────────────────────────────────

app = FastAPI(
    title="HalluciGuard API",
    description="ML-powered hallucination risk analysis",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs" if os.getenv("ENABLE_DOCS", "true").lower() == "true" else None,
    redoc_url=None,
)

# ✅ PROMETHEUS FIX HERE
Instrumentator().instrument(app).expose(app, endpoint="/metrics")

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# ── Middleware ─────────────────────────────────────────────────

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type", "X-API-Key"],
)

app.add_middleware(LoggingMiddleware)


@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    return response


@app.middleware("http")
async def limit_request_size(request: Request, call_next):
    content_length = request.headers.get("content-length")
    if content_length and int(content_length) > MAX_REQUEST_SIZE:
        return JSONResponse(status_code=413, content={"error": "Too large"})
    return await call_next(request)


# ── Exception handlers ─────────────────────────────────────────


@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content=ErrorResponse(
            error=exc.detail, status_code=exc.status_code
        ).model_dump(),
    )


@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    log_error("unhandled", exc)
    return JSONResponse(
        status_code=500,
        content=ErrorResponse(
            error="Internal server error", status_code=500
        ).model_dump(),
    )


# ── Routes ─────────────────────────────────────────────────────


@app.get("/health", response_model=HealthResponse)
async def health_check():
    return HealthResponse(
        status="ok",
        models_loaded=ModelStore.loaded,
        version="1.0.0",
        claude_api=claude_ok,
    )


@app.post("/predict-prompt", response_model=PromptRiskResponse)
@limiter.limit("30/minute")
async def predict_prompt(
    request: Request,
    body: PromptRiskRequest,
    api_key: str = Depends(verify_api_key),
):
    if not ModelStore.loaded:
        raise HTTPException(status_code=503, detail="Models not loaded")

    try:
        result = predict_prompt_risk(body.prompt, body.llm_target.value)

        try:
            claude = analyze_prompt_context(
                body.prompt, result, body.llm_target.value
            )
            result.update(claude)
        except Exception:
            pass

        return PromptRiskResponse(
            label=result["label"],
            confidence=result["confidence"],
            risk_percent=result["risk_percent"],
            score_breakdown=ScoreBreakdown(**result["score_breakdown"]),
            highlights=[WordHighlight(**h) for h in result["highlights"]],
            abstention_level=AbstentionLevel(result["abstention_level"]),
            missing_context=result["missing_context"],
            why_risky=result["why_risky"],
            what_to_add=result["what_to_add"],
            llm_target=result["llm_target"],
        )

    except Exception as e:
        log_error("predict", e)
        raise HTTPException(status_code=500, detail="Prediction failed")


# ── Entry ──────────────────────────────────────────────────────

if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000)