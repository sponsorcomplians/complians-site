'use client'

import { useEffect } from 'react'
import { X } from 'lucide-react'
import VideoPlayer from './VideoPlayer'

interface VideoModalProps {
  isOpen: boolean
  onClose: () => void
  videoSrc: string
  title?: string
  poster?: string
}

export default function VideoModal({ 
  isOpen, 
  onClose, 
  videoSrc, 
  title,
  poster 
}: VideoModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-75"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative z-10 w-full max-w-4xl mx-4">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
        >
          <X className="w-8 h-8" />
        </button>

        {/* Video Player */}
        <div className="bg-black rounded-lg overflow-hidden">
          <VideoPlayer
            src={videoSrc}
            poster={poster}
            title={title}
            className="aspect-video"
          />
        </div>

        {/* Title */}
        {title && (
          <div className="mt-4 text-center">
            <h3 className="text-white text-lg font-medium">{title}</h3>
          </div>
        )}
      </div>
    </div>
  )
}

