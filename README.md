# ERP Monorepo Architecture

A containerized monorepo scaffolding for an Enterprise Resource Planning (ERP) platform with an Express.js backend, React (Vite) frontend, and PostgreSQL 15 database.

---

## Directory Structure

```text
.
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js            # PostgreSQL connection pool & health testing
│   │   ├── routes/
│   │   │   ├── health.routes.js # GET /health -> {"status": "ok"}
│   │   │   └── index.js         # Modular router aggregator
│   │   ├── app.js               # Express application setup & middleware
│   │   └── server.js            # Server entrypoint
│   ├── .dockerignore
│   ├── .env.example
│   ├── Dockerfile               # Node 20 runtime image
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── App.jsx              # React status dashboard & health tester
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.jsx
│   ├── index.html
│   ├── nginx.conf               # Nginx reverse proxy (/health, /api) & SPA router
│   ├── vite.config.js           # Vite dev config with proxy
│   ├── .dockerignore
│   ├── .env.example
│   ├── Dockerfile               # Multi-stage build (Node 20 builder -> Nginx)
│   └── package.json
├── .dockerignore
├── .env.example
├── .gitignore
├── docker-compose.yml           # Multi-container orchestration
└── README.md
```

---

## Services & Ports

| Service | Technology | Internal Port | Exposed Host Port | Container Name |
| :--- | :--- | :--- | :--- | :--- |
| **db** | PostgreSQL 15 Alpine | `5432` | `5432:5432` | `db` |
| **backend** | Express.js (Node 20) | `3000` | `3000:3000` | `backend` |
| **frontend** | React + Vite (Nginx) | `80` | `80:80` | `frontend` |

---

## Getting Started

### 1. Run with Docker Compose

To start all services in the background:

```bash
docker compose up -d --build
```

To view logs across all services:

```bash
docker compose logs -f
```

To stop all services:

```bash
docker compose down
```

### 2. Available Endpoints

- **Frontend Application:** [http://localhost](http://localhost) (Port 80)
- **Backend API Direct:** [http://localhost:3000](http://localhost:3000)
- **Backend Health Check:** [http://localhost:3000/health](http://localhost:3000/health) or via frontend proxy at [http://localhost/health](http://localhost/health)
- **PostgreSQL Database:** `localhost:5432` (User: `postgres`, Password: `postgres`, DB: `erp_db`)

---

## Networking & Inter-service Communication

- All services are connected to the custom Docker Compose bridge network `erp-network`.
- **Backend to Database:** Connected via hostname `db:5432` using environment variables.
- **Frontend to Backend:** Served via Nginx on port 80, which reverse proxies `/health` and `/api/` traffic to `http://backend:3000` inside the container network.
