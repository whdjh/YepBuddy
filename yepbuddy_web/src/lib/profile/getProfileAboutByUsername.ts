interface ProfileAboutDTO {
  displayName: string | null;
  avatarUrl: string | null;
  location: string | null;
  bio: string | null;
  histories: string[];
  qualifications: string[];
}

interface ProfileAboutOk {
  ok: true;
  about: ProfileAboutDTO;
}
interface ProfileAboutErr {
  ok: false;
  error: string;
}
export type ProfileAboutGetResp = ProfileAboutOk | ProfileAboutErr;

export async function getAboutByUsername(username: string): Promise<ProfileAboutGetResp> {
  try {
    const res = await fetch(`/api/users/${encodeURIComponent(username)}/about`, {
      method: "GET",
      cache: "no-store",
    });
    const json = await res.json().catch(() => null);
    if (!res.ok || !json?.ok) {
      return { ok: false, error: json?.error || `HTTP_${res.status}` };
    }
    return json as ProfileAboutGetResp;
  } catch {
    return { ok: false, error: "NETWORK_ERROR" };
  }
}
