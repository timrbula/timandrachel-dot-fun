import { useEffect, useRef, type ReactNode } from 'react';

interface MarqueeProps {
  children: ReactNode;
  speed?: number;
  direction?: 'left' | 'right';
  pauseOnHover?: boolean;
  className?: string;
}

export default function Marquee({
  children,
  speed = 20,
  direction = 'left',
  pauseOnHover = true,
  className = '',
}: MarqueeProps) {
  const marqueeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const marquee = marqueeRef.current;
    if (!marquee) return;

    // Set CSS custom property for animation duration
    marquee.style.setProperty('--marquee-speed', `${speed}s`);
  }, [speed]);

  return (
    <div
      className={`marquee-container ${className}`}
      data-direction={direction}
      data-pause-on-hover={pauseOnHover}
    >
      <div
        ref={marqueeRef}
        className={`marquee-content marquee-${direction}`}
      >
        <span className="marquee-text">{children}</span>
        <span className="marquee-text" aria-hidden="true">{children}</span>
      </div>
    </div>
  );
}

// Made with Bob
