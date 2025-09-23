import Image from "next/image";
import { Badge } from "@/components/ui/badge";

export default function ProfileHeader() {
  return (
    <>
      <div>
        <div className="size-40 bg-white rounded-full  overflow-hidden relative left-10">
          <Image
            src="https://github.com/facebook.png"
            alt="헬스장 로고"
            fill
            className="object-cover"
            sizes="160px"
          />
        </div>
        <h1 className="text-4xl font-bold mt-5">헬스장명</h1>
        <h4 className="text-lg text-muted-foreground">위치</h4>
      </div>
      <div className="flex gap-2">
        <Badge variant={"secondary"}>정기적</Badge>
        <Badge variant={"secondary"}>온라인</Badge>
      </div>
    </>
  );
}