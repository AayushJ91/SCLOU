# SCLOU — Smart Corridor Logic Unit

Demo-ready corridor operations dashboard: synthetic sensor simulation, stability logic, energy routing, and a React operations UI for the Mumbai–Nagpur Expressway corridor (zones Z1–Z10).

## Stack

| Layer | Tech |
|-------|------|
| Backend | FastAPI, SQLite, background simulator |
| Frontend | React 18, Vite, Tailwind CSS 4 |

## Quick start

### Backend

```bash
cd back-end/sclou-backend
python -m venv .venv
# Windows: .venv\Scripts\activate
# macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

API docs: [http://localhost:8000/docs](http://localhost:8000/docs)

The SQLite database (`sclou.db`) is created automatically on first run.

### Frontend

```bash
cd front-end
cp .env.example .env.local   # optional — defaults to http://localhost:8000
pnpm install
pnpm dev
```

Dashboard: [http://localhost:5173](http://localhost:5173)

Use `npm install` / `npm run dev` if you prefer npm over pnpm.

## Project layout

```
SCLOU/
├── back-end/sclou-backend/   # Canonical API (use this)
│   ├── main.py
│   ├── logic.py
│   ├── simulator.py
│   ├── database.py
│   └── requirements.txt
├── front-end/                # React dashboard
│   └── src/
├── INTEGRATION.md            # API & polling details
└── README.md
```

## Main API endpoints

- `GET /zones` — zone sensor readings
- `GET /structural` — structural response per zone
- `GET /energy` — solar, wind, grid, load distribution
- `GET /alerts` — recent alerts
- `POST /simulate` — trigger one simulation cycle

See [INTEGRATION.md](./INTEGRATION.md) for full integration notes.

## Environment variables

| Variable | Default | Where |
|----------|---------|--------|
| `SCLOU_DB` | `sclou.db` | Backend |
| `VITE_API_URL` | `http://localhost:8000` | Frontend (`.env.local`) |

## License

Add your license here before public release if required.
