import { DotIcon } from "lucide-react";

export default function MainSection() {
  return (
    <div className="space-y-2">
      <h2 className="text-3xl font-bold">
        신타6
      </h2>
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>초코맛</span>
        <DotIcon className="size-5" />
        <span>2.5kg</span>
      </div>
      <p className="text-muted-foreground max-w-full whitespace-normal [overflow-wrap:anywhere]">
        지원예정
      </p>
    </div>
  );
}