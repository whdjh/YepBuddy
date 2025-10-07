import { SidebarProvider } from "@/components/ui/sidebar";
import SideInventory from "@/app/my/messages/components/SideInventory";
import MessageRoom from "@/app/my/messages/[id]/components/MessageRoom";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "실시간 채팅 대화방 | 옙버디",
  description: "실시간 채팅 대화방 페이지 입니다.",
};

export default function MessageId() {
  return (
    <div className="h-[calc(100vh-14rem)] p-2 tab:p-5">
      <SidebarProvider className="flex h-full min-h-0">
        <SideInventory />
        <MessageRoom />
      </SidebarProvider>
    </div>
  );
}