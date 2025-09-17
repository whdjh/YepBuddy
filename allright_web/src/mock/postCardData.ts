import { PostCardProps } from "@/types/Card";

export const mockPosts: PostCardProps[] = [
  {
    id: "1",
    title: "오늘 등운동 했는데 어때?",
    author: "이주훈",
    authorAvatarUrl: "https://github.com/gym.png",
    category: "back",
    postedAt: "12시간 전",
    votesCount: 12,
  },
  {
    id: "2",
    title: "벤치프레스 기록 공유합니다!",
    author: "김민수",
    authorAvatarUrl: "https://github.com/octocat.png",
    category: "chest",
    postedAt: "1일 전",
    votesCount: 34,
  },
  {
    id: "3",
    title: "스쿼트할 때 무릎 아픈데 팁 있나요?",
    author: "박지현",
    authorAvatarUrl: "https://github.com/vercel.png",
    category: "legs",
    postedAt: "2일 전",
    votesCount: 21,
  },
  {
    id: "4",
    title: "초보자 루틴 추천 부탁드려요",
    author: "최성훈",
    authorAvatarUrl: "https://github.com/next.png",
    category: "general",
    postedAt: "3일 전",
    votesCount: 8,
  },
  {
    id: "5",
    title: "유산소 언제 하는 게 제일 좋을까요?",
    author: "이다은",
    authorAvatarUrl: "https://github.com/shadcn.png",
    category: "cardio",
    postedAt: "5일 전",
    votesCount: 17,
  },
];
