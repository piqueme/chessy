import dotenv from 'dotenv'
import { LoggingScope as ServerLoggingScope } from './logger'
import { LoggingScope as CoreLoggingScope } from '@chessy/core'
dotenv.config()

type LoggingScope = typeof ServerLoggingScope | typeof CoreLoggingScope
export type Config = {
  serverURI: string;
  databaseURI: string;
  databaseUser: string;
  databasePassword: string;
  logging: Record<LoggingScope, string>;
}

export default async(): Promise<Config> => {
  return {
    serverURI: 'http://127.0.0.1:8080',
    databaseURI: process.env['DB_URI'] as string,
    databaseUser: process.env['DB_USERNAME'] as string,
    databasePassword: process.env['DB_PASSWORD'] as string,
    logging: {
      core: "info",
      server: "info"
    }
  }
}
