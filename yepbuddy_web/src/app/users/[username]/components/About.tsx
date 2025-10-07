export default function About() {
  return (
    <div className="max-w-screen-md flex flex-col space-y-10">
      <div className="space-y-2.5">
        <h4 className="text-2xl font-bold">헬스근무지</h4>
      </div>
      <div className="space-y-2.5">
        <h4 className="text-2xl font-bold">자기소개</h4>
        <p className="text-lg">
          저는 이런 사람이에요
        </p>
      </div>
      <div className="space-y-2.5">
        <h4 className="text-2xl font-bold">경력</h4>
        <ul className="text-lg list-disc list-inside">
          {[
            "경력1",
            "경력2",
            "경력3",
          ].map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
      <div className="space-y-2.5">
        <h4 className="text-2xl font-bold">자격증</h4>
        <ul className="text-lg list-disc list-inside">
          {[
            "자격증1",
            "자격증2",
            "자격증3",
          ].map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}