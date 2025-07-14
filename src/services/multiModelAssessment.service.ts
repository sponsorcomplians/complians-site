import { skillsExperienceSystemPrompt } from '@/lib/prompts/skillsExperiencePrompt';
import { AIServiceError } from '@/lib/error-handling';

interface ModelConfig {
  provider: 'openai' | 'anthropic' | 'cohere';
  model: string;
  apiKey: string;
  maxTokens: number;
  temperature: number;
}

interface AssessmentTask {
  type: 'document_extraction' | 'skills_matching' | 'compliance_assessment';
  data: any;
}

interface ModelResponse {
  result: any;
  confidence: number;
  model: string;
  processingTime: number;
}

class MultiModelAssessmentService {
  private modelConfigs: Record<string, ModelConfig> = {
    documentExtraction: {
      provider: 'openai',
      model: 'gpt-4-vision-preview',
      apiKey: process.env.OPENAI_API_KEY || '',
      maxTokens: 4000,
      temperature: 0.1
    },
    skillsMatching: {
      provider: 'anthropic',
      model: 'claude-3-opus-20240229',
      apiKey: process.env.ANTHROPIC_API_KEY || '',
      maxTokens: 4000,
      temperature: 0.3
    },
    complianceAssessment: {
      provider: 'openai',
      model: 'gpt-4-turbo-preview',
      apiKey: process.env.OPENAI_API_KEY || '',
      maxTokens: 8000,
      temperature: 0.2
    }
  };

  // Route task to appropriate model
  async routeTask(task: AssessmentTask): Promise<ModelResponse> {
    const startTime = Date.now();
    let modelConfig: ModelConfig;
    
    switch (task.type) {
      case 'document_extraction':
        modelConfig = this.modelConfigs.documentExtraction;
        break;
      case 'skills_matching':
        modelConfig = this.modelConfigs.skillsMatching;
        break;
      case 'compliance_assessment':
        modelConfig = this.modelConfigs.complianceAssessment;
        break;
      default:
        throw new AIServiceError(`Unknown task type: ${task.type}`);
    }

    try {
      const result = await this.callModel(modelConfig, task);
      
      return {
        result,
        confidence: this.calculateConfidence(result, task.type),
        model: `${modelConfig.provider}/${modelConfig.model}`,
        processingTime: Date.now() - startTime
      };
    } catch (error) {
      // Fallback to alternative model
      return this.fallbackModel(task, error);
    }
  }

  // Call specific AI model
  private async callModel(config: ModelConfig, task: AssessmentTask): Promise<any> {
    switch (config.provider) {
      case 'openai':
        return this.callOpenAI(config, task);
      case 'anthropic':
        return this.callAnthropic(config, task);
      case 'cohere':
        return this.callCohere(config, task);
      default:
        throw new AIServiceError(`Unsupported provider: ${config.provider}`);
    }
  }

  private async callOpenAI(config: ModelConfig, task: AssessmentTask): Promise<any> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: config.model,
        messages: [
          {
            role: 'system',
            content: this.enhancePrompt(skillsExperienceSystemPrompt, task)
          },
          {
            role: 'user',
            content: JSON.stringify(task.data)
          }
        ],
        max_tokens: config.maxTokens,
        temperature: config.temperature
      })
    });

    if (!response.ok) {
      throw new AIServiceError(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    return JSON.parse(data.choices[0].message.content);
  }

  private async callAnthropic(config: ModelConfig, task: AssessmentTask): Promise<any> {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': config.apiKey,
        'content-type': 'application/json',
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: config.model,
        messages: [
          {
            role: 'user',
            content: `${this.enhancePrompt(skillsExperienceSystemPrompt, task)}\n\n${JSON.stringify(task.data)}`
          }
        ],
        max_tokens: config.maxTokens,
        temperature: config.temperature
      })
    });

    if (!response.ok) {
      throw new AIServiceError(`Anthropic API error: ${response.statusText}`);
    }

    const data = await response.json();
    return JSON.parse(data.content[0].text);
  }

  private async callCohere(config: ModelConfig, task: AssessmentTask): Promise<any> {
    // Cohere implementation
    throw new AIServiceError('Cohere integration not yet implemented');
  }

  // Enhance base prompt with task-specific context
  private enhancePrompt(basePrompt: string, task: AssessmentTask): string {
    const enhancements = {
      document_extraction: '\n\nFocus on extracting dates, qualifications, and experience with high precision.',
      skills_matching: '\n\nPay special attention to matching skills with SOC code requirements.',
      compliance_assessment: '\n\nEnsure strict compliance with C1.38 and Annex C2(b) requirements.'
    };

    return basePrompt + (enhancements[task.type] || '');
  }

  // Calculate confidence score
  private calculateConfidence(result: any, taskType: string): number {
    // Implement confidence calculation based on result quality
    let confidence = 0.7; // Base confidence

    // Adjust based on completeness
    if (result.documentAuthenticity && result.skillsAlignment) {
      confidence += 0.1;
    }

    if (result.complianceScore) {
      confidence += (result.complianceScore / 100) * 0.2;
    }

    return Math.min(confidence, 1.0);
  }

  // Fallback strategy
  private async fallbackModel(task: AssessmentTask, originalError: any): Promise<ModelResponse> {
    console.error('Primary model failed, using fallback:', originalError);
    
    // Use the base prompt with existing system
    const fallbackResult = {
      verdict: 'REQUIRES_MANUAL_REVIEW',
      confidence: 0.5,
      error: 'Primary assessment failed, manual review required',
      recommendations: ['Manual verification recommended due to AI service issues']
    };

    return {
      result: fallbackResult,
      confidence: 0.5,
      model: 'fallback/manual',
      processingTime: 0
    };
  }

  // Ensemble voting for critical decisions
  async ensembleAssessment(task: AssessmentTask): Promise<any> {
    const models = ['documentExtraction', 'skillsMatching', 'complianceAssessment'];
    const results = await Promise.allSettled(
      models.map(model => this.routeTask({ ...task, type: model as any }))
    );

    const successfulResults = results
      .filter(r => r.status === 'fulfilled')
      .map(r => (r as any).value);

    if (successfulResults.length === 0) {
      throw new AIServiceError('All models failed');
    }

    // Implement voting logic
    return this.aggregateResults(successfulResults);
  }

  private aggregateResults(results: ModelResponse[]): any {
    // Implement sophisticated voting/aggregation logic
    const verdicts = results.map(r => r.result.verdict).filter(Boolean);
    const mostCommonVerdict = this.getMostCommon(verdicts);

    const avgConfidence = results.reduce((sum, r) => sum + r.confidence, 0) / results.length;

    return {
      verdict: mostCommonVerdict,
      confidence: avgConfidence,
      models: results.map(r => r.model),
      ensembleMethod: 'majority_vote'
    };
  }

  private getMostCommon<T>(arr: T[]): T {
    const counts = new Map<T, number>();
    arr.forEach(item => counts.set(item, (counts.get(item) || 0) + 1));
    
    let maxCount = 0;
    let mostCommon = arr[0];
    
    counts.forEach((count, item) => {
      if (count > maxCount) {
        maxCount = count;
        mostCommon = item;
      }
    });
    
    return mostCommon;
  }

  // A/B testing capability
  async abTestModels(task: AssessmentTask, testPercentage: number = 0.1): Promise<ModelResponse> {
    const useNewModel = Math.random() < testPercentage;
    
    if (useNewModel) {
      // Log for analytics
      console.log('Using experimental model for A/B test');
      // Use experimental configuration
    }
    
    return this.routeTask(task);
  }
}

export const multiModelAssessment = new MultiModelAssessmentService(); 