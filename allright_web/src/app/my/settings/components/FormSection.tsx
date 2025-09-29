"use client";

import { useEffect, useState } from "react";
import { FormProvider, useForm, SubmitHandler } from "react-hook-form";
import InputPair from "@/components/common/InputPair";
import SelectPair from "@/components/common/SelectPair";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const ACCEPTED_TYPES = ["image/png", "image/jpeg"];
const MAX_SIZE = 1 * 1024 * 1024;

interface FormValues {
  name: string;
  role: string;
  location: string;
  history: string;
  qualifications: string;
  description: string;
  avatar?: File | null;
  avatarFile?: FileList | null; // 폼 내부 바인딩용이니 서버로 보내지 않도록 주의
}

export default function FormSection() {
  const methods = useForm<FormValues>({
    mode: "all",
    defaultValues: {
      name: "",
      role: "",
      location: "",
      history: "",
      qualifications: "",
      description: "",
      avatar: null,
      avatarFile: null,
    },
  });

  const validateFile = (file?: File | null) => {
    if (!file) return true;
    if (!ACCEPTED_TYPES.includes(file.type)) return "PNG 또는 JPEG만 허용";
    if (file.size > MAX_SIZE) return "최대 1MB까지 업로드 가능";
    return true;
  };

  const { handleSubmit, register, watch, setValue, formState } = methods;
  const [preview, setPreview] = useState<string | null>(null);

  const avatar = watch("avatar");

  useEffect(() => {
    if (!avatar) { setPreview(null); return; }
    const url = URL.createObjectURL(avatar);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [avatar]);

  const onSubmit: SubmitHandler<FormValues> = (data) => {
    console.log("submit:", data);
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-20 p-2 tab:p-5">
        <div className="grid grid-cols-1 tab:grid-cols-6 gap-10">
          <div className="col-span-full tab:col-span-4 space-y-10">
            <h2 className="text-2xl font-semibold">프로필 수정하기</h2>
            <div className="flex flex-col gap-5">
              <InputPair
                label="이름"
                description="이름을 입력하세요"
                required
                id="name"
                name="name"
                placeholder="이름을 입력하세요"
                rules={{ required: "이름을 입력하세요" }}
              />
              <SelectPair
                label="구분"
                description="트레이너 또는 회원을 고르세요"
                name="role"
                placeholder="트레이너 또는 회원"
                options={[
                  { label: "트레이너", value: "trainer" },
                  { label: "회원", value: "member" },
                ]}
              />
              {/** 장소 api로 변경 예정 */ }
              <InputPair
                label="근무지"
                description="근무지를 적어보세요."
                required
                id="location"
                name="location"
                placeholder="근무지를 입력하세요"
                rules={{ required: "근무지를 입력하세요" }}
              />
              <InputPair
                label="경력"
                description="경력을 적어보세요."
                required
                id="history"
                name="history"
                isTextArea
                rules={{ required: "경력을 입력하세요" }}
              />
              <InputPair
                label="자격증"
                description="자격증을 적어보세요."
                required
                id="qualifications"
                name="qualifications"
                isTextArea
                rules={{ required: "자격증을 입력하세요" }}
              />
              <InputPair
                label="자기소개"
                description="자기소개를 적어보세요."
                required
                id="description"
                name="description"
                isTextArea
                rules={{ required: "자기소개를 입력하세요" }}
              />
            </div>
          </div>

          <div className="col-span-full tab:col-span-2 p-6 rounded-lg border border-white/10 shadow-md">
            <Label htmlFor="avatarFile" className="flex flex-col gap-1">
              프로필
              <small className="text-muted-foreground">프로필 이미지를 업로드 해보세요.</small>
            </Label>

            <div className="space-y-5">
              <div className="flex justify-center">
                <div className="inline-block overflow-hidden rounded-lg bg-black/10">
                {preview ? (
                  <img
                    src={preview}
                    alt="avatar preview"
                    className="w-auto h-auto rounded-full max-w-full max-h-64 object-contain mt-4"
                  />
                ) : (
                  <span className="block p-6 text-xs text-muted-foreground">미리보기 없음</span>
                  )}
                  </div>
              </div>

              <Input
                id="avatarFile"
                type="file"
                accept="image/png,image/jpeg"
                {...register("avatarFile", {
                  validate: (fl) => validateFile(fl?.[0] ?? null),
                  onChange: (e) => {
                    const file = (e.target as HTMLInputElement).files?.[0] ?? null;
                    setValue("avatar", file, { shouldValidate: true, shouldDirty: true });
                  },
                })}
              />
              {formState.errors.avatarFile && (
                <p className="text-xs text-red-500">
                  {String(formState.errors.avatarFile.message)}
                </p>
              )}

              <div className="flex flex-col text-xs">
                <span className="text-muted-foreground">추천 사이즈: 128x128px</span>
                <span className="text-muted-foreground">허용 형식: PNG, JPEG</span>
                <span className="text-muted-foreground">최대 파일 크기: 1MB</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-start">
          <Button
            type="submit"
            className="w-full"
            disabled={!formState.isValid || formState.isSubmitting}
          >
            {formState.isSubmitting ? "저장 중..." : "프로필 수정하기"}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}
