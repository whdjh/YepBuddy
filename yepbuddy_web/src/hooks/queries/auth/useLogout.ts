"use client";

import { useMutation } from "@tanstack/react-query";
import { postLogout } from "@/lib/auth/postLogout";
import { useAuthStore } from "@/stores/useAuthStore";

export function useLogout() {
  const logoutLocal = useAuthStore((s) => s.logoutLocal);

  return useMutation({
    mutationFn: postLogout,
    onSettled: () => {
      logoutLocal(); // 토큰 제거
    },
  });
}
