'use client'

import { useState } from 'react'
import { NewAgentCard, aiAgents, AIAgent } from '@/components/agents-v2'

export default function NewAgentCardExample() {
  const [selectedVariant, setSelectedVariant] = useState<'default' | 'compact' | 'featured'>('default')
  const [showImage, setShowImage] = useState(true)
  const [showBadges, setShowBadges] = useState(true)
  const [showBenefits, setShowBenefits] = useState(true)
  const [showActions, setShowActions] = useState(true)

  const handleGetStarted = (agent: AIAgent) => {
    console.log('Get Started clicked for:', agent.name)
    alert(`Get Started clicked for ${agent.name}`)
  }

  const handleLearnMore = (agent: AIAgent) => {
    console.log('Learn More clicked for:', agent.name)
    alert(`Learn More clicked for ${agent.name}`)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#263976] mb-4">NewAgentCard Examples</h1>
          <p className="text-gray-600 mb-6">Demonstrating the new prop-driven, Tailwind-only agent card component</p>
          
          {/* Controls */}
          <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
            <h2 className="text-lg font-semibold mb-4">Component Controls</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Variant</label>
                <select 
                  value={selectedVariant} 
                  onChange={(e) => setSelectedVariant(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#263976]"
                >
                  <option value="default">Default</option>
                  <option value="compact">Compact</option>
                  <option value="featured">Featured</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Show Image</label>
                <input 
                  type="checkbox" 
                  checked={showImage} 
                  onChange={(e) => setShowImage(e.target.checked)}
                  className="h-4 w-4 text-[#263976] focus:ring-[#263976] border-gray-300 rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Show Badges</label>
                <input 
                  type="checkbox" 
                  checked={showBadges} 
                  onChange={(e) => setShowBadges(e.target.checked)}
                  className="h-4 w-4 text-[#263976] focus:ring-[#263976] border-gray-300 rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Show Benefits</label>
                <input 
                  type="checkbox" 
                  checked={showBenefits} 
                  onChange={(e) => setShowBenefits(e.target.checked)}
                  className="h-4 w-4 text-[#263976] focus:ring-[#263976] border-gray-300 rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Show Actions</label>
                <input 
                  type="checkbox" 
                  checked={showActions} 
                  onChange={(e) => setShowActions(e.target.checked)}
                  className="h-4 w-4 text-[#263976] focus:ring-[#263976] border-gray-300 rounded"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Example Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {aiAgents.slice(0, 6).map((agent) => (
            <NewAgentCard
              key={agent.id}
              agent={agent}
              variant={selectedVariant}
              showImage={showImage}
              showBadges={showBadges}
              showBenefits={showBenefits}
              showActions={showActions}
              onGetStarted={handleGetStarted}
              onLearnMore={handleLearnMore}
            />
          ))}
        </div>

        {/* Compact Example */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-[#263976] mb-6">Compact Variant Example</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {aiAgents.slice(0, 4).map((agent) => (
              <NewAgentCard
                key={agent.id}
                agent={agent}
                variant="compact"
                showImage={false}
                showBenefits={false}
                className="h-full"
              />
            ))}
          </div>
        </div>

        {/* Featured Example */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-[#263976] mb-6">Featured Variant Example</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {aiAgents.filter(a => a.popular || a.new).slice(0, 2).map((agent) => (
              <NewAgentCard
                key={agent.id}
                agent={agent}
                variant="featured"
                className="h-full"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
} 