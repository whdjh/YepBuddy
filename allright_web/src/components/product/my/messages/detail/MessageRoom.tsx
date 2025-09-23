import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { SendIcon } from "lucide-react";
import MessageBubble from "@/components/product/my/messages/detail/MessageBubble";

export default function MessageRoom() {
  return (
    <div className="h-full flex-1 flex flex-col">
      <div className="w-full max-w-7xl mx-auto flex-1 min-h-0 flex flex-col gap-5">
        <Card>
          <CardHeader className="flex flex-row items-center gap-4">
            <Avatar className="size-14">
              <AvatarImage src="https://github.com/stevejobs.png" />
              <AvatarFallback>S</AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-0">
              <CardTitle className="text-xl">이주훈</CardTitle>
              <CardDescription>2일전</CardDescription>
            </div>
          </CardHeader>
        </Card>

        <div className="flex-1 min-h-0 overflow-y-auto py-10 flex flex-col gap-5">
          <MessageBubble
            key={1}
            avatarUrl="https://github.com/stevejobs.png"
            avatarFallback="S"
            content="메세지 내용."
          />
        </div>

        <Card>
          <CardHeader>
            <form className="relative flex justify-end items-center">
              <Textarea
                placeholder="Write a message..."
                rows={2}
                className="resize-none pr-10"
              />
              <Button type="submit" size="icon" variant={"outline"} className="absolute right-2">
                <SendIcon className="size-4" />
              </Button>
            </form>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}