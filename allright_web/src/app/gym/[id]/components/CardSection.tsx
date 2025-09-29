import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function CardSection() {
  return (
    <div className="col-span-full tab:col-span-4">
      <div className="grid grid-cols-2 tab:grid-cols-4 gap-5">
        {[
          { key: "back", title: "등", value: "아스날 풀오버머신, 헤머 DY로우머신, 헤머 프론트렛풀다운머신, 짐레코 로우로우머신, 매트릭스 어시스트치닝디핑, 해머 치닝디핑" },
          { key: "chest", title: "가슴", value: "해머 플라이머신, 짐레코 디클라인프레스머신, 짐레코 인클라인프레스머신, 매트릭스 벤치프레스" },
          { key: "arm", title: "팔", value: "짐레코 프리처컬머신, 아스날 딥스머신" },
          { key: "sholder", title: "어깨", value: "짐레코 프론트프레스머신, 아스날 사레레머신, 다이나믹 펙덱플라이" },
          { key: "leg", title: "하체", value: "짐레코 레그컬, 짐레코 레그익스텐션, 다이나믹 레그프레스, 짐레코 핵스쿼트, 집레코 힙어브덕션" },
          { key: "free", title: "프리웨이트", value: "1 ~ 40kg 덤벨 보유, 엘리코바, 올림픽바, 파워리프트바, 드렉스 스미스머신, 렉 2개" },
          { key: "plate", title: "원판", value: "0.5kg 4개, 1kg 4개, 1.25kg 2개, 5kg 10개, 10kg 20개, 20kg 20개" },
          { key: "cardio", title: "유산소", value: "트레드밀 5개, 천국의계단 2개, 사이클 2개" },
        ].map((item) => (
          <Card className="bg-transparent " key={item.key}>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {item.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 font-medium text-sm tab:text-lg">
              <ul className="text-sm tab:text-lg list-disc list-inside px-6 pb-6">
                {item.value.split(",").map((v, i) => (
                  <li key={`${item.key}-${i}`}>{v.trim()}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}