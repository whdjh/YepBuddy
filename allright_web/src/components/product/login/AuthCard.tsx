"use client";

import Logo from '@/asset/ic/ic_logo.svg';
import { Button } from '@/components/ui/button';
import Input from '@/components/common/Input';
import { FormProvider, SubmitHandler, useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { LoginFormValues } from '@/types/Login';

export default function AuthCard() {
  const router = useRouter();
  const methods = useForm<LoginFormValues>({
    mode: 'all',
    defaultValues: { id: '', pwd: '' },
    shouldUnregister: false,
  });

  const onSubmit: SubmitHandler<LoginFormValues> = (data) => {
    console.log(data);
    router.push('/');
  };

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={methods.handleSubmit(onSubmit)}
        noValidate
        className="w-full h-full flex items-center justify-center"
      >
        <div className="flex w-full max-w-[20rem] gap-[1rem] flex-col items-center justify-center rounded-[1rem] bg-[#242429] px-[2rem] py-[2rem]">
          <Logo width={70} height={70} />
          <Input 
            name="id" 
            label="아이디" 
            placeholder='아이디를 입력해주세요.'
            width='w-[15rem]'
            rules={{
              required: '아이디는 필수 입력입니다.',
              pattern: {
                value: /^[가-힣]+$/,
                message: '한글만 입력 가능합니다.',
              },
            }}
          />
          <Input 
            name="pwd" 
            label="비밀번호" 
            type="password" 
            placeholder='비밀번호를 입력해주세요.'
            width='w-[15rem]'
            rules={{
              required: "비밀번호를 입력해주세요",
              minLength: {
                value: 2,
                message: "최소 2자 이상 입력해주세요"
              },
              maxLength: {
                value: 6,
                message: "최대 6자까지 입력 가능합니다"
              }
            }}
          />
          <Button type="submit" className='h-[3rem] w-[15rem]'>
            로그인
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}