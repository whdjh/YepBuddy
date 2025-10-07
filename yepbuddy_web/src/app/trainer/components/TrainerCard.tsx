import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChevronUpIcon, EyeIcon, MessageCircleIcon } from "lucide-react";
import { TrainerCardProps } from "@/types/Card";

export default function TrainerCard({
  id,
  avatarFile,
  name,
  description,
  commentsCount,
  viewsCount,
  votesCount,
}: TrainerCardProps) {
  return (
    <Link href={`/trainer/${id}`}>
      <Card className="bg-transparent hover:bg-[#26262c] flex flex-row justify-between">
        <CardHeader>
          <div className="flex items-center gap-5" >
            <div className="bg-white/10 rounded-3xl p-8">
              <div className="aspect-square max-w-md mx-auto flex items-center justify-center">
                <p>{avatarFile}</p>
              </div>
            </div>
            <div className="flex flex-col">
              <CardTitle className="text-2xl font-semibold ">
                {name}
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                {description}
              </CardDescription>
              <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center gap-px text-xs text-muted-foreground whitespace-nowrap">
                  <MessageCircleIcon className="w-4 h-4" />
                  <span>{commentsCount}</span>
                </div>
                <div className="flex items-center gap-px text-xs text-muted-foreground whitespace-nowrap">
                  <EyeIcon className="w-4 h-4" />
                  <span>{viewsCount}</span>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardFooter>
          <Button
            variant="outline"
            className="flex flex-col h-14 border"
          >
            <ChevronUpIcon className="size-4 shrink-0" />
            <span>{votesCount}</span>
          </Button>
        </CardFooter>
      </Card>
    </Link>
  );
}
