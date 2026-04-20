# 🌾 KrishiLedger — Farm Management System

Full-stack farm ledger with React frontend, Express + MongoDB backend.

## 📁 Project Structure

```
krishiledger/
├── backend/              ← Express + Mongoose API
│   ├── models/           ← MongoDB schemas (Plot, Crop, Expense…)
│   ├── routes/           ← REST endpoints per collection
│   ├── middleware/       ← Generic CRUD router factory
│   ├── server.js         ← Entry point
│   ├── .env.example      ← Copy → .env and fill in
│   └── package.json
├── frontend/             ← React + Vite app
│   ├── src/
│   │   ├── api/          ← API client (fetch wrapper)
│   │   ├── hooks/        ← useFarmData (loads + CRUD)
│   │   ├── components/   ← UI.jsx (shared), Forms.jsx
│   │   ├── pages/        ← Pages.jsx (all 8 tabs)
│   │   ├── App.jsx       ← Root, routing, modals, toasts
│   │   ├── utils.js      ← Styles, constants, helpers
│   │   └── main.jsx
│   ├── vercel.json
│   └── package.json
└── render.yaml           ← Render.com deploy config
```

---

## 🚀 Deploy in 3 Steps

### Step 1 — MongoDB Atlas (Free Database)

1. Go to **https://cloud.mongodb.com** → Create free account
2. Create a **free M0 cluster** (choose Singapore region)
3. Click **"Connect"** → **"Drivers"** → copy the connection string
4. It looks like:
   ```
   mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/krishiledger
   ```
5. Replace `<password>` with your actual password — **save this string**

---

### Step 2 — Deploy Backend on Render (Free)

1. Push this whole repo to GitHub
2. Go to **https://render.com** → New → **Web Service**
3. Connect your GitHub repo
4. Settings:
   - **Root Directory:** `backend`
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
5. Add **Environment Variables**:
   | Key | Value |
   |-----|-------|
   | `MONGODB_URI` | your Atlas connection string |
   | `NODE_ENV` | `production` |
   | `FRONTEND_URL` | `https://your-app.vercel.app` (fill after Step 3) |
6. Click **"Create Web Service"** — wait ~2 minutes
7. Note your backend URL: `https://krishiledger-api.onrender.com`

> ℹ️ Free Render services sleep after 15 mins of inactivity. First request after sleep takes ~30s.

---

### Step 3 — Deploy Frontend on Vercel (Free)

1. Go to **https://vercel.com** → New Project → import your GitHub repo
2. Settings:
   - **Root Directory:** `frontend`
   - **Framework Preset:** Vite (auto-detected)
3. Add **Environment Variable**:
   | Key | Value |
   |-----|-------|
   | `VITE_API_URL` | `https://krishiledger-api.onrender.com` |
4. Click **Deploy** — done in ~60 seconds
5. Your app is live at `https://your-app.vercel.app` 🎉

---

### Step 4 — Update CORS on Backend

Go back to Render → Environment Variables → update:
```
FRONTEND_URL = https://your-actual-app.vercel.app
```
Render auto-redeploys. Done!

---

## 💻 Local Development

```bash
# 1. Clone and install dependencies
git clone <your-repo>

# Backend
cd krishiledger/backend
npm install
cp .env.example .env
# Edit .env → paste your MONGODB_URI

npm run dev     # starts on http://localhost:5000

# Frontend (new terminal)
cd krishiledger/frontend
npm install
# No .env needed for local dev — Vite proxies /api → localhost:5000

npm run dev     # starts on http://localhost:3000
```

---

## 🔌 API Reference

All endpoints follow REST conventions:

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/plots` | List all plots |
| POST | `/api/plots` | Create plot |
| GET | `/api/crops` | List all crops |
| POST | `/api/crops` | Create crop |
| PUT | `/api/crops/:id` | Update crop (e.g. stage change) |
| DELETE | `/api/crops/:id` | Delete crop |
| GET | `/api/expenses` | List all expenses |
| POST | `/api/expenses` | Add expense |
| GET | `/api/labour` | List labour logs |
| POST | `/api/labour` | Log labour entry |
| GET | `/api/materials` | List inventory |
| POST | `/api/materials` | Add material |
| GET | `/api/manure` | List manure logs |
| POST | `/api/manure` | Log manure/biofertilizer |
| GET | `/api/yields` | List yield records |
| POST | `/api/yields` | Record harvest yield |
| GET | `/api/health` | Check server + DB status |

---

## 📦 Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18 + Vite |
| Backend | Node.js + Express 4 |
| Database | MongoDB Atlas + Mongoose |
| Frontend Deploy | Vercel (free) |
| Backend Deploy | Render.com (free) |

---

## 🌱 Modules

- **Dashboard** — KPIs, crop performance, plot overview, cost breakdown charts
- **Crop Lifecycle** — Sowing → Growing → Flowering → Harvest → Done tracker
- **Expenses** — Per-crop, per-category (Labour / Inputs / Irrigation / Misc)
- **Labour Logs** — Daily work logs with workers × wage calculation
- **Materials** — Inventory: seeds, fertilizers, tools with total value
- **Manure & Bio** — FYM, Vermicompost, Green Manure, Biofertilizer logs
- **Yield Tracking** — Harvest quantity × sale price = revenue
- **Analytics** — Profit/acre ranking, season comparison, cost breakdown %
