"use client"

import { useTempoStore } from '@/stores/useTempo';
import { useForm, FormProvider } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import InputPair from '@/components/common/InputPair';
import SelectPair from '@/components/common/SelectPair';
import { ManualTempoFormValues } from '@/types/Form';

export default function FormSection() {
  const router = useRouter();
  const { setFormValue } = useTempoStore();

  const methods = useForm<ManualTempoFormValues>({
    defaultValues: {
      name: '',
      reps: null,
    },
    mode: 'all',
    shouldUnregister: false,
  });

  const { handleSubmit, watch } = methods;
  const nameValue = watch('name') ?? '';
  const selectedReps = watch('reps');

  const onSubmit = (data: ManualTempoFormValues) => {
    // 최신 폼 값을 Zustand에 저장
    setFormValue('name', data.name);
    setFormValue('reps', data.reps !== null ? String(data.reps) : '0');
    router.push('/tempomanual/exercise');
  };

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full h-full flex flex-col gap-10 p-5 justify-center"
      >
        {/* 운동 종목 */}
        <InputPair
          label="운동명"
          description="운동명을 적어보세요."
          required
          id="name"
          name="name"
          className='w-full'
          rules={{
            required: "운동명을 입력하세요",
            pattern: {
              value: /^[A-Za-z가-힣\s]+$/,
              message: "운동 이름은 영어와 한국어만 가능합니다",
            },
          }}
        />

        {/* 운동 횟수 */}
        <SelectPair
          label="운동 횟수"
          description="운동 횟수를 고르세요."
          name="reps"
          placeholder="8회"
          options={[
            { label: "8회", value: "8" },
            { label: "10회", value: "10" },
            { label: "12회", value: "12" },
            { label: "15회", value: "15" },
            { label: "18회", value: "18" },
            { label: "20회", value: "20" },
          ]}
        />

        {/* 운동 시작 버튼 */}
        <Button
          type="submit"
          disabled={!(nameValue.trim().length > 0 && selectedReps !== null)}
        >
          운동 시작
        </Button>
      </form>
    </FormProvider>
  );
}