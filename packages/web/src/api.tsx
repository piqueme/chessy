// TODO: Put this in configuration for different environments
import { request } from 'graphql-request'
import type { RequestDocument } from 'graphql-request'

const apiHost = import.meta.env['VITE_API_HOST'] as string
const apiEndpoint = `${apiHost}/graphql`
const apiClient = <RequestData, RequestVariables = void>(query: RequestDocument, variables?: RequestVariables): Promise<RequestData> => {
  const results = request<RequestData, RequestVariables>(apiEndpoint, query, variables)
  console.log("RESULTS", results)
  return results
}
export { apiEndpoint, apiClient }
