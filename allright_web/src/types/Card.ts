export interface TrainerCardProps {
  id: string;
  name: string;
  description: string;
  commentsCount: number;
  viewsCount: number;
  votesCount: number;
}

export interface GymCardProps {
  id: string;
  title: string;
  viewsCount: number;
  postedAt: string;
  likesCount: number;
}

export interface ProteinCardProps {
  id: string;
  title: string;
  author: string;
  authorAvatarUrl: string;
  category: string;
  postedAt: string;
  expanded?: boolean;
  votesCount?: number;
}