import { NarrativeInput } from '@/types/narrative.types';

interface CachedNarrative {
  template: string;
  timestamp: number;
  hitCount: number;
}

class NarrativeCache {
  private cache = new Map<string, CachedNarrative>();
  private maxAge = 24 * 60 * 60 * 1000; // 24 hours
  private maxSize = 100; // Maximum cached templates

  generateCacheKey(input: NarrativeInput): string {
    // Create deterministic key from decision tree results and risk level
    return `${input.step1Pass}-${input.step2Pass}-${input.step3Pass}-${input.step4Pass}-${input.step5Pass}-${input.riskLevel}-${input.missingDocs.length > 0}`;
  }

  get(input: NarrativeInput): string | null {
    const key = this.generateCacheKey(input);
    const cached = this.cache.get(key);

    if (!cached) return null;

    // Check if expired
    if (Date.now() - cached.timestamp > this.maxAge) {
      this.cache.delete(key);
      return null;
    }

    // Update hit count
    cached.hitCount++;
    
    // Personalize the cached template
    return this.personalizeNarrative(cached.template, input);
  }

  set(input: NarrativeInput, narrative: string): void {
    const key = this.generateCacheKey(input);
    
    // Depersonalize before caching
    const template = this.depersonalizeNarrative(narrative, input);

    // Implement LRU if cache is full
    if (this.cache.size >= this.maxSize) {
      const leastUsed = Array.from(this.cache.entries())
        .sort((a, b) => a[1].hitCount - b[1].hitCount)[0];
      this.cache.delete(leastUsed[0]);
    }

    this.cache.set(key, {
      template,
      timestamp: Date.now(),
      hitCount: 0
    });
  }

  private depersonalizeNarrative(narrative: string, input: NarrativeInput): string {
    // Replace specific details with placeholders
    return narrative
      .replace(input.workerName, '{{WORKER_NAME}}')
      .replace(input.cosReference, '{{COS_REFERENCE}}')
      .replace(input.assignmentDate, '{{ASSIGNMENT_DATE}}')
      .replace(input.jobTitle, '{{JOB_TITLE}}')
      .replace(input.socCode, '{{SOC_CODE}}')
      .replace(input.cosDuties, '{{COS_DUTIES}}')
      .replace(input.jobDescriptionDuties, '{{JOB_DUTIES}}');
  }

  private personalizeNarrative(template: string, input: NarrativeInput): string {
    // Replace placeholders with actual values
    return template
      .replace(/{{WORKER_NAME}}/g, input.workerName)
      .replace(/{{COS_REFERENCE}}/g, input.cosReference)
      .replace(/{{ASSIGNMENT_DATE}}/g, input.assignmentDate)
      .replace(/{{JOB_TITLE}}/g, input.jobTitle)
      .replace(/{{SOC_CODE}}/g, input.socCode)
      .replace(/{{COS_DUTIES}}/g, input.cosDuties)
      .replace(/{{JOB_DUTIES}}/g, input.jobDescriptionDuties);
  }

  getStats() {
    const stats = {
      size: this.cache.size,
      totalHits: 0,
      entries: [] as any[]
    };

    this.cache.forEach((value, key) => {
      stats.totalHits += value.hitCount;
      stats.entries.push({
        key,
        hitCount: value.hitCount,
        age: Date.now() - value.timestamp
      });
    });

    return stats;
  }

  clear(): void {
    this.cache.clear();
  }
}

export const narrativeCache = new NarrativeCache(); 