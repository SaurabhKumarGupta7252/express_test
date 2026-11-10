# Health API

Express API with PostgreSQL, Drizzle ORM, user registration, and authenticated Cloudinary image storage.

## Run

```sh
npm install
npm run db:migrate
npm start
```

Copy `.env.example` to `.env`. Configure `DATABASE_URL`, the Cloudinary credentials (`CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`), and a random `AUTH_TOKEN_SECRET` of at least 32 bytes. Generate the token secret with `openssl rand -base64 32`. The server listens on port `3000` by default; set `PORT` to use another port.

## Endpoints

- `GET /health` — liveness check.
- `GET /ready` — checks PostgreSQL connectivity.
- `POST /api/v1/users` — registers a user.
- `POST /api/v1/auth/login` — signs in and returns a 15-minute bearer token.
- `GET /api/v1/images` — lists the signed-in user's images.
- `POST /api/v1/images` — uploads one authenticated image for the signed-in user.
- `GET /api/v1/images/:id/content` — streams an image only to its signed-in owner.

## Register and sign in

```sh
curl -X POST http://localhost:3000/api/v1/users \
  -H 'Content-Type: application/json' \
  -d '{"email":"jordan@example.com","password":"a-long-password"}'

curl -X POST http://localhost:3000/api/v1/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"jordan@example.com","password":"a-long-password"}'
```

Use the `accessToken` from the login response in the `Authorization: Bearer ...` header below.

## Upload and retrieve images

Uploads use `multipart/form-data` with the file in the `image` field and are limited to 5 MB.

```sh
curl -X POST http://localhost:3000/api/v1/images \
  -H 'Authorization: Bearer YOUR_ACCESS_TOKEN' \
  -F 'image=@/path/to/image.jpg'

curl http://localhost:3000/api/v1/images/IMAGE_ID/content \
  -H 'Authorization: Bearer YOUR_ACCESS_TOKEN' \
  --output downloaded-image.jpg
```

Cloudinary stores uploads as authenticated assets. The API associates each image with its owner and streams content only after validating the bearer token and ownership; it does not return a reusable Cloudinary URL. Image code is in `src/modules/images/`; login code is in `src/modules/auth/`.
