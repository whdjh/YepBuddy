import HeaderSection from "@/app/users/[username]/components/HeaderSection";
import TabSection from "@/app/users/[username]/components/TabSection";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "개인정보 | 옙버디",
  description: "개인정보 페이지 입니다.",
};

interface PageProps {
  params: Promise<{ username: string }>;
  searchParams: Promise<{ tab?: string }>;
};

export default async function UserProfile({ params, searchParams }: PageProps) {
  const { username } = await params;
  const { tab } = await searchParams;
  const activeTab: "abouts" | "wishs" = tab === "wishs" ? "wishs" : "abouts";

  return (
    <>
      <div className="space-y-10 p-2 tab:p-5">
        <HeaderSection username={username} />
        <TabSection
          username={username}
          activeTab={activeTab}
        />
      </div>
    </>
      );
}