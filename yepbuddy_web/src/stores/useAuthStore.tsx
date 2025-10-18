"use client";

import { create } from "zustand";

type AuthState = {
  accessToken: string | null;
  loading: boolean;

  // setters / actions
  setAccessToken: (t: string | null) => void;
  setLoading: (v: boolean) => void;

  // server interactions
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  refreshFromServer: () => Promise<void>;
  logoutLocal: () => void; // 클라 상태만 초기화 (쿠키 삭제는 서버 API 필요)
};

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  loading: false,

  setAccessToken: (t) => set({ accessToken: t }),
  setLoading: (v) => set({ loading: v }),

  async login(email, password) {
    set({ loading: true });
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const msg = res.status === 401
          ? "이메일 또는 비밀번호가 올바르지 않습니다."
          : res.status === 400
            ? "요청 형식이 올바르지 않습니다."
            : "로그인에 실패했습니다.";
        return { ok: false, error: msg };
      }

      const json = (await res.json()) as { accessToken?: string };
      set({ accessToken: json?.accessToken ?? null });
      return { ok: true };
    } catch {
      return { ok: false, error: "네트워크 오류가 발생했습니다." };
    } finally {
      set({ loading: false });
    }
  },

  // 새로고침 유지 → /api/auth/refresh (쿠키 기반)
  async refreshFromServer() {
    set({ loading: true });
    try {
      const res = await fetch("/api/auth/refresh", { method: "POST" });
      if (!res.ok) {
        set({ accessToken: null });
        return;
      }
      const json = (await res.json()) as { accessToken?: string };
      set({ accessToken: json?.accessToken ?? null });
    } catch {
      set({ accessToken: null });
    } finally {
      set({ loading: false });
    }
  },

  // 클라이언트 상태만 초기화 (로그아웃 API 붙이면 여기서 호출)
  logoutLocal() {
    set({ accessToken: null });
  },
}));
