import { NarrativeInput } from '@/types/narrative.types';

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  score: number;
}

export class NarrativeValidator {
  validate(narrative: string, input: NarrativeInput): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    let score = 100;

    // Required content checks
    const requiredElements = [
      { 
        check: narrative.includes(input.workerName), 
        error: 'Missing worker name',
        penalty: 20 
      },
      { 
        check: narrative.includes(input.cosReference), 
        error: 'Missing CoS reference',
        penalty: 20 
      },
      { 
        check: /paragraph\s+[A-Z]\d+\.\d+/i.test(narrative), 
        error: 'Missing legal paragraph references',
        penalty: 30 
      },
      { 
        check: narrative.includes(input.isCompliant ? "COMPLIANT" : "SERIOUS BREACH"), 
        error: 'Missing compliance verdict',
        penalty: 30 
      },
      { 
        check: narrative.includes("Decision Tree Compliance Summary"), 
        error: 'Missing decision tree summary',
        penalty: 20 
      }
    ];

    requiredElements.forEach(element => {
      if (!element.check) {
        errors.push(element.error);
        score -= element.penalty;
      }
    });

    // Quality checks (warnings)
    if (narrative.length < 1000) {
      warnings.push('Narrative seems too short (< 1000 characters)');
      score -= 10;
    }

    if (narrative.length > 5000) {
      warnings.push('Narrative is very long (> 5000 characters)');
      score -= 5;
    }

    // Check for decision tree alignment
    const decisionTreeChecks = [
      { step: 'Step 1', shouldInclude: !input.step1Pass ? 'fail' : 'pass' },
      { step: 'Step 2', shouldInclude: !input.step2Pass ? 'fail' : 'pass' },
      { step: 'Step 3', shouldInclude: !input.step3Pass ? 'fail' : 'pass' },
      { step: 'Step 4', shouldInclude: !input.step4Pass ? 'fail' : 'pass' },
      { step: 'Step 5', shouldInclude: !input.step5Pass ? 'fail' : 'pass' }
    ];

    decisionTreeChecks.forEach(check => {
      const stepSection = narrative.substring(
        narrative.indexOf(check.step),
        narrative.indexOf(check.step) + 100
      );
      
      if (check.shouldInclude === 'fail' && !stepSection.match(/❌|No|Fail/i)) {
        warnings.push(`${check.step} should indicate failure`);
        score -= 5;
      }
      
      if (check.shouldInclude === 'pass' && !stepSection.match(/✅|Yes|Pass/i)) {
        warnings.push(`${check.step} should indicate pass`);
        score -= 5;
      }
    });

    // Check for inappropriate content
    const inappropriatePatterns = [
      /I think|I believe|In my opinion/i,
      /maybe|perhaps|possibly/i,
      /\b(gonna|wanna|gotta)\b/i
    ];

    inappropriatePatterns.forEach(pattern => {
      if (pattern.test(narrative)) {
        warnings.push(`Informal or uncertain language detected: ${pattern}`);
        score -= 5;
      }
    });

    return {
      isValid: errors.length === 0 && score >= 70,
      errors,
      warnings,
      score: Math.max(0, score)
    };
  }

  // Enhanced validation for high-risk cases
  validateHighRisk(narrative: string, input: NarrativeInput): ValidationResult {
    const baseValidation = this.validate(narrative, input);
    
    // Additional checks for serious breaches
    if (!input.isCompliant) {
      if (!narrative.includes('Annex C')) {
        baseValidation.errors.push('High-risk case missing Annex C references');
        baseValidation.score -= 20;
      }
      
      if (!narrative.match(/immediate|urgent|without delay/i)) {
        baseValidation.warnings.push('High-risk case should emphasize urgency');
        baseValidation.score -= 10;
      }
    }
    
    baseValidation.isValid = baseValidation.errors.length === 0 && baseValidation.score >= 80;
    return baseValidation;
  }
}

export const narrativeValidator = new NarrativeValidator(); 