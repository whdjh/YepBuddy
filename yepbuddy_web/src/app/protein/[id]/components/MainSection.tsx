"use client";

import { useParams } from "next/navigation";
import { useProteinById } from "@/hooks/queries/protein/useProteinById";
import { useProteinByIdPrice } from "@/hooks/queries/protein/useProteinByIdPrice";
import Image from "next/image";
import { DotIcon } from "lucide-react";
import PriceHistoryChart from "./PriceHistoryChart";

export default function MainSection() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);

  // 단건 기본 정보
  const { data: protein } = useProteinById(id);

  // 가격 히스토리: 최근 180개
  const { data: prices } = useProteinByIdPrice(id, 180);

  if (!protein) return null;

  // 최신가: 히스토리를 최신순으로 내려주고 있다면 0번째가 최신
  const latest = prices?.[0];
  const latestPrice = latest?.price != null ? Number(latest.price) : null;

  // 단백질 g당 가격 = price / (weight * (protein_per_scoop / scoop))
  const weight = Number(protein.weight); // 총중량 g
  const scoop = protein.scoop != null ? Number(protein.scoop) : null; // 한 스쿱 g
  const proteinPerScoop = protein.protein_per_scoop != null ? Number(protein.protein_per_scoop) : null; // 스쿱당 단백질 g

  let priceDisplay = "-";
  let perProteinGramText = "-";

  if (latestPrice != null && latestPrice > 0) {
    priceDisplay = `${latestPrice.toLocaleString()}원`;

    if (weight > 0 && scoop && scoop > 0 && proteinPerScoop && proteinPerScoop > 0) {
      const totalProteinGrams = weight * (proteinPerScoop / scoop); // 제품 전체에 들어있는 단백질 총량 g
      if (totalProteinGrams > 0) {
        const perProteinGram = Math.round(latestPrice / totalProteinGrams);
        perProteinGramText = `${perProteinGram.toLocaleString()}원/g`;
      }
    } else if (weight > 0) {
      // 보조 데이터 없으면 총중량 기준 g당 가격으로 폴백
      const perGram = Math.round(latestPrice / weight);
      perProteinGramText = `${perGram.toLocaleString()}원/g`;
    }
  }

  const imageSrc = String(protein.avatar_file || "").replace(/\n/g, "");

  return (
    <div className="min-h-screen text-white flex items-center justify-center p-6">
      <div className="max-w-4xl w-full flex flex-col gap-5">
        <div className="p-8">
          <div className="relative w-full max-w-md mx-auto aspect-square">
            {imageSrc ? (
              <Image
                src={imageSrc}
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

        {/* 가격/그래프 영역 */}
        <div className="flex items-end justify-between">
          <div className="text-right">
            <div className="text-sm text-gray-400">
              현재가 <span className="text-3xl font-bold text-white ml-2">{priceDisplay}</span>
              (<span className="text-white">{perProteinGramText}</span>)
            </div>
          </div>
        </div>

        <div>
          
            {prices && prices.length > 0 ? (
              <PriceHistoryChart data={prices} />
            ) : (
              <div className="bg-white/10 rounded-3xl p-8 text-center text-sm text-gray-400">
                가격 이력이 없어요
              </div>
            )}
          
        </div>
      </div>
    </div>
  );
}
