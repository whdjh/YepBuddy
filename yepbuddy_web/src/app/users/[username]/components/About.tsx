"use client";

import { useProfileAbout } from "@/hooks/queries/profile/useProfileAbout";

function toList(v?: string[] | null): string[] {
  if (!v) return [];
  return v.map((s) => s.trim()).filter(Boolean);
}

// 혹시 API가 문자열로 내려오는 경우를 대비한 보조 파서 (콤마/줄바꿈 모두)
function parseToList(text?: string | null): string[] {
  if (!text) return [];
  return text
    .split(/[\n,]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export default function About({ username }: { username: string }) {
  const { data, isLoading } = useProfileAbout(username);
  const about = data?.ok ? data.about : null;

  const histories =
    Array.isArray(about?.histories) ? toList(about?.histories) : parseToList((about as any)?.history);
  const qualifications =
    Array.isArray(about?.qualifications) ? toList(about?.qualifications) : parseToList((about as any)?.qualifications);

  return (
    <div className="max-w-screen-md flex flex-col space-y-10">
      <section className="space-y-2.5">
        <h4 className="text-2xl font-bold">헬스근무지</h4>
        <p className="text-lg">{isLoading ? "로딩중..." : about?.location ?? "미입력"}</p>
      </section>

      <section className="space-y-2.5">
        <h4 className="text-2xl font-bold">자기소개</h4>
        <p className="text-lg whitespace-pre-wrap">
          {isLoading ? "로딩중..." : about?.bio ?? "안녕하세요 :)"}
        </p>
      </section>

      <section className="space-y-2.5">
        <h4 className="text-2xl font-bold">경력</h4>
        <ul className="text-lg list-disc list-inside">
          {isLoading
            ? [1, 2, 3].map((i) => <li key={i}>로딩중...</li>)
            : (histories.length ? histories : ["경력 정보가 없습니다."]).map((item) => (
              <li key={item}>{item}</li>
            ))}
        </ul>
      </section>

      <section className="space-y-2.5">
        <h4 className="text-2xl font-bold">자격증</h4>
        <ul className="text-lg list-disc list-inside">
          {isLoading
            ? [1, 2, 3].map((i) => <li key={i}>로딩중...</li>)
            : (qualifications.length ? qualifications : ["자격증 정보가 없습니다."]).map((item) => (
              <li key={item}>{item}</li>
            ))}
        </ul>
      </section>
    </div>
  );
}
