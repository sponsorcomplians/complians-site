'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CreditCard, 
  Users, 
  FileText, 
  BarChart3, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  TrendingUp,
  Calendar,
  DollarSign,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { CanViewAnalytics } from '@/components/RoleBasedAccess';
import {
  BillingPlan,
  BillingSummary,
  TenantUsage,
  BillingEvent
} from '@/types/database';

interface BillingDashboardProps {
  className?: string;
}

export default function BillingDashboard({ className }: BillingDashboardProps) {
  const [billingSummary, setBillingSummary] = useState<BillingSummary | null>(null);
  const [billingPlans, setBillingPlans] = useState<BillingPlan[]>([]);
  const [usage, setUsage] = useState<TenantUsage[]>([]);
  const [billingEvents, setBillingEvents] = useState<BillingEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchBillingData();
  }, []);

  const fetchBillingData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [summaryRes, plansRes, usageRes, eventsRes] = await Promise.all([
        fetch('/api/billing/summary'),
        fetch('/api/billing/plans'),
        fetch('/api/tenant-metrics?days=30'),
        fetch('/api/billing/events')
      ]);

      if (summaryRes.ok) {
        const summaryData = await summaryRes.json();
        setBillingSummary(summaryData.data);
      }

      if (plansRes.ok) {
        const plansData = await plansRes.json();
        setBillingPlans(plansData.data);
      }

      if (usageRes.ok) {
        const usageData = await usageRes.json();
        setUsage(usageData.dailyMetrics || []);
      }

      if (eventsRes.ok) {
        const eventsData = await eventsRes.json();
        setBillingEvents(eventsData.data || []);
      }

    } catch (error) {
      console.error('Error fetching billing data:', error);
      setError('Failed to load billing data');
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (planName: string, billingCycle: 'monthly' | 'yearly' = 'monthly') => {
    try {
      const response = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planName,
          billingCycle,
          successUrl: `${window.location.origin}/billing?success=true`,
          cancelUrl: `${window.location.origin}/billing?canceled=true`,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.data?.url) {
          window.location.href = data.data.url;
        }
      } else {
        throw new Error('Failed to create checkout session');
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      setError('Failed to create checkout session');
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'trialing': return 'bg-blue-100 text-blue-800';
      case 'past_due': return 'bg-yellow-100 text-yellow-800';
      case 'canceled': return 'bg-red-100 text-red-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPlanBadgeColor = (plan: string) => {
    switch (plan) {
      case 'enterprise': return 'bg-purple-100 text-purple-800';
      case 'professional': return 'bg-blue-100 text-blue-800';
      case 'starter': return 'bg-green-100 text-green-800';
      case 'free': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getUsagePercentage = (usage: number, limit: number) => {
    if (limit === 0) return 0;
    return Math.min((usage / limit) * 100, 100);
  };

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <RefreshCw className="animate-spin h-8 w-8 mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading billing information...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              Error Loading Billing
            </CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={fetchBillingData} className="w-full">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <CanViewAnalytics fallback={
      <div className="flex min-h-screen items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              Access Denied
            </CardTitle>
            <CardDescription>
              You need permission to view billing information.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    }>
      <div className={`container mx-auto p-6 ${className}`}>
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">Billing & Usage</h1>
              <p className="text-gray-600">
                Manage your subscription and monitor usage
              </p>
            </div>
            <Button onClick={fetchBillingData} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>

          {billingSummary && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
              {/* Current Plan */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Current Plan</CardTitle>
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold capitalize">{billingSummary.current_plan}</div>
                  <Badge className={getStatusBadgeColor(billingSummary.subscription_status)}>
                    {billingSummary.subscription_status}
                  </Badge>
                </CardContent>
              </Card>

              {/* Next Billing */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Next Billing</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {billingSummary.next_billing_date 
                      ? new Date(billingSummary.next_billing_date).toLocaleDateString()
                      : 'N/A'
                    }
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {billingSummary.next_billing_date 
                      ? `${Math.ceil((new Date(billingSummary.next_billing_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days remaining`
                      : 'No active subscription'
                    }
                  </p>
                </CardContent>
              </Card>

              {/* Overage Amount */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Overage Charges</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatCurrency(billingSummary.total_overage_amount)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    This billing period
                  </p>
                </CardContent>
              </Card>

              {/* Plan Limits */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Plan Limits</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {billingSummary.plan_limits.workers} workers
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {billingSummary.plan_limits.assessments_per_month} assessments/month
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="usage">Usage</TabsTrigger>
              <TabsTrigger value="plans">Plans</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              {billingSummary && (
                <>
                  {/* Current Usage */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Current Period Usage</CardTitle>
                      <CardDescription>
                        Usage for the current billing period
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {Object.entries(billingSummary.current_period_usage).map(([metric, data]) => (
                          <div key={metric} className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="font-medium capitalize">{metric}</span>
                              <span className="text-sm text-gray-600">
                                {data.usage_count} / {data.plan_limit}
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full ${getUsageColor(getUsagePercentage(data.usage_count, data.plan_limit))}`}
                                style={{ width: `${getUsagePercentage(data.usage_count, data.plan_limit)}%` }}
                              ></div>
                            </div>
                            {data.overage_count > 0 && (
                              <div className="text-sm text-red-600">
                                {data.overage_count} over limit
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Quick Actions */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Quick Actions</CardTitle>
                      <CardDescription>
                        Manage your subscription
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          View Invoice
                        </Button>
                        <Button variant="outline" size="sm">
                          <CreditCard className="h-4 w-4 mr-2" />
                          Update Payment Method
                        </Button>
                        {billingSummary.subscription_status === 'active' && (
                          <Button variant="outline" size="sm">
                            <XCircle className="h-4 w-4 mr-2" />
                            Cancel Subscription
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </TabsContent>

            <TabsContent value="usage" className="space-y-4">
              {billingSummary && (
                <Card>
                  <CardHeader>
                    <CardTitle>Detailed Usage</CardTitle>
                    <CardDescription>
                      Breakdown of your usage by metric
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {Object.entries(billingSummary.current_period_usage).map(([metric, data]) => (
                        <div key={metric} className="border rounded-lg p-4">
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="font-medium capitalize">{metric}</h4>
                            <Badge className={data.overage_count > 0 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}>
                              {data.overage_count > 0 ? 'Over Limit' : 'Within Limit'}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <div className="text-gray-600">Used</div>
                              <div className="font-medium">{data.usage_count}</div>
                            </div>
                            <div>
                              <div className="text-gray-600">Limit</div>
                              <div className="font-medium">{data.plan_limit}</div>
                            </div>
                            <div>
                              <div className="text-gray-600">Remaining</div>
                              <div className="font-medium">{Math.max(0, data.plan_limit - data.usage_count)}</div>
                            </div>
                          </div>
                          {data.overage_count > 0 && (
                            <div className="mt-2 p-2 bg-red-50 rounded text-sm text-red-700">
                              {data.overage_count} units over limit - additional charges may apply
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="plans" className="space-y-4">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {billingPlans.map((plan) => (
                  <Card key={plan.id} className={`relative ${billingSummary?.current_plan === plan.plan_name ? 'ring-2 ring-blue-500' : ''}`}>
                    {billingSummary?.current_plan === plan.plan_name && (
                      <div className="absolute -top-2 -right-2">
                        <Badge className="bg-blue-500">Current</Badge>
                      </div>
                    )}
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span className="capitalize">{plan.plan_name}</span>
                        <Badge className={getPlanBadgeColor(plan.plan_name)}>
                          {plan.plan_name}
                        </Badge>
                      </CardTitle>
                      <CardDescription>
                        <div className="text-2xl font-bold">
                          {formatCurrency(plan.monthly_price)}
                          <span className="text-sm font-normal text-gray-500">/month</span>
                        </div>
                        <div className="text-sm text-gray-500">
                          {formatCurrency(plan.yearly_price)}/year (save 17%)
                        </div>
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="text-sm">
                          <div className="font-medium">Limits:</div>
                          <ul className="text-gray-600 space-y-1">
                            <li>• {plan.plan_limits.workers} workers</li>
                            <li>• {plan.plan_limits.assessments_per_month} assessments/month</li>
                            <li>• {plan.plan_limits.reports_per_month} reports/month</li>
                            <li>• {plan.plan_limits.narratives_per_month} narratives/month</li>
                          </ul>
                        </div>
                        <div className="text-sm">
                          <div className="font-medium">Features:</div>
                          <ul className="text-gray-600 space-y-1">
                            {plan.features.ai_agents && (
                              <li>• {plan.features.ai_agents.length} AI agents</li>
                            )}
                            <li>• {plan.features.support} support</li>
                            {plan.features.analytics && <li>• Analytics dashboard</li>}
                            {plan.features.priority_support && <li>• Priority support</li>}
                            {plan.features.custom_integrations && <li>• Custom integrations</li>}
                            {plan.features.sla && <li>• SLA guarantee</li>}
                          </ul>
                        </div>
                        {billingSummary?.current_plan !== plan.plan_name && (
                          <div className="space-y-2">
                            <Button 
                              onClick={() => handleUpgrade(plan.plan_name, 'monthly')}
                              className="w-full"
                              size="sm"
                            >
                              Upgrade to {plan.plan_name}
                            </Button>
                            <Button 
                              onClick={() => handleUpgrade(plan.plan_name, 'yearly')}
                              variant="outline"
                              className="w-full"
                              size="sm"
                            >
                              Upgrade Yearly (Save 17%)
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="history" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Billing History</CardTitle>
                  <CardDescription>
                    Recent billing events and transactions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {billingEvents.length > 0 ? (
                    <div className="space-y-4">
                      {billingEvents.map((event) => (
                        <div key={event.id} className="flex justify-between items-center p-3 border rounded-lg">
                          <div>
                            <div className="font-medium capitalize">
                              {event.event_type.replace('_', ' ')}
                            </div>
                            <div className="text-sm text-gray-600">
                              {new Date(event.created_at).toLocaleDateString()}
                            </div>
                          </div>
                          <Badge variant="outline">
                            {event.stripe_event_id ? 'Stripe' : 'System'}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-gray-500 py-8">
                      No billing events found
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </CanViewAnalytics>
  );
} 