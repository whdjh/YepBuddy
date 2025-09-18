import { SidebarProvider } from "@/components/ui/sidebar";
import SideBar from "@/components/common/Sidebar";
import MessageRoom from "@/components/product/my/messages/detail/MessageRoom";

export default function MessageDetail() {
  return (
    <div className="h-[calc(100vh-14rem)] ">
      <SidebarProvider className="flex h-full min-h-0">
        <SideBar />
        <MessageRoom />
      </SidebarProvider>
    </div>
  );
}
