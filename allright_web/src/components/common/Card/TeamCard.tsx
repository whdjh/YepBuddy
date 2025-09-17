import Link from "next/link";
import {
  Card,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { TeamCardProps } from "@/types/Card";

export default function TeamCard({
  id,
  leaderUsername,
  leaderAvatarUrl,
  positions,
  teamDescription,
}: TeamCardProps) {
  return (
    <Link href={`/teams/${id}`}>
      <Card className="bg-transparent hover:bg-[#26262c] border-white/10">
        <CardHeader className="flex flex-row items-center">
          <CardTitle className="text-base leading-loose">
            <Badge
              variant="secondary"
              className="inline-flex shadow-sm items-center text-base"
            >
              <span>@{leaderUsername}</span>
              <Avatar className="size-5">
                <AvatarFallback>{leaderUsername?.[0] ?? "?"}</AvatarFallback>
                <AvatarImage src={leaderAvatarUrl} />
              </Avatar>
            </Badge>
            <span> 트레이너가 </span>
            {positions.map((position, index) => (
              <Badge key={index} className="text-base">
                {position}
              </Badge>
            ))}
            <span> 회원을 모집합니다.<br/> </span>
            <span>{teamDescription}</span>
          </CardTitle>
        </CardHeader>
        <CardFooter className="justify-end">
          <Button variant="link">상담 신청하기 &rarr;</Button>
        </CardFooter>
      </Card>
    </Link>
  );
}
