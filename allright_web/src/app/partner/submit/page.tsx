"use client";

import { FormProvider, useForm } from "react-hook-form";
import { Hero } from "@/components/common/Hero";
import { Button } from "@/components/ui/button";
import FormSection from "@/components/product/partner/submit/FormSection";

type FormValues = {
  position: string;
  overview: string;
  responsibilities: string;
  qualifications: string;
  benefits: string;
  gymName: string;
  gymLogoUrl: string;
  gymLocation: string;
  partnerType: string;
  partnerLocation: string;
  timeRange: string;
};

export default function PartnerPost() {
  const methods = useForm<FormValues>({
    defaultValues: {
      position: "",
      overview: "",
      responsibilities: "",
      qualifications: "",
      benefits: "",
      gymName: "",
      gymLogoUrl: "",
      gymLocation: "",
      partnerType: "",
      partnerLocation: "",
      timeRange: "",
    },
    mode: "onBlur",
  });

  const onSubmit = methods.handleSubmit((values) => {
    console.log("submit:", values);
    // TODO: 서버 전송
  });

  return (
    <div>
      <Hero title="파트너 등록" subtitle="파트너를 모집해보세요!" />

      <FormProvider {...methods}>
        <form onSubmit={onSubmit} className="max-w-screen-2xl flex flex-col items-center gap-10 mx-auto">
          <FormSection />
          <Button type="submit" className="w-full max-w-sm" size="lg">
            파트너 구하기
          </Button>
        </form>
      </FormProvider>
    </div>
  );
}
