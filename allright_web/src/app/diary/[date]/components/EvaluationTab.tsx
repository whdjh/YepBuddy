"use client";

import { Label } from "@/components/ui/label";
import InputPair from "@/components/common/InputPair";
import SignatureCanvas from "@/app/diary/[date]/components/EvaluationTab/SignatureCanvas";
import StatusCheck from "@/app/diary/[date]/components/EvaluationTab/StatusCheck";
import { useToastStore } from "@/stores/useToastStore";
import type { EvaluationData, EvaluationStatus } from "@/types/Diary";

interface EvaluationTabProps {
  data: EvaluationData;
  onChange: (data: EvaluationData) => void;
}

export default function EvaluationTab({ data, onChange }: EvaluationTabProps) {
  const { show: showToast } = useToastStore();

  const setStatus = (next: EvaluationStatus) => onChange({ ...data, status: next });
  const setComment = (value: string) => onChange({ ...data, comment: value });
  const setSignature = (png: string) => {
    onChange({ ...data, signatureData: png });
    showToast("사인이 저장되었습니다");
  };

  return (
    <div className="text-white">
      <div className="flex flex-col gap-6">
        <StatusCheck
          labels={["숙면상태", "컨디션", "활동강도"]}
          value={data.status}
          onChange={setStatus}
        />

        <InputPair
          label="코멘트"
          description="운동에 대한 코멘트를 적어주세요."
          required
          id="comment"
          name="comment"
          isTextArea
          value={data.comment}
          onChange={(e) => setComment(e.target.value)}
          rules={{ required: "코멘트를 입력하세요" }}
        />

        <div className="flex flex-col gap-2">
          <Label className="flex flex-col items-start gap-1">
            PT 확인 사인
            <small className="text-muted-foreground">PT 회원의 사인을 받아 PT 확인을 받으세요.</small>
          </Label>
          <div className="border border-gray-600 rounded-md p-4 h-[150px]">
            <SignatureCanvas value={data.signatureData} onSave={setSignature} />
          </div>
        </div>
      </div>
    </div>
  );
}
