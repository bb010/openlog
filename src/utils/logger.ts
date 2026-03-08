enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

function formatLog(level: LogLevel, message: string, data?: unknown): string {
  const timestamp = new Date().toISOString();
  const dataStr = data ? ` ${JSON.stringify(data)}` : '';
  return `[${timestamp}] [${level}] ${message}${dataStr}`;
}

export const logger = {
  debug: (message: string, data?: unknown) => {
    console.log(formatLog(LogLevel.DEBUG, message, data));
  },
  info: (message: string, data?: unknown) => {
    console.log(formatLog(LogLevel.INFO, message, data));
  },
  warn: (message: string, data?: unknown) => {
    console.warn(formatLog(LogLevel.WARN, message, data));
  },
  error: (message: string, data?: unknown) => {
    console.error(formatLog(LogLevel.ERROR, message, data));
  },
};
