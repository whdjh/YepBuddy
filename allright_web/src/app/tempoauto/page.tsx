'use client';

import { FormProvider, SubmitHandler, useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import ButtonSection from '@/components/product/tempoauto/ButtonSection';
import InputSection from '@/components/product/tempoauto/InputSection';
import { TempoFormValues } from '@/types/Tempo';
import { useTempoStore } from '@/stores/useTempo';
import { Hero } from '@/components/common/Hero';

export default function TempoAuto() {
  const router = useRouter();
  const { selected, setSelected, tempoFormValues } = useTempoStore();
  const [isSubmit, setIsSubmit] = useState(false);
  
  const methods = useForm<TempoFormValues>({
    mode: 'onChange',
    defaultValues: tempoFormValues,
    shouldUnregister: false,
  });

  const onSubmit: SubmitHandler<TempoFormValues> = (data) => {
    if (isSubmit) {
      return;
    }

    setIsSubmit(true);

    const payload = {
      ...data,
      flag: selected,
    };
    console.log(payload);
    router.push('/tempoauto/exercise');
  };

  return (
    <>
      <div className="hidden tab:block">
        <Hero title="컴퓨터 전용 운동 템포 조절" subtitle="컴퓨터로 커스텀 운동 템포를 경험해보세요!" />
      </div>
      <FormProvider {...methods}>
        <form
          onSubmit={methods.handleSubmit(onSubmit)}
          className="w-full h-full flex flex-col gap-10 p-1 justify-center items-center"
        >
          <ButtonSection selected={selected} setSelected={setSelected} />
          <InputSection />
          <Button type="submit" disabled={!(methods.formState.isValid && selected)} className='h-[3rem] w-[21rem]'>
            운동시작
          </Button>
        </form>
      </FormProvider>
    </>
  );
}