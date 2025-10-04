"use client";

import type { EvaluationData, EvaluationStatus } from "@/types/Diary";

interface EvaluationViewProps {
  data: EvaluationData;
}

const LABELS: Array<keyof EvaluationStatus> = ["숙면상태", "컨디션", "활동강도"];

export default function EvaluationView({ data }: EvaluationViewProps) {
  const { status, comment, signatureData } = data;

  return (
    <div className="text-white space-y-6">
      <section>
        <h3 className="mb-3 text-base font-medium">오늘 상태</h3>
        <div className="flex flex-wrap gap-2">
          {LABELS.map((k) => (
            <span
              key={k}
              className="inline-flex items-center gap-2 rounded-md border border-white/10 bg-white/5 px-3 py-1.5 text-sm"
            >
              <span className="text-muted-foreground">{k}</span>
              <strong className="text-white">{status[k]}</strong>
            </span>
          ))}
        </div>
      </section>

      {/* 코멘트 */}
      <section>
        <h3 className="mb-3 text-base font-medium">코멘트</h3>
        <div className="rounded-md border border-white/10 bg-white/5 p-4 text-sm leading-6">
          {comment?.trim() ? comment : <span className="text-gray-400">코멘트가 없습니다.</span>}
        </div>
      </section>

      {/* 사인 이미지 */}
      <section>
        <h3 className="mb-3 text-base font-medium">PT 확인 사인</h3>
        <div className="flex items-center justify-center rounded-md border border-white/10 bg-white p-4">
          {signatureData ? (
            // dataURL 또는 이미지 URL 모두 표시 가능
            <img
              src={signatureData}
              alt="서명 이미지"
              className="max-h-40 object-contain"
            />
          ) : (
            <span className="text-sm text-gray-500">사인이 없습니다.</span>
          )}
        </div>
      </section>
    </div>
  );
}
