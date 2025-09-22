import HeaderSection from "@/components/product/users/HeaderSection";
import TabSection from "@/components/product/users/TabSection";

type PageProps = {
  params: Promise<{ username: string }>;
  searchParams: Promise<{ tab?: string }>;
};

export default async function UserProfile({ params, searchParams }: PageProps) {
  const { username } = await params;
  const { tab } = await searchParams;
  const activeTab: "abouts" | "posts" = tab === "abouts" ? "abouts" : "posts";

  return (
    <>
      <div className="space-y-10 p-2 tab:p-5">
        <HeaderSection />
        <TabSection username={username} activeTab={activeTab} />
      </div>
    </>
      );
}