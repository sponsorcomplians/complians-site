'use client'

import * as React from 'react'

const Select = ({ children, ...props }) => {
  return <div {...props}>{children}</div>
}

const SelectTrigger = React.forwardRef
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className = '', children, ...props }, ref) => (
  <button
    ref={ref}
    className={lex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 }
    {...props}
  >
    {children}
  </button>
))
SelectTrigger.displayName = 'SelectTrigger'

const SelectValue = ({ placeholder = 'Select...' }) => {
  return <span>{placeholder}</span>
}

const SelectContent = ({ children, ...props }) => {
  return (
    <div className='relative z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md' {...props}>
      {children}
    </div>
  )
}

const SelectItem = React.forwardRef
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { value: string }
>(({ className = '', children, ...props }, ref) => (
  <div
    ref={ref}
    className={elative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 }
    {...props}
  >
    {children}
  </div>
))
SelectItem.displayName = 'SelectItem'

export {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
}
