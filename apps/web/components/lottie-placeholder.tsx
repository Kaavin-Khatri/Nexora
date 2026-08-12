"use client";

import { DotLottiePlayer } from '@dotlottie/react-player';
import { useEffect, useState } from 'react';
import '@dotlottie/react-player/dist/index.css';

export function LottiePlaceholder({
  src = "https://lottie.host/80bb6e23-74b8-469b-9c71-26ec037a3536/HwO2QxR01u.json",
  className = "w-48 h-48"
}: {
  src?: string;
  className?: string;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className={`bg-white/5 animate-pulse rounded-full ${className}`} />;

  return (
    <div className={className}>
      <DotLottiePlayer
        src={src}
        autoplay
        loop
      />
    </div>
  );
}
