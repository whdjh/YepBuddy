"use client";

import { use, useState } from 'react';
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
  
  const [activeTab, setActiveTab] = useState<'status' | 'exercise' | 'evaluation'>('status');

  const handleTabChange = (tab: 'status' | 'exercise' | 'evaluation') => {
    setActiveTab(tab);
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
