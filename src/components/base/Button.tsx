import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-200 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 cursor-pointer';

  const variants = {
    primary: 'bg-[#D81B60] hover:bg-[#C2185B] text-white focus:ring-[#D81B60] shadow-sm shadow-[#D81B60]/20',
    secondary: 'bg-rose-50 text-[#D81B60] hover:bg-rose-100 focus:ring-[#D81B60]',
    outline: 'border border-[#D81B60] text-[#D81B60] hover:bg-rose-50 focus:ring-[#D81B60]',
    ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-gray-400',
    danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-6 py-3 text-base gap-2.5 font-semibold',
    icon: 'p-2 rounded-full',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
