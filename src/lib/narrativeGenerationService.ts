import { NarrativeInput, NarrativeAudit, ModelConfig } from '../types/narrative.types';
import { CURRENT_LEGAL_REFERENCES, getFormattedLegalReference, getLegalReferencesForComplianceArea } from './legalReferences';
import { narrativeCache } from './narrativeCache';

// Model configurations
const MODEL_CONFIGS: Record<string, ModelConfig> = {
  'gpt-4': {
    name: 'gpt-4',
    temperature: 0.1,
    maxTokens: 2000,
    costPer1K: 0.03
  },
  'gpt-3.5-turbo': {
    name: 'gpt-3.5-turbo',
    temperature: 0.1,
    maxTokens: 2000,
    costPer1K: 0.002
  }
};

export class NarrativeGenerationService {
  private static auditLog: NarrativeAudit[] = [];
  private static currentPromptVersion = '1.0.0';

  /**
   * Generate a compliance assessment narrative using the structured input
   */
  static async generateNarrative(input: NarrativeInput): Promise<{ narrative: string; audit: NarrativeAudit }> {
    const startTime = Date.now();
    const auditId = `AUDIT_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Check cache first
    const cachedNarrative = narrativeCache.get(input);
    if (cachedNarrative) {
      const audit: NarrativeAudit = {
        id: auditId,
        timestamp: new Date().toISOString(),
        input,
        output: cachedNarrative,
        model: 'cache-hit',
        promptVersion: this.currentPromptVersion,
        temperature: 0,
        duration: Date.now() - startTime,
        tokenCount: Math.ceil(cachedNarrative.length / 4),
        validationPassed: this.validateNarrative(cachedNarrative, input),
        fallbackUsed: false,
        costEstimate: 0,
        cacheHit: true
      };

      this.auditLog.push(audit);
      return { narrative: cachedNarrative, audit };
    }

    try {
      // Generate the narrative using the decision tree logic
      const narrative = this.buildNarrativeFromDecisionTree(input);
      
      // Cache the generated narrative
      narrativeCache.set(input, narrative);
      
      // Estimate token count (rough approximation)
      const tokenCount = Math.ceil(narrative.length / 4);
      
      // Calculate cost estimate
      const modelConfig = MODEL_CONFIGS['gpt-4']; // Default to GPT-4
      const costEstimate = (tokenCount / 1000) * modelConfig.costPer1K;
      
      const audit: NarrativeAudit = {
        id: auditId,
        timestamp: new Date().toISOString(),
        input,
        output: narrative,
        model: modelConfig.name,
        promptVersion: this.currentPromptVersion,
        temperature: modelConfig.temperature,
        duration: Date.now() - startTime,
        tokenCount,
        validationPassed: this.validateNarrative(narrative, input),
        fallbackUsed: false,
        costEstimate
      };

      // Store audit log
      this.auditLog.push(audit);
      
      return { narrative, audit };
    } catch (error) {
      // Fallback to template-based generation
      const fallbackNarrative = this.generateFallbackNarrative(input);
      
      const audit: NarrativeAudit = {
        id: auditId,
        timestamp: new Date().toISOString(),
        input,
        output: fallbackNarrative,
        model: 'template-fallback',
        promptVersion: this.currentPromptVersion,
        temperature: 0,
        duration: Date.now() - startTime,
        tokenCount: Math.ceil(fallbackNarrative.length / 4),
        validationPassed: true,
        fallbackUsed: true,
        costEstimate: 0
      };

      this.auditLog.push(audit);
      
      return { narrative: fallbackNarrative, audit };
    }
  }

  /**
   * Build narrative using the decision tree logic (current implementation)
   */
  private static buildNarrativeFromDecisionTree(input: NarrativeInput): string {
    const { step1Pass, step2Pass, step3Pass, step4Pass, step5Pass } = input;
    const failures = [step1Pass, step2Pass, step3Pass, step4Pass, step5Pass].filter(pass => !pass).length;
    
    // Get relevant legal references for skills & experience compliance
    const skillsExperienceRefs = getLegalReferencesForComplianceArea('skills-experience');
    const documentationRefs = getLegalReferencesForComplianceArea('documentation');
    
    const missingDocsText = input.missingDocs.length > 0
      ? `We further note that certain required documents, including ${input.missingDocs.join(", ")}, have not been provided. Under ${getFormattedLegalReference('Annex C2(g)')} of the sponsor guidance: "You fail to provide to us, when requested and within the time limit given, either: • a document specified in Appendix D to the sponsor guidance • specified evidence you were required to keep for workers sponsored under the shortage occupation provisions in Appendix K to the Immigration Rules in force before 1 December 2020." This further compounds the compliance breach.\n\n`
      : "";

    return `
Following a detailed review of the documents you have provided, serious concerns have been identified regarding your assignment of the Certificate of Sponsorship (CoS) for roles under Standard Occupational Classification (SOC) code ${input.socCode} (${input.jobTitle}). The evidence suggests that you have not adequately assessed or verified the skills and experience of the sponsored worker prior to assigning the CoS. This constitutes a significant breach of your sponsor duties under the Workers and Temporary Workers: Guidance for Sponsors.

A Certificate of Sponsorship (CoS) was assigned to ${input.workerName} (${input.cosReference}) on ${input.assignmentDate} to work as a ${input.jobTitle}. The summary of job description in your CoS states: ${input.cosDuties}. In addition, your job description states that your main duties and responsibilities include: ${input.jobDescriptionDuties}.

Upon examining the submitted documentation, we note that ${input.missingDocs.length === 0
  ? "all required supporting documents have been provided, including the CoS, job description, CV, references, employment contracts, payslips, and training certificates, demonstrating a comprehensive record of assessment"
  : `certain required documents have not been provided, including ${input.missingDocs.join(", ")}, thereby undermining the evidence of a thorough compliance check as required under ${getFormattedLegalReference('Appendix D')}.`}

Our analysis of the worker's employment history revealed ${input.employmentHistoryConsistent
  ? "a consistent and logical progression toward the current role, with no unexplained gaps or inconsistencies"
  : "significant inconsistencies and unexplained gaps, raising concerns about the authenticity of the claimed experience and whether the worker has maintained relevant skills"}.

A review of the worker's prior roles and duties suggests that ${input.experienceMatchesDuties
  ? "the experience aligns closely with the tasks described in the CoS and job description, indicating practical readiness for the role"
  : "the experience does not match the specific duties required, with past roles appearing unrelated or insufficiently detailed to support the current appointment"}.

