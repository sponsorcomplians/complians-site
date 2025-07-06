import OpenAI from 'openai';
import { masterComplianceService } from './masterComplianceService';
import { MASTER_COMPLIANCE_SYSTEM_PROMPT, MASTER_COMPLIANCE_USER_PROMPT } from './prompts/masterCompliancePrompt';

const openai = new OpenAI();

export interface MasterCompliancePDFData {
  summary: any;
  agentSummaries: any[];
  statusDistribution: any;
  riskDistribution: any;
  topAgents: any[];
  recentTrends: any[];
  workerDetails?: any[];
  narrative?: string;
}

export class MasterCompliancePDFGenerator {
  private supabase = masterComplianceService['supabase'];

  async generateMasterCompliancePDF(): Promise<{
    success: boolean;
    pdfContent?: string;
    narrative?: string;
    error?: string;
  }> {
    try {
      // Get current user
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Get all master compliance metrics
      const metrics = await masterComplianceService.getMasterComplianceMetrics();
      
      // Get worker details for narrative
      const workersData = await masterComplianceService.getMasterComplianceWorkers();
      const workerDetails = workersData.workers.slice(0, 10); // Limit to first 10 for narrative

      // Prepare data for narrative generation
      const pdfData: MasterCompliancePDFData = {
        summary: metrics.summary,
        agentSummaries: metrics.agentSummaries,
        statusDistribution: metrics.statusDistribution,
        riskDistribution: metrics.riskDistribution,
        topAgents: metrics.topAgents,
        recentTrends: metrics.recentTrends,
        workerDetails
      };

      // Generate master narrative
      const narrative = await this.generateMasterNarrative(pdfData);
      
      // Generate PDF content
      const pdfContent = this.generatePDFContent(pdfData, narrative);

      return {
        success: true,
        pdfContent,
        narrative
      };
    } catch (error) {
      console.error('Error generating master compliance PDF:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private async generateMasterNarrative(data: MasterCompliancePDFData): Promise<string> {
    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: MASTER_COMPLIANCE_SYSTEM_PROMPT },
          { role: 'user', content: MASTER_COMPLIANCE_USER_PROMPT(data) }
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
      console.error('Error generating master narrative:', error);
      throw error;
    }
  }

  private generatePDFContent(data: MasterCompliancePDFData, narrative: string): string {
    const { summary, agentSummaries, statusDistribution, riskDistribution, topAgents } = data;
    
    let content = `MASTER COMPLIANCE REPORT\n`;
    content += `Generated: ${new Date().toLocaleDateString('en-GB', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    })}\n`;
    content += `Report Type: Comprehensive Sponsor Compliance Assessment\n\n`;
    
    // Executive Summary
    content += `EXECUTIVE SUMMARY\n`;
    content += `================\n\n`;
    content += `This comprehensive compliance report provides a detailed assessment of the sponsor's adherence to Home Office requirements across all 15 key compliance areas. The analysis is based on real-time data from our AI-powered compliance monitoring system.\n\n`;
    
    // Key Metrics
    content += `KEY METRICS\n`;
    content += `===========\n`;
    content += `Total Sponsored Workers: ${summary.totalWorkers}\n`;
    content += `Overall Compliance Rate: ${summary.overallComplianceRate}%\n`;
    content += `Total Assessments Conducted: ${summary.totalAssessments}\n`;
    content += `Critical Breaches Identified: ${summary.totalSeriousBreaches}\n`;
    content += `Red Flags Raised: ${summary.totalRedFlags}\n`;
    content += `High-Risk Workers: ${summary.highRiskWorkers}\n\n`;
    
    // Compliance Status Breakdown
    content += `COMPLIANCE STATUS BREAKDOWN\n`;
    content += `==========================\n`;
    content += `Compliant Workers: ${statusDistribution.compliant} (${((statusDistribution.compliant / summary.totalWorkers) * 100).toFixed(1)}%)\n`;
    content += `Breach Cases: ${statusDistribution.breach} (${((statusDistribution.breach / summary.totalWorkers) * 100).toFixed(1)}%)\n`;
    content += `Serious Breaches: ${statusDistribution.seriousBreach} (${((statusDistribution.seriousBreach / summary.totalWorkers) * 100).toFixed(1)}%)\n\n`;
    
    // Risk Level Distribution
    content += `RISK LEVEL DISTRIBUTION\n`;
    content += `======================\n`;
    content += `Low Risk: ${riskDistribution.low} workers\n`;
    content += `Medium Risk: ${riskDistribution.medium} workers\n`;
    content += `High Risk: ${riskDistribution.high} workers\n\n`;
    
    // Top Performing Agents
    content += `TOP PERFORMING COMPLIANCE AREAS\n`;
    content += `==============================\n`;
    topAgents.forEach((agent, index) => {
      content += `${index + 1}. ${agent.agentName}\n`;
      content += `   Compliance Rate: ${agent.complianceRate}%\n`;
      content += `   Workers Assessed: ${agent.totalWorkers}\n`;
      content += `   Red Flags: ${agent.redFlags}\n\n`;
    });
    
    // Master Narrative
    content += `COMPREHENSIVE COMPLIANCE ANALYSIS\n`;
    content += `=================================\n\n`;
    content += narrative;
    content += `\n\n`;
    
    // Agent Breakdown
    content += `DETAILED AGENT BREAKDOWN\n`;
    content += `=======================\n\n`;
    agentSummaries.forEach(agent => {
      if (agent.totalWorkers > 0) {
        content += `${agent.agentName.toUpperCase()}\n`;
        content += `${'='.repeat(agent.agentName.length)}\n`;
        content += `Compliance Rate: ${agent.complianceRate}%\n`;
        content += `Total Workers: ${agent.totalWorkers}\n`;
        content += `Breach Cases: ${agent.breachWorkers}\n`;
        content += `Serious Breaches: ${agent.seriousBreachWorkers}\n`;
        content += `Red Flags: ${agent.redFlags}\n`;
        content += `High Risk Workers: ${agent.highRiskWorkers}\n\n`;
      }
    });
    
    // Recommendations
    content += `RECOMMENDATIONS\n`;
    content += `===============\n\n`;
    content += `Based on the comprehensive analysis above, the following actions are recommended:\n\n`;
    
    if (summary.totalSeriousBreaches > 0) {
      content += `1. IMMEDIATE ACTION REQUIRED: Address ${summary.totalSeriousBreaches} serious breach(es) within 48 hours\n`;
    }
    if (summary.totalRedFlags > 0) {
      content += `2. PRIORITY: Review and resolve ${summary.totalRedFlags} red flag(s) within 7 days\n`;
    }
    if (summary.highRiskWorkers > 0) {
      content += `3. MONITORING: Implement enhanced monitoring for ${summary.highRiskWorkers} high-risk worker(s)\n`;
    }
    if (summary.overallComplianceRate < 80) {
      content += `4. IMPROVEMENT: Develop action plan to improve overall compliance rate from ${summary.overallComplianceRate}% to target of 90%+\n`;
    }
    
    content += `\n5. AUDIT: Schedule comprehensive internal audit within 30 days\n`;
    content += `6. TRAINING: Provide compliance training to relevant staff\n`;
    content += `7. DOCUMENTATION: Ensure all compliance records are properly maintained\n\n`;
    
    // Footer
    content += `\n\n---\n`;
    content += `This report was generated by the Complians AI Compliance Monitoring System.\n`;
    content += `For questions or support, please contact your compliance team.\n`;
    content += `Report ID: MC_${Date.now()}\n`;
    
    return content;
  }
}

export const masterCompliancePDFGenerator = new MasterCompliancePDFGenerator(); 