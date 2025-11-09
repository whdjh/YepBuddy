"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useProteinById } from "@/hooks/queries/proteins/useProteinById";

type ProteinTopic = "wpc" | "wpi" | "wpcwpi" | "creatine" | "beta-alanine";

const topicDisplayMap: Record<ProteinTopic, string> = {
  wpc: "WPC",
  wpi: "WPI",
  wpcwpi: "WPC + WPI",
  creatine: "크레아틴",
  "beta-alanine": "베타알라닌",
};

export default function HeaderSection() {
  const { id } = useParams();
  const proteinId = Number(id);
  const { data: protein } = useProteinById(proteinId);

  if (!protein) {
    return null;
  }

  const topic = protein.topic as ProteinTopic;
  const topicDisplay = topicDisplayMap[topic] || topic;

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href="/protein">단백질</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href={`/protein?topic=${topic}`}>{topicDisplay}</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href={`/protein/${id}`}>{protein.title}</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}