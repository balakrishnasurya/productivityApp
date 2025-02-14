import { Progress } from './progress';
import { Slider } from './slider';
import { cn } from './utils';

export const Text = ({ className, ...props }) => (
  <p className={cn('text-sm text-gray-900 dark:text-gray-100', className)} {...props} />
);

export const Button = ({ className, variant = 'default', ...props }) => (
  <button
    className={cn(
      'inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors',
      'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
      variant === 'default' ? 'bg-primary text-primary-foreground hover:bg-primary/90' : '',
      variant === 'outline' ? 'border border-input bg-background hover:bg-accent hover:text-accent-foreground' : '',
      className
    )}
    {...props}
  />
);

export const Card = ({ className, ...props }) => (
  <div
    className={cn(
      'rounded-xl border border-gray-200 bg-white shadow dark:border-gray-800 dark:bg-gray-950',
      className
    )}
    {...props}
  />
);

export const Box = ({ className, ...props }) => (
  <div className={cn('', className)} {...props} />
);

export const Flex = ({ className, direction = 'row', gap, justify, ...props }) => (
  <div
    className={cn(
      'flex',
      direction === 'column' && 'flex-col',
      gap && `gap-${gap}`,
      justify && `justify-${justify}`,
      className
    )}
    {...props}
  />
);

export { Progress, Slider }