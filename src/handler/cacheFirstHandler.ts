import { DocumentNode, Operation } from '@apollo/client/core';
import { INetworkResponse } from '../NetworkErrorLink'
import { OperationDefinitionNode } from 'graphql';

interface Query<TVariables> {
  query: DocumentNode
  variables?: TVariables
}

interface ReadOptions<TVariables = any> extends Query<TVariables> {
  rootId?: string
  previousResult?: any
}

interface WriteOptions<TResult = any, TVariables = any>
  extends Query<TVariables> {
  dataId: string
  result: TResult
}

export interface ICacheShape {
  read<T, TVariables = any>(query: ReadOptions<TVariables>): T | null
  write<TResult = any, TVariables = any>(
    write: WriteOptions<TResult, TVariables>
  ): void
}

export const cacheFirstHandler = (cache: ICacheShape) => ({
  networkError: error,
  operation,
}: INetworkResponse) => {
  const skipFlag = operation.getContext().__skipErrorAccordingCache__;
  if (skipFlag) {
    const opDefinition = operation.query.definitions[0];
    if (opDefinition.kind === 'OperationDefinition') {
      if (opDefinition.operation === 'query') {
        const result = cache.read<any>({
          query: operation.query,
          variables: operation.variables,
        })
        if (result != null) {
          return result;
        }
      }
    }
  }
  throw error
}
