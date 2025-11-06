import * as vscode from "vscode";

/**
 * LogOutputChannel provides structured logging with different log levels.
 * Respects VS Code's log level settings and provides better debugging experience.
 */
class Logger {
  private static instance: Logger;
  private outputChannel: vscode.LogOutputChannel;

  private constructor() {
    // Create a LogOutputChannel instead of basic OutputChannel
    // This provides trace, debug, info, warn, error methods with proper log levels
    this.outputChannel = vscode.window.createOutputChannel("Diffy Commit AI", {
      log: true,
    });
  }

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  /**
   * Log trace-level messages (most verbose, for detailed debugging)
   * Only visible when log level is set to Trace
   */
  trace(message: string, ...args: unknown[]): void {
    this.outputChannel.trace(message, ...args);
  }

  /**
   * Log debug-level messages (for development debugging)
   * Only visible when log level is set to Debug or lower
   */
  debug(message: string, ...args: unknown[]): void {
    this.outputChannel.debug(message, ...args);
  }

  /**
   * Log info-level messages (general information)
   * Only visible when log level is set to Info or lower
   */
  info(message: string, ...args: unknown[]): void {
    this.outputChannel.info(message, ...args);
  }

  /**
   * Log warning-level messages (potential issues)
   * Only visible when log level is set to Warning or lower
   */
  warn(message: string, ...args: unknown[]): void {
    this.outputChannel.warn(message, ...args);
  }

  /**
   * Log error-level messages (errors and exceptions)
   * Always visible unless log level is Off
   */
  error(error: string | Error, ...args: unknown[]): void {
    this.outputChannel.error(error, ...args);
  }

  /**
   * Show the output channel in the UI
   */
  show(preserveFocus = true): void {
    this.outputChannel.show(preserveFocus);
  }

  /**
   * Clear all output from the channel
   */
  clear(): void {
    this.outputChannel.clear();
  }

  /**
   * Dispose the output channel
   */
  dispose(): void {
    this.outputChannel.dispose();
  }
}

// Export singleton instance
export const logger = Logger.getInstance();

// Backward compatibility exports (deprecated - use logger directly)
/** @deprecated Use logger.info() instead */
export function sendToOutput(message: string): void {
  logger.info(message);
}

/** @deprecated Use logger.clear() instead */
export function clearOutput(): void {
  logger.clear();
}
