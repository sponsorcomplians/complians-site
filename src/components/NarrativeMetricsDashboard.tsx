"use client";

import { useEffect, useState } from 'react';
import { narrativeCache } from '@/lib/narrativeCache';

export default function NarrativeMetricsDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [cacheStats, setCacheStats] = useState<any>(null);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 30000); // Update every 30s
    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/narrative-metrics');
      const data = await response.json();
      setStats(data);
      setCacheStats(narrativeCache.getStats());
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  if (!stats) return <div>Loading metrics...</div>;

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold">AI Narrative Metrics</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-semibold">Total Generations</h3>
          <p className="text-2xl">{stats.total}</p>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-semibold">Avg Duration</h3>
          <p className="text-2xl">{(stats.averageDuration / 1000).toFixed(2)}s</p>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-semibold">Validation Pass Rate</h3>
          <p className="text-2xl">{(stats.validationPassRate * 100).toFixed(1)}%</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="font-semibold mb-2">Cache Performance</h3>
        <p>Entries: {cacheStats?.size || 0}</p>
        <p>Total Hits: {cacheStats?.totalHits || 0}</p>
      </div>

      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="font-semibold mb-2">Model Usage</h3>
        {Object.entries(stats.modelBreakdown || {}).map(([model, count]) => (
          <div key={model} className="flex justify-between">
            <span>{model}:</span>
            <span>{count as number}</span>
          </div>
        ))}
      </div>
    </div>
  );
} 