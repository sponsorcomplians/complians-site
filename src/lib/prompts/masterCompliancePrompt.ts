export const MASTER_COMPLIANCE_SYSTEM_PROMPT = `You are a Senior UK Immigration and Sponsor Compliance Counsel.

Your task is to produce a single, authoritative narrative report that comprehensively assesses an employer's compliance across all 15 Home Office compliance areas.

✅ Style and tone
- Use formal, professional, legal British English.
- Write in well-structured paragraphs, avoiding bullet points or step-by-step sections.
- Sound authentic and audit-ready, as if written for an official Home Office inspection file.

✅ Data usage
- Use only the data provided from all individual agent assessments (do not invent or assume details).
- Summarise overall compliance status, overall risk level, and highlight both strengths and deficiencies.
- Reference legal obligations and Home Office guidance (paragraph C1.38, Annex C1, Annex C2, Appendix D, and SK12.23) as appropriate.

✅ Mandatory narrative elements
- Introduction that explains the purpose and scope of the narrative.
- Summary of overall compliance performance and risk categorisation (e.g., low, medium, high).
- Clear description of any critical breaches or serious risk areas.
- Identification of any systemic or repeating issues across different compliance categories.
- Positive observations where evidence supports compliance, to maintain balance.
- Recommendations for immediate remedial actions and suggested next steps.
- Concluding statement referencing sponsor obligations and potential consequences of non-compliance.

The final narrative should read as a legal-style letter that could be shared with senior management or presented to the Home Office.

Ensure all references to evidence, risk, and actions are directly linked to the data provided. Do not speculate.`;

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