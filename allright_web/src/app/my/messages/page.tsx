import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import EmptyMessage from "@/app/my/messages/components/EmptyMessage";
import SideInventory from "@/app/my/messages/components/SideInventory";

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
