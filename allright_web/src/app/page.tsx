import AssistanceSection from "@/app/components/AssistanceSection";
import GymSection from "@/app/components/GymSection";
import TrainerSection from "@/app/components/TrainerSection";

export default function Home() {
  return (
    <div className="pt-0 tab:pt-5 px-5 tab:px-20 space-y-20">
      <AssistanceSection />
      <GymSection />
      <TrainerSection />
    </div >
  );
}
