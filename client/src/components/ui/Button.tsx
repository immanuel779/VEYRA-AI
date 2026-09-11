import { forwardRef, type ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'ghost' | 'outline' | 'soft';
type Size = 'sm' | 'md' | 'lg';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const variants: Record<Variant, string> = {
  primary:
    'bg-accent text-white hover:bg-accent-hover shadow-sm hover:shadow active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed',
  ghost:
    'text-muted hover:text-ink hover:bg-edge/50 active:scale-[0.98]',
  outline:
    'border border-edge text-ink hover:border-accent/40 hover:bg-accent-soft/40 active:scale-[0.98]',
  soft:
    'bg-accent-soft text-accent hover:bg-accent-soft/70 active:scale-[0.98]',
};

const sizes: Record<Size, string> = {
  sm: 'h-8 px-3 text-xs rounded-md gap-1.5',
  md: 'h-9 px-3.5 text-sm rounded-lg gap-2',
  lg: 'h-11 px-5 text-sm rounded-xl gap-2',
};

export const Button = forwardRef<HTMLButtonElement, Props>(
  ({ variant = 'primary', size = 'md', className = '', ...rest }, ref) => (
    <button
      ref={ref}
      className={`inline-flex items-center justify-center font-medium tracking-tight transition-all duration-200 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas disabled:pointer-events-none ${variants[variant]} ${sizes[size]} ${className}`}
      {...rest}
    />
  )
);
Button.displayName = 'Button';