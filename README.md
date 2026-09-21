# AdPulse

AdPulse is a small marketing ROI and budget optimization prototype. The browser UI is backed by a deterministic FastAPI analytics service so the numbers are calculated rather than hard-coded when the app is run locally.

## Run locally

```powershell
python -m pip install -r requirements.txt
python -m uvicorn app:app --host 127.0.0.1 --port 8000 --reload
```

Open <http://127.0.0.1:8000> after starting the server. FastAPI serves the API only; for the current static page, open `index.html` directly or use a simple static server such as `python -m http.server 5500` in a second terminal.

## Run the Streamlit version

```powershell
python -m pip install -r requirements.txt
python -m streamlit run streamlit_app.py
```

Streamlit opens at <http://localhost:8501>. It includes the overview, channel mix, funnel, budget simulator, campaign intelligence, and AI analyst views using the same Python calculations as the FastAPI app.

## Deploy

- **Streamlit Community Cloud:** push this folder to GitHub, choose `streamlit_app.py` as the main file, and use `requirements.txt`. Do not choose `app.py`: that file is the FastAPI API and will produce a Streamlit health-check 404.
- **Render:** use the included `render.yaml` blueprint. It runs `streamlit_app.py`, binds to Render's `$PORT`, and checks `/_stcore/health`.
- **Railway:** create a Python service from this repo and use the `Procfile` command for a Streamlit web service.

### Deploy on Render

1. Open <https://dashboard.render.com> and choose **New + → Blueprint**.
2. Connect `bhumika552/ADplus` and select the `master` branch.
3. Render reads `render.yaml` and creates the `adpulse` web service.
4. After the first deploy, open the generated `onrender.com` URL.

### Streamlit Cloud 404 fix

In the Streamlit deployment settings, set **Main file path** to:

```text
streamlit_app.py
```

Then redeploy or reboot the app. The log should reference `streamlit_app.py`, not `app.py`.

## API surface

- `GET /api/health` checks that the service is alive.
- `GET /api/summary` returns calculated totals and channel-level metrics.
- `GET /api/campaigns?limit=20` generates deterministic campaign rows.
- `GET /api/trend` returns a reproducible 31-day spend/revenue series.
- `POST /api/simulate` estimates revenue, profit, ROAS, CAC, and customers for a budget allocation.

Example simulation body:

```json
{
  "budget": 1000000,
  "allocation": {
    "Google Ads": 350000,
    "Meta Ads": 250000,
    "YouTube": 300000,
    "LinkedIn": 100000
  }
}
```

All simulation outputs are explicitly labeled model estimates. The engine uses historical channel ROAS and conversion assumptions; it is a portfolio-demo decision-support model, not a guarantee of future performance.