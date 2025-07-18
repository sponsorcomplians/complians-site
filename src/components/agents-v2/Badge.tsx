interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'outline' | 'destructive' | 'success'
  className?: string
}

export const Badge = ({ 
  children, 
  variant = 'default',
  className = '' 
}: BadgeProps) => {
  const variantClasses = variant === 'outline' 
    ? 'border border-current bg-transparent' 
    : variant === 'destructive'
    ? 'bg-red-500 text-white'
    : variant === 'success'
    ? 'bg-green-500 text-white'
    : 'bg-[#263976] text-white'
  
  return (
    <div className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors ${variantClasses} ${className}`}>
      {children}
    </div>
  )
} 