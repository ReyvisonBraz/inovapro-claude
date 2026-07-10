import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'node:crypto';

const ALGO = 'aes-256-gcm';
const KEY_LEN = 32;
const IV_LEN = 16;
const TAG_LEN = 16;

function getKey(): Buffer {
  const raw = process.env.ENCRYPTION_KEY;
  if (!raw) {
    throw new Error('[crypto] ENCRYPTION_KEY não configurada. Defina uma chave de 32+ caracteres.');
  }
  return scryptSync(raw, 'inovapro-salt', KEY_LEN);
}

/**
 * Criptografa um texto plano com AES-256-GCM.
 * Retorna uma string no formato: `iv:tag:ciphertext` (todos em hex).
 */
export function encrypt(plaintext: string): string {
  const key = getKey();
  const iv = randomBytes(IV_LEN);
  const cipher = createCipheriv(ALGO, key, iv);
  const enc = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [iv.toString('hex'), tag.toString('hex'), enc.toString('hex')].join(':');
}

/**
 * Descriptografa uma string no formato `iv:tag:ciphertext`.
 * Retorna null silenciosamente se o formato não bater (valor em texto plano legado).
 */
export function decrypt(stored: string): string | null {
  const parts = stored.split(':');
  if (parts.length !== 3) return null;

  try {
    const key = getKey();
    const iv = Buffer.from(parts[0], 'hex');
    const tag = Buffer.from(parts[1], 'hex');
    const enc = Buffer.from(parts[2], 'hex');
    const decipher = createDecipheriv(ALGO, key, iv);
    decipher.setAuthTag(tag);
    const dec = Buffer.concat([decipher.update(enc), decipher.final()]);
    return dec.toString('utf8');
  } catch {
    return null;
  }
}