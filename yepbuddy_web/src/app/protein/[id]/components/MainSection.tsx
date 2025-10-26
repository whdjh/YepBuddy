"use client";

import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { DotIcon } from "lucide-react";
import PriceHistoryChart from "@/app/protein/[id]/components/PriceHistoryChart";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useProteinById } from "@/hooks/queries/proteins/useProteinById";
import { useProteinByIdPrice } from "@/hooks/queries/proteins/useProteinByIdPrice";
import { useProteinFlavors } from "@/hooks/queries/proteins/useProteinFlavors";
import { useProteinPriceStats } from "@/hooks/queries/proteins/useProteinPriceStats";
import { computeDisplayPrice, computePerProteinGram } from "@/lib/pricing";
import { decideBadge, type Badge as PriceBadge } from "@/lib/priceBadge";

export default function MainSection() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);

  // 단건 기본 정보
  const { data: protein } = useProteinById(id);

  // 가격 히스토리: 최근 180개
  const { data: prices } = useProteinByIdPrice(id, 180);

  // 맛 목록 (있을 때만 섹션 노출)
  const { data: flavors } = useProteinFlavors(id);

  // 180일 분포 통계(리스트와 동일한 기준을 상세에서도 공유)
  const { data: allStats } = useProteinPriceStats();
  const stats = (allStats ?? []).find((s) => Number(s.protein_id) === id);

  if (!protein) return null;

  // 최신가: 히스토리를 최신순으로 내려주고 있다면 0번째가 최신 → 정렬 가정하지 말고 날짜로 정렬해서 가장 최근 선택
  const latest = (prices ?? [])
    .slice()
    .sort((a, b) => (a.observed_date < b.observed_date ? 1 : -1))[0];

  const latestPrice = latest?.price != null ? Number(latest.price) : null;
  const salePercent = latest?.sale != null ? Number(latest.sale) : 0; // 할인율 %
  const latestUrl = latest?.url ?? protein.url ?? "#"; // 최신 URL 우선, 없으면 protein.url 사용

  // 실제 표시가격 = 정가 × (1 - 할인율 / 100)
  const displayPrice = computeDisplayPrice(latestPrice, salePercent);

  // 단백질 g당 가격 = price / (weight * (protein_per_scoop / scoop))
  const weight = Number(protein.weight); // 총중량 g
  const scoop = protein.scoop != null ? Number(protein.scoop) : null; // 한 스쿱 g
  const proteinPerScoop =
    protein.protein_per_scoop != null ? Number(protein.protein_per_scoop) : null; // 스쿱당 단백질 g

  const perProtein = displayPrice != null
    ? computePerProteinGram(displayPrice, weight, scoop, proteinPerScoop)
    : null;

  let priceDisplay = "-";
  let perProteinGramText = "-";

  if (displayPrice != null && displayPrice > 0) {
    priceDisplay = `${displayPrice.toLocaleString()}원`;
    if (perProtein != null) {
      perProteinGramText = `${perProtein.toLocaleString()}원/g`;
    }
  }

  const imageSrc = String(protein.avatar_file || "").replace(/\n/g, "");
  const hasDescription = !!(protein.description && protein.description.trim().length > 0);

  // 특징 파싱 (쉼표/유사 구분자/줄바꿈까지 처리)
  const features = hasDescription
    ? protein.description!
      .split(/[,，、ㆍ·;|\n\r]+/g)
      .map((s: string) => s.replace(/\s+/g, " ").trim())
      .filter((s: string) => s.length > 0)
    : [];

  // 상세도 리스트와 동일 기준(P20/P50/P80)으로 배지 결정
  const badge: PriceBadge | null = stats ? decideBadge(displayPrice, stats) : null;

  // 배지 variant 매핑(통일)
  const badgeVariant =
    badge?.color === "green" ? "default" :
      badge?.color === "red" ? "red" :
        badge ? "blue" : null;

  const badgeLabel =
    badge?.kind === "low" ? "저점" :
      badge?.kind === "high" ? "고점" :
        badge ? "중간" : null;

  return (
    <div className="min-h-screen text-white flex items-center justify-center p-6">
      <div className="max-w-4xl w-full flex flex-col gap-5 pb-20">
        {/* 이미지 */}
        <div className="p-8">
          <div className="relative w-full max-w-md mx-auto aspect-square">
            <Image
              src={imageSrc}
              alt={protein.title}
              fill
              className="object-contain"
              sizes="(max-width: 768px) 80vw, 400px"
              priority
            />
          </div>
        </div>

        {/* 제품명 + 배지(동일 기준) */}
        <div className="flex items-center gap-3">
          <h1 className="text-xl mob:text-4xl font-bold">{protein.title}</h1>
          {badge && badgeVariant && badgeLabel && (
            <Badge variant={badgeVariant as any} title={badge.reason} aria-label={badge.reason}>
              {badgeLabel}
            </Badge>
          )}
        </div>

        {/* 제품 정보 */}
        <div className="flex items-center gap-2 text-gray-300 text-md mob:text-2xl">
          <span>{protein.weight}g</span>
          <DotIcon className="size-5" />
          <span>{protein.topic}</span>
          <DotIcon className="size-5" />
          <span>{protein.taste}</span>
        </div>

        {/* 특징 리스트 */}
        {features.length > 0 && (
          <section className="bg-white/10 rounded-xl p-4 text-gray-200">
            <h3 className="mb-2 text-md tab:text-xl font-semibold">특징</h3>
            <ul className="list-disc pl-5 space-y-1 text-sm tab:text-lg">
              {features.map((f: string, i: number) => (
                <li key={`${i}-${f.slice(0, 16)}`}>{f}</li>
              ))}
            </ul>
          </section>
        )}

        {/* 가격/그래프 영역 */}
        <div className="flex items-end justify-between">
          <div className="text-right">
            <div className="text-sm text-gray-400">
              현재가{" "}
              <span className="text-3xl font-bold text-white ml-2">{priceDisplay}</span>
              (<span className="text-white">{perProteinGramText}</span>)
            </div>
          </div>
        </div>

        {/* 그래프 */}
        <div>
          {prices && prices.length > 0 ? (
            <PriceHistoryChart data={prices} />
          ) : (
            <div className="bg-white/10 rounded-3xl p-8 text-center text-sm text-gray-400">
              가격 이력이 없어요
            </div>
          )}
        </div>

        {/* 마이프로틴 맛 후기 */}
        {Array.isArray(flavors) && flavors.length > 0 && (() => {
          const t1 = flavors.filter(f => !f.polarizing && f.tier === "T1");
          const t2 = flavors.filter(f => !f.polarizing && f.tier === "T2");
          const t3 = flavors.filter(f => !f.polarizing && f.tier === "T3");
          const polar = flavors.filter(f => f.polarizing);

          const Section = ({
            title,
            items,
          }: {
            title: string;
            items: typeof flavors;
          }) =>
            items.length > 0 ? (
              <div className="mt-3">
                <h3 className="text-lg font-bold opacity-90">{title}</h3>
                <ul className="list-disc pl-5 space-y-1 mt-1">
                  {items.map((f) => (
                    <li key={f.flavorId}>
                      {f.name}
                      {f.note ? ` - ${f.note}` : ""}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null;

          return (
            <section className="bg-white/10 rounded-xl p-4 text-gray-200">
              <h1 className="mb-2 text-base font-semibold">맛 (개발자 주관)</h1>
              <p className="mb-1 text-xs">CU4H-R3(마이프로틴 추천인인데..해주면 압도적 감사...!)</p>

              <Section title="티어1" items={t1} />
              <Section title="티어2" items={t2} />
              <Section title="티어3" items={t3} />
              <Section title="호불호" items={polar} />
            </section>
          );
        })()}
      </div>

      {/* 하단 스티키 구매 버튼 */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10">
        <div className="mx-auto max-w-4xl px-4 py-3">
          <Button
            asChild
            variant="default"
            size="lg"
            className="w-full rounded-xl text-base font-semibold"
            aria-label="구매하러 가기"
          >
            <Link
              href={latestUrl}
              target="_blank"
              rel="nofollow noopener noreferrer"
            >
              구매하러 가기
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
