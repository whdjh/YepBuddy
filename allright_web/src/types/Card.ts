export interface CardData {
  id: number;
  author: string;
  location: string;
  tags: string[];
  thumbnail?: string;
}

export interface TrainerCardProps {
  id: string;
  name: string;
  description: string;
  commentsCount: number;
  viewsCount: number;
  votesCount: number;
}

export interface IdeasCardProps {
  id: string;
  title: string;
  viewsCount: number;
  postedAt: string;
  likeCount: number;
  claimed?: boolean;
}

export interface PartnerCardProps {
  id: string;
  gym: string;
  gymLogoUrl: string;
  gymHq: string;
  title: string;
  postedAt: string;
  type: string;
  positionLocation: string;
  time: string;
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

export interface TeamCardProps {
  id: string;
  leaderUsername: string;
  leaderAvatarUrl: string;
  positions: string[];
  teamDescription: string;
}