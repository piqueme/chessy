import type { FastifyPluginAsync } from 'fastify'
import fp from 'fastify-plugin'
import mongoose from 'mongoose'

export type MongoosePluginOptions = {
  uri: string;
  connectOptions: mongoose.ConnectOptions;
}

// TODO: Avoid declaration merging for fastify-mongoose.
// This feels kind of bad. Maybe should be on root FastifyInstance itself.
// Ideally adding the plugin would automatically add the new property to
// Fastify instance.
declare module 'fastify' {
  export interface FastifyInstance {
    db: mongoose.Connection
  }
}

const connectDatabase: FastifyPluginAsync<MongoosePluginOptions> = async (fastify, options) => {
  try {
    mongoose.connection.on('connected', () => {
      console.log("Acquired MongoDB connection.")
    })
    mongoose.connection.on('disconnected', () => {
      console.log("Disconnected from MongoDB.")
    })
    const db = await mongoose.createConnection(options.uri, options.connectOptions)
    fastify.decorate('db', db)
  } catch (error) {
    throw new Error(`Failed to load Mongoose Fastify plugin: ${error}`)
  }
}

export default fp(connectDatabase)
