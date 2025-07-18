interface CardProps {
  children: React.ReactNode
  className?: string
}

export const Card = ({ children, className = '' }: CardProps) => (
  <div className={`bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow ${className}`}>
    {children}
  </div>
)

export const CardHeader = ({ children, className = '' }: CardProps) => (
  <div className={`p-6 pb-2 ${className}`}>
    {children}
  </div>
)

export const CardTitle = ({ children, className = '' }: CardProps) => (
  <h3 className={`text-lg font-semibold leading-none tracking-tight ${className}`}>
    {children}
  </h3>
)

export const CardContent = ({ children, className = '' }: CardProps) => (
  <div className={`p-6 pt-0 ${className}`}>
    {children}
  </div>
) 