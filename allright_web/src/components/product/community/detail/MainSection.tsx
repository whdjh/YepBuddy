import { DotIcon } from "lucide-react";

export default function MainSection() {
  return (
    <div className="space-y-2">
      <h2 className="text-3xl font-bold">
        등운동은 어떤게 제일 좋나요?
      </h2>
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>@wngns</span>
        <DotIcon className="size-5" />
        <span>12시간전</span>
        <DotIcon className="size-5" />
        <span>0개의 응답</span>
      </div>
      <p className="text-muted-foreground w-3/4">
        등 운동을 하는데 너무 안되서 고민이야. 어떤 등운동이 등 기둥을 만드는데 효과적일까? 자세히알려줘!!자세히알려줘!!자세히알려줘!!자세히알려줘!!자세히알려줘!!
      </p>
    </div>
  );
}