'use client';

import { FormProvider, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import InputPair from "@/components/common/InputPair";

interface FormValues {
  introduction: string;
}

export default function SideCard() {
  const methods = useForm<FormValues>({
    defaultValues: {
      introduction: "",
    },
    mode: "onBlur",
  });

  const onSubmit = methods.handleSubmit((values) => {
    console.log("submit:", values);
    // TODO: 서버 전송
  });

  return (
    <div className="col-span-full tab:col-span-2">

    <div className="bg-transparent col-span-2 space-y-5 border border-white/10 rounded-lg p-6 shadow-sm">
      <div className="flex gap-5">
        <Avatar className="size-14">
          <AvatarFallback>N</AvatarFallback>
          <AvatarImage src="https://github.com/gym.png" />
        </Avatar>
        <div className="flex flex-col">
          <h4 className="text-lg font-medium">사용자명</h4>
          <Badge>회원</Badge>
        </div>
      </div>
      <FormProvider {...methods}>
        <form onSubmit={onSubmit} className="space-y-5">
          <InputPair
            label="소개글"
            description="당신에 대해 소개해주세요"
            name="introduction"
            type="text"
            id="introduction"
            required
            isTextArea
          />
          <Button type="submit" className="w-full">
            연락하기
          </Button>
        </form>
      </FormProvider>
      </div>
      </div>
  );
}