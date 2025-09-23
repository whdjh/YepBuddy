import { ChevronRightIcon } from "lucide-react";
import Link from "next/link";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface CategoryCardProps {
  id: string;
  name: string;
  description: string;
}

export default function CategoryCard({ id, name, description }: CategoryCardProps) {
  return (
    <Link href={`/trainer/categories/${id}`} className="block">
      <Card className="bg-transparent border">
        <CardHeader>
          <CardTitle className="flex">
            {name} <ChevronRightIcon className="size-6" />
          </CardTitle>
          <CardDescription className="text-base">{description}</CardDescription>
        </CardHeader>
      </Card>
    </Link>
  );
}