// TODO: Put this in configuration for different environments
import { request } from 'graphql-request'
import type { RequestDocument } from 'graphql-request'

const apiEndpoint = 'http://127.0.0.1:8080/graphql'
const apiClient = <RequestData, RequestVariables = void>(query: RequestDocument, variables?: RequestVariables): Promise<RequestData> => {
  const results = request<RequestData, RequestVariables>(apiEndpoint, query, variables)
  console.log("RESULTS", results)
  return results
}
export { apiEndpoint, apiClient }
