import FormSection from "@/app/my/settings/components/FormSection";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "개인정보 수정 | Allright",
  description: "개인정보 수정 페이지 입니다.",
};

export default function EditProfile() {
  return (
    <FormSection />
  );
}