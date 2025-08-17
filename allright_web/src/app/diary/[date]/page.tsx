"use client";

import { use, useState } from 'react';
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

  // 각 탭의 데이터 상태 관리
  const [statusData, setStatusData] = useState({
    sleepStatus: 'medium' as 'high' | 'medium' | 'low',
    condition: 'medium' as 'high' | 'medium' | 'low',
    activityLevel: 'medium' as 'high' | 'medium' | 'low'
  });

  const [exerciseData, setExerciseData] = useState({
    selectedBodyParts: ['chest'] as string[],
    exercises: [] as Array<{
      id: string;
      name: string;
      sets: Array<{ weight: string; reps: string }>;
    }>
  });

  const [evaluationData, setEvaluationData] = useState({
    trainerComment: '',
    feedback: '',
    signatureData: ''
  });

  const handleTabChange = (tab: 'status' | 'exercise' | 'evaluation') => {
    setTab(tab);
  };

  const handleSaveAll = () => {
    // 모든 탭 데이터를 통합 저장
    const diaryData = {
      date: date.toISOString().split('T')[0],
      status: statusData,
      exercise: exerciseData,
      evaluation: evaluationData
    };

    console.log('저장할 데이터:', diaryData);
    
    // TODO: API 호출로 서버에 저장
    // TODO: 저장 성공/실패 처리
    // TODO: 로딩 상태 표시
    // TODO: 에러 처리 및 사용자 피드백
    // saveDiaryData(diaryData);
    
    alert('운동일지가 저장되었습니다!');
  };

  // TODO: 페이지 로드 시 기존 데이터 불러오기
  // TODO: 날짜 변경 시 데이터 초기화 또는 불러오기
  // TODO: 탭 변경 시 데이터 유지
  // TODO: 브라우저 뒤로가기/앞으로가기 처리
  // TODO: 데이터 유효성 검사
  // TODO: 자동 저장 기능 (선택사항)
  // TODO: 데이터 백업 기능

  return (
    <div className="flex flex-col mb-6">
      <DiaryHeader date={date} onSave={handleSaveAll} />
      <DiaryTabNavigation activeTab={activeTab} onTabChange={handleTabChange} />
      
      {/* 탭별 콘텐츠 */}
      <div className="mt-4">
        {activeTab === 'status' && (
          <StatusCheckTab 
            data={statusData} 
            onChange={setStatusData} 
          />
        )}
        {activeTab === 'exercise' && (
          <ExerciseDiaryTab 
            data={exerciseData} 
            onChange={setExerciseData} 
          />
        )}
        {activeTab === 'evaluation' && (
          <EvaluationTab 
            data={evaluationData} 
            onChange={setEvaluationData} 
          />
        )}
      </div>
    </div>
  );
}
