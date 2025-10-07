import { MessageCircleIcon } from "lucide-react";

export default function EmptyMessage() {
  return (
    <div className="flex flex-col gap-5 items-center justify-center flex-1">
      <MessageCircleIcon className="size-12 text-muted-foreground" />
      <h1 className="text-xl text-muted-foreground font-semibold">
        사이드바에서 대화방을 클릭하세요!
      </h1>
    </div>
  );
}