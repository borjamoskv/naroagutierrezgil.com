'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

const Preloader = dynamic(() => import("./Preloader"), { ssr: false });
const CustomCursor = dynamic(() => import("./CustomCursor"), { ssr: false });

export default function ClientWrapper() {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <>
      <Preloader />
      <CustomCursor />
    </>
  );
}
