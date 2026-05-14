# QMS Pro — AI Document Studio

AI-powered compliance document generation for manufacturing SMBs.  
Supports ISO 9001:2015, IATF 16949, AS9145, AIAG PPAP, AS9100D, and more.

## What it generates

| Code | Document | Standard |
|------|----------|----------|
| COC | Certificate of Compliance | ISO 9001:2015 Cl. 8.6 |
| COA | Certificate of Analysis | ASTM / AMS |
| COO | Certificate of Origin | USMCA / CBP |
| PSW | Part Submission Warrant | AIAG PPAP 4th Ed. |
| FAIR | First Article Inspection | AS9102 Rev C |
| MTR | Material Test Report | ASTM A29 |
| 8D | 8D Corrective Action | IATF 16949 Cl. 10.2.3 |
| PFMEA | Process FMEA | AIAG/VDA 1st Ed. |
| SCAR | Supplier Corrective Action | ISO 9001 Cl. 8.4 |
| DEV | Deviation / Waiver | AS9100D Cl. 8.7 |
| IMDS | IMDS / REACH Report | REACH / RoHS |
| QMP | Quality Management Plan | AS9145 APQP |

---

## Local Development

### 1. Clone the repo

```bash
git clone https://github.com/YOUR_USERNAME/qms-pro.git
cd qms-pro
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up your API key

```bash
cp .env.example .env.local
```

Open `.env.local` and paste your [Anthropic API key](https://console.anthropic.com/):

```
ANTHROPIC_API_KEY=sk-ant-...
```

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

> **Note:** The `/api/generate` serverless function requires the Vercel CLI for local testing. Install it with `npm i -g vercel` then run `vercel dev` instead of `npm run dev`.

---

## Deploy to Vercel

### Option A — Vercel Dashboard (recommended)

1. Push this repo to GitHub (see below).
2. Go to [vercel.com](https://vercel.com) → **New Project** → Import your GitHub repo.
3. Framework preset will auto-detect as **Vite**.
4. Under **Environment Variables**, add:
   - Key: `ANTHROPIC_API_KEY`
   - Value: `sk-ant-...your-key...`
5. Click **Deploy**. Done — live URL in ~60 seconds.

### Option B — Vercel CLI

```bash
npm i -g vercel
vercel
# Follow prompts — it detects Vite automatically
# Add env var when prompted, or via: vercel env add ANTHROPIC_API_KEY
vercel --prod
```

---

## Push to GitHub

```bash
# Inside the project folder:
git init
git add .
git commit -m "Initial commit — QMS Pro AI Document Studio"

# Create a new repo on github.com, then:
git remote add origin https://github.com/YOUR_USERNAME/qms-pro.git
git branch -M main
git push -u origin main
```

---

## Architecture

```
qms-pro/
├── api/
│   └── generate.js      # Vercel Edge Function — Anthropic API proxy (keeps key server-side)
├── public/
│   └── favicon.svg
├── src/
│   ├── main.jsx         # React entry point
│   └── App.jsx          # Full QMS AI Document Studio UI
├── index.html
├── package.json
├── vite.config.js
├── vercel.json          # Build + rewrite rules
└── .env.example         # Copy to .env.local with your API key
```

The `/api/generate.js` Edge Function is the security boundary — it holds your Anthropic API key in a server-side environment variable and streams responses back to the browser. The key is never exposed to clients.

---

## Customizing for your company

In `src/App.jsx`, find the `SYSTEM_DEFAULT` section in `callClaude()` and update:

```js
Company: Your Company Name | CAGE: XXXXX | ISO 9001:2015 Cert # | ...
Authorized Signatory: Your Name, Quality Manager
```

You can also update `DEFAULTS` near the top of `App.jsx` to pre-fill forms with your real part numbers and customer names.

---

## License

MIT
