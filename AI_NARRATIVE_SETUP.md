# AI Narrative Generation System Setup Guide

## Overview

The AI Narrative Generation System provides intelligent, compliance-focused narrative generation for Skills & Experience assessments with comprehensive monitoring, caching, and validation capabilities.

## Environment Configuration

### Required Environment Variables

Copy the `env.example` file to `.env.local` and configure the following variables:

```bash
# OpenAI Configuration
OPENAI_API_KEY=your_api_key_here

# Feature Flags (optional)
ENABLE_AI_NARRATIVES=true
AI_NARRATIVE_CACHE_HOURS=24
AI_NARRATIVE_EXPERIMENT_PERCENTAGE=50
```

### Configuration Details

#### OpenAI API Key
- **Required**: Your OpenAI API key for AI narrative generation
- **Format**: `sk-...` (starts with sk-)
- **Source**: [OpenAI Platform](https://platform.openai.com/api-keys)

#### Feature Flags

**ENABLE_AI_NARRATIVES**
- **Default**: `true`
- **Purpose**: Master switch for AI narrative generation
- **Values**: `true` | `false`
- **Behavior**: When `false`, system uses fallback templates only

**AI_NARRATIVE_CACHE_HOURS**
- **Default**: `24`
- **Purpose**: Cache duration for generated narratives
- **Values**: `1-168` (1 hour to 1 week)
- **Behavior**: Reduces API calls and improves performance

**AI_NARRATIVE_EXPERIMENT_PERCENTAGE**
- **Default**: `50`
- **Purpose**: Percentage of requests to use AI generation
- **Values**: `0-100`
- **Behavior**: Enables gradual rollout and A/B testing

## System Components

### 1. AI Narrative Service (`/lib/aiNarrativeService.ts`)
- Multi-model AI generation with intelligent fallbacks
- Enhanced prompt engineering for compliance narratives
- Document context integration
- Severity-based tone adjustment

### 2. Narrative Generation Service (`/lib/narrativeGenerationService.ts`)
- Main orchestration service
- Integration with caching, validation, and metrics
- Legal reference management
- Audit trail generation

### 3. Narrative Cache (`/lib/narrativeCache.ts`)
- Intelligent caching with LRU eviction
- Template personalization
- Time-based expiration
- Performance optimization

### 4. Narrative Validator (`/lib/narrativeValidator.ts`)
- Comprehensive validation and scoring
- Quality checks and decision tree alignment
- High-risk case enhancements
- Compliance verification

### 5. Narrative Metrics (`/lib/narrativeMetrics.ts`)
- Performance tracking and analytics
- Experiment management
- Cost estimation and anomaly detection
- Statistical reporting

### 6. Legal References (`/lib/legalReferences.ts`)
- Centralized Home Office guidance
- Regulatory compliance codes
- Version management
- Category organization

## API Endpoints

### Generate Narrative
```
POST /api/generate-narrative
```
- Generates AI-powered compliance narratives
- Supports JSON and streaming responses
- Includes validation and audit trails

### Metrics Logging
```
POST /api/narrative-metrics
GET /api/narrative-metrics
```
- Logs generation metrics and performance data
- Provides analytics and statistics
- Supports timeframe filtering

## Usage Examples

### Basic AI Generation
```typescript
import { generateAINarrative } from '@/lib/aiNarrativeService';

const narrative = await generateAINarrative({
  workerName: "John Doe",
  jobTitle: "Software Engineer",
  isCompliant: false,
  riskLevel: "HIGH",
  // ... other assessment data
});
```

### With Metrics Tracking
```typescript
import { narrativeMetrics } from '@/lib/narrativeMetrics';

await narrativeMetrics.logGeneration({
  id: `NAR_${Date.now()}`,
  timestamp: new Date().toISOString(),
  input: assessmentData,
  output: narrative,
  model: 'gpt-4',
  duration: 2500,
  validationPassed: true
});
```

### Cache Management
```typescript
import { narrativeCache } from '@/lib/narrativeCache';

// Get cached narrative
const cached = narrativeCache.get(cacheKey);

// Get cache statistics
const stats = narrativeCache.getStats();
```

## Monitoring Dashboard

The Narrative Metrics Dashboard (`/components/NarrativeMetricsDashboard.tsx`) provides:
- Real-time generation statistics
- Cache performance metrics
- Model usage breakdown
- Validation success rates
- Performance timing data

## Deployment Considerations

### Production Setup
1. **Environment Variables**: Configure all required variables
2. **API Key Security**: Ensure OpenAI API key is properly secured
3. **Rate Limiting**: Monitor API usage and implement rate limiting
4. **Error Handling**: Configure proper error monitoring
5. **Caching**: Optimize cache settings for your use case

### Performance Optimization
- **Cache Duration**: Adjust based on narrative update frequency
- **Experiment Percentage**: Start low and gradually increase
- **Model Selection**: Choose appropriate models for cost/quality balance
- **Validation Thresholds**: Set quality thresholds for your requirements

### Security Considerations
- **API Key Protection**: Never expose API keys in client-side code
- **Input Validation**: Validate all inputs before AI processing
- **Output Sanitization**: Sanitize AI outputs before display
- **Audit Logging**: Maintain comprehensive audit trails

## Troubleshooting

### Common Issues

**AI Generation Fails**
- Check OpenAI API key validity
- Verify API quota and rate limits
- Review error logs for specific issues
- Ensure `ENABLE_AI_NARRATIVES=true`

**Poor Performance**
- Increase cache duration
- Reduce experiment percentage
- Check network connectivity
- Monitor API response times

**Validation Failures**
- Review validation thresholds
- Check input data quality
- Examine validation error logs
- Adjust quality requirements

### Debug Mode
Enable debug logging by setting:
```bash
DEBUG_AI_NARRATIVES=true
```

## Support

For issues or questions:
1. Check the application logs
2. Review the metrics dashboard
3. Verify environment configuration
4. Test with fallback mode enabled

## Version History

- **v1.0.0**: Initial AI narrative generation system
- **v1.1.0**: Added comprehensive monitoring and metrics
- **v1.2.0**: Enhanced validation and caching
- **v1.3.0**: Legal reference integration and audit trails 