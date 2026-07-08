import { describe, it, expect } from 'vitest';
import { hashPassword, verifyPassword } from '../lib/password';

describe('password (bcrypt async)', () => {
  it('hash + verify faz round-trip', async () => {
    const hash = await hashPassword('segredo123');
    expect(hash).not.toBe('segredo123');
    expect(hash.startsWith('$2')).toBe(true);
    expect(await verifyPassword('segredo123', hash)).toBe(true);
  });

  it('senha errada não verifica', async () => {
    const hash = await hashPassword('segredo123');
    expect(await verifyPassword('outra', hash)).toBe(false);
  });
});
