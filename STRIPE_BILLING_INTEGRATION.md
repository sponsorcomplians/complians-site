# Stripe Billing Integration

## Overview

The Stripe billing integration provides usage-based pricing for the UK immigration compliance platform. It supports subscription management, usage tracking, overage billing, and automated plan upgrades/downgrades.

## Database Schema

### Updated Tenants Table

```sql
ALTER TABLE tenants ADD COLUMN:
- stripe_customer_id TEXT
- subscription_status TEXT DEFAULT 'inactive'
- current_plan TEXT DEFAULT 'free'
- plan_limits JSONB
- billing_cycle TEXT DEFAULT 'monthly'
- next_billing_date DATE
- stripe_subscription_id TEXT
- stripe_price_id TEXT
```

### New Tables

#### billing_plans
Stores available subscription plans with pricing and limits.

#### usage_billing
Tracks usage overages and billing for each billing period.

#### billing_events
Audit trail for all billing-related events.

## Billing Plans

### Free Plan
- **Price**: $0/month
- **Limits**: 5 workers, 50 assessments/month, 10 reports/month, 25 narratives/month
- **Features**: Basic AI agents, email support

### Starter Plan
- **Price**: $29.99/month or $299.99/year
- **Limits**: 25 workers, 250 assessments/month, 50 reports/month, 125 narratives/month
- **Features**: All AI agents, analytics, email support

### Professional Plan
- **Price**: $79.99/month or $799.99/year
- **Limits**: 100 workers, 1000 assessments/month, 200 reports/month, 500 narratives/month
- **Features**: All AI agents, analytics, priority support

### Enterprise Plan
- **Price**: $199.99/month or $1999.99/year
- **Limits**: 500 workers, 5000 assessments/month, 1000 reports/month, 2500 narratives/month
- **Features**: All AI agents, analytics, dedicated support, custom integrations, SLA

## Overage Rates

When tenants exceed their plan limits, they are charged per unit:

- **Workers**: $2.00 per additional worker
- **Assessments**: $0.50 per additional assessment
- **Reports**: $1.00 per additional report
- **Narratives**: $0.25 per additional narrative

## Key Features

### 1. Usage Tracking
- Automatic tracking of all compliance activities
- Real-time usage monitoring
- Monthly usage aggregation
- Overage detection and billing

### 2. Subscription Management
- Stripe checkout integration
- Monthly and yearly billing cycles
- Automatic subscription updates
- Plan upgrade/downgrade handling

### 3. Overage Billing
- Automatic overage detection
- Stripe invoice generation
- Usage-based pricing
- Transparent billing

### 4. Plan Enforcement
- API-level usage limits
- Real-time permission checking
- Graceful limit exceeded handling
- Upgrade prompts

## API Endpoints

### GET /api/billing/plans
Returns available billing plans.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "plan_name": "starter",
      "monthly_price": 29.99,
      "yearly_price": 299.99,
      "plan_limits": {
        "workers": 25,
        "assessments_per_month": 250,
        "reports_per_month": 50,
        "narratives_per_month": 125
      },
      "features": {
        "ai_agents": ["all"],
        "support": "email",
        "analytics": true
      }
    }
  ]
}
```

### GET /api/billing/summary
Returns billing summary for current tenant.

**Response:**
```json
{
  "success": true,
  "data": {
    "current_plan": "starter",
    "subscription_status": "active",
    "next_billing_date": "2024-02-01",
    "current_period_usage": {
      "workers": {
        "usage_count": 15,
        "plan_limit": 25,
        "overage_count": 0
      },
      "assessments": {
        "usage_count": 180,
        "plan_limit": 250,
        "overage_count": 0
      }
    },
    "total_overage_amount": 0,
    "plan_limits": {
      "workers": 25,
      "assessments_per_month": 250,
      "reports_per_month": 50,
      "narratives_per_month": 125
    }
  }
}
```

### POST /api/billing/checkout
Creates Stripe checkout session for subscription upgrade.

**Request:**
```json
{
  "planName": "professional",
  "billingCycle": "monthly",
  "successUrl": "https://example.com/billing?success=true",
  "cancelUrl": "https://example.com/billing?canceled=true"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "sessionId": "cs_test_...",
    "url": "https://checkout.stripe.com/..."
  }
}
```

### POST /api/billing/webhook
Handles Stripe webhook events.

## Service Functions

### Stripe Billing Service

The `stripe-billing-service.ts` provides comprehensive billing functionality:

#### Customer Management
- `createStripeCustomer()`: Create Stripe customer for tenant
- `getBillingSummary()`: Get tenant billing summary

#### Subscription Management
- `createSubscription()`: Create new subscription
- `updateSubscription()`: Update existing subscription
- `cancelSubscription()`: Cancel subscription

#### Usage Tracking
- `canPerformAction()`: Check if tenant can perform action
- `getTenantUsage()`: Get current usage
- `recordUsageBilling()`: Record usage for billing period

#### Billing Operations
- `createOverageInvoice()`: Create invoice for overages
- `createCheckoutSession()`: Create Stripe checkout session
- `handleStripeWebhook()`: Handle webhook events

## React Components

### BillingDashboard

A comprehensive billing dashboard with:

1. **Current Plan Overview**
   - Plan details and status
   - Next billing date
   - Overage charges

2. **Usage Monitoring**
   - Real-time usage tracking
   - Visual progress indicators
   - Overage warnings

3. **Plan Management**
   - Available plans comparison
   - Upgrade/downgrade options
   - Pricing information

4. **Billing History**
   - Transaction history
   - Invoice access
   - Payment status

## Usage Enforcement

### API-Level Enforcement

All API endpoints check usage limits before allowing actions:

```typescript
// Example: Worker creation
const canAddWorker = await canPerformAction(tenantId, 'add_worker');
if (!canAddWorker) {
  return NextResponse.json({
    error: 'Worker limit exceeded',
    message: 'Please upgrade your plan to add more workers.'
  }, { status: 403 });
}
```

### Database Functions

PostgreSQL functions enforce usage limits:

```sql
-- Check if tenant can perform action
SELECT can_perform_action(tenant_uuid, 'add_worker');

