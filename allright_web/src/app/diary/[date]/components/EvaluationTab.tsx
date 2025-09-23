"use client";

import { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import SignatureCanvas from './SignatureCanvas';
import { useToastStore } from '@/stores/useToastStore';

interface EvaluationData {
  trainerComment: string;
  feedback: string;
  signatureData: string;
}

interface EvaluationTabProps {
  data?: EvaluationData;
  onChange?: (data: EvaluationData) => void;
}

const textareaFields = [
  { 
    key: 'trainerComment' as const, 
    label: '트레이너의 한줄평', 
    placeholder: '한줄평을 작성해주세요.',
    rows: 3 
  },
  { 
    key: 'feedback' as const, 
    label: '피드백', 
    placeholder: '피드백을 작성해주세요',
    rows: 5 
  }
];

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

  const handleTextareaChange = (field: keyof Pick<EvaluationData, 'trainerComment' | 'feedback'>, value: string) => {
    // 상태 업데이트
    switch (field) {
      case 'trainerComment':
        setTrainerComment(value);
        break;
      case 'feedback':
        setFeedback(value);
        break;
    }
    
    // 부모 컴포넌트에 알림
    handleDataChange({ [field]: value });
  };

  const getTextareaValue = (field: keyof Pick<EvaluationData, 'trainerComment' | 'feedback'>) => {
    switch (field) {
      case 'trainerComment':
        return trainerComment;
      case 'feedback':
        return feedback;
    }
  };

  const handleSignatureSave = (data: string) => {
    setSignatureData(data);
    handleDataChange({ signatureData: data });
    showToast('사인이 저장되었습니다');
  };

  return (
    <div className="text-white">
      <div className="flex flex-col gap-4">
        {/* Textarea 필드들 */}
        {textareaFields.map((field) => (
          <div key={field.key}>
            <p className="text-md font-medium text-white mb-4">{field.label}</p>
            <Textarea
              value={getTextareaValue(field.key)}
              onChange={(e) => handleTextareaChange(field.key, e.target.value)}
              placeholder={field.placeholder}
            />
          </div>
        ))}

        {/* PT 확인 사인 */}
        <div>
          <p className="text-md font-medium text-white mb-4">PT 확인 사인</p>
          <div className="border border-gray-600 rounded-md p-4 h-[150px]">
            <SignatureCanvas onSave={handleSignatureSave} />
          </div>
        </div>
      </div>
    </div>
  );
}
