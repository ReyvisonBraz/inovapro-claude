/**
 * Decisão de origem para CORS, isolada para ser testável sem subir o servidor.
 *
 * Produção usa somente as origens exatas configuradas em APP_URL e
 * CORS_ALLOWED_ORIGINS. Previews precisam ser adicionados explicitamente;
 * curingas não são interpretados.
 */
const developmentOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
];

function normalizeOrigin(value: string): string | undefined {
  const candidate = value.trim();
  if (!candidate || candidate.includes('*')) return undefined;

  try {
    const url = new URL(candidate);
    if (!['http:', 'https:'].includes(url.protocol)) return undefined;
    if (url.username || url.password || url.search || url.hash) return undefined;
    if (url.pathname !== '/' && url.pathname !== '') return undefined;
    return url.origin;
  } catch {
    return undefined;
  }
}

function configuredOrigins(value: string | undefined): string[] {
  if (!value) return [];
  return value
    .split(',')
    .map(normalizeOrigin)
    .filter((origin): origin is string => Boolean(origin));
}

export function getAllowedOrigins(
  nodeEnv: string | undefined = process.env.NODE_ENV,
  appUrl: string | undefined = process.env.APP_URL,
  additionalOrigins: string | undefined = process.env.CORS_ALLOWED_ORIGINS,
): string[] {
  const origins = new Set<string>();

  if (nodeEnv !== 'production') {
    developmentOrigins.forEach((origin) => origins.add(origin));
  }

  const addConfiguredOrigin = (origin: string): void => {
    if (nodeEnv !== 'production' || origin.startsWith('https://')) {
      origins.add(origin);
    }
  };

  configuredOrigins(appUrl).forEach(addConfiguredOrigin);
  configuredOrigins(additionalOrigins).forEach(addConfiguredOrigin);
  return [...origins];
}

export function isOriginAllowed(
  origin: string | undefined,
  nodeEnv: string | undefined = process.env.NODE_ENV,
  appUrl: string | undefined = process.env.APP_URL,
  additionalOrigins: string | undefined = process.env.CORS_ALLOWED_ORIGINS,
): boolean {
  // Sem Origin: requisições server-to-server/ferramentas. Mutações com cookie
  // ainda passam pela checagem de Fetch Metadata no middleware CSRF.
  if (!origin) return true;

  const normalizedOrigin = normalizeOrigin(origin);
  return Boolean(
    normalizedOrigin
      && getAllowedOrigins(nodeEnv, appUrl, additionalOrigins).includes(normalizedOrigin),
  );
}
