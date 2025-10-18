"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Gnb from "@/components/common/Gnb";
import { useAuthStore } from "@/stores/useAuthStore";

type MeOk = {
  ok: true;
  user: {
    id: string;
    // 아이디 = 이메일 로컬파트(@ 앞)
    username: string | null;
    // 이름 = 회원가입 때 입력한 이름(profiles.name)
    displayName: string | null;
    avatarUrl: string | null;
  };
};
type MeFail = { ok: false; error: string };
type MeResponse = MeOk | MeFail;

/**
 * - zustand의 accessToken을 읽어서
 * - /api/auth/me 호출 후 받은 정보를 Gnb에 주입한다.
 * - 로그아웃은 즉시 API 호출 + 상태 초기화
 */
export default function GnbAuthBridge() {
  const router = useRouter();
  const accessToken = useAuthStore((s) => s.accessToken);
  const logoutServer = useAuthStore((s) => s.logoutServer);
  const isLoggedIn = !!accessToken;

  // Gnb로 내려줄 값들
  const [handle, setHandle] = useState<string>("");         // @아이디(이메일 로컬파트)
  const [displayName, setDisplayName] = useState<string>(); // 이름(profiles.name)
  const [avatarUrl, setAvatarUrl] = useState<string>();     // 아바타 URL

  // 동일 토큰에 대해 중복 fetch 방지
  const fetchedForToken = useRef<string>("");

  useEffect(() => {
    // 비로그인 → 값 초기화
    if (!isLoggedIn) {
      setHandle("");
      setDisplayName(undefined);
      setAvatarUrl(undefined);
      fetchedForToken.current = "";
      return;
    }

    // 같은 토큰이면 재요청 안 함
    if (fetchedForToken.current === accessToken) return;
    fetchedForToken.current = accessToken!;

    const ctrl = new AbortController();

    (async () => {
      try {
        const res = await fetch("/api/auth/me", {
          method: "GET",
          headers: { Authorization: `Bearer ${accessToken}` },
          signal: ctrl.signal,
        });

        if (!res.ok) {
          // 토큰 만료 등 → 값 초기화만
          setHandle("");
          setDisplayName(undefined);
          setAvatarUrl(undefined);
          return;
        }

        const json = (await res.json()) as MeResponse;
        if (json.ok) {
          setHandle(json.user.username ?? json.user.id);
          setDisplayName(json.user.displayName ?? undefined);
          setAvatarUrl(json.user.avatarUrl ?? undefined);
        } else {
          setHandle("");
          setDisplayName(undefined);
          setAvatarUrl(undefined);
        }
      } catch {
        // 네트워크 오류는 조용히 무시
      }
    })();

    return () => ctrl.abort();
  }, [isLoggedIn, accessToken]);

  // 즉시 로그아웃: API 호출 + 상태 초기화 + 헤더 리프레시
  const onLogout = async () => {
    await logoutServer();
    router.refresh();
  };

  return (
    <Gnb
      isLoggedIn={isLoggedIn}
      hasMessages={false}        // TODO: 메시지/알림 연결 시 실제 값으로
      hasNotifications={false}
      username={handle}         // ← @아이디
      displayName={displayName} // ← 이름
      avatarUrl={avatarUrl}
      onLogout={onLogout}
    />
  );
}
