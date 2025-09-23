import { SidebarProvider } from "@/components/ui/sidebar";
import SideInventory from "@/app/my/messages/components/SideInventory";
import MessageRoom from "@/app/my/messages/[id]/components/MessageRoom";

export default function MessageDetail() {
  return (
    <div className="h-[calc(100vh-14rem)] p-2 tab:p-5">
      <SidebarProvider className="flex h-full min-h-0">
        <SideInventory />
        <MessageRoom />
      </SidebarProvider>
    </div>
  );
}