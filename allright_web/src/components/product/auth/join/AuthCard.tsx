"use client";

import { useForm, FormProvider } from "react-hook-form";
import { Button } from "@/components/ui/button";
import InputPair from "@/components/common/InputPair";
import { MessageCircleIcon } from "lucide-react";
import Link from "next/link";

type JoinForm = { username: string; email: string; password: string };

export default function AuthCard() {
  const methods = useForm<JoinForm>({
    defaultValues: { username: "", email: "", password: "" },
    mode: "onSubmit",
  });

  const { handleSubmit, formState: { isSubmitting } } = methods;

  const onSubmit = (data: JoinForm) => {
    // TODO: 회원가입 요청
    console.log("submit:", data);
  };

  return (
    <div className="w-full max-w-md">
      <FormProvider {...methods}>
        <div className="flex flex-col relative items-center justify-center h-full">
          <div className="flex items-center flex-col justify-center w-full max-w-md gap-10">
            <h1 className="text-2xl font-semibold">회원가입</h1>
            <form className="w-full space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
              <InputPair
                name="username"
                id="username"
                label="이름"
                description="이름을 입력하세요."
                placeholder="이주훈"
                rules={{
                  required: "필수 입력 사항입니다.",
                }}
              />
              <InputPair
                name="email"
                id="email"
                label="이메일"
                description="이메일을 입력하세요."
                placeholder="allright@allright.com"
                rules={{
                  required: "필수 입력 사항입니다.",
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: "이메일 형태가 아닙니다.",
                  },
                }}
              />
              <InputPair
                name="password"
                id="password"
                label="비밀번호"
                description="비밀번호를 입력하세요."
                type="password"
                placeholder="••••••••"
                rules={{ required: "필수 입력 사항입니다." }}
              />

              <Button className="w-full border border-white/10" type="submit" disabled={isSubmitting}>
                {isSubmitting ? "회웝가입 중" : "회원가입"}
              </Button>
            </form>
          </div>
        </div>
      </FormProvider>
      <div className="w-full flex flex-col items-center gap-8">
        <div className="w-full flex flex-col items-center gap-2">
          <hr className="w-full border-white/10" />
          <span className="text-xs text-muted-foreground uppercase font-medium">
            소셜 회원가입
          </span>
          <hr className="w-full border-white/10" />

        </div>
        <div className="w-full flex flex-col gap-2">
          <Button variant="outline" className="w-full border border-white/10" asChild>
            <Link href="/auth/social/kakao/start">
              <MessageCircleIcon className="w-4 h-4" />
              카카오톡
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
