"use client";

import Link from "next/link";
import Logo from "../../../public/ic_logo.svg";
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
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  BarChart3Icon,
  BellIcon,
  LogOutIcon,
  MessageCircleIcon,
  SettingsIcon,
  UserIcon,
  MenuIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { useState } from "react";

interface SubItem {
  name: string;
  description?: string;
  href: string;
}

interface Menu {
  name: string;
  href: string;
  items?: SubItem[];
  highlightLast?: boolean;
}

const menus: Menu[] = [
  {
    name: "운동템포",
    href: "/tempoauto",
    highlightLast: false,
    items: [
      { name: "PC 버전", description: "세밀한 템포 조절", href: "/tempoauto" },
      { name: "모바일 버전", description: "간단한 카운팅", href: "/tempomanual" },
    ],
  },
  { name: "단백질", href: "/protein" },
  { name: "헬스장", href: "/gym" },
  { name: "운동일지", href: "/diary" },
  {
    name: "트레이너",
    href: "/trainer/search",
    highlightLast: true,
    items: [
      { name: "트레이너 검색", description: "이름으로 트레이너 검색", href: "/trainer/search" },
      { name: "헬스장별 트레이너", description: "헬스장별 트레이너 목록", href: "/trainer/categories" },
      { name: "트레이너 등록", description: "트레이너로 내 프로필 등록", href: "/trainer/submit" },
    ],
  },
];

