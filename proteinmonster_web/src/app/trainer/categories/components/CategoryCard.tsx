import { ChevronRightIcon } from "lucide-react";
import Link from "next/link";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CategoryCardProps } from "@/types/Card";

export default function CategoryCard({ id, title, location }: CategoryCardProps) {
  return (
    <Link href={`/trainer/categories/${id}`} className="block">
      <Card className="bg-transparent border">
        <CardHeader>
          <CardTitle className="flex">
            {title} <ChevronRightIcon className="size-6" />
          </CardTitle>
          <CardDescription className="text-base">{location}</CardDescription>
        </CardHeader>
      </Card>
    </Link>
  );
}