// src/app/users/[username]/components/HeaderSection.tsx
"use client";

import Link from "next/link";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogDescription,
  DialogHeader,
  DialogContent,
  DialogTrigger,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useMe } from "@/hooks/queries/auth/useMe";

interface Props {
  username: string; // URL 파라미터
}

export default function HeaderSection({ username }: Props) {
  const { data, isLoading } = useMe();

  const me =
    data && data.ok ? data.user : null;

  const isOwner =
    !!me && me.username === username;

  const displayName = me?.displayName ?? "사용자명";
  const avatarUrl = me?.avatarUrl ?? "";
  // 역할(role)은 /api/auth/me에서 아직 안 내려주므로 임시 표기
  const roleLabel = isOwner ? "회원(본인)" : "회원";

  return (
    <div className="flex items-center gap-4">
      <Avatar className="size-40">
        <AvatarImage src={avatarUrl} />
        <AvatarFallback>{displayName?.[0] ?? "U"}</AvatarFallback>
      </Avatar>

      <div className="space-y-5">
        <div className="flex flex-col gap-2">
          <div className="flex gap-5 flex-col tab:flex-row items-center justify-start">
            <h1 className="text-lg tab:text-2xl font-semibold">
              {isLoading ? "로딩중..." : displayName}
            </h1>

            {isOwner ? (
              <Button variant="outline" asChild>
                <Link href="/my/settings">프로필 수정</Link>
              </Button>
            ) : null}

            <Badge>{roleLabel}</Badge>
          </div>

          {!isOwner && (
            <div className="flex gap-5">
              <Button variant="outline">팔로우</Button>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline">메세지</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>메세지</DialogTitle>
                    <DialogDescription asChild>
                      <form className="mt-3">
                        <Textarea
                          placeholder="Message"
                          className="resize-none mb-3"
                          rows={4}
                        />
                        <Button type="submit">보내기</Button>
                      </form>
                    </DialogDescription>
                  </DialogHeader>
                </DialogContent>
              </Dialog>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
