# Install instructions

1. Download Docker
2. Clone this repository
3. Create .env file in repository root (example below):
```
ENV=development

# Postgres
POSTGRES_USER=myuser
POSTGRES_PASSWORD=mypassword
POSTGRES_DB=mydb
POSTGRES_HOST=postgres
POSTGRES_PORT=5432

DATABASE_URL=postgres://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:${POSTGRES_PORT}/${POSTGRES_DB}

# Backend
SECRET_KEY=replace-with-more-secure-key
BACKEND_PORT=8000

# Frontend
NODE_ENV=development
CI=true
FRONTEND_PORT=5173
VITE_API_URL=http://localhost:${BACKEND_PORT}/api

```
5. Run `docker compose build` (in repository root)
6. Run `docker compose up` (in repository root)
7. Now you can access the app with browser in localhost:5173 (change port to whatever you set FRONTEND_PORT as in .env file)
