import React, { useMemo } from 'react';
import { 
  useQuery, 
  useMutation, 
  useQueryClient, 
  QueryClient, 
  QueryClientProvider 
} from '@tanstack/react-query';
import { SkillsAssessment } from '@/lib/skills-experience-service';

interface CacheConfig {
  ttl: number; // Time to live in milliseconds
  maxSize: number; // Maximum cache entries
}

const DEFAULT_CONFIG: CacheConfig = {
  ttl: 60 * 60 * 1000, // 1 hour
  maxSize: 100
};

// Custom hook for a single worker's assessment
export function useAssessment(workerId: string, config: CacheConfig = DEFAULT_CONFIG) {
  return useQuery<SkillsAssessment>({
    queryKey: ['assessment', workerId],
    queryFn: async () => {
      const response = await fetch(`/api/assessments/${workerId}`);
      if (!response.ok) throw new Error('Failed to fetch assessment');
      return response.json();
    },
    staleTime: config.ttl,
    gcTime: config.ttl,
  });
}

// Custom hook for caching/updating an assessment
export function useCacheAssessment(config: CacheConfig = DEFAULT_CONFIG) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (assessment: SkillsAssessment) => {
      // Store in cache
      queryClient.setQueryData(['assessment', assessment.worker_id], assessment);

      // LRU eviction logic (optional, see note above)
      const allQueries = queryClient.getQueryCache().getAll();
      const assessmentQueries = allQueries.filter((q: any) =>
        Array.isArray(q.queryKey) && q.queryKey[0] === 'assessment'
      );
      if (assessmentQueries.length > config.maxSize) {
        const sortedByTime = assessmentQueries.sort((a: any, b: any) =>
          (a.state.dataUpdatedAt || 0) - (b.state.dataUpdatedAt || 0)
        );
        const toRemove = sortedByTime.slice(0, assessmentQueries.length - config.maxSize);
        toRemove.forEach((query: any) => {
          queryClient.removeQueries({ queryKey: query.queryKey });
        });
      }
      return assessment;
    },
  });
}

// Invalidate a single assessment
export function useInvalidateAssessment() {
  const queryClient = useQueryClient();
  return (workerId: string) => {
    queryClient.invalidateQueries({ queryKey: ['assessment', workerId] });
  };
}

// Warm cache for multiple workers
export function useWarmAssessmentCache(config: CacheConfig = DEFAULT_CONFIG) {
  const queryClient = useQueryClient();
  return async (workerIds: string[]) => {
    const promises = workerIds.map(id =>
      queryClient.prefetchQuery({
        queryKey: ['assessment', id],
        queryFn: async () => {
          const response = await fetch(`/api/assessments/${id}`);
          if (!response.ok) throw new Error('Failed to fetch assessment');
          return response.json();
        },
        staleTime: config.ttl,
      })
    );
    await Promise.allSettled(promises);
  };
}

// Get cache statistics
export function useAssessmentCacheStats() {
  const queryClient = useQueryClient();
  return useMemo(() => {
    const allQueries = queryClient.getQueryCache().getAll();
    const assessmentQueries = allQueries.filter((q: any) =>
      Array.isArray(q.queryKey) && q.queryKey[0] === 'assessment'
    );
    return {
      totalCached: assessmentQueries.length,
      hitRate: assessmentQueries.length
        ? assessmentQueries.filter((q: any) => q.state.data).length / assessmentQueries.length
        : 0,
    };
  }, [queryClient]);
}

// Provider for global cache configuration
const globalQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: DEFAULT_CONFIG.ttl,
      gcTime: DEFAULT_CONFIG.ttl,
    },
  },
});

interface AssessmentCacheProviderProps {
  children: React.ReactNode;
}

export const AssessmentCacheProvider: React.FC<AssessmentCacheProviderProps> = ({ children }) => {
  return React.createElement(QueryClientProvider, { client: globalQueryClient }, children);
}; 