"use client";

import { useState } from 'react';
import Button from '@/components/common/Button';
import SignatureCanvas from '@/components/common/SignatureCanvas';

export default function EvaluationTab() {
  const [trainerComment, setTrainerComment] = useState('');
  const [feedback, setFeedback] = useState('');
  const [signatureData, setSignatureData] = useState<string>('');

  const handleSignatureSave = (data: string) => {
    setSignatureData(data);
  };

  return (
    <div className="text-white">
      <div className="flex flex-col gap-4">
        {/* 트레이너의 한줄평 */}
        <div>
          <h3 className="text-md font-medium text-white mb-4">트레이너의 한줄평</h3>
          <textarea
            value={trainerComment}
            onChange={(e) => setTrainerComment(e.target.value)}
            placeholder="오늘 운동에 대한 한줄평을 작성해주세요..."
            className="w-full h-[50px] px-4 py-3 border border-gray-600 rounded-md text-white placeholder-gray-500 focus:border-[#16a34a] focus:outline-none bg-transparent resize-none"
            rows={3}
          />
        </div>

        {/* 피드백 */}
        <div>
          <h3 className="text-md font-medium text-white mb-4">피드백</h3>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="운동에 대한 피드백을 작성해주세요..."
            className="w-full h-[50px] px-4 py-3 border border-gray-600 rounded-md text-white placeholder-gray-500 focus:border-[#16a34a] focus:outline-none bg-transparent resize-none"
            rows={5}
          />
        </div>

        {/* PT 확인 사인 */}
        <div>
          <h3 className="text-md font-medium text-white mb-4">PT 확인 사인</h3>
          <div className="border border-gray-600 rounded-md p-4 h-[150px]">
            <SignatureCanvas onSave={handleSignatureSave} />
            {signatureData && (
              <div className="mt-3 p-3 border border-[#16a34a] rounded bg-transparent">
                <p className="text-sm text-gray-400 mb-1">사인이 저장되었습니다</p>
              </div>
            )}
          </div>
        </div>

        {/* 저장 버튼 */}
        <div className="pt-4">
          <Button variant="solid" className="w-full h-[3rem]">
            평가 저장
          </Button>
        </div>
      </div>
    </div>
  );
}
