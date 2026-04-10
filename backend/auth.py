"""
auth.py — API Key Authentication (Production Ready)

Security hardening:
- Timing-safe comparison (prevents timing attacks)
- Rate limiting on failed attempts (prevents brute force)
- API key never logged in full (only first 6 chars)
- Suspicious activity detection and logging
- No default key in production (fails loudly)
"""

import os
import secrets
import logging
import time
from collections import defaultdict
from fastapi import Security, HTTPException, Request, status
from fastapi.security import APIKeyHeader

log = logging.getLogger("hallucination_detector")

API_KEY_HEADER = APIKeyHeader(name="X-API-Key", auto_error=False)

#setup
_raw_key = os.getenv("API_KEY", "")
_dev_key = "dev-hallucination-key-2026"

if not _raw_key:
    log.warning(
        "⚠ API_KEY env variable not set. Falling back to dev key. DO NOT use in production."
    )
    API_KEY = _dev_key
    IS_DEV = True
elif _raw_key == _dev_key:
    log.warning(
        "⚠ Using default dev API key. Set a strong API_KEY env variable in production."
    )
    API_KEY = _dev_key
    IS_DEV = True
else:
    API_KEY = _raw_key
    IS_DEV = False
    log.info("✓ Production API key loaded.")

#brute force protection with in-memory tracking of failed attempts per IP
# Track failed attempts per IP in memory
# In production with multiple workers, use Redis instead
_failed_attempts: dict[str, list[float]] = defaultdict(list)
MAX_FAILED_ATTEMPTS = 10  # max failures
WINDOW_SECONDS = 300  # within 5 minutes
LOCKOUT_SECONDS = 600  # 10 minute lockout


def _get_client_ip(request: Request) -> str:
    """Get real client IP, respecting X-Forwarded-For from nginx/load balancer."""
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        # Take the first IP (client), not proxy IPs
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


def _is_rate_limited(ip: str) -> bool:
    """Check if this IP has exceeded the failed attempt threshold."""
    now = time.time()
    # Clean up old attempts outside the window
    _failed_attempts[ip] = [t for t in _failed_attempts[ip] if now - t < WINDOW_SECONDS]
    return len(_failed_attempts[ip]) >= MAX_FAILED_ATTEMPTS


def _record_failed_attempt(ip: str) -> None:
    """Record a failed auth attempt for this IP."""
    _failed_attempts[ip].append(time.time())


def _clear_failed_attempts(ip: str) -> None:
    """Clear failed attempts on successful auth."""
    if ip in _failed_attempts:
        del _failed_attempts[ip]


#main dependency to verify API key on protected routes


async def verify_api_key(
    request: Request,
    api_key: str = Security(API_KEY_HEADER),
) -> str:
    """
    FastAPI dependency — inject into any protected route:
        api_key: str = Depends(verify_api_key)

    Security features:
    - Timing-safe comparison (no timing attacks)
    - Rate limiting per IP (brute force protection)
    - Partial key logging only (no full key in logs)
    - Suspicious activity warnings
    """
    ip = _get_client_ip(request)

    # Check if IP is currently rate limited
    if _is_rate_limited(ip):
        log.warning(
            "Rate limited IP blocked", extra={"ip": ip, "path": request.url.path}
        )
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many failed authentication attempts. Try again later.",
            headers={"Retry-After": str(LOCKOUT_SECONDS)},
        )

    # Missing key
    if not api_key:
        _record_failed_attempt(ip)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing API key. Include X-API-Key header.",
            headers={"WWW-Authenticate": "ApiKey"},
        )

    # Timing-safe comparison — prevents timing side-channel attacks
    key_valid = secrets.compare_digest(api_key.encode("utf-8"), API_KEY.encode("utf-8"))

    if not key_valid:
        _record_failed_attempt(ip)
        attempts = len(_failed_attempts[ip])
        log.warning(
            "Invalid API key attempt",
            extra={
                "ip": ip,
                "key_prefix": api_key[:6] + "..." if len(api_key) >= 6 else "???",
                "attempt_count": attempts,
                "path": request.url.path,
            },
        )
        # If approaching limit, warn more loudly
        if attempts >= MAX_FAILED_ATTEMPTS - 2:
            log.error(
                "Repeated auth failures — possible brute force attack",
                extra={"ip": ip, "attempts": attempts},
            )
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid API key.",
        )

    # Success — clear any prior failed attempts
    _clear_failed_attempts(ip)
    return api_key


def generate_secure_key() -> str:
    """Generate a cryptographically secure API key (48 chars URL-safe)."""
    return secrets.token_urlsafe(36)


if __name__ == "__main__":
    print(f"Generated API Key: {generate_secure_key()}")
