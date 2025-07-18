interface ButtonProps {
  children: React.ReactNode
  className?: string
  size?: 'default' | 'sm' | 'lg'
  variant?: 'default' | 'destructive' | 'outline' | 'secondary'
  onClick?: () => void
  disabled?: boolean
  [key: string]: any
}

export const Button = ({ 
  children, 
  className = '', 
  size = 'default',
  variant = 'default',
  onClick,
  disabled = false,
  ...props 
}: ButtonProps) => {
  const sizeClasses = size === 'sm' ? 'px-3 py-1.5 text-sm' : size === 'lg' ? 'px-8 py-3 text-lg' : 'px-4 py-2'
  const variantClasses = variant === 'destructive' 
    ? 'bg-red-500 hover:bg-red-600 text-white' 
    : variant === 'outline'
    ? 'border border-gray-300 bg-white hover:bg-gray-50 text-gray-900'
    : variant === 'secondary'
    ? 'bg-gray-100 hover:bg-gray-200 text-gray-900'
    : 'bg-[#263976] hover:bg-[#1e2a5a] text-white'
  
  return (
    <button 
      className={`inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ${sizeClasses} ${variantClasses} ${className}`}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
} 