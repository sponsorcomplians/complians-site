'use client'

import { useState } from 'react'
import { Play } from 'lucide-react'
import Button from './Button'
import VideoModal from './VideoModal'

interface VideoTutorialButtonProps {
  videoUrl: string
  title?: string
  poster?: string
  className?: string
}

export default function VideoTutorialButton({ 
  videoUrl, 
  title, 
  poster,
  className 
}: VideoTutorialButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const openModal = () => setIsModalOpen(true)
  const closeModal = () => setIsModalOpen(false)

  return (
    <>
      <Button 
        size="sm" 
        variant="outline" 
        onClick={openModal}
        className={className}
      >
        <Play className="w-4 h-4 mr-2" />
        Watch Tutorial
      </Button>

      <VideoModal
        isOpen={isModalOpen}
        onClose={closeModal}
        videoSrc={videoUrl}
        title={title}
        poster={poster}
      />
    </>
  )
}

