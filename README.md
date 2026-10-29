# ERP Student Management System

A full-stack, enterprise-grade Enterprise Resource Planning (ERP) platform for universities and colleges with automated student risk assessments, multi-role dashboards (Admin, Faculty, Student, Parent), attendance tracking, gradebook, admissions, fees/payments, and messaging.

---

## Architecture Overview

```text
               Users & Browsers
                      │
                      ▼
               [ Vercel CDN ]
                      │
           ┌──────────┴──────────┐
           ▼                     ▼
   [ React Frontend ]   [ Express Serverless API ]
     (/index.html)        (/api/*, /health)
                                 │
                                 ▼
                     [ PostgreSQL Database ]
                    (Vercel Postgres / Neon)
```

- **Frontend:** React 18, Vite, Tailwind CSS, Lucide icons, Recharts.
- **Backend:** Express.js modular serverless API running on Vercel Node runtime.
- **Database:** PostgreSQL 15 schema with UUIDs, roles (RBAC), and automated triggers.

---

## Deploying to Vercel (Step-by-Step)

### 1. Import Project to Vercel
1. Go to [vercel.com/new](https://vercel.com/new) and select this repository: **`ERP-Based_student_management_system`**.
2. Keep the default settings:
   - **Root Directory:** `.`
   - **Build Command:** `cd frontend && npm install && npm run build`
   - **Output Directory:** `frontend/dist`
3. Click **Deploy**.

### 2. Connect Database (Free Vercel Postgres / Neon)
1. In your Vercel project dashboard, navigate to the **Storage** tab.
2. Click **Create Database** $\rightarrow$ select **Postgres (powered by Neon)**.
3. Accept the defaults and click **Create & Connect**. Vercel will automatically set the `POSTGRES_URL` environment variable.
4. Click the **Query** / **SQL Editor** tab inside Vercel Storage.
5. Open [`database/init.sql`](database/init.sql), copy the entire SQL script, paste it into the editor, and click **Run**.
6. Trigger a **Redeploy** from the Deployments tab.

Your full-stack ERP is now completely live!

---

## Local Development

### Option 1: Run with Docker Compose
To run all services including Redis, RabbitMQ, and the Python ML service:
```bash
docker compose up -d --build
```
- Frontend: `http://localhost` (or `http://localhost:8080`)
- Backend API: `http://localhost:3000`
- RabbitMQ Console: `http://localhost:15672` (guest / guest)

### Option 2: Run Locally with Node & Vite
```bash
# 1. Run Backend
cd backend
npm install
npm run dev

# 2. Run Frontend
cd ../frontend
npm install
npm run dev
```
Open `http://localhost:5173` to view the hot-reloading dev server.
