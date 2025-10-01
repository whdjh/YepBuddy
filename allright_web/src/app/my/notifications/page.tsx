import NotificationCard from "@/app/my/notifications/components/NotificationCard";

export default function Notification() {
  return (
    <div className="space-y-20 p-2 tab:p-5">
      <h1 className="text-4xl font-bold">알림 목록</h1>
      <div className="grid grid-cols-1 tab:grid-cols-2 pc:grid-cols-3 items-start gap-5">
        <NotificationCard
          avatarFile="https://github.com/gym.png"
          avatarFallback="S"
          name="이주훈"
          message=" 팔로우 신청"
          timestamp="2일전"
          seen={true}
        />
      </div>
    </div>
  );
}