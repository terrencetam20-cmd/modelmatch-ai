# ModelMatch AI

Personalized AI model recommender with an MVP Arena Lite workflow for model comparison.

ModelMatch AI helps users match AI models to concrete tasks. This MVP includes task intake, a smart questionnaire, a static model database, weighted recommendation scoring, deterministic side-by-side comparison drafts, rubric evaluation, local preference voting, and JSON export.

## MVP Features

- Task and constraints questionnaire
- Static model database with provider, fit, cost, latency, and risk signals
- Weighted recommendation engine
- Arena Lite side-by-side comparison
- Rubric scoring and local decision log
- Preference voting stored in browser local storage
- JSON export for saved evaluation runs

## Production Path

The current MVP is intentionally static so it can be deployed immediately. The next production step is to connect Arena Lite to live provider APIs such as OpenRouter and persist evaluations in a database.

## Run Locally

Open `index.html` in a browser, or serve the folder with any static server.

## Deploy

This project is static and can be deployed directly to Vercel.
