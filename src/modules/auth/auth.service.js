import { eq } from 'drizzle-orm';
import { db } from '../../db/index.js';
import { users } from '../../db/schema.js';
import { verifyPassword } from '../../security/password.js';
import { createAccessToken } from '../../security/access-token.js';

export async function loginUser({ email, password }) {
  const user = await db.query.users.findFirst({ where: eq(users.email, email) });
  if (!user || !(await verifyPassword(password, user.password))) {
    const error = new Error('Invalid email or password.');
    error.statusCode = 401;
    throw error;
  }

  return {
    accessToken: createAccessToken(user.id),
    tokenType: 'Bearer',
    expiresIn: 900,
    user: { id: user.id, email: user.email },
  };
}
