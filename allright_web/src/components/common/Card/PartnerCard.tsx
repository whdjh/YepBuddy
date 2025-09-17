import Link from "next/link";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";

interface PartnerCardProps {
  id: string;
  gym: string;
  gymLogoUrl: string;
  gymHq: string;
  title: string;
  postedAt: string;
  type: string;
  positionLocation: string;
  time: string;
}

export default function PartnerCard({
  id,
  gym,
  gymLogoUrl,
  gymHq,
  title,
  postedAt,
  type,
  positionLocation,
  time,
}: PartnerCardProps) {
  return (
    <Link href={`/partner/${id}`}>
      <Card className="bg-transparent hover:bg-[#26262c] border-white/10">
        <CardHeader>
          <div className="flex items-center gap-4 mb-4">
            <Image
              src={gymLogoUrl}
              alt={`${gym} Logo`}
              width={40}
              height={40}
              className="size-10 rounded-full"
            />
            <div className="space-x-2 whitespace-nowrap">
              <span className="text-gray-100">{gym}</span>
              <span className="text-xs text-gray-400">{postedAt}</span>
            </div>
          </div>
          <CardTitle>{title}</CardTitle>
        </CardHeader>

        <CardContent>
          <Badge variant="outline" className="border-white/15 bg-transparent text-gray-200">
            {type}
          </Badge>
          <Badge variant="outline" className="border-white/15 bg-transparent text-gray-200">
            {positionLocation}
          </Badge>
        </CardContent>

        <CardFooter className="flex justify-between whitespace-nowrap">
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-400">{time}</span>
            <span className="text-sm font-medium text-gray-400">{gymHq}</span>
          </div>
          <Button
            variant="secondary"
            size="sm"
            className="border border-white/10 bg-white/10 text-gray-100 hover:bg-white/20"
          >
            Apply now
          </Button>
        </CardFooter>
      </Card>
    </Link>
  );
}
