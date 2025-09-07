"use client";

import { useState } from "react";
import { FormProvider, useForm, SubmitHandler } from "react-hook-form";
import Image from "next/image";
import { ImageIcon } from "lucide-react";
import InputPair from "@/components/common/InputPair";
import { Hero } from "@/components/common/hero";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import SelectPair from "@/components/common/SelectPair";

type FormValues = {
  name: string;
  tags: string;
  description: string;
  category: string;
  icon: File | null;
};

export default function Submit() {
  const methods = useForm<FormValues>({
    mode: "all",
    defaultValues: {
      name: "",
      tags: "",
      description: "",
      category: "",
      icon: null
    },

  });

  const [icon, setIcon] = useState<string | null>(null);

  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const file = event.target.files[0];
      setIcon(URL.createObjectURL(file));
    }
  };

  const onSubmit: SubmitHandler<FormValues> = (data) => {
    console.log("submit:", data);
  };

  return (
    <div className="space-y-10 flex flex-col justify-center">
      <Hero title="트레이너 등록" subtitle="모든 사람이 볼 수 있게 당신을 알리세요!" />
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)} className="grid grid-cols-2 gap-10 max-w-screen-lg mx-auto">
          <div className="space-y-5">
            <InputPair
              name="name"
              label="이름"
              description="실명으로 입력해주세요"
              placeholder="이름을 입력하세요"
              rules={{ required: "이름은 필수 입력입니다." }}
            />

            <InputPair
              name="tags"
              label="태그"
              description="태그 60자 이하"
              placeholder="간결하게 표현할 태그를 입력하세요"
              maxLength={60}
            />

            <InputPair
              name="description"
              label="자기소개"
              description="300자 이내로 간단한 소개를 작성하세요."
              isTextArea
              maxLength={300}
            />

            <SelectPair
              label="카테고리"
              description="카테고리입니다."
              name="category"
              required
              placeholder="카테고리를 고르세요"
              options={[
                { label: "가슴", value: "chest" },
                { label: "등", value: "back" },
                { label: "하체", value: "leg" },
                { label: "어깨", value: "sholder" },
                { label: "팔", value: "arm" },
              ]}
            />

            <Button type="submit" className="w-full" size="lg">
              제출하기
            </Button>
          </div>
          <div className="flex flex-col items-start space-y-2">
            <div className="relative size-40 rounded-xl overflow-hidden border border-white/15 shadow-xl">
              {icon ? (
                <Image
                  src={icon}
                  alt="프로필 미리보기"
                  fill
                  sizes="160px"
                  className="object-cover"
                  unoptimized
                  priority
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-white/10 text-gray-300">
                  <ImageIcon className="size-8 opacity-70" />
                </div>
              )}
            </div>
            <Label className="flex flex-col items-start gap-1">
              프로필 사진
              <small className="text-muted-foreground">
                프로필 사진을 넣어주세요
              </small>
            </Label>
            <Input
              type="file"
              accept="image/png, image/jpeg"
              className="w-1/2"
              onChange={(e) => {
                const file = e.target.files?.[0] ?? null;
                setIcon(file ? URL.createObjectURL(file) : null);
                methods.setValue("icon", file, { shouldValidate: true });
              }}
            />
            <div className="flex flex-col text-xs">
              <span className=" text-muted-foreground">
                추천 사이즈: 128x128px
              </span>
              <span className=" text-muted-foreground">
                허용 파일 포멧: PNG, JPEG
              </span>
              <span className=" text-muted-foreground">최대 파일 크기: 1MB</span>
            </div>
          </div>
        </form>
      </FormProvider>
    </div>
  );
}
