export interface TrainerCardProps {
  id: string;
  avatarFile: string;
  name: string;
  description: string;
  commentsCount: number;
  viewsCount: number;
  votesCount: number;
}

export interface GymCardProps {
  id: string;
  title: string;
  location: string;
  viewsCount: number;
  postedAt: string;
  likesCount: number;
}

export interface ProteinCardProps {
  id: string;
  title: string;
  weight: string;
  avatarFile: string;
  topic: string;
  taste: string;
  price: string;      // 총가격 텍스트
  priceText: string;  // 단백질 g당 가격 텍스트
  likesCount: number;
}

export interface CategoryCardProps {
  id: string;
  title: string;
  location: string;
}

export interface MessageCardProps {
  id: string;
  avatarFile?: string;
  name: string;
  lastMessage: string;
}

export interface NotificationCardProps {
  avatarFile: string;
  avatarFallback: string;
  name: string;
  message: string;
  timestamp: string;
  seen: boolean;
}

export interface ReviewCardProps {
  name: string;
  handle: string;
  avatarFile: string;
  rating: number;
  content: string;
  postedAt: string;
}