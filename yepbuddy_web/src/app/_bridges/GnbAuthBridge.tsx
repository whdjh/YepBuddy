"use client";

import { useRouter } from "next/navigation";
import Gnb from "@/components/common/Gnb";
import { useAuthStore } from "@/stores/useAuthStore";
import { useLogout } from "@/hooks/queries/auth/useLogout";
import { useMe } from "@/hooks/queries/auth/useMe";

/**
 * - zustand accessToken을 보고 useMe로 /api/auth/me 호출
 * - GNB에 username/displayName/avatarUrl 주입
 * - 로그아웃은 React Query 훅으로 호출 + 상태 초기화
 */
export default function GnbAuthBridge() {
  const router = useRouter();
  const accessToken = useAuthStore((s) => s.accessToken);
  const isLoggedIn = !!accessToken;

  // 로그인된 경우에만 me API 호출
  const { data } = useMe();

  const { mutateAsync: logoutMutate, isPending: loggingOut } = useLogout();

  // user 정보 추출
  const handle = data?.ok ? data.user.username ?? data.user.id : "";
  const displayName = data?.ok ? data.user.displayName ?? undefined : undefined;
  const avatarUrl = data?.ok ? data.user.avatarUrl ?? undefined : undefined;

  // 로그아웃
  const onLogout = async () => {
    await logoutMutate();
    router.refresh();
  };

  return (
    <Gnb
      isLoggedIn={isLoggedIn}
      hasMessages={false}
      hasNotifications={false}
      username={handle}
      displayName={displayName}
      avatarUrl={avatarUrl}
      onLogout={loggingOut ? undefined : onLogout}
    />
  );
}
