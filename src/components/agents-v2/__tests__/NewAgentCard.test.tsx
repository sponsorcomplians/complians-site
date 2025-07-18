import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import NewAgentCard from '../NewAgentCard'
import { AIAgent } from '../types'

// Mock the Icon component to avoid issues with dynamic icon rendering
vi.mock('../IconMap', () => ({
  Icon: ({ name, className }: { name: string; className?: string }) => (
    <div data-testid={`icon-${name}`} className={className}>
      {name}
    </div>
  ),
}))

// Mock data for testing
const mockAgent: AIAgent = {
  id: 'test-agent',
  name: 'AI Test Compliance Agent',
  description: 'A comprehensive AI agent for testing compliance requirements with advanced features and real-time monitoring capabilities.',
  icon: 'GraduationCap',
  price: '£199.99',
  originalPrice: '£299.99',
  features: [
    'Automated compliance checking',
    'Real-time monitoring',
    'Custom reporting',
    'Integration with existing systems'
  ],
  keyBenefits: [
    'Reduce compliance errors by 95%',
    'Save 20+ hours per week',
    'Ensure regulatory compliance',
    'Improve audit readiness'
  ],
  status: 'available',
  category: 'compliance',
  complexity: 'advanced',
  href: '/ai-test-compliance',
  popular: true,
  new: false,
  showcaseImage: '/images/test-agent-showcase.png'
}

const mockComingSoonAgent: AIAgent = {
  ...mockAgent,
  id: 'coming-soon-agent',
  name: 'AI Coming Soon Agent',
  status: 'coming-soon',
  popular: false,
  new: true,
  showcaseImage: undefined
}

