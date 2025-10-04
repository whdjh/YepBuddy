"use client";

import Image from "next/image";

interface WorkDoneTabProps {
  urls: string[];
}

export default function WorkDoneTab({ urls }: WorkDoneTabProps) {
  return (
    <div className="space-y-4">
      {urls?.length ? (
        <ul className="flex flex-col gap-3">
          {urls.map((u, idx) => (
            <li
              key={`photo-${idx}`}
              className="rounded-lg border border-white/10 p-3 space-y-2"
            >
              <div className="relative w-full aspect-square overflow-hidden rounded-md">
                <Image src={u} alt={`오운완 사진 ${idx + 1}`} fill className="object-cover" />
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted-foreground">업로드한 사진이 없습니다.</p>
      )}
    </div>
  );
}
