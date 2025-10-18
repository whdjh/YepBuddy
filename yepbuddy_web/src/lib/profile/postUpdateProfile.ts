import { useAuthStore } from "@/stores/useAuthStore";

export async function postUpdateProfile(formData: FormData) {
  const token = useAuthStore.getState().accessToken;
  const res = await fetch("/api/profile/update", {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });

  if (!res.ok) {
    throw new Error("프로필 수정 실패");
  }

  return res.json() as Promise<{ ok: boolean; avatarUrl?: string; error?: string }>;
}
