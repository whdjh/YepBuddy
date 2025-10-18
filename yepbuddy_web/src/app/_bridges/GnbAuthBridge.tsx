"use client";

import { useRouter } from "next/navigation";
import Gnb from "@/components/common/Gnb";
import { useAuthStore } from "@/stores/useAuthStore";

/**
 * zustand 인증 상태를 Gnb로 전달하고,
 * 즉시 로그아웃(onLogout) 콜백을 제공한다.
 */
export default function GnbAuthBridge() {
  const router = useRouter();
  const accessToken = useAuthStore((s) => s.accessToken);
  const logoutServer = useAuthStore((s) => s.logoutServer);

  const isLoggedIn = !!accessToken;

  // TODO: /api/me 붙이면 실제 값으로 대체
  const username = isLoggedIn ? "me" : "";
  const displayName = isLoggedIn ? "사용자명" : undefined;
  const avatarUrl = undefined;

  const onLogout = async () => {
    await logoutServer(); // POST /api/auth/logout + zustand 초기화
    router.refresh();     // 헤더/페이지 즉시 리프레시
  };

  return (
    <Gnb
      isLoggedIn={isLoggedIn}
      hasMessages={false}
      hasNotifications={false}
      username={username}
      displayName={displayName}
      avatarUrl={avatarUrl}
      onLogout={onLogout}
    />
  );
}
