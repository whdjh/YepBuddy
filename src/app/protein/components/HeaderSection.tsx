"use client";

import { Input } from "@/components/ui/input";

type ActiveTab = "wpc" | "wpi" | "wpcwpi" | "creatine" | "beta-alanine";

interface HeaderSectionProps {
  pathname: string;
  q: string;
  activeTab: ActiveTab;
}

// TODO: 서비스 많이 되면 가격순 정렬 추가
export function HeaderSection({
  pathname,
  q,
  activeTab,
}: HeaderSectionProps) {
  const infoMap: Record<ActiveTab, { title: string; bullets: string[] }> = {
    wpc: {
      title: "WPC",
      bullets: [
        "섭취량: 체중 1kg당 1.6~2g",
        "코멘트: 흰우유를 잘 먹으면 WPC",
        "대상: 단백질을 잘 못 챙겨먹는 사람, 운동 후, 단백질이 적은 식사 후",
      ],
    },
    wpi: {
      title: "WPI",
      bullets: [
        "섭취량: 체중 1kg당 1.6~2g",
        "코멘트: 흰우유를 잘 못 먹으면 WPI",
        "대상: 단백질을 잘 못 챙겨먹는 사람, 운동 후, 단백질이 적은 식사 후",
      ],
    },
    wpcwpi: {
      title: "WPC + WPI",
      bullets: [
        "섭취량: 체중 1kg당 1.6~2g",
        "코멘트: 흰우유를 적당히 잘 먹으면 WPC + WPI",
        "대상: 단백질을 잘 못 챙겨먹는 사람, 운동 후, 단백질이 적은 식사 후",
      ],
    },
    creatine: {
      title: "크레아틴",
      bullets: [
        "섭취량: 꾸준히 5g, 빠르게 로딩 시 7일간 20g",
        "코멘트: 체내 수분 보유량 증가, 근육량이 어느 정도 있어야 체감, 얼굴 붓기 가능",
        "대상: 150초 이하 운동에 도움, 특히 30초 이하 고강도 구간에서 효과적",
      ],
    },
    "beta-alanine": {
      title: "베타알라닌",
      bullets: [
        "섭취량: 0.065g / kg",
        "코멘트: 카르노신 생성 증가, 얼굴 따끔거림(정상 반응)",
        "대상: 젖산이 생성되는 운동(30초~10분) 및 매우 짧은 고강도 운동",
      ],
    },
  };

  const info = infoMap[activeTab];

  return (
    <div className="flex justify-between">
      <div className="space-y-5 w-full">
        <div className="flex justify-between">
          <form action={pathname} className="w-full">
            <Input
              type="text"
              name="q"
              defaultValue={q}
              placeholder="검색해보세요."
            />
          </form>
        </div>
        <div className="rounded-xl border border-white/10 p-4">
          <div className="text-sm font-semibold mb-2">{info.title}</div>
          <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
            {info.bullets.map((b, i) => (
              <li key={i}>{b}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
