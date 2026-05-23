# Industry Newsletter Generator

An AI-powered web app that fetches the latest news from Indian industry sources, generates AI summaries for each article, lets you pick the articles you want, and produces a professionally formatted newsletter you can download as a PDF.

**Supported topics:** Tea · Coffee · QSR · Meat · Dairy · Spices

---

## How It Works

```
User picks topic + date range
        ↓
Backend calls NewsAPI  →  returns up to 20 articles
        ↓
Backend calls Claude   →  generates a 3-4 sentence summary for every article
        ↓
User reviews cards and checks the ones they want
        ↓
Backend calls Claude   →  writes a full formatted newsletter in HTML
        ↓
User reads it on screen and downloads it as a PDF
```

---

## Prerequisites

- **Node.js v18 or later** — download from https://nodejs.org  
  (check with `node --version` in your terminal)
- **npm** — comes bundled with Node.js
- A **NewsAPI key** (free) — sign up at https://newsapi.org/register
- An **Anthropic API key** — get one at https://console.anthropic.com/

---

## Setup (one-time)

### 1. Get the project files

If you downloaded a zip, unzip it. If you cloned a repo, `cd` into the project folder:

```bash
cd industry-newsletter
```

### 2. Add your API keys

Copy the example env file:

```bash
# On Windows (PowerShell)
Copy-Item backend\.env.example backend\.env

# On Mac / Linux
cp backend/.env.example backend/.env
```

Open `backend/.env` in any text editor and replace the placeholder values:

```
NEWS_API_KEY=paste_your_newsapi_key_here
ANTHROPIC_API_KEY=paste_your_anthropic_key_here
PORT=5000
```

**Keep this file private — never commit it to git.**

### 3. Install backend dependencies

```bash
cd backend
npm install
cd ..
```

### 4. Install frontend dependencies

```bash
cd frontend
npm install
cd ..
```

---

## Running the App

You need **two terminal windows** open at the same time.

### Terminal 1 — Start the backend

```bash
cd industry-newsletter/backend
npm run dev
```

You should see:
```
Server running → http://localhost:5000
```

### Terminal 2 — Start the frontend

```bash
cd industry-newsletter/frontend
npm run dev
```

You should see:
```
  VITE  ready in ...ms
  ➜  Local:   http://localhost:3000/
```

Open **http://localhost:3000** in your browser.

---

## Using the App

1. **Select a topic** from the dropdown (e.g. "Dairy")
2. **Choose a date range** — pick a "From" and "To" date (within the last 30 days)
3. Click **"Fetch Articles"** — this may take 15–30 seconds while Claude summarises each article
4. **Review the article cards** — each shows the title, source, date, and an AI summary
5. **Check the articles** you want in the newsletter (click a card to select/deselect it)
6. Click **"Generate Newsletter"** — this may take 20–40 seconds
7. The finished newsletter appears below — click **"Download PDF"** to save it

---

## Project Structure

```
industry-newsletter/
│
├── README.md                    ← you are here
├── .gitignore
│
├── backend/
│   ├── package.json             ← Node.js dependencies
│   ├── .env.example             ← copy this to .env and add your keys
│   ├── server.js                ← Express app entry point
│   └── routes/
│       ├── articles.js          ← NewsAPI fetch + Claude summarisation
│       └── newsletter.js        ← Claude newsletter generation
│
└── frontend/
    ├── package.json             ← React dependencies
    ├── index.html               ← HTML shell
    ├── vite.config.js           ← Vite bundler config + API proxy
    ├── tailwind.config.js       ← Tailwind CSS config
    ├── postcss.config.js        ← PostCSS config
    └── src/
        ├── main.jsx             ← React entry point
        ├── App.jsx              ← Main component (state + layout)
        ├── index.css            ← Tailwind imports + global styles
        └── components/
            ├── Header.jsx           ← Top navigation bar
            ├── ArticleCard.jsx      ← Single article card with checkbox
            ├── NewsletterDisplay.jsx← Newsletter output + PDF download
            └── LoadingSpinner.jsx   ← Animated loading indicator
```

---

## API Keys — Frequently Asked Questions

**Where do I put the keys?**  
Only in `backend/.env`. The frontend never sees your API keys.

**Why is NewsAPI returning 0 articles?**  
- The free NewsAPI plan only lets you query articles from the **past 30 days**.  
- Try a date range within the last week.  
- Some niche topics may have sparse coverage — try "Tea India" or "Dairy India" first.

**Why does summarisation take so long?**  
Claude reads all fetched articles and summarises them in one API call. The time depends on the number of articles and Anthropic's API latency.

**Can I use a different Claude model?**  
Yes — open `backend/routes/articles.js` and `backend/routes/newsletter.js` and change the `model` field. See https://docs.anthropic.com/en/docs/about-claude/models for available models.

---

## Troubleshooting

| Symptom | Fix |
|---|---|
| `Cannot GET /api/health` | Make sure the backend terminal shows "Server running" on port 5000 |
| "Invalid NewsAPI key" error | Double-check the key in `backend/.env` — no extra spaces |
| "Invalid Anthropic API key" error | Same — check `ANTHROPIC_API_KEY` in `backend/.env` |
| PDF downloads as a blank page | Try a shorter newsletter (select fewer articles) |
| Frontend shows a blank page | Open browser devtools (F12) → Console tab and share the error |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS |
| Backend | Node.js, Express |
| News data | NewsAPI (newsapi.org) |
| AI summaries & newsletter | Anthropic Claude (claude-sonnet-4-6) |
| PDF export | jsPDF + html2canvas |
