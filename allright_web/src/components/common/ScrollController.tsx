"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

export default function ScrollController() {
  const pathname = usePathname();
  
  useEffect(() => {
    // 로그인 페이지와 다이어리 페이지에서만 스크롤 차단
    if (pathname === '/login' || pathname === '/diary') {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
      document.body.style.height = 'auto';
    }
    
    // 컴포넌트 언마운트 시 스크롤 복원
    return () => {
      document.body.style.overflow = 'auto';
      document.body.style.height = 'auto';
    };
  }, [pathname]);
  
  return null; // 이 컴포넌트는 UI를 렌더링하지 않음
}
