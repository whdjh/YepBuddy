import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import SideInventory from "@/app/my/dashboard/components/SideInventory";
import ProfileChart from "@/app/my/dashboard/components/ProfileChart";

export default function DashboardDetail() {
  return (
    <SidebarProvider className="flex h-full">
      <div className="tab:hidden mb-2">
        <SidebarTrigger />
      </div>
      <SideInventory />
      <div className="w-full h-full">
        <ProfileChart />
      </div>
    </SidebarProvider>
  );
}