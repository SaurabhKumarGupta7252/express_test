import { registerUser } from './users.service.js';
import { validateRegistration } from './users.validation.js';

export async function register(req, res) {
  const input = validateRegistration(req.body);
  const user = await registerUser(input);

  res.status(201).json({
    message: 'User registered successfully',
    data: { user },
  });
}
