# Vercel setup (frontend)

Full guide (Render + Vercel): see backend repo **SETUP-RENDER-VERCEL.md**  
https://github.com/kepsivijin/Rider-App/blob/main/SETUP-RENDER-VERCEL.md

## Quick setup

1. https://vercel.com/new → import **Rider-app-Frontend**
2. Framework: **Vite** (auto)
3. Environment variables:

```
VITE_API_URL=https://rider-app-api.onrender.com/api/v1
VITE_WS_URL=https://rider-app-api.onrender.com
VITE_GOOGLE_MAPS_API_KEY=
```

4. Deploy → copy your Vercel URL
5. Update Render `ALLOWED_ORIGINS` with that URL

## Demo login

| Role | Phone | OTP |
|------|-------|-----|
| Customer | 9876543210 | 123456 |
| Driver | 9876543212 | 123456 |
| Admin | 9876543213 | 123456 |
