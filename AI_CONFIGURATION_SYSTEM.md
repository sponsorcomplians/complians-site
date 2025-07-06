# AI Configuration System Documentation

## Overview

The AI Configuration System allows tenants to customize how AI generates compliance narratives based on their organization's preferences, risk tolerance, and compliance requirements. This system provides granular control over AI behavior while maintaining consistency and quality.

## Architecture

### Core Components

1. **Tenant AI Settings**: JSON configuration stored in `tenants.settings`
2. **Multi-Tenant Service**: Functions for managing AI configuration
3. **Narrative Generation Service**: Updated to use tenant-specific settings
4. **AI Configuration API**: REST endpoints for managing settings
5. **UI Management Interface**: User-friendly settings page

## AI Configuration Fields

### Core Settings

```json
{
  "ai_tone": "strict" | "moderate" | "lenient",
  "risk_tolerance": "low" | "medium" | "high",
  "narrative_style": "formal" | "professional" | "conversational",
  "compliance_strictness": "high" | "medium" | "low"
}
```

### Custom Prompts

```json
{
  "custom_prompts": {
    "assessment_intro": "Custom introduction text...",
    "risk_analysis": "Custom risk analysis instructions...",
    "recommendations": "Custom recommendation format..."
  }
}
```

### Notification Preferences

```json
{
  "notification_preferences": {
    "email_alerts": true,
    "dashboard_notifications": true,
    "weekly_reports": false
  }
}
```

## AI Tone Settings

### Strict Tone
- **Language**: Authoritative and firm
- **Focus**: Compliance requirements and consequences
- **Use Case**: High-compliance environments, regulatory audits
- **Example**: "This constitutes a significant breach of your sponsor duties..."

### Moderate Tone
- **Language**: Balanced and professional
- **Focus**: Both compliance requirements and practical considerations
- **Use Case**: Standard business environments
- **Example**: "This represents a moderate compliance concern that should be addressed..."

### Lenient Tone
- **Language**: Supportive and educational
- **Focus**: Guidance and improvement opportunities
- **Use Case**: Learning environments, new sponsors
- **Example**: "This suggests an area for improvement in your compliance processes..."

## Narrative Style Settings

### Formal Style
- **Language**: Legal-style language with technical terminology
- **Features**: Specific regulatory references, formal structure
- **Use Case**: Legal departments, regulatory submissions
- **Example**: "Pursuant to Paragraph C1.38 of the Workers and Temporary Workers Guidance..."

### Professional Style
- **Language**: Professional business language
- **Features**: Technical accuracy with accessibility
- **Use Case**: Business environments, management reports
- **Example**: "Our assessment indicates areas where compliance verification could be improved..."

### Conversational Style
- **Language**: Clear and accessible language
- **Features**: Minimal jargon, practical understanding
- **Use Case**: Training environments, general staff
- **Example**: "The evidence shows some gaps in the compliance verification process..."

## Compliance Strictness Settings

### High Strictness
- **Threshold**: 0.8 compliance score required
- **Behavior**: Flags any potential issues, even minor ones
- **Use Case**: High-risk industries, regulatory scrutiny
- **Impact**: More frequent breach classifications

### Medium Strictness
- **Threshold**: 0.7 compliance score required
- **Behavior**: Focuses on significant issues while noting minor concerns
- **Use Case**: Standard business operations
- **Impact**: Balanced approach to compliance assessment

### Low Strictness
- **Threshold**: 0.6 compliance score required
- **Behavior**: Focuses on major issues with constructive guidance
- **Use Case**: Learning environments, new sponsors
- **Impact**: Fewer breach classifications, more guidance

## Risk Tolerance Settings

### Low Risk Tolerance
- **Threshold**: 0.4 risk score triggers high risk
- **Behavior**: Conservative risk assessment, identifies all potential risks
- **Use Case**: High-compliance environments, regulated industries
- **Impact**: More frequent high-risk classifications

### Medium Risk Tolerance
- **Threshold**: 0.6 risk score triggers high risk
- **Behavior**: Balanced risk assessment, focuses on moderate to high probability risks
- **Use Case**: Standard business operations
- **Impact**: Balanced risk assessment

### High Risk Tolerance
- **Threshold**: 0.8 risk score triggers high risk
- **Behavior**: Pragmatic risk assessment, focuses on high probability risks
- **Use Case**: Fast-growing companies, innovative industries
- **Impact**: Fewer high-risk classifications

## Implementation Details

### Database Schema

```sql
-- AI configuration is stored in tenants.settings JSONB field
ALTER TABLE tenants 
ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{
  "ai_tone": "strict",
  "risk_tolerance": "low",
  "narrative_style": "formal",
  "compliance_strictness": "high",
  "custom_prompts": {},
  "notification_preferences": {
    "email_alerts": true,
    "dashboard_notifications": true,
    "weekly_reports": false
  }
}'::jsonb;
```

### Multi-Tenant Service Functions

```typescript
// Get tenant AI configuration
const aiConfig = await getTenantAIConfig();

// Update tenant AI configuration
const updatedConfig = await updateTenantAIConfig({
  ai_tone: 'moderate',
  narrative_style: 'professional'
});

// Generate AI prompt with tenant settings
const prompt = generateAIPrompt(basePrompt, assessmentData, aiConfig);

// Apply tenant settings to assessment results
const adjustedData = applyTenantAISettings(assessmentData, aiConfig);
```

