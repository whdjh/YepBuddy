import Link from "next/link";
import { Button } from "@/components/ui/button";

interface TopicSectionProps {
  topics: string[];
  makeHref: (updates: Record<string, string | null>) => string;
}

export function TopicSection({ topics, makeHref }: TopicSectionProps) {
  return (
    <div className="col-span-2 space-y-5">
      <span className="text-sm font-bold text-muted-foreground">토픽</span>
      <div className="flex flex-col gap-2 items-start">
        {topics.map((category) => (
          <Button asChild variant="link" key={category} className="pl-0">
            <Link href={makeHref({ topic: category })}>{category}</Link>
          </Button>
        ))}
      </div>
    </div>
  );
}
