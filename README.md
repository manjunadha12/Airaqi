# AQI Index — Modern Authentication System with Google OAuth & SMTP Email Verification

Production-grade authentication system for **AQI Index (AirSense Cloud)** — an Environmental & Air Quality Monitoring, Historical Analysis, and Future Prediction platform.

Built with **React 18**, **Tailwind CSS**, **Node.js/Express**, **MongoDB/Mongoose**, **JWT Session Authentication**, **Google OAuth 2.0 (Google Identity Services)**, and **Nodemailer SMTP**.

---

## 🎨 Design & Aesthetic Specifications
- **Deep Navy Background**: `#071526`
- **Primary Teal**: `#0F766E`
- **Accent Cyan**: `#57E5D2`
- **Atmospheric Particles**: Real-time canvas air mist and PM2.5 molecule simulations
- **Two-Column Desktop Interface**:
  - **Left**: Live AQI preview widget (Delhi real-time sensor stream), mission statement, and 4-pillar feature highlights (Real-Time AQI, Historical Trends, Future Prediction, Instant Alerts).
  - **Right**: Glassmorphism authentication card with Google OAuth, Email/Password sign-in, Remember Me, and Password Recovery.
- **Mobile Responsive**: Clean single-column layout with compact branding and accessible form controls.

---

## 🔑 Authentication Architecture & Security

### 1. Registration (`/register`)
- Full Name, Username, Email, Phone, Password, and Password Confirmation.
- Password policy enforcement (minimum 8 characters) and client/server validation.
- Passwords are securely hashed with `bcryptjs` (salt rounds: 10) before saving to MongoDB.
- Accounts are created in an **unverified state** (`isEmailVerified: false`).
- Generates a cryptographically secure 32-byte verification token and a 6-digit verification code.
- Dispatches branded HTML verification email via Nodemailer SMTP.
- Redirects to `/verify-email?email=...`.

### 2. Email Verification (`/verify-email`)
- **Direct Link Verification**: Clicking the link in the email (`/verify-email?token=...`) verifies the account in one click.
- **6-Digit OTP Verification**: Users can manually type the 6-digit code received in their email.
- **Resend Verification**: Rate-limited resend button with an active 60-second cooldown timer.
- Single-use tokens: Upon successful verification, tokens are invalidated and `isEmailVerified` is set to `true`.

### 3. Login with Email & Password (`/login`)
- Accepts registered Email, Username, or Phone number + Password.
- Prevents unverified accounts from logging in (returns `403 Forbidden` with a direct link to the verification page).
- Verifies password against stored bcrypt hash using generic error messages to prevent credential enumeration.
- Issues a short-lived JWT Access Token (7 days) and Refresh Token (30 days).
- **Remember Me**: Persists identifier across sessions in `localStorage`.

### 4. Google OAuth 2.0 (`/api/auth/google`)
- Implements genuine Google OAuth using **Google Identity Services** (`@google/accounts/id`).
- Frontend receives the signed Google ID Token (credential JWT) and submits it to `/api/auth/google`.
- Backend verifies token signature, audience, and issuer using `google-auth-library`.
- Automatically links with existing accounts or creates a verified user profile with Google profile picture.
- If Google credentials are not yet configured in `.env`, displays an informative setup guide instead of failing silently.

### 5. Password Recovery (`/forgot-password` & `/reset-password`)
- **Forgot Password**: Accepts email and sends a secure 1-hour reset token and 6-digit OTP via SMTP. Always returns a generic response to prevent email harvesting.
- **Reset Password**: Validates the single-use token or OTP and securely updates the user's password with a new bcrypt hash.

### 6. Protected Route Guard (`ProtectedRoute.jsx`)
- Wraps all protected routes (`/dashboard`, `/predictions`, `/alerts`, `/analytics`, `/reports`, `/settings`).
- Unauthenticated requests or expired sessions are intercepted and redirected to `/login` with location memory (`state.from`).
- Restores user state from backend via `GET /api/auth/me` on browser reload.
- **Logout**: Invalidates session on server, removes tokens from `localStorage`, resets store, and redirects to `/login`.

