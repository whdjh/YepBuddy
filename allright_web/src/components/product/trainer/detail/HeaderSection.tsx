import { StarIcon, ChevronUpIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HeaderSection({
  title,
  description,
  rating = 5,
  reviewCount = 100,
  voteCount = 100,
}: {
  title: string;
  description: string;
  rating?: number;
  reviewCount?: number;
  voteCount?: number;
}) {
  return (
    <div className="flex justify-between">
      <div className="flex gap-10">
        <div className="size-40 rounded-xl shadow-xl bg-red-100/50" />
        <div>
          <h1 className="text-5xl font-bold">{title}</h1>
          <p className="text-2xl font-light">{description}</p>
          <div className="mt-5 flex items-center gap-2">
            <div className="flex text-yellow-400">
              {Array.from({ length: 5 }).map((_, i) => (
                <StarIcon
                  key={i}
                  className="size-4"
                  fill={i < rating ? "currentColor" : "none"}
                  stroke="currentColor"
                />
              ))}
            </div>
            <span className="text-muted-foreground">{reviewCount} reviews</span>
          </div>
        </div>
      </div>

      <div className="flex gap-5 items-center">
        <Button size="lg" className="text-lg h-14 px-10">
          <ChevronUpIcon className="size-4" />
          투표하기 ({voteCount})
        </Button>
      </div>
    </div>
  );
}
