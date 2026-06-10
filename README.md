# Dimensional Todo: Decoupled 3D Productivity App

A high-performance, decoupled personal productivity application featuring a 3D Task Dashboard (React Three Fiber), a weekly Habits Grid tracker, performance analytics (Recharts), and secure, real-time push notifications powered by `ntfy.sh`.

---

## Technical Stack
* **Backend:** Django 4.2, Django REST Framework, Simple JWT, Celery (with Redis), Whitenoise, SQLite (local) / PostgreSQL (production auto-switching).
* **Frontend:** React 18 (Vite), Zustand, Tailwind CSS, Recharts, Three.js (@react-three/fiber, @react-three/drei).
* **Notification Layer:** ntfy.sh (HTTP POST-based push reminders).

---

## Local Startup Instructions

### Prerequisites
* Python 3.10+
* Node.js v20+
* Redis (optional, only needed for automated hourly Celery reminders)

### 1. Run the Django Backend
Navigate to the root directory, activate the virtual environment, and boot up the Django API server:
```powershell
# 1. Activate Virtual Environment
.venv\Scripts\activate

# 2. Run database migrations
python backend/manage.py migrate

# 3. Start the local server
python backend/manage.py runserver
```
The Django REST API runs locally at `http://127.0.0.1:8000/`.

To boot up the Celery background worker (use `-P solo` on Windows):
```powershell
celery -A config worker --beat -l info -P solo
```

### 2. Run the React Frontend
Navigate to the `frontend/` directory and start Vite:
```powershell
cd frontend
npm run dev
```
The client app runs locally at `http://localhost:5173/`.

---

## Cloud Hosting Setup Instructions

To deploy this app to the cloud for free so you can use it on your phone anywhere:

### 1. Set up your Database (Neon or Supabase)
1. Go to [Neon.tech](https://neon.tech) or [Supabase.com](https://supabase.com) and create a free account.
2. Create a new project.
3. Copy the **Connection String** or **Database URL** (e.g. `postgresql://user:password@host/dbname`).

### 2. Deploy Backend to Render (Free)
1. Sign up on [Render.com](https://render.com) and connect your GitHub account.
2. Click **New +** and select **Web Service**.
3. Choose your repository `to-do-app`.
4. Configure:
   * **Name:** `to-do-api`
   * **Region:** Select closest to you
   * **Branch:** `main`
   * **Root Directory:** `backend` (Ensure this is set so Render only builds the backend folder!)
   * **Runtime:** `Python`
   * **Build Command:** `pip install -r requirements.txt && python manage.py collectstatic --no-input`
   * **Start Command:** `gunicorn config.wsgi:application`
5. Click **Advanced** and add these **Environment Variables**:
   * `DATABASE_URL` = (Paste your PostgreSQL Connection String from Step 1)
   * `DJANGO_DEBUG` = `False`
   * `DJANGO_SECRET_KEY` = (A random secret string)
6. Click **Deploy Web Service**. Render will build and provide a public URL (e.g., `https://to-do-api-xyz.onrender.com`).

### 3. Deploy Frontend to Vercel (Free)
1. Sign up on [Vercel.com](https://vercel.com) and link your GitHub.
2. Click **Add New** -> **Project**.
3. Select your repository `to-do-app`.
4. Configure:
   * **Framework Preset:** `Vite`
   * **Root Directory:** `frontend` (Ensure this is set so Vercel builds the React folder!)
   * **Environment Variables:** Add `VITE_API_URL` and set its value to your Render URL + `/api` (e.g. `https://to-do-api-xyz.onrender.com/api`).
5. Click **Deploy**. Vercel will build your React code and provide your phone-ready production link!