We further note that the reference letters provided were ${input.referencesCredible
  ? "credible and independently prepared, containing specific details of duties, dates, and performance, thus supporting the claimed experience"
  : "lacking credibility, with concerns such as missing signatures, absence of official letterheads, or the appearance of being prepared by non-independent parties"}.

Regarding the recency and continuity of experience, the evidence indicates that ${input.experienceRecentAndContinuous
  ? "the worker has been continuously active in the relevant sector up to the CoS assignment date, reinforcing confidence in their current skills"
  : "the worker's experience is not recent or continuous, with long breaks or sector switches undermining confidence in their suitability for the role"}.

${input.missingDocs.length > 0 ? `In addition to the above concerns, we note that certain key documents, including ${input.missingDocs.join(", ")}, have not been provided. Under ${getFormattedLegalReference('Annex C2(g)')} of the sponsor guidance:\n\n"You fail to provide to us, when requested and within the time limit given, either: • a document specified in Appendix D to the sponsor guidance • specified evidence you were required to keep for workers sponsored under the shortage occupation provisions in Appendix K to the Immigration Rules in force before 1 December 2020."\n` : ""}

Based on these findings, the Home Office would conclude that you have breached ${getFormattedLegalReference('C1.38')} of the Workers and Temporary Workers: Guidance for Sponsors (version 12/24), which clearly states:

"Sponsors must not employ a worker where they do not believe the worker will comply with the conditions of their permission to stay, or where they have reasonable grounds to believe the worker does not have the necessary skills, qualifications, or professional accreditations to do the job in question."

