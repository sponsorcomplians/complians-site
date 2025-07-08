'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { TenantSettings } from '@/types/database';

export default function TenantAISettingsPage() {
  const { data: session, status } = useSession();
  const [aiConfig, setAiConfig] = useState<TenantSettings | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState<Partial<TenantSettings>>({});

  useEffect(() => {
    if (session) {
      fetchAIConfig();
    }
  }, [session]);

  const fetchAIConfig = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/tenants/ai-settings');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setAiConfig(data.ai_config);
      setFormData(data.ai_config);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch AI configuration');
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);
    
    try {
      const response = await fetch('/api/tenants/ai-settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update settings');
      }

      const data = await response.json();
      setAiConfig(data.ai_config);
      setSuccess('AI configuration updated successfully!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  const resetToDefaults = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);
    
    try {
      const response = await fetch('/api/tenants/ai-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reset: true }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to reset settings');
      }

      const data = await response.json();
      setAiConfig(data.ai_config);
      setFormData(data.ai_config);
      setSuccess('AI configuration reset to defaults!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset settings');
    } finally {
      setSaving(false);
    }
  };

  const updateFormData = (key: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const updateCustomPrompt = (key: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      custom_prompts: {
        ...prev.custom_prompts,
        [key]: value
      }
    }));
  };

  const updateNotificationPreference = (key: string, value: boolean) => {
    setFormData(prev => ({
      ...prev,
      notification_preferences: {
        ...prev.notification_preferences,
        [key]: value
      }
    }));
  };

  if (status === 'loading') {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  // if (!session) { /* block or redirect logic */ } // TEMPORARILY DISABLED FOR DEV

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Tenant AI Configuration</h1>
        <p className="text-gray-600">Customize how AI generates compliance narratives for your organization</p>
      </div>

      {error && (
        <Card className="mb-6 border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-600">Error: {error}</p>
          </CardContent>
        </Card>
      )}

      {success && (
        <Card className="mb-6 border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <p className="text-green-600">{success}</p>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="text-center">Loading AI configuration...</div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {/* Core AI Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Core AI Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="ai_tone">AI Tone</Label>
                <Select 
                  value={formData.ai_tone || 'strict'} 
                  onValueChange={(value) => updateFormData('ai_tone', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="strict">Strict - Authoritative and firm</SelectItem>
                    <SelectItem value="moderate">Moderate - Balanced and professional</SelectItem>
                    <SelectItem value="lenient">Lenient - Supportive and educational</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="narrative_style">Narrative Style</Label>
                <Select 
                  value={formData.narrative_style || 'formal'} 
                  onValueChange={(value) => updateFormData('narrative_style', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="formal">Formal - Legal-style language</SelectItem>
                    <SelectItem value="professional">Professional - Business language</SelectItem>
                    <SelectItem value="conversational">Conversational - Clear and accessible</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="compliance_strictness">Compliance Strictness</Label>
                <Select 
                  value={formData.compliance_strictness || 'high'} 
                  onValueChange={(value) => updateFormData('compliance_strictness', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">High - Flag all potential issues</SelectItem>
                    <SelectItem value="medium">Medium - Focus on significant issues</SelectItem>
                    <SelectItem value="low">Low - Focus on major issues only</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="risk_tolerance">Risk Tolerance</Label>
                <Select 
                  value={formData.risk_tolerance || 'low'} 
                  onValueChange={(value) => updateFormData('risk_tolerance', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low - Conservative risk assessment</SelectItem>
                    <SelectItem value="medium">Medium - Balanced risk assessment</SelectItem>
                    <SelectItem value="high">High - Pragmatic risk assessment</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Custom Prompts */}
          <Card>
            <CardHeader>
              <CardTitle>Custom Prompts (Optional)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="assessment_intro">Assessment Introduction</Label>
                <Textarea
                  placeholder="Custom introduction for assessments..."
                  value={formData.custom_prompts?.assessment_intro || ''}
                  onChange={(e) => updateCustomPrompt('assessment_intro', e.target.value)}
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="risk_analysis">Risk Analysis</Label>
                <Textarea
                  placeholder="Custom risk analysis instructions..."
                  value={formData.custom_prompts?.risk_analysis || ''}
                  onChange={(e) => updateCustomPrompt('risk_analysis', e.target.value)}
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="recommendations">Recommendations</Label>
                <Textarea
                  placeholder="Custom recommendation format..."
                  value={formData.custom_prompts?.recommendations || ''}
                  onChange={(e) => updateCustomPrompt('recommendations', e.target.value)}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Notification Preferences */}
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="email_alerts">Email Alerts</Label>
                <Switch
                  checked={formData.notification_preferences?.email_alerts ?? true}
                  onChange={(e) => updateNotificationPreference('email_alerts', e.target.checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="dashboard_notifications">Dashboard Notifications</Label>
                <Switch
                  checked={formData.notification_preferences?.dashboard_notifications ?? true}
                  onChange={(e) => updateNotificationPreference('dashboard_notifications', e.target.checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="weekly_reports">Weekly Reports</Label>
                <Switch
                  checked={formData.notification_preferences?.weekly_reports ?? false}
                  onChange={(e) => updateNotificationPreference('weekly_reports', e.target.checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Current Configuration Display */}
          <Card>
            <CardHeader>
              <CardTitle>Current Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              {aiConfig && (
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium">AI Tone:</span>
                    <Badge variant="secondary" className="ml-2">
                      {aiConfig.ai_tone}
                    </Badge>
                  </div>
                  <div>
                    <span className="font-medium">Style:</span>
                    <Badge variant="secondary" className="ml-2">
                      {aiConfig.narrative_style}
                    </Badge>
                  </div>
                  <div>
                    <span className="font-medium">Strictness:</span>
                    <Badge variant="secondary" className="ml-2">
                      {aiConfig.compliance_strictness}
                    </Badge>
                  </div>
                  <div>
                    <span className="font-medium">Risk Tolerance:</span>
                    <Badge variant="secondary" className="ml-2">
                      {aiConfig.risk_tolerance}
                    </Badge>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      <div className="mt-6 flex gap-4">
        <Button 
          onClick={saveSettings} 
          disabled={saving || loading}
          className="min-w-[120px]"
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </Button>
        
        <Button 
          variant="outline" 
          onClick={resetToDefaults}
          disabled={saving || loading}
        >
          Reset to Defaults
        </Button>
        
        <Button 
          variant="outline" 
          onClick={fetchAIConfig}
          disabled={saving || loading}
        >
          Refresh
        </Button>
      </div>

      <Separator className="my-6" />

      <Card>
        <CardHeader>
          <CardTitle>How AI Configuration Works</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">AI Tone</h4>
            <p className="text-sm text-gray-600">
              Controls the overall tone of generated narratives. Strict tone emphasizes compliance requirements and consequences, 
              while lenient tone focuses on guidance and improvement opportunities.
            </p>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">Narrative Style</h4>
            <p className="text-sm text-gray-600">
              Determines the language style used in narratives. Formal style uses legal terminology, 
              while conversational style uses clear, accessible language.
            </p>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">Compliance Strictness</h4>
            <p className="text-sm text-gray-600">
              Controls how strictly the AI interprets compliance requirements. High strictness flags all potential issues, 
              while low strictness focuses only on major concerns.
            </p>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">Risk Tolerance</h4>
            <p className="text-sm text-gray-600">
              Affects how the AI assesses and reports risks. Low tolerance identifies all potential risks, 
              while high tolerance focuses on high-probability, high-impact risks.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 