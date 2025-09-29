import Link from "next/link";
import {
  Card, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { DotIcon } from "lucide-react";
import { ProteinCardProps } from "@/types/Card";

export default function ProteinCard({
  id,
  title,
  weigth,
  authorAvatarUrl,
  topic,
}: ProteinCardProps) {
  return (
    <Card className="bg-transparent hover:bg-[#26262c]">
      <Link href={`/protein/${id}`} className="block">
        <CardHeader className="flex flex-row items-center gap-2">
          <Avatar className="size-14">
            <AvatarFallback>N</AvatarFallback>
            {authorAvatarUrl && <AvatarImage src={authorAvatarUrl} />}
          </Avatar>
          <div className="space-y-2 whitespace-nowrap">
            <CardTitle>
              {title.length > 15 ? `${title.slice(0, 15)}...` : title}
            </CardTitle>
            <div className="flex gap-2 text-sm leading-tight text-muted-foreground whitespace-nowrap">
              <span>{weigth}</span>
              <DotIcon className="size-5" />
              <span>{topic}</span>
            </div>
          </div>
        </CardHeader>
      </Link>
    </Card>
  );
}
