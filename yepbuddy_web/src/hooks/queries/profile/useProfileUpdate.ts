import { useMutation } from "@tanstack/react-query";
import { postUpdateProfile } from "@/lib/profile/postUpdateProfile";

export function useProfileUpdate() {
  return useMutation({
    mutationFn: postUpdateProfile,
  });
}
