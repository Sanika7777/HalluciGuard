#Stage 1: Builder
FROM python:3.12-slim AS builder

WORKDIR /app

# Install deps into a separate location for clean copy
COPY requirements.txt .
RUN pip install --upgrade pip && \
    pip install --no-cache-dir --prefix=/install -r requirements.txt

#Stage 2: Runtime
FROM python:3.12-slim AS runtime

WORKDIR /app

# Copy installed packages from builder
COPY --from=builder /install /usr/local

# Copy backend source
COPY backend/ ./backend/

# Copy pkl models (must be trained before building image)
# If pkl/ doesn't exist yet, build will fail with a clear message
COPY backend/pkl/ ./backend/pkl/

WORKDIR /app/backend

# Install curl (needed for healthcheck)
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Non-root user for security
RUN useradd -m -u 1001 appuser && chown -R appuser:appuser /app
USER appuser

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --retries=5 --start-period=30s \
  CMD curl -f http://localhost:8000/health || exit 1

# Start server
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "1"]