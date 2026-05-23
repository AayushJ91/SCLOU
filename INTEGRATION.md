# SCLOU Frontend-Backend Integration Guide

## Overview
The SCLOU frontend is fully integrated with the FastAPI backend. The system uses a real-time polling mechanism (every 3 seconds by default) to fetch live data from the backend and display it in the dashboard.

## Architecture

### Backend (FastAPI)
- **Host**: `http://localhost:8000` (default)
- **Endpoints**:
  - `GET /zones` - Zone sensor readings (rainfall, FoS, pore pressure, slope movement)
  - `GET /structural` - Structural response data for zones
  - `GET /energy` - Current energy snapshot (solar, wind, grid status)
  - `GET /alerts` - Recent system-generated alerts
  - `POST /simulate` - Manually trigger simulation cycle
- **CORS**: Enabled for all origins

### Frontend (React + Vite)
- **API Hook**: `useSCLOU()` - Centralized data fetching
- **Components**: All display components receive props from the hook
- **Polling**: 3-second refresh interval (configurable)

## Setup Instructions

### 1. Backend Setup
```bash
# Navigate to backend directory
cd back-end/sclou-backend

# Install dependencies
pip install -r requirements.txt

# Run the server
uvicorn main:app --reload
# Server will be available at http://localhost:8000
```

### 2. Frontend Setup
```bash
# Navigate to frontend directory
cd front-end

# Install dependencies (using pnpm)
pnpm install

# Configure API URL (optional)
# Copy .env.example to .env.local and update VITE_API_URL if needed
cp .env.example .env.local

# Start development server
pnpm dev
# Dashboard will be available at http://localhost:5173
```

### 3. Environment Configuration

**Frontend (.env.local)**:
```env
# Backend API URL
VITE_API_URL=http://localhost:8000
```

The API URL is automatically picked up by the `useSCLOU()` hook and used for all API calls.

## Data Flow

```
Backend Simulator (4s cycle)
          ↓
    SQLite Database
          ↓
    FastAPI Endpoints
          ↓
Frontend useSCLOU() Hook (polls every 3s)
          ↓
React Components (OperationsPanelRefined, CorridorMapEnhanced, etc.)
          ↓
Live Dashboard
```

## Component Integration

### App.tsx
```typescript
const { zones, energy, alerts, isLoading, error, refetch, simulate } = useSCLOU();
```

### FoSStatusBlock
- **Props**: `zone` (first zone from zones array)
- **Displays**: Factor of Safety, rainfall data, corridor status

### OperationsPanelRefined
- **Props**: `energy`, `zones`
- **Displays**: Environmental conditions, energy generation, network status

### AlertPanelRefined
- **Props**: `alerts`
- **Displays**: Real-time operational events and alerts (latest 10)

### CorridorMapEnhanced
- **Props**: `zones`
- **Displays**: Interactive map with zone status indicators, FoS values, energy zones

## API Endpoints Reference

### GET /zones
Response:
```json
[
  {
    "id": "Z1",
    "fos": 1.52,
    "rainfall": 18.7,
    "pore_pressure": 47.3,
    "slope_movement": 2.8,
    "status": "stable"
  }
]
```

### GET /structural
Response:
```json
[
  {
    "zone_id": "Z1",
    "anchor_tension": 85.5,
    "reinforcement_status": "operational",
    "stability_state": "stable",
    "risk_index": 0.12
  }
]
```

### GET /energy
Response:
```json
{
  "solar_output": 342.5,
  "wind_output": 128.3,
  "grid_status": "connected",
  "load_distribution": {
    "Z1": 25.0,
    "Z2": 20.0,
    "Z3": 18.0,
    "Z4": 22.0,
    "Z5": 15.0
  }
}
```

### GET /alerts?limit=50&type=WARNING
Response:
```json
[
  {
    "id": 1,
    "zone": "Z4",
    "message": "Rainfall escalation detected",
    "timestamp": "2024-05-23T14:23:18Z",
    "type": "WARNING"
  }
]
```

### POST /simulate
Response:
```json
{
  "status": "success",
  "cycle": 42,
  "alerts_generated": 2,
  "zones_updated": ["Z1", "Z4"]
}
```

## Debugging Tips

### Check Backend Connection
```bash
# Test if backend is running
curl http://localhost:8000/

# Check zones endpoint
curl http://localhost:8000/zones
```

### Frontend Logs
The hook logs errors to console:
```javascript
console.error("SCLOU API error:", message)
```

### Hook State
The `useSCLOU()` hook provides:
- `zones` - Array of zone readings
- `structural` - Array of structural response data
- `energy` - Current energy snapshot
- `alerts` - Array of recent alerts
- `isLoading` - Loading state
- `error` - Error message if API fails
- `refetch()` - Manual refresh function
- `simulate()` - Trigger manual simulation cycle

## Troubleshooting

### "API error: Connect ECONNREFUSED"
- **Cause**: Backend is not running
- **Fix**: Start backend with `uvicorn main:app --reload`

### "Loading SCLOU System..."
- **Cause**: API is taking too long to respond
- **Fix**: Check backend is responding with `curl http://localhost:8000/zones`

### CORS errors
- **Cause**: Backend CORS not configured correctly
- **Fix**: Check main.py has `CORSMiddleware` configured with `allow_origins=["*"]`

### Data not updating
- **Cause**: Polling may be disabled or API is returning no data
- **Fix**: Check browser console for errors, ensure backend simulator is running

## Performance

- **Polling Interval**: 3 seconds (configurable in `config/api.ts`)
- **Concurrent Requests**: 4 simultaneous API calls per poll cycle
- **Data Retention**: Alerts are pruned to 200 most recent
- **Simulator Cycle**: 4 seconds between data generation

## Next Steps

1. **Customize Polling**: Edit `POLLING_INTERVAL` in `src/config/api.ts`
2. **Add New Endpoints**: Update `useSCLOU()` hook to fetch additional data
3. **Deploy**: Update `VITE_API_URL` in production `.env` to point to deployed backend
4. **Monitoring**: Add error tracking and logging service (e.g., Sentry)
