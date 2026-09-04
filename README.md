# ShotlyAPI — Website Screenshot API

A fast, reliable screenshot API built on Cloudflare's edge network.

## Tech Stack

- **Frontend:** React + Vite
- **Backend:** Cloudflare Workers
- **Database:** Cloudflare D1
- **Storage:** Cloudflare R2
- **Email:** Resend
- **Payments:** Razorpay
- **Screenshot Engine:** Puppeteer + Chromium (Oracle Cloud)

## Project Structure

```
shotlyapi/
├── src/                  # React frontend
│   ├── components/       # Shared components
│   ├── pages/            # Page components (Landing, Login, Dashboard, etc.)
│   ├── lib/              # Auth context & utilities
│   └── styles/           # Global CSS
├── worker/               # Cloudflare Worker backend
│   ├── worker.js         # Main Worker code (auth, billing, API proxy)
│   └── schema.sql        # D1 database schema
├── public/               # Static assets
├── package.json
├── vite.config.js
└── README.md
```

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Create a `.env` file:

```env
VITE_API_URL=https://api.shotlyapi.in
```

### 3. Run Locally

```bash
npm run dev
```

### 4. Build for Production

```bash
npm run build
```

The built files go to `dist/`. Deploy this to Cloudflare Pages.

### 5. Deploy Worker

1. Copy `worker/worker.js` to your Cloudflare Worker
2. Run `worker/schema.sql` in your D1 database console
3. Set Worker environment variables:
   - `ORACLE_SERVER_URL` — your screenshot server URL
   - `JWT_SECRET` — a random secret string for JWT tokens
   - `RZP_KEY_ID` — Razorpay Key ID
   - `RZP_KEY_SECRET` — Razorpay Key Secret
   - `RESEND_API_KEY` — Resend API key for emails

### 6. Worker Bindings

- **D1 database:** variable `DB` → `screenshot-api-db`
- **R2 bucket:** variable `SCREENSHOTS` → `screenshots`

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/api/screenshot?url=...&api_key=...` | Capture screenshot |
| POST | `/api/auth/signup` | Create account |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user |
| POST | `/api/auth/regenerate` | Regenerate API key |
| GET | `/api/usage` | Get usage stats |
| POST | `/api/billing/create-order` | Create Razorpay order |
| POST | `/api/billing/verify` | Verify payment |

## License

MIT
