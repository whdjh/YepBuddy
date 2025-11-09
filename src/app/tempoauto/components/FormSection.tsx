'use client';

import { FormProvider, useForm } from 'react-hook-form';
import type { SubmitHandler } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import ButtonSection from '@/app/tempoauto/components/ButtonSection';
import InputSection from '@/app/tempoauto/components/InputSection';
import { useTempo } from '@/hooks/useTempo';

export interface AutoTempoFormValues {
  concentric: string;
  eccentric: string;
  reps: string;
  sets: string;
  rests: string;
  name: string;
}

export default function FormSection() {
  const router = useRouter();
  const { selected, setSelected, tempoFormValues, replaceFormValues } = useTempo();
  const [isSubmit, setIsSubmit] = useState(false);

  const methods = useForm<AutoTempoFormValues>({
    mode: 'all',
    defaultValues: tempoFormValues,
    shouldUnregister: false,
  });

  const { handleSubmit, watch } = methods;

  // 모든 필드를 구독
  const watchedFields = watch([
    'concentric',
    'eccentric',
    'reps',
    'sets',
    'rests',
    'name',
  ]);

  const allFieldsValid = useMemo(() => {
    const [
      concentricInput,
      eccentricInput,
      repsInput,
      setsInput,
      restsInput,
      nameInput,
    ] = watchedFields;

    // 문자열/숫자 섞여 들어오므로 항상 안전 파싱
    const concentricSeconds = Number(concentricInput);
    const eccentricSeconds = Number(eccentricInput);
    const repsCount = Number(repsInput);
    const setsCount = Number(setsInput);
    const restSeconds = Number(restsInput);

    const isPositiveInteger = (n: number) => Number.isFinite(n) && n >= 1;
    const isNonNegativeInteger = (n: number) => Number.isFinite(n) && n >= 0;

    const nameIsValid = String(nameInput ?? '').trim().length > 0;

    // 필드별 기준
    const tempoIsValid =
      isPositiveInteger(concentricSeconds) && isPositiveInteger(eccentricSeconds);
    const countIsValid =
      isPositiveInteger(repsCount) && isPositiveInteger(setsCount);
    const restIsValid = isNonNegativeInteger(restSeconds); // 0 허용

    return tempoIsValid && countIsValid && restIsValid && nameIsValid;
  }, [watchedFields]);

  const canSubmit = Boolean(selected) && allFieldsValid;

  const onSubmit: SubmitHandler<AutoTempoFormValues> = (formData) => {
    if (isSubmit) return;
    setIsSubmit(true);

    // 최신 폼값을 저장 -> Exercise 페이지에서 동일 값 사용
    replaceFormValues(formData);

    console.log({ ...formData, flag: selected });
    router.push('/tempoauto/exercise');
  };

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full h-full flex flex-col gap-10 p-3 justify-center items-center"
      >
        <ButtonSection
          selected={selected}
          setSelected={setSelected}
        />
        <InputSection />
        <Button
          type="submit"
          disabled={!canSubmit}
          className="h-[3rem] w-[21rem]"
        >
          운동시작
        </Button>
      </form>
    </FormProvider>
  );
}