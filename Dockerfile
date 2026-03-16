# Use a slightly more compatible base if alpine fails on native modules
FROM node:20-slim AS frontend-build
WORKDIR /app/frontend

# Copy dependency files
COPY frontend/package*.json ./

# Install with legacy-peer-deps to bypass the ERESOLVE error
RUN if [ -f package-lock.json ]; then \
        npm ci --legacy-peer-deps; \
    else \
        npm install --legacy-peer-deps; \
    fi

# Copy the rest of the frontend source
COPY frontend/ ./
RUN npm run build

FROM python:3.11-slim AS runtime
WORKDIR /app
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

# Install Python dependencies
COPY backend/requirements.txt /app/backend/requirements.txt
RUN pip install --no-cache-dir -r /app/backend/requirements.txt

COPY backend/ /app/backend/

# Ensure the source and destination paths match your framework's output (e.g., /dist or /build)
COPY --from=frontend-build /app/frontend/build /app/frontend/build

EXPOSE 8000
CMD ["uvicorn", "backend.server:app", "--host", "0.0.0.0", "--port", "8000"]
