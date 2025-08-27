'use client';

import { FormProvider, SubmitHandler, useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import { TempoFormValues } from '@/types/Tempo';
import { useTempoStore } from '@/stores/useTempo';

export default function Tempo() {
  const router = useRouter();
  const { selected, setSelected, tempoFormValues, setFormValue } = useTempoStore();
  
  const methods = useForm<TempoFormValues>({
    mode: 'onChange',
    defaultValues: tempoFormValues,
    shouldUnregister: false,
  });

  const handleClickButton = (id: "concentric" | "eccentric") => {
    setSelected(id);
  };

  const onSubmit: SubmitHandler<TempoFormValues> = (data) => {
    console.log(data);
    router.push('/tempo/exercise');
  };

  const handleInputChange = (key: keyof TempoFormValues, value: string) => {
    methods.setValue(key, value, { shouldValidate: true });
    setFormValue(key, value);
  };
  
  return (
    <FormProvider {...methods}>
      <form
        onSubmit={methods.handleSubmit(onSubmit)}
        className="w-full h-full flex flex-col gap-10 p-1 justify-center items-center"
      >
        <div className="flex gap-5 justify-center items-center mt-5">
          <Button
            type="button"
            variant="solid"
            onClick={() => handleClickButton('concentric')}
            className={`h-[3rem] w-[10rem] ${
              selected === "concentric" ? "bg-[#16a34a]" : "bg-gray-400"
            }`}
          >
            수축(단축성 수축)먼저
          </Button>
          <Button
            type="button"
            variant="solid"
            onClick={() => handleClickButton('eccentric')}
            className={`h-[3rem] w-[10rem] ${
              selected === "eccentric" ? "bg-[#16a34a]" : "bg-gray-400"
            }`}
          >
            이완(신장성 수축)먼저
          </Button>
        </div>
        <div className='flex flex-col gap-5'>
          <div className='flex justify-start gap-3'>
            <Input
              name="eccentric"
              label="수축(초)"
              placeholder='숫자만 입력하세요.'
              width='w-[10rem]'
              type="number"
              inputMode="numeric"
              onChange={(e) => handleInputChange("eccentric", e.target.value)}
              rules={{
                required: '필수 입력입니다.',
                pattern: {
                value: /^[0-9]+$/,
                message: '숫자만 입력 가능합니다.',
                },
                validate: value => Number(value) <= 10 || '10까지 입력 가능합니다.'
              }}
            />
            <Input
              name="concentric"
              label="이완(초)"
              placeholder='숫자만 입력하세요.'
              width='w-[10rem]'
              type="number"
              inputMode="numeric"
              onChange={(e) => handleInputChange("concentric", e.target.value)}
              rules={{
                required: '필수 입력입니다.',
                pattern: {
                value: /^[0-9]+$/,
                message: '숫자만 입력 가능합니다.',
                },
                validate: value => Number(value) <= 10 || '10까지 입력 가능합니다.'
              }}
            />
          </div>
          <div className='flex justify-start gap-3'>
            <Input
              name="reps"
              label="운동 횟수(reps)"
              placeholder='숫자만 입력하세요.'
              width='w-[10rem]'
              type="number"
              inputMode="numeric"
              onChange={(e) => handleInputChange("reps", e.target.value)}
              rules={{
                required: '필수 입력입니다.',
                pattern: {
                value: /^[0-9]+$/,
                message: '숫자만 입력 가능합니다.',
                },
                validate: value => Number(value) <= 20 || '20까지 입력 가능합니다.'
              }}
            />
            <Input
              name="sets"
              label="세트수(set)"
              placeholder='숫자만 입력하세요.'
              width='w-[10rem]'
              type="number"
              inputMode="numeric"
              onChange={(e) => handleInputChange("sets", e.target.value)}
              rules={{
                required: '필수 입력입니다.',
                pattern: {
                value: /^[0-9]+$/,
                message: '숫자만 입력 가능합니다.',
                },
                validate: value => Number(value) <= 10 || '10까지 입력 가능합니다.'
              }}
            />
          </div>
          <Input
              name="rests"
              label="휴식 시간(초)"
              placeholder='숫자만 입력하세요.'
              width='w-[21rem]'
              type="number"
              inputMode="numeric"
              onChange={(e) => handleInputChange("rests", e.target.value)}
              rules={{
                required: '필수 입력입니다.',
                pattern: {
                value: /^[0-9]+$/,
                message: '숫자만 입력 가능합니다.',
                },
                validate: value => Number(value) <= 600 || '600까지 입력 가능합니다.'
              }}
            />
        </div>
        <Button type="submit" variant="solid" disabled={!(methods.formState.isValid && selected)} className='h-[3rem] w-[21rem]'>
          운동시작
        </Button>
      </form>
    </FormProvider>
  );
}