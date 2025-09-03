"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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

type Entry = { href: string; title: string; desc?: string }

// TODO: 개인다이어리는 개인이 들어갈 수 있게
// TODO: 회원다이어리는 트레이너만 볼 수 있고, 목록을 보여주고, 회원 클릭해서 들어갈 수 있음 -> 여기서 회원과 트레이너가 양방향이어야한다는점(pt종료후 다른 Pt선생도 가능)
const dairyLinks: Entry[] = [
  { href: "/dairy", title: "개인", desc: "자신의 운동기록일지를 볼 수 있어요." },
  { href: "/mypage", title: "회원", desc: "트레이너가 회원의 운동 기록을 볼 수 있어요." },
];

// TODO: 모바일은 템포조절이 안되니까 카운팅만 가능하게 하는 페이지로 개발
// TODO: PC는 템포조절이 되므로 기존 tempo로 사용
const tempoLink: Entry[] = [
  { href: "/tempomanual", title: "모바일", desc: "버튼을 눌러 세트를 카운트하며 운동해요." },
  { href: "/tempoauto", title: "PC", desc: "템포를 설정하고 자동으로 운동을 진행해요." },
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
  const pathname = usePathname();
  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-[4.5rem] bg-[#191919]/80 backdrop-blur">
      <div className="flex items-center justify-between px-2 tab:px-20 py-1.5">
        <div className="flex items-center tab:gap-2">
          <Link href="/" aria-label="메인페이지로 이동">
            <Logo width={60} height={60} />
          </Link>
          <hr className="w-px h-6 border-0 bg-[#34343A]" />

            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger>운동일지</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[150px] gap-4 tab:w-[300px]">
                      <li className="flex flex-col gap-2">
                        {dairyLinks.map((item) => (
                          <NavigationMenuLink asChild key={item.href}>
                            <Link href={item.href} data-active={isActive(item.href)}>
                              <div className="font-medium">{item.title}</div>
                              {item.desc && (
                                <div className="text-muted-foreground">
                                  {item.desc}
                                </div>
                              )}
                            </Link>
                          </NavigationMenuLink>
                        ))}
                      </li>
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>

            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger>운동템포</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[150px] gap-4 tab:w-[300px]">
                      <li className="flex flex-col gap-2">
                        {tempoLink.map((item) => (
                          <NavigationMenuLink asChild key={item.href}>
                            <Link href={item.href} data-active={isActive(item.href)}>
                              <div className="font-medium">{item.title}</div>
                              {item.desc && (
                                <div className="text-muted-foreground">
                                  {item.desc}
                                </div>
                              )}
                            </Link>
                          </NavigationMenuLink>
                        ))}
                      </li>
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
          </NavigationMenu>

          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link href="/trainer">트레이너</Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>
        {isLoggedIn ? (
          <div className="flex items-center tab:gap-4">
            <Button size="icon" variant="ghost" asChild className="relative">
              <Link href="/my/notifications">
                <BellIcon className="size-4" />
                {hasNotifications && (
                  <div className="absolute top-1.5 right-1.5 size-2 bg-red-500 rounded-full" />
                )}
              </Link>
            </Button>
            <Button size="icon" variant="ghost" asChild className="relative">
              <Link href="/my/messages">
                <MessageCircleIcon className="size-4" />
                {hasMessages && (
                  <div className="absolute top-1.5 right-1.5 size-2 bg-red-500 rounded-full" />
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
              <DropdownMenuContent className="w-[150px] tab:w-[300px]">
                <DropdownMenuLabel className="flex flex-col">
                  { /** 실제 API로 변경 */}
                  <span className="font-medium">이주훈</span>
                  { /** 실제 API로 변경 */}
                  <span className="text-xs text-muted-foreground">@wngns9807</span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link href="/my/dashboard">
                      <BarChart3Icon className="size-4 mr-2" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link href="/my/profile">
                      <UserIcon className="size-4 mr-2" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link href="/my/settings">
                      <SettingsIcon className="size-4 mr-2" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild className="cursor-pointer">
                  <Link href="/auth/logout">
                    <LogOutIcon className="size-4 mr-2" />
                    Logout
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ) : (
            <div className="flex items-center gap-4">
              {/* 모바일/PC 공통: Login */}
              <Button asChild variant="secondary">
                <Link href="/auth/login">Login</Link>
              </Button>

              {/* PC에서만 Join 보이기 */}
              <Button asChild className="hidden sm:inline-flex">
                <Link href="/auth/join">Join</Link>
              </Button>
            </div>
        )}
      </div>
    </nav>
  )
}
