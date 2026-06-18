const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Railway Volume pe save hoga, warna local folder mein
const DATA_DIR = process.env.RAILWAY_VOLUME_MOUNT_PATH || './data';
const DATA_FILE = path.join(DATA_DIR, 'urls.json');

app.use(express.json());

// ── Data Load/Save ────────────────────────────────────────

const loadData = () => {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    if (!fs.existsSync(DATA_FILE)) return new Map();
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    return new Map(JSON.parse(raw));
  } catch {
    return new Map();
  }
};

const saveData = (urls) => {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(DATA_FILE, JSON.stringify([...urls.entries()]));
  } catch (err) {
    console.error('Save error:', err.message);
  }
};

// URLs load karo startup pe
let urls = loadData();
console.log(`✅ Loaded ${urls.size} URLs from storage`);

// ── Generate short code ───────────────────────────────────
const generateCode = () => Math.random().toString(36).slice(2, 8);

// ── API ──────────────────────────────────────────────────

// Shorten a URL
app.post('/api/shorten', (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'Please enter a URL' });

  try { new URL(url); } catch {
    return res.status(400).json({ error: 'Please enter a valid URL (include https://)' });
  }

  // Return existing code if URL already shortened
  for (const [code, data] of urls.entries()) {
    if (data.original === url) {
      return res.json({ short: `${req.protocol}://${req.get('host')}/${code}`, code, visits: data.visits });
    }
  }

  const code = generateCode();
  urls.set(code, { original: url, visits: 0, createdAt: new Date().toISOString() });
  saveData(urls);

  res.json({ short: `${req.protocol}://${req.get('host')}/${code}`, code, visits: 0 });
});

// Get all URLs with stats
app.get('/api/stats', (_req, res) => {
  const all = [...urls.entries()].map(([code, data]) => ({
    code, ...data, short: `${_req.protocol}://${_req.get('host')}/${code}`
  }));
  res.json(all.reverse());
});

// Redirect to original URL
app.get('/:code', (req, res) => {
  const data = urls.get(req.params.code);
  if (!data) return res.redirect('/?error=not_found');
  data.visits++;
  saveData(urls);
  res.redirect(data.original);
});

