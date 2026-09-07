# Setup Guide — Nirikshan

> AI-Powered Predictive Infrastructure Monitoring System  
> SIH 2026 · Problem Statement 26103

---

## ☁️ Option A — Use the Live Deployment (Recommended for Judges)

| Service | URL |
|---------|-----|
| **Frontend** | https://nirikshan103.vercel.app |
| **Backend API** | https://sih103.onrender.com |

No setup needed. Visit the frontend URL and the dashboard will load immediately.

> **Note:** The Render free tier spins down after 15 min of inactivity. First request may take ~30 seconds to wake up. Subsequent requests are instant.

---

## 🖥️ Option B — Local Development

### Prerequisites
- Python 3.11+
- Node.js 18+
- Git

### 1. Clone the repo
```bash
git clone https://github.com/Adi3595/SIH103.git
cd SIH103
```

### 2. Backend Setup
```bash
cd backend

# Create virtual environment
python -m venv venv
.\venv\Scripts\activate    # Windows
# source venv/bin/activate  # Linux/macOS

# Install dependencies
pip install -r requirements.txt

# Create environment file
# Option 1: SQLite (simplest, no external DB needed)
echo DATABASE_URL=sqlite:///./sih26103.db > .env
echo GEMINI_API_KEY=your_key_here >> .env

# Option 2: Supabase PostgreSQL
echo DATABASE_URL=postgresql://user:pass@host:5432/db > .env
echo GEMINI_API_KEY=your_key_here >> .env

# Start the server
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

> Tables are **auto-created on first startup**. No migrations needed.

### 3. Load Sample Data (Optional)
```bash
# If you have the synthetic dataset
python app/scripts/load_synthetic_data.py
```

Or use the **Data Ingestion** page in the UI to upload CSVs directly.

### 4. Frontend Setup
```bash
cd ../frontend

# Install dependencies
npm install

# Create environment file
echo VITE_API_URL=http://127.0.0.1:8000 > .env

# Start the dev server
npm run dev
```

> App runs at `http://localhost:5173`

---

## ☁️ Option C — Production Deployment

### Backend on Render

1. Go to [Render.com](https://render.com) → **New +** → **Web Service**
2. Connect your GitHub repository
3. Fill in settings:
   - **Root Directory**: `backend`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `bash render-start.sh` (or `uvicorn app.main:app --host 0.0.0.0 --port $PORT`)
4. Add Environment Variables:
   ```
   DATABASE_URL   = postgresql://...your-supabase-url...
   GEMINI_API_KEY = your_key
   PYTHON_VERSION = 3.11.0
   ```
5. Click **Create Web Service**

### Database on Supabase

1. Create a free project at [supabase.com](https://supabase.com)
2. Go to **Settings → Database → Connection String (URI)**
3. Use this as your `DATABASE_URL` on Render
4. Tables are auto-created on first startup — no SQL needed!

### Frontend on Vercel

1. Go to [Vercel.com](https://vercel.com) → **Add New → Project**
2. Import your GitHub repository
3. Set **Root Directory** to `frontend`
4. Framework will auto-detect as **Vite**
5. Click **Deploy** — no environment variables needed (baked into `.env.production`)

---

## 🔑 Getting a Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Click **Create API Key**
3. Copy the key and set it as `GEMINI_API_KEY` in your `.env` / Render env vars

> The system uses **Gemini 2.0 Flash** for AI-powered prescriptions on the Project Dossier page.

---

## 📊 Data Ingestion

After the app is running, navigate to **Data Ingestion** in the sidebar. Upload the following CSV files:

| File | Description |
|------|-------------|
| `projects.csv` | Project master data (name, state, sector, budget, dates) |
| `project_snapshots.csv` | Periodic health snapshots (the ML fingerprint source) |
| `issues.csv` | Flagged project issues |

The system accepts multiple files at once and processes them in parallel.
