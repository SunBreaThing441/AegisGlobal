<div align="center">

<img src="https://img.shields.io/badge/MediConnect-AI%20Healthcare%20OS-06b6d4?style=for-the-badge&logo=heart&logoColor=white" alt="MediConnect" />

# 🏥 AegisGlobal — AI-Powered Healthcare Platform

**The next-generation telemedicine OS built for the real world.**  
*Emergency SOS · AI Diagnostics · Teleconsultation · Doctor Accountability · Premium Subscriptions*

<br/>

[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?style=flat-square&logo=vite)](https://vitejs.dev)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-4-38BDF8?style=flat-square&logo=tailwindcss)](https://tailwindcss.com)
[![Express](https://img.shields.io/badge/Express-4-000000?style=flat-square&logo=express)](https://expressjs.com)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=flat-square&logo=postgresql)](https://postgresql.org)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-4-010101?style=flat-square&logo=socket.io)](https://socket.io)
[![Gemini AI](https://img.shields.io/badge/Gemini-2.0%20Flash-4285F4?style=flat-square&logo=google)](https://deepmind.google/technologies/gemini/)
[![Stripe](https://img.shields.io/badge/Stripe-Payments-635BFF?style=flat-square&logo=stripe)](https://stripe.com)
[![License](https://img.shields.io/badge/License-MIT-10b981?style=flat-square)](LICENSE)

<br/>

> **MediConnect** is a full-stack, production-ready telemedicine platform that combines AI-powered health diagnostics, real-time video consultations, an enforced emergency SOS system with financial accountability, premium subscriptions via Stripe, Google OAuth, and a fully featured admin control panel — all wrapped in a stunning glassmorphism dark-mode UI.

</div>

---

## 📋 Table of Contents

- [✨ Features](#-features)
- [🖼️ Screenshots](#️-screenshots)
- [🏗️ Architecture](#️-architecture)
- [🛠️ Tech Stack](#️-tech-stack)
- [📁 Project Structure](#-project-structure)
- [🚀 Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Environment Variables](#environment-variables)
  - [Installation](#installation)
  - [Database Setup](#database-setup)
  - [Running the App](#running-the-app)
- [🔌 API Reference](#-api-reference)
- [🔐 Authentication](#-authentication)
- [🚨 Emergency SOS System](#-emergency-sos-system)
- [🤖 AI Features](#-ai-features)
- [💳 Payments & Subscriptions](#-payments--subscriptions)
- [⚡ Real-Time Features](#-real-time-features)
- [🛡️ Admin Panel](#️-admin-panel)
- [🗄️ Database Schema](#️-database-schema)
- [🚢 Deployment](#-deployment)
- [🤝 Contributing](#-contributing)

---

## ✨ Features

### 👤 Patient Features
| Feature | Description |
|---|---|
| **Smart Registration & Login** | Email/password + Google OAuth with JWT sessions |
| **AI Symptom Checker** | Powered by Gemini 2.0 Flash — analyses symptoms and recommends specialists |
| **Browse Doctors** | Filter by specialization, emergency availability, and ratings |
| **Book Appointments** | Date/time picker with real-time slot conflict detection |
| **🚨 Emergency SOS** | One-click emergency request with 10-minute guaranteed response window |
| **Video Teleconsultation** | Jitsi Meet integration with auto-generated private room links |
| **My Appointments** | Full appointment history with status, reschedule, cancellation, and review |
| **Prescriptions** | View and download prescriptions issued by doctors |
| **Medical Records** | Upload and access personal health documents |
| **Elite Wallet** | Wallet balance dashboard with transaction history |
| **Premium Subscription** | Stripe-powered checkout for Elite plan with priority access |
| **Referral Program** | Unique referral codes with rewards for successful referrals |
| **Activity Log** | Full audit trail of all platform interactions |
| **Dark / Light Mode** | System-wide theme toggle persisted across sessions |

### 🩺 Doctor Features
| Feature | Description |
|---|---|
| **Doctor Dashboard** | Daily appointments, patient stats, revenue overview |
| **Appointment Queue** | Priority-sorted queue: Pending → Emergency → Premium Patients |
| **Accept / Reject / Reschedule** | Full appointment lifecycle management |
| **Mark Complete** | Finalize consultations and trigger payment release |
| **Issue Prescriptions** | Create structured digital prescriptions per appointment |
| **Emergency Toggle** | Go online/offline for SOS availability in real time |
| **Earnings Wallet** | Track consultation fees credited per completed session |
| **Performance Metrics** | Response rate, reliability score, avg response time |

### 🛠️ Admin Features
| Feature | Description |
|---|---|
| **Admin Dashboard** | Live stats: users, doctors, appointments, revenue, violations |
| **User Management** | Paginated user list with search, role filter, and activity data |
| **Doctor Accountability** | Full metrics: accept/reject rate, timeout count, penalty totals |
| **Penalty Reversal** | Reverse wrongful penalties with full audit log |
| **Financial Analytics** | Revenue breakdown: subscriptions, consultations, penalties, refunds |
| **Violation Tracker** | Emergency rejection and timeout violation history |

---

## 🖼️ Screenshots

<table>
  <tr>
    <td align="center"><b>🏠 Home Page</b></td>
    <td align="center"><b>📊 Dashboard</b></td>
  </tr>
  <tr>
    <td><img src="docs/screenshots/home.png" alt="Home" width="400"/></td>
    <td><img src="docs/screenshots/dashboard.png" alt="Dashboard" width="400"/></td>
  </tr>
  <tr>
    <td align="center"><b>🩺 Doctors Page</b></td>
    <td align="center"><b>📅 Appointments</b></td>
  </tr>
  <tr>
    <td><img src="docs/screenshots/doctors.png" alt="Doctors" width="400"/></td>
    <td><img src="docs/screenshots/appointments.png" alt="Appointments" width="400"/></td>
  </tr>
  <tr>
    <td align="center"><b>💬 AI Health Assistant</b></td>
    <td align="center"><b>💳 Elite Wallet</b></td>
  </tr>
  <tr>
    <td><img src="docs/screenshots/ai_chat.png" alt="AI Chat" width="400"/></td>
    <td><img src="docs/screenshots/wallet.png" alt="Wallet" width="400"/></td>
  </tr>
</table>

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT (Browser)                      │
│  React 19 + Vite + TailwindCSS + Framer Motion + Socket.IO  │
│  Auth: JWT in localStorage  |  API: Axios  |  Theme: CSS    │
└─────────────────────┬───────────────────────────────────────┘
                      │  HTTPS / WSS
┌─────────────────────▼───────────────────────────────────────┐
│                    EXPRESS SERVER (Node.js)                   │
│  REST API on :5000  |  Socket.IO  |  Rate Limiting (100/min) │
│                                                               │
│  Middleware Stack:                                            │
│  cors → compression → json → authMiddleware → routes         │
│                                                               │
│  Route Modules:                                               │
│  /api/auth  /api/users  /api/appointments  /api/doctors       │
│  /api/ai    /api/wallet /api/notifications /api/payment       │
│  /api/prescriptions  /api/documents  /api/admin              │
└──────┬───────────────────────┬────────────────────┬─────────┘
       │                       │                    │
┌──────▼───────┐   ┌───────────▼──────┐  ┌─────────▼────────┐
│  PostgreSQL  │   │   Google Gemini   │  │  Stripe Checkout │
│   Database   │   │   AI (2.0 Flash)  │  │  Payment Gateway │
│  (pg pool)   │   │                  │  │                  │
└──────────────┘   └──────────────────┘  └──────────────────┘
       │
┌──────▼────────────────────────────────┐
│       Background Jobs (node-cron)      │
│  Emergency Scheduler — every 30s       │
│  • Timeout expired SOS requests        │
│  • Deduct ₹1,000 penalties             │
│  • Auto-reassign to next doctor        │
│  • Log violations & notify via socket  │
└────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| **React** | 19 | UI framework |
| **Vite** | 6 | Build tool & dev server |
| **TailwindCSS** | 4 | Utility-first CSS |
| **Framer Motion** | 12 | Animations & transitions |
| **Socket.IO Client** | 4 | Real-time events |
| **Axios** | 1.x | HTTP client |
| **Lucide React** | Latest | Icon system |
| **React Router DOM** | 7 | Client-side routing |
| **React Toastify** | 11 | Toast notifications |
| **Recharts** | 3 | Analytics charts |
| **React Markdown** | 10 | AI response rendering |
| **React Confetti** | 6 | Payment success celebration |
| **@react-oauth/google** | 0.13 | Google OAuth |
| **@stripe/react-stripe-js** | 5 | Stripe UI elements |

### Backend
| Technology | Version | Purpose |
|---|---|---|
| **Node.js** | 20+ | Runtime |
| **Express** | 4 | HTTP server & routing |
| **PostgreSQL** | 16 | Primary database |
| **pg** | 8 | PostgreSQL client (connection pooling) |
| **Socket.IO** | 4 | WebSocket server |
| **jsonwebtoken** | 9 | JWT auth tokens |
| **bcryptjs** | 2.4 | Password hashing |
| **node-cron** | 4 | Background job scheduler |
| **@google/generative-ai** | 0.24 | Gemini AI SDK |
| **google-auth-library** | 10 | Google OAuth token verification |
| **Stripe** | 20 | Payment processing |
| **Nodemailer** | 7 | Email notifications |
| **Multer** | 2 | File uploads |
| **express-rate-limit** | 8 | API rate limiting |
| **compression** | 1.8 | Response compression |
| **dotenv** | 16 | Environment config |

---

## 📁 Project Structure

```
MediConnect-main/
├── frontend/                        # React + Vite SPA
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/                  # Reusable UI primitives
│   │   │   │   ├── GlassCard.jsx    # Glassmorphism card
│   │   │   │   ├── GradientText.jsx # Gradient text component
│   │   │   │   └── ParticleBackground.jsx
│   │   │   ├── BookingModal.jsx     # Appointment booking flow
│   │   │   ├── ChatBot.jsx          # AI health chatbot
│   │   │   ├── EliteWallet.jsx      # Wallet dashboard widget
│   │   │   ├── Navbar.jsx           # Global navigation bar
│   │   │   ├── PrescriptionModal.jsx
│   │   │   ├── RecordsModal.jsx     # Medical records viewer
│   │   │   ├── RescheduleModal.jsx
│   │   │   └── ReviewModal.jsx      # Post-consult rating
│   │   ├── context/
│   │   │   └── AuthContext.jsx      # Global auth + theme state
│   │   ├── pages/
│   │   │   ├── Home.jsx             # Landing page
│   │   │   ├── Login.jsx            # Login with Google OAuth
│   │   │   ├── Register.jsx         # Registration with role select
│   │   │   ├── Dashboard.jsx        # Patient/Doctor dashboard
│   │   │   ├── Doctors.jsx          # Doctor discovery & booking
│   │   │   ├── MyAppointments.jsx   # Full appointment manager
│   │   │   ├── Profile.jsx          # Edit profile & avatar
│   │   │   ├── Departments.jsx      # Medical departments browser
│   │   │   ├── Wallet.jsx           # Full wallet & transactions
│   │   │   ├── Subscribe.jsx        # Premium plans
│   │   │   ├── PremiumPerks.jsx     # Referral & perks
│   │   │   ├── ActivityLog.jsx      # Audit log viewer
│   │   │   ├── ForgotPassword.jsx   # OTP-based password reset
│   │   │   └── PaymentSuccess.jsx   # Post-payment confirmation
│   │   ├── App.jsx                  # Routes & protected routes
│   │   ├── main.jsx                 # React DOM entry
│   │   └── index.css                # Global styles & design system
│   ├── tailwind.config.js
│   └── vite.config.js
│
└── backend/                         # Express REST API
    ├── controllers/
    │   ├── aiController.js          # Gemini AI chat endpoint
    │   ├── adminController.js       # Admin dashboard & analytics
    │   ├── appointmentController.js # Booking, status, complete
    │   ├── authController.js        # Register, login, OAuth, OTP
    │   ├── doctorController.js      # Doctor profiles & search
    │   ├── documentController.js    # Medical record uploads
    │   ├── notificationController.js
    │   ├── paymentController.js     # Stripe checkout & verify
    │   ├── prescriptionController.js
    │   ├── reviewController.js      # Post-appointment ratings
    │   ├── userController.js        # Profile, stats, activity
    │   └── walletController.js      # Balance, transactions, payments
    ├── jobs/
    │   └── emergencyScheduler.js    # Cron: timeout + penalty + reassign
    ├── middleware/
    │   ├── authMiddleware.js        # JWT verification
    │   └── adminMiddleware.js       # Role guard for admin routes
    ├── migrations/
    │   └── 001_schema_upgrade.sql   # Full DB schema
    ├── routes/
    │   ├── adminRoutes.js
    │   ├── aiRoutes.js
    │   ├── appointmentRoutes.js
    │   ├── authRoutes.js
    │   ├── doctorRoutes.js
    │   ├── documentRoutes.js
    │   ├── notificationRoutes.js
    │   ├── paymentRoutes.js
    │   ├── prescriptionRoutes.js
    │   ├── userRoutes.js
    │   └── walletRoutes.js
    ├── uploads/                     # Multer file storage
    ├── utils/
    │   └── emailService.js          # Nodemailer transporter
    ├── db.js                        # PostgreSQL pool
    ├── server.js                    # App entry point
    └── socketManager.js             # Socket.IO setup & helpers
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 20.0.0
- **PostgreSQL** ≥ 14
- **npm** ≥ 9
- A **Google Cloud** project with OAuth 2.0 credentials
- A **Stripe** account (test mode works)
- A **Gmail** / SMTP account for email delivery
- A **Google AI Studio** API key (for Gemini)

---

### Environment Variables

#### Backend — `backend/.env`

```env
# Server
PORT=5000
NODE_ENV=development

# Database
DATABASE_URL=postgresql://username:password@localhost:5432/mediconnect_db

# Auth
JWT_SECRET=your_super_secret_jwt_key_min_32_chars

# Frontend URL (for CORS & Stripe redirects)
CLIENT_URL=http://localhost:5173

# Google OAuth
GOOGLE_CLIENT_ID=your_google_oauth_client_id.apps.googleusercontent.com

# Google Gemini AI
GEMINI_API_KEY=your_google_ai_studio_api_key

# Stripe
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key

# Email (Gmail SMTP)
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_app_password_16chars
```

> **Gmail App Password**: Go to Google Account → Security → 2-Step Verification → App Passwords

#### Frontend — `frontend/.env`

```env
VITE_API_URL=http://localhost:5000
VITE_GOOGLE_CLIENT_ID=your_google_oauth_client_id.apps.googleusercontent.com
```

---

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/yourusername/MediConnect.git
cd MediConnect

# 2. Install backend dependencies
cd backend
npm install

# 3. Install frontend dependencies
cd ../frontend
npm install
```

---

### Database Setup

```bash
# 1. Create the database
psql -U postgres -c "CREATE DATABASE mediconnect_db;"

# 2. Run the schema migration
psql -U postgres -d mediconnect_db -f backend/migrations/001_schema_upgrade.sql

# 3. (Optional) Seed a test admin user
cd backend
node seed_test_users.js
```

> The migration creates all tables: `users`, `patients`, `doctors`, `appointments`, `transactions`, `notifications`, `activity_logs`, `prescriptions`, `documents`, `reviews`, `doctor_metrics`, `emergency_violations`, `admin_audit_logs`.

---

### Running the App

```bash
# Terminal 1 — Start the backend
cd backend
node server.js
# → Server running on http://localhost:5000
# → WebSocket server ready
# → Emergency Scheduler started (every 30s)

# Terminal 2 — Start the frontend
cd frontend
npm run dev
# → App running on http://localhost:5173
```

---

## 🔌 API Reference

All endpoints are prefixed with `/api`. Protected routes require:
```
Authorization: Bearer <jwt_token>
```

### 🔑 Auth — `/api/auth`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/register` | ❌ | Register (patient or doctor) with optional referral code |
| `POST` | `/login` | ❌ | Login and receive JWT token |
| `POST` | `/google-login` | ❌ | OAuth login/register via Google |
| `POST` | `/forgot-password` | ❌ | Send OTP to email for password reset |
| `POST` | `/reset-password` | ❌ | Verify OTP and set new password |

### 👤 Users — `/api/users`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/profile` | ✅ | Get full user profile (doctor or patient fields) |
| `PUT` | `/profile` | ✅ | Update profile fields |
| `GET` | `/dashboard-stats` | ✅ | Appointment stats for the logged-in user |
| `GET` | `/activity-logs` | ✅ | Recent 5 activity log entries |
| `GET` | `/referral-data` | ✅ | Referral code, count, and premium status |
| `GET` | `/wallet` | ✅ | Wallet balance for quick display |
| `PUT` | `/emergency-status` | ✅ Doctor | Toggle emergency availability on/off |

### 📅 Appointments — `/api/appointments`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/book` | ✅ Patient | Book a regular or emergency appointment |
| `GET` | `/my-appointments` | ✅ | Get all appointments (doctor or patient view) |
| `PUT` | `/:id` | ✅ Doctor | Accept, reject, or reschedule appointment |
| `DELETE` | `/:id` | ✅ Doctor | Delete/cancel appointment |
| `PUT` | `/:id/complete` | ✅ Doctor | Mark appointment as Completed |
| `GET` | `/active-call` | ✅ | Get current active emergency call (if any) |

### 🩺 Doctors — `/api/doctors`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/` | ❌ | List all doctors (filterable by specialization, SOS, search) |
| `GET` | `/:id` | ❌ | Get individual doctor profile |
| `GET` | `/:id/reviews` | ❌ | Get paginated reviews for a doctor |
| `GET` | `/:id/available-slots` | ❌ | Get available time slots for a date |

### 🤖 AI — `/api/ai`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/chat` | ✅ | Send a message to the Gemini AI health assistant |

### 💳 Wallet — `/api/wallet`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/dashboard` | ✅ | Full wallet: balance + transactions + totals |
| `GET` | `/transactions` | ✅ | Paginated transaction history with type filter |
| `POST` | `/pay-consultation` | ✅ Patient | Process consultation fee (wallet-to-wallet) |

### 🔔 Notifications — `/api/notifications`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/` | ✅ | Paginated notification list |
| `GET` | `/unread-count` | ✅ | Get count of unread notifications |
| `PUT` | `/:id/read` | ✅ | Mark single notification as read |
| `PUT` | `/mark-all-read` | ✅ | Mark all notifications as read |

### 💊 Prescriptions — `/api/prescriptions`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/` | ✅ Doctor | Create a prescription for an appointment |
| `GET` | `/appointment/:id` | ✅ | Get prescription by appointment ID |
| `GET` | `/my-prescriptions` | ✅ Patient | Get all prescriptions for the patient |

### 📄 Documents — `/api/documents`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/upload` | ✅ | Upload a medical document (image/PDF, max 5MB) |
| `GET` | `/` | ✅ | Get all documents for the logged-in user |
| `DELETE` | `/:id` | ✅ | Delete a document |

### ⭐ Reviews — (via `/api/appointments/:id/review`)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/appointments/:id/review` | ✅ Patient | Submit a rating and review for a completed appointment |

### 💰 Payments — `/api/payment`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/create-checkout-session` | ✅ | Create a Stripe Checkout session for Elite plan |
| `POST` | `/verify` | ✅ | Verify Stripe session and activate Premium |

### 🛡️ Admin — `/api/admin` *(Admin role required)*

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/dashboard` | ✅ Admin | Platform-wide stats |
| `GET` | `/users` | ✅ Admin | Paginated users with search and role filter |
| `GET` | `/doctors/metrics` | ✅ Admin | All doctor accountability metrics |
| `GET` | `/doctors/:id/penalties` | ✅ Admin | Penalty history for a doctor |
| `PUT` | `/penalties/:id/reverse` | ✅ Admin | Reverse a penalty with audit log |
| `GET` | `/analytics/financial` | ✅ Admin | Full financial analytics breakdown |

---

## 🔐 Authentication

MediConnect uses a **dual-layer auth system**:

### Email/Password
- Passwords are hashed with **bcryptjs** (10 salt rounds)
- On login, a **JWT** is issued with a 24-hour expiry
- Token payload: `{ id, role }`
- All protected routes verify the token via `authMiddleware.js`

### Google OAuth
- Uses `@react-oauth/google` (frontend) + `google-auth-library` (backend)
- On first Google login, a new user + patient/doctor record is auto-created
- Returns the same JWT structure as email login

### Password Reset
1. User submits email → backend generates 6-digit OTP, stores with 10-min expiry
2. OTP sent via **Nodemailer** email
3. User submits OTP + new password → bcrypt hash + clear OTP

---

## 🚨 Emergency SOS System

The Emergency SOS system is MediConnect's flagship feature — a fully automated, financially-accountable emergency dispatch protocol.

### How It Works

```
Patient clicks "SOS" on a doctor's card
         │
         ▼
Appointment created with:
  • status = 'Pending'
  • is_emergency = TRUE
  • timeout_at = NOW() + 10 minutes
         │
         ▼
Doctor receives:
  • Real-time Socket.IO event: emergency:new
  • Push notification in-app
  • Email with countdown warning
         │
         ├─── Doctor ACCEPTS within 10 min ─────────────────────────┐
         │         ↓                                                  │
         │    • status = 'Confirmed'                                  │
         │    • Jitsi Meet room auto-generated                        │
         │    • Patient notified via socket (emergency:accepted)      │
         │    • Response time recorded to doctor_metrics              │
         │    • Reliability score updated                             │
         │                                                            │
         └─── Doctor IGNORES / REJECTS / TIMEOUT ───────────────────►│
                        ↓                                            │
              Emergency Scheduler fires every 30s                   │
              Detects expired appointments                           │
                        ↓                                            │
              • ₹1,000 deducted from doctor wallet                   │
              • penalty transaction logged                           │
              • emergency_violations record created                  │
              • warning_count + 1, reliability_score drops           │
              • status = 'Expired'                                   │
              • Next available SOS doctor auto-assigned (reassign)   │
              • Both users notified via socket                       │
              • Patient gets refund of consultation fee              │
```

### Doctor Metrics Tracked
- `total_emergency_requests` — total SOS requests assigned
- `accepted_count` — accepted in time
- `rejected_count` — explicitly rejected
- `timeout_count` — expired without response
- `avg_response_time_seconds` — rolling average
- `response_rate_percentage` — acceptance rate
- `total_penalties` — number of penalty events
- `total_penalty_amount` — total ₹ deducted
- `reliability_score` — composite score 0–100

---

## 🤖 AI Features

### AI Health Assistant (Chatbot)
- Powered by **Google Gemini 2.0 Flash**
- Accessible via the floating chatbot widget on the Dashboard
- Context-aware: the AI knows the user's role and adjusts responses accordingly
- Handles: symptom checking, medication queries, specialist recommendations, general health Q&A
- Responses are rendered with full **Markdown** formatting
- Rate-limited per user to prevent abuse

**System Prompt Structure:**
```
You are MediConnect AI, an advanced medical assistant.
Role: {user.role} | Name: {user.fullName}
Context: healthcare platform with emergency SOS, teleconsult, records
Guidelines: evidence-based, recommend specialist when needed, never diagnose definitively
```

---

## 💳 Payments & Subscriptions

### Stripe Checkout Flow
```
1. Patient clicks "Upgrade to Elite"
2. Frontend calls POST /api/payment/create-checkout-session
3. Backend creates Stripe Checkout Session (INR, card)
4. Patient redirected to Stripe-hosted checkout page
5. On success → redirected to /payment-success?session_id=xxx
6. Frontend calls POST /api/payment/verify
7. Backend verifies with Stripe → marks user is_premium = TRUE
8. Subscription end date set: NOW() + 1 month
9. Referral reward triggered if user was referred
```

### Pricing
| Plan | Price | Duration |
|---|---|---|
| **Basic** | ₹0 | Forever |
| **Elite Monthly** | ₹1,599 | 1 Month |
| **Elite Annual** | ₹15,999 | 1 Year |

### Elite Premium Benefits
- ✅ AI Health Assistant access
- ✅ Priority doctor queue position
- ✅ VIP badge displayed to doctors
- ✅ Priority video consultation scheduling
- ✅ Full medical records storage
- ✅ Referral reward program
- ✅ Exclusive department access

### Wallet System
Doctors earn via `consultation` credit transactions.
Patients pay via `consultation` debit transactions.
Penalties are `penalty` debit transactions on doctors.
All transactions are immutable; only admins can create `refund` reversals.

---

## ⚡ Real-Time Features

Built on **Socket.IO** with room-based user targeting via `emitToUser(userId, event, payload)`.

| Event | Direction | Trigger |
|---|---|---|
| `appointment:new` | Server → Doctor | New appointment booked |
| `appointment:status` | Server → Patient | Doctor accepts/rejects |
| `appointment:cancelled` | Server → Patient | Doctor deletes appointment |
| `appointment:completed` | Server → Patient | Doctor marks complete |
| `emergency:new` | Server → Doctor | Emergency SOS received |
| `emergency:accepted` | Server → Patient | Emergency accepted with meeting link |
| `emergency:timeout` | Server → Both | Emergency expired → reassigned |
| `emergency:reassigned` | Server → New Doctor | New SOS assignment |
| `wallet:update` | Server → Doctor | Penalty or refund applied |
| `notification:new` | Server → User | Any new notification |

Clients join their personal room on connect:
```js
socket.emit('join', userId);
```

---

## 🛡️ Admin Panel

Access requires `role = 'admin'` in the JWT. Protected by `adminMiddleware.js`.

### Dashboard Metrics
```json
{
  "total_users": 1500,
  "total_doctors": 200,
  "total_patients": 1300,
  "total_appointments": 8450,
  "total_revenue": 245000,
  "total_penalties": 12500,
  "active_emergencies": 3,
  "online_doctors": 47,
  "today_appointments": 23,
  "new_users_week": 145,
  "total_violations": 8,
  "avg_response_rate": 94.2
}
```

### Penalty Reversal Audit Trail
Every reversal is logged in `admin_audit_logs`:
- `admin_id`, `action_type`, `target_type`, `target_id`, `details` (JSON), `created_at`

---

## 🗄️ Database Schema

### Core Tables

```sql
-- Users (all roles)
users (id, email, password_hash, full_name, role, is_premium,
       referral_code, referral_count, referred_by,
       wallet_balance, avatar_url, last_login_at,
       reset_otp, reset_otp_expiry, subscription_end_date)

-- Doctor extended profiles
doctors (id, user_id, full_name, specialization, experience_years,
         consultation_fee, phone_number, bio, address, availability,
         is_emergency, is_emergency_active,
         total_revenue, wallet_balance, warning_count,
         reliability_score, is_online, last_active_at)

-- Patient extended profiles
patients (id, user_id, full_name, phone_number, address, dob)

-- Appointments
appointments (id, patient_id, doctor_id,
              appointment_date, appointment_time, status,
              is_emergency, meeting_link, timeout_at,
              responded_at, response_time_seconds,
              rejection_reason, reassignment_count)

-- Financial ledger
transactions (id, user_id, type, amount, balance_after,
              description, reference_id, reference_type,
              reversed, reversed_by, reversed_at, created_by)

-- Notifications
notifications (id, user_id, type, title, message,
               priority, data, is_read)

-- Activity audit
activity_logs (id, user_id, type, title, description)

-- Doctor accountability
doctor_metrics (doctor_id, total_emergency_requests, accepted_count,
                rejected_count, timeout_count, avg_response_time_seconds,
                response_rate_percentage, reliability_score,
                total_penalties, total_penalty_amount, last_violation_at)

emergency_violations (id, doctor_id, appointment_id, violation_type,
                      response_time_seconds, rejection_reason, action_taken)

-- Admin
admin_audit_logs (id, admin_id, action_type, target_type,
                  target_id, details, created_at)

-- Clinical
prescriptions (id, appointment_id, doctor_id, patient_id, medications, notes)
documents (id, user_id, appointment_id, file_url, file_name, file_type)
reviews (id, appointment_id, patient_id, doctor_id, rating, comment)
```

### Appointment Status Flow

```
Pending ──► Confirmed ──► Completed
   │            │
   └──► Cancelled
   │
   └──► Expired  (auto, via emergency scheduler)
```

---

## 🚢 Deployment

### Backend (e.g., Railway / Render / DigitalOcean)

```bash
# Set all environment variables in your hosting dashboard
# Build command: none (Node.js, runs directly)
# Start command:
node server.js
```

### Frontend (e.g., Vercel / Netlify)

```bash
# Build command:
npm run build

# Output directory:
dist

# Set environment variable:
VITE_API_URL=https://your-backend-domain.com
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

### PostgreSQL (e.g., Supabase / Neon / Railway)

1. Create a new PostgreSQL database
2. Run `backend/migrations/001_schema_upgrade.sql`
3. Update `DATABASE_URL` in your environment

### Checklist Before Going Live

- [ ] Change `JWT_SECRET` to a cryptographically random 64-char string
- [ ] Switch Stripe keys from `sk_test_*` to `sk_live_*`
- [ ] Update `CLIENT_URL` to production frontend URL
- [ ] Configure Google OAuth Authorized Origins for production domain
- [ ] Set `NODE_ENV=production`
- [ ] Enable PostgreSQL SSL (`ssl: { rejectUnauthorized: false }` for hosted DBs)
- [ ] Set up proper file storage (S3/Cloudinary) for `uploads/` in production

---

## 🤝 Contributing

Contributions are welcome! Here's how:

```bash
# 1. Fork the repo and clone your fork
git clone https://github.com/your-username/MediConnect.git

# 2. Create a feature branch
git checkout -b feature/your-feature-name

# 3. Make your changes and commit
git commit -m "feat: add your feature description"

# 4. Push and open a Pull Request
git push origin feature/your-feature-name
```

### Commit Convention
| Prefix | Use For |
|---|---|
| `feat:` | New feature |
| `fix:` | Bug fix |
| `docs:` | Documentation |
| `style:` | Code formatting |
| `refactor:` | Code restructure |
| `test:` | Test additions |
| `chore:` | Build/config changes |

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

Built with ❤️ by Vaibhav Pratap Deo

**[⬆ Back to Top](#-mediconnect--ai-powered-healthcare-platform)**

</div>
