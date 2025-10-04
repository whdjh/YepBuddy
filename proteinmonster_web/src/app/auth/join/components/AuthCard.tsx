"use client";

import { useForm, FormProvider } from "react-hook-form";
import { Button } from "@/components/ui/button";
import InputPair from "@/components/common/InputPair";
import { MessageCircleIcon } from "lucide-react";
import Link from "next/link";
import { JoinForm } from "@/types/Form";

export default function AuthCard() {
  const methods = useForm<JoinForm>({
    defaultValues: { name: "", email: "", password: "" },
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
        <div className="flex flex-col relative items-center justify-start tab:h-full">
          <div className="flex items-center flex-col justify-center w-full max-w-md gap-10">
            <h1 className="text-2xl font-semibold">회원가입</h1>
            <form className="w-full space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
              <InputPair
                name="name"
                id="name"
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
                placeholder="proteinmoster@proteinmoster.com"
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

              <Button className="w-full" type="submit" disabled={isSubmitting}>
                {isSubmitting ? "회웝가입 중" : "회원가입"}
              </Button>
            </form>
          </div>
        </div>
      </FormProvider>
      <div className="w-full flex flex-col items-center tab:gap-8 gap-3 mt-5 tab:mt-0">
        <div className="w-full flex flex-col items-center gap-2">
          <hr className="w-full border-white/10" />
          <span className="text-xs text-muted-foreground uppercase font-medium">
            소셜 회원가입
          </span>
          <hr className="w-full border-white/10" />
        </div>
        <div className="w-full flex flex-col tab:gap-2">
          <Button variant="outline" className="w-full" asChild>
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
