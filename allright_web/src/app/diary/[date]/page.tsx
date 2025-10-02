"use client";

import { use } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import useQueryTab from '@/hooks/useQueryTab';
import DiaryHeader from '@/app/diary/[date]/components/DiaryHeader';
import DiaryTabNavigation from '@/app/diary/[date]/components/DiaryTabNavigation';
import ExerciseDiaryTab from '@/app/diary/[date]/components/ExerciseDiaryTab';
import EvaluationTab from '@/app/diary/[date]/components/EvaluationTab';
import VideoTab from '@/app/diary/[date]/components/VideoTab';

interface ExerciseSet {
  weight: string;
  reps: string;
}

interface ExerciseItem {
  id: string;
  name: string;
  sets: ExerciseSet[];
}
interface ExerciseData {
  selectedBodyParts: string[];
  exercises: ExerciseItem[];
}
interface DiaryForm {
  exercise: ExerciseData;
}

export default function DiaryDate({ params }: { params: Promise<{ date: string }> }) {
  const { date: dateParam } = use(params);
  const date = new Date(dateParam);

  const { activeTab, setTab } = useQueryTab<'exercise' | 'evaluation' | 'video'>(
    'tab',
    'exercise',
    ['exercise', 'evaluation', 'video']
  );

  const methods = useForm<DiaryForm>({
    mode: 'onChange',
    defaultValues: {
      exercise: { selectedBodyParts: ['chest'], exercises: [] },
    },
  });

  const onSubmit = () => {
    const exerciseOnly = methods.getValues('exercise');
    console.log(exerciseOnly);
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className="flex flex-col mb-6 p-5">
        <DiaryHeader date={date} />
        <DiaryTabNavigation activeTab={activeTab} onTabChange={setTab} />

        <div className="mt-4">
          {activeTab === 'exercise' && (
            <ExerciseDiaryTab
              data={methods.getValues('exercise')}
              onChange={(next) => methods.setValue('exercise', next, { shouldDirty: true })}
            />
          )}
          {activeTab === 'evaluation' && <VideoTab />}
          {activeTab === 'video' && <VideoTab />}
        </div>
      </form>
    </FormProvider>
  );
}
