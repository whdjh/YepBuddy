import Link from "next/link";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogDescription,
  DialogHeader,
  DialogContent,
  DialogTrigger,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

export default function HeaderSection() {
  return (
    <div className="flex items-center gap-4">
      <Avatar className="size-40">
        <AvatarImage src="https://github.com/gym.png" />
        <AvatarFallback>N</AvatarFallback>
      </Avatar>
      <div className="space-y-5">
        <div className="flex flex-col gap-2">
          <div className="flex gap-5">
            <h1 className="text-lg tab:text-2xl font-semibold">이주훈</h1>
            <Button variant="outline" asChild>
              <Link href="/my/settings">프로필 수정</Link>
            </Button>
          </div>
          <div className="flex gap-5">
            <Button variant="outline">팔로우</Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">메세지</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>메세지</DialogTitle>
                  <DialogDescription asChild>
                    <form className="mt-3">
                      <Textarea placeholder="Message" className="resize-none mb-3" rows={4} />
                      <Button type="submit">보내기</Button>
                    </form>
                  </DialogDescription>
                </DialogHeader>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        <div className="flex flex-col tab:flex-row gap-2 items-center">
          <span className="text-xs tab:text-sm text-muted-foreground">@wngns9807</span>
          <Badge variant={"secondary"}>등 장인</Badge>
        </div>
      </div>
    </div>
  );
}