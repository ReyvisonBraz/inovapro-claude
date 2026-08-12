export type ErrorSeverity = 'warning' | 'error' | 'critical';

export interface ClientErrorReport {
  severity?: ErrorSeverity;
  operation?: string;
  message: string;
  route?: string;
  method?: string;
  statusCode?: number;
  requestId?: string;
  stack?: string;
  details?: Record<string, unknown>;
}

export function createErrorId(): string {
  const suffix = crypto.randomUUID().replaceAll('-', '').slice(0, 12);
  return `ERR-${suffix.toUpperCase()}`;
}

export async function reportClientError(report: ClientErrorReport, providedId?: string): Promise<string> {
  const id = providedId || createErrorId();
  const apiBase = (import.meta.env.VITE_API_URL?.replace(/\/$/, '') || '') + '/api';
  try {
    await fetch(`${apiBase}/system-errors/report`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id,
        severity: report.severity || 'error',
        operation: report.operation,
        message: report.message,
        route: report.route || window.location.pathname,
        method: report.method,
        statusCode: report.statusCode,
        requestId: report.requestId,
        stack: report.stack,
        details: report.details,
      }),
    });
  } catch {
    // O código local continua útil para suporte mesmo se a rede estiver fora.
  }
  return id;
}
