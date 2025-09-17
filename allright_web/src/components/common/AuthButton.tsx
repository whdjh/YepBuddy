import { LockIcon, MessageCircleIcon, GithubIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AuthButton() {
  return (
    <div className="w-full flex flex-col items-center gap-8">
      <div className="w-full flex flex-col items-center gap-2">
        <hr className="w-full border-white/10" />
        <span className="text-xs text-muted-foreground uppercase font-medium">
          소셜 로그인
        </span>
        <hr className="w-full border-white/10" />
        
      </div>
      <div className="w-full flex flex-col gap-2">
        <Button variant="outline" className="w-full" asChild>
          <Link href="/auth/social/kakao/start">
            <MessageCircleIcon className="w-4 h-4" />
            Kakao Talk
          </Link>
        </Button>
        <Button variant="outline" className="w-full" asChild>
          <Link href="/auth/social/github/start">
            <GithubIcon className="w-4 h-4" />
            Github
          </Link>
        </Button>
        <Button variant="outline" className="w-full" asChild>
          <Link href="/auth/otp/start">
            <LockIcon className="w-4 h-4" />
            OTP
          </Link>
        </Button>
      </div>
    </div>
  );
}