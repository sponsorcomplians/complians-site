// src/components/ui/select.tsx
import * as React from "react"

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  children?: React.ReactNode
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <select
        className={`flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className || ''}`}
        ref={ref}
        {...props}
      >
        {children}
      </select>
    )
  }
)
Select.displayName = "Select"

// SelectTrigger - for compatibility, just returns the Select component
export const SelectTrigger = Select
SelectTrigger.displayName = "SelectTrigger"

// SelectValue - for compatibility, just returns a span
export const SelectValue = ({ placeholder, ...props }: { placeholder?: string }) => {
  return null // This is handled by the native select element
}

// SelectContent - for compatibility, just returns children
export const SelectContent = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>
}

export interface SelectItemProps extends React.OptionHTMLAttributes<HTMLOptionElement> {
  children?: React.ReactNode
}

export const SelectItem = React.forwardRef<HTMLOptionElement, SelectItemProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <option
        className={className}
        ref={ref}
        {...props}
      >
        {children}
      </option>
    )
  }
)
SelectItem.displayName = "SelectItem"

export const SelectGroup = ({ className, children, ...props }: React.HTMLAttributes<HTMLOptGroupElement>) => (
  <optgroup className={className} {...props}>
    {children}
  </optgroup>
)

export const SelectLabel = ({ className, ...props }: React.HTMLAttributes<HTMLLabelElement>) => (
  <label className={`py-1.5 pl-8 pr-2 text-sm font-semibold ${className || ''}`} {...props} />
)

export const SelectSeparator = ({ className, ...props }: React.HTMLAttributes<HTMLHRElement>) => (
  <hr className={`-mx-1 my-1 h-px bg-gray-100 ${className || ''}`} {...props} />
)