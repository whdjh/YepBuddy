import {
  ScrollVelocityContainer,
  ScrollVelocityRow
} from "@/components/ui/scroll-based-velocity";

export default function SlideSection() {
  return (
    <div className="relative">
      <ScrollVelocityContainer className="text-4xl font-bold">
        <ScrollVelocityRow baseVelocity={20} direction={1}>
          무겁게 들어 🏋️
        </ScrollVelocityRow>
        <ScrollVelocityRow baseVelocity={20} direction={-1}>
          내일 커진다 💥
        </ScrollVelocityRow>
      </ScrollVelocityContainer>
    </div>
  );
}