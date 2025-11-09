import { QueryClient, QueryCache, MutationCache } from "@tanstack/react-query";

/** 필요 시 옵션만 수정해서 재사용 */
function createClient() {
  return new QueryClient({
    queryCache: new QueryCache(),
    mutationCache: new MutationCache(),
    defaultOptions: {
      queries: {
        retry: 0,
        staleTime: 5 * 60 * 1000,
        cacheTime: 10 * 60 * 1000,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchOnReconnect: false,
      },
      mutations: {
        retry: 0,
      },
    },
  });
}

/** 단순 모듈 스코프 싱글턴 */
export const queryClient: QueryClient = createClient();

export default queryClient;
