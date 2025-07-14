import { skillsExperienceSystemPrompt } from './prompts/skillsExperiencePrompt';

interface PromptContext {
  currentDate: string;
  socCode: string;
  roleTitle: string;
  salaryThreshold: number;
  sponsorLicenseType: 'A-rated' | 'B-rated';
  workerHistory?: {
    previousAssessments: number;
    complianceRate: number;
  };
}

interface PromptVersion {
  id: string;
  version: string;
  prompt: string;
  createdAt: Date;
  performance: {
    usageCount: number;
    avgProcessingTime: number;
    accuracyRate: number;
  };
}

class PromptManager {
  private promptVersions: Map<string, PromptVersion[]> = new Map();
  private activeVersions: Map<string, string> = new Map();

  constructor() {
    // Initialize with base prompt
    this.addPromptVersion('skills_experience', {
      id: 'v1.0',
      version: '1.0',
      prompt: skillsExperienceSystemPrompt,
      createdAt: new Date(),
      performance: {
        usageCount: 0,
        avgProcessingTime: 0,
        accuracyRate: 0
      }
    });
  }

  // Get enhanced prompt with context
  getEnhancedPrompt(
    promptType: string,
    context: PromptContext
  ): string {
    const basePrompt = this.getActivePrompt(promptType);
    
    // Inject context into prompt
    const enhancedPrompt = `
${basePrompt}

CURRENT CONTEXT:
- Assessment Date: ${context.currentDate}
- Role: ${context.roleTitle} (SOC: ${context.socCode})
- Minimum Salary Threshold: £${context.salaryThreshold.toLocaleString()}
- Sponsor License Type: ${context.sponsorLicenseType}
${context.workerHistory ? `
- Worker Assessment History:
  - Previous Assessments: ${context.workerHistory.previousAssessments}
  - Historical Compliance Rate: ${context.workerHistory.complianceRate}%
` : ''}

Use this context to ensure your assessment is current and accurate.
Pay special attention to:
1. Whether qualifications meet current requirements for SOC ${context.socCode}
2. Whether experience aligns with the ${context.roleTitle} role
3. Any red flags based on the worker's assessment history
`;

    return enhancedPrompt;
  }

  // Get prompt for specific document type
  getDocumentSpecificPrompt(
    documentType: 'cv' | 'certificate' | 'reference' | 'interview'
  ): string {
    const prompts = {
      cv: `
Focus on extracting and validating:
- Employment history with clear dates and progression
- Educational qualifications and certifications
- Skills relevant to the role
- Any gaps in employment
- Consistency in career narrative
`,
      certificate: `
Verify the following for certificates:
- Issuing institution legitimacy
- Date of issue and expiry (if applicable)
- Relevance to the role requirements
- Authentication markers or reference numbers
- Whether it meets UK recognition standards
`,
      reference: `
Assess references for:
- Referee credibility and contact information
- Specific examples of skills and experience
- Employment dates confirmation
- Performance indicators
- Any concerns or reservations expressed
`,
      interview: `
Evaluate interview documentation for:
- Questions alignment with role requirements
- Depth and specificity of responses
- Evidence of claimed skills/experience
- Consistency with CV claims
- Any red flags or concerns noted by interviewer
`
    };

    return this.getActivePrompt('skills_experience') + prompts[documentType];
  }

  // Add new prompt version
  addPromptVersion(promptType: string, version: PromptVersion): void {
    if (!this.promptVersions.has(promptType)) {
      this.promptVersions.set(promptType, []);
    }
    
    this.promptVersions.get(promptType)!.push(version);
    
    // Set as active if it's the first version
    if (!this.activeVersions.has(promptType)) {
      this.activeVersions.set(promptType, version.id);
    }
  }

  // Get active prompt
  private getActivePrompt(promptType: string): string {
    const activeId = this.activeVersions.get(promptType);
    const versions = this.promptVersions.get(promptType) || [];
    const activeVersion = versions.find(v => v.id === activeId);
    
    return activeVersion?.prompt || skillsExperienceSystemPrompt;
  }

  // A/B test prompts
  getABTestPrompt(promptType: string, testPercentage: number = 0.1): string {
    const versions = this.promptVersions.get(promptType) || [];
    
    if (versions.length <= 1 || Math.random() > testPercentage) {
      return this.getActivePrompt(promptType);
    }
    
    // Return a random non-active version for testing
    const activeId = this.activeVersions.get(promptType);
    const testVersions = versions.filter(v => v.id !== activeId);
    const testVersion = testVersions[Math.floor(Math.random() * testVersions.length)];
    
    // Log for analytics
    this.logPromptUsage(promptType, testVersion.id, true);
    
    return testVersion.prompt;
  }

  // Track prompt performance
  trackPromptPerformance(
    promptType: string,
    versionId: string,
    processingTime: number,
    wasAccurate: boolean
  ): void {
    const versions = this.promptVersions.get(promptType) || [];
    const version = versions.find(v => v.id === versionId);
    
    if (version) {
      const perf = version.performance;
      const newCount = perf.usageCount + 1;
      
      // Update rolling averages
      perf.avgProcessingTime = 
        (perf.avgProcessingTime * perf.usageCount + processingTime) / newCount;
      
      perf.accuracyRate = 
        (perf.accuracyRate * perf.usageCount + (wasAccurate ? 1 : 0)) / newCount;
      
      perf.usageCount = newCount;
    }
  }

  // Log prompt usage
  private logPromptUsage(
    promptType: string,
    versionId: string,
    isABTest: boolean
  ): void {
    console.log('Prompt usage:', {
      promptType,
      versionId,
      isABTest,
      timestamp: new Date().toISOString()
    });
  }

  // Get prompt performance report
  getPerformanceReport(promptType: string): any {
    const versions = this.promptVersions.get(promptType) || [];
    
    return versions.map(v => ({
      id: v.id,
      version: v.version,
      performance: v.performance,
      isActive: this.activeVersions.get(promptType) === v.id
    }));
  }

  // Optimize prompt based on performance
  optimizePrompt(promptType: string): void {
    const versions = this.promptVersions.get(promptType) || [];
    
    if (versions.length > 1) {
      // Find best performing version
      const bestVersion = versions.reduce((best, current) => {
        const bestScore = best.performance.accuracyRate - 
          (best.performance.avgProcessingTime / 10000);
        const currentScore = current.performance.accuracyRate - 
          (current.performance.avgProcessingTime / 10000);
        
        return currentScore > bestScore ? current : best;
      });
      
      // Set as active if significantly better
      const activeId = this.activeVersions.get(promptType);
      const activeVersion = versions.find(v => v.id === activeId);
      
      if (activeVersion && bestVersion.id !== activeId) {
        const improvement = 
          (bestVersion.performance.accuracyRate - 
           activeVersion.performance.accuracyRate) * 100;
        
        if (improvement > 5) { // 5% improvement threshold
          this.activeVersions.set(promptType, bestVersion.id);
          console.log(`Switched to better performing prompt: ${bestVersion.id}`);
        }
      }
    }
  }
}

export const promptManager = new PromptManager(); 