---

## ⚙️ Environment Variables Setup

### Backend Environment (`backend/.env`)
Create `backend/.env` using the provided `backend/.env.example`:

```env
# Server
PORT=5000
NODE_ENV=development
SERVER_URL=http://localhost:5000
FRONTEND_URL=http://localhost:3000

# Database
MONGODB_URI=mongodb://localhost:27017/airsense_cloud

# JWT Authentication
JWT_SECRET=dev_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d
REFRESH_TOKEN_SECRET=dev_refresh_token_secret_key
REFRESH_TOKEN_EXPIRE=30d

# SMTP Email Configuration (Nodemailer)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_16_char_gmail_app_password
SMTP_FROM="AQI Index AirSense <your_email@gmail.com>"

# Google OAuth 2.0 (Google Cloud Console)
GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

# Live AQI WAQI API Token
WAQI_TOKEN=348139bbe66e1ceb85262d81e1d06bdf7d753d73

# AI Prediction Engine
OPENAI_API_KEY=sk-or-v1-your_openrouter_api_key
OPENAI_MODEL=openai/gpt-oss-120b:free
```

### Frontend Environment (`frontend/.env`)
Create `frontend/.env` using the provided `frontend/.env.example`:

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
REACT_APP_GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
```

---

## 📧 How to Configure Gmail SMTP App Password

1. Go to your [Google Account](https://myaccount.google.com/) and navigate to **Security**.
2. Under "How you sign in to Google", ensure **2-Step Verification** is enabled.
3. Search for **App passwords** (or go to [https://myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)).
4. Enter an app name (e.g. `AQI Index`) and click **Create**.
5. Copy the generated 16-character password (e.g. `abcd efgh ijkl mnop`).
6. Paste it into `backend/.env`:
   ```env
   SMTP_USER=your_email@gmail.com
   SMTP_PASS=abcdefghijklmnop
   ```
7. When the backend starts, it runs `verifySMTPConnection()` and logs `✓ [SMTP Status] Connected successfully to mail server`.

---

## 🌐 How to Configure Google Cloud Console OAuth 2.0

1. Open the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project (e.g. `AQI Index AirSense`).
3. Navigate to **APIs & Services** > **OAuth consent screen**:
   - Choose User Type: **External**.
   - Fill in App name (`AQI Index`) and support email.
   - Add scopes: `.../auth/userinfo.email`, `.../auth/userinfo.profile`.
4. Navigate to **Credentials** > **Create Credentials** > **OAuth Client ID**:
   - Application Type: **Web application**.
   - Name: `AQI Index Web Client`.
   - **Authorized JavaScript origins**:
     - `http://localhost:3000`
     - `http://localhost:5000`
   - **Authorized redirect URIs**:
     - `http://localhost:3000`
     - `http://localhost:5000/api/auth/google/callback`
5. Copy the **Client ID** and paste it into:
   - `backend/.env` -> `GOOGLE_CLIENT_ID`
   - `frontend/.env` -> `REACT_APP_GOOGLE_CLIENT_ID`

---

## 🚀 Running the Project

### Prerequisites
- Node.js version **16.x**, **18.x**, or **20.x**
- MongoDB running locally or MongoDB Atlas connection URI

### Terminal 1 — Backend (PowerShell on Windows)
```powershell
cd D:\air\backend
npm install
npm run dev # or npm start
```

### Terminal 2 — Frontend (PowerShell on Windows)
```powershell
cd D:\air\frontend
npm install
npm start
```

Open your browser at **`http://localhost:3000`**.

---

## 🧪 Verification & Testing Results

