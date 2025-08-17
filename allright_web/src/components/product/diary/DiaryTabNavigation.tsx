"use client";

interface DiaryTabNavigationProps {
  activeTab: 'status' | 'exercise' | 'evaluation';
  onTabChange: (tab: 'status' | 'exercise' | 'evaluation') => void;
}

export default function DiaryTabNavigation({ activeTab, onTabChange }: DiaryTabNavigationProps) {
  const tabs = [
    { id: 'status' as const, label: '상태체크' },
    { id: 'exercise' as const, label: '운동일지' },
    { id: 'evaluation' as const, label: '평가' }
  ];

  return (
    <div className="flex w-full justify-start gap-[1.25rem] py-[1.25rem]">
      {tabs.map((tab) => (
                <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
            activeTab === tab.id
              ? 'underline decoration-emerald-600 decoration-[3px] underline-offset-[6px]'
              : 'text-gray-400 cursor-pointer'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
