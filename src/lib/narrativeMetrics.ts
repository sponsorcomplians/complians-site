import { NarrativeAudit, ExperimentConfig } from '@/types/narrative.types';

class NarrativeMetrics {
  private experiments: Map<string, ExperimentConfig> = new Map();
  private metrics: NarrativeAudit[] = [];
  
  constructor() {
    // Initialize default experiment
    this.experiments.set('ai_narrative_rollout', {
      enabled: true,
      percentage: 100, // Changed from 50 to 100 for full AI rollout
      version: '1.0.0',
      userGroups: []
    });
  }

  shouldUseAI(experimentName: string = 'ai_narrative_rollout'): boolean {
    const experiment = this.experiments.get(experimentName);
    if (!experiment || !experiment.enabled) return false;
    
    // Simple percentage-based rollout
    return Math.random() * 100 < experiment.percentage;
  }

  async logGeneration(audit: NarrativeAudit): Promise<void> {
    this.metrics.push(audit);
    
    // Send to API endpoint for persistence
    try {
      await fetch('/api/narrative-metrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(audit)
      });
    } catch (error) {
      console.error('Failed to log metrics:', error);
    }
    
    // Alert on anomalies
    if (!audit.validationPassed || audit.duration > 10000) {
      console.error('Narrative generation anomaly detected:', audit);
    }
  }

  estimateTokens(text: string): number {
    // Rough estimate: 1 token ≈ 4 characters
    return Math.ceil(text.length / 4);
  }

  calculateCost(tokens: number, model: string): number {
    const costs: Record<string, number> = {
      'gpt-4-turbo-preview': 0.01,  // per 1K input tokens
      'gpt-4': 0.03,
      'gpt-3.5-turbo': 0.0005,
    };
    
    return (tokens / 1000) * (costs[model] || 0.01);
  }

  getStats(timeframe: 'hour' | 'day' | 'week' = 'day'): any {
    const now = Date.now();
    const timeframes = {
      hour: 60 * 60 * 1000,
      day: 24 * 60 * 60 * 1000,
      week: 7 * 24 * 60 * 60 * 1000
    };
    
    const cutoff = now - timeframes[timeframe];
    const relevantMetrics = this.metrics.filter(m => 
      new Date(m.timestamp).getTime() > cutoff
    );
    
    return {
      totalGenerations: relevantMetrics.length,
      aiGenerations: relevantMetrics.filter(m => !m.fallbackUsed).length,
      fallbackGenerations: relevantMetrics.filter(m => m.fallbackUsed).length,
      averageDuration: relevantMetrics.reduce((sum, m) => sum + m.duration, 0) / relevantMetrics.length || 0,
      validationPassRate: relevantMetrics.filter(m => m.validationPassed).length / relevantMetrics.length || 0,
      totalCost: relevantMetrics.reduce((sum, m) => sum + (m.costEstimate || 0), 0),
      modelUsage: relevantMetrics.reduce((acc, m) => {
        acc[m.model] = (acc[m.model] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    };
  }

  updateExperiment(name: string, config: Partial<ExperimentConfig>): void {
    const existing = this.experiments.get(name) || {
      enabled: false,
      percentage: 0,
      version: '1.0.0'
    };
    
    this.experiments.set(name, { ...existing, ...config });
  }
}

export const narrativeMetrics = new NarrativeMetrics(); 