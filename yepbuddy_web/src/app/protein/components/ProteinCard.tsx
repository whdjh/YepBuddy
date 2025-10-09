// TODO: 저점일때만 뱃지형식으로 보여지게
import Link from "next/link";
import {
  Card, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { DotIcon, HeartIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProteinCardProps } from "@/types/Card";

export default function ProteinCard({
  id,
  title,
  weight,
  avatarFile,
  topic,
  taste,
  price,
  likesCount,
}: ProteinCardProps) {
  return (
    <Card className="bg-transparent hover:bg-[#26262c]">
      <Link href={`/protein/${id}`} className="block">
        <CardHeader className="flex flex-col items-start mob:flex-row mob:justify-between mob:items-center">
          <div className="flex items-center gap-4">
            <Avatar className="size-20 mob:size-30 rounded-none">
              <AvatarFallback>N</AvatarFallback>
              {avatarFile && <AvatarImage src={avatarFile} />}
            </Avatar>
            <div className="space-y-2 whitespace-nowrap">
              <CardTitle>
                {title.length > 15 ? `${title.slice(0, 15)}...` : title}
              </CardTitle>
              <div className="flex text-sm leading-tight text-muted-foreground whitespace-nowrap">
                <span>{weight}g</span>
                <DotIcon className="size-5" />
                <span>{topic}</span>
                <DotIcon className="size-5" />
                <span>{taste}</span>
              </div>
              </div>
          </div>
          <div className="flex mob:flex-col items-center justify-end gap-3">
            {/** 계산 로직 필요 */}
            <span className="text-sm">그람당 가격</span>
            <span className="text-md">{price}</span>
            <Button variant="outline" className="border border-white/10">
              <HeartIcon className="w-4 h-4" />
              <span>{likesCount}</span>
            </Button>
          </div>
        </CardHeader>
      </Link>
    </Card>
  );
}
