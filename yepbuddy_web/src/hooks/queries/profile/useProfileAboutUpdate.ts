"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { postUpdateAbout, type ProfileAboutPatchReq } from "@/lib/profile/postUpdateAbout";
import { useAuthStore } from "@/stores/useAuthStore";

export function useProfileAboutUpdate(username?: string) {
  const token = useAuthStore((s) => s.accessToken);
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (body: ProfileAboutPatchReq) => {
      if (!token) throw new Error("NO_TOKEN");
      return postUpdateAbout(token, body);
    },
    onSuccess: () => {
      if (username) qc.invalidateQueries({ queryKey: ["profileAbout", username] });
    },
  });
}
