"use client";

import { useMutation } from "@tanstack/react-query";
import { postLogin, type LoginReq, type LoginResp } from "@/lib/auth/postLogin";
import { useAuthStore } from "@/stores/useAuthStore";

export function useLogin() {
  const setAccessToken = useAuthStore((s) => s.setAccessToken);

  return useMutation<LoginResp, Error, LoginReq>({
    mutationFn: (body) => postLogin(body),
    onSuccess: (data) => {
      if (data.ok && data.accessToken) {
        setAccessToken(data.accessToken);
      }
    },
  });
}
