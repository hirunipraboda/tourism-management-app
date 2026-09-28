import React, { useEffect, useState, useRef } from 'react';
import splashVideo from '../../assets/Splash screen.mp4';

interface SplashScreenProps {
  onComplete: () => void;
}

/**
 * High-definition Video Splash Screen rendering 'Splash screen.mp4' silently (muted).
 * Automatically transitions to main view upon video completion with optional skip button.
 */
export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [isFadingOut, setIsFadingOut] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleFinish = () => {
    if (isFadingOut) return;
    setIsFadingOut(true);
    setTimeout(() => {
      onComplete();
    }, 500);
  };

  useEffect(() => {
    // Attempt auto-play with safety fallback
    if (videoRef.current) {
      videoRef.current.play().catch(() => {
        // Fallback timer if autoplay is blocked by browser policies
        setTimeout(handleFinish, 4000);
      });
    }
  }, []);

  return (
    <div
      className={`fixed inset-0 z-[9999] bg-slate-950 flex items-center justify-center overflow-hidden transition-opacity duration-500 ease-in-out ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      aria-label="NOVA Video Splash Screen"
    >
      {/* Muted HD Video Element */}
      <video
        ref={videoRef}
        src={splashVideo}
        autoPlay
        muted
        playsInline
        onEnded={handleFinish}
        className="w-full h-full object-cover"
      />
    </div>
  );
};
