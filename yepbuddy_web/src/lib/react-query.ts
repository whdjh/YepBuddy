import { QueryClient, QueryCache, MutationCache } from "@tanstack/react-query";

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
    },
  });
}

// 개발 중 HMR에도 단일 인스턴스 유지
export const queryClient: QueryClient = (globalThis as any).__rqc__ ?? ((globalThis as any).__rqc__ = createClient());
