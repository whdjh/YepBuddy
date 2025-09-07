"use client";

import { useState } from "react";
import { FormProvider, useForm, SubmitHandler } from "react-hook-form";
import Image from "next/image";
import { ImageIcon } from "lucide-react";
import InputPair from "@/components/common/InputPair";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import SelectPair from "@/components/common/SelectPair";

export type FormValues = {
  name: string;
  tags: string;
  description: string;
  category: string;
  icon: File | null;
};

export default function TrainerRegistrationForm() {
  const methods = useForm<FormValues>({
    mode: "all",
    defaultValues: {
      name: "",
      tags: "",
      description: "",
      category: "",
      icon: null,
    },
  });

  const { handleSubmit, setValue, setError, clearErrors } = methods;
  const [iconPreview, setIconPreview] = useState<string | null>(null);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;

    if (!file) {
      setIconPreview(null);
      setValue("icon", null, { shouldValidate: true });
      return;
    }

    const isOkType = ["image/png", "image/jpeg"].includes(file.type);
    const isOkSize = file.size <= 1_000_000;

    if (!isOkType) {
      setError("icon", { message: "PNG 또는 JPEG 파일만 업로드하세요." });
      return;
    }
    if (!isOkSize) {
      setError("icon", { message: "파일 크기는 최대 1MB까지 허용됩니다." });
      return;
    }

    clearErrors("icon");
    setIconPreview(URL.createObjectURL(file));
    setValue("icon", file, { shouldValidate: true });
  };

  const onSubmit: SubmitHandler<FormValues> = (data) => {
    // 여기서 서버 액션 호출/업로드 로직 연결
    console.log("submit:", data);
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-2 gap-10 max-w-screen-lg mx-auto">
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
            description="카테고리를 선택하세요."
            name="category"
            required
            placeholder="카테고리를 고르세요"
            options={[
              { label: "가슴", value: "chest" },
              { label: "등", value: "back" },
              { label: "하체", value: "leg" },
              { label: "어깨", value: "shoulder" },
              { label: "팔", value: "arm" },
            ]}
          />

          <Button type="submit" className="w-full" size="lg">
            제출하기
          </Button>
        </div>

        <div className="flex flex-col items-start space-y-2">
          <div className="relative size-40 rounded-xl overflow-hidden border border-white/15 shadow-xl">
            {iconPreview ? (
              <Image
                src={iconPreview}
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
            <small className="text-muted-foreground">프로필 사진을 넣어주세요</small>
          </Label>

          <Input
            type="file"
            accept="image/png, image/jpeg"
            className="w-1/2"
            onChange={onFileChange}
          />

          <div className="flex flex-col text-xs">
            <span className="text-muted-foreground">추천 사이즈: 128x128px</span>
            <span className="text-muted-foreground">허용 파일 포맷: PNG, JPEG</span>
            <span className="text-muted-foreground">최대 파일 크기: 1MB</span>
          </div>
        </div>
      </form>
    </FormProvider>
  );
}
