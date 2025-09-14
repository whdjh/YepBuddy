export interface CardData {
  id: number;
  author: string;
  location: string;
  tags: string[];
  thumbnail?: string;
}

export interface ProductCardProps {
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