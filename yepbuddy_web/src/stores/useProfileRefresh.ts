import { create } from "zustand";

interface ProfileRefreshState {
  version: number;
  bump: () => void;
}

export const useProfileRefresh = create<ProfileRefreshState>((set) => ({
  version: 0,
  bump: () => set((s) => ({ version: s.version + 1 })),
}));
