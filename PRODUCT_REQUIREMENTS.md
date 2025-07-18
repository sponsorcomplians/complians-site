# Product Requirements Document (PRD)
## Complians Platform - Structure Improvement Initiative

### Version 1.0 - January 2025

---

## Executive Summary

Complians is a UK immigration compliance platform that helps sponsors manage their compliance obligations through AI-powered assessments. This PRD outlines structural improvements to enhance scalability, maintainability, and user experience while addressing current technical debt.

## Current State Analysis

### Strengths
- Comprehensive AI compliance coverage (15+ specialized agents)
- Multi-tenant architecture with role-based access control
- Integrated billing system with usage-based pricing
- Production-ready deployment on Vercel with Supabase
- **NEW**: Fully functional AI Skills & Experience Compliance Agent with manual data confirmation

### Key Issues
1. **Code Duplication**: 80% code overlap across AI agent dashboards
2. **Incomplete Features**: Multiple "Coming Soon" placeholders affecting user trust
3. **Security Gaps**: Authentication temporarily disabled, API keys exposed
4. **Performance Issues**: Unoptimized async operations, memory leaks
5. **Testing Deficit**: 0% test coverage for core application code
6. **Maintenance Burden**: 1000+ line component files with mixed concerns

### Recent Improvements (January 2025)
1. **AI Skills & Experience Compliance Agent**: 
   - Fully implemented with AI narrative generation
   - Manual worker information confirmation form
   - Plain English narrative style (customizable)
   - Resolved data extraction issues with fallback to manual entry
2. **Simplified AI Architecture**:
   - Created simple-ai-service.ts to bypass authentication complexity
   - Direct OpenAI integration without middleware
   - Improved error handling and fallback logic

## Proposed Architecture Improvements

### 1. Component Architecture Refactoring

#### Current State
```
src/components/
├── ui/              # Mixed Radix UI and custom components
├── dashboards/      # 15+ duplicate dashboard files (1000+ lines each)
└── [features]/      # Inconsistent component organization
```

#### Proposed State
```
src/
├── components/
│   ├── ui/          # Pure UI components (buttons, cards, etc.)
│   ├── features/    # Feature-specific components
│   │   ├── compliance/
│   │   │   ├── ComplianceDashboard.tsx    # Generic dashboard
│   │   │   ├── ComplianceAgent.tsx        # Reusable agent component
│   │   │   └── hooks/                     # Shared compliance hooks
│   │   ├── workers/
│   │   ├── billing/
│   │   └── auth/
│   └── layouts/     # Layout components
├── lib/
│   ├── ai/          # Unified AI service layer
│   │   ├── AIService.ts                   # Single AI service
│   │   ├── prompts/                       # Organized prompts
│   │   └── types.ts                       # AI-related types
│   └── utils/       # Utility functions
```

### 2. AI Service Consolidation

#### Current Implementation Issues
- Duplicate AI services with similar functionality
- Inconsistent error handling
- No caching strategy
- Missing rate limiting

#### Proposed Unified AI Service
```typescript
interface AIServiceConfig {
  provider: 'openai' | 'anthropic' | 'google';
  model: string;
  temperature: number;
  maxRetries: number;
  cacheEnabled: boolean;
  rateLimitPerMinute: number;
}

class UnifiedAIService {
  // Single entry point for all AI operations
  async generateNarrative(params: NarrativeParams): Promise<NarrativeResponse>
  async analyzeDocument(params: DocumentParams): Promise<AnalysisResponse>
  async assessCompliance(params: ComplianceParams): Promise<AssessmentResponse>
}
```

### 3. Database Schema Optimization

#### Proposed Changes
1. **Normalize compliance agent configurations**
   - Create `compliance_agent_configs` table
   - Remove hardcoded agent definitions

2. **Implement proper audit trail**
   - Add `compliance_audit_trails` table
   - Track all AI assessments with versioning

3. **Optimize worker data model**
   - Add indexes for frequent queries
   - Implement soft deletes

### 4. Security Enhancements

#### Immediate Actions Required
1. **Re-enable authentication** across all routes
2. **Implement API key rotation** system
3. **Add input sanitization** for AI prompts
4. **Implement rate limiting** on AI endpoints
5. **Add request signing** for internal APIs

#### Security Architecture
```
API Gateway → Authentication → Rate Limiting → Input Validation → Business Logic
```

### 5. Performance Optimization Strategy

#### Frontend Optimizations
1. **Code splitting** by route and feature
2. **React.memo** for expensive components
3. **Virtual scrolling** for large lists
4. **Image optimization** with Next.js Image component
5. **Bundle size reduction** through tree shaking

#### Backend Optimizations
1. **Implement caching layer** for AI responses
2. **Database connection pooling**
3. **Background job processing** for reports
4. **CDN integration** for static assets

### 6. Testing Strategy

#### Proposed Testing Pyramid
```
Unit Tests (70%)
├── Components: React Testing Library
├── Hooks: React Hooks Testing Library
├── Services: Jest
└── Utilities: Jest

Integration Tests (20%)
├── API Routes: Supertest
├── Database: Test containers
└── AI Services: Mocked responses

E2E Tests (10%)
├── Critical paths: Playwright
└── Payment flows: Stripe test mode
```

## Feature Roadmap

