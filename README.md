# Health API

A minimal Express API using PostgreSQL through Drizzle ORM.

## Run

```sh
npm install
npm run db:generate
npm run db:migrate
npm start
```

Copy `.env.example` to `.env` and set `DATABASE_URL` to your PostgreSQL connection string and the Cloudinary credentials (`CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`) before starting the API. The server listens on port `3000` by default; set `PORT` to use another port.

## Endpoints

- `GET /health` — returns service status, an ISO timestamp, and process uptime.
- `GET /ready` — checks PostgreSQL connectivity and returns HTTP `503` if the database is unavailable.
- `POST /api/v1/users` — registers a user.
- `POST /api/v1/images` — uploads one image to Cloudinary and returns its public URL.

Drizzle schema lives in `src/db/schema.js`; generated SQL migrations are stored in `drizzle/`.

### Register a user

```sh
curl -X POST http://localhost:3000/api/v1/users \
  -H 'Content-Type: application/json' \
  -d '{"email":"jordan@example.com","password":"a-long-password"}'
```

Registration requires a valid email and a password between 8 and 128 characters. The password is stored as a salted scrypt hash; the API response never includes it. User feature code is grouped under `src/modules/users/` into routes, controller, validation, and service files.

### Upload an image

Send a `multipart/form-data` request with the image in the `image` field. Uploads are limited to 5 MB.

```sh
curl -X POST http://localhost:3000/api/v1/images \
  -F 'image=@/path/to/image.jpg'
```

The response includes `data.url` (the Cloudinary HTTPS delivery URL) and `data.publicId`.

Healthy liveness and readiness checks return HTTP `200`; registration returns HTTP `201`. Unknown paths return HTTP `404` with a JSON error.
