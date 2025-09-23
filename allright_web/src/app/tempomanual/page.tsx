'use client';

import { useTempoStore } from '@/stores/useTempo';
import { useForm, FormProvider, Controller } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import InputPair from '@/components/common/InputPair';
import { Hero } from '@/components/common/Hero';

interface ManualFormValues {
  name: string;
  reps: number | null;
}

export default function TempoManual() {
  const router = useRouter();
  const { setFormValue } = useTempoStore();

  const availableReps = [8, 10, 12, 15, 18, 20];

  const methods = useForm<ManualFormValues>({
    defaultValues: {
      name: '',
      reps: null,
    },
    mode: 'onChange',
  });

  const { handleSubmit, control, watch } = methods;
  const selectedReps = watch('reps');

  const onSubmit = (data: ManualFormValues) => {
    setFormValue('name', data.name);
    setFormValue('reps', data.reps?.toString() || '0');
    router.push('/tempomanual/exercise');
  };

  return (
    <>
      <div className="hidden tab:block">
        <Hero title="모바일 버전" subtitle="간단한 카운팅" />
      </div>
      <FormProvider {...methods}>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-6 p-6"
        >
          {/* 운동 종목 */}
          <InputPair
            label="운동이름"
            description="운동이름을 적어보세요."
            required
            id="description"
            name="description"
            rules={{ required: "자기소개를 입력하세요" }}
          />

          {/* 반복 횟수 선택 */}
          <div>
            <p className="font-medium mb-2">반복 횟수</p>
            <Controller
              name="reps"
              control={control}
              rules={{ required: '반복 횟수를 선택해주세요.' }}
              render={({ field }) => (
                <div className="flex flex-col gap-2">
                  {availableReps.map((r) => (
                    <label key={r} className="cursor-pointer">
                      <input
                        type="radio"
                        {...field}
                        value={r}
                        checked={field.value === r}
                        onChange={() => field.onChange(r)}
                        className="mr-1"
                      />
                      {r}회
                    </label>
                  ))}
                </div>
              )}
            />
          </div>

          {/* 운동 시작 버튼 */}
          <Button
            type="submit"
            disabled={!watch('name') || !selectedReps}
          >
            운동 시작
          </Button>
        </form>
      </FormProvider>
    </>
  );
}
