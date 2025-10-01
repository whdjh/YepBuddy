import { StarIcon } from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { ReviewCardProps } from "@/types/Card";

export function ReviewCard({
  name,
  handle,
  avatarFile,
  rating,
  content,
  postedAt,
}: ReviewCardProps) {
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <Avatar>
          <AvatarFallback>{name[0]}</AvatarFallback>
          <AvatarImage src={avatarFile} />
        </Avatar>
        <div>
          <h4 className="text-lg font-bold">{name}</h4>
          <p className="text-sm text-muted-foreground">{handle}</p>
        </div>
      </div>
      <div className="flex text-yellow-400">
        {Array.from({ length: rating }).map((_, i) => (
          <StarIcon key={i} className="size-4" fill="currentColor" />
        ))}
      </div>
      <p className="text-muted-foreground">{content}</p>
      <span className="text-xs text-muted-foreground">{postedAt}</span>
    </div>
  );
}