import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function CardSection() {
  return (
    <div className="col-span-full tab:col-span-4">
      <div className="grid grid-cols-2 gap-5">
        {[
          { key: "back", title: "등", value: "풀오버머신, DY로우머신, 프론트렛풀머신 " },
          { key: "chest", title: "가슴", value: "헤머스트랭스 플라이머신, 피트니스 플라이머신" },
          { key: "arm", title: "팔", value: "프리처컬머신, 딥스머신" },
          { key: "sholder", title: "어깨", value: "프론트프레스머신, 사레레머신" },
          { key: "leg", title: "하체", value: "레그컬, 레그프레스, 핵스쿼트, 레그익스텐션" },
          { key: "dumbel", title: "덤벨", value: "1 ~ 40kg 보유" },
          { key: "barbel", title: "바벨", value: "엘리코, 올림픽바, 파워리프트바" },
          { key: "plate", title: "원판", value: "0.5kg 4개, 1kg 4개, 1.25kg 2개, 5kg 10개, 10kg 20개, 20kg 20개" },
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