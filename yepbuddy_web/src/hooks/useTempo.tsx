'use client';

import { createContext, ReactNode, useCallback, useContext, useMemo, useState } from 'react';

export interface AutoTempoFormValues {
  concentric: string;
  eccentric: string;
  reps: string;
  sets: string;
  rests: string;
  name: string;
}

type TempoSelection = 'concentric' | 'eccentric' | null;

interface TempoContextValue {
  selected: TempoSelection;
  tempoFormValues: AutoTempoFormValues;
  setSelected: (id: Exclude<TempoSelection, null>) => void;
  setFormValue: (key: keyof AutoTempoFormValues, value: string) => void;
  replaceFormValues: (values: AutoTempoFormValues) => void;
  reset: () => void;
}

const initialTempoValues: AutoTempoFormValues = {
  concentric: '',
  eccentric: '',
  reps: '',
  sets: '',
  rests: '',
  name: '',
};

const TempoContext = createContext<TempoContextValue | null>(null);

export function TempoProvider({ children }: { children: ReactNode }) {
  const [selected, setSelectedState] = useState<TempoSelection>(null);
  const [tempoFormValues, setTempoFormValues] = useState<AutoTempoFormValues>(initialTempoValues);

  const setSelected = useCallback((id: Exclude<TempoSelection, null>) => {
    setSelectedState(id);
  }, []);

  const setFormValue = useCallback((key: keyof AutoTempoFormValues, value: string) => {
    setTempoFormValues((prev: AutoTempoFormValues) => ({ ...prev, [key]: value }));
  }, []);

  const replaceFormValues = useCallback((values: AutoTempoFormValues) => {
    setTempoFormValues({ ...values });
  }, []);

  const reset = useCallback(() => {
    setSelectedState(null);
    setTempoFormValues({ ...initialTempoValues });
  }, []);

  const value = useMemo(
    () => ({ selected, tempoFormValues, setSelected, setFormValue, replaceFormValues, reset }),
    [selected, tempoFormValues, setSelected, setFormValue, replaceFormValues, reset],
  );

  return <TempoContext.Provider value={value}>{children}</TempoContext.Provider>;
}

export function useTempo() {
  const context = useContext(TempoContext);

  if (context === null) {
    throw new Error('useTempo 훅은 TempoProvider 내부에서만 사용할 수 있습니다.');
  }

  return context;
}
