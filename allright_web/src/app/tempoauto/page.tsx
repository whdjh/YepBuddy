'use client';

import { FormProvider, SubmitHandler, useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Button from "@/components/common/Button";
import ButtonSection from '@/components/product/tempoauto/ButtonSection';
import InputSection from '@/components/product/tempoauto/InputSection';
import { TempoFormValues } from '@/types/Tempo';
import { useTempoStore } from '@/stores/useTempo';

export default function TempoAuto() {
  const router = useRouter();
  const { selected, setSelected, tempoFormValues, setFormValue } = useTempoStore();
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
    <FormProvider {...methods}>
      <form
        onSubmit={methods.handleSubmit(onSubmit)}
        className="w-full h-full flex flex-col gap-10 p-1 justify-center items-center"
      >
        <ButtonSection selected={selected} setSelected={setSelected} />
        <InputSection methods={methods} setFormValue={setFormValue} />
        <Button type="submit" variant="solid" disabled={!(methods.formState.isValid && selected)} className='h-[3rem] w-[21rem]'>
          운동시작
        </Button>
      </form>
    </FormProvider>
  );
}