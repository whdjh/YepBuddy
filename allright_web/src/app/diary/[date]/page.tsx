"use client";

import { use } from 'react';
import useQueryTab from '@/hooks/useQueryTab';
import DiaryHeader from '@/components/product/diary/detail/DiaryHeader';
import DiaryTabNavigation from '@/components/product/diary/detail/DiaryTabNavigation';
import StatusCheckTab from '@/components/product/diary/detail/StatusCheckTab';
import ExerciseDiaryTab from '@/components/product/diary/detail/ExerciseDiaryTab';
import EvaluationTab from '@/components/product/diary/detail/EvaluationTab';

export default function DiaryDetail({ params }: { params: Promise<{ date: string }> }) {
  const { date: dateParam } = use(params);
  
  const adjustedDateParam = new Date(dateParam);
  adjustedDateParam.setDate(adjustedDateParam.getDate());
  const date = adjustedDateParam;
  
  const { activeTab, setTab } = useQueryTab<'status' | 'exercise' | 'evaluation'>(
    'tab',
    'status',
    ['status', 'exercise', 'evaluation']
  );

  const handleTabChange = (tab: 'status' | 'exercise' | 'evaluation') => {
    setTab(tab);
  };

  return (
    <div className="flex flex-col mb-6">
      <DiaryHeader date={date} />
      <DiaryTabNavigation activeTab={activeTab} onTabChange={handleTabChange} />
      
      {/* 탭별 콘텐츠 */}
      <div className="mt-4">
        {activeTab === 'status' && <StatusCheckTab />}
        {activeTab === 'exercise' && <ExerciseDiaryTab />}
        {activeTab === 'evaluation' && <EvaluationTab />}
      </div>
    </div>
  );
}
