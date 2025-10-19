"use client";

import { useEffect, useState } from "react";
import { FormProvider, useForm, SubmitHandler } from "react-hook-form";
import { Button } from "@/components/ui/button";
import InputPair from "@/components/common/InputPair";
import SelectPair from "@/components/common/SelectPair";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { UserSettingFormValues } from "@/types/Form";
import { useProfileUpdate } from "@/hooks/queries/profile/useProfileUpdate";
import { useRouter } from "next/navigation";
import { useMe } from "@/hooks/queries/auth/useMe";
import { useProfileRefresh } from "@/stores/useProfileRefresh";

export default function FormSection() {
  const router = useRouter();
  const { data: meData } = useMe();
  const bump = useProfileRefresh((s) => s.bump);

  const { mutateAsync: updateProfile, isPending } = useProfileUpdate();

  const methods = useForm<UserSettingFormValues>({
    mode: "all",
    shouldUnregister: true,
    defaultValues: {
      name: "",
      role: "member",
      location: "",
      history: "",
      qualifications: "",
      description: "",
      avatarFile: null,
      avatar: null,
    },
  });

  const { handleSubmit, register, watch, setValue, formState } = methods;
  const [preview, setPreview] = useState<string | null>(null);

  const role = watch("role");
  const isTrainer = role === "trainer";
  const avatarFile = watch("avatarFile");

  useEffect(() => {
    if (!avatarFile) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(avatarFile);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [avatarFile]);

  // 콤마 입력을 백엔드 저장용 문자열(줄바꿈)으로 정규화
  const normalizeCommaToMultiline = (s?: string | null) =>
    (s ?? "")
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean)
      .join("\n");

  const onSubmit: SubmitHandler<UserSettingFormValues> = async (data) => {
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("role", data.role);
    formData.append("location", data.location ?? "");
    formData.append("history", normalizeCommaToMultiline(data.history));
    formData.append("qualifications", normalizeCommaToMultiline(data.qualifications));
    formData.append("description", data.description ?? "");
    if (data.avatarFile) formData.append("avatarFile", data.avatarFile);

    try {
      const res = await updateProfile(formData);
      if (!res.ok) {
        alert(res.error || "프로필 수정 실패");
        return;
      }
      bump();
      alert("프로필이 수정되었습니다!");

      const username = meData?.ok ? meData.user.username : null;
      if (username) {
        router.push(`/users/${username}?tab=abouts`);
      }
    } catch {
      alert("서버 오류가 발생했습니다.");
    }
  };

  const validateFile = (file?: File | null) => {
    if (!file) return true;
    if (!["image/png", "image/jpeg"].includes(file.type)) return "PNG 또는 JPEG만 허용";
    if (file.size > 1 * 1024 * 1024) return "최대 1MB까지 업로드 가능";
    return true;
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
              <InputPair
                label="자기소개"
                description="자기소개를 적어보세요."
                required
                id="description"
                name="description"
                isTextArea
                rules={{ required: "자기소개를 입력하세요" }}
              />

              {isTrainer && (
                <>
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
                    description="콤마(,)로 구분하여 경력을 적어주세요."
                    required
                    id="history"
                    name="history"
                    isTextArea
                    rules={{ required: "경력을 입력하세요" }}
                  />
                  <InputPair
                    label="자격증"
                    description="콤마(,)로 구분하여 자격증을 적어주세요."
                    required
                    id="qualifications"
                    name="qualifications"
                    isTextArea
                    rules={{ required: "자격증을 입력하세요" }}
                  />
                </>
              )}
            </div>
          </div>

          <div className="col-span-full tab:col-span-2 p-6 rounded-lg border border-white/10 shadow-md">
            <Label htmlFor="avatar" className="flex flex-col gap-1">
              프로필
              <small className="text-muted-foreground">프로필 이미지를 업로드 해보세요.</small>
            </Label>

            <div className="space-y-5">
              <div className="flex justify-center">
                <div className="size-40 rounded-full overflow-hidden bg-black/10">
                  {preview ? (
                    <img src={preview} alt="avatar preview" className="w-full h-full object-cover" />
                  ) : (
                    <span className="flex items-center justify-center w-full h-full text-xs text-muted-foreground">
                      미리보기 없음
                    </span>
                  )}
                </div>
              </div>

              <Input
                id="avatar"
                type="file"
                accept="image/png,image/jpeg"
                {...register("avatar", {
                  validate: (fl) => validateFile(fl?.[0] ?? null),
                  onChange: (e) => {
                    const input = e.target as HTMLInputElement;
                    const file = input.files?.[0] ?? null;
                    setValue("avatarFile", file, { shouldValidate: true, shouldDirty: true });
                    input.value = "";
                  },
                })}
              />

              {formState.errors.avatar && (
                <p className="text-xs text-red-500">{String(formState.errors.avatar.message)}</p>
              )}

              <div className="flex flex-col text-xs text-muted-foreground">
                <span>추천 사이즈: 128x128px</span>
                <span>허용 형식: PNG, JPEG</span>
                <span>최대 파일 크기: 1MB</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-start">
          <Button type="submit" className="w-full" disabled={!formState.isValid || isPending}>
            {isPending ? "저장 중..." : "프로필 수정하기"}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}
