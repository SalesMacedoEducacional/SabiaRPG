import React from 'react';
import { User } from 'lucide-react';

interface AvatarProps {
  user: {
    username: string;
    avatarUrl?: string;
    level?: number;
  } | null;
  size?: 'small' | 'medium' | 'large';
  showBadge?: boolean;
}

export const Avatar: React.FC<AvatarProps> = ({ user, size = 'medium', showBadge = false }) => {
  if (!user) {
    return (
      <div className={`
        ${size === 'small' ? 'w-8 h-8' : size === 'large' ? 'w-20 h-20' : 'w-10 h-10'}
        bg-primary flex items-center justify-center rounded-full text-parchment
      `}>
        <User className={`${size === 'small' ? 'h-4 w-4' : size === 'large' ? 'h-10 w-10' : 'h-5 w-5'}`} />
      </div>
    );
  }

  // Get user initials for the fallback
  const initials = user.username.substring(0, 2).toUpperCase();

  // Avatar size classes
  const sizeClasses = {
    small: 'w-8 h-8',
    medium: 'w-10 h-10',
    large: 'w-20 h-20'
  };

  // Font size classes
  const fontSizeClasses = {
    small: 'text-xs',
    medium: 'text-sm',
    large: 'text-xl'
  };

  // Badge size and position
  const badgeClasses = {
    small: 'w-4 h-4 text-[8px] -top-1 -right-1',
    medium: 'w-5 h-5 text-[10px] -top-1 -right-1',
    large: 'w-6 h-6 text-xs -top-2 -right-2',
  };

  return (
    <div className="relative">
      <div className={`
        ${sizeClasses[size]} bg-primary overflow-hidden rounded-full
        border-2 ${user.avatarUrl ? 'border-accent' : 'border-primary-light'}
        flex items-center justify-center
      `}>
        {user.avatarUrl ? (
          <img 
            src={user.avatarUrl} 
            alt={user.username} 
            className="w-full h-full object-cover" 
          />
        ) : (
          <span className={`${fontSizeClasses[size]} font-bold text-parchment`}>
            {initials}
          </span>
        )}
      </div>
      
      {showBadge && user.level && (
        <div className={`
          absolute ${badgeClasses[size]} bg-accent text-dark
          font-bold flex items-center justify-center rounded-full
        `}>
          {user.level}
        </div>
      )}
    </div>
  );
};

// Default export removed: now using named export
