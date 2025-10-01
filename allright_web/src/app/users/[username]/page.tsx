import HeaderSection from "@/app/users/[username]/components/HeaderSection";
import TabSection from "@/app/users/[username]/components/TabSection";

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
        <HeaderSection />
        <TabSection username={username} activeTab={activeTab} />
      </div>
    </>
      );
}