import { NarrativeInput, ModelConfig } from '@/types/narrative.types';
import { narrativeCache } from './narrativeCache';
import { narrativeValidator } from './narrativeValidation';
import { narrativeMetrics } from './narrativeMetrics';
import { getLegalPromptSection } from './legalReferences';

const MODELS: ModelConfig[] = [
  { name: 'gpt-4-turbo-preview', temperature: 0.3, maxTokens: 2000, costPer1K: 0.01 },
  { name: 'gpt-3.5-turbo', temperature: 0.2, maxTokens: 2000, costPer1K: 0.0005 }
];

const DOCUMENT_CONTEXTS: Record<string, { present: string; missing: string }> = {
  cv: {
    present: "The CV demonstrates a comprehensive career history with relevant experience",
    missing: "The absence of a CV prevents verification of claimed experience"
  },
  references: {
    present: "Reference letters provide third-party confirmation of employment",
    missing: "No references were provided to corroborate employment claims"
  },
  payslips: {
    present: "Payslips evidence recent employment and remuneration",
    missing: "Missing payslips create uncertainty about recent employment"
  },
  contracts: {
    present: "Employment contracts confirm the terms and conditions of past roles",
    missing: "Absence of contracts limits verification of employment terms"
  },
  training: {
    present: "Training certificates demonstrate ongoing professional development",
    missing: "No training records provided to evidence skill maintenance"
  }
};

export async function generateAINarrative(input: NarrativeInput): Promise<string> {
  const startTime = Date.now();
  
  // Check cache first
  const cached = narrativeCache.get(input);
  if (cached) {
    console.log('Returning cached narrative');
    return cached;
  }
  
  // Check if we should use AI
  if (!narrativeMetrics.shouldUseAI()) {
    throw new Error('AI generation disabled by experiment');
  }
  
  // Try each model in order
  for (const model of MODELS) {
    try {
      const narrative = await generateWithModel(input, model);
      const duration = Date.now() - startTime;
      
      // Validate the output
      const validation = input.riskLevel === 'HIGH' 
        ? narrativeValidator.validateHighRisk(narrative, input)
        : narrativeValidator.validate(narrative, input);
      
      if (!validation.isValid) {
        console.error('Validation failed:', validation);
        continue; // Try next model
      }
      
      // Cache successful generation
      narrativeCache.set(input, narrative);
      
      // Log metrics
      const tokens = narrativeMetrics.estimateTokens(narrative);
      await narrativeMetrics.logGeneration({
        id: `NAR_${Date.now()}`,
        timestamp: new Date().toISOString(),
        input,
        output: narrative,
        model: model.name,
        promptVersion: '1.0.0',
        temperature: model.temperature,
        duration,
        tokenCount: tokens,
        validationPassed: validation.isValid,
        fallbackUsed: false,
        costEstimate: narrativeMetrics.calculateCost(tokens, model.name)
      });
      
      return narrative;
    } catch (error) {
      console.error(`Model ${model.name} failed:`, error);
      continue;
    }
  }
  
  throw new Error('All AI models failed');
}

async function generateWithModel(input: NarrativeInput, model: ModelConfig): Promise<string> {
  const prompt = buildEnhancedPrompt(input);
  
  const response = await fetch('/api/generate-narrative', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      input,
      prompt,
      model: model.name,
      temperature: model.temperature,
      maxTokens: model.maxTokens
    })
  });
  
  if (!response.ok) {
    throw new Error(`API call failed: ${response.statusText}`);
  }
  
  const { narrative } = await response.json();
  return narrative;
}

function buildEnhancedPrompt(input: NarrativeInput): string {
  // Build document context
  const documentContext = Object.entries({
    cv: input.hasCV,
    references: input.hasReferences,
    payslips: input.hasPayslips,
    contracts: input.hasContracts,
    training: input.hasTraining
  }).map(([type, present]) => {
    return DOCUMENT_CONTEXTS[type][present ? 'present' : 'missing'];
  }).join('\n');
  
  // Determine severity tone
  const severityContext = input.isCompliant 
    ? "Use a professional, acknowledging tone with minor recommendations"
    : input.riskLevel === 'HIGH'
    ? "Use grave concern, emphasize immediate action required and potential consequences"
    : "Use concerned but constructive tone with clear remediation steps";
  
  return `
You are a Senior Immigration Solicitor specializing in UK sponsor compliance.
Generate a formal assessment letter in British legal English.

${getLegalPromptSection()}

TONE REQUIREMENTS:
- Formal, authoritative, professional
- Use "we" (representing the compliance team)
- ${severityContext}
- Include specific legal references
- Clear consequences and actionable recommendations

DOCUMENT EVIDENCE:
${documentContext}

Missing Documents: ${input.missingDocs.join(', ') || 'None'}

DECISION TREE RESULTS:
- Step 1 (Required Documents): ${input.step1Pass ? 'PASS' : 'FAIL'}
- Step 2 (Employment History): ${input.step2Pass ? 'PASS' : 'FAIL'}
- Step 3 (Experience Match): ${input.step3Pass ? 'PASS' : 'FAIL'}
- Step 4 (References): ${input.step4Pass ? 'PASS' : 'FAIL'}
- Step 5 (Recent Experience): ${input.step5Pass ? 'PASS' : 'FAIL'}

Overall: ${input.isCompliant ? 'COMPLIANT' : 'SERIOUS BREACH'}
Risk Level: ${input.riskLevel}

Generate a comprehensive narrative that:
1. Opens with findings summary
2. Details CoS assignment (${input.cosReference} for ${input.workerName})
3. Reviews each decision tree step with specific observations
4. Cites relevant legal breaches if non-compliant
5. Provides clear verdict and recommendations
6. Includes the decision tree summary with ✅/❌ marks

CRITICAL: Base assessment only on provided data. Do not invent details.`;
} 