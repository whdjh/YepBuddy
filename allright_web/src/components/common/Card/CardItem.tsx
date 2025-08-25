import { Card } from './index';

interface CardItemProps {
  author: string;
  location: string;
  tags: string[];
  thumbnail?: string;
}

export default function CardItem({ 
  author, 
  location, 
  tags, 
  thumbnail, 
}: CardItemProps) {
  return (
    <div className="border-1 border-gray-400 rounded-md p-2 flex flex-col gap-2">
      {thumbnail && (
        <Card.Thumbnail thumbnail={thumbnail} alt="thumbnail" isFirst={true} />
      )}
      <Card.TitleBlock author={author} location={location} />
      <Card.TagList tags={tags} />
    </div>
  );
}