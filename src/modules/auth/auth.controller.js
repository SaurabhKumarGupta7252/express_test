import { loginUser } from './auth.service.js';

export async function login(req, res) {
  const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  const password = typeof req.body?.password === 'string' ? req.body.password : '';

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const result = await loginUser({ email, password });
  res.status(200).json({ message: 'Login successful.', data: result });
}
