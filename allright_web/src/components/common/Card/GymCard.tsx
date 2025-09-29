import Link from "next/link";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DotIcon, EyeIcon, HeartIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface GymCardProps {
  id: string;
  title: string;
  viewsCount: number;
  postedAt: string;
  likesCount: number;
  claimed?: boolean;
}

export default function GymCard({
  id,
  title,
  viewsCount,
  postedAt,
  likesCount
}: GymCardProps) {
  return (
    <Card className="bg-transparent hover:bg-[#26262c] border-white/10">
      <CardHeader>
        <Link href={`/gym/${id}`}>
          <CardTitle className="text-xl">
            <span>
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
        <Button variant={"outline"} asChild>
          <Link href={`/gym/${id}`}>자세히보기 &rarr;</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
