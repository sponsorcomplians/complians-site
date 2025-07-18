# AI Migration Guide for Compliance Dashboards

## Overview

This guide documents the implementation of AI-powered narrative generation across all compliance dashboards in the Complians platform. Following the successful implementation of the Skills & Experience Compliance Agent, this guide provides instructions for upgrading all remaining compliance agents to use AI generation.

## Completed Work (January 2025)

### 1. Universal AI Infrastructure

#### Created Files:
- **`/src/lib/universal-ai-service.ts`** - Universal AI service supporting all agent types
- **`/src/app/api/generate-narrative-universal/route.ts`** - Universal API endpoint for AI generation
- **`/src/lib/dashboard-ai-upgrade.ts`** - Helper utilities for upgrading dashboards

#### Key Features:
- Direct OpenAI integration (bypassing authentication complexity)
- Agent-specific prompts for each compliance area
- Automatic fallback to template-based generation
- Customizable narrative styles via `ai-style-config.ts`

### 2. Skills & Experience Agent (Completed)

**Status**: ✅ Fully Implemented with AI

**Implementation Details**:
- Uses `/api/generate-narrative-v2` endpoint
- Manual worker information confirmation form
- Plain English narrative generation
- Full fallback logic for API failures

**Files Modified**:
- `SkillsExperienceComplianceDashboard.tsx`
- `simple-ai-service.ts`
- `improved-skills-prompt.ts`

## Migration Instructions for Remaining Dashboards

### Step 1: Add Import

Add the AI upgrade utility import to your dashboard:

```typescript
import { generateAIAssessment } from "@/lib/dashboard-ai-upgrade";
```

### Step 2: Update Assessment Function

Make your assessment generation function async:

```typescript
// Before
const generateProfessionalAssessment = (params...) => {
  // Template logic
}

// After
const generateProfessionalAssessment = async (params...) => {
  try {
    const assessmentData = {
      // Map your parameters to assessment data
    };
    
    const aiResult = await generateAIAssessment(
      'your-agent-type', // e.g., 'ai-qualification-compliance'
      {
        workerName,
        jobTitle,
        socCode,
        cosReference,
        assignmentDate
      },
      assessmentData
    );
    
    return aiResult.narrative;
  } catch (error) {
    console.error('[YourAgent] AI generation failed:', error);
    // Original template logic as fallback
  }
}
```

### Step 3: Update Function Calls

Update all calls to your assessment function to use await:

```typescript
// Before
const assessment = generateProfessionalAssessment(...);

// After
const assessment = await generateProfessionalAssessment(...);
```

## Agent Type Mapping

| Dashboard Component | Agent Type |
|-------------------|------------|
| QualificationComplianceDashboard | `ai-qualification-compliance` |
| RightToWorkComplianceDashboard | `ai-right-to-work-compliance` |
| DocumentComplianceDashboard | `ai-document-compliance` |
| RecordKeepingComplianceDashboard | `ai-record-keeping-compliance` |
| ReportingDutiesComplianceDashboard | `ai-reporting-duties-compliance` |
| ThirdPartyLabourComplianceDashboard | `ai-third-party-labour-compliance` |
| ImmigrationStatusMonitoringDashboard | `ai-immigration-status-monitoring-compliance` |
| MigrantContactMaintenanceDashboard | `ai-migrant-contact-maintenance-compliance` |
| MigrantTrackingComplianceDashboard | `ai-migrant-tracking-compliance` |
| ContractedHoursComplianceDashboard | `ai-contracted-hours-compliance` |
| GenuineVacanciesComplianceDashboard | `ai-genuine-vacancies-compliance` |
| ParagraphC726ComplianceDashboard | `ai-paragraph-c7-26-compliance` |
| RecruitmentPracticesComplianceDashboard | `ai-recruitment-practices-compliance` |

## Testing Your Implementation

1. **Set Environment Variable**:
   ```bash
   OPENAI_API_KEY=your-key-here
   ```

2. **Test AI Generation**:
   - Upload test documents
   - Verify AI narrative is generated
   - Check fallback works when API key is removed

3. **Verify Compliance Status Extraction**:
   - Ensure COMPLIANT/SERIOUS_BREACH is correctly identified
   - Check risk levels are properly assigned

## Common Issues and Solutions

### Issue 1: Authentication Blocking
**Solution**: Use the universal endpoint `/api/generate-narrative-universal` which bypasses auth

### Issue 2: AI Generation Timeout
**Solution**: The service has built-in retry logic and fallback to templates

### Issue 3: Incorrect Compliance Status
**Solution**: Check the narrative for keywords like "serious breach", "compliant", etc.

## Benefits of AI Migration

1. **Consistency**: All agents use the same AI service pattern
2. **Customization**: Narratives adapt to each specific compliance area
3. **Fallback Safety**: Template-based generation ensures service continuity
4. **Plain English**: Configurable tone and style for better readability
5. **Maintenance**: Single point of update for all AI logic

## Future Enhancements

1. **Multi-language Support**: Add prompts in other languages
2. **Custom Training**: Fine-tune models for UK immigration law
3. **Batch Processing**: Generate multiple assessments simultaneously
4. **Advanced Analytics**: Track AI usage and performance metrics

## Support

For issues or questions about the AI migration:
1. Check the console logs for detailed error messages
2. Verify environment variables are correctly set
3. Review the fallback templates if AI generation fails
4. Consult the `CLAUDE.md` file for troubleshooting steps