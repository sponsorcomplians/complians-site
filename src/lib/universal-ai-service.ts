// Universal AI Service for All Compliance Agents
// Extends the simple-ai-service pattern to support all agent types

import { getStyleConfiguration } from './ai-style-config';

interface UniversalNarrativeRequest {
  agentType: string;
  workerName: string;
  jobTitle: string;
  socCode?: string;
  cosReference?: string;
  assignmentDate?: string;
  assessmentData: Record<string, any>;
}

// Agent-specific prompts
const AGENT_PROMPTS: Record<string, string> = {
  'ai-salary-compliance': `
You are assessing salary compliance for UK sponsor licence holders. Write in plain, clear British English.

Evaluate whether the sponsored worker's salary meets Home Office requirements:
- Going rate for the SOC code
- General threshold (currently £26,200 or £10.75/hour)
- Any applicable exemptions or reductions

Generate a compliance assessment as flowing paragraphs without numbered sections or bullet points.
`,

  'ai-qualification-compliance': `
You are assessing qualification compliance for UK sponsor licence holders. Write in plain, clear British English.

Evaluate whether the worker has the required qualifications:
- Academic qualifications matching SOC code requirements
- Professional registrations where required
- Authenticity of provided certificates
- Equivalency of international qualifications

Generate a compliance assessment as flowing paragraphs without numbered sections or bullet points.
`,

  'ai-right-to-work-compliance': `
You are assessing right to work compliance for UK sponsor licence holders. Write in plain, clear British English.

Evaluate the worker's immigration status and right to work:
- Current visa validity
- Work restrictions or conditions
- Expiry dates and renewal requirements
- Document verification status

Generate a compliance assessment as flowing paragraphs without numbered sections or bullet points.
`,

  'ai-document-compliance': `
You are assessing document compliance for UK sponsor licence holders. Write in plain, clear British English.

Evaluate whether all required documents are present and valid:
- Passport and visa documents
- Educational certificates
- Employment references
- Professional registrations
- Missing or expired documents

Generate a compliance assessment as flowing paragraphs without numbered sections or bullet points.
`,

  'ai-record-keeping-compliance': `
You are assessing record keeping compliance for UK sponsor licence holders. Write in plain, clear British English.

Evaluate sponsor's record keeping practices:
- Completeness of worker records
- Document retention compliance
- Accessibility for Home Office audits
- Data protection compliance

Generate a compliance assessment as flowing paragraphs without numbered sections or bullet points.
`,

  'ai-reporting-duties-compliance': `
You are assessing reporting duties compliance for UK sponsor licence holders. Write in plain, clear British English.

Evaluate compliance with sponsor reporting obligations:
- Timely reporting of changes
- Accuracy of reported information
- Missed reporting deadlines
- Pattern of compliance

Generate a compliance assessment as flowing paragraphs without numbered sections or bullet points.
`,

  'ai-third-party-labour-compliance': `
You are assessing third-party labour compliance for UK sponsor licence holders. Write in plain, clear British English.

Evaluate compliance with restrictions on third-party work:
- Direct employment verification
- Absence of labour supply arrangements
- Control and supervision confirmation
- Contract structure compliance

Generate a compliance assessment as flowing paragraphs without numbered sections or bullet points.
`,

  'ai-immigration-status-monitoring-compliance': `
You are assessing immigration status monitoring compliance for UK sponsor licence holders. Write in plain, clear British English.

Evaluate how well the sponsor monitors worker immigration status:
- Visa expiry tracking systems
- Status change awareness
- Proactive renewal reminders
- Compliance with monitoring duties

Generate a compliance assessment as flowing paragraphs without numbered sections or bullet points.
`,

  'ai-migrant-contact-maintenance-compliance': `
You are assessing migrant contact maintenance compliance for UK sponsor licence holders. Write in plain, clear British English.

Evaluate sponsor's contact maintenance with sponsored workers:
- Current contact details on file
- Regular contact verification
- Emergency contact information
- Absence and leave tracking

Generate a compliance assessment as flowing paragraphs without numbered sections or bullet points.
`,

  'ai-migrant-tracking-compliance': `
You are assessing migrant tracking compliance for UK sponsor licence holders. Write in plain, clear British English.

Evaluate sponsor's tracking of sponsored workers:
- Attendance monitoring systems
- Absence reporting procedures
- Unauthorised absence detection
- Location tracking where required

Generate a compliance assessment as flowing paragraphs without numbered sections or bullet points.
`,

  'ai-contracted-hours-compliance': `
You are assessing contracted hours compliance for UK sponsor licence holders. Write in plain, clear British English.

Evaluate whether workers are meeting contracted hours requirements:
- Actual vs contracted hours
- Pattern of under/over working
- Authorised variations
- Impact on visa compliance

Generate a compliance assessment as flowing paragraphs without numbered sections or bullet points.
`,

  'ai-genuine-vacancies-compliance': `
You are assessing genuine vacancy compliance for UK sponsor licence holders. Write in plain, clear British English.

Evaluate whether the sponsored role represents a genuine vacancy:
- Business need evidence
- Job role authenticity
- Recruitment process legitimacy
- Role continuation likelihood

Generate a compliance assessment as flowing paragraphs without numbered sections or bullet points.
`,

  'ai-paragraph-c7-26-compliance': `
You are assessing Paragraph C7-26 compliance for UK sponsor licence holders. Write in plain, clear British English.

Evaluate compliance with employment duration requirements:
- 12-month employment rule
- Justification for shorter contracts
- Role permanency evidence
- Contract renewal patterns

Generate a compliance assessment as flowing paragraphs without numbered sections or bullet points.
`,

  'ai-recruitment-practices-compliance': `
You are assessing recruitment practices compliance for UK sponsor licence holders. Write in plain, clear British English.

Evaluate the sponsor's recruitment practices:
- Resident Labour Market Test compliance
- Fair recruitment processes
- Non-discrimination evidence
- Genuine recruitment efforts

Generate a compliance assessment as flowing paragraphs without numbered sections or bullet points.
`
};

