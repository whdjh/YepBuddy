"use client";

import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface VideoTabProps {
  urls: string[];                          // 미리보기용 object URL 배열
  onChange: (urls: string[]) => void;      // 상위 폼에 URL 배열 반영
}

export default function VideoTab({ urls, onChange }: VideoTabProps) {
  const [localUrls, setLocalUrls] = useState<string[]>(urls ?? []);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // 상위에서 urls가 바뀌면 동기화
  useEffect(() => {
    setLocalUrls(urls ?? []);
  }, [urls]);

  // 파일 선택 시 object URL 생성하여 미리보기 + 상위로 반영
  const handleSelectFiles: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const nextUrls = [...localUrls];
    for (const f of Array.from(files)) {
      const objUrl = URL.createObjectURL(f);
      nextUrls.push(objUrl);
    }
    setLocalUrls(nextUrls);
    onChange(nextUrls);
  };

  // 개별 삭제
  const handleRemove = (idx: number) => {
    const target = localUrls[idx];

    // 개별 삭제 시에만 revoke
    if (target) URL.revokeObjectURL(target);

    const next = localUrls.filter((_, i) => i !== idx);
    setLocalUrls(next);
    onChange(next);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Input
          id="video-input"
          ref={fileInputRef}
          type="file"
          accept="video/*"
          multiple
          onChange={handleSelectFiles}
          className="w-full"
        />
      </div>

      {localUrls.length > 0 ? (
        <ul className="flex flex-col gap-3 ">
          {localUrls.map((u, idx) => (
            <li
              key={`${u}-${idx}`} // URL 기반으로 키를 고정
              className="rounded-lg border border-white/10 p-3 space-y-2"
            >
              <div className="relative rounded-md">
                <video
                  src={u}
                  controls
                  preload="metadata"   // 메타데이터만 선로드로 초기 로딩 안정화
                  playsInline          // iOS 인라인 재생 안정화
                  className="w-full rounded-md block"
                />
                <Button
                  type="button"
                  variant="outline"
                  aria-label={`영상 ${idx + 1} 삭제`}
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
        <p className="text-sm text-muted-foreground">선택된 영상이 없습니다.</p>
      )}
    </div>
  );
}
