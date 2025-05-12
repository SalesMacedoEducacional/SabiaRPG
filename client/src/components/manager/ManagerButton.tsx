import React, { ButtonHTMLAttributes, ReactNode } from 'react';

interface ManagerButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'default' | 'action';
  fullWidth?: boolean;
  icon?: ReactNode;
}

export function ManagerButton({
  children,
  variant = 'default',
  fullWidth = false,
  icon,
  className = '',
  ...props
}: ManagerButtonProps) {
  const baseClass = 
    variant === 'default' 
      ? 'manager-button' 
      : 'manager-action-button';
  
  const widthClass = fullWidth ? 'w-full' : '';
  
  return (
    <button 
      className={`${baseClass} ${widthClass} ${className}`}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
}