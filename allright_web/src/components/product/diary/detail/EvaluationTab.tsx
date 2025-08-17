"use client";

import { useState } from 'react';
import Textarea from '@/components/common/Textarea';
import SignatureCanvas from './SignatureCanvas';
import { useToastStore } from '@/app/stores/useToastStore';

interface EvaluationData {
  trainerComment: string;
  feedback: string;
  signatureData: string;
}

interface EvaluationTabProps {
  data?: EvaluationData;
  onChange?: (data: EvaluationData) => void;
}

export default function EvaluationTab({ data, onChange }: EvaluationTabProps) {
  const [trainerComment, setTrainerComment] = useState(data?.trainerComment || '');
  const [feedback, setFeedback] = useState(data?.feedback || '');
  const [signatureData, setSignatureData] = useState<string>(data?.signatureData || '');
  const { show: showToast } = useToastStore();

  // TODO: 데이터 변경 시 부모 컴포넌트에 알림
  const handleDataChange = (newData: Partial<EvaluationData>) => {
    const updatedData = {
      trainerComment,
      feedback,
      signatureData,
      ...newData
    };
    onChange?.(updatedData);
  };

  const handleSignatureSave = (data: string) => {
    setSignatureData(data);
    handleDataChange({ signatureData: data });
    showToast('사인이 저장되었습니다');
  };

  const handleTrainerCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setTrainerComment(value);
    handleDataChange({ trainerComment: value });
  };

  const handleFeedbackChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setFeedback(value);
    handleDataChange({ feedback: value });
  };

  return (
    <div className="text-white">
      <div className="flex flex-col gap-4">
        {/* 트레이너의 한줄평 */}
        <div>
          <h3 className="text-md font-medium text-white mb-4">트레이너의 한줄평</h3>
          <Textarea
            value={trainerComment}
            onChange={handleTrainerCommentChange}
            placeholder="한줄평을 작성해주세요."
            rows={3}
          />
        </div>

        {/* 피드백 */}
        <div>
          <h3 className="text-md font-medium text-white mb-4">피드백</h3>
          <Textarea
            value={feedback}
            onChange={handleFeedbackChange}
            placeholder="피드백을 작성해주세요"
            rows={5}
          />
        </div>

        {/* PT 확인 사인 */}
        <div>
          <h3 className="text-md font-medium text-white mb-4">PT 확인 사인</h3>
          <div className="border border-gray-600 rounded-md p-4 h-[150px]">
            <SignatureCanvas onSave={handleSignatureSave} />
          </div>
        </div>
      </div>
    </div>
  );
}
