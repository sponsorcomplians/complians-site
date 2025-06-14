// src/components/ui/dialog.tsx
"use client"

import * as React from "react"

interface DialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children: React.ReactNode
}

export function Dialog({ open, onOpenChange, children }: DialogProps) {
  if (!open) return null

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-50 bg-black/50"
        onClick={() => onOpenChange?.(false)}
      />
      
      {/* Dialog */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {children}
      </div>
    </>
  )
}

interface DialogContentProps {
  children: React.ReactNode
  className?: string
}

export function DialogContent({ children, className = "" }: DialogContentProps) {
  return (
    <div className={`relative bg-white rounded-lg shadow-lg max-w-lg w-full max-h-[90vh] overflow-auto ${className}`}>
      {children}
    </div>
  )
}

export function DialogHeader({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-6 pt-6 pb-2">
      {children}
    </div>
  )
}

export function DialogTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-xl font-semibold">
      {children}
    </h2>
  )
}

export function DialogFooter({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-6 py-4 border-t flex justify-end gap-2">
      {children}
    </div>
  )
}

export function DialogClose({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}