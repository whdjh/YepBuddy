import { DotIcon } from "lucide-react";

export default function MainSection() {
  return (
    <div className="min-h-screen text-white flex items-center justify-center p-6">
      <div className="max-w-4xl w-full flex flex-col gap-5">
        {/* 이미지 섹션 */}
        <div className="bg-white/10 rounded-3xl p-8">
          <div className="aspect-square max-w-md mx-auto flex items-center justify-center">
            <p>이미지 자리</p>
          </div>
        </div>

        {/* 제품명 */}
        <h1 className="text-4xl font-bold">마이프로틴</h1>

        {/* 제품 정보 */}
        <div className="flex items-center gap-2 text-gray-300">
          <span>2.5kg</span>
          <DotIcon className="size-5" />
          <span>WPC</span>
          <DotIcon className="size-5" />
          <span>초코맛</span>
        </div>

        {/* 가격 정보 */}
        <div className="flex items-end justify-between">
          <div className="text-right">
            <div className="text-sm text-gray-400">
              현재가 <span className="text-3xl font-bold text-white ml-2">80,900원</span>
              (그람당 단백질 <span className="text-white">40원</span>)
            </div>
          </div>
        </div>

        {/* 할인 및 구매 버튼 */}
        <div className="flex flex-nowrap gap-3 overflow-x-auto">
          <div className="bg-red-600 rounded-xl px-4 py-3 text-sm font-medium whitespace-nowrap">
            평균가 대비 18% 하락
          </div>
          <div className="bg-red-600 rounded-xl px-4 py-3 text-sm font-medium whitespace-nowrap">
            18,380원 저렴
          </div>
        </div>

        {/* 그래프 섹션 */}
        <div className="bg-white/10 rounded-3xl p-8">
          <div className="aspect-square max-w-md mx-auto flex items-center justify-center">
            <p>그래프 자리</p>
          </div>
        </div>
      </div>
    </div>
  );
}