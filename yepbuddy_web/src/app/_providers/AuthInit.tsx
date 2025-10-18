"use client";

import { useEffect, useRef } from "react";
import { useAuthStore } from "@/stores/useAuthStore";

/**
 * 앱 시작 시 /api/auth/refresh를 한 번 호출해서
 * refresh 쿠키가 유효하면 accessToken을 zustand에 적재한다.
 */
export default function AuthInit() {
  const refreshFromServer = useAuthStore((s) => s.refreshFromServer);
  const didRunRef = useRef(false);

  useEffect(() => {
    if (didRunRef.current) return;
    didRunRef.current = true;
    void refreshFromServer();
  }, [refreshFromServer]);

  return null;
}
