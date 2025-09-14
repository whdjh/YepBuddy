export default function ProfileOverview() {
  return (
    <>
      <div className="space-y-2.5">
        <h4 className="text-2xl font-bold">자기소개</h4>
        <p className="text-lg">
          저는 이런 사람이에요
        </p>
      </div>
      <div className="space-y-2.5">
        <h4 className="text-2xl font-bold">이런 사람이면 좋겠어요</h4>
        <ul className="text-lg list-disc list-inside">
          {[
            "가슴이 좋아요",
            "진심이에요.",
            "맞출 수 있어요",
          ].map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
      <div className="space-y-2.5">
        <h4 className="text-2xl font-bold">약력</h4>
        <ul className="text-lg list-disc list-inside">
          {[
            "헬스장 보유",
            "프로 자격증",
            "생체 2급",
          ].map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
      <div className="space-y-2.5">
        <h4 className="text-2xl font-bold">장점</h4>
        <ul className="text-lg list-disc list-inside">
          {[
            "시간엄수",
            "유연성",
          ].map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
    </>
  );
}