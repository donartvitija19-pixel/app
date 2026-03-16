# Avalant App (Single-Service Coolify Deployment)

This repository is configured to run as **one deployable service** in Coolify:
- FastAPI backend (`/api/*`)
- React frontend built into static files and served by FastAPI

## Deploy on Coolify (single service)

1. Create a new application from this repository.
2. Set build pack to **Dockerfile** (root `Dockerfile`).
3. Expose port **8000**.
4. Configure environment variables:
   - `MONGO_URL`
   - `DB_NAME`
   - `JWT_SECRET_KEY`
   - Optional CORS overrides:
     - `CORS_ORIGINS` (comma-separated)
     - `CORS_ORIGIN_REGEX` (defaults to `https?://.*\.sslip\.io(:\d+)?`)

## Local build/run

```bash
docker build -t avalant-app .
docker run --rm -p 8000:8000 \
  -e MONGO_URL='mongodb://...' \
  -e DB_NAME='avalant' \
  -e JWT_SECRET_KEY='change-me' \
  avalant-app
```

Then open `http://localhost:8000`.

## Development (split mode)

If needed, you can still run frontend and backend separately during development.
### Note about npm lockfile

The Docker build supports repositories with or without `frontend/package-lock.json`:
- if lockfile exists, it uses `npm ci`;
- otherwise it falls back to `npm install`.

