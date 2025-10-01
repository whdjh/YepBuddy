'use client';

import { useTempoStore } from '@/stores/useTempo';
import { useForm, FormProvider, Controller } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import InputPair from '@/components/common/InputPair';
import { Hero } from '@/components/common/Hero';
import { ManualTempoFormValues } from '@/types/Form';

export default function TempoManual() {
  const router = useRouter();
  const { setFormValue } = useTempoStore();

  const availableReps = [8, 10, 12, 15, 18, 20];

  const methods = useForm<ManualTempoFormValues>({
    defaultValues: {
      name: '',
      reps: null,
    },
    mode: 'onChange',
    shouldUnregister: false,
  });

  const { handleSubmit, control, watch } = methods;
  const nameValue = watch('name') ?? '';
  const selectedReps = watch('reps');

  const onSubmit = (data: ManualTempoFormValues) => {
    // 최신 폼 값을 Zustand에 저장
    setFormValue('name', data.name);
    setFormValue('reps', data.reps !== null ? String(data.reps) : '0');
    router.push('/tempomanual/exercise');
  };

  // InputPair 내부 setValue 특성상 isValid에 안 걸릴 수 있으므로 watch 기반으로 계산
  const canSubmit =
    nameValue.trim().length > 0 &&
    selectedReps !== null;

  return (
    <>
      <div className="hidden tab:block">
        <Hero title="모바일 버전" subtitle="간단한 카운팅" />
      </div>

      <FormProvider {...methods}>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="w-full h-full flex flex-col gap-10 p-1 justify-center items-center"
        >
          {/* 운동 종목 */}
          <InputPair
            label="운동 이름"
            description="운동 이름을 적어보세요."
            required
            id="name"
            name="name"
            rules={{ required: "운동 이름을 입력하세요." }}
          />

          {/* 반복 횟수 선택 */}
          <div className="w-full max-w-md">
            <p className="font-medium mb-2">반복 횟수</p>
            <Controller
              name="reps"
              control={control}
              rules={{ required: '반복 횟수를 선택해주세요.' }}
              render={({ field }) => (
                <div className="flex flex-wrap gap-3">
                  {availableReps.map((r) => {
                    const checked = field.value === r;
                    return (
                      <label
                        key={r}
                        className={`cursor-pointer px-3 py-2 rounded-lg border ${checked ? 'border-emerald-600 ring-1 ring-emerald-600' : 'border-white/10'
                          }`}
                      >
                        <input
                          type="radio"
                          className="mr-2"
                          value={r}
                          checked={checked}
                          onChange={() => field.onChange(r)}
                        />
                        {r}회
                      </label>
                    );
                  })}
                </div>
              )}
            />
          </div>

          {/* 운동 시작 버튼 */}
          <Button type="submit" disabled={!canSubmit}>
            운동 시작
          </Button>
        </form>
      </FormProvider>
    </>
  );
}
