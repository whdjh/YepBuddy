import { useQuery } from "@tanstack/react-query";
import { getMyProfile, type MeGetResp } from "@/lib/auth/getMyProfile";
import { useAuthStore } from "@/stores/useAuthStore";

export const meKeys = {
  all: ["me"] as const,
};

export function useMe() {
  const token = useAuthStore((s) => s.accessToken);

  return useQuery<MeGetResp>(
    meKeys.all,
    () => getMyProfile(token),
    {
      enabled: !!token, // 로그인 된 경우에만 실행
      staleTime: 1000 * 60 * 2, // 2분 캐시
      cacheTime: 1000 * 60 * 5, // v4에서는 gcTime 대신 cacheTime
    }
  );
}
