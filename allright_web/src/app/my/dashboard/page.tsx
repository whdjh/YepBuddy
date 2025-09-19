import { SidebarProvider } from "@/components/ui/sidebar";
import SideInventory from "@/components/product/my/dashboard/SideInventory";
import ProfileChart from "@/components/product/my/dashboard/ProfileChart";

export default function Dashboard() {
  return (
    <SidebarProvider className="flex h-full">
      <SideInventory />
      <div className="w-full h-full">
        <ProfileChart />
      </div>
    </SidebarProvider>
  );
}