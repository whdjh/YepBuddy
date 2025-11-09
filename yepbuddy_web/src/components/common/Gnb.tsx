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
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
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
];

export default function Gnb() {
  const [isSheetOpen, setIsSheetOpen] = useState(false);

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
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
