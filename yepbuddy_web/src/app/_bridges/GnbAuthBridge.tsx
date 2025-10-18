"use client";

import Gnb from "@/components/common/Gnb";
import { useAuthStore } from "@/stores/useAuthStore";

/**
 * zustand의 인증 상태를 읽어서 Gnb에 전달하는 브릿지.
 * - accessToken 존재 여부로 로그인 여부만 우선 반영
 * - username은 /api/me 구현 전까지 임시 값으로 처리
 */
export default function GnbAuthBridge() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const isLoggedIn = !!accessToken;

  // TODO: /api/me 구현 후 실제 닉네임/아이디로 교체
  const username = isLoggedIn ? "me" : "";

  return (
    <Gnb
      isLoggedIn={isLoggedIn}
      hasMessages={false}
      hasNotifications={false}
      username={username}
    />
  );
}
