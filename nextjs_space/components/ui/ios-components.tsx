
'use client';

import React from 'react';
import { cn } from '@/lib/utils';

// iOS-Style Card Component
export interface IOSCardProps extends React.HTMLAttributes<HTMLDivElement> {
  elevated?: boolean;
  children: React.ReactNode;
}

export const IOSCard = React.forwardRef<HTMLDivElement, IOSCardProps>(
  ({ className, elevated = false, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          elevated ? 'ios-card-elevated' : 'ios-card',
          'ios-text-fit',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
IOSCard.displayName = 'IOSCard';

// iOS-Style Button Component
export interface IOSButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export const IOSButton = React.forwardRef<HTMLButtonElement, IOSButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, ...props }, ref) => {
    const variantClasses = {
      primary: 'ios-button-primary',
      secondary: 'ios-button-secondary',
      ghost: 'ios-button bg-transparent border-0 hover:bg-white/5',
    };

    const sizeClasses = {
      sm: 'px-4 py-2 text-sm',
      md: 'px-6 py-3 text-base',
      lg: 'px-8 py-4 text-lg',
    };

    return (
      <button
        ref={ref}
        className={cn(
          variantClasses[variant],
          sizeClasses[size],
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'ios-text-fit',
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);
IOSButton.displayName = 'IOSButton';

// iOS-Style Input Component
export interface IOSInputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const IOSInput = React.forwardRef<HTMLInputElement, IOSInputProps>(
  ({ className, type = 'text', ...props }, ref) => {
    return (
      <input
        ref={ref}
        type={type}
        className={cn(
          'ios-input',
          'w-full text-white placeholder:text-gray-400',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'ios-text-fit',
          className
        )}
        {...props}
      />
    );
  }
);
IOSInput.displayName = 'IOSInput';

// iOS-Style Badge Component
export interface IOSBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'success' | 'error' | 'warning';
  children: React.ReactNode;
}

export const IOSBadge = React.forwardRef<HTMLDivElement, IOSBadgeProps>(
  ({ className, variant = 'default', children, ...props }, ref) => {
    const variantClasses = {
      default: 'ios-badge',
      success: 'ios-badge-success',
      error: 'ios-badge-error',
      warning: 'ios-badge-warning',
    };

    return (
      <div
        ref={ref}
        className={cn(variantClasses[variant], 'inline-flex items-center', 'ios-text-fit', className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);
IOSBadge.displayName = 'IOSBadge';

// iOS-Style Section Container
export interface IOSSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const IOSSection = React.forwardRef<HTMLDivElement, IOSSectionProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <section
        ref={ref}
        className={cn('ios-section', className)}
        {...props}
      >
        {children}
      </section>
    );
  }
);
IOSSection.displayName = 'IOSSection';

// iOS-Style Container
export interface IOSContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const IOSContainer = React.forwardRef<HTMLDivElement, IOSContainerProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('ios-container', className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);
IOSContainer.displayName = 'IOSContainer';

// iOS-Style Grid
export interface IOSGridProps extends React.HTMLAttributes<HTMLDivElement> {
  columns?: 1 | 2 | 3 | 4;
  children: React.ReactNode;
}

export const IOSGrid = React.forwardRef<HTMLDivElement, IOSGridProps>(
  ({ className, columns = 3, children, ...props }, ref) => {
    const gridClasses = {
      1: 'grid gap-4 sm:gap-6',
      2: 'ios-grid-2',
      3: 'ios-grid-3',
      4: 'ios-grid-4',
    };

    return (
      <div
        ref={ref}
        className={cn(gridClasses[columns], className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);
IOSGrid.displayName = 'IOSGrid';

// iOS-Style Text Wrapper (prevents overflow)
export interface IOSTextProps extends React.HTMLAttributes<HTMLDivElement> {
  clamp?: 1 | 2 | 3;
  truncate?: boolean;
  children: React.ReactNode;
}

export const IOSText = React.forwardRef<HTMLDivElement, IOSTextProps>(
  ({ className, clamp, truncate, children, ...props }, ref) => {
    const textClasses = truncate
      ? 'ios-text-truncate'
      : clamp === 2
      ? 'ios-text-clamp-2'
      : clamp === 3
      ? 'ios-text-clamp-3'
      : 'ios-text-fit';

    return (
      <div
        ref={ref}
        className={cn(textClasses, className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);
IOSText.displayName = 'IOSText';

// iOS-Style Loading Spinner
export interface IOSSpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg';
}

export const IOSSpinner = React.forwardRef<HTMLDivElement, IOSSpinnerProps>(
  ({ className, size = 'md', ...props }, ref) => {
    const sizeClasses = {
      sm: 'w-4 h-4 border-2',
      md: 'w-8 h-8 border-3',
      lg: 'w-12 h-12 border-4',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'animate-spin rounded-full',
          'border-t-premium-green border-r-premium-green border-b-transparent border-l-transparent',
          sizeClasses[size],
          className
        )}
        {...props}
      />
    );
  }
);
IOSSpinner.displayName = 'IOSSpinner';

// iOS-Style Divider
export interface IOSDividerProps extends React.HTMLAttributes<HTMLHRElement> {}

export const IOSDivider = React.forwardRef<HTMLHRElement, IOSDividerProps>(
  ({ className, ...props }, ref) => {
    return (
      <hr
        ref={ref}
        className={cn(
          'border-0 h-px bg-gradient-to-r from-transparent via-premium-green/30 to-transparent',
          'my-4 sm:my-6',
          className
        )}
        {...props}
      />
    );
  }
);
IOSDivider.displayName = 'IOSDivider';
