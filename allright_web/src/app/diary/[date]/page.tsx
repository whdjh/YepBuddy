"use client";

import { use, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
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

  // FormProvider 설정
  const methods = useForm({
    defaultValues: {
      // ExerciseDiaryTab의 동적 필드들을 위한 기본값
      exercises: {},
      // 다른 탭들의 필드들도 추가 가능
      status: statusData,
      evaluation: evaluationData
    }
  });

  const handleTabChange = (tab: 'status' | 'exercise' | 'evaluation') => {
    setTab(tab);
  };

  const handleSaveAll = () => {
    // 폼 데이터 가져오기
    const formData = methods.getValues();
    
    // 운동일지 데이터에서 0인 세트 필터링
    const filteredExerciseData = {
      ...exerciseData,
      exercises: exerciseData.exercises.map(exercise => ({
        ...exercise,
        sets: exercise.sets.filter(set => 
          set.weight !== '0' && set.weight !== '' && 
          set.reps !== '0' && set.reps !== ''
        )
      })).filter(exercise => 
        exercise.name.trim() !== '' && exercise.sets.length > 0
      )
    };
    
    // 모든 탭 데이터를 통합 저장
    const diaryData = {
      date: date.toISOString().split('T')[0],
      status: statusData,
      exercise: filteredExerciseData,
      evaluation: evaluationData,
      formData // 폼 데이터도 포함
    };

    console.log('=== 운동일지 저장 데이터 ===');
    console.log('날짜:', diaryData.date);
    console.log('상태체크 데이터:', diaryData.status);
    console.log('운동일지 데이터:', diaryData.exercise);
    console.log('   - 선택된 운동 부위:', diaryData.exercise.selectedBodyParts);
    console.log('   - 운동 목록:', diaryData.exercise.exercises);
    console.log('평가 데이터:', diaryData.evaluation);
    
    alert('운동일지가 저장되어 console 확인');
  };

  // TODO: 페이지 로드 시 기존 데이터 불러오기
  // TODO: 날짜 변경 시 데이터 초기화 또는 불러오기
  // TODO: 탭 변경 시 데이터 유지
  // TODO: 브라우저 뒤로가기/앞으로가기 처리
  // TODO: 데이터 유효성 검사
  // TODO: 자동 저장 기능 (선택사항)
  // TODO: 데이터 백업 기능

  return (
    <FormProvider {...methods}>
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
    </FormProvider>
  );
}
