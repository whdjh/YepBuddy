"use client";

interface VideoTabProps {
  urls: string[];
}

export default function VideoView({ urls }: VideoTabProps) {
  return (
    <div className="space-y-4">
      {urls?.length ? (
        <ul className="flex flex-col gap-3">
          {urls.map((u, idx) => (
            <li
              key={`video-${idx}`}
              className="rounded-lg border border-white/10 p-3 space-y-2"
            >
              <div className="relative rounded-md">
                <video
                  src={u}
                  controls
                  preload="metadata"
                  playsInline
                  className="w-full rounded-md block"
                />
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted-foreground">영상이 없습니다.</p>
      )}
    </div>
  );
}
