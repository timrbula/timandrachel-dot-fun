import { type ReactNode } from 'react';

interface BlinkingTextProps {
  children: ReactNode;
  speed?: 'slow' | 'normal' | 'fast';
  className?: string;
}

export default function BlinkingText({
  children,
  speed = 'normal',
  className = '',
}: BlinkingTextProps) {
  const speedClass = speed === 'slow' ? 'blink-slow' : speed === 'fast' ? 'blink-fast' : 'blink';

  return (
    <span className={`${speedClass} ${className}`}>
      {children}
    </span>
  );
}

// Made with Bob
