"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Bell, 
  AlertTriangle, 
  CheckCircle, 
  X,
  RefreshCw,
  HelpCircle
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Alert } from '@/types/master-compliance.types';
import { AI_AGENT_NAMES } from '@/lib/masterComplianceService';

export default function AlertsBell() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/alerts?status=Unread&limit=10');
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch alerts');
      }

      setAlerts(result.data);
    } catch (err) {
      console.error('Error loading alerts:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (alertId: string) => {
    try {
      const response = await fetch(`/api/alerts/${alertId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'Read' }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to mark alert as read');
      }

      setAlerts(prev => prev.filter(a => a.id !== alertId));
    } catch (err) {
      console.error('Error marking alert as read:', err);
    }
  };

  const handleDismiss = async (alertId: string) => {
    try {
      const response = await fetch(`/api/alerts/${alertId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'Dismissed' }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to dismiss alert');
      }

      setAlerts(prev => prev.filter(a => a.id !== alertId));
    } catch (err) {
      console.error('Error dismissing alert:', err);
    }
  };

  const unreadCount = alerts.filter(alert => alert.status === 'Unread').length;

  return (
    <TooltipProvider>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="relative p-2"
            onClick={() => setOpen(!open)}
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-red-500 text-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </Badge>
            )}
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-4 w-4 text-gray-400 ml-1" />
              </TooltipTrigger>
              <TooltipContent>
                <p>View urgent compliance risks flagged for immediate review.</p>
              </TooltipContent>
            </Tooltip>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0" align="end">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Alerts</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={loadAlerts}
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center">
                <RefreshCw className="h-6 w-6 animate-spin mx-auto text-gray-400" />
                <p className="text-sm text-gray-500 mt-2">Loading alerts...</p>
              </div>
            ) : error ? (
              <div className="p-4 text-center">
                <AlertTriangle className="h-6 w-6 mx-auto text-red-400" />
                <p className="text-sm text-red-600 mt-2">{error}</p>
                <Button onClick={loadAlerts} size="sm" className="mt-2">
                  Retry
                </Button>
              </div>
            ) : alerts.length === 0 ? (
              <div className="p-4 text-center">
                <CheckCircle className="h-6 w-6 mx-auto text-green-400" />
                <p className="text-sm text-gray-500 mt-2">No unread alerts</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {alerts.map((alert) => (
                  <div key={alert.id} className="p-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <AlertTriangle className="h-4 w-4 text-red-500" />
                          <span className="text-sm font-medium text-gray-900">
                            {AI_AGENT_NAMES[alert.agentType] || alert.agentType}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          {alert.alertMessage}
                        </p>
                        {alert.compliance_workers && (
                          <p className="text-xs text-gray-500">
                            Worker: {alert.compliance_workers.name}
                          </p>
                        )}
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(alert.createdAt).toLocaleString('en-GB')}
                        </p>
                      </div>
                      <div className="flex space-x-1 ml-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleMarkAsRead(alert.id)}
                          className="h-6 w-6 p-0"
                        >
                          <CheckCircle className="h-3 w-3 text-green-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDismiss(alert.id)}
                          className="h-6 w-6 p-0"
                        >
                          <X className="h-3 w-3 text-gray-400" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {alerts.length > 0 && (
            <div className="p-4 border-t border-gray-200">
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => {
                  // Navigate to alerts page or show all alerts
                  console.log('View all alerts');
                }}
              >
                View All Alerts
              </Button>
            </div>
          )}
        </PopoverContent>
      </Popover>
    </TooltipProvider>
  );
} 