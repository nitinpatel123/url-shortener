# ✂️ URL Shortener

A fast and minimal URL shortener built with Node.js. Shorten long URLs instantly and track visit counts.

![Node.js](https://img.shields.io/badge/Node.js-18+-green) ![Express](https://img.shields.io/badge/Express-4.x-blue) ![License](https://img.shields.io/badge/License-MIT-yellow)

## ✨ Features

- 🔗 Shorten any long URL into a 6-character code
- 📊 Track visit count for each short URL
- 💾 Persistent storage using JSON file
- 🔁 Same URL always returns the same short code
- 📋 One-click copy to clipboard
- 📱 Responsive UI — works on mobile too

## 🛠 Tech Stack

- **Backend** — Node.js, Express
- **Frontend** — HTML, CSS, Vanilla JS (single file)
- **Storage** — JSON file (persistent with Railway Volume)

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- npm

### Installation

```bash
# Clone the repo
git clone https://github.com/YOUR_USERNAME/url-shortener.git

# Go into the folder
cd url-shortener

# Install dependencies
npm install

# Start the server
npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## ☁️ Deployment (Railway)

1. Push code to GitHub
2. Go to [railway.app](https://railway.app) → **New Project** → **Deploy from GitHub**
3. Select your repo → click **Generate Domain**
4. Add a **Volume** with mount path `/data` for persistent storage

