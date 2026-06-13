# Bank Statement Analyzer

A small full-stack app to extract and categorize transactions from bank/credit-card statement PDFs.

Features
- Upload PDF statements to the FastAPI backend for heuristic parsing (pdfplumber + regex).
- Auto-detect transaction date, description, amount, inferred type (income/expense) and category.
- SPA frontend (React + Vite + Recharts) for visualization and review.

Quickstart

Prerequisites
- Python 3.10+ and pip
- Node.js 18+ and npm

Backend (API)
1. cd backend
2. python -m venv venv
3. source venv/bin/activate  # on macOS/Linux
   venv\Scripts\activate   # on Windows (PowerShell)
4. pip install -r requirements.txt
5. uvicorn main:app --reload --host 0.0.0.0 --port 8000

The API exposes POST /api/upload which accepts a multipart file field named `file` and returns JSON:
{ status, data: [transactions], card_type, currency_symbol }

Frontend (development)
1. cd frontend-app
2. npm install
3. npm run dev

Open the dev server (Vite) URL printed in the terminal (usually http://localhost:5173) and use the UI to upload statements.

Example curl (upload a PDF)
curl -X POST "http://localhost:8000/api/upload" -F "file=@/path/to/statement.pdf"

Project structure
- backend/: FastAPI service that parses PDFs
- frontend-app/: React + Vite application
- run.sh: convenience script

Notes & Limitations
- Parsing uses heuristics and pdf text extraction; not all bank statement formats parse perfectly.
- Amount & sign detection attempts to handle CR/DR, parentheses and varied separators but may need tuning for some locales.
- Categories are guessed by simple keyword rules; replace/extend guess_category in backend/main.py for better classification.

Contributing
- Bug reports and PRs welcome. Keep changes focused and run the backend and frontend locally to verify.

License
- MIT

Maintainer
- @TauqeerAhmad5201
