"use client";

import { useEffect, useState } from "react";
import { FormProvider, useForm, SubmitHandler } from "react-hook-form";
import InputPair from "@/components/common/InputPair";
import SelectPair from "@/components/common/SelectPair";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { UserSettingFormValues } from "@/types/Form";
import { useRouter } from "next/navigation";
import { useMeQuery, useUpdateMeMutation } from "@/hooks/queries/me/useMe";

export default function FormSection() {
  const router = useRouter();

  // 1) 내 프로필 조회 (React Query)
  const { data: meData, isLoading: meLoading } = useMeQuery();

  // 2) 프로필 업데이트 (React Query)
  const updateMe = useUpdateMeMutation();

  const methods = useForm<UserSettingFormValues>({
    mode: "onChange",
    shouldUnregister: true,
    defaultValues: {
      name: "",
      role: "", // "trainer" | "member"
      location: "",
      history: "",
      qualifications: "",
      description: "",
      avatarFile: null,
      avatar: null,
    },
  });

  const {
    handleSubmit,
    register,
    watch,
    setValue,
    reset,
    formState: { isValid, isSubmitting, errors, isDirty },
  } = methods;

  const role = watch("role");
  const isTrainer = role === "trainer";
  const avatarFile = watch("avatarFile");

  // ---- (A) 초기값: /api/auth/me 결과로 name(role 포함 시 role도) 주입 ----
  useEffect(() => {
    if (meData?.ok) {
      reset((prev) => ({
        ...prev,
        name: meData.user.displayName ?? "",
        role: prev.role || "member", // /api/auth/me가 role을 내려주면 그 값으로 교체
      }));
    }
  }, [meData, reset]);

  // ---- (B) 파일 미리보기 ----
  const [preview, setPreview] = useState<string | null>(null);
  useEffect(() => {
    if (!avatarFile) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(avatarFile);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [avatarFile]);

  // ---- (C) 파일 검증 ----
  const validateFile = (file?: File | null) => {
    if (!file) return true;
    if (!["image/png", "image/jpeg"].includes(file.type)) return "PNG 또는 JPEG만 허용";
    if (file.size > 1 * 1024 * 1024) return "최대 1MB까지 업로드 가능";
    return true;
  };

  // ---- (D) 제출: React Query 뮤테이션 사용 ----
  const onSubmit: SubmitHandler<UserSettingFormValues> = async (v) => {
    const isTrainer = v.role === "trainer";
    const body = {
      name: v.name.trim(),
      role: (v.role || "member") as "trainer" | "member",
      description: (v.description || "").trim(),
      location: isTrainer ? (v.location || "").trim() : null,
      history: isTrainer ? (v.history || "").trim() : null,
      qualifications: isTrainer ? (v.qualifications || "").trim() : null,
    };

    const res = await updateMe.mutateAsync(body);
    if (!res.ok) {
      alert(res.error || "저장 실패");
      return;
    }

    // 폼 상태 정리 + 헤더/브릿지 갱신
    reset({ ...methods.getValues() }, { keepDirty: false, keepValues: true });
    router.refresh();
    alert("저장되었습니다.");
  };

  // 로딩 처리
  if (meLoading) {
    return (
      <div className="p-5 text-sm text-muted-foreground">
        프로필을 불러오는 중…
      </div>
    );
  }

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-20 p-2 tab:p-5">
        <div className="grid grid-cols-1 tab:grid-cols-6 gap-10">
          <div className="col-span-full tab:col-span-4 space-y-10">
            <h2 className="text-2xl font-semibold">프로필 수정하기</h2>

            <div className="flex flex-col gap-5">
              {/* 공통 필드 */}
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

              {/* 트레이너 전용 */}
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

          {/* 프로필 이미지 업로더(선택) — 업로드는 다음 단계에서 */}
          <div className="col-span-full tab:col-span-2 p-6 rounded-lg border border-white/10 shadow-md">
            <Label htmlFor="avatar" className="flex flex-col gap-1">
              프로필
              <small className="text-muted-foreground">프로필 이미지를 업로드 해보세요.</small>
            </Label>

            <div className="space-y-5">
              <div className="flex justify-center">
                <div className="size-40 rounded-full overflow-hidden bg-black/10">
                  {preview ? (
                    <img
                      src={preview}
                      alt="avatar preview"
                      className="w-full h-full object-cover"
                    />
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
                    input.value = ""; // 동일 파일 재선택 허용
                  },
                })}
              />
              {errors.avatar && (
                <p className="text-xs text-red-500">{String(errors.avatar.message)}</p>
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
            disabled={!isValid || isSubmitting || !isDirty || updateMe.isPending}
          >
            {isSubmitting || updateMe.isPending ? "저장 중..." : "프로필 수정하기"}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}
