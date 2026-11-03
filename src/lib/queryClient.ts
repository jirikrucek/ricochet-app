import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query';
import { Sentry } from './sentry';

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error, query) => {
      Sentry.captureException(error, {
        extra: { queryKey: query.queryKey },
      });
    },
  }),
  mutationCache: new MutationCache({
    onError: (error, _variables, _context, mutation) => {
      Sentry.captureException(error, {
        extra: { mutationKey: mutation.options.mutationKey },
      });
    },
  }),
});
