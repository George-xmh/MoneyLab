import React from 'react';

interface LogoProps {
  size?: number;
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ size = 32, className = '' }) => {
  return (
    <span 
      className={className}
      style={{ 
        fontSize: `${size}px`,
        display: 'inline-block',
        lineHeight: 1
      }}
    >
      💰
    </span>
  );
};

export default Logo;
