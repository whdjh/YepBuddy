import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import SideInventory from "@/app/my/dashboard/components/SideInventory";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "회원관리 | Allright",
  description: "회원관리 페이지 입니다.",
};

// TODO: 초기에는 해당회원의 운동일지만 나오는데,, 점점 추가할 예정,, 점점 그래프형식으로 변화하는거 보여주면 어떨까?
export default function DashboardId() {
  return (
    <SidebarProvider className="flex h-full">
      <div className="tab:hidden mb-2">
        <SidebarTrigger />
      </div>
      <SideInventory />
      <div className="w-full h-full">
        회원의 운동일지
      </div>
    </SidebarProvider>
  );
}