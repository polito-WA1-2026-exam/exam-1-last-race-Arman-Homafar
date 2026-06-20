import crypto from 'crypto';

const KEYLEN = 32;

export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, KEYLEN).toString('hex');
  return { hash, salt };
}

export function verifyPassword(password, user) {
  const hash = crypto.scryptSync(password, user.salt, KEYLEN).toString('hex');
  return hash === user.hash;
}
