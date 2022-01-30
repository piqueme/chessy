import pino from 'pino'
import type { Logger as PinoLogger } from 'pino'

/**
 * Singleton logging class for accessing and adjusting a Pino-based
 * logger.
 */
class Log {
  logger: PinoLogger;

  constructor(logger?: PinoLogger) {
    this.logger = logger || pino({ level: 'silent' })
  }

  setLogger(logger: PinoLogger): void {
    this.logger = logger
  }
}

const log = new Log()
export default log
