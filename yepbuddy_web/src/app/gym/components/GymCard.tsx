import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export interface GymCardProps {
  id: string;
  title: string;
  location: string;
}

export default function GymCard({
  id,
  title,
  location,
}: GymCardProps) {
  return (
    <Card className="bg-transparent hover:bg-[#26262c] border-white/10">
      <CardHeader>
        <Link href={`/gym/${id}`}>
          <CardTitle className="flex flex-col gap-3">
            <p className="text-xl">{title}</p>
            <p className="text-md">{location}</p>
          </CardTitle>
        </Link>
      </CardHeader>
    </Card>
  );
}