export default function Gnb({
  isLoggedIn,
  hasNotifications,
  hasMessages,
  username,
  displayName,
  avatarUrl,
  onLogout,
}: {
  isLoggedIn: boolean;
  hasNotifications: boolean;
  hasMessages: boolean;
  username: string;
  displayName?: string;
  avatarUrl?: string;
  onLogout?: () => void;
}) {
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const nameForDisplay = displayName || username || "사용자";
  const handleForDisplay = username ? `@${username}` : "@user";

  const logoutItem = onLogout ? (
    <DropdownMenuItem className="cursor-pointer" onClick={onLogout}>
      <LogOutIcon className="mr-2 size-4" />
      로그아웃
    </DropdownMenuItem>
  ) : (
    <DropdownMenuItem asChild className="cursor-pointer">
      <Link href="/auth/logout">
        <LogOutIcon className="mr-2 size-4" />
        로그아웃
      </Link>
    </DropdownMenuItem>
  );

  return (
    <nav className="fixed top-0 left-0 z-50 h-[4.5rem] w-full bg-[#191919]/80 backdrop-blur">
      <div className="flex items-center justify-between px-5 pc:px-20 py-1.5">
        <div className="hidden tab:flex items-center gap-2">
          <Link href="/" aria-label="메인페이지로 이동">
            <Logo width={90} height={60} />
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

        {/* 모바일 탭 메뉴 */}
        <div className="flex w-full items-center justify-between tab:hidden">
          <Link href="/" aria-label="메인페이지로 이동">
            <Logo width={100} height={70} />
          </Link>
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <Button size="icon" variant="ghost" aria-label="모바일 메뉴 열기">
                <MenuIcon className="size-6" />
              </Button>
            </SheetTrigger>

            <SheetContent>
              <SheetHeader>
                <SheetTitle>메뉴</SheetTitle>
              </SheetHeader>
              <div className="px-3">
                <Accordion type="single" collapsible>
                  {menus.map((menu) => (
                    <AccordionItem key={menu.name} value={menu.name}>
                      <AccordionTrigger>{menu.name}</AccordionTrigger>
                      <AccordionContent>
                        {menu.items ? (
                          <ul className="space-y-1">
                            {menu.items.map((item) => (
                              <li key={item.name}>
                                <Link
                                  href={item.href}
                                  className="block px-3 py-1 text-sm"
                                  onClick={() => setIsSheetOpen(false)}
                                >
                                  <div className="font-medium">{item.name}</div>
                                  {item.description && (
                                    <div className="text-xs text-muted-foreground">
                                      {item.description}
                                    </div>
                                  )}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <Link
                            href={menu.href}
                            className="block px-3 py-1 text-sm font-medium"
                            onClick={() => setIsSheetOpen(false)}
                          >
                            {menu.name}
                          </Link>
                        )}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>

              <SheetFooter>
                {isLoggedIn ? (
                  <div className="flex justify-end gap-2">
                    <Button size="icon" variant="ghost" asChild className="relative">
                      <Link href="/my/notifications" onClick={() => setIsSheetOpen(false)}>
                        <BellIcon className="size-4" />
                        {hasNotifications && (
                          <div className="absolute right-1.5 top-1.5 size-2 rounded-full bg-red-500" />
                        )}
                      </Link>
                    </Button>
                    <Button size="icon" variant="ghost" asChild className="relative">
                      <Link href="/my/messages" onClick={() => setIsSheetOpen(false)}>
                        <MessageCircleIcon className="size-4" />
                        {hasMessages && (
                          <div className="absolute right-1.5 top-1.5 size-2 rounded-full bg-red-500" />
                        )}
                      </Link>
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Avatar>
                          <AvatarImage src={avatarUrl} />
                          <AvatarFallback>{nameForDisplay[0]?.toUpperCase() || "U"}</AvatarFallback>
                        </Avatar>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-[300px]">
                        <DropdownMenuLabel className="flex flex-col">
                          <span className="font-medium">{nameForDisplay}</span>
                          <span className="text-xs text-muted-foreground">{handleForDisplay}</span>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                          <DropdownMenuItem asChild className="cursor-pointer">
                            <Link href="/my/dashboard" onClick={() => setIsSheetOpen(false)}>
                              <BarChart3Icon className="mr-2 size-4" />
                              대쉬보드
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild className="cursor-pointer">
                            <Link href={`/users/${username}`} onClick={() => setIsSheetOpen(false)}>
                              <UserIcon className="mr-2 size-4" />
                              프로필
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild className="cursor-pointer">
                            <Link href="/my/settings" onClick={() => setIsSheetOpen(false)}>
                              <SettingsIcon className="mr-2 size-4" />
                              프로필수정
                            </Link>
                          </DropdownMenuItem>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        {logoutItem}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ) : (
                  <div className="flex justify-end gap-2">
                    <Button asChild variant="secondary">
                      <Link href="/auth/login" onClick={() => setIsSheetOpen(false)}>
                        로그인
                      </Link>
                    </Button>
                    <Button asChild variant="secondary">
                      <Link href="/auth/join" onClick={() => setIsSheetOpen(false)}>
                        회원가입
                      </Link>
                    </Button>
                  </div>
                )}
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </div>

        {isLoggedIn ? (
          <div className="hidden tab:flex items-center gap-4">
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
                  <AvatarImage src={avatarUrl} />
                  <AvatarFallback>{nameForDisplay[0]?.toUpperCase() || "U"}</AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-[300px]">
                <DropdownMenuLabel className="flex flex-col">
                  <span className="font-medium">{nameForDisplay}</span>
                  <span className="text-xs text-muted-foreground">{handleForDisplay}</span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link href="/my/dashboard">
                      <BarChart3Icon className="mr-2 size-4" />
                      대쉬보드
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link href={`/users/${username}`}>
                      <UserIcon className="mr-2 size-4" />
                      프로필
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link href="/my/settings">
                      <SettingsIcon className="mr-2 size-4" />
                      프로필수정
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                {logoutItem}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ) : (
          <div className="hidden tab:flex items-center gap-4">
            <Button asChild variant="secondary">
              <Link href="/auth/login">로그인</Link>
            </Button>
            <Button asChild className="hidden tab:inline-flex">
              <Link href="/auth/join">회원가입</Link>
            </Button>
          </div>
        )}
      </div>
    </nav>
  );
}
