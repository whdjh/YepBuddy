import { SidebarProvider } from "@/components/ui/sidebar";
import EmptyMessage from "@/components/product/my/messages/EmptyMessage";
import SideInventory from "@/components/common/SideInventory";

export default function Message() {
  return (
    <div className="h-[calc(100vh-14rem)] overflow-hidden">
      <SidebarProvider className="flex h-full">
        <SideInventory />
        <EmptyMessage />
      </SidebarProvider>
    </div>
  );
}