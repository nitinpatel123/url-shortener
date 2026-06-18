# ✂️ URL Shortener

Full app in a single file — backend + frontend + persistent storage!

## 🚀 Run Locally

```bash
npm install
npm start
# Open http://localhost:3000
# Data saved in ./data/urls.json
```

## ☁️ Deploy on Railway (Free) + Persistent Storage

### Step 1 — Push to GitHub
```bash
git init
git add .
git commit -m "first commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/url-shortener.git
git push -u origin main
```

### Step 2 — Deploy on Railway
1. Go to **railway.app** → login with GitHub
2. **New Project** → **Deploy from GitHub repo** → select your repo
3. Click **"Generate Domain"** → your app is live!

### Step 3 — Add Volume (so data never deletes)
1. In Railway dashboard → click your project
2. **"Add a service"** → **"Volume"**
3. Set **Mount Path** → `/data`
4. Done! ✅ Data will now persist across restarts

## ✨ Features
- Long URL → 6 character short code
- Data saved to JSON file (survives restarts with Railway Volume)
- Visit counter
- History with visit count
- Entire app in one file!
