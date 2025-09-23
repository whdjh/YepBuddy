// TODO: 내가 커뮤니티에 쓴글 목록들을 나올 수 있게
"use client";

import { CardSection } from "@/app/community/components/CardSection";
import { mockPosts } from "@/mock/postCardData";

export default function Post() {
  return (
    <div className="space-y-20">
      <CardSection cards={mockPosts} />
    </div>
  );
}