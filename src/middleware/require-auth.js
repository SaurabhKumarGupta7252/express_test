import { verifyAccessToken } from '../security/access-token.js';

export function requireAuth(req, res, next) {
  const authorization = req.get('authorization') || '';
  const match = authorization.match(/^Bearer\s+(.+)$/i);
  const user = match ? verifyAccessToken(match[1]) : null;

  if (!user) return res.status(401).json({ error: 'A valid bearer token is required.' });
  req.auth = user;
  next();
}
