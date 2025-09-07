import Link from "next/link";
import {
  Card, CardFooter, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DotIcon } from "lucide-react";

interface PostCardProps {
  id: string;
  title: string;
  author: string;
  authorAvatarUrl: string;
  category: string;
  postedAt: string;
}

export default function PostCard({
  id,
  title,
  author,
  authorAvatarUrl,
  category,
  postedAt,
}: PostCardProps) {
  return (
    <Card>
      <Link href={`/community/${id}`} className="block">
        <CardHeader className="flex flex-row items-center gap-2">
          <Avatar className="size-14">
            <AvatarFallback>{author[0]}</AvatarFallback>
            {authorAvatarUrl && <AvatarImage src={authorAvatarUrl} />}
          </Avatar>
          <div className="space-y-2">
            <CardTitle>{title}</CardTitle>
            <div className="flex gap-2 text-sm leading-tight text-muted-foreground">
              <span>
                {author} on {category}
              </span>
              <DotIcon className="w-4 h-4" />
              <span>{postedAt}</span>
            </div>
          </div>
        </CardHeader>
      </Link>

      <CardFooter className="flex justify-end">
        <Button variant="link" asChild>
          <Link href={`/community/${id}`}>Reply &rarr;</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