### Narrative Generation Integration

```typescript
// In narrative generation service
const tenantAIConfig = await getTenantAIConfig();
const adjustedInput = applyTenantAISettings(input, tenantAIConfig);
const tenantPrompt = generateAIPrompt(basePrompt, adjustedInput, tenantAIConfig);
const aiNarrative = await generateAINarrative(adjustedInput, tenantPrompt);
```

## API Endpoints

### Get AI Configuration
```http
GET /api/tenants/ai-settings
```

### Update AI Configuration
```http
PUT /api/tenants/ai-settings
Content-Type: application/json

{
  "ai_tone": "moderate",
  "narrative_style": "professional",
  "compliance_strictness": "medium",
  "risk_tolerance": "medium"
}
```

### Reset to Defaults
```http
POST /api/tenants/ai-settings
Content-Type: application/json

{
  "reset": true
}
```

## UI Management

### Settings Page
- **Route**: `/tenant-ai-settings`
- **Features**: 
  - Dropdown selectors for core settings
  - Text areas for custom prompts
  - Toggle switches for notifications
  - Real-time preview of current configuration
  - Reset to defaults functionality

### Configuration Display
- Current settings with badges
- Explanation of each setting's impact
- Examples of how settings affect narratives

## Compliance Thresholds

### Dynamic Threshold Calculation

```typescript
function getComplianceThresholds(aiConfig: TenantSettings) {
  const strictness = aiConfig.compliance_strictness || 'high';
  const riskTolerance = aiConfig.risk_tolerance || 'low';

  return {
    risk_score_threshold: strictness === 'high' ? 0.3 : strictness === 'medium' ? 0.5 : 0.7,
    compliance_score_threshold: strictness === 'high' ? 0.8 : strictness === 'medium' ? 0.7 : 0.6,
    alert_threshold: riskTolerance === 'low' ? 0.4 : riskTolerance === 'medium' ? 0.6 : 0.8,
    remediation_threshold: strictness === 'high' ? 0.6 : strictness === 'medium' ? 0.7 : 0.8
  };
}
```

## Audit and Monitoring

### Audit Trail
- All AI configuration changes are logged
- Tenant-specific audit logs include AI settings used
- Narrative generation includes AI configuration metadata

### Metrics
- Configuration usage statistics
- Narrative generation success rates by configuration
- Performance impact of different settings

## Best Practices

### Configuration Recommendations

#### High-Compliance Environments
```json
{
  "ai_tone": "strict",
  "narrative_style": "formal",
  "compliance_strictness": "high",
  "risk_tolerance": "low"
}
```

#### Standard Business Operations
```json
{
  "ai_tone": "moderate",
  "narrative_style": "professional",
  "compliance_strictness": "medium",
  "risk_tolerance": "medium"
}
```

#### Learning/Training Environments
```json
{
  "ai_tone": "lenient",
  "narrative_style": "conversational",
  "compliance_strictness": "low",
  "risk_tolerance": "high"
}
```

### Custom Prompts Guidelines
- Keep prompts concise and specific
- Focus on one aspect per custom prompt
- Test prompts with sample data before deployment
- Avoid conflicting instructions

## Troubleshooting

### Common Issues

#### 1. Configuration Not Applied
**Symptoms**: Narratives don't reflect tenant settings
**Solution**: Check tenant context and AI configuration retrieval

#### 2. Invalid Configuration Values
**Symptoms**: API errors when updating settings
**Solution**: Validate configuration values against allowed options

#### 3. Performance Issues
**Symptoms**: Slow narrative generation
**Solution**: Monitor custom prompt complexity and length

### Debug Queries

```sql
-- Check tenant AI configuration
SELECT 
  t.name,
  t.settings->>'ai_tone' as ai_tone,
  t.settings->>'narrative_style' as narrative_style,
  t.settings->>'compliance_strictness' as compliance_strictness
FROM tenants t
WHERE t.id = 'tenant-id';

-- Check configuration usage in narratives
SELECT 
  audit.tenantAIConfig,
  audit.model,
  audit.validationPassed
FROM narrative_audits audit
WHERE audit.tenantAIConfig IS NOT NULL
ORDER BY audit.timestamp DESC
LIMIT 10;
```

## Future Enhancements

### Planned Features
1. **Configuration Templates**: Pre-built configurations for common use cases
2. **A/B Testing**: Compare different configurations for effectiveness
3. **Machine Learning**: Automatically optimize configurations based on outcomes
4. **Configuration Inheritance**: Parent-child tenant configuration relationships
5. **Configuration Versioning**: Track changes and rollback capabilities

### Advanced Features
1. **Dynamic Thresholds**: AI-learned thresholds based on historical data
2. **Industry-Specific Configurations**: Pre-configured settings for different industries
3. **Compliance Framework Integration**: Automatic configuration based on regulatory requirements
4. **Real-time Configuration Updates**: Apply changes without system restart

## Conclusion

The AI Configuration System provides tenants with powerful tools to customize AI behavior while maintaining system integrity and performance. The system is designed to be flexible, auditable, and scalable, supporting various compliance requirements and business needs.

Key benefits:
- **Customization**: Tailor AI behavior to organizational needs
- **Consistency**: Maintain consistent behavior within tenant boundaries
- **Auditability**: Complete audit trail of configuration changes
- **Performance**: Optimized for minimal performance impact
- **Scalability**: Support for multiple tenants with different configurations 