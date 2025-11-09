"use client";

import CardSection from "./CardSection";
import type { GymDetail } from "@/lib/gyms/getGymById";

interface Props {
  gym: GymDetail | null;
}

export default function MainSection({ gym }: Props) {

  return (
    <div className="max-w-screen mx-auto flex flex-col items-center gap-10">
      <CardSection gymId={gym?.gym_id ?? 0} />
    </div>
  );
}
