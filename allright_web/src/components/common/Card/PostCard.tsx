import Link from "next/link";
import {
  Card, CardFooter, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DotIcon, ChevronUpIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { PostCardProps } from "@/types/Card";

export default function PostCard({
  id,
  title,
  author,
  authorAvatarUrl,
  category,
  postedAt,
  expanded = false,
  votesCount = 0,
}: PostCardProps) {
  return (
    <Card className={cn(
      "bg-transparent hover:bg-[#26262c] border-white/10",
      expanded ? "flex flex-row items-center justify-between" : ""
      )}
    >
      <Link href={`/community/${id}`} className="block">
        <CardHeader className="flex flex-row items-center gap-2">
          <Avatar className="size-14">
            <AvatarFallback>{author[0]}</AvatarFallback>
            {authorAvatarUrl && <AvatarImage src={authorAvatarUrl} />}
          </Avatar>
          <div className="space-y-2 whitespace-nowrap">
            <CardTitle>{title}</CardTitle>
            <div className="flex gap-2 text-sm leading-tight text-muted-foreground whitespace-nowrap">
              <span>
                {author} on {category}
              </span>
              <DotIcon className="w-4 h-4" />
              <span>{postedAt}</span>
            </div>
          </div>
        </CardHeader>
      </Link>

      {!expanded && (
        <CardFooter className="flex justify-end">
          <Button variant="link" asChild>
            <Link href={`/community/${id}`}>Reply &rarr;</Link>
          </Button>
        </CardFooter>
      )}
      
      {expanded && (
        <CardFooter className="flex justify-end pb-0">
          <Button variant="outline" className="flex flex-col h-14 border border-white/10">
            <ChevronUpIcon className="size-4 shrink-0" />
            <span>{votesCount}</span>
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
