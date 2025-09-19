import { SidebarProvider } from "@/components/ui/sidebar";
import SideInventory from "@/components/product/my/messages/SideInventory";
import MessageRoom from "@/components/product/my/messages/detail/MessageRoom";

export default function MessageDetail() {
  return (
    <div className="h-[calc(100vh-14rem)] ">
      <SidebarProvider className="flex h-full min-h-0">
        <SideInventory />
        <MessageRoom />
      </SidebarProvider>
    </div>
  );
}