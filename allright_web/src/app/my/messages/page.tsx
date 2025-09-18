import { SidebarProvider } from "@/components/ui/sidebar";
import EmptyMessage from "@/components/product/my/messages/EmptyMessage";
import SideBar from "@/components/common/Sidebar";

export default function Message() {
  return (
    <div className="h-[calc(100vh-14rem)] overflow-hidden">
      <SidebarProvider className="flex h-full">
        <SideBar />
        <EmptyMessage />
      </SidebarProvider>
    </div>
  );
}