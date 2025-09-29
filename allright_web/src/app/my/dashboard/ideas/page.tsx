import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import SideInventory from "@/app/my/dashboard/components/SideInventory";

export default function IdeasDashboard() {
  return (
    <SidebarProvider className="flex min-h-screen">
      <div className="tab:hidden mb-2">
        <SidebarTrigger />
      </div>
      <SideInventory />
      <div className="flex-1">
        <h1 className="text-2xl font-semibold mb-6">내가 찜한 프로틴 가격 추이</h1>
      </div>
    </SidebarProvider>
  );
}