# https://hub.docker.com/_/python
FROM python:3.13.3-slim-bookworm AS base

# Bump this to force an update of the apt repositories
ENV MIN_UPDATE_DATE="2025-05-08"

ENV PYTHONUNBUFFERED=1

WORKDIR /app/data

RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# ---- Poetry package manager ----
FROM base AS poetry

ENV POETRY_NO_INTERACTION=1
ENV POETRY_VIRTUALENVS_CREATE=0
ENV POETRY_VIRTUALENVS_OPTIONS_NO_PIP=1
ENV POETRY_VERSION=2.1.3

RUN python -m pip install poetry==${POETRY_VERSION}

# ---- Base image with dependencies installed ----
FROM poetry AS base-with-deps

COPY pyproject.toml poetry.lock ./

# Create a runtime virtual environment and activate it
RUN python -m venv /venv
ENV PATH="/venv/bin:$PATH"
ENV VIRTUAL_ENV=/venv
ENV VIRTUAL_ENV_PROMPT=venv

# Install dependencies in this new virtual environment
RUN poetry install --compile

# ---- Base image with dependencies installed for development ----
FROM base-with-deps AS runtime-dev

RUN poetry install --compile --extras dev

# ---- Runtime production image ----
FROM debian:bookworm-slim AS runtime-prod

# In a production build, we use a base debian image with the runtime venv only.
COPY --from=base-with-deps /venv /venv

ENV PATH="/venv/bin:$PATH"
ENV VIRTUAL_ENV=/venv
ENV VIRTUAL_ENV_PROMPT=venv
