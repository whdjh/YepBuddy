"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

export default function ScrollController() {
  const pathname = usePathname();
  
  useEffect(() => {
    if (pathname === '/login' || pathname === '/diary' || pathname === '/tempo' || pathname === '/tempo/exercise' || pathname === '/tempo/exercise/result') {
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
    }
    else {
      document.body.style.overflow = 'auto';
      document.body.style.position = '';
      document.body.style.width = '';
    }
  }, [pathname]);
  
  return null;
}
