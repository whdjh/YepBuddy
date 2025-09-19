import { SidebarProvider } from "@/components/ui/sidebar";
import SideInventory from "@/components/product/my/dashboard/SideInventory";

export default function Dashboard() {
  return (
    <SidebarProvider className="flex h-full">
      <SideInventory />
      <div>
        차트가 들어갈 자리임
      </div>
    </SidebarProvider>
  );
}