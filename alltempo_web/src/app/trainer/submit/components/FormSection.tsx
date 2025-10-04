"use client";

import InputPair from "@/components/common/InputPair";
import SelectPair from "@/components/common/SelectPair";
import { FormProvider, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { TrainerSubmitFormValues } from "@/types/Form";

export default function FormSection() {
  const methods = useForm<TrainerSubmitFormValues>({
    defaultValues: {
      program: "",
      proceed: "",
      schedule: "",
      price: "",
      intro: "",
      description: "",
    },
    mode: "onBlur",
  });

  const onSubmit = methods.handleSubmit((values) => {
    console.log("submit:", values);
    // TODO: 서버 전송
  });

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={onSubmit}
        className="max-w-screen-2xl flex flex-col items-center gap-10 mx-auto"
      >
        <div className="grid grid-cols-1 tab:grid-cols-3 w-full gap-10">
          <SelectPair
            label="프로그램 유형"
            description="프로그램 유형을 선택하세요 (예: 1:1, 그룹, 온라인)"
            name="program"
            required
            placeholder="프로그램 유형"
            options={["1:1 PT", "그룹 PT(2-3인)"].map((v) => ({ label: v, value: v }))}
          />

          <SelectPair
            label="진행 방식/장소"
            description="진행 방식을 선택하세요 (예: 센터 방문, 방문 PT, 온라인)"
            name="location"
            required
            placeholder="장소 선택"
            options={["센터 방문", "방문 PT"].map((v) => ({ label: v, value: v }))}
          />

          <InputPair
            label="가능 시간대"
            description="가능한 요일과 시간을 입력하세요 (예: 평일 18–22시, 토 10–13시)"
            name="schedule"
            maxLength={120}
            placeholder="예) 평일 18:00–22:00, 토 10:00–13:00"
            rules={{ required: "필수 입력입니다." }}
          />

          <InputPair
            label="가격"
            description="가격 조건을 입력하세요 (예: 회당 가격)"
            name="price"
            maxLength={400}
            placeholder="예) 10회 75만원"
            rules={{ required: "필수 입력입니다." }}
          />

          <InputPair
            label="모집대상"
            description="모집 대상을 입력하세요 (예: 체형교정/감량, 주 2회 이상 참여가능, 초보자 환영, 자세 교정 위주)"
            name="intro"
            maxLength={400}
            isTextArea
            placeholder="예) NASM-CPT, 5년 경력(체형교정/감량)"
            rules={{ required: "필수 입력입니다." }}
          />

          <InputPair
            label="프로그램 소개"
            description="프로그램 내용을 소개하세요 (예: 프로그램 목적, 특징, 진행 방식)"
            name="description"
            maxLength={400}
            isTextArea
            rules={{ required: "필수 입력입니다." }}
          />

        </div>

        <Button
          type="submit"
          className="w-full max-w-sm"
          size="lg"
        >
          트레이너 공고 올리기
        </Button>
      </form>
    </FormProvider>
  );
}
