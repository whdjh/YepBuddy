import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import SideInventory from "@/app/my/dashboard/components/SideInventory";
import ProfileChart from "@/app/my/dashboard/components/ProfileChart";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "대쉬보드 | 옙버디",
  description: "대쉬보드 페이지 입니다.",
};


export default function Dashboard() {
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