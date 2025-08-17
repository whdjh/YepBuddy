"use client";

import { useState } from 'react';

export default function EvaluationTab() {
  const [trainerComment, setTrainerComment] = useState('');
  const [feedback, setFeedback] = useState('');
  const [ptSignature, setPtSignature] = useState('');

  return (
    <div className="text-white">
      <div className="space-y-8">
        {/* 트레이너의 한줄평 */}
        <div>
          <h3 className="text-lg font-medium text-white mb-4">트레이너의 한줄평</h3>
          <textarea
            value={trainerComment}
            onChange={(e) => setTrainerComment(e.target.value)}
            placeholder="오늘 운동에 대한 한줄평을 작성해주세요..."
            className="w-full px-4 py-3 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:border-[#16a34a] focus:outline-none bg-transparent resize-none"
            rows={3}
          />
        </div>

        {/* 피드백 */}
        <div>
          <h3 className="text-lg font-medium text-white mb-4">피드백</h3>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="운동에 대한 피드백을 작성해주세요..."
            className="w-full px-4 py-3 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:border-[#16a34a] focus:outline-none bg-transparent resize-none"
            rows={5}
          />
        </div>

        {/* PT 확인 사인 */}
        <div>
          <h3 className="text-lg font-medium text-white mb-4">PT 확인 사인</h3>
          <div className="border border-gray-600 rounded-lg p-4">
            <input
              type="text"
              value={ptSignature}
              onChange={(e) => setPtSignature(e.target.value)}
              placeholder="PT 트레이너 사인을 입력하세요"
              className="w-full px-3 py-2 border border-gray-600 rounded text-white placeholder-gray-500 focus:border-[#16a34a] focus:outline-none bg-transparent"
            />
            {ptSignature && (
              <div className="mt-3 p-3 border border-[#16a34a] rounded bg-transparent">
                <p className="text-sm text-gray-400 mb-1">확인 사인:</p>
                <p className="text-[#16a34a] font-medium">{ptSignature}</p>
              </div>
            )}
          </div>
        </div>

        {/* 저장 버튼 */}
        <div className="pt-4">
          <button className="w-full text-[#16a34a] border-2 border-[#16a34a] py-3 rounded-lg hover:bg-[#16a34a] hover:text-white transition-colors font-medium">
            평가 저장
          </button>
        </div>
      </div>
    </div>
  );
}
