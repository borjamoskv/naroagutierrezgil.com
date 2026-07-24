'use client';

import { useSyncExternalStore } from 'react';
import dynamic from 'next/dynamic';

const Preloader = dynamic(() => import("./Preloader"), { ssr: false });
const CustomCursor = dynamic(() => import("./CustomCursor"), { ssr: false });

const emptySubscribe = () => () => {};

export default function ClientWrapper() {
  const isMounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  if (!isMounted) return null;

  return (
    <>
      <Preloader />
      <CustomCursor />
    </>
  );
}
