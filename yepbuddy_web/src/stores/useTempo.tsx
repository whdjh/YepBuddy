import { create } from 'zustand';

export interface AutoTempoFormValues {
  concentric: string;
  eccentric: string;
  reps: string;
  sets: string;
  rests: string;
  name: string;
}

interface TemponState { 
  selected: "concentric" | "eccentric" | null;
  tempoFormValues: AutoTempoFormValues;
  setSelected: (id: "concentric" | "eccentric") => void;
  setFormValue: (key: keyof AutoTempoFormValues, value: string) => void;
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
    name: '',
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
        name: '',
      },
    }),
}));
