'use client'

import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { Button } from './Button'

interface UIToggleProps {
  currentPage: 'old' | 'new'
  className?: string
}

export default function UIToggle({ currentPage, className = '' }: UIToggleProps) {
  const [isNewUI, setIsNewUI] = useState(currentPage === 'new')
  
  const toggleUI = () => {
    if (currentPage === 'old') {
      // Navigate to new UI
      window.location.href = '/agents-v2'
    } else {
      // Navigate back to old UI
      window.location.href = '/'
    }
  }

  const isPreviewMode = process.env.NEXT_PUBLIC_PREVIEW === 'true'
  
  // Only show toggle if preview mode is enabled
  if (!isPreviewMode) {
    return null
  }

  return (
    <div className={`fixed top-4 right-4 z-50 ${className}`}>
      <Button
        onClick={toggleUI}
        variant="outline"
        size="sm"
        className="bg-white/90 backdrop-blur-sm border-gray-300 hover:bg-white shadow-lg"
      >
        {currentPage === 'old' ? (
          <>
            <Eye className="w-4 h-4 mr-2" />
            Show New UI
          </>
        ) : (
          <>
            <EyeOff className="w-4 h-4 mr-2" />
            Show Old UI
          </>
        )}
      </Button>
    </div>
  )
} 