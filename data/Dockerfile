# https://hub.docker.com/_/python
FROM python:3.13.3-slim-bookworm AS base

# Bump this to force an update of the apt repositories
ENV MIN_UPDATE_DATE="2025-06-18"

ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1

WORKDIR /app/data

RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    git \
    && rm -rf /var/lib/apt/lists/*

# ---- uv package manager ----
FROM base AS uv

# Pin uv by digest for supply-chain security.
# Verify with: gh attestation verify --owner astral-sh oci://ghcr.io/astral-sh/uv:latest
COPY --from=ghcr.io/astral-sh/uv@sha256:ff07b86af50d4d9391d9daf4ff89ce427bc544f9aae87057e69a1cc0aa369946 /uv /uvx /bin/

# Use the interpreter from the base image rather than a uv-managed one, and
# install the project venv at a stable path.
ENV UV_PYTHON_PREFERENCE=only-system
ENV UV_PROJECT_ENVIRONMENT=/venv
ENV UV_COMPILE_BYTECODE=1
ENV UV_LINK_MODE=copy

# ---- Base image with production dependencies installed ----
FROM uv AS base-with-deps

COPY pyproject.toml uv.lock ./

RUN --mount=type=cache,target=/root/.cache/uv uv sync --frozen --no-dev

ENV PATH="/venv/bin:$PATH"
ENV VIRTUAL_ENV=/venv

# ---- Base image with dev dependencies installed for development ----
FROM base-with-deps AS runtime-dev

RUN --mount=type=cache,target=/root/.cache/uv uv sync --frozen --all-extras

# ---- Runtime production image ----
FROM base AS runtime-prod

# In a production build, we use the base image with the runtime venv only.
COPY --from=base-with-deps /venv /venv

ENV PATH="/venv/bin:$PATH"
ENV VIRTUAL_ENV=/venv
