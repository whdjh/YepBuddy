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
  description: string;
  avatar?: File | null;
};

export default function FormSection() {
  const methods = useForm<FormValues>({
    mode: "all",
    defaultValues: {
      name: "",
      role: "",
      description: "",
      avatar: null,
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

  const avatarFile = watch("avatar");
  useEffect(() => {
    if (!avatarFile) { setPreview(null); return; }
    const url = URL.createObjectURL(avatarFile as File);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [avatarFile]);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setValue("avatar", file, { shouldValidate: true, shouldDirty: true });
  };

  const onSubmit: SubmitHandler<FormValues> = (data) => {
    console.log("submit:", data);
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-20 p-15">
        <div className="flex">
          <div className="col-span-4 flex flex-col w-1/2 gap-10">
            <h2 className="text-2xl font-semibold">프로필 수정하기</h2>

            <div className="flex flex-col w-1/2 gap-5 ">
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

          <div className="col-span-2 p-6 rounded-lg border border-white/10 shadow-md">
            <Label className="flex flex-col gap-1">
              이미지
              <small className="text-muted-foreground">이미지를 업로드 해보세요.</small>
            </Label>

            <div className="space-y-5">
              <div className="size-40 rounded-full shadow-xl overflow-hidden bg-black/10">
                {preview && (
                  <img
                    src={preview}
                    className="object-cover w-full h-full"
                    alt="avatar preview"
                  />
                )}
              </div>

              <Input
                type="file"
                className="w-1/2"
                accept="image/png,image/jpeg"
                onChange={onFileChange}
              />
              {/* RHF에 파일 필드 등록 + 커스텀 검증 */}
              <input
                type="hidden"
                {...register("avatar", { validate: (f) => validateFile(f as File | null) })}
              />
              {formState.errors.avatar && (
                <p className="text-xs text-red-500">{String(formState.errors.avatar.message)}</p>
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
