import { SidebarProvider } from "@/components/ui/sidebar";
import SideInventory from "@/components/product/my/dashboard/SideInventory";
import CardSection from "@/components/product/ideas/CardSection";
import { mockIdeasCards } from "@/mock/ideasCardData";

export default function IdeasDashboard() {
  return (
    <SidebarProvider className="flex min-h-screen">
      <SideInventory />
      <div className="flex-1">
        <h1 className="text-2xl font-semibold mb-6">내가 구매한 루틴</h1>
        <CardSection cards={mockIdeasCards} />
      </div>
    </SidebarProvider>
  );
}