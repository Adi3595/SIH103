# PAIMANA Setup Guide

## Prerequisites

- **Python**: 3.11 or later
- **Node.js**: v18 or later
- **npm** or **yarn**

---

## 1. Backend Setup (FastAPI & ML Engine)

1. **Navigate to the backend directory**
   ```bash
   cd backend
   ```

2. **Create a virtual environment**
   ```bash
   # Windows
   python -m venv venv
   .\venv\Scripts\activate

   # Linux/macOS
   python3 -m venv venv
   source venv/bin/activate
   ```

3. **Install dependencies**
   ```bash
   pip install fastapi uvicorn sqlalchemy alembic scikit-learn pandas numpy requests python-dotenv pydantic
   ```

4. **Environment Variables**
   Copy `.env.example` to `.env` and add your **Gemini API Key** (required for the Layer 04C Prescriptive AI).
   ```bash
   cp .env.example .env
   ```

5. **Run the Database Migrations** (if required)
   *(Note: The SQLite database `sih26103.db` is already included with 750 synthetic projects and 18,000 feature snapshots).*
   ```bash
   alembic upgrade head
   ```

6. **Start the API Server**
   ```bash
   uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
   ```
   > The API will run at `http://127.0.0.1:8000`. You can view the Swagger UI at `http://127.0.0.1:8000/docs`.

---

## 2. Frontend Setup (React & Vite)

1. **Navigate to the frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Start the Development Server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```
   > The UI will be available at `http://localhost:5173`.

---

## 3. Retraining the ML Models (Optional)

The backend comes pre-packaged with trained `.pkl` models for the 4 ML classifiers. If you modify the synthetic dataset or add new features, you must retrain the models:

1. Ensure your virtual environment is activated in the `backend` folder.
2. Run the training script:
   ```bash
   python train_models.py
   ```
3. The script will output metrics (accuracy, precision, recall) and save the `.pkl` files to `app/ml/models/`. Restart the Uvicorn server to load the new models.
