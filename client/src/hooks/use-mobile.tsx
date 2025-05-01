import { useState, useEffect } from 'react';

/**
 * A hook to determine if the current device is a mobile device
 * based on screen width
 */
export const useMobile = (breakpoint: number = 768): boolean => {
  // Initialize with a check for window to support SSR
  const [isMobile, setIsMobile] = useState<boolean>(
    typeof window !== 'undefined' ? window.innerWidth < breakpoint : false
  );

  useEffect(() => {
    // Skip if window is not available (SSR)
    if (typeof window === 'undefined') return;

    const checkMobile = () => {
      setIsMobile(window.innerWidth < breakpoint);
    };

    // Initial check
    checkMobile();

    // Add resize listener
    window.addEventListener('resize', checkMobile);

    // Clean up
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, [breakpoint]);

  return isMobile;
};

export default useMobile;
