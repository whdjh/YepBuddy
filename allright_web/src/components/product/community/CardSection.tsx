import PostCard from "@/components/common/Card/PostCard";
import { PostCardProps } from "@/types/Card";

interface CardSectionProps {
  posts: PostCardProps[];
}

export function CardSection({ posts }: CardSectionProps) {
  return (
    <div className="space-y-5">
      {posts.map((post) => (
        <PostCard key={post.id} {...post} expanded />
      ))}
    </div>
  );
}