-- Get current usage
SELECT * FROM get_tenant_current_usage(tenant_uuid);

-- Record usage billing
SELECT record_usage_billing(tenant_uuid, '2024-01-01', '2024-01-31');
```

## Stripe Configuration

### Environment Variables

```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### Price IDs

Update `STRIPE_PRICE_IDS` in the service with your actual Stripe price IDs:

```typescript
const STRIPE_PRICE_IDS = {
  starter: {
    monthly: 'price_starter_monthly',
    yearly: 'price_starter_yearly'
  },
  professional: {
    monthly: 'price_professional_monthly',
    yearly: 'price_professional_yearly'
  },
  enterprise: {
    monthly: 'price_enterprise_monthly',
    yearly: 'price_enterprise_yearly'
  }
};
```

## Webhook Events

The system handles these Stripe webhook events:

1. **customer.subscription.created/updated/deleted**
   - Updates tenant subscription status
   - Records billing events

2. **invoice.payment_succeeded**
   - Marks overage invoices as paid
   - Updates tenant status

3. **invoice.payment_failed**
   - Updates tenant to past_due status
   - Records payment failure

## Billing Workflow

### 1. Subscription Creation
1. User selects plan and billing cycle
2. Stripe checkout session created
3. User completes payment
4. Webhook updates tenant subscription
5. Plan limits applied

### 2. Usage Tracking
1. API calls check usage limits
2. Metrics tracked in tenant_usage_metrics
3. Real-time usage monitoring
4. Overage detection

### 3. Overage Billing
1. Monthly usage aggregation
2. Overage calculation
3. Stripe invoice creation
4. Automatic billing

### 4. Plan Management
1. User requests plan change
2. Stripe subscription updated
3. Prorated billing applied
4. New limits activated

## Security & Permissions

### Row Level Security
- Tenants only see their own billing data
- Usage billing is tenant-specific
- Billing events are isolated

### Role-Based Access
- Analytics permission required for billing access
- Admin permission for plan management
- Multi-tenant isolation enforced

## Monitoring & Analytics

### Usage Metrics
- Daily usage tracking
- Monthly aggregation
- Overage analysis
- Trend monitoring

### Billing Analytics
- Revenue tracking
- Plan distribution
- Churn analysis
- Upgrade patterns

## Testing

### Test Scripts
```bash
# Test billing system
node test-billing.mjs

# Test webhook handling
curl -X POST http://localhost:3000/api/billing/webhook \
  -H "Content-Type: application/json" \
  -d @test-webhook.json
```

### Stripe Test Mode
- Use Stripe test keys for development
- Test webhook events
- Validate billing flows
- Test overage scenarios

## Deployment

### 1. Database Migration
```sql
-- Run the stripe-billing-migration.sql
-- This creates all necessary tables and functions
```

### 2. Environment Setup
```env
# Add Stripe environment variables
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### 3. Webhook Configuration
- Configure Stripe webhook endpoint
- Set webhook secret
- Test webhook delivery

### 4. Price Configuration
- Create Stripe products and prices
- Update price IDs in service
- Test checkout flows

## Troubleshooting

### Common Issues

1. **Webhook Failures**
   - Check webhook secret
   - Verify endpoint URL
   - Monitor webhook logs

2. **Usage Limit Errors**
   - Verify plan limits
   - Check usage calculation
   - Validate permission checks

3. **Billing Issues**
   - Check Stripe customer creation
   - Verify subscription status
   - Monitor payment failures

### Debug Tools

```typescript
// Check tenant usage
const usage = await getTenantUsage(tenantId);
console.log('Current usage:', usage);

// Check billing summary
const summary = await getBillingSummary(tenantId);
console.log('Billing summary:', summary);

// Test action permission
const canPerform = await canPerformAction(tenantId, 'add_worker');
console.log('Can add worker:', canPerform);
```

## Future Enhancements

1. **Advanced Billing**
   - Custom pricing tiers
   - Volume discounts
   - Usage-based pricing

2. **Analytics**
   - Revenue dashboards
   - Usage analytics
   - Churn prediction

3. **Automation**
   - Auto-upgrade suggestions
   - Usage alerts
   - Payment retry logic

4. **Integration**
   - Accounting system integration
   - CRM integration
   - Analytics platform integration 