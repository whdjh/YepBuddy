import NotificationCard from "@/components/common/Card/NotificationCard";

export default function Notification() {
  return (
    <div className="space-y-20 p-5">
      <h1 className="text-4xl font-bold">알림 목록</h1>
      <div className="flex flex-col items-start gap-5">
        <NotificationCard
          avatarUrl="https://github.com/gym.png"
          avatarFallback="S"
          userName="이주훈"
          message=" 팔로우 신청"
          timestamp="2일전"
          seen={true}
        />
      </div>
    </div>
  );
}