"use client";

import { useQuery } from "@tanstack/react-query";
import { getAboutByUsername } from "@/lib/profile/getProfileAboutByUsername";
import { useProfileRefresh } from "@/stores/useProfileRefresh";

export function useProfileAbout(username: string) {
  const version = useProfileRefresh((s) => s.version);

  return useQuery({
    queryKey: ["profileAbout", username, version],
    queryFn: () => getAboutByUsername(username),
    enabled: !!username,
    staleTime: 60_000,
  });
}
