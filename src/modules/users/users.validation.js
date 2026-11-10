export function validateRegistration(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw validationError('Request body must be a JSON object.');
  }

  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  const password = typeof body.password === 'string' ? body.password : '';

  if (!email || email.length > 320 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw validationError('Provide a valid email address (maximum 320 characters).');
  }

  if (password.length < 8 || password.length > 128) {
    throw validationError('Password must be between 8 and 128 characters.');
  }

  return { email, password };
}

function validationError(message) {
  const error = new Error(message);
  error.statusCode = 400;
  return error;
}
