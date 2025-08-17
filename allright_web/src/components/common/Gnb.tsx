'use client'

import Link from "next/link";
import Logo from "@/asset/ic/ic_logo.svg";

export default function Gnb() {
  const navItems = [
    { href: "/diary", label: "운동일지" },
    { href: "/trainer", label: "트레이너" },
    { href: "/tempo", label: "운동템포" },
  ];

  return (
    <header className="fixed top-0 left-0 z-50 w-full">
      <div className="flex h-[3.75rem] w-full items-center justify-center px-[1.5rem]">
        <div className="flex w-full items-center justify-between text-white mt-[1rem]">
          <nav className="flex items-center gap-[0.75rem]">
            <Link 
              href='/'
              aria-label="메인페이지로 이동"
            >
              <Logo width={60} height={60} />
            </Link>
            {navItems.map(({ href, label }) => (
              <Link 
                key={href}
                href={href}
                aria-label={`${label} 페이지로 이동`}
                className="text-white"
              >
                {label}
              </Link>
            ))}
          </nav>
          <div>
            <Link
              href="/login"
              aria-label="로그인 페이지로 이동"
            >
              로그인
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}

