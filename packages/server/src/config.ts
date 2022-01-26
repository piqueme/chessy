import dotenv from 'dotenv'
dotenv.config()

export type Config = {
  serverURI: string;
  databaseURI: string;
  databaseUser: string;
  databasePassword: string;
}

export default async(): Promise<Config> => {
  return {
    serverURI: 'http://127.0.0.1:8080',
    databaseURI: process.env['DB_URI'] as string,
    databaseUser: process.env['DB_USERNAME'] as string,
    databasePassword: process.env['DB_PASSWORD'] as string
  }
}
