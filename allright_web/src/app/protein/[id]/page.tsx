import HeaderSection from "@/app/protein/[id]/components/HeaderSection";
import MainSection from "@/app/protein/[id]/components/MainSection";

export default function ProteinId() {
  return (
    <div className="space-y-10 p-2 tab:p-5">
      <HeaderSection />

      <div className="grid grid-cols-1 tab:grid-cols-6 gap-10 tab:gap-40 items-start">
        <div className="col-span-full tab:col-span-4 space-y-10 min-w-0">
          <div className="flex w-full items-start gap-6 tab:gap-10">
            <div className="min-w-0 tab:space-y-20 space-y-5">
              <MainSection />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
