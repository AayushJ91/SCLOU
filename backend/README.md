# SCLOU Backend — Smart Corridor Logic Unit

A demo-ready FastAPI backend that simulates corridor sensor intelligence,
runs SCLOU evaluation logic, and exposes REST APIs for a React dashboard.

---

## Folder Structure

```
sclou-backend/
├── main.py           # FastAPI app + all endpoints
├── database.py       # SQLite schema + connection
├── logic.py          # SCLOU evaluation engine
├── simulator.py      # Background synthetic data generator
├── models.py         # Pydantic response types
├── requirements.txt
├── sclou.db          # created automatically on first run
└── frontend/
    ├── hooks/
    │   └── useSCLOU.ts          # React data hook (auto-refresh)
    └── components/
        └── SCLOUDashboard.tsx   # Drop-in dashboard example
```

---

## Quickstart

```bash
# 1. Install dependencies
pip install -r requirements.txt

# 2. Start the server
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# 3. Open the interactive docs
open http://localhost:8000/docs
```

The simulator starts automatically in a background thread and updates the
database every 4 seconds.

---

## API Reference

| Method | Path           | Description                              |
|--------|----------------|------------------------------------------|
| GET    | `/`            | System info                              |
| GET    | `/zones`       | Sensor readings for all zones (Z1–Z5)   |
| GET    | `/structural`  | Structural response per zone             |
| GET    | `/energy`      | Energy snapshot (solar, wind, grid)      |
| GET    | `/alerts`      | Recent alerts (newest first)             |
| POST   | `/simulate`    | Manually trigger one data cycle          |

### Query parameters
- `GET /alerts?limit=50` — max 200
- `GET /alerts?type=CRITICAL` — filter by type

---

## SCLOU Logic Rules

```
IF   rainfall > 25 mm/hr
AND  FoS      < 1.3
THEN
  → increase anchor tension (scaled by risk index)
  → set reinforcement = ACTIVE / ENGAGED
  → generate CRITICAL / WARNING alert
  → redistribute load (higher risk zones carry less)
  → update grid status (STRESSED / BACKUP)
```

Risk index is a weighted composite (0–1):
- FoS contributes 35 %
- Rainfall 25 %
- Pore pressure 20 %
- Slope movement 20 %

---

## React Integration

### 1. Copy the frontend files
```
src/
  hooks/useSCLOU.ts
  components/SCLOUDashboard.tsx
```

### 2. Set the API base URL
In your `.env`:
```
VITE_SCLOU_API=http://localhost:8000
```

### 3. Use the hook anywhere
```tsx
import { useSCLOU } from "@/hooks/useSCLOU";

function MyWidget() {
  const { zones, energy, alerts, loading } = useSCLOU();
  // data auto-refreshes every 4 s — no extra setup needed
}
```

### 4. Or drop in the full dashboard
```tsx
import SCLOUDashboard from "@/components/SCLOUDashboard";

export default function App() {
  return <SCLOUDashboard />;
}
```

---

## Environment Variables

| Variable      | Default                  | Description           |
|---------------|--------------------------|-----------------------|
| `SCLOU_DB`    | `sclou.db`               | SQLite file path      |
| `VITE_SCLOU_API` | `http://localhost:8000` | API base URL (React) |

---

## Extending

- **Add a new zone** → insert a row in `zones` and `structural_response`.
- **Change thresholds** → edit the constants at the top of `logic.py`.
- **Change poll rate** → change `INTERVAL` in `simulator.py` and `POLL_MS` in
  `useSCLOU.ts`.
- **WebSockets** → replace `setInterval` in the hook with a `useWebSocket`
  call; add a `/ws` endpoint in `main.py` using FastAPI's native WS support.
