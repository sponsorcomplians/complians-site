Write-Host "Creating UI Components..." -ForegroundColor Green

# Create Card.tsx
@'
// src/components/ui/Card.tsx
import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className = '', children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`bg-white rounded-lg border border-gray-200 shadow-sm ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';
'@ | Out-File -FilePath "src\components\ui\Card.tsx" -Encoding UTF8

# Create Button.tsx
@'
// src/components/ui/Button.tsx
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className = '', 
    children, 
    variant = 'default', 
    size = 'default', 
    disabled,
    ...props 
  }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50';
    
    const variants = {
      default: 'bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-600',
      destructive: 'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-600',
      outline: 'border border-gray-300 bg-white hover:bg-gray-50 focus-visible:ring-gray-400',
      secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 focus-visible:ring-gray-400',
      ghost: 'hover:bg-gray-100 hover:text-gray-900 focus-visible:ring-gray-400',
      link: 'text-blue-600 underline-offset-4 hover:underline focus-visible:ring-blue-600',
    };
    
    const sizes = {
      default: 'h-10 px-4 py-2',
      sm: 'h-9 rounded-md px-3',
      lg: 'h-11 rounded-md px-8',
      icon: 'h-10 w-10',
    };
    
    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        disabled={disabled}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
'@ | Out-File -FilePath "src\components\ui\Button.tsx" -Encoding UTF8

# Create Input.tsx
@'
// src/components/ui/Input.tsx
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', label, error, id, ...props }, ref) => {
    return (
      <div className="space-y-2">
        {label && (
          <label 
            htmlFor={id} 
            className="block text-sm font-medium text-gray-700"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={`
            flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm 
            placeholder:text-gray-400 
            focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 
            disabled:cursor-not-allowed disabled:opacity-50
            ${error ? 'border-red-500' : ''}
            ${className}
          `}
          {...props}
        />
        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
'@ | Out-File -FilePath "src\components\ui\Input.tsx" -Encoding UTF8

# Create Select.tsx
@'
// src/components/ui/Select.tsx
import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  className?: string;
  label?: string;
  error?: string;
  options: Array<{ value: string; label: string }>;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className = '', label, error, id, options, ...props }, ref) => {
    return (
      <div className="space-y-2">
        {label && (
          <label 
            htmlFor={id} 
            className="block text-sm font-medium text-gray-700"
          >
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={id}
          className={`
            flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm 
            focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 
            disabled:cursor-not-allowed disabled:opacity-50
            ${error ? 'border-red-500' : ''}
            ${className}
          `}
          {...props}
        >
          <option value="">Select an option</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
'@ | Out-File -FilePath "src\components\ui\Select.tsx" -Encoding UTF8

Write-Host "UI Components created successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Creating Supabase files..." -ForegroundColor Green

# Create supabase.ts
@'
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Check if the environment variables are set
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Please make sure you have NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env.local file'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
'@ | Out-File -FilePath "src\lib\supabase.ts" -Encoding UTF8

Write-Host "Supabase client created successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "All files created! Next steps:" -ForegroundColor Yellow
Write-Host "1. Create src\lib\supabase\services.ts manually (too large for script)"
Write-Host "2. Create src\app\reports\page.tsx manually (too large for script)"
Write-Host "3. Run: npm install @supabase/supabase-js"
Write-Host "4. Add your Supabase credentials to .env.local"
Write-Host "5. Run: npm run dev"