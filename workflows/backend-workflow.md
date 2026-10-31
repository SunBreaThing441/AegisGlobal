# ⚙️ Backend Workflow — MediConnect Elite

## 1. Architecture Overview

The backend is built with **Node.js 20+** and **Express 4**. It coordinates business logic, enforces doctor emergency SLAs via background cron jobs, manages WebSocket rooms with **Socket.IO**, and connects to **PostgreSQL / Supabase** for data persistence.

```mermaid
flowchart TD
    subgraph ClientRequests ["Incoming Traffic"]
        A[HTTP Requests] --> B[CORS & Compression]
        C[WebSocket Handshake] --> D[Socket.IO Manager]
    end

    subgraph MiddlewarePipeline ["Security & Rate Limiting"]
        B --> E[COOP / COEP Headers]
        E --> F[Express Rate Limiter]
        F --> G[authMiddleware / JWT Verify]
        G --> H[adminMiddleware / Role Guard]
    end

    subgraph RouteHandlers ["Express Controllers"]
        H --> I1[authController]
        H --> I2[appointmentController]
        H --> I3[doctorController]
        H --> I4[aiController - Gemini 2.0]
        H --> I5[paymentController - Stripe]
        H --> I6[walletController]
        H --> I7[adminController]
    end

    subgraph BackgroundServices ["Daemon & DB"]
        J[node-cron: emergencyScheduler] -->|Every 30s Check| K[(PostgreSQL / Supabase)]
        I1 & I2 & I3 & I4 & I5 & I6 & I7 --> K
        J -->|Broadcast Alerts| D
    end
```

---

## 2. Directory Structure

```
backend/
├── controllers/
│   ├── adminController.js       # Admin KPIs, doctor oversight, penalty reversal
│   ├── aiController.js          # Google Gemini 2.0 Flash medical conversational AI
│   ├── appointmentController.js # Appointment booking, conflict check, cancellation, completion
│   ├── authController.js        # Register, login, password reset OTP, Google OAuth
│   ├── doctorController.js      # Doctor directory, search, availability toggle
│   ├── documentController.js    # Medical record uploads via Multer
│   ├── notificationController.js# Notification feeds & read markers
│   ├── paymentController.js     # Stripe checkout session creation & webhook/verify
│   ├── prescriptionController.js# Digital prescription issuance & retrieval
│   ├── reviewController.js      # Doctor rating & feedback
│   ├── userController.js        # Profile settings, activity logs, referral bonuses
│   └── walletController.js      # Ledger balances, consultations credits, withdrawals
├── jobs/
│   └── emergencyScheduler.js    # Cron worker running every 30 seconds for SLA enforcement
├── middleware/
│   ├── authMiddleware.js        # JWT token verification
│   ├── adminMiddleware.js       # Verifies role == 'admin'
│   ├── premiumMiddleware.js     # Checks user subscription status
│   └── rateLimiter.js           # IP-based rate limiting per endpoint
├── routes/                      # Route maps attached to Express app
├── uploads/                     # Multer static file destination
├── db.js                        # PostgreSQL connection pool (pg.Pool)
├── socketManager.js             # Real-time WebSocket room assignment & event emission
├── supabaseClient.js            # Supabase JavaScript client instance with ws transport
└── server.js                    # Server bootstrap, HTTP listener, and cron activation
```

---

## 3. Emergency SOS Lifecycle & Background Job

The core differentiator of MediConnect is the **10-minute Emergency SLA**:

```mermaid
sequenceDiagram
    autonumber
    actor Patient
    participant Backend as Backend API
    participant DB as PostgreSQL / Supabase
    participant Cron as Emergency Scheduler (every 30s)
    actor Doctor1 as Doctor 1
    actor Doctor2 as Doctor 2 (Backup)

    Patient->>Backend: POST /api/appointments (is_emergency: true)
    Backend->>DB: INSERT appointment (timeout_at: NOW() + 10 min, status: 'Pending')
    Backend-->>Doctor1: Socket Event: emergency:new
    Doctor1-->>Doctor1: Doctor fails to accept within 10 minutes

    Cron->>DB: SELECT appointments WHERE is_emergency=TRUE AND status='Pending' AND timeout_at < NOW()
    DB-->>Cron: Returns expired appointment
    Cron->>DB: UPDATE appointment SET status = 'Expired', penalty_applied = TRUE
    Cron->>DB: UPDATE doctor SET warning_count + 1, wallet_balance - 1000
    Cron->>DB: INSERT emergency_violations & INSERT transactions (penalty ₹1000)
    Cron-->>Doctor1: Socket Event: penalty:applied (₹1,000 penalty alert)
    Cron->>DB: SELECT next available online emergency doctor
    DB-->>Cron: Returns Doctor 2
    Cron->>DB: INSERT reassigned appointment to Doctor 2 (10 min timer)
    Cron-->>Doctor2: Socket Event: emergency:new (Reassigned priority)
    Cron-->>Patient: Socket Event: emergency:reassigned (Dr. 2 assigned)
```

---

## 4. Environment Configuration

Defined in [backend/.env](file:///D:/PROJECT_S/MediConnect%20Elite/MediConnect/backend/.env):

```env
PORT=5000
NODE_ENV=development
JWT_SECRET=supersecretmediconnectjwtkey2026developmentmin32chars
CLIENT_URL=http://localhost:5173
FRONTEND_URL=http://localhost:5173

# Stripe Payment Gateway
STRIPE_SECRET_KEY=sk_test_...

# Google AI Studio (Gemini 2.0 Flash)
GEMINI_API_KEY=your_gemini_api_key

# Supabase Database & REST Gateway
SUPABASE_URL=https://rmfzydycexyuhqskklgu.supabase.co
SUPABASE_PUBLISHABLE_KEY=sb_publishable_Q9yJIk54WyB4jsiBOx2OWQ_ie1YTWBt
REACT_APP_SUPABASE_URL=https://rmfzydycexyuhqskklgu.supabase.co
REACT_APP_SUPABASE_PUBLISHABLE_KEY=sb_publishable_Q9yJIk54WyB4jsiBOx2OWQ_ie1YTWBt
```

---

## 5. Development & Run Commands

```bash
# 1. Install dependencies
cd backend
npm install

# 2. Run backend server
node server.js
# Or with automatic reload during development:
npm run dev

# 3. Test API Health
curl http://localhost:5000/api/health
```
