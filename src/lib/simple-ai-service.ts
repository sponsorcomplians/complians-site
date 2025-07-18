// Simple AI Service for Narrative Generation
// No complex authentication, just straightforward AI integration

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
    return `You are a Senior Immigration Solicitor and UK sponsor compliance specialist analyzing sponsor compliance with Home Office guidance.

Generate a professional compliance assessment letter following this format:

SKILLS AND EXPERIENCE COMPLIANCE ASSESSMENT

Worker: [Worker Name]
CoS Reference: [CoS Reference]
Role: [Job Title]
SOC Code: [SOC Code]
Assignment Date: [Date]

INTRODUCTION
This assessment evaluates whether the sponsored worker meets the skills, qualifications, and experience requirements stated in their Certificate of Sponsorship (CoS).

FINDINGS
[Analyze the provided information systematically]

CONCLUSION
Based on the evidence, determine if the worker is COMPLIANT or in SERIOUS BREACH.

Use formal British legal English. Be specific about any issues found.`;
  }

  private buildPrompt(data: NarrativeRequest): string {
    return `Generate a compliance assessment for:

Worker: ${data.workerName}
CoS Reference: ${data.cosReference}
Assignment Date: ${data.assignmentDate}
Job Title: ${data.jobTitle}
SOC Code: ${data.socCode}

CoS Duties: ${data.cosDuties}
Job Description Duties: ${data.jobDescriptionDuties}

Missing Documents: ${data.missingDocs.length > 0 ? data.missingDocs.join(', ') : 'None'}

Assessment Results:
- Employment History Consistent: ${data.employmentHistoryConsistent ? 'Yes' : 'No'}
- Experience Matches Duties: ${data.experienceMatchesDuties ? 'Yes' : 'No'}
- References Credible: ${data.referencesCredible ? 'Yes' : 'No'}
- Experience Recent and Continuous: ${data.experienceRecentAndContinuous ? 'Yes' : 'No'}

${data.inconsistenciesDescription ? `Inconsistencies: ${data.inconsistenciesDescription}` : ''}

Generate a professional compliance assessment letter based on this information.`;
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