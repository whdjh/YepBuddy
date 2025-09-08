import { Hero } from "@/components/common/Hero";
import TrainerRegistrationForm from "@/components/product/trainer/submit/TrainerRegistrationForm";

export default function Submit() {
  return (
    <div className="space-y-10 flex flex-col justify-center">
      <Hero title="트레이너 등록" subtitle="모든 사람이 볼 수 있게 당신을 알리세요!" />
      <TrainerRegistrationForm />
    </div>
  );
}