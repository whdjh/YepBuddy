import NotificationCard from "@/app/my/notifications/components/NotificationCard";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "알림 | 프로틴몬스터",
  description: "알림 페이지 입니다.",
};


export default function Notification() {
  return (
    <div className="space-y-20 p-2 tab:p-5">
      <h1 className="text-4xl font-bold">알림 목록</h1>
      <div className="grid grid-cols-1 tab:grid-cols-2 pc:grid-cols-3 items-start gap-5">
        <NotificationCard
          avatarFile="https://github.com/gym.png"
          avatarFallback="S"
          name="사용자명"
          message=" 팔로우 신청"
          timestamp="2일전"
          seen={true}
        />
      </div>
    </div>
  );
}