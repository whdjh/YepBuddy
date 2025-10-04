import {
  Card,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { EyeIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { NotificationCardProps } from "@/types/Card";

export default function NotificationCard({
  avatarFile,
  avatarFallback,
  name,
  message,
  timestamp,
  seen,
}: NotificationCardProps) {
  return (
    <Card className={cn("w-full min-w-0 bg-transparent", seen ? "" : "border-yellow-500/60")}>
      <CardHeader className="flex flex-row gap-5 space-y-0 items-start">
        <Avatar className="">
          <AvatarImage src={avatarFile} />
          <AvatarFallback>{avatarFallback}</AvatarFallback>
        </Avatar>
        <div>
          <CardTitle className="text-lg space-y-0 font-bold">
            <span>{name}</span>
            <span>{message}</span>
          </CardTitle>
          <small className="text-muted-foreground text-sm">{timestamp}</small>
        </div>
      </CardHeader>
      <CardFooter className="flex justify-end">
        <Button variant="outline" size="icon">
          <EyeIcon className="w-4 h-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}