import { AsyncLocalStorage } from 'async_hooks'

type AsyncContext = Partial<{
  requestId: string
}>
const context = new AsyncLocalStorage<AsyncContext>()
export default context
