import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

const scrypt = promisify(scryptCallback);
const saltBytes = 16;
const keyLength = 64;

export async function hashPassword(password) {
  const salt = randomBytes(saltBytes).toString('hex');
  const derivedKey = await scrypt(password, salt, keyLength);
  return `scrypt$${salt}$${derivedKey.toString('hex')}`;
}

export async function verifyPassword(password, storedHash) {
  const [algorithm, salt, hash] = storedHash.split('$');
  if (algorithm !== 'scrypt' || !salt || !hash) return false;

  const expected = Buffer.from(hash, 'hex');
  const actual = await scrypt(password, salt, expected.length);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}
