import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/useAuthStore";
import { getMyProfile, type MeGetResp } from "@/lib/auth/getMyProfile";
import {
  updateMyProfile,
  type MePutBody,
  type MePutResp,
} from "@/lib/me/putUpdateMyProfile";

export const meKeys = {
  all: ["me"] as const,
};

export function useMeQuery() {
  const accessToken = useAuthStore((s) => s.accessToken);

  return useQuery<MeGetResp>({
    queryKey: meKeys.all,
    enabled: !!accessToken,
    queryFn: () => getMyProfile(accessToken),
  });
}

export function useUpdateMeMutation() {
  const qc = useQueryClient();
  const accessToken = useAuthStore((s) => s.accessToken);

  return useMutation<MePutResp, Error, MePutBody>({
    mutationFn: (body) => updateMyProfile(body, accessToken),
    onSuccess: (data) => {
      if (data.ok) {
        // 표시용 이름 즉시 캐시 반영
        qc.setQueryData(meKeys.all, (prev: any) =>
          prev && prev.ok
            ? { ...prev, user: { ...prev.user, displayName: data.profile.name } }
            : prev
        );
      }
    },
  });
}
