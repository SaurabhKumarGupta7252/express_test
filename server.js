import express from 'express';

const app = express();
const port = Number(process.env.PORT) || 3000;
const startedAt = Date.now();

// app.disable('x-powered-by');
app.use(express.json());

// Liveness: confirms the process is running. Keep this independent of external services.
app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'health-api',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor((Date.now() - startedAt) / 1000),
  });
});

app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

const server = app.listen(port, () => {
  console.log(`Health API listening on http://localhost:${port}`);
});

function shutdown() {
  server.close(() => process.exit(0));
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
