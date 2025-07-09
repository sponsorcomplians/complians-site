import { NarrativeInput, NarrativeAudit, ModelConfig } from '../types/narrative.types';
import { CURRENT_LEGAL_REFERENCES, getFormattedLegalReference, getLegalReferencesForComplianceArea } from './legalReferences';
import { narrativeCache } from './narrativeCache';
import { narrativeValidator } from './narrativeValidation';
import { narrativeMetrics } from './narrativeMetrics';
import { generateAINarrative } from './aiNarrativeService';
import { getTenantAIConfig, generateAIPrompt, applyTenantAISettings } from './multi-tenant-service';
import { skillsExperienceSystemPrompt } from './prompts/skillsExperiencePrompt';

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
   * Check if AI generation should be used based on experiment configuration
   */
  static shouldUseAI(experimentName?: string): boolean {
    return narrativeMetrics.shouldUseAI(experimentName);
  }

  /**
   * Generate a compliance assessment narrative using the structured input
   */
  static async generateNarrative(input: NarrativeInput): Promise<{ narrative: string; audit: NarrativeAudit }> {
    const startTime = Date.now();
    const auditId = `AUDIT_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Get tenant AI configuration
    const tenantAIConfig = await getTenantAIConfig();
    
    // Apply tenant AI settings to input data
    const adjustedInput = applyTenantAISettings(input, tenantAIConfig);

    // Check cache first (using original input for cache key)
    const cachedNarrative = narrativeCache.get(input);
    if (cachedNarrative) {
      // Validate cached narrative
      const validation = narrativeValidator.validate(cachedNarrative, adjustedInput);
      
      const audit: NarrativeAudit = {
        id: auditId,
        timestamp: new Date().toISOString(),
        input: adjustedInput,
        output: cachedNarrative,
        model: 'cache-hit',
        promptVersion: this.currentPromptVersion,
        temperature: 0,
        duration: Date.now() - startTime,
        tokenCount: Math.ceil(cachedNarrative.length / 4),
        validationPassed: validation.isValid,
        fallbackUsed: false,
        costEstimate: 0,
        cacheHit: true,
        validationScore: validation.score,
        validationErrors: validation.errors,
        validationWarnings: validation.warnings,
        tenantAIConfig: tenantAIConfig
      };

      this.auditLog.push(audit);
      
      // Log metrics
      await narrativeMetrics.logGeneration(audit);
      
      return { narrative: cachedNarrative, audit };
    }

    // Try AI generation first if enabled
    if (this.shouldUseAI()) {
      try {
        // Generate tenant-specific AI prompt
        const basePrompt = this.generateBasePrompt(adjustedInput);
        const tenantPrompt = generateAIPrompt(basePrompt, adjustedInput, tenantAIConfig);
        
        const aiNarrative = await generateAINarrative(adjustedInput, tenantPrompt);
        
        const audit: NarrativeAudit = {
          id: auditId,
          timestamp: new Date().toISOString(),
          input: adjustedInput,
          output: aiNarrative,
          model: 'ai-generated',
          promptVersion: this.currentPromptVersion,
          temperature: 0.3,
          duration: Date.now() - startTime,
          tokenCount: Math.ceil(aiNarrative.length / 4),
          validationPassed: true,
          fallbackUsed: false,
          costEstimate: (Math.ceil(aiNarrative.length / 4) / 1000) * 0.01,
          tenantAIConfig: tenantAIConfig,
          customPrompt: tenantPrompt
        };

        // Store audit log
        this.auditLog.push(audit);
        
        // Log metrics
        await narrativeMetrics.logGeneration(audit);
        
        return { narrative: aiNarrative, audit };
      } catch (error) {
        console.error('AI generation failed, falling back to template:', error);
        // Continue to fallback generation
      }
    }

    try {
      // Generate the narrative using the decision tree logic with tenant settings
      const narrative = this.buildNarrativeFromDecisionTree(adjustedInput, tenantAIConfig);
      
      // Cache the generated narrative
      narrativeCache.set(input, narrative);
      
      // Validate the generated narrative
      const validation = narrativeValidator.validate(narrative, adjustedInput);
      
      // Estimate token count (rough approximation)
      const tokenCount = Math.ceil(narrative.length / 4);
      
      // Calculate cost estimate
      const modelConfig = MODEL_CONFIGS['gpt-4']; // Default to GPT-4
      const costEstimate = (tokenCount / 1000) * modelConfig.costPer1K;
      
      const audit: NarrativeAudit = {
        id: auditId,
        timestamp: new Date().toISOString(),
        input: adjustedInput,
        output: narrative,
        model: modelConfig.name,
        promptVersion: this.currentPromptVersion,
        temperature: modelConfig.temperature,
        duration: Date.now() - startTime,
        tokenCount,
        validationPassed: validation.isValid,
        fallbackUsed: false,
        costEstimate,
        validationScore: validation.score,
        validationErrors: validation.errors,
        validationWarnings: validation.warnings,
        tenantAIConfig: tenantAIConfig
      };

      // Store audit log
      this.auditLog.push(audit);
      
      // Log metrics
      await narrativeMetrics.logGeneration(audit);
      
      return { narrative, audit };
    } catch (error) {
      // Fallback to template-based generation
      const fallbackNarrative = this.generateFallbackNarrative(adjustedInput, tenantAIConfig);
      
      // Validate fallback narrative
      const validation = narrativeValidator.validate(fallbackNarrative, adjustedInput);
      
      const audit: NarrativeAudit = {
        id: auditId,
        timestamp: new Date().toISOString(),
        input: adjustedInput,
        output: fallbackNarrative,
        model: 'template-fallback',
        promptVersion: this.currentPromptVersion,
        temperature: 0,
        duration: Date.now() - startTime,
        tokenCount: Math.ceil(fallbackNarrative.length / 4),
        validationPassed: validation.isValid,
        fallbackUsed: true,
        costEstimate: 0,
        validationScore: validation.score,
        validationErrors: validation.errors,
        validationWarnings: validation.warnings,
        tenantAIConfig: tenantAIConfig
      };

      this.auditLog.push(audit);
      
      // Log metrics
      await narrativeMetrics.logGeneration(audit);
      
      return { narrative: fallbackNarrative, audit };
    }
  }

  /**
   * Generate base prompt for AI generation
   */
  private static generateBasePrompt(input: NarrativeInput): string {
    // Use the custom system prompt for Skills & Experience Compliance
    if (
      input.agentType === 'skills-experience' ||
      input.agentType === 'ai-skills-experience-compliance'
    ) {
      return skillsExperienceSystemPrompt.trim();
    }
    const { step1Pass, step2Pass, step3Pass, step4Pass, step5Pass } = input;
    const failures = [step1Pass, step2Pass, step3Pass, step4Pass, step5Pass].filter(pass => !pass).length;
    return `
Generate a comprehensive compliance assessment narrative for a sponsored worker under SOC code ${input.socCode} (${input.jobTitle}).

Assessment Details:
- Worker Name: ${input.workerName}
- Job Title: ${input.jobTitle}
- SOC Code: ${input.socCode}
- Assessment Steps Passed: ${[step1Pass, step2Pass, step3Pass, step4Pass, step5Pass].filter(pass => pass).length}/5
- Missing Documents: ${input.missingDocs.join(', ') || 'None'}
- Evidence Status: ${input.evidenceStatus}
- Breach Type: ${input.breachType || 'N/A'}

The narrative should be professional, detailed, and reference relevant UK immigration compliance requirements.
    `.trim();
  }

  /**
   * Build narrative using the decision tree logic with tenant settings
   */
  private static buildNarrativeFromDecisionTree(input: NarrativeInput, tenantAIConfig: any): string {
    const { step1Pass, step2Pass, step3Pass, step4Pass, step5Pass } = input;
    const failures = [step1Pass, step2Pass, step3Pass, step4Pass, step5Pass].filter(pass => !pass).length;
    
    // Get relevant legal references for skills & experience compliance
    const skillsExperienceRefs = getLegalReferencesForComplianceArea('skills-experience');
    const documentationRefs = getLegalReferencesForComplianceArea('documentation');
    
    // Apply tenant-specific tone and style
    const tone = this.getToneBasedOnSettings(tenantAIConfig.ai_tone);
    const style = this.getStyleBasedOnSettings(tenantAIConfig.narrative_style);
    
    const missingDocsText = input.missingDocs.length > 0
      ? `We further note that certain required documents, including ${input.missingDocs.join(", ")}, have not been provided. Under ${getFormattedLegalReference('Annex C2(g)')} of the sponsor guidance: "You fail to provide to us, when requested and within the time limit given, either: • a document specified in Appendix D to the sponsor guidance • specified evidence you were required to keep for workers sponsored under the shortage occupation provisions in Appendix K to the Immigration Rules in force before 1 December 2020." This further compounds the compliance breach.\n\n`
      : "";

    return `
Following a detailed review of the documents you have provided, ${tone.concernLevel} concerns have been identified regarding your assignment of the Certificate of Sponsorship (CoS) for roles under Standard Occupational Classification (SOC) code ${input.socCode} (${input.jobTitle}). ${style.evidenceDescription} The evidence suggests that you have not adequately assessed or verified the skills and experience of the sponsored worker prior to assigning the CoS. This constitutes a ${tone.breachSeverity} breach of your sponsor duties under the Workers and Temporary Workers: Guidance for Sponsors.

${missingDocsText}

${this.generateDetailedAssessment(input, tenantAIConfig)}
    `.trim();
  }

  /**
   * Get tone-specific language based on tenant settings
   */
  private static getToneBasedOnSettings(aiTone: string = 'strict') {
    switch (aiTone) {
      case 'strict':
        return {
          concernLevel: 'serious',
          breachSeverity: 'significant',
          language: 'authoritative and firm'
        };
      case 'moderate':
        return {
          concernLevel: 'notable',
          breachSeverity: 'moderate',
          language: 'balanced and professional'
        };
      case 'lenient':
        return {
          concernLevel: 'some',
          breachSeverity: 'potential',
          language: 'supportive and educational'
        };
      default:
        return {
          concernLevel: 'serious',
          breachSeverity: 'significant',
          language: 'professional'
        };
    }
  }

  /**
   * Get style-specific language based on tenant settings
   */
  private static getStyleBasedOnSettings(narrativeStyle: string = 'formal') {
    switch (narrativeStyle) {
      case 'formal':
        return {
          evidenceDescription: 'The evidence presented demonstrates significant deficiencies in compliance verification processes.',
          language: 'formal legal terminology'
        };
      case 'professional':
        return {
          evidenceDescription: 'The evidence indicates areas where compliance verification could be improved.',
          language: 'professional business language'
        };
      case 'conversational':
        return {
          evidenceDescription: 'The evidence shows some gaps in the compliance verification process.',
          language: 'clear and accessible language'
        };
      default:
        return {
          evidenceDescription: 'The evidence suggests compliance verification issues.',
          language: 'professional language'
        };
    }
  }

  /**
   * Generate detailed assessment based on tenant settings
   */
  private static generateDetailedAssessment(input: NarrativeInput, tenantAIConfig: any): string {
    const { step1Pass, step2Pass, step3Pass, step4Pass, step5Pass } = input;
    const failures = [step1Pass, step2Pass, step3Pass, step4Pass, step5Pass].filter(pass => !pass).length;
    
    const strictness = tenantAIConfig.compliance_strictness || 'high';
    const riskTolerance = tenantAIConfig.risk_tolerance || 'low';
    
    let assessmentText = '';
    
    if (failures >= 3) {
      assessmentText = `Given that ${failures} out of 5 critical assessment steps have failed, this represents a ${strictness === 'high' ? 'critical' : strictness === 'medium' ? 'significant' : 'notable'} compliance issue that requires immediate attention.`;
    } else if (failures >= 2) {
      assessmentText = `With ${failures} out of 5 assessment steps failing, there are ${strictness === 'high' ? 'serious' : strictness === 'medium' ? 'moderate' : 'some'} compliance concerns that should be addressed.`;
    } else if (failures === 1) {
      assessmentText = `While only 1 out of 5 assessment steps has failed, this ${strictness === 'high' ? 'still represents a compliance issue' : strictness === 'medium' ? 'indicates an area for improvement' : 'suggests a minor concern'} that should be reviewed.`;
    } else {
      assessmentText = `All assessment steps have passed, indicating ${strictness === 'high' ? 'adequate' : strictness === 'medium' ? 'good' : 'satisfactory'} compliance with the requirements.`;
    }
    
    return assessmentText;
  }

  /**
   * Generate fallback narrative with tenant settings
   */
  private static generateFallbackNarrative(input: NarrativeInput, tenantAIConfig: any): string {
    const tone = this.getToneBasedOnSettings(tenantAIConfig.ai_tone);
    const style = this.getStyleBasedOnSettings(tenantAIConfig.narrative_style);
    
    return `
Based on the assessment of ${input.workerName} for the position of ${input.jobTitle} (SOC Code: ${input.socCode}), ${tone.concernLevel} compliance issues have been identified. 

The evidence provided indicates ${style.evidenceDescription.toLowerCase()} This constitutes a ${tone.breachSeverity} breach of sponsor duties under UK immigration regulations.

${input.missingDocs.length > 0 ? `Required documents including ${input.missingDocs.join(', ')} are missing from the assessment.` : ''}

Immediate remedial action is required to address these compliance concerns and ensure adherence to sponsor obligations.
    `.trim();
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
   * Clear audit log
   */
  static clearAuditLog(): void {
    this.auditLog = [];
  }

  /**
   * Export audit log as JSON
   */
  static exportAuditLog(): string {
    return JSON.stringify(this.auditLog, null, 2);
  }
} 