# Industrial Sensor Monitoring (Laravel)

Industrial sensor monitoring app built with Laravel 11, Octane (Swoole), Inertia, and Vue 3.

## Stack

- Backend: Laravel 11 + Octane Swoole
- Frontend: Inertia + Vue 3 + Vite + Tailwind
- Database: PostgreSQL/TimescaleDB
- Runtime: Docker Compose

## Run Locally

```bash
docker compose up -d --build
```

Open:

- App: http://localhost:8080
- Health: http://localhost:8080/api/health
- Direct Octane: http://localhost:8000
- Realtime WebSocket: ws://localhost:8081

## Test

```bash
docker compose exec app php artisan test
```

## Main Endpoints

- `GET /api/health`
- `GET /api/sensor`
- `GET /api/sensor/{id}`
- `GET /api/sensor/{id}/measurements?range=1h|6h|24h|7d`
- `POST /api/sensor/{id}/update-spec`
- `GET /api/export`
- `POST /api/scada/measurements` (HMAC auth)
- `POST /api/scada/measurements/batch` (HMAC auth)

## Notes

- UI is implemented with Inertia + Vue component structure, no CDN frontend.
- Styling follows the reference project (`industrial-sensor-monitoring`) layout.

## SCADA HMAC Simulation (PowerShell)

Default credentials:

- `device_id`: `plant01`
- `api_key`: `plant01`
- `secret_key`: `super-secret-random`

Run:

```powershell
pwsh ./scripts/scada-sim.ps1 -SensorId 1 -Value 28.4
```

Script uses `curl.exe` (not `Invoke-RestMethod`) to avoid Windows proxy auto-detect delays.

The script sends signed payload to `POST /api/scada/measurements` with headers:

- `X-API-Key`
- `X-Device-Id`
- `X-Timestamp` (Unix seconds)
- `X-Signature` (`HMAC_SHA256(payload + timestamp, secret_key)`)
