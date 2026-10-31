# 🔄 System Integration Workflow — MediConnect Elite

This document details how the **Frontend**, **Backend**, and **Database** communicate during primary user journeys.

---

## 1. Authentication & Session Workflow

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant FE as Frontend (React)
    participant BE as Backend (Express)
    participant SB as Supabase / PostgreSQL
    participant GO as Google OAuth API

    alt Standard Email/Password
        User->>FE: Enters credentials on /login
        FE->>BE: POST /api/auth/login {email, password}
        BE->>SB: SELECT * FROM users WHERE email = $1
        SB-->>BE: User record + password_hash
        BE->>BE: bcrypt.compare(password, hash)
        BE-->>FE: Return {token (JWT), user, role}
    else Google OAuth Login
        User->>FE: Clicks "Continue with Google"
        FE->>GO: OAuth popup / credential
        GO-->>FE: Returns id_token
        FE->>BE: POST /api/auth/google {credential}
        BE->>GO: Verify token with OAuth2Client
        BE->>SB: Find or INSERT into users
        BE-->>FE: Return {token, user, role}
    end

    FE->>FE: Store token in localStorage
    FE->>FE: Set AuthContext state & sync theme
    FE->>BE: Connect Socket.IO handshake {token}
    BE-->>FE: Socket connected & joined room: user_{id}
```

---

## 2. Doctor Consultation & Jitsi Video Call Workflow

```mermaid
sequenceDiagram
    autonumber
    actor Patient
    actor Doctor
    participant FE as Frontend (React)
    participant BE as Backend (Express)
    participant SB as Supabase / DB
    participant Jitsi as Jitsi Meet Server

    Patient->>FE: Selects Doctor & picks slot on /doctors
    FE->>BE: POST /api/appointments {doctorId, date, time}
    BE->>SB: Check existing slots for collisions
    BE->>SB: INSERT INTO appointments (status: 'Pending', meeting_link: 'uuid')
    BE-->>Doctor: Socket: appointment:new
    Doctor->>FE: Views appointment queue on /dashboard
    Doctor->>BE: PUT /api/appointments/:id/status {status: 'Confirmed'}
    BE->>SB: UPDATE appointments SET status = 'Confirmed'
    BE-->>Patient: Socket: appointment:status_update

    Note over Patient,Doctor: Scheduled Time Arrives
    Patient->>FE: Clicks "Join Call" on /my-appointments
    Doctor->>FE: Clicks "Start Call" on /dashboard
    FE->>Jitsi: Launch embedded iframe (room: mediconnect-consult-{id})
    Patient<-->>Doctor: Encrypted P2P Video/Audio Consultation

    Doctor->>FE: Clicks "Complete Consultation" & writes prescription
    FE->>BE: POST /api/prescriptions + PUT /api/appointments/:id/status
    BE->>SB: Credit Doctor wallet balance (+ fee)
    BE->>SB: INSERT INTO transactions (type: 'consultation')
```

---

## 3. Stripe Subscription & Elite Upgrade Workflow

```mermaid
sequenceDiagram
    autonumber
    actor Patient
    participant FE as Frontend (React)
    participant BE as Backend (Express)
    participant Stripe as Stripe API
    participant SB as Supabase / DB

    Patient->>FE: Chooses Annual or Monthly plan on /subscribe
    FE->>BE: POST /api/payment/create-checkout-session {planType}
    BE->>Stripe: stripe.checkout.sessions.create()
    Stripe-->>BE: Session object with checkout URL
    BE-->>FE: Returns {url: session.url}
    FE->>Stripe: Redirects patient to Stripe hosted checkout

    Patient->>Stripe: Completes card payment
    Stripe-->>Patient: Redirects back to /payment-success?session_id={id}
    FE->>BE: POST /api/payment/verify-session {sessionId}
    BE->>Stripe: Retrieve session & verify payment_status == 'paid'
    BE->>SB: UPDATE users SET is_premium = TRUE, subscription_end_date = NOW() + 30d/365d
    BE->>SB: INSERT INTO subscriptions (plan_type, amount, status: 'active')
    BE->>SB: Credit referral bonuses to referrer if applicable
    BE-->>FE: Returns {success: true, user: updatedUser}
    FE->>FE: Activates "Elite Gold" luxury theme & confetti
```

---

## 4. Gemini 2.0 Flash AI Symptom Checker Workflow

```mermaid
sequenceDiagram
    autonumber
    actor Patient
    participant FE as Frontend (React)
    participant BE as Backend (Express)
    participant Gemini as Google AI Studio (Gemini 2.0 Flash)
    participant SB as Supabase / DB

    Patient->>FE: Enters symptoms in ChatBot or /ai-assistant
    FE->>BE: POST /api/ai/chat {message, conversationId}
    BE->>SB: Check daily message count in ai_usage (limits standard accounts)
    
    alt Emergency keywords detected in query
        BE-->>FE: Instant emergency banner + recommendation to click SOS
    else Normal health inquiry
        BE->>Gemini: model.generateContent([systemPrompt, conversationHistory, message])
        Gemini-->>BE: Streamed / completed response
        BE->>SB: INSERT INTO ai_messages (user prompt & assistant reply)
        BE->>SB: Increment ai_usage count for user
        BE-->>FE: Returns formatted markdown response with medical disclaimer
    end
    
    FE->>Patient: Displays structured guidance, dietary suggestions & doctor recommendations
```
