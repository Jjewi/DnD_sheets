# D&D Character Sheet Manager

Async REST API with a web interface for creating and managing Dungeons & Dragons character sheets.

## Tech Stack

- **FastAPI** — async web framework
- **PostgreSQL** — database
- **SQLAlchemy** (async) — ORM
- **Alembic** — database migrations
- **JWT** — authentication (python-jose + bcrypt)
- **Docker / docker-compose** — containerization

## Features

- User registration and login with JWT authentication
- Create, read, update and delete character sheets
- Each user sees only their own characters
- Interactive API docs at `/docs` (Swagger UI)
- Simple web interface served from `/`

## Getting Started

### Prerequisites

- Docker
- docker-compose

### Run locally

```bash
git clone https://github.com/Jjewi/DnD_sheets.git
cd DnD_sheets
cp .env.example .env    # fill in your values
docker-compose up --build
```

App will be available at `http://localhost:8000`
API docs at `http://localhost:8000/docs`

## Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `SECRET_KEY` | JWT secret key |
| `ALGORITHM` | JWT algorithm (e.g. HS256) |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Token lifetime |

## API Overview

All `/characters` endpoints require `Authorization: Bearer <token>` header.

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/users/register` | — | Register new user |
| POST | `/users/login` | — | Get JWT token |
| GET | `/users/me` | ✓ | Get current user info |
| GET | `/characters/` | ✓ | List your characters |
| POST | `/characters/` | ✓ | Create character |
| GET | `/characters/{id}` | ✓ | Get character by ID |
| PUT | `/characters/{id}` | ✓ | Update character |
| DELETE | `/characters/{id}` | ✓ | Delete character |

## Project Structure

```
app/
├── routers/       # users, characters endpoints
├── utils/         # auth helpers
├── models.py      # SQLAlchemy models
├── schemas.py     # Pydantic schemas
├── crud.py        # database operations
alembic/           # migrations
static/            # frontend (HTML/CSS/JS)
