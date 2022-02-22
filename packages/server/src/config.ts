import dotenv from 'dotenv'
import path from 'path'
import { LoggingScope as ServerLoggingScope } from './logger'
import { LoggingScope as CoreLoggingScope } from '@chessy/core'

const PROJECT_ROOT = path.resolve(
  path.join(__dirname, '..', '..', '..')
)

dotenv.config({ path: path.resolve(PROJECT_ROOT, '.env') })

type LoggingScope = typeof ServerLoggingScope | typeof CoreLoggingScope
export type Config = {
  clientOrigin: string;
  clientIP: string;
  clientPort: number | undefined;
  serverURI: string;
  serverIP: string;
  serverPort: number;
  databaseURI: string;
  databaseUser: string | undefined;
  databasePassword: string | undefined;
  logging: Record<LoggingScope, string>;
}

function getAddress(ip: string, port?: string): string {
  return port && port.length > 0 ?
    `${ip}:${port}` : ip
}

export default async(): Promise<Config> => {
  return {
    clientOrigin: getAddress(
      process.env['CLIENT_IP'] as string,
      process.env['CLIENT_PORT']
    ),
    clientIP: process.env['CLIENT_IP'] as string,
    clientPort: process.env['CLIENT_PORT'] ? parseInt(process.env['CLIENT_PORT']) : undefined,
    serverURI: getAddress(
      process.env['SERVER_IP'] as string,
      process.env['SERVER_PORT']
    ),
    serverIP: process.env['SERVER_IP'] as string,
    serverPort: parseInt(process.env['SERVER_PORT'] as string),
    databaseURI: process.env['DB_URI'] as string,
    databaseUser: process.env['DB_USERNAME'] as string,
    databasePassword: process.env['DB_PASSWORD'] as string,
    logging: {
      core: "info",
      server: "info"
    }
  }
}
