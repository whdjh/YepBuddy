"use client";

import { memo } from 'react';

interface ExerciseTableHeaderProps {
  maxSets: number;
}

const ExerciseTableHeader = memo(({ maxSets }: ExerciseTableHeaderProps) => {
  return (
    <>
      {/* 헤더 */}
      <div className="flex">
        <div className="w-32 py-2 text-center text-xs font-medium text-gray-300 flex-shrink-0 border-r border-gray-700 flex items-center justify-center">
          운동종목
        </div>
        {Array.from({ length: maxSets }, (_, i) => i + 1).map((setNum) => (
          <div key={setNum} className="w-20 px-1 py-2 text-center text-xs font-medium text-gray-300 flex-shrink-0 border-b border-gray-700 border-r">
            {setNum}세트
          </div>
        ))}
      </div>
      
      {/* 서브헤더 */}
      <div className="flex">
        <div className="w-32 px-3 py-1 flex-shrink-0 border-r border-gray-700 border-b"></div>
        {Array.from({ length: maxSets }, (_, i) => i + 1).map((setNum) => (
          <div key={setNum} className="w-20 px-1 py-1 text-center text-xs font-medium text-gray-300 flex-shrink-0 border-b border-gray-700 border-r">
            <div className="flex gap-1">
              <span className="w-8">무게</span>
              <span className="w-8">횟수</span>
            </div>
          </div>
        ))}
      </div>
    </>
  );
});

ExerciseTableHeader.displayName = 'ExerciseTableHeader';

export default ExerciseTableHeader;
