Dockerfile
# syntax=docker/dockerfile:1

# Phase 1: Build the frontend
FROM node:20-slim AS frontend-build
WORKDIR /app/frontend

# Copy dependency files first for better caching
COPY frontend/package*.json ./

# The --legacy-peer-deps flag is crucial here to ignore the date-fns version mismatch
RUN if [ -f package-lock.json ]; then \
      npm ci --legacy-peer-deps; \
    else \
      npm install --legacy-peer-deps; \
    fi

# Copy source and build
COPY frontend/ ./
RUN npm run build

# Phase 2: Python Runtime
FROM python:3.11-slim AS runtime
WORKDIR /app

# Prevent Python from writing .pyc files and enable unbuffered logging
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

# Install backend dependencies
COPY backend/requirements.txt /app/backend/requirements.txt
RUN pip install --no-cache-dir -r /app/backend/requirements.txt

# Copy backend source
COPY backend/ /app/backend/

# Copy the static build files from the frontend stage
# NOTE: Verify if your frontend build folder is named 'build' or 'dist'
COPY --from=frontend-build /app/frontend/build /app/frontend/build

EXPOSE 8000

# Start the application
CMD ["uvicorn", "backend.server:app", "--host", "0.0.0.0", "--port", "8000"]
