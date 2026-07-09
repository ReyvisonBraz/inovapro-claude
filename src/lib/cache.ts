import NodeCache from 'node-cache';

// TTL de 2 minutos para dados públicos de OS
export const publicOsCache = new NodeCache({ stdTTL: 120, checkperiod: 60 });

export const PUBLIC_OS_KEY = (key: string | number) => `public_os_${key}`;
