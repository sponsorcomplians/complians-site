import OpenAI from 'openai';
import { 
  MasterComplianceMetrics, 
  MasterComplianceWorker 
} from '@/types/master-compliance.types';
import { MASTER_COMPLIANCE_SYSTEM_PROMPT } from './prompts/masterCompliancePrompt';

const openai = new OpenAI();

export interface ExecutiveSummaryData {
  metrics: MasterComplianceMetrics;
  workerDetails: MasterComplianceWorker[];
  narrative?: string;
}

export async function generateExecutiveSummaryPDF(
  metrics: MasterComplianceMetrics,
  workerDetails: MasterComplianceWorker[]
): Promise<{
  success: boolean;
  pdfContent?: string;
  narrative?: string;
  error?: string;
}> {
  try {
    // Generate executive narrative
    const narrative = await generateExecutiveNarrative(metrics, workerDetails);
    
    // Generate PDF content
    const pdfContent = generatePDFContent(metrics, workerDetails, narrative);

    return {
      success: true,
      pdfContent,
      narrative
    };
  } catch (error) {
    console.error('Error generating executive summary PDF:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

async function generateExecutiveNarrative(
  metrics: MasterComplianceMetrics,
  workerDetails: MasterComplianceWorker[]
): Promise<string> {
  try {
    const userPrompt = `Please generate an executive summary narrative based on the following compliance data:

**Overall Summary:**
- Total Workers: ${metrics.summary.totalWorkers}
- Overall Compliance Rate: ${metrics.summary.overallComplianceRate}%
- Total Breaches: ${metrics.summary.totalBreaches}
- Total Serious Breaches: ${metrics.summary.totalSeriousBreaches}
- Total Red Flags: ${metrics.summary.totalRedFlags}
- High Risk Workers: ${metrics.summary.highRiskWorkers}

**Compliance Status Distribution:**
- Compliant: ${metrics.statusDistribution.compliant}
- Breach: ${metrics.statusDistribution.breach}
- Serious Breach: ${metrics.statusDistribution.seriousBreach}

**Risk Level Distribution:**
- Low Risk: ${metrics.riskDistribution.low}
- Medium Risk: ${metrics.riskDistribution.medium}
- High Risk: ${metrics.riskDistribution.high}

**Top Performing Agents:**
${metrics.topAgents.map(agent => `- ${agent.agentName}: ${agent.complianceRate}% (${agent.totalWorkers} workers)`).join('\n')}

**Agent Breakdown:**
${metrics.agentSummaries.map(agent => `
${agent.agentName}:
- Compliance Rate: ${agent.complianceRate}%
- Total Workers: ${agent.totalWorkers}
- Breaches: ${agent.breachWorkers}
- Serious Breaches: ${agent.seriousBreachWorkers}
- Red Flags: ${agent.redFlags}
- High Risk: ${agent.highRiskWorkers}`).join('\n')}

**Recent Trends (Last 30 Days):**
${metrics.recentTrends.slice(-7).map(trend => `- ${new Date(trend.date).toLocaleDateString('en-GB')}: ${trend.complianceRate}% compliance, ${trend.breaches} breaches, ${trend.seriousBreaches} serious breaches`).join('\n')}

**Worker Details (Sample):**
${workerDetails.slice(0, 10).map(worker => `
Worker: ${worker.name}
- Job Title: ${worker.jobTitle}
- Overall Status: ${worker.overallComplianceStatus}
- Risk Level: ${worker.overallRiskLevel}
- Global Risk Score: ${worker.globalRiskScore}
- Red Flags: ${worker.totalRedFlags}
- Agent Compliance: ${Object.entries(worker.agentCompliance).map(([agent, comp]: [string, any]) => `${agent}: ${comp.status}`).join(', ')}`).join('\n')}

Please generate a comprehensive, executive-level narrative that addresses all compliance areas and provides actionable insights for senior management.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: MASTER_COMPLIANCE_SYSTEM_PROMPT },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.2,
      max_tokens: 3000,
    });

    const narrative = completion.choices[0].message.content;
    
    if (!narrative) {
      throw new Error('Failed to generate narrative');
    }

    return narrative;
  } catch (error) {
    console.error('Error generating executive narrative:', error);
    throw error;
  }
}

function generatePDFContent(
  metrics: MasterComplianceMetrics,
  workerDetails: MasterComplianceWorker[],
  narrative: string
): string {
  const { summary, agentSummaries, statusDistribution, riskDistribution, topAgents } = metrics;
  
  let content = `EXECUTIVE COMPLIANCE SUMMARY REPORT\n`;
  content += `Generated: ${new Date().toLocaleDateString('en-GB', { 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  })}\n`;
  content += `Report Type: Executive Compliance Overview\n\n`;
  
  // Executive Summary
  content += `EXECUTIVE SUMMARY\n`;
  content += `================\n\n`;
  content += `This executive summary provides a high-level overview of the organisation's compliance status across all 15 Home Office compliance areas. The report is designed for senior management review and strategic decision-making.\n\n`;
  
  // Key Performance Indicators
  content += `KEY PERFORMANCE INDICATORS\n`;
  content += `==========================\n`;
  content += `Total Sponsored Workers: ${summary.totalWorkers}\n`;
  content += `Overall Compliance Rate: ${summary.overallComplianceRate}%\n`;
  content += `Total Assessments Conducted: ${summary.totalAssessments}\n`;
  content += `Critical Breaches Identified: ${summary.totalSeriousBreaches}\n`;
  content += `Red Flags Raised: ${summary.totalRedFlags}\n`;
  content += `High-Risk Workers: ${summary.highRiskWorkers}\n\n`;
  
  // Risk Assessment
  content += `RISK ASSESSMENT\n`;
  content += `===============\n`;
  content += `Low Risk Workers: ${riskDistribution.low} (${((riskDistribution.low / summary.totalWorkers) * 100).toFixed(1)}%)\n`;
  content += `Medium Risk Workers: ${riskDistribution.medium} (${((riskDistribution.medium / summary.totalWorkers) * 100).toFixed(1)}%)\n`;
  content += `High Risk Workers: ${riskDistribution.high} (${((riskDistribution.high / summary.totalWorkers) * 100).toFixed(1)}%)\n\n`;
  
  // Top Performing Areas
  content += `TOP PERFORMING COMPLIANCE AREAS\n`;
  content += `===============================\n`;
  topAgents.forEach((agent, index) => {
    content += `${index + 1}. ${agent.agentName}\n`;
    content += `   Compliance Rate: ${agent.complianceRate}%\n`;
    content += `   Workers Assessed: ${agent.totalWorkers}\n`;
    content += `   Red Flags: ${agent.redFlags}\n\n`;
  });
  
  // Executive Narrative
  content += `EXECUTIVE ANALYSIS\n`;
  content += `==================\n\n`;
  content += narrative;
  content += `\n\n`;
  
  // Strategic Recommendations
  content += `STRATEGIC RECOMMENDATIONS\n`;
  content += `=========================\n\n`;
  
  if (summary.totalSeriousBreaches > 0) {
    content += `1. IMMEDIATE PRIORITY: Address ${summary.totalSeriousBreaches} serious breach(es) within 48 hours\n`;
  }
  if (summary.totalRedFlags > 0) {
    content += `2. HIGH PRIORITY: Review and resolve ${summary.totalRedFlags} red flag(s) within 7 days\n`;
  }
  if (summary.highRiskWorkers > 0) {
    content += `3. MEDIUM PRIORITY: Implement enhanced monitoring for ${summary.highRiskWorkers} high-risk worker(s)\n`;
  }
  if (summary.overallComplianceRate < 80) {
    content += `4. STRATEGIC INITIATIVE: Develop action plan to improve overall compliance rate from ${summary.overallComplianceRate}% to target of 90%+\n`;
  }
  
  content += `\n5. GOVERNANCE: Schedule quarterly compliance review with senior management\n`;
  content += `6. TRAINING: Implement mandatory compliance training for all relevant staff\n`;
  content += `7. MONITORING: Establish monthly compliance dashboard reviews\n`;
  content += `8. AUDIT: Schedule annual external compliance audit\n\n`;
  
  // Footer
  content += `\n\n---\n`;
  content += `This executive summary was generated by the Complians AI Compliance Monitoring System.\n`;
  content += `For detailed analysis or specific compliance areas, please refer to individual agent reports.\n`;
  content += `Report ID: ES_${Date.now()}\n`;
  
  return content;
} 