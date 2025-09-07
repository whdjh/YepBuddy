'use client';

import { Hero } from "@/components/common/hero";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import Input from "@/components/common/Input";
import { FormProvider, SubmitHandler, useForm, Controller } from 'react-hook-form';
import { useState } from "react";

type FormValues = {
  name: string;
  tags: string;
  description: string;
  category: string;
};

const options = [
  { label: "AI", value: "ai" },
  { label: "Design", value: "design" },
  { label: "Marketing", value: "marketing" },
  { label: "Development", value: "development" },
];

export default function Submit() {
  const [open, setOpen] = useState(false);

  const methods = useForm<FormValues>({
    mode: "all",
    defaultValues: {
      name: "",
      tags: "",
      description: "",
      category: "",
    },
    shouldUnregister: false,
  });

  const onSubmit: SubmitHandler<FormValues> = (data) => {
    console.log("submit:", data);
  };

  return (
    <div className="space-y-10">
      <Hero title="트레이너 등록" subtitle="모든 사람이 볼 수 있게 당신을 알리세요!" />

      <FormProvider {...methods}>
        <form
          onSubmit={methods.handleSubmit(onSubmit)}
          noValidate
          className="grid grid-cols-2 gap-10 max-w-screen-lg mx-auto"
        >
          <div className="space-y-5">
            <Input
              name="name"
              label="이름"
              placeholder="트레이너 이름을 입력하세요."
              rules={{
                required: "이름은 필수 입력입니다.",
                pattern: {
                  value: /^[가-힣]+$/,
                  message: "한글만 입력 가능합니다.",
                },
              }}
            />

            <Input
              name="tags"
              label="태그"
              placeholder="태그로 간단하게 입력하세요."
              rules={{
                required: "태그 입력은 필수 입력입니다.",
                pattern: {
                  value: /^[가-힣]+$/,
                  message: "한글만 입력 가능합니다.",
                },
              }}
            />
            <Input
              name="description"
              label="자기소개"
              placeholder="자기소개를 입력하세요."
              rules={{
                required: "자기소개는 필수 입력입니다.",
                pattern: {
                  value: /^[가-힣]+$/,
                  message: "한글만 입력 가능합니다.",
                },
              }}
            />

            {/* Select ← RHF Controller로 연동 */}
            <div>
              <Controller
                name="category"
                control={methods.control}
                rules={{ required: "카테고리를 선택하세요." }}
                render={({ field, fieldState }) => (
                  <div className="space-y-1.5">
                    <Select
                      open={open}
                      onOpenChange={setOpen}
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger className="min-w-[15rem]">
                        <SelectValue placeholder="카테고리를 클릭해주세요." />
                      </SelectTrigger>
                      <SelectContent>
                        {options.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {fieldState.error && (
                      <p className="text-sm text-red-400">{fieldState.error.message}</p>
                    )}
                  </div>
                )}
              />
            </div>

            <Button
              type="submit"
            >
              등록하기
            </Button>
          </div>
        </form>
      </FormProvider>
    </div>
  );
}
