// Simple AI Service for Narrative Generation
// No complex authentication, just straightforward AI integration

import { improvedSkillsPrompt, toneVariations, formatOptions } from './prompts/improved-skills-prompt';
import { getStyleConfiguration } from './ai-style-config';

interface NarrativeRequest {
  workerName: string;
  cosReference: string;
  assignmentDate: string;
  jobTitle: string;
  socCode: string;
  cosDuties: string;
  jobDescriptionDuties: string;
  missingDocs: string[];
  employmentHistoryConsistent: boolean;
  experienceMatchesDuties: boolean;
  referencesCredible: boolean;
  experienceRecentAndContinuous: boolean;
  inconsistenciesDescription?: string;
}

export class SimpleAIService {
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY || '';
  }

  async generateNarrative(data: NarrativeRequest): Promise<string> {
    // If no API key, return a clear message
    if (!this.apiKey) {
      console.log('[SimpleAIService] No OpenAI API key configured');
      return this.getFallbackNarrative(data);
    }

    try {
      console.log('[SimpleAIService] Generating AI narrative...');
      
      const prompt = this.buildPrompt(data);
      
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4-turbo',
          messages: [
            {
              role: 'system',
              content: this.getSystemPrompt()
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.3,
          max_tokens: 4000
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error('[SimpleAIService] OpenAI API error:', error);
        return this.getFallbackNarrative(data);
      }

      const result = await response.json();
      const narrative = result.choices[0]?.message?.content;

      if (!narrative) {
        console.error('[SimpleAIService] No narrative in response');
        return this.getFallbackNarrative(data);
      }

      console.log('[SimpleAIService] AI narrative generated successfully');
      return narrative;

    } catch (error) {
      console.error('[SimpleAIService] Error generating narrative:', error);
      return this.getFallbackNarrative(data);
    }
  }

  private getSystemPrompt(): string {
    // Use the configuration-based style
    // This pulls from ai-style-config.ts for easy customization
    return getStyleConfiguration();
  }

  private buildPrompt(data: NarrativeRequest): string {
    return `Please generate a compliance assessment using the following case information:

CASE DETAILS:
- Worker Name: ${data.workerName}
- CoS Reference: ${data.cosReference}
- Assignment Date: ${data.assignmentDate}
- Job Title: ${data.jobTitle}
- SOC Code: ${data.socCode}
- Assessment Date: ${new Date().toLocaleDateString('en-GB')}

ROLE INFORMATION:
- CoS Stated Duties: "${data.cosDuties}"
- Job Description Duties: "${data.jobDescriptionDuties}"

DOCUMENTATION STATUS:
- Missing Documents: ${data.missingDocs.length > 0 ? data.missingDocs.join(', ') : 'All key documents provided'}
- Total Missing: ${data.missingDocs.length} documents

ASSESSMENT FINDINGS:
1. Employment History Consistency: ${data.employmentHistoryConsistent ? 'CONFIRMED - No gaps or discrepancies identified' : 'FAILED - Significant gaps or inconsistencies found'}
2. Experience/Duties Alignment: ${data.experienceMatchesDuties ? 'CONFIRMED - Experience aligns with role requirements' : 'FAILED - Experience does not match required duties'}
3. Reference Verification: ${data.referencesCredible ? 'CONFIRMED - References appear genuine and detailed' : 'FAILED - References lack credibility or detail'}
4. Experience Currency: ${data.experienceRecentAndContinuous ? 'CONFIRMED - Recent and continuous relevant experience' : 'FAILED - Extended gaps affecting skill currency'}

${data.inconsistenciesDescription ? `SPECIFIC CONCERNS IDENTIFIED:\n${data.inconsistenciesDescription}` : ''}

COMPLIANCE DETERMINATION REQUIRED:
Based on the above findings, determine whether this case is COMPLIANT or constitutes a SERIOUS BREACH of sponsor duties under Paragraph C1.38.

Generate the full assessment letter following the specified format and style guidelines.`;
  }

  private getFallbackNarrative(data: NarrativeRequest): string {
    const isCompliant = data.employmentHistoryConsistent && 
                       data.experienceMatchesDuties && 
                       data.referencesCredible && 
                       data.experienceRecentAndContinuous &&
                       data.missingDocs.length === 0;

    return `SKILLS AND EXPERIENCE COMPLIANCE ASSESSMENT

Worker: ${data.workerName}
CoS Reference: ${data.cosReference}
Role: ${data.jobTitle}
SOC Code: ${data.socCode}
Assignment Date: ${data.assignmentDate}

INTRODUCTION
This assessment evaluates whether the sponsored worker meets the skills, qualifications, and experience requirements stated in their Certificate of Sponsorship (CoS).

FINDINGS
${data.missingDocs.length > 0 
  ? `Missing Documents: ${data.missingDocs.join(', ')}. This undermines evidence of compliance.`
  : 'All required documents have been provided.'}

Employment History: ${data.employmentHistoryConsistent 
  ? 'The worker\'s employment history shows consistent progression.'
  : 'Significant gaps or inconsistencies found in employment history.'}

Experience Alignment: ${data.experienceMatchesDuties
  ? 'Previous experience aligns with the required duties.'
  : 'Experience does not adequately match the role requirements.'}

References: ${data.referencesCredible
  ? 'References appear credible and support the claimed experience.'
  : 'References lack credibility or necessary details.'}

Experience Currency: ${data.experienceRecentAndContinuous
  ? 'Experience is recent and continuous in the relevant field.'
  : 'Extended gaps raise concerns about current skill levels.'}

CONCLUSION
Based on the assessment, the worker is ${isCompliant ? 'COMPLIANT' : 'in SERIOUS BREACH'} of sponsor duties.

${!isCompliant ? 'Immediate remedial action is required to address these compliance issues.' : ''}

Generated: ${new Date().toISOString()}`;
  }
}

// Export a singleton instance
export const aiService = new SimpleAIService();