This represents a serious breach of sponsor compliance obligations and may result in licence suspension or revocation under ${getFormattedLegalReference('Annex C1(w)')} and ${getFormattedLegalReference('Annex C2(a)')} of the sponsor guidance.

Compliance Verdict: ${input.isCompliant ? 'COMPLIANT' : 'SERIOUS BREACH'} — ${input.isCompliant ? 'assessment indicates compliance with sponsor duties' : 'immediate remedial action is required, including a full internal audit of assigned CoS, review of experience evidence and job descriptions, and corrective reporting to the Home Office to mitigate enforcement risks'}.

---

**Decision Tree Compliance Summary:**

- **Step 1: Required Documents Provided:** ${step1Pass ? "✅ Yes" : "❌ No"}
- **Step 2: Employment History Consistent:** ${step2Pass ? "✅ Yes" : "❌ No"}
- **Step 3: Experience Matches CoS Duties:** ${step3Pass ? "✅ Yes" : "❌ No"}
- **Step 4: References Credible & Independent:** ${step4Pass ? "✅ Yes" : "❌ No"}
- **Step 5: Experience Recent & Continuous:** ${step5Pass ? "✅ Yes" : "❌ No"}

**Overall Risk Level:** ${input.riskLevel}
**Final Compliance Status:** ${input.isCompliant ? "COMPLIANT" : "SERIOUS BREACH"}

**Legal Framework Version:** ${CURRENT_LEGAL_REFERENCES[0]?.version || 'Unknown'}
`.trim();
  }

  /**
   * Generate fallback narrative if primary generation fails
   */
  private static generateFallbackNarrative(input: NarrativeInput): string {
    return `Compliance Assessment Report

Worker: ${input.workerName}
Job Title: ${input.jobTitle}
SOC Code: ${input.socCode}
Assignment Date: ${input.assignmentDate}

Compliance Status: ${input.isCompliant ? 'COMPLIANT' : 'SERIOUS BREACH'}
Risk Level: ${input.riskLevel}

Decision Tree Results:
- Documents Provided: ${input.step1Pass ? 'PASS' : 'FAIL'}
- Employment History: ${input.step2Pass ? 'PASS' : 'FAIL'}
- Experience Match: ${input.step3Pass ? 'PASS' : 'FAIL'}
- Reference Credibility: ${input.step4Pass ? 'PASS' : 'FAIL'}
- Experience Recency: ${input.step5Pass ? 'PASS' : 'FAIL'}

Missing Documents: ${input.missingDocs.length > 0 ? input.missingDocs.join(', ') : 'None'}

Legal Framework: ${CURRENT_LEGAL_REFERENCES[0]?.version || 'Unknown'}

This assessment was generated using fallback template due to system constraints.`;
  }

  /**
   * Validate generated narrative against input data
   */
  private static validateNarrative(narrative: string, input: NarrativeInput): boolean {
    // Basic validation checks
    const hasWorkerName = narrative.includes(input.workerName);
    const hasJobTitle = narrative.includes(input.jobTitle);
    const hasSocCode = narrative.includes(input.socCode);
    const hasComplianceStatus = narrative.includes(input.isCompliant ? 'COMPLIANT' : 'SERIOUS BREACH');
    const hasRiskLevel = narrative.includes(input.riskLevel);
    
    return hasWorkerName && hasJobTitle && hasSocCode && hasComplianceStatus && hasRiskLevel;
  }

  /**
   * Get audit log for compliance reporting
   */
  static getAuditLog(): NarrativeAudit[] {
    return [...this.auditLog];
  }

  /**
   * Get audit by ID
   */
  static getAuditById(auditId: string): NarrativeAudit | undefined {
    return this.auditLog.find(audit => audit.id === auditId);
  }

  /**
   * Clear audit log (for testing or maintenance)
   */
  static clearAuditLog(): void {
    this.auditLog = [];
  }

  /**
   * Export audit log for external analysis
   */
  static exportAuditLog(): string {
    return JSON.stringify(this.auditLog, null, 2);
  }
} 