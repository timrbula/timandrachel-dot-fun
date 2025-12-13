import { useEffect, useRef } from 'react';

interface RainbowDividerProps {
  variant?: 'solid' | 'stars' | 'dots' | 'animated';
  className?: string;
}

export default function RainbowDivider({
  variant = 'solid',
  className = '',
}: RainbowDividerProps) {
  const dividerRef = useRef<HTMLHRElement>(null);

  useEffect(() => {
    if (variant === 'animated' && dividerRef.current) {
      // Add rainbow border animation
      dividerRef.current.classList.add('rainbow-border');
    }
  }, [variant]);

  const getVariantClass = () => {
    switch (variant) {
      case 'stars':
        return 'geo-divider-stars';
      case 'dots':
        return 'geo-divider-dots';
      case 'animated':
        return 'geo-divider';
      default:
        return 'geo-divider';
    }
  };

  return (
    <hr
      ref={dividerRef}
      className={`${getVariantClass()} ${className}`}
      aria-hidden="true"
    />
  );
}

// Made with Bob
