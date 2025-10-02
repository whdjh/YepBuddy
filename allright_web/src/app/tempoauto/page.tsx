'use client';

import { FormProvider, SubmitHandler, useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import ButtonSection from '@/app/tempoauto/components/ButtonSection';
import InputSection from '@/app/tempoauto/components/InputSection';
import { AutoTempoFormValues } from '@/types/Form';
import { useTempoStore } from '@/stores/useTempo';
import { Hero } from '@/components/common/Hero';

export default function TempoAuto() {
  const router = useRouter();
  const { selected, setSelected, tempoFormValues } = useTempoStore();
  const [isSubmit, setIsSubmit] = useState(false);

  const methods = useForm<AutoTempoFormValues>({
    mode: 'onChange',
    defaultValues: tempoFormValues,
    shouldUnregister: false,
  });

  // 모든 필드를 구독
  const watchedFields = methods.watch([
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

    // 최신 폼값을 Zustand에 저장 -> Exercise 페이지에서 동일 값 사용
    useTempoStore.setState((prev) => ({
      ...prev,
      tempoFormValues: formData,
    }));

    console.log({ ...formData, flag: selected });
    router.push('/tempoauto/exercise');
  };

  return (
    <>
      <div className="hidden tab:block">
        <Hero title="PC 버전" subtitle="세밀한 템포 조절" />
      </div>
      <FormProvider {...methods}>
        <form
          onSubmit={methods.handleSubmit(onSubmit)}
          className="w-full h-full flex flex-col gap-10 p-3 justify-center items-center"
        >
          <ButtonSection selected={selected} setSelected={setSelected} />
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
    </>
  );
}
