# 🏥 MediConnect Elite — System Workflows & Orchestration

This folder contains the complete operational, architectural, and CI/CD workflows for **MediConnect Elite**, covering the **Frontend**, **Backend**, and **Database (Supabase / PostgreSQL)** layers.

---

## 📂 Directory Contents

| File / Folder | Purpose |
| :--- | :--- |
| [frontend-workflow.md](file:///D:/PROJECT_S/MediConnect%20Elite/MediConnect/workflows/frontend-workflow.md) | Component architecture, state management, routing, Socket.IO client, Vite compilation. |
| [backend-workflow.md](file:///D:/PROJECT_S/MediConnect%20Elite/MediConnect/workflows/backend-workflow.md) | Express server lifecycle, middleware pipeline, background cron scheduler, real-time events. |
| [database-workflow.md](file:///D:/PROJECT_S/MediConnect%20Elite/MediConnect/workflows/database-workflow.md) | Supabase/Postgres schema, tables, relationships, indexing, RLS policies, migrations. |
| [system-integration-workflow.md](file:///D:/PROJECT_S/MediConnect%20Elite/MediConnect/workflows/system-integration-workflow.md) | End-to-end user journeys (SOS emergency, consultation, Gemini AI, Stripe payment). |
| [scripts/](file:///D:/PROJECT_S/MediConnect%20Elite/MediConnect/workflows/scripts) | Automation scripts to start, verify, and migrate all stack components together. |
| [ci-cd/](file:///D:/PROJECT_S/MediConnect%20Elite/MediConnect/workflows/ci-cd) | Production GitHub Actions CI/CD workflows for automated builds and testing. |

---

## ⚡ Quick Start Workflows

### 1. Launch All Services Simultaneously
Run the automated orchestration script:
```powershell
# In PowerShell:
.\workflows\scripts\start-all.ps1
```

### 2. Verify System Health Across All Layers
```bash
node workflows/scripts/check-health.js
```

### 3. Apply Complete Database Migrations
Upload and run [migrate-database.sql](file:///D:/PROJECT_S/MediConnect%20Elite/MediConnect/workflows/scripts/migrate-database.sql) inside your [Supabase SQL Editor](https://supabase.com/dashboard/project/rmfzydycexyuhqskklgu/sql).
