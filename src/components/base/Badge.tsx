import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'discount' | 'bestseller' | 'organic' | 'free-harvest' | 'express' | 'sale' | 'default';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  className = '',
}) => {
  const base = 'inline-flex items-center px-2.5 py-0.5 rounded-sm text-[10px] font-extrabold uppercase tracking-wider shadow-xs';

  const variants = {
    discount: 'bg-[#D81B60] text-white',
    bestseller: 'bg-slate-900 text-white',
    organic: 'bg-emerald-700 text-white',
    'free-harvest': 'bg-emerald-600 text-white',
    express: 'bg-blue-600 text-white',
    sale: 'bg-rose-600 text-white',
    default: 'bg-pink-100 text-[#D81B60]',
  };

  return (
    <span className={`${base} ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};
