import Link from "next/link";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DotIcon, EyeIcon, HeartIcon, LockIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface IdeaCardProps {
  id: string;
  title: string;
  viewsCount: number;
  postedAt: string;
  likesCount: number;
  claimed?: boolean;
}

export default function IdeaCard({
  id,
  title,
  viewsCount,
  postedAt,
  likesCount,
  claimed,
}: IdeaCardProps) {
  return (
    <Card className="bg-transparent hover:bg-[#26262c] border-white/10">
      <CardHeader>
        <Link href={`/ideas/${id}`}>
          <CardTitle className="text-xl">
            <span className={cn(claimed ? "bg-[currentColor]" : "")}>
              {title}
            </span>
          </CardTitle>
        </Link>
      </CardHeader>
      <CardContent className="flex items-center text-sm text-gray-300">
        <div className="flex items-center gap-1 whitespace-nowrap">
          <EyeIcon className="w-4 h-4" />
          <span>{viewsCount}</span>
        </div>
        <DotIcon className="w-4 h-4 opacity-70" />
        <span className="text-gray-400">{postedAt}</span>
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        <Button variant="outline" className="border border-white/10">
          <HeartIcon className="w-4 h-4" />
          <span>{likesCount}</span>
        </Button>
        {!claimed ? (
          <Button variant={"outline"} asChild>
            <Link href={`/ideas/${id}`}>자세히보기 &rarr;</Link>
          </Button>
        ) : (
          <Button variant="outline" disabled className="cursor-not-allowed">
            <LockIcon className="size-4" />
            잠금
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