export class UniversalAIService {
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY || '';
  }

  async generateNarrative(data: UniversalNarrativeRequest): Promise<string> {
    // If no API key, return a clear message
    if (!this.apiKey) {
      console.log('[UniversalAIService] No OpenAI API key configured');
      return this.getFallbackNarrative(data);
    }

    try {
      console.log('[UniversalAIService] Generating AI narrative for:', data.agentType);
      
      const systemPrompt = this.getSystemPrompt(data.agentType);
      const userPrompt = this.buildPrompt(data);
      
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
              content: systemPrompt
            },
            {
              role: 'user',
              content: userPrompt
            }
          ],
          temperature: 0.3,
          max_tokens: 3000
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error('[UniversalAIService] OpenAI API error:', error);
        return this.getFallbackNarrative(data);
      }

      const result = await response.json();
      const narrative = result.choices[0]?.message?.content;

      if (!narrative) {
        console.error('[UniversalAIService] No narrative in response');
        return this.getFallbackNarrative(data);
      }

      console.log('[UniversalAIService] AI narrative generated successfully');
      return narrative;

    } catch (error) {
      console.error('[UniversalAIService] Error generating narrative:', error);
      return this.getFallbackNarrative(data);
    }
  }

  private getSystemPrompt(agentType: string): string {
    const basePrompt = AGENT_PROMPTS[agentType] || AGENT_PROMPTS['ai-document-compliance'];
    const styleConfig = getStyleConfiguration();
    
    return `${basePrompt}\n\n${styleConfig}`;
  }

  private buildPrompt(data: UniversalNarrativeRequest): string {
    const { workerName, jobTitle, socCode, cosReference, assignmentDate, assessmentData } = data;
    
    let prompt = `Please generate a compliance assessment using the following information:\n\n`;
    prompt += `WORKER DETAILS:\n`;
    prompt += `- Worker Name: ${workerName}\n`;
    prompt += `- Job Title: ${jobTitle}\n`;
    if (socCode) prompt += `- SOC Code: ${socCode}\n`;
    if (cosReference) prompt += `- CoS Reference: ${cosReference}\n`;
    if (assignmentDate) prompt += `- Assignment Date: ${assignmentDate}\n`;
    prompt += `- Assessment Date: ${new Date().toLocaleDateString('en-GB')}\n\n`;
    
    prompt += `ASSESSMENT DATA:\n`;
    Object.entries(assessmentData).forEach(([key, value]) => {
      const formattedKey = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      prompt += `- ${formattedKey}: ${value}\n`;
    });
    
    prompt += `\nGenerate a comprehensive compliance assessment based on this information.`;
    
    return prompt;
  }

  private getFallbackNarrative(data: UniversalNarrativeRequest): string {
    const { agentType, workerName, jobTitle, socCode, assessmentData } = data;
    const agentName = agentType.replace(/ai-|-compliance/g, '').replace(/-/g, ' ')
      .split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    
    return `${agentName.toUpperCase()} COMPLIANCE ASSESSMENT

Worker: ${workerName}
Job Title: ${jobTitle}
${socCode ? `SOC Code: ${socCode}` : ''}
Assessment Date: ${new Date().toLocaleDateString('en-GB')}

ASSESSMENT SUMMARY
This is a template-based assessment generated due to AI service unavailability. The assessment data indicates:

${Object.entries(assessmentData).map(([key, value]) => {
  const formattedKey = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  return `${formattedKey}: ${value}`;
}).join('\n')}

COMPLIANCE STATUS
Based on the available data, a full compliance assessment requires AI service availability. Please ensure the OpenAI API key is configured in your environment variables.

Generated: ${new Date().toISOString()}`;
  }
}

// Export a singleton instance
export const universalAIService = new UniversalAIService();