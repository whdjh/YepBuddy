import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function CardSection() {
  return (
    <div className="grid grid-cols-2 tab:grid-cols-4 gap-5">
      {[
        { key: "program", title: "프로그램 유형", value: "1:1 PT" },
        { key: "mode", title: "진행 방식", value: "센터 방문" },
        { key: "time", title: "가능 시간대", value: "평일 18:00–22:00, 토 10:00–13:00" },
        { key: "price", title: "가격/정책", value: "10회 75만원, 유효 8주" },
      ].map((item) => (
        <Card className="bg-transparent" key={item.key}>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {item.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 font-bold text-lg tab:text-2xl">
            <p className="px-6 pb-6 pt-0">{item.value}</p>
          </CardContent>
        </Card>
      ))}

      <Card className="bg-transparent col-span-2">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">
            모집 대상
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 font-bold text-lg tab:text-2xl">
          <ul className="text-sm tab:text-lg list-disc list-inside px-6 pb-6">
            {[
              "체지방 감량 목표",
              "주 2회 이상 출석 가능",
              "초보자 환영 · 자세 교정 위주",
              "노쇼 없이 일정 준수",
            ].map((t, i) => (
              <li key={`${t}-${i}`}>{t}</li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card className="bg-transparent col-span-2">
        <CardHeader>
          <CardTitle className="text-lg tab:text-2xl font-medium text-muted-foreground">
            프로그램 소개
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 font-medium text-sm tab:text-lg">
          <div className="px-6 pb-6 space-y-3">
            <p>
              체형교정/감량 특화 1:1 PT입니다. 프리웨이트 중심으로 기본 움직임 패턴을 교정하고,
              주당 루틴과 식단 가이드를 함께 제공합니다. 처음 시작하시는 분도 안전하게 진행합니다.
            </p>
            <p className="text-base text-muted-foreground">
              <span className="block"><strong>트레이너 소개:</strong> NASM-CPT, 5년 경력(체형교정/감량)</span>
              <span className="block"><strong>연락:</strong> 카톡 @trainer_jh</span>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
