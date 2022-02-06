import pino from 'pino'
import type { Logger as PinoLogger } from 'pino'

export const LoggingScope = 'core'
/**
 * Singleton logging class for accessing and adjusting a Pino-based
 * logger.
 */
class Log {
  logger: PinoLogger;

  constructor(logger?: PinoLogger) {
    this.logger = logger || pino({ level: 'silent', scope: LoggingScope })
  }

  setLogger(logger: PinoLogger): void {
    this.logger = logger.child({ scope: LoggingScope })
  }
}

const log = new Log()
export default log
