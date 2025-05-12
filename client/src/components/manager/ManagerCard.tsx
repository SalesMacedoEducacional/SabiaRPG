import React, { ReactNode } from 'react';

interface ManagerCardProps {
  children: ReactNode;
  title?: string;
  description?: string;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
  asStatsCard?: boolean;
}

export function ManagerCard({
  children,
  title,
  description,
  className = '',
  headerClassName = '',
  contentClassName = '',
  asStatsCard = false,
}: ManagerCardProps) {
  const baseClass = asStatsCard ? 'manager-stats-card' : 'manager-card overflow-hidden';
  
  // Se não houver título, retornar apenas o card
  if (!title) {
    return (
      <div className={`${baseClass} ${className}`}>
        {children}
      </div>
    );
  }
  
  return (
    <div className={`${baseClass} ${className}`}>
      <div className={`manager-card-header ${headerClassName}`}>
        <h4 className="text-sm font-medium text-white">{title}</h4>
        {description && (
          <p className="text-xs text-white/70">
            {description}
          </p>
        )}
      </div>
      <div className={`p-4 ${contentClassName}`}>
        {children}
      </div>
    </div>
  );
}