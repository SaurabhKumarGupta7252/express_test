import { createHmac, timingSafeEqual } from 'node:crypto';

const tokenLifetimeSeconds = 15 * 60;

function getSecret() {
  const secret = process.env.AUTH_TOKEN_SECRET;
  if (!secret || Buffer.byteLength(secret) < 32) {
    const error = new Error('AUTH_TOKEN_SECRET must contain at least 32 bytes.');
    error.statusCode = 503;
    throw error;
  }
  return secret;
}

function encode(value) {
  return Buffer.from(JSON.stringify(value)).toString('base64url');
}

function sign(unsignedToken, secret) {
  return createHmac('sha256', secret).update(unsignedToken).digest('base64url');
}

export function createAccessToken(userId) {
  const now = Math.floor(Date.now() / 1000);
  const header = encode({ alg: 'HS256', typ: 'JWT' });
  const payload = encode({ sub: String(userId), iat: now, exp: now + tokenLifetimeSeconds });
  const unsignedToken = `${header}.${payload}`;
  return `${unsignedToken}.${sign(unsignedToken, getSecret())}`;
}

export function verifyAccessToken(token) {
  const [headerPart, payloadPart, signaturePart, extra] = token.split('.');
  if (!headerPart || !payloadPart || !signaturePart || extra) return null;

  try {
    const header = JSON.parse(Buffer.from(headerPart, 'base64url').toString('utf8'));
    const payload = JSON.parse(Buffer.from(payloadPart, 'base64url').toString('utf8'));
    if (
      header.alg !== 'HS256' ||
      !/^\d+$/.test(payload.sub) ||
      !Number.isInteger(payload.exp) ||
      payload.exp <= Date.now() / 1000
    ) return null;

    const expected = Buffer.from(sign(`${headerPart}.${payloadPart}`, getSecret()));
    const received = Buffer.from(signaturePart);
    if (expected.length !== received.length || !timingSafeEqual(expected, received)) return null;
    return { id: Number(payload.sub) };
  } catch {
    return null;
  }
}
