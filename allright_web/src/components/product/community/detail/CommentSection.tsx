import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";

export default function CommentSection() {
  return (
    <form className="flex items-start gap-5 w-full tab:w-3/4">
      <Avatar className="size-14">
        <AvatarFallback>J</AvatarFallback>
        <AvatarImage src="https://github.com/gym.png" />
      </Avatar>
      <div className="flex flex-col gap-5 items-end w-full">
        <Textarea
          placeholder="댓글을 달아보세요"
          className="w-full resize-none"
          rows={5}
        />
        <Button variant="outline">
          댓글달기
        </Button>
      </div>
    </form>
  );
}