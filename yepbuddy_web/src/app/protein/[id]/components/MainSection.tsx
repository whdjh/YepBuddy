"use client";

import { useParams } from "next/navigation";
import { useProteinById } from "@/hooks/queries/protein/useProteinById";
import Image from "next/image";
import { DotIcon } from "lucide-react";

export default function MainSection() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);
  const { data: protein } = useProteinById(id);

  if (!protein) return null;

  return (
    <div className="min-h-screen text-white flex items-center justify-center p-6">
      <div className="max-w-4xl w-full flex flex-col gap-5">
        <div className="p-8">
          <div className="relative w-full max-w-md mx-auto aspect-square">
            {String(protein.avatar_file || "").replace(/\n/g, "") ? (
              <Image
                src={String(protein.avatar_file || "").replace(/\n/g, "")}
                alt={protein.title}
                fill
                className="object-contain"
                sizes="(max-width: 768px) 80vw, 400px"
                priority
              />
            ) : (
              <p>이미지 자리</p>
            )}
          </div>
        </div>

        {/* 제품명 */}
        <h1 className="text-4xl font-bold">{protein.title}</h1>

        {/* 제품 정보 */}
        <div className="flex items-center gap-2 text-gray-300">
          <span>{protein.weight}g</span>
          <DotIcon className="size-5" />
          <span>{protein.topic}</span>
          <DotIcon className="size-5" />
          <span>{protein.taste}</span>
        </div>

        {/* 가격/그래프 영역은 다음 단계에서 연결 */}
        <div className="flex items-end justify-between">
          <div className="text-right">
            <div className="text-sm text-gray-400">
              현재가 <span className="text-3xl font-bold text-white ml-2">-</span>
              {" "}(그람당 단백질 <span className="text-white">-</span>)
            </div>
          </div>
        </div>

        <div className="bg-white/10 rounded-3xl p-8">
          <div className="aspect-square max-w-md mx-auto flex items-center justify-center">
            <p>그래프 자리</p>
          </div>
        </div>
      </div>
    </div>
  );
}
