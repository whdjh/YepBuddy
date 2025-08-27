import { create } from 'zustand';
import { TempoFormValues } from '@/types/Tempo';

interface TemponState { 
  selected: "concentric" | "eccentric" | null;
  tempoFormValues: TempoFormValues;
  setSelected: (id: "concentric" | "eccentric") => void;
  setFormValue: (key: keyof TempoFormValues, value: string) => void;
  reset: () => void;
}

export const useTempoStore = create<TemponState>((set) => ({
  selected: null,

  tempoFormValues: {
    concentric: '',
    eccentric: '',
    reps: '',
    sets: '',
    rests: '',
  },

  setSelected: (id) => set({ selected: id }),

  setFormValue: (key, value) =>
    set((state) => ({
      tempoFormValues: { ...state.tempoFormValues, [key]: value },
    })),
  reset: () =>
    set({
      selected: null,
      tempoFormValues: {
        concentric: '',
        eccentric: '',
        reps: '',
        sets: '',
        rests: '',
      },
    }),
}));
