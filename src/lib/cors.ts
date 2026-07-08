/**
 * Decisão de origem para CORS, isolada para ser testável sem subir o servidor.
 */
export const allowedOrigins: string[] = [
  'https://inovapro-theta.vercel.app',
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
];

export function isOriginAllowed(
  origin: string | undefined,
  _nodeEnv: string | undefined
): boolean {
  // Sem origin: requisições server-to-server / ferramentas (não é navegador).
  if (!origin) return true;
  if (allowedOrigins.includes(origin)) return true;
  // Deploys de preview do próprio produto.
  if (origin.endsWith('.vercel.app')) return true;
  return false;
}
