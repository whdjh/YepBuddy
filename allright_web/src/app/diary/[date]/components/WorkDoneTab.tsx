"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface WorkDoneTabProps {
  urls: string[];
  onChange: (urls: string[]) => void;
}

export default function WorkDoneTab({ urls, onChange }: WorkDoneTabProps) {
  const [localUrls, setLocalUrls] = useState<string[]>(urls ?? []);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // 상위 변경과 동기화
  useEffect(() => {
    setLocalUrls(urls ?? []);
  }, [urls]);

  // 파일 여러 장 선택 허용
  const handleSelect: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const next = [...localUrls];
    for (const f of Array.from(files)) {
      const url = URL.createObjectURL(f);
      next.push(url);
    }
    setLocalUrls(next);
    onChange(next);
  };

  const handleRemove = (idx: number) => {
    const target = localUrls[idx];
    if (target) URL.revokeObjectURL(target); // 변경: 개별 삭제 시 revoke
    const next = localUrls.filter((_, i) => i !== idx);
    setLocalUrls(next);
    onChange(next);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Input
          id="wod-photo"
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleSelect}
          className="w-full"
        />
      </div>

      {localUrls.length > 0 ? (
        <ul className="flex flex-col gap-3">
          {localUrls.map((u, idx) => (
            <li
              key={`${u}-${idx}`} // 키
              className="rounded-lg border border-white/10 p-3 space-y-2"
            >
              <div className="relative w-full aspect-square overflow-hidden rounded-md">
                <Image
                  src={u}
                  alt={`오운완 사진 ${idx + 1}`}
                  fill
                  className="object-cover"
                />

                <Button
                  type="button"
                  variant="outline"
                  aria-label={`사진 ${idx + 1} 삭제`}
                  onClick={() => handleRemove(idx)}
                  className="absolute right-2 top-2 z-10 inline-flex h-8 w-8 items-center justify-center rounded-full p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
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