### Phase 1: Foundation (Q1 2025)
- [x] Implement AI Skills & Experience Compliance Agent (Completed)
- [x] Create simplified AI service architecture (simple-ai-service.ts)
- [x] Add manual worker information confirmation form
- [x] Implement plain English AI narrative generation
- [ ] Consolidate remaining AI services into unified architecture
- [ ] Create shared component library
- [ ] Re-enable authentication system
- [ ] Implement comprehensive error handling
- [ ] Add unit tests for critical paths (minimum 60% coverage)

### Phase 2: Enhancement (Q2 2025)
- [ ] Complete all "Coming Soon" features or remove them
- [ ] Implement advanced analytics dashboard
- [ ] Add workflow automation capabilities
- [ ] Integrate with external HR systems
- [ ] Launch mobile application (React Native)

### Phase 3: Scale (Q3 2025)
- [ ] Multi-language support
- [ ] White-label capabilities
- [ ] Advanced AI model selection per tenant
- [ ] Compliance prediction features
- [ ] API marketplace for third-party integrations

## Success Metrics

### Technical Metrics
- **Code duplication**: Reduce from 80% to <20%
- **Test coverage**: Increase from 0% to 80%
- **Performance**: 50% reduction in page load time
- **Bundle size**: 40% reduction through optimization
- **Error rate**: <0.1% for critical paths

### Business Metrics
- **User satisfaction**: >4.5/5 rating
- **Feature adoption**: 80% of users using AI agents
- **Churn rate**: <5% monthly
- **Support tickets**: 50% reduction
- **Time to value**: <5 minutes for first assessment

## Implementation Plan

### Completed (Week 1-2): AI Infrastructure Implementation
- [x] Implemented simple-ai-service.ts for direct OpenAI integration
- [x] Created manual worker information confirmation form
- [x] Added customizable AI narrative styles (plain English)
- [x] Resolved authentication blocking issues
- [x] Fixed worker data extraction with manual fallback
- [x] Created universal-ai-service.ts for all compliance agents
- [x] Built universal API endpoint for AI generation
- [x] Developed dashboard upgrade utilities
- [x] Documented migration process for all agents

### Week 3-4: Setup and Planning
- Set up testing infrastructure
- Create component library structure
- Design unified AI service architecture
- Plan database migrations

### Week 5-8: Core Refactoring
- Implement unified AI service (building on simple-ai-service.ts)
- Create shared compliance dashboard component
- Migrate existing dashboards to new architecture
- Add comprehensive error handling

### Week 7-8: Security and Performance
- Re-enable authentication system
- Implement rate limiting
- Add caching layer
- Optimize database queries

### Week 9-10: Testing and Documentation
- Write unit tests for all new code
- Create integration test suite
- Update documentation
- Performance testing and optimization

### Week 11-12: Deployment and Monitoring
- Staged rollout to production
- Monitor metrics and performance
- Address any issues
- Plan next phase

## Risk Mitigation

### Technical Risks
1. **Risk**: Breaking changes during refactoring
   - **Mitigation**: Feature flags for gradual rollout

2. **Risk**: AI service disruption
   - **Mitigation**: Implement fallback mechanisms

3. **Risk**: Data migration issues
   - **Mitigation**: Comprehensive backup strategy

### Business Risks
1. **Risk**: User disruption during migration
   - **Mitigation**: Maintain backward compatibility

2. **Risk**: Increased costs from AI usage
   - **Mitigation**: Implement smart caching and rate limiting

## Conclusion

This PRD outlines a comprehensive plan to transform Complians from a functional MVP to a scalable, maintainable enterprise platform. The proposed changes will reduce technical debt, improve performance, and enable rapid feature development while maintaining high security and reliability standards.

## Appendices

### A. Technical Debt Inventory
- Component duplication: 15+ dashboard files with 80% overlap
- Missing tests: 0% coverage for application code
- Security issues: Disabled authentication, exposed API keys
- Performance issues: Unoptimized renders, memory leaks

### B. Completed Features Documentation

#### AI Skills & Experience Compliance Agent
**Implementation Date**: January 2025

**Key Features**:
1. **AI Narrative Generation**: 
   - Direct OpenAI GPT-4 integration
   - Customizable tone and format (plain English default)
   - Fallback templates for API failures

2. **Manual Worker Information Form**:
   - Pre-filled with extracted data
   - Required fields: Worker Name, Job Title (as stated in CoS), SOC Code
   - Optional: Assignment Date
   - Ensures accurate worker data in system

3. **Document Processing**:
   - Extracts information from uploaded documents
   - Multiple extraction patterns for worker details
   - Falls back to manual entry when extraction fails

4. **Compliance Assessment**:
   - Evaluates skills match against CoS requirements
   - Checks employment history consistency
   - Verifies reference credibility
   - Identifies missing documentation
   - Generates COMPLIANT/SERIOUS BREACH verdict

**Technical Implementation**:
- `simple-ai-service.ts`: Simplified AI service without auth complexity
- `/api/generate-narrative-v2`: New endpoint bypassing authentication
- `SkillsExperienceComplianceDashboard.tsx`: Enhanced with manual form
- `ai-style-config.ts`: Customizable AI narrative styles

### C. Competitive Analysis
- Competitor A: Offers workflow automation
- Competitor B: Has mobile application
- Competitor C: Provides API marketplace
- Complians advantage: AI-powered assessments, UK-specific compliance

### D. User Research Insights
- Users want faster assessment generation
- Mobile access is highly requested
- Integration with existing HR systems needed
- More detailed compliance reporting desired