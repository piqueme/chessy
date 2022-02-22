import { MongoMemoryServer } from 'mongodb-memory-server'
import type { Config } from './config'

export default async(): Promise<Config & { testDBHandle: MongoMemoryServer }> => {
  const mongod = await MongoMemoryServer.create()
  const databaseURI = mongod.getUri()

  return {
    clientOrigin: 'http://127.0.0.1:3000',
    clientIP: '127.0.0.1',
    clientPort: 3000,
    serverURI: 'http://127.0.0.1:8080',
    serverIP: '127.0.0.1',
    serverPort: 8080,
    databaseURI,
    testDBHandle: mongod,
    databaseUser: undefined,
    databasePassword: undefined,
    logging: {
      core: "silent",
      server: "silent"
    },
  }
}
