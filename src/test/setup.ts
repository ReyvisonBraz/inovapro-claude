import '@testing-library/jest-dom';
import { afterAll, afterEach, beforeAll } from 'vitest';
import { server } from './mocks/server';

// auth.ts lança no import se JWT_SECRET não existir; o ambiente de teste
// não carrega .env. Define um segredo dummy antes de qualquer import de rota.
process.env.JWT_SECRET ||= 'test-secret';

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
