# Deploy Frontend (Vercel) — Free

Repo: https://github.com/kepsivijin/Rider-app-Frontend

## Prerequisites

Backend deployed on Render. You need the API URL, e.g.:
```
https://rider-app-api.onrender.com
```

---

## Deploy on Vercel

1. https://vercel.com → Sign in with GitHub
2. **Add New** → **Project**
3. Import repo: **kepsivijin/Rider-app-Frontend**
4. Framework preset: **Vite** (auto-detected)
5. **Root directory:** *(leave blank — repo root is the app)*
6. **Build command:** `npm run build`
7. **Output directory:** `dist`

### Environment variables

| Key | Value |
|-----|-------|
| `VITE_API_URL` | `https://YOUR-API.onrender.com/api/v1` |
| `VITE_WS_URL` | `https://YOUR-API.onrender.com` |
| `VITE_GOOGLE_MAPS_API_KEY` | *(leave empty)* |

8. Click **Deploy** → get URL e.g. `https://rider-app-frontend.vercel.app`

---

## After deploy

1. Copy your Vercel URL
2. Go to **Render** → backend service → **Environment**
3. Set `ALLOWED_ORIGINS` to your Vercel URL:
   ```
   https://rider-app-frontend.vercel.app
   ```
4. **Save** → Render redeploys automatically

---

## Test demo flow

Open your Vercel URL:

| Role | Phone | OTP |
|------|-------|-----|
| Customer | `9876543210` | `123456` |
| Driver | `9876543212` | `123456` |
| Admin | `9876543213` | `123456` |

OTP appears on screen after **Send OTP** (no SMS in demo mode).

---

## Notes

- `vercel.json` rewrites all routes to `index.html` for React Router
- If API calls fail with CORS, double-check `ALLOWED_ORIGINS` on Render
- First backend request after idle may be slow (Render free tier wake-up)
