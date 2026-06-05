import { queryOptions } from '@tanstack/react-query';
import { getCurrentAccount } from './service';

export const accountKeys = {
  all: ['account'] as const,
  me: () => [...accountKeys.all, 'me'] as const
};

export const accountQueryOptions = () =>
  queryOptions({
    queryKey: accountKeys.me(),
    queryFn: getCurrentAccount,
    staleTime: 30_000
  });
