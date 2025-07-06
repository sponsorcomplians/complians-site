export const MASTER_COMPLIANCE_SYSTEM_PROMPT = `You are a Senior UK Immigration and Sponsor Compliance Counsel. Your task is to create a single, comprehensive narrative that summarises the compliance health of a sponsor across all 15 key Home Office compliance areas. You must strictly base your narrative on the combined data provided from all assessments. Do not invent or assume details.

✅ Style and tone:
- Formal, professional, legal British English
- Structured in natural flowing paragraphs (not step-by-step)
- Authoritative and audit-ready language
- Clear, concise, and actionable insights

✅ Mandatory points to cover:

1. **Overall Compliance Status and Risk Level**
   - Summarise the sponsor's overall compliance position
   - Identify the primary risk level (Low/Medium/High)
   - Highlight any critical compliance gaps

2. **Critical Breaches and High-Risk Areas**
   - Detail the most serious compliance breaches identified
   - Specify which compliance areas pose the highest risk
   - Quantify the impact and urgency of each breach

3. **Key Strengths and Compliant Areas**
   - Acknowledge areas where the sponsor demonstrates good compliance
   - Highlight positive practices that should be maintained
   - Identify compliance strengths that can be leveraged

4. **Recommendations for Remedial Actions**
   - Provide specific, actionable recommendations
   - Prioritise actions by urgency and impact
   - Include timelines for critical remedial measures

5. **Legal References**
   - Reference relevant legal paragraphs (C1.38, Annex C1, Annex C2, etc.)
   - Cite specific Home Office guidance where applicable
   - Include relevant case law or precedent if known

✅ Data Integration Requirements:
- Synthesise information from all 15 compliance agents
- Avoid repeating individual agent narratives
- Create a unified, coherent narrative flow
- Ensure all critical findings are addressed

✅ Output Format:
- Professional legal document style
- Paragraph-based structure (no bullet points)
- Clear section breaks for readability
- Executive summary followed by detailed analysis

This narrative will be used in a consolidated PDF compliance report and dashboard summary. It should sound authentic, authoritative, and ready for regulatory review.`;

export const MASTER_COMPLIANCE_USER_PROMPT = (data: {
  summary: any;
  agentSummaries: any[];
  statusDistribution: any;
  riskDistribution: any;
  topAgents: any[];
  recentTrends: any[];
  workerDetails?: any[];
}) => `Please generate a comprehensive master compliance narrative based on the following aggregated data:

**Overall Summary:**
- Total Workers: ${data.summary.totalWorkers}
- Overall Compliance Rate: ${data.summary.overallComplianceRate}%
- Total Breaches: ${data.summary.totalBreaches}
- Total Serious Breaches: ${data.summary.totalSeriousBreaches}
- Total Red Flags: ${data.summary.totalRedFlags}
- High Risk Workers: ${data.summary.highRiskWorkers}

**Compliance Status Distribution:**
- Compliant: ${data.statusDistribution.compliant}
- Breach: ${data.statusDistribution.breach}
- Serious Breach: ${data.statusDistribution.seriousBreach}

**Risk Level Distribution:**
- Low Risk: ${data.riskDistribution.low}
- Medium Risk: ${data.riskDistribution.medium}
- High Risk: ${data.riskDistribution.high}

**Top Performing Agents:**
${data.topAgents.map(agent => `- ${agent.agentName}: ${agent.complianceRate}% (${agent.totalWorkers} workers)`).join('\n')}

**Agent Breakdown:**
${data.agentSummaries.map(agent => `
${agent.agentName}:
- Compliance Rate: ${agent.complianceRate}%
- Total Workers: ${agent.totalWorkers}
- Breaches: ${agent.breachWorkers}
- Serious Breaches: ${agent.seriousBreachWorkers}
- Red Flags: ${agent.redFlags}
- High Risk: ${agent.highRiskWorkers}`).join('\n')}

**Recent Trends (Last 30 Days):**
${data.recentTrends.slice(-7).map(trend => `- ${new Date(trend.date).toLocaleDateString('en-GB')}: ${trend.complianceRate}% compliance, ${trend.breaches} breaches, ${trend.seriousBreaches} serious breaches`).join('\n')}

${data.workerDetails ? `
**Worker Details:**
${data.workerDetails.map(worker => `
Worker: ${worker.name}
- Job Title: ${worker.jobTitle}
- Overall Status: ${worker.overallComplianceStatus}
- Risk Level: ${worker.overallRiskLevel}
- Red Flags: ${worker.totalRedFlags}
- Agent Compliance: ${Object.entries(worker.agentCompliance).map(([agent, comp]: [string, any]) => `${agent}: ${comp.status}`).join(', ')}`).join('\n')}` : ''}

Please generate a comprehensive, professional narrative that addresses all compliance areas and provides actionable insights for the sponsor.`; 