| Test Scenario | Action / Endpoint | Result |
| :--- | :--- | :--- |
| **Registration Validation** | Empty fields, short password, mismatched passwords | Blocked with clear user validation errors |
| **Account Creation** | `POST /api/auth/register` | User saved in MongoDB with `isEmailVerified: false`, verification token & 6-digit OTP created |
| **Login Prior to Verification** | `POST /api/auth/login` | Blocked with HTTP 403 Forbidden and `requiresVerification: true` |
| **Email Verification** | `POST /api/auth/verify-email` with OTP or token | User updated to `isEmailVerified: true`, single-use token destroyed |
| **Valid Login** | `POST /api/auth/login` after verification | Returns HTTP 200, JWT access token, refresh token, and user profile |
| **Session Persistence** | Refreshing browser on `/dashboard` | `ProtectedRoute` calls `GET /api/auth/me`, validating session |
| **Protected Route Guard** | Opening `/dashboard` without token | Intercepted and redirected to `/login` |
| **Password Recovery** | `POST /api/auth/forgot-password` | Generates 1-hour reset token & OTP, sends email via SMTP |
| **Password Reset** | `POST /api/auth/reset-password` | Updates password with new bcrypt hash, invalidates reset token |
| **Login with New Password**| `POST /api/auth/login` with new password | HTTP 200 Success |
| **Google Authentication** | `POST /api/auth/google` with ID token | Token verified using `google-auth-library`, user authenticated |
| **Logout** | Header / Sidebar Sign Out button | Calls `/api/auth/logout`, wipes `localStorage`, redirects to `/login` |

---

## 📂 Project Structure

```text
air/
├── backend/
│   ├── config/
│   │   ├── database.js          # MongoDB Mongoose connection
│   │   ├── email.js             # Nodemailer SMTP transporter & diagnostics
│   │   └── jwt.js               # JWT signing & verification
│   ├── controllers/
│   │   ├── authController.js    # Register, login, googleAuth, verification, reset
│   │   └── aqiController.js     # Real-time AQI, station feeds, forecasting
│   ├── middleware/
│   │   ├── authenticate.js      # JWT Bearer token authentication guard
│   │   └── rateLimiter.js       # Auth & API abuse prevention rate limiters
│   ├── models/
│   │   ├── User.js              # User schema with authProvider, googleId, tokens
│   │   └── AQIHistory.js        # Air quality time-series telemetry
│   ├── routes/
│   │   ├── authRoutes.js        # /register, /login, /google, /verify-email, etc.
│   │   └── aqiRoutes.js         # /current, /forecast, /history, /comparison
│   ├── services/
│   │   └── emailService.js      # Branded HTML email templates & delivery
│   ├── .env                     # Server environment secrets
│   ├── .env.example             # Documented template
│   └── server.js                # Express entrypoint & WebSocket initialization
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── AirParticlesBackground.jsx # Atmospheric canvas animation
    │   │   ├── ProtectedRoute.jsx         # Authentication route guard
    │   │   ├── Header.jsx                 # Top bar with profile menu & logout
    │   │   └── Sidebar.jsx                # Pinned/auto-hide navigation
    │   ├── pages/
    │   │   ├── Login.jsx                  # Two-column modern authentication
    │   │   ├── Register.jsx               # Registration with terms & validations
    │   │   ├── VerifyEmail.jsx            # Token & 6-digit OTP verification
    │   │   ├── ForgotPassword.jsx         # Password recovery request
    │   │   ├── ResetPassword.jsx          # New password setup with code/token
    │   │   └── Dashboard.jsx              # Live AQI monitoring & charts
    │   ├── context/
    │   │   └── store.js                   # Zustand global state (persistent auth)
    │   ├── services/
    │   │   └── apiService.js              # Axios client with interceptors
    │   └── App.jsx                        # Route hierarchy with ProtectedRoutes
    ├── .env                               # Frontend environment configuration
    └── .env.example                       # Frontend template
```
