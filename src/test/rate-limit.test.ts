// @vitest-environment node
import { describe, it, expect, afterEach } from 'vitest';
import { makeLoginLimiter } from '../lib/rate-limit';

afterEach(() => { delete process.env.REDIS_URL; });

describe('makeLoginLimiter', () => {
  it('sem REDIS_URL retorna um middleware express (memória)', () => {
    delete process.env.REDIS_URL;
    const mw = makeLoginLimiter();
    expect(typeof mw).toBe('function');
    // middleware express: (req, res, next)
    expect(mw.length).toBeGreaterThanOrEqual(2);
  });
});
