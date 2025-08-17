"use client";

import { useState } from 'react';
import Button from '@/components/common/Button';
import Textarea from '@/components/common/Textarea';
import SignatureCanvas from './SignatureCanvas';

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
          <Textarea
            value={trainerComment}
            onChange={(e) => setTrainerComment(e.target.value)}
            placeholder="한줄평을 작성해주세요."
            rows={3}
          />
        </div>

        {/* 피드백 */}
        <div>
          <h3 className="text-md font-medium text-white mb-4">피드백</h3>
          <Textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="피드백을 작성해주세요"
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
