export type LogLevel = 'info' | 'warn' | 'error' | 'debug';

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  data?: string;
}

class Logger {
  private logs: LogEntry[] = [];
  private maxLogs = 2000;

  addLog(level: LogLevel, message: string, data?: any) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      data: data ? this.safeStringify(data) : undefined
    };

    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }
  }

  private safeStringify(obj: any): string {
    try {
      const cache = new Set();
      return JSON.stringify(obj, (key, value) => {
        if (typeof value === 'object' && value !== null) {
          if (cache.has(value)) return '[Circular]';
          cache.add(value);
        }
        return value;
      });
    } catch (e) {
      return String(obj);
    }
  }

  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  downloadLogs() {
    const logsString = this.exportLogs();
    const blob = new Blob([logsString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `system_logs_${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}

export const logger = new Logger();

// Intercept console methods to capture all logs automatically
const originalConsoleLog = console.log;
const originalConsoleInfo = console.info;
const originalConsoleWarn = console.warn;
const originalConsoleError = console.error;

console.log = (...args) => {
  logger.addLog('info', args.map(a => typeof a === 'object' ? logger['safeStringify'](a) : String(a)).join(' '));
  originalConsoleLog.apply(console, args);
};

console.info = (...args) => {
  logger.addLog('info', args.map(a => typeof a === 'object' ? logger['safeStringify'](a) : String(a)).join(' '));
  originalConsoleInfo.apply(console, args);
};

console.warn = (...args) => {
  logger.addLog('warn', args.map(a => typeof a === 'object' ? logger['safeStringify'](a) : String(a)).join(' '));
  originalConsoleWarn.apply(console, args);
};

console.error = (...args) => {
  logger.addLog('error', args.map(a => typeof a === 'object' ? logger['safeStringify'](a) : String(a)).join(' '));
  originalConsoleError.apply(console, args);
};

// Catch unhandled promise rejections and global errors
window.addEventListener('error', (event) => {
  logger.addLog('error', `Uncaught Error: ${event.message}`, {
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    error: event.error ? event.error.stack : null
  });
});

window.addEventListener('unhandledrejection', (event) => {
  logger.addLog('error', `Unhandled Promise Rejection: ${event.reason}`);
});
