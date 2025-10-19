interface ProfileAboutPatchReq {
  displayName?: string | null;
  location?: string | null;
  bio?: string | null;
  histories?: string[];
  qualifications?: string[];
}
type ProfileAboutPatchResp = { ok: true } | { ok: false; error: string };

export async function postUpdateAbout(
  token: string,
  body: ProfileAboutPatchReq
): Promise<ProfileAboutPatchResp> {
  try {
    const res = await fetch("/api/my/about", {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    const json = await res.json().catch(() => null);
    if (!res.ok || !json?.ok) {
      return { ok: false, error: json?.error || `HTTP_${res.status}` };
    }
    return json as ProfileAboutPatchResp;
  } catch {
    return { ok: false, error: "NETWORK_ERROR" };
  }
}

export type { ProfileAboutPatchReq, ProfileAboutPatchResp };
