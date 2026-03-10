enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

/**
 * Whether to suppress all stdout/stderr log output.
 * Set OPENLOG_SILENT=1 when running in strict MCP stdio mode so that
 * application log lines never corrupt the JSON-RPC protocol stream.
 */
const SILENT = process.env.OPENLOG_SILENT === '1';

function formatLog(level: LogLevel, message: string, data?: unknown): string {
  const timestamp = new Date().toISOString();
  const dataStr = data ? ` ${JSON.stringify(data)}` : '';
  return `[${timestamp}] [${level}] ${message}${dataStr}`;
}

/**
 * Structured logger for OpenLog.
 *
 * All output goes to **stderr** so it is never mixed into the MCP stdio
 * transport (which uses stdout for JSON-RPC messages).
 *
 * Set OPENLOG_SILENT=1 to suppress all log output (recommended when the
 * MCP client manages its own log capture).
 */
export const logger = {
  debug: (message: string, data?: unknown) => {
    if (!SILENT) process.stderr.write(formatLog(LogLevel.DEBUG, message, data) + '\n');
  },
  info: (message: string, data?: unknown) => {
    if (!SILENT) process.stderr.write(formatLog(LogLevel.INFO, message, data) + '\n');
  },
  warn: (message: string, data?: unknown) => {
    if (!SILENT) process.stderr.write(formatLog(LogLevel.WARN, message, data) + '\n');
  },
  error: (message: string, data?: unknown) => {
    if (!SILENT) process.stderr.write(formatLog(LogLevel.ERROR, message, data) + '\n');
  },
};
