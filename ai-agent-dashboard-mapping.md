# AI Agent Types to Dashboard Files Mapping

This document maps each AI agent type from `AI_AGENT_TYPES` to their corresponding dashboard component files.

## Complete Mapping

| AI Agent Type | Dashboard Component File | Notes |
|---------------|-------------------------|-------|
| `ai-salary-compliance` | No separate dashboard component | Dashboard is built directly in `/src/app/ai-salary-compliance/page.tsx` |
| `ai-qualification-compliance` | `QualificationComplianceDashboard.tsx` | Located at `/src/components/QualificationComplianceDashboard.tsx` |
| `ai-right-to-work-compliance` | `RightToWorkComplianceDashboard.tsx` | Located at `/src/components/RightToWorkComplianceDashboard.tsx` |
| `ai-skills-experience-compliance` | `SkillsExperienceComplianceDashboard.tsx` | Located at `/src/components/SkillsExperienceComplianceDashboard.tsx` |
| `ai-document-compliance` | `DocumentComplianceDashboard.tsx` | Located at `/src/components/DocumentComplianceDashboard.tsx` |
| `ai-record-keeping-compliance` | `RecordKeepingComplianceDashboard.tsx` | Located at `/src/components/RecordKeepingComplianceDashboard.tsx` |
| `ai-reporting-duties-compliance` | `ReportingDutiesComplianceDashboard.tsx` | Located at `/src/components/ReportingDutiesComplianceDashboard.tsx` |
| `ai-third-party-labour-compliance` | `ThirdPartyLabourComplianceDashboard.tsx` | Located at `/src/components/ThirdPartyLabourComplianceDashboard.tsx` |
| `ai-immigration-status-monitoring-compliance` | `ImmigrationStatusMonitoringDashboard.tsx` | Located at `/src/components/ImmigrationStatusMonitoringDashboard.tsx` |
| `ai-migrant-contact-maintenance-compliance` | `MigrantContactMaintenanceDashboard.tsx` | Located at `/src/components/MigrantContactMaintenanceDashboard.tsx` |
| `ai-migrant-tracking-compliance` | `MigrantTrackingComplianceDashboard.tsx` | Located at `/src/components/MigrantTrackingComplianceDashboard.tsx` |
| `ai-contracted-hours-compliance` | `ContractedHoursComplianceDashboard.tsx` | Located at `/src/components/ContractedHoursComplianceDashboard.tsx` |
| `ai-genuine-vacancies-compliance` | `GenuineVacanciesComplianceDashboard.tsx` | Located at `/src/components/GenuineVacanciesComplianceDashboard.tsx` |
| `ai-paragraph-c7-26-compliance` | `ParagraphC726ComplianceDashboard.tsx` | Located at `/src/components/ParagraphC726ComplianceDashboard.tsx` |
| `ai-right-to-rent-compliance` | `AIComplianceDashboard.tsx` | Uses the generic AI compliance dashboard at `/src/components/AIComplianceDashboard.tsx` |

## Additional Dashboard Components (Not in AI_AGENT_TYPES)

These dashboard components exist but don't have corresponding entries in the `AI_AGENT_TYPES` array:

- `RecruitmentPracticesComplianceDashboard.tsx` - Used by `/ai-recruitment-practices-compliance` route
- `WorkerComplianceDashboard.tsx` - Generic worker compliance dashboard
- `ComplianceOverviewDashboard.tsx` - Overall compliance overview
- `NarrativeMetricsDashboard.tsx` - Narrative metrics dashboard
- `TenantAnalyticsDashboard.tsx` - Tenant analytics dashboard
- `BillingDashboard.tsx` - Billing dashboard
- `AuditLogsDashboard.tsx` - Audit logs dashboard
- `MasterComplianceDashboard.tsx` - Master compliance dashboard

## Key Findings

1. **Most agent types have dedicated dashboard components** - 14 out of 15 agent types have their own dashboard component files.

2. **ai-salary-compliance is unique** - It's the only agent type that doesn't use a separate dashboard component. The entire dashboard is implemented directly in the page component.

3. **ai-right-to-rent-compliance uses generic dashboard** - This agent type uses the generic `AIComplianceDashboard.tsx` component rather than having its own dedicated dashboard.

4. **Naming convention** - Dashboard components generally follow the pattern: `[AgentName]ComplianceDashboard.tsx`, where the agent name is derived from the agent type by:
   - Removing the `ai-` prefix
   - Removing the `-compliance` suffix
   - Converting kebab-case to PascalCase
   - Adding `ComplianceDashboard` suffix

5. **Route to dashboard mapping** - Each agent type has a corresponding route at `/src/app/[agent-type]/page.tsx` that imports and renders the dashboard component.