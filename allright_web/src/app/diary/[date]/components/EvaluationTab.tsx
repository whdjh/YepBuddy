"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import InputPair from "@/components/common/InputPair";
import SignatureCanvas from "@/app/diary/[date]/components/EvaluationTab/SignatureCanvas";
import StatusCheck from "@/app/diary/[date]/components/EvaluationTab/StatusCheck";
import { useToastStore } from "@/stores/useToastStore";

interface EvaluationData {
  comment: string;
  signatureData: string;
  status?: Record<string, string>;
}

interface EvaluationTabProps {
  data?: EvaluationData;
  onChange?: (data: EvaluationData) => void;
}

export default function EvaluationTab({ data, onChange }: EvaluationTabProps) {
  const [comment, setComment] = useState(data?.comment || "");
  const [signatureData, setSignatureData] = useState<string>(data?.signatureData || "");
  const { show: showToast } = useToastStore();

  const handleDataChange = (newData: Partial<EvaluationData>) => {
    const updatedData = { comment, signatureData, ...newData };
    onChange?.(updatedData);
  };

  const handleCommentChange = (value: string) => {
    setComment(value);
    handleDataChange({ comment: value });
  };

  const handleSignatureSave = (data: string) => {
    setSignatureData(data);
    handleDataChange({ signatureData: data });
    showToast("사인이 저장되었습니다");
  };

  return (
    <div className="text-white">
      <div className="flex flex-col gap-6">
        <StatusCheck
          labels={["숙면상태", "컨디션", "활동강도"]}
        />

        <InputPair
          label="코멘트"
          description="운동에 대한 코멘트를 적어주세요."
          required
          id="comment"
          name="comment"
          isTextArea
          value={comment}
          onChange={(e) => handleCommentChange(e.target.value)}
          rules={{ required: "코멘트를 입력하세요" }}
        />

        <div className="flex flex-col gap-2">
          <Label className="flex flex-col items-start gap-1">
            PT 확인 사인
            <small className="text-muted-foreground">PT 회원의 사인을 받아 PT 확인을 받으세요.</small>
          </Label>
          <div className="border border-gray-600 rounded-md p-4 h-[150px]">
            <SignatureCanvas onSave={handleSignatureSave} />
          </div>
        </div>
      </div>
    </div>
  );
}
