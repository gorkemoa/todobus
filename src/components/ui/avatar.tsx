import React from 'react';

interface AvatarProps {
  className?: string;
  children?: React.ReactNode;
}

export const Avatar: React.FC<AvatarProps> = ({ className = '', children }) => {
  return (
    <div className={`relative inline-block rounded-full overflow-hidden ${className}`}>
      {children}
    </div>
  );
};

interface AvatarImageProps {
  src?: string;
  alt?: string;
}

export const AvatarImage: React.FC<AvatarImageProps> = ({ src, alt = 'avatar' }) => {
  return (
    <img src={src} alt={alt} className="w-full h-full object-cover" />
  );
};

export const AvatarFallback: React.FC<AvatarProps> = ({ className = '', children }) => {
  return (
    <div className={`flex items-center justify-center w-full h-full bg-gray-200 text-gray-600 ${className}`}>
      {children}
    </div>
  );
}; 