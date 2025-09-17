"use client";

import Link from "next/link";
import Logo from "@/asset/ic/ic_logo.svg";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  BarChart3Icon,
  BellIcon,
  LogOutIcon,
  MessageCircleIcon,
  SettingsIcon,
  UserIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

type SubItem = {
  name: string;
  description?: string;
  href: string;
};

type Menu = {
  name: string;
  href: string;
  items?: SubItem[];
  /** 마지막 항목을 2칸 확장 + 초록 강조로 보여줄지 여부 */
  highlightLast?: boolean;
};

const menus: Menu[] = [
  {
    name: "트레이너",
    href: "/trainer",
    highlightLast: true,
    items: [
      { name: "인기 트레이너", description: "추천수가 많은 트레이너 보기", href: "/trainer" },
      { name: "카테고리별", description: "지역별로 트레이너 찾기", href: "/trainer/categories" },
      { name: "트레이너 검색", description: "이름으로 원하는 트레이너 찾기", href: "/trainer/search" },
      { name: "트레이너 등록", description: "내 프로필을 트레이너로 등록하기", href: "/trainer/submit" },
      { name: "트레이너 홍보", description: "유료로 나를 홍보하기", href: "/trainer/promote" },
    ],
  },
  {
    name: "파트너",
    href: "/partner",
    highlightLast: true,
    items: [
      { name: "온라인 파트너", description: "온라인으로 함께 운동할 사람 찾기", href: "/partner?location=remote" },
      { name: "정기 모임", description: "정기적으로 만날 운동 파트너", href: "/partner?type=full-time" },
      { name: "자유 모임", description: "시간 맞춰 자유롭게 운동할 사람", href: "/partner?type=freelance" },
      { name: "1회 체험", description: "가볍게 한 번 함께 운동해보기", href: "/partner?type=internship" },
      { name: "모집 글 올리기", description: "함께할 파트너를 직접 모집하기", href: "/partner/submit" },
    ],
  },
  {
    name: "커뮤니티",
    href: "/community",
    items: [
      { name: "모든 글", description: "지금까지 올라온 글", href: "/community" },
      { name: "실시간 인기", description: "지금 가장 많이 주목받는 글", href: "/community?sort=trending" },
      { name: "최신 글", description: "방금 올라온 최신 게시글", href: "/community?sort=new" },
      { name: "글쓰기", description: "나만의 운동 이야기 공유하기", href: "/community/submit" },
    ],
  },
  {
    name: "IdeasRoutine",
    href: "/ideas",
  },
  {
    name: "회원모집",
    href: "/teams",
    highlightLast: false,
    items: [
      { name: "모집공고", description: "등록된 회원모집공고 목록 보기", href: "/teams" },
      { name: "글쓰기", description: "피티모집 글 쓰기", href: "/teams/submit" },
    ],
  },
  {
    name: "운동보조",
    href: "/tempoauto",
    highlightLast: true,
    items: [
      { name: "PC 버전", description: "세밀한 템포 조절이 가능한 버전", href: "/tempoauto" },
      { name: "모바일 버전", description: "간단한 카운팅 전용 버전", href: "/tempomanual" },
      { name: "운동일지", description: "캘린더형식으로 운동일지 기록", href: "/diary"},
    ],
  },
];

export default function Gnb({
  isLoggedIn,
  hasNotifications,
  hasMessages,
}: {
  isLoggedIn: boolean;
  hasNotifications: boolean;
  hasMessages: boolean;
}) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-[4.5rem] bg-[#191919]/80 backdrop-blur">
      <div className="flex items-center justify-between px-20 py-1.5">
        <div className="flex items-center gap-2">
          <Link href="/" aria-label="메인페이지로 이동">
            <Logo width={60} height={60} />
          </Link>
          <hr className="h-6 w-px border-0 bg-[#34343A]" />

          <NavigationMenu>
            <NavigationMenuList>
              {menus.map((menu) => (
                <NavigationMenuItem key={menu.name}>
                  {menu.items ? (
                    <>
                      <NavigationMenuTrigger>{menu.name}</NavigationMenuTrigger>
                      <NavigationMenuContent>
                        <ul className="grid w-[600px] grid-cols-2 gap-3 p-4 font-light">
                          {menu.items.map((item, idx) => {
                            const isLast = idx === menu.items!.length - 1;
                            const emphasize = Boolean(menu.highlightLast && isLast);
                            return (
                              <li
                                key={item.name}
                                className={cn(
                                  "select-none rounded-md transition-colors hover:bg-accent focus:bg-accent",
                                  emphasize &&
                                  "col-span-2 bg-[#16a34a]/20 text-white hover:bg-[#16a34a]/50 focus:bg-[#16a34a]/50"
                                )}
                              >
                                <NavigationMenuLink asChild>
                                  <Link
                                    href={item.href}
                                    className="block space-y-1 p-3 leading-none no-underline outline-none"
                                  >
                                    <span className="text-sm font-medium leading-none">
                                      {item.name}
                                    </span>
                                    {item.description && (
                                      <p
                                        className={cn(
                                          "text-sm leading-snug text-muted-foreground",
                                          emphasize && "text-white/90"
                                        )}
                                      >
                                        {item.description}
                                      </p>
                                    )}
                                  </Link>
                                </NavigationMenuLink>
                              </li>
                            );
                          })}
                        </ul>
                      </NavigationMenuContent>
                    </>
                  ) : (
                    <NavigationMenuLink asChild>
                      <Link href={menu.href}>{menu.name}</Link>
                    </NavigationMenuLink>
                  )}
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        {isLoggedIn ? (
          <div className="flex items-center gap-4">
            <Button size="icon" variant="ghost" asChild className="relative">
              <Link href="/my/notifications">
                <BellIcon className="size-4" />
                {hasNotifications && (
                  <div className="absolute right-1.5 top-1.5 size-2 rounded-full bg-red-500" />
                )}
              </Link>
            </Button>
            <Button size="icon" variant="ghost" asChild className="relative">
              <Link href="/my/messages">
                <MessageCircleIcon className="size-4" />
                {hasMessages && (
                  <div className="absolute right-1.5 top-1.5 size-2 rounded-full bg-red-500" />
                )}
              </Link>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar>
                  <AvatarImage src="https://github.com/evilrabbit.png" />
                  <AvatarFallback>N</AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-[300px]">
                <DropdownMenuLabel className="flex flex-col">
                  {/** 실제 API로 변경 */}
                  <span className="font-medium">이주훈</span>
                  {/** 실제 API로 변경 */}
                  <span className="text-xs text-muted-foreground">@wngns9807</span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link href="/my/dashboard">
                      <BarChart3Icon className="mr-2 size-4" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link href="/my/profile">
                      <UserIcon className="mr-2 size-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link href="/my/settings">
                      <SettingsIcon className="mr-2 size-4" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild className="cursor-pointer">
                  <Link href="/auth/logout">
                    <LogOutIcon className="mr-2 size-4" />
                    Logout
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <Button asChild variant="secondary">
              <Link href="/login">Login</Link>
            </Button>
            <Button asChild>
              <Link href="/signup">Join</Link>
            </Button>
          </div>
        )}
      </div>
    </nav>
  );
}
