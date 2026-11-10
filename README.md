# Health API

A minimal Express service with liveness and readiness endpoints.

## Run

```sh
npm install
npm start
```

The server listens on port `3000` by default. Set `PORT` to use another port.

## Endpoints

- `GET /health` — returns service status, an ISO timestamp, and process uptime.
- `GET /ready` — returns readiness status for load balancers and deployment checks.

Both successful responses use HTTP `200` and JSON. Unknown paths return HTTP `404` with a JSON error.
