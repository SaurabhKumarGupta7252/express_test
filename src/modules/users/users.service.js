import { eq } from 'drizzle-orm';
import { db } from '../../db/index.js';
import { users } from '../../db/schema.js';
import { hashPassword } from '../../security/password.js';

export async function registerUser({ email, password }) {
  const existingUser = await db.query.users.findFirst({
    columns: { id: true },
    where: eq(users.email, email),
  });

  if (existingUser) {
    const error = new Error('An account with this email already exists.');
    error.statusCode = 409;
    throw error;
  }

  const passwordHash = await hashPassword(password);

  try {
    const [user] = await db.insert(users).values({
      email,
      password: passwordHash,
    }).returning({
      id: users.id,
      email: users.email,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
    });

    return user;
  } catch (error) {
    // The unique constraint is the final guard against concurrent registrations.
    if (error.code === '23505') {
      const conflict = new Error('An account with this email already exists.');
      conflict.statusCode = 409;
      throw conflict;
    }
    throw error;
  }
}
