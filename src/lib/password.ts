import bcrypt from 'bcryptjs';

const ROUNDS = 10;

/** Gera o hash bcrypt de forma assíncrona (não bloqueia o event loop). */
export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, ROUNDS);
}

/** Verifica a senha contra o hash de forma assíncrona. */
export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}
