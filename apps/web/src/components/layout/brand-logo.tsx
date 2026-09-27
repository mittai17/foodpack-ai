import Image from 'next/image';
import { cn } from '@/lib/utils';

export interface BrandLogoProps {
  variant?: 'full' | 'icon';
  height?: number;
  width?: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  priority?: boolean;
  alt?: string;
}

export function BrandLogo({
  variant = 'full',
  height,
  width,
  size = 'md',
  className,
  priority = false,
  alt = 'NutriWrap',
}: BrandLogoProps) {
  if (variant === 'icon') {
    const dim = height || (size === 'sm' ? 24 : size === 'md' ? 32 : size === 'lg' ? 40 : 48);
    return (
      <Image
        src="/logo-icon.png"
        alt={alt}
        width={dim}
        height={dim}
        priority={priority}
        className={cn('shrink-0 object-contain', className)}
        style={{ height: `${dim}px`, width: `${dim}px` }}
      />
    );
  }

  // Aspect ratio of full logo is 938 / 256 ≈ 3.664
  const h = height || (size === 'sm' ? 24 : size === 'md' ? 32 : size === 'lg' ? 40 : 48);
  const w = width || Math.round(h * 3.664);

  return (
    <div className={cn('relative inline-flex items-center shrink-0', className)}>
      {/* Light theme full logo */}
      <Image
        src="/logo.png"
        alt={alt}
        width={w}
        height={h}
        priority={priority}
        className="block dark:hidden object-contain"
        style={{ height: `${h}px`, width: 'auto' }}
      />
      {/* Dark theme full logo */}
      <Image
        src="/logo-dark.png"
        alt={alt}
        width={w}
        height={h}
        priority={priority}
        className="hidden dark:block object-contain"
        style={{ height: `${h}px`, width: 'auto' }}
      />
    </div>
  );
}
