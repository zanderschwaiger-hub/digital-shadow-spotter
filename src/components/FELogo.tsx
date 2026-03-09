import feShield from '@/assets/fe-shield.png';

interface FELogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const SIZES = {
  sm: 'h-5 w-5',
  md: 'h-8 w-8',
  lg: 'h-12 w-12',
};

export function FELogo({ size = 'md', className = '' }: FELogoProps) {
  return (
    <img
      src={feShield}
      alt="Freedom Engine"
      className={`${SIZES[size]} object-contain ${className}`}
      draggable={false}
    />
  );
}
