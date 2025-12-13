import { type ReactNode, type MouseEvent } from 'react';

interface GeoButtonProps {
  children: ReactNode;
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
  variant?: 'primary' | 'secondary' | 'warning';
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  className?: string;
  href?: string;
}

export default function GeoButton({
  children,
  onClick,
  variant = 'primary',
  type = 'button',
  disabled = false,
  className = '',
  href,
}: GeoButtonProps) {
  const variantClass = `geo-button-${variant}`;
  const baseClasses = `geo-button ${variantClass} ${className}`;

  // If href is provided, render as a link styled as a button
  if (href) {
    return (
      <a
        href={href}
        className={baseClasses}
        aria-disabled={disabled}
        onClick={(e) => {
          if (disabled) {
            e.preventDefault();
          }
        }}
      >
        {children}
      </a>
    );
  }

  // Otherwise render as a button
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={baseClasses}
    >
      {children}
    </button>
  );
}

// Made with Bob
