'use client';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className = '' }: CardProps) {
  return (
    <div className={`bg-white rounded-xl border-[1px] border-[#E5E7EB] shadow-[0_1px_3px_rgba(0,0,0,0.1)] ${className}`}>
      {children}
    </div>
  );
} 