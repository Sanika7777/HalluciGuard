"""
logger.py — Structured JSON Logging (Production Ready)

Features:
- Every log line is a JSON object (CloudWatch/ELK compatible)
- Request ID on every request (X-Request-ID header)
- PII scrubbing — API keys never logged in full
- Request body truncation — no giant payloads in logs
- Timing on every request
- Prediction event logging for ML observability
- Error logging with full traceback
"""

import json
import logging
import sys
import time
import traceback
import uuid
import re
from typing import Optional
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

# ── JSON Formatter ─────────────────────────────────────────────

class JSONFormatter(logging.Formatter):
    """Formats every log record as a single JSON line."""

    # Fields to scrub from logs (regex patterns)
    SCRUB_PATTERNS = [
        (re.compile(r'"X-API-Key":\s*"[^"]{6}([^"]*)"'), r'"X-API-Key": "***"'),
        (re.compile(r'"api_key":\s*"[^"]{6}([^"]*)"'),   r'"api_key": "***"'),
        (re.compile(r'sk-[a-zA-Z0-9]{20,}'),              'sk-***'),
    ]

    def format(self, record: logging.LogRecord) -> str:
        payload: dict = {
            "timestamp": self.formatTime(record, "%Y-%m-%dT%H:%M:%S.%f+00:00"),
            "level":     record.levelname,
            "logger":    record.name,
            "message":   record.getMessage(),
        }

        # Add any extra fields attached to the record
        skip = {
            "message", "msg", "args", "levelname", "levelno", "pathname",
            "filename", "module", "exc_info", "exc_text", "stack_info",
            "lineno", "funcName", "created", "msecs", "relativeCreated",
            "thread", "threadName", "processName", "process", "name",
            "taskName",
        }
        for key, val in record.__dict__.items():
            if key not in skip:
                payload[key] = val

        if record.exc_info:
            payload["traceback"] = self.formatException(record.exc_info)

        raw = json.dumps(payload, default=str)

        # Scrub any sensitive values
        for pattern, replacement in self.SCRUB_PATTERNS:
            raw = pattern.sub(replacement, raw)

        return raw


# ── Logger Setup ───────────────────────────────────────────────

def _setup_logger() -> logging.Logger:
    logger = logging.getLogger("hallucination_detector")
    if logger.handlers:
        return logger   # Already configured

    logger.setLevel(logging.DEBUG)
    fmt = JSONFormatter()

    # Console handler
    console = logging.StreamHandler(sys.stdout)
    console.setFormatter(fmt)
    logger.addHandler(console)

    # File handler
    try:
        file_handler = logging.FileHandler("app.log", encoding="utf-8")
        file_handler.setFormatter(fmt)
        logger.addHandler(file_handler)
    except OSError:
        logger.warning("Could not open app.log for writing — file logging disabled.")

    logger.propagate = False
    return logger


log = _setup_logger()


# ── Request Logging Middleware ─────────────────────────────────

_SAFE_BODY_KEYS = {"prompt", "response", "llm_target", "risk_context"}
_MAX_BODY_LEN   = 500       # chars per field before truncation
_MAX_FIELDS     = 5         # max fields from body to log


def _sanitize_body(body_bytes: bytes) -> dict | str:
    """Parse and sanitize request body for logging."""
    if not body_bytes:
        return ""
    try:
        data = json.loads(body_bytes)
        if not isinstance(data, dict):
            return str(data)[:200]
        safe: dict = {}
        for k, v in list(data.items())[:_MAX_FIELDS]:
            if k in _SAFE_BODY_KEYS:
                str_v = str(v)
                safe[k] = str_v[:_MAX_BODY_LEN] + "…" if len(str_v) > _MAX_BODY_LEN else str_v
        return safe
    except (json.JSONDecodeError, UnicodeDecodeError):
        return body_bytes[:100].decode("utf-8", errors="replace")


class LoggingMiddleware(BaseHTTPMiddleware):
    """Logs every request and response with timing and request ID."""

    async def dispatch(self, request: Request, call_next) -> Response:
        request_id = str(uuid.uuid4())[:8]
        t0 = time.perf_counter()

        # Read body safely (Starlette consumes the stream)
        body_bytes = await request.body()

        log.info(
            "Incoming request",
            extra={
                "request_id": request_id,
                "method":     request.method,
                "path":       request.url.path,
                "query":      str(request.query_params),
                "body":       _sanitize_body(body_bytes),
                "client":     request.client.host if request.client else "unknown",
                "user_agent": request.headers.get("user-agent", "")[:100],
            },
        )

        try:
            response = await call_next(request)
        except Exception as exc:
            duration_ms = round((time.perf_counter() - t0) * 1000, 2)
            log.error(
                f"Unhandled exception in {request.url.path}",
                extra={
                    "request_id": request_id,
                    "duration_ms": duration_ms,
                    "error": str(exc),
                    "traceback": traceback.format_exc(),
                },
            )
            raise

        duration_ms = round((time.perf_counter() - t0) * 1000, 2)

        log.info(
            "Request completed",
            extra={
                "request_id":  request_id,
                "status_code": response.status_code,
                "duration_ms": duration_ms,
                "path":        request.url.path,
            },
        )

        response.headers["X-Request-ID"] = request_id
        return response


# ── Helper Functions ───────────────────────────────────────────

def log_prediction_event(
    endpoint: str,
    input_data: dict,
    result: dict,
    duration_ms: float,
) -> None:
    """Log an ML prediction event with input/output summary."""
    log.info(
        "Prediction complete",
        extra={
            "endpoint":    endpoint,
            "input":       input_data,
            "result":      result,
            "duration_ms": duration_ms,
        },
    )


def log_error(
    context: str,
    exc: Exception,
    extra: Optional[dict] = None,
) -> None:
    """Log an error with full traceback and optional context dict."""
    log.error(
        f"Error in {context}: {exc}",
        extra={
            "context":    context,
            "error_type": type(exc).__name__,
            "traceback":  traceback.format_exc(),
            **(extra or {}),
        },
    )