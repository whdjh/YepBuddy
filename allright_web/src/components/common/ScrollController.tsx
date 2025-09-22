"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

export default function ScrollController() {
  const pathname = usePathname();
  
  useEffect(() => {
    if (pathname === '/diary' || pathname === '/tempoauto' || pathname === '/tempoauto/exercise' || pathname === '/tempoauto/exercise/result' || pathname === '/tempomanual' || pathname === '/tempomanual/exercise' || pathname === '/tempomanual/exercise/result') {
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