describe('NewAgentCard', () => {
  describe('Snapshot Tests', () => {
    it('should render default variant correctly', () => {
      const { container } = render(
        <NewAgentCard 
          agent={mockAgent}
          onGetStarted={vi.fn()}
          onLearnMore={vi.fn()}
        />
      )
      expect(container.firstChild).toMatchSnapshot()
    })

    it('should render compact variant correctly', () => {
      const { container } = render(
        <NewAgentCard 
          agent={mockAgent}
          variant="compact"
          onGetStarted={vi.fn()}
          onLearnMore={vi.fn()}
        />
      )
      expect(container.firstChild).toMatchSnapshot()
    })

    it('should render featured variant correctly', () => {
      const { container } = render(
        <NewAgentCard 
          agent={mockAgent}
          variant="featured"
          onGetStarted={vi.fn()}
          onLearnMore={vi.fn()}
        />
      )
      expect(container.firstChild).toMatchSnapshot()
    })

    it('should render coming soon agent correctly', () => {
      const { container } = render(
        <NewAgentCard 
          agent={mockComingSoonAgent}
          onGetStarted={vi.fn()}
          onLearnMore={vi.fn()}
        />
      )
      expect(container.firstChild).toMatchSnapshot()
    })

    it('should render without image when showImage is false', () => {
      const { container } = render(
        <NewAgentCard 
          agent={mockAgent}
          showImage={false}
          onGetStarted={vi.fn()}
          onLearnMore={vi.fn()}
        />
      )
      expect(container.firstChild).toMatchSnapshot()
    })

    it('should render without badges when showBadges is false', () => {
      const { container } = render(
        <NewAgentCard 
          agent={mockAgent}
          showBadges={false}
          onGetStarted={vi.fn()}
          onLearnMore={vi.fn()}
        />
      )
      expect(container.firstChild).toMatchSnapshot()
    })

    it('should render without benefits when showBenefits is false', () => {
      const { container } = render(
        <NewAgentCard 
          agent={mockAgent}
          showBenefits={false}
          onGetStarted={vi.fn()}
          onLearnMore={vi.fn()}
        />
      )
      expect(container.firstChild).toMatchSnapshot()
    })

    it('should render without actions when showActions is false', () => {
      const { container } = render(
        <NewAgentCard 
          agent={mockAgent}
          showActions={false}
          onGetStarted={vi.fn()}
          onLearnMore={vi.fn()}
        />
      )
      expect(container.firstChild).toMatchSnapshot()
    })

    it('should render with custom className', () => {
      const { container } = render(
        <NewAgentCard 
          agent={mockAgent}
          className="custom-class"
          onGetStarted={vi.fn()}
          onLearnMore={vi.fn()}
        />
      )
      expect(container.firstChild).toMatchSnapshot()
    })

    it('should render agent without original price', () => {
      const agentWithoutOriginalPrice = {
        ...mockAgent,
        originalPrice: undefined
      }
      const { container } = render(
        <NewAgentCard 
          agent={agentWithoutOriginalPrice}
          onGetStarted={vi.fn()}
          onLearnMore={vi.fn()}
        />
      )
      expect(container.firstChild).toMatchSnapshot()
    })

    it('should render agent without showcase image', () => {
      const agentWithoutImage = {
        ...mockAgent,
        showcaseImage: undefined
      }
      const { container } = render(
        <NewAgentCard 
          agent={agentWithoutImage}
          onGetStarted={vi.fn()}
          onLearnMore={vi.fn()}
        />
      )
      expect(container.firstChild).toMatchSnapshot()
    })

    it('should render agent with minimal data', () => {
      const minimalAgent: AIAgent = {
        id: 'minimal-agent',
        name: 'Minimal Agent',
        description: 'A minimal agent for testing.',
        icon: 'Bot',
        price: '£99.99',
        features: [],
        keyBenefits: [],
        status: 'available',
        category: 'hr',
        complexity: 'basic',
        href: '/minimal-agent'
      }
      const { container } = render(
        <NewAgentCard 
          agent={minimalAgent}
          onGetStarted={vi.fn()}
          onLearnMore={vi.fn()}
        />
      )
      expect(container.firstChild).toMatchSnapshot()
    })
  })

  describe('Visual Regression Tests', () => {
    it('should maintain consistent styling for popular agents', () => {
      const popularAgent = { ...mockAgent, popular: true, new: false }
      const { container } = render(
        <NewAgentCard 
          agent={popularAgent}
          onGetStarted={vi.fn()}
          onLearnMore={vi.fn()}
        />
      )
      expect(container.firstChild).toMatchSnapshot('popular-agent-styling')
    })

    it('should maintain consistent styling for new agents', () => {
      const newAgent = { ...mockAgent, popular: false, new: true }
      const { container } = render(
        <NewAgentCard 
          agent={newAgent}
          onGetStarted={vi.fn()}
          onLearnMore={vi.fn()}
        />
      )
      expect(container.firstChild).toMatchSnapshot('new-agent-styling')
    })

    it('should maintain consistent styling for both popular and new agents', () => {
      const popularAndNewAgent = { ...mockAgent, popular: true, new: true }
      const { container } = render(
        <NewAgentCard 
          agent={popularAndNewAgent}
          onGetStarted={vi.fn()}
          onLearnMore={vi.fn()}
        />
      )
      expect(container.firstChild).toMatchSnapshot('popular-and-new-agent-styling')
    })

    it('should maintain consistent button states for available agents', () => {
      const { container } = render(
        <NewAgentCard 
          agent={mockAgent}
          onGetStarted={vi.fn()}
          onLearnMore={vi.fn()}
        />
      )
      expect(container.firstChild).toMatchSnapshot('available-agent-buttons')
    })

    it('should maintain consistent button states for coming soon agents', () => {
      const { container } = render(
        <NewAgentCard 
          agent={mockComingSoonAgent}
          onGetStarted={vi.fn()}
          onLearnMore={vi.fn()}
        />
      )
      expect(container.firstChild).toMatchSnapshot('coming-soon-agent-buttons')
    })
  })

  describe('Responsive Design Tests', () => {
    it('should maintain layout in compact variant', () => {
      const { container } = render(
        <div style={{ width: '300px' }}>
          <NewAgentCard 
            agent={mockAgent}
            variant="compact"
            onGetStarted={vi.fn()}
            onLearnMore={vi.fn()}
          />
        </div>
      )
      expect(container.firstChild).toMatchSnapshot('compact-responsive')
    })

    it('should maintain layout in featured variant', () => {
      const { container } = render(
        <div style={{ width: '400px' }}>
          <NewAgentCard 
            agent={mockAgent}
            variant="featured"
            onGetStarted={vi.fn()}
            onLearnMore={vi.fn()}
          />
        </div>
      )
      expect(container.firstChild).toMatchSnapshot('featured-responsive')
    })
  })
}) 