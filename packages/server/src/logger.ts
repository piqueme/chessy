import pino from 'pino'
import context from './async-context'

const logger = pino({
  mixin: () => {
    const requestId = context.getStore()?.requestId
    return requestId ? { requestId } : {}
  }
})

export default logger
