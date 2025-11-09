export interface GymCardProps {
  id: string;
  title: string;
  location: string;
}

export interface ProteinCardProps {
  id: string;
  title: string;
  weight: string;
  avatarFile: string;
  topic: string;
  taste: string;
  price?: string;
  priceText?: string;
}

export interface CategoryCardProps {
  id: string;
  title: string;
  location: string;
}