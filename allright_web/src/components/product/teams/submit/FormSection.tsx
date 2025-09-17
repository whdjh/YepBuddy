"use client";

import InputPair from "@/components/common/InputPair";
import SelectPair from "@/components/common/SelectPair";
import { FormProvider, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { PROGRAM_TYPES, LOCATION_MODES } from "@/constants/team";

type FormValues = {
  programType: string;
  locationMode: string;
  schedule: string;
  pricePolicy: string;
  trainerIntro: string;
  contact: string;
};

export default function FormSection() {
  const methods = useForm<FormValues>({
    defaultValues: {
      programType: "",
      locationMode: "",
      schedule: "",
      pricePolicy: "",
      trainerIntro: "",
      contact: "",
    },
    mode: "onBlur",
  });

  const onSubmit = methods.handleSubmit((values) => {
    console.log("submit:", values);
    // TODO: 서버 전송
  });

  return (
    <FormProvider {...methods}>
      <form onSubmit={onSubmit} className="max-w-screen-2xl flex flex-col items-center gap-10 mx-auto">
        <div className="grid grid-cols-3 w-full gap-10">
          <SelectPair
            label="프로그램 유형"
            description="1:1 / 그룹 / 온라인"
            name="programType"
            required
            placeholder="프로그램 유형"
            options={PROGRAM_TYPES.map((v) => ({ label: v, value: v }))}
          />

          <SelectPair
            label="진행 방식/장소"
            description="센터 방문 / 방문 PT / 온라인"
            name="locationMode"
            required
            placeholder="장소 선택"
            options={LOCATION_MODES.map((v) => ({ label: v, value: v }))}
          />

          <InputPair
            label="스케줄"
            description="가능 요일·시간대 (예: 평일 18–22시, 토 10–13시)"
            name="schedule"
            maxLength={120}
            placeholder="예) 평일 18:00–22:00, 토 10:00–13:00"
            rules={{ required: "필수 입력입니다." }}
          />

          <InputPair
            label="가격/정책"
            description="회당/패키지 가격, 유효기간, 환불·연기·노쇼"
            name="pricePolicy"
            maxLength={400}
            isTextArea
            placeholder="예) 10회 75만원 · 유효 8주 · 노쇼 시 1회 차감"
            rules={{ required: "필수 입력입니다." }}
          />

          <InputPair
            label="트레이너 소개"
            description="자격·경력·전문 분야"
            name="trainerIntro"
            maxLength={400}
            isTextArea
            placeholder="예) NASM-CPT, 5년 경력(체형교정/감량)"
            rules={{ required: "필수 입력입니다." }}
          />

          <InputPair
            label="신청/연락 방법"
            description="카톡 ID / 전화번호 / 신청폼 URL 중 택1"
            name="contact"
            maxLength={120}
            placeholder="예) 카톡 @trainer_jh"
            rules={{ required: "필수 입력입니다." }}
          />
        </div>

        <Button type="submit" className="w-full max-w-sm" size="lg">
          PT 공고 올리기
        </Button>
      </form>
    </FormProvider>
  );
}
