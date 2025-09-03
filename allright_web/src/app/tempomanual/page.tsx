'use client';

import { useTempoStore } from '@/stores/useTempo';
import { useForm, FormProvider, Controller } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import Input from "@/components/common/Input";

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

  const handleInputChange = (key: "name" | "reps", value: string) => {
    methods.setValue(key, value, { shouldValidate: true });
    setFormValue(key, value);
  };

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-6 p-6"
      >
        {/* 운동 종목 */}
        <Input
          name="name"
          label="운동 이름"
          placeholder='영어, 한글로 입력'
          type="text"
          onChange={(e) => handleInputChange("name", e.target.value)}
          rules={{
            required: "필수 입력입니다.",
            pattern: {
              value: /^[A-Za-z가-힣\s]+$/,
              message: "영어와 한글만 입력 가능합니다.",
            },
            maxLength: {
              value: 30,
              message: "30자 이내로 입력해주세요.",
            },
          }}
        />

        {/* 반복 횟수 선택 */}
        <div>
          <p className="font-medium text-gray-700 mb-2">반복 횟수</p>
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
  );
}
