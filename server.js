import 'dotenv/config';
import express from 'express';
import { sql } from 'drizzle-orm';
import { db, pool } from './src/db/index.js';
import usersRouter from './src/modules/users/users.routes.js';
import imagesRouter from './src/modules/images/images.routes.js';

const app = express();
const port = Number(process.env.PORT) || 3000;
const startedAt = Date.now();

// app.disable('x-powered-by');
app.use(express.json());
app.use('/api/v1/users', usersRouter);
app.use('/api/v1/images', imagesRouter);

// Liveness: confirms the process is running. Keep this independent of external services.
app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'health-api',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor((Date.now() - startedAt) / 1000),
  });
});

app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Hello world'
  })
})

// Readiness includes PostgreSQL so traffic is only routed when the database is reachable.
app.get('/ready', async (_req, res) => {
  try {
    await db.execute(sql`select 1`);
    res.status(200).json({ status: 'ready', database: 'connected' });
  } catch (error) {
    console.error('Database readiness check failed:', error);
    res.status(503).json({ status: 'not_ready', database: 'unavailable' });
  }
});

app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.use((err, _req, res, _next) => {
  if (err.name === 'MulterError') {
    const status = err.code === 'LIMIT_FILE_SIZE' ? 413 : 400;
    return res.status(status).json({ error: err.message });
  }
  const status = err.statusCode || err.status || 500;
  if (status >= 500) console.error(err);
  const message = err.type === 'entity.parse.failed'
    ? 'Request body must contain valid JSON.'
    : status === 500 ? 'Internal server error' : err.message;
  res.status(status).json({ error: message });
});

const server = app.listen(port, () => {
  console.log(`Health API listening on http://localhost:${port}`);
});

function shutdown() {
  server.close(async () => {
    await pool.end();
    process.exit(0);
  });
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
