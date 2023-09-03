import { ApolloCache, NormalizedCacheObject } from '@apollo/client/core';
import { INetworkResponse } from '../NetworkErrorLink'

export type ICacheShape = ApolloCache<NormalizedCacheObject>;

export const cacheFirstHandler = (cache: ICacheShape) => ({
  networkError: error,
  operation,
}: INetworkResponse) => {
  console.log('cacheFirstHandler');
  const skipFlag = operation.getContext().__skipErrorAccordingCache__;
  console.log('skipFlag', skipFlag);
  if (skipFlag) {
    const opDefinition = operation.query.definitions[0];
    if (opDefinition.kind === 'OperationDefinition') {
      if (opDefinition.operation === 'query') {
        console.log('reading from cache');
        const result = cache.read<any>({
          query: operation.query,
          variables: operation.variables,
          optimistic: false
        })
        console.log('result', result);
        if (result != null) {
          return result;
        }
      }
    }
  }
  throw error
}
