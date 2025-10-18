import { useMutation } from "@tanstack/react-query";
import { postJoin, type JoinBody, type JoinResp } from "@/lib/auth/postJoin";

export function useJoinMutation() {
  return useMutation<JoinResp, unknown, JoinBody>({
    mutationFn: (body) => postJoin(body),
  });
}
