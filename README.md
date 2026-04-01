# 🔐 JWT Authentication API

A complete **REST API** for user authentication built with **Node.js**, **Express 5**, **MongoDB**, and **JWT (JSON Web Tokens)**. Features include user registration with **email OTP verification**, secure login/logout, access & refresh token rotation, and multi-device session management.

---

## ✨ Features

- **User Registration** with SHA-256 password hashing
- **Email OTP Verification** via Gmail OAuth2 (Nodemailer)
- **JWT Access Tokens** (15 min expiry) & **Refresh Tokens** (7 day expiry)
- **Refresh Token Rotation** — old tokens are invalidated on each refresh
- **Session Management** — each login creates a tracked session in the DB
- **Logout** — revokes the current session
- **Logout All Devices** — revokes every active session for the user
- **Protected Routes** — `GET /get-me` returns user profile with Bearer token auth
- **Secure Cookies** — refresh tokens stored as `httpOnly`, `secure`, `sameSite: strict`

---

## 📁 Project Structure

```
jwt-auth/
├── controllers/
│   └── auth.controller.js    # All auth logic (register, login, verify, refresh, logout)
├── models/
│   ├── user.model.js          # User schema (username, email, password, verified)
│   ├── session.model.js       # Session schema (refreshTokenHash, revoked, ip, userAgent)
│   └── otp.model.js           # OTP schema (email, user, otpHash)
├── routes/
│   └── auth.routes.js         # Route definitions for /api/auth/*
├── services/
│   └── email.service.js       # Nodemailer transporter with Gmail OAuth2
├── utils/
│   └── utils.js               # OTP generation & HTML email template
├── src/
│   ├── app.js                 # Express app setup (middleware, routes)
│   └── config/
│       ├── config.js          # Environment variable loader & validator
│       └── database.js        # MongoDB connection via Mongoose
├── server.js                  # Entry point — connects DB & starts server
├── .env.example               # Template for required environment variables
├── .gitignore                 # Files excluded from version control
├── package.json               # Dependencies & scripts
└── README.md                  # This file
```

---

## 🛠️ Tech Stack

| Technology   | Purpose                          |
|-------------|----------------------------------|
| Node.js     | Runtime environment              |
| Express 5   | Web framework                    |
| MongoDB     | Database (via Mongoose ODM)      |
| JWT          | Access & refresh token auth      |
| Nodemailer  | Email delivery (Gmail OAuth2)    |
| Morgan       | HTTP request logging             |
| Cookie-Parser| Parse cookies from requests     |
| Dotenv       | Environment variable management  |
| Nodemon      | Dev server with auto-reload      |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18+ installed
- **MongoDB** Atlas cluster or local instance
- **Google Cloud** OAuth2 credentials for Gmail (Client ID, Client Secret, Refresh Token)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/<your-username>/jwt-auth.git
cd jwt-auth

# 2. Install dependencies
npm install

# 3. Create environment file
cp .env.example .env
# Fill in your actual values in .env

# 4. Start the development server
npm run dev
```

The server will start on **http://localhost:3000**.

---

## 🔑 Environment Variables

Create a `.env` file in the root directory with the following variables:

| Variable              | Description                              |
|-----------------------|------------------------------------------|
| `MONGO_URI`           | MongoDB connection string                |
| `JWT_SECRET`          | Secret key for signing JWTs              |
| `GOOGLE_CLIENT_ID`    | Google OAuth2 Client ID                  |
| `GOOGLE_CLIENT_SECRET`| Google OAuth2 Client Secret              |
| `GOOGLE_REFRESH_TOKEN`| Google OAuth2 Refresh Token              |
| `GOOGLE_USER`         | Gmail address used to send OTP emails    |

---

## 📡 API Endpoints

All endpoints are prefixed with `/api/auth`.

### `POST /register`
Register a new user. Sends an OTP to the provided email for verification.

**Request Body:**
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response** `201`:
```json
{
  "message": "User registered successfully",
  "user": {
    "username": "john_doe",
    "email": "john@example.com",
    "verified": false
  }
}
```

---

### `POST /verify-email`
Verify the user's email with the OTP received via email.

**Request Body:**
```json
{
  "email": "john@example.com",
  "otp": "482910"
}
```

**Response** `200`:
```json
{
  "message": "Email verified successfully",
  "user": {
    "username": "john_doe",
    "email": "john@example.com",
    "verified": true
  }
}
```

---

### `POST /login`
Login with email and password. Only works after email verification.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response** `200`:
```json
{
  "message": "Logged in successfully",
  "user": {
    "username": "john_doe",
    "email": "john@example.com"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

> Also sets a `refreshToken` cookie (httpOnly, secure, sameSite: strict, 7 days).

---

### `GET /get-me`
Get the authenticated user's profile.

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response** `200`:
```json
{
  "user": {
    "_id": "...",
    "username": "john_doe",
    "email": "john@example.com",
    "verified": true
  }
}
```

---

### `GET /refresh-token`
Get a new access token using the refresh token cookie. Also rotates the refresh token.

**Response** `200`:
```json
{
  "message": "Access token refreshed successfully",
  "accessToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

---

### `POST /logout`
Logout from the current device (revokes the current session).

**Response** `200`:
```json
{
  "message": "Logged out successfully"
}
```

---

### `GET /logout-all`
Logout from all devices (revokes all active sessions for the user).

**Response** `200`:
```json
{
  "message": "Logged out from all devices successfully"
}
```

---

## 🔒 Authentication Flow

```
┌──────────┐     POST /register      ┌──────────┐
│  Client   │ ───────────────────────▶│  Server   │
│           │     ← 201 + OTP email   │           │
│           │                         │           │
│           │     POST /verify-email  │           │
│           │ ───────────────────────▶│           │
│           │     ← 200 verified      │           │
│           │                         │           │
│           │     POST /login         │           │
│           │ ───────────────────────▶│           │
│           │     ← accessToken       │           │
│           │     ← refreshToken 🍪   │           │
│           │                         │           │
│           │     GET /get-me         │           │
│           │     Authorization:      │           │
│           │     Bearer <token>      │           │
│           │ ───────────────────────▶│           │
│           │     ← user profile      │           │
│           │                         │           │
│           │     GET /refresh-token  │           │
│           │     (cookie sent auto)  │           │
│           │ ───────────────────────▶│           │
│           │     ← new accessToken   │           │
│           │     ← rotated cookie 🍪 │           │
│           │                         │           │
│           │     POST /logout        │           │
│           │ ───────────────────────▶│           │
│           │     ← session revoked   │           │
└──────────┘                         └──────────┘
```

---

## 📜 License

ISC
