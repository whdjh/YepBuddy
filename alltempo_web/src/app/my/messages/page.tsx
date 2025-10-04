import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import EmptyMessage from "@/app/my/messages/components/EmptyMessage";
import SideInventory from "@/app/my/messages/components/SideInventory";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "실시간 채팅 | Allright",
  description: "실시간 채팅 페이지 입니다.",
};

export default function Message() {
  return (
    <div className="h-[calc(100vh-14rem)] p-2 tab:p-5 /* 모바일에선 overflow-visible로 두는 게 안전 */ overflow-visible tab:overflow-hidden">
      <SidebarProvider className="flex h-full">
        <div className="tab:hidden mb-2">
          <SidebarTrigger />
        </div>

        <SideInventory />
        <EmptyMessage />
      </SidebarProvider>
    </div>
  );
}
