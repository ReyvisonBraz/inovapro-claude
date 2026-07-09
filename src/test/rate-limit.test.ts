// @vitest-environment node
import { describe, it, expect, afterEach } from 'vitest';
import { makeLoginLimiter, makeAiLimiter } from '../lib/rate-limit';

afterEach(() => { delete process.env.REDIS_URL; });

describe('makeLoginLimiter', () => {
  it('sem REDIS_URL retorna um middleware express (memória)', () => {
    delete process.env.REDIS_URL;
    const mw = makeLoginLimiter();
    expect(typeof mw).toBe('function');
    expect(mw.length).toBeGreaterThanOrEqual(2);
  });
});

describe('makeAiLimiter', () => {
  it('sem REDIS_URL retorna um middleware express (memória)', () => {
    delete process.env.REDIS_URL;
    const mw = makeAiLimiter();
    expect(typeof mw).toBe('function');
    expect(mw.length).toBeGreaterThanOrEqual(2);
  });
});