// ── Frontend ─────────────────────────────────────────────
app.get('/', (_req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>✂️ URL Shortener</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --bg: #0f1117; --card: #1a1d27; --border: rgba(255,255,255,.08);
      --accent: #6c63ff; --text: #e8eaf6; --muted: #9fa8c7; --success: #4caf78; --error: #ff6b6b;
    }
    body { background: var(--bg); color: var(--text); font-family: 'Inter', sans-serif; min-height: 100vh; display: flex; flex-direction: column; align-items: center; padding: 40px 16px; }
    h1 { font-size: 32px; margin-bottom: 6px; }
    .sub { color: var(--muted); margin-bottom: 36px; font-size: 14px; }
    .card { background: var(--card); border: 1px solid var(--border); border-radius: 16px; padding: 28px; width: 100%; max-width: 560px; }
    .input-row { display: flex; gap: 10px; }
    input { flex: 1; background: var(--bg); border: 1px solid var(--border); color: var(--text); padding: 12px 16px; border-radius: 10px; font-size: 14px; outline: none; transition: border .2s; }
    input:focus { border-color: var(--accent); }
    input::placeholder { color: var(--muted); }
    button { background: var(--accent); color: #fff; border: none; padding: 12px 22px; border-radius: 10px; font-size: 14px; font-weight: 600; cursor: pointer; transition: opacity .2s; white-space: nowrap; }
    button:hover { opacity: .85; }
    button:disabled { opacity: .4; cursor: not-allowed; }
    .result { margin-top: 20px; background: var(--bg); border: 1px solid var(--border); border-radius: 10px; padding: 16px; display: none; }
    .result.show { display: block; }
    .result-label { font-size: 11px; color: var(--muted); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; }
    .result-row { display: flex; align-items: center; gap: 10px; }
    .short-url { color: var(--accent); font-size: 18px; font-weight: 700; text-decoration: none; flex: 1; }
    .short-url:hover { text-decoration: underline; }
    .copy-btn { background: var(--card); color: var(--text); border: 1px solid var(--border); padding: 8px 14px; border-radius: 8px; font-size: 13px; }
    .copy-btn:hover { background: var(--accent); border-color: var(--accent); color: #fff; opacity: 1; }
    .msg { margin-top: 10px; font-size: 13px; }
    .msg.error { color: var(--error); }
    .msg.success { color: var(--success); }
    .history { margin-top: 32px; width: 100%; max-width: 560px; }
    .history h2 { font-size: 14px; color: var(--muted); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px; }
    .history-list { display: flex; flex-direction: column; gap: 8px; }
    .history-item { background: var(--card); border: 1px solid var(--border); border-radius: 10px; padding: 14px 16px; display: flex; align-items: center; gap: 12px; }
    .history-item .short { color: var(--accent); font-weight: 700; font-size: 15px; text-decoration: none; min-width: 110px; }
    .history-item .original { color: var(--muted); font-size: 12px; flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .badge { background: rgba(108,99,255,.15); color: var(--accent); font-size: 11px; font-weight: 700; padding: 3px 8px; border-radius: 99px; white-space: nowrap; }
    .empty { color: var(--muted); font-size: 13px; text-align: center; padding: 20px; }
  </style>
</head>
<body>
  <h1>✂️ URL Shortener</h1>
  <p class="sub">Shorten long URLs — instantly</p>

  <div class="card">
    <div class="input-row">
      <input id="urlInput" type="url" placeholder="https://very-long-url.com/that/you/want/to/shorten" />
      <button id="shortenBtn" onclick="shorten()">Shorten ✂️</button>
    </div>
    <div id="msg" class="msg"></div>
    <div id="result" class="result">
      <div class="result-label">Your short URL 👇</div>
      <div class="result-row">
        <a id="shortLink" class="short-url" target="_blank" href="#"></a>
        <button class="copy-btn" onclick="copyUrl()">📋 Copy</button>
      </div>
    </div>
  </div>

  <div class="history">
    <h2>📊 History</h2>
    <div class="history-list" id="historyList"></div>
  </div>

  <script>
    const urlInput = document.getElementById('urlInput');
    const btn = document.getElementById('shortenBtn');
    const msg = document.getElementById('msg');
    const result = document.getElementById('result');
    const shortLink = document.getElementById('shortLink');

    urlInput.addEventListener('keydown', e => { if (e.key === 'Enter') shorten(); });

    async function shorten() {
      const url = urlInput.value.trim();
      if (!url) { showMsg('Please enter a URL first!', 'error'); return; }

      btn.disabled = true;
      btn.textContent = '⏳ Loading...';
      msg.className = 'msg'; msg.textContent = '';

      try {
        const res = await fetch('/api/shorten', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url })
        });
        const data = await res.json();
        if (!res.ok) { showMsg(data.error, 'error'); return; }

        shortLink.href = data.short;
        shortLink.textContent = data.short;
        result.classList.add('show');
        showMsg('✅ URL shortened successfully!', 'success');
        urlInput.value = '';
        loadHistory();
      } catch {
        showMsg('Something went wrong. Please try again.', 'error');
      } finally {
        btn.disabled = false; btn.textContent = 'Shorten ✂️';
      }
    }

    function copyUrl() {
      navigator.clipboard.writeText(shortLink.href);
      showMsg('📋 Copied to clipboard!', 'success');
    }

    function showMsg(text, type) {
      msg.textContent = text;
      msg.className = 'msg ' + type;
    }

    async function loadHistory() {
      const res = await fetch('/api/stats');
      const data = await res.json();
      const list = document.getElementById('historyList');
      if (data.length === 0) {
        list.innerHTML = '<div class="empty">No URLs shortened yet</div>';
        return;
      }
      list.innerHTML = data.map(item => \`
        <div class="history-item">
          <a class="short" href="\${item.short}" target="_blank">/\${item.code}</a>
          <span class="original" title="\${item.original}">\${item.original}</span>
          <span class="badge">👁 \${item.visits} visits</span>
        </div>
      \`).join('');
    }

    const params = new URLSearchParams(location.search);
    if (params.get('error') === 'not_found') showMsg('❌ URL not found!', 'error');

    loadHistory();
  </script>
</body>
</html>`);
});

app.listen(PORT, () => console.log(`✅ Server running at http://localhost:${PORT}`));
