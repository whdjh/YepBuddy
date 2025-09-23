import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import SideInventory from "@/app/my/dashboard/components/SideInventory";
import CardSection from "@/app/ideas/components/CardSection";
import { mockIdeasCards } from "@/mock/ideasCardData";

export default function IdeasDashboard() {
  return (
    <SidebarProvider className="flex min-h-screen">
      <div className="tab:hidden mb-2">
        <SidebarTrigger />
      </div>
      <SideInventory />
      <div className="flex-1">
        <h1 className="text-2xl font-semibold mb-6">내가 구매한 루틴</h1>
        <CardSection cards={mockIdeasCards} />
      </div>
    </SidebarProvider>
  );
}