"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import Logo from "@/asset/ic/ic_logo.svg"

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"

type Entry = { href: string; title: string; desc?: string }
type Menu = { name: string; items: Entry[] }

const menus: Menu[] = [
  {
    name: "운동일지",
    items: [
      { href: "/diary", title: "개인", desc: "자신의 운동기록일지를 볼 수 있어요." },
      { href: "/mypage", title: "회원", desc: "회원의 운동기록일지를 볼 수 있어요." },
    ],
  },
  {
    name: "운동템포",
    items: [
      { href: "/diary", title: "모바일", desc: "카운팅해줄 수 있어요." },
      { href: "/tempo", title: "PC", desc: "템포 조절이 가능해요." },
    ],
  },
]

export default function Gnb() {
  const pathname = usePathname()
  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/")

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-[4.5rem] bg-[#191919]/80 backdrop-blur">
      <div className="flex items-center justify-between px-5 tab:px-20 py-1.5">
        <div className="flex items-center gap-0.5 tab:gap-2">
          <Link href="/" aria-label="메인페이지로 이동">
            <Logo width={60} height={60} />
          </Link>
          <hr className="w-px h-6 border-0 bg-[#34343A]" />

          <NavigationMenu>
            <NavigationMenuList>
              {menus.map((menu) => (
                <NavigationMenuItem key={menu.name}>
                  <NavigationMenuTrigger>{menu.name}</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[150px] gap-4 tab:w-[300px]">
                      <li className="flex flex-col gap-2">
                        {menu.items.map((item) => (
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
              ))}
            </NavigationMenuList>
          </NavigationMenu>
        </div>
      </div>
    </nav>
  )
}
