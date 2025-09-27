# Shrine Backend (Flask)

## Run locally
```bash
python -m venv venv
venv\Scripts\activate  # on Windows
pip install -r requirements.txt
python flask_backend.py
```

## Deploy on Render
1. Push this folder to GitHub.
2. Create a new Web Service on Render.
3. Build Command: `pip install -r requirements.txt`
4. Start Command: `gunicorn flask_backend:app --bind 0.0.0.0:$PORT`
