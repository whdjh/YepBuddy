'use client';

import { FormProvider, SubmitHandler, useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import Button from "@/components/common/Button";
import Input from "@/components/common/Input";

interface FormValues {
  concentric: string;
  eccentric: string;
  reps: string;
  sets: string;
  rests: string;
}

export default function Tempo() {
  const router = useRouter();
  const methods = useForm<FormValues>({
    mode: 'all',
    defaultValues: { concentric: '', eccentric: '', reps: '', sets: '', rests: '' },
    shouldUnregister: false,
  });

  const onSubmit: SubmitHandler<FormValues> = (data) => {
    console.log(data);
    router.push('/tempo/exercise');
  };
  
  return (
    <FormProvider {...methods}>
      <form
        onSubmit={methods.handleSubmit(onSubmit)}
        noValidate
        className="w-full h-full flex flex-col gap-10 p-1 justify-center items-center"
      >
        <div className="flex gap-5 justify-center items-center mt-5">
          <Button type="button" variant="solid" className='h-[3rem] w-[10rem]'>
            수축(단축성 수축)먼저
          </Button>
          <Button type="button" variant="outline" className='h-[3rem] w-[10rem]'>
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
              rules={{
                required: '필수 입력입니다.',
                pattern: {
                value: /^[0-9]+$/,
                message: '숫자만 입력 가능합니다.',
                },
              }}
            />
            <Input
              name="concentric"
              label="이완(초)"
              placeholder='숫자만 입력하세요.'
              width='w-[10rem]'
              rules={{
                required: '필수 입력입니다.',
                pattern: {
                value: /^[0-9]+$/,
                message: '숫자만 입력 가능합니다.',
                },
              }}
            />
          </div>
          <div className='flex justify-start gap-3'>
            <Input
              name="reps"
              label="운동 횟수(reps)"
              placeholder='숫자만 입력하세요.'
              width='w-[10rem]'
              rules={{
                required: '필수 입력입니다.',
                pattern: {
                value: /^[0-9]+$/,
                message: '숫자만 입력 가능합니다.',
                },
              }}
            />
            <Input
              name="sets"
              label="세트수(set)"
              placeholder='숫자만 입력하세요.'
              width='w-[10rem]'
              rules={{
                required: '필수 입력입니다.',
                pattern: {
                value: /^[0-9]+$/,
                message: '숫자만 입력 가능합니다.',
                },
              }}
            />
          </div>
          <Input
              name="rests"
              label="휴식 시간(초)"
              placeholder='숫자만 입력하세요.'
              width='w-[21rem]'
              rules={{
                required: '필수 입력입니다.',
                pattern: {
                value: /^[0-9]+$/,
                message: '숫자만 입력 가능합니다.',
                },
              }}
            />
        </div>
        <Button type="button" variant="solid" className='h-[3rem] w-[21rem]'>
          운동시작
        </Button>
      </form>
    </FormProvider>
  );
}