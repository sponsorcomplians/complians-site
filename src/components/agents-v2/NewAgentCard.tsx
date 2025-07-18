import Image from 'next/image'
import { CheckCircle, Star, Sparkles, Eye, ArrowRight } from 'lucide-react'
import { AIAgent } from './types'
import { Icon } from './IconMap'

interface NewAgentCardProps {
  agent: AIAgent
  onGetStarted?: (agent: AIAgent) => void
  onLearnMore?: (agent: AIAgent) => void
  className?: string
  showImage?: boolean
  showBadges?: boolean
  showBenefits?: boolean
  showActions?: boolean
  variant?: 'default' | 'compact' | 'featured'
}

export default function NewAgentCard({
  agent,
  onGetStarted,
  onLearnMore,
  className = '',
  showImage = true,
  showBadges = true,
  showBenefits = true,
  showActions = true,
  variant = 'default'
}: NewAgentCardProps) {
  const handleGetStarted = () => {
    if (onGetStarted) {
      onGetStarted(agent)
    } else if (agent.status === 'available') {
      window.location.href = agent.href
    } else {
      alert(`${agent.name} is coming soon! We'll notify you when it's available.`)
    }
  }

  const handleLearnMore = () => {
    if (onLearnMore) {
      onLearnMore(agent)
    } else {
      alert(`Learn more about ${agent.name} - detailed information coming soon!`)
    }
  }

  const isPopular = agent.popular
  const isNew = agent.new
  const isComingSoon = agent.status === 'coming-soon'

  const baseClasses = "bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
  const popularClasses = isPopular ? "ring-2 ring-[#00c3ff] ring-opacity-50" : ""
  const variantClasses = variant === 'compact' ? "max-w-sm" : variant === 'featured' ? "max-w-md" : ""
  
  return (
    <div className={`${baseClasses} ${popularClasses} ${variantClasses} ${className}`}>
      {/* Showcase Image */}
      {showImage && agent.showcaseImage && agent.status === 'available' && (
        <div className="relative h-48 bg-gray-50">
          <Image
            src={agent.showcaseImage}
            alt={agent.name}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        </div>
      )}

      {/* Badges */}
      {showBadges && (
        <div className="absolute top-4 right-4 flex flex-col gap-2">
          {isPopular && (
            <div className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-[#00c3ff] text-white">
              <Star className="h-3 w-3 mr-1" />
              Popular
            </div>
          )}
          {isNew && (
            <div className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-green-500 text-white">
              <Sparkles className="h-3 w-3 mr-1" />
              New
            </div>
          )}
          {isComingSoon && (
            <div className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold border border-gray-300 bg-gray-100 text-gray-600">
              Coming Soon
            </div>
          )}
        </div>
      )}

      {/* Content */}
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start gap-3 mb-4">
          <div className="flex-shrink-0 p-2 bg-[#263976] text-white rounded-lg">
            <Icon name={agent.icon} className="h-6 w-6" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-[#263976] leading-tight mb-1">
              {agent.name}
            </h3>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium border border-gray-300 bg-gray-50 text-gray-700">
                {agent.complexity}
              </span>
              <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium border border-gray-300 bg-gray-50 text-gray-700">
                {agent.category}
              </span>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed">
              {agent.description}
            </p>
          </div>
        </div>

        {/* Pricing */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl font-bold text-[#263976]">
            {agent.price}
          </span>
          {agent.originalPrice && (
            <span className="text-lg text-gray-500 line-through">
              {agent.originalPrice}
            </span>
          )}
        </div>

        {/* Key Benefits */}
        {showBenefits && agent.keyBenefits && (
          <div className="mb-4">
            <h4 className="font-semibold text-sm text-gray-900 mb-2">
              Key Benefits:
            </h4>
            <ul className="space-y-1">
              {agent.keyBenefits.slice(0, 3).map((benefit, index) => (
                <li key={index} className="flex items-center gap-2 text-sm text-gray-600">
                  <CheckCircle className="h-3 w-3 text-green-500 flex-shrink-0" />
                  <span className="line-clamp-1">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Action Buttons */}
        {showActions && (
          <div className="flex gap-2">
            <button
              onClick={handleGetStarted}
              disabled={isComingSoon}
              className="flex-1 inline-flex items-center justify-center px-4 py-2 rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#263976] focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none bg-[#263976] hover:bg-[#1e2a5a] text-white"
            >
              {agent.status === 'available' ? 'Get Started' : 'Coming Soon'}
              {agent.status === 'available' && <ArrowRight className="h-4 w-4 ml-2" />}
            </button>
            <button
              onClick={handleLearnMore}
              className="inline-flex items-center justify-center px-3 py-2 rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-300 focus-visible:ring-offset-2 border border-gray-300 bg-white hover:bg-gray-50 text-gray-900"
            >
              <Eye className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
} 