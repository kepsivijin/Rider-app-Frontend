# Rider-app-Frontend

Unified React app for **Customer + Driver + Admin** (Kanyakumari RideShare demo).

## Setup

```bash
npm install
cp .env.example .env
npm run dev
```

Open: http://localhost:3000

## Deploy (free — Vercel)

Root directory: this repo  
Build: `npm run build`  
Output: `dist`

```env
VITE_API_URL=https://YOUR-API.onrender.com/api/v1
VITE_WS_URL=https://YOUR-API.onrender.com
```

## Demo login

| Role | Phone | OTP |
|------|-------|-----|
| Customer | 9876543210 | 123456 |
| Driver | 9876543212 | 123456 |
| Admin | 9876543213 | 123456 |

OTP shows on screen in demo mode.
