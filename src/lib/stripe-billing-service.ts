import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { getServerSession } from 'next-auth';
import { authOptions } from './auth-config';
import {
  BillingPlan,
  UsageBilling,
  BillingEvent,
  TenantUsage,
  BillingSummary,
  StripeCustomer,
  StripeSubscription,
  StripeInvoice
} from '@/types/database';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Stripe price IDs (update these with your actual Stripe price IDs)
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

// Overage rates per unit
const OVERAGE_RATES = {
  workers: 2.00,
  assessments: 0.50,
  reports: 1.00,
  narratives: 0.25
};

/**
 * Create a Stripe customer for a tenant
 */
export async function createStripeCustomer(tenantId: string, email: string, name?: string): Promise<StripeCustomer> {
  try {
    const customer = await stripe.customers.create({
      email,
      name,
      metadata: {
        tenant_id: tenantId
      }
    });

    // Update tenant with Stripe customer ID
    await supabase
      .from('tenants')
      .update({ stripe_customer_id: customer.id })
      .eq('id', tenantId);

    // Record billing event
    await recordBillingEvent(tenantId, 'subscription_created', customer.id, { customer });

    return customer;
  } catch (error) {
    console.error('Error creating Stripe customer:', error);
    throw error;
  }
}

/**
 * Create a subscription for a tenant
 */
export async function createSubscription(
  tenantId: string,
  planName: string,
  billingCycle: 'monthly' | 'yearly' = 'monthly'
): Promise<StripeSubscription> {
  try {
    // Get tenant's Stripe customer ID
    const { data: tenant } = await supabase
      .from('tenants')
      .select('stripe_customer_id')
      .eq('id', tenantId)
      .single();

    if (!tenant?.stripe_customer_id) {
      throw new Error('Tenant does not have a Stripe customer ID');
    }

    // Get plan details
    const { data: plan } = await supabase
      .from('billing_plans')
      .select('*')
      .eq('plan_name', planName)
      .single();

    if (!plan) {
      throw new Error(`Plan ${planName} not found`);
    }

    const priceId = billingCycle === 'yearly' 
      ? STRIPE_PRICE_IDS[planName as keyof typeof STRIPE_PRICE_IDS]?.yearly
      : STRIPE_PRICE_IDS[planName as keyof typeof STRIPE_PRICE_IDS]?.monthly;

    if (!priceId) {
      throw new Error(`Price ID not found for plan ${planName} and cycle ${billingCycle}`);
    }

    // Create subscription
    const subscription = await stripe.subscriptions.create({
      customer: tenant.stripe_customer_id,
      items: [{ price: priceId }],
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent'],
    });

    // Update tenant with subscription details
    await supabase
      .from('tenants')
      .update({
        subscription_status: subscription.status,
        current_plan: planName,
        billing_cycle: billingCycle,
        next_billing_date: new Date(subscription.current_period_end * 1000).toISOString().split('T')[0],
        stripe_subscription_id: subscription.id,
        stripe_price_id: priceId,
        plan_limits: plan.plan_limits
      })
      .eq('id', tenantId);

    // Record billing event
    await recordBillingEvent(tenantId, 'subscription_created', subscription.id, { subscription, plan });

    return subscription;
  } catch (error) {
    console.error('Error creating subscription:', error);
    throw error;
  }
}

/**
 * Update a tenant's subscription
 */
export async function updateSubscription(
  tenantId: string,
  planName: string,
  billingCycle: 'monthly' | 'yearly' = 'monthly'
): Promise<StripeSubscription> {
  try {
    // Get tenant's current subscription
    const { data: tenant } = await supabase
      .from('tenants')
      .select('stripe_subscription_id, stripe_customer_id')
      .eq('id', tenantId)
      .single();

    if (!tenant?.stripe_subscription_id) {
      throw new Error('Tenant does not have an active subscription');
    }

    // Get plan details
    const { data: plan } = await supabase
      .from('billing_plans')
      .select('*')
      .eq('plan_name', planName)
      .single();

    if (!plan) {
      throw new Error(`Plan ${planName} not found`);
    }

    const priceId = billingCycle === 'yearly' 
      ? STRIPE_PRICE_IDS[planName as keyof typeof STRIPE_PRICE_IDS]?.yearly
      : STRIPE_PRICE_IDS[planName as keyof typeof STRIPE_PRICE_IDS]?.monthly;

    if (!priceId) {
      throw new Error(`Price ID not found for plan ${planName} and cycle ${billingCycle}`);
    }

    // Update subscription
    const subscription = await stripe.subscriptions.update(tenant.stripe_subscription_id, {
      items: [{ price: priceId }],
      proration_behavior: 'create_prorations',
    });

    // Update tenant
    await supabase
      .from('tenants')
      .update({
        subscription_status: subscription.status,
        current_plan: planName,
        billing_cycle: billingCycle,
        next_billing_date: new Date(subscription.current_period_end * 1000).toISOString().split('T')[0],
        stripe_price_id: priceId,
        plan_limits: plan.plan_limits
      })
      .eq('id', tenantId);

    // Record billing event
    await recordBillingEvent(tenantId, 'subscription_updated', subscription.id, { subscription, plan });

    return subscription;
  } catch (error) {
    console.error('Error updating subscription:', error);
    throw error;
  }
}

/**
 * Cancel a tenant's subscription
 */
export async function cancelSubscription(tenantId: string, cancelAtPeriodEnd: boolean = true): Promise<StripeSubscription> {
  try {
    const { data: tenant } = await supabase
      .from('tenants')
      .select('stripe_subscription_id')
      .eq('id', tenantId)
      .single();

    if (!tenant?.stripe_subscription_id) {
      throw new Error('Tenant does not have an active subscription');
    }

    const subscription = await stripe.subscriptions.update(tenant.stripe_subscription_id, {
      cancel_at_period_end: cancelAtPeriodEnd,
    });

    // Update tenant
    await supabase
      .from('tenants')
      .update({
        subscription_status: cancelAtPeriodEnd ? 'canceled' : 'active',
        current_plan: cancelAtPeriodEnd ? tenant.current_plan : 'free'
      })
      .eq('id', tenantId);

    // Record billing event
    await recordBillingEvent(tenantId, 'subscription_canceled', subscription.id, { subscription, cancelAtPeriodEnd });

    return subscription;
  } catch (error) {
    console.error('Error canceling subscription:', error);
    throw error;
  }
}

/**
 * Check if a tenant can perform a specific action
 */
export async function canPerformAction(tenantId: string, actionType: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .rpc('can_perform_action', {
        tenant_uuid: tenantId,
        action_type: actionType
      });

    if (error) {
      console.error('Error checking action permission:', error);
      return false;
    }

    return data || false;
  } catch (error) {
    console.error('Error checking action permission:', error);
    return false;
  }
}

/**
 * Get current usage for a tenant
 */
export async function getTenantUsage(tenantId: string): Promise<TenantUsage[]> {
  try {
    const { data, error } = await supabase
      .rpc('get_tenant_current_usage', {
        tenant_uuid: tenantId
      });

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error getting tenant usage:', error);
    throw error;
  }
}

/**
 * Get billing summary for a tenant
 */
export async function getBillingSummary(tenantId: string): Promise<BillingSummary | null> {
  try {
    const { data, error } = await supabase
      .rpc('get_billing_summary', {
        tenant_uuid: tenantId
      });

    if (error) {
      throw error;
    }

    return data?.[0] || null;
  } catch (error) {
    console.error('Error getting billing summary:', error);
    throw error;
  }
}

/**
 * Record usage billing for a tenant
 */
export async function recordUsageBilling(
  tenantId: string,
  billingPeriodStart: string,
  billingPeriodEnd: string
): Promise<void> {
  try {
    const { error } = await supabase
      .rpc('record_usage_billing', {
        tenant_uuid: tenantId,
        billing_period_start: billingPeriodStart,
        billing_period_end: billingPeriodEnd
      });

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Error recording usage billing:', error);
    throw error;
  }
}

/**
 * Create invoice for overages
 */
export async function createOverageInvoice(tenantId: string, billingPeriodStart: string): Promise<StripeInvoice | null> {
  try {
    // Get tenant's Stripe customer ID
    const { data: tenant } = await supabase
      .from('tenants')
      .select('stripe_customer_id')
      .eq('id', tenantId)
      .single();

    if (!tenant?.stripe_customer_id) {
      console.warn('Tenant does not have Stripe customer ID');
      return null;
    }

    // Get overage amounts
    const { data: overages } = await supabase
      .from('usage_billing')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('billing_period_start', billingPeriodStart)
      .gt('overage_amount', 0);

    if (!overages || overages.length === 0) {
      return null;
    }

    const totalOverageAmount = overages.reduce((sum, overage) => sum + overage.overage_amount, 0);

    if (totalOverageAmount <= 0) {
      return null;
    }

    // Create invoice
    const invoice = await stripe.invoices.create({
      customer: tenant.stripe_customer_id,
      description: `Overage charges for ${billingPeriodStart}`,
      auto_advance: false,
    });

    // Add invoice items for each overage
    for (const overage of overages) {
      await stripe.invoiceItems.create({
        customer: tenant.stripe_customer_id,
        invoice: invoice.id,
        amount: Math.round(overage.overage_amount * 100), // Convert to cents
        currency: 'usd',
        description: `${overage.metric_type} overage (${overage.overage_count} units)`,
      });
    }

    // Finalize and send invoice
    const finalizedInvoice = await stripe.invoices.finalizeInvoice(invoice.id);
    await stripe.invoices.sendInvoice(finalizedInvoice.id);

    // Update usage billing records with invoice ID
    await supabase
      .from('usage_billing')
      .update({ stripe_invoice_id: invoice.id })
      .eq('tenant_id', tenantId)
      .eq('billing_period_start', billingPeriodStart);

    // Record billing event
    await recordBillingEvent(tenantId, 'overage_charged', invoice.id, { invoice, overages });

    return finalizedInvoice;
  } catch (error) {
    console.error('Error creating overage invoice:', error);
    throw error;
  }
}

/**
 * Record a billing event
 */
export async function recordBillingEvent(
  tenantId: string,
  eventType: string,
  stripeEventId: string | null,
  eventData: any
): Promise<void> {
  try {
    await supabase
      .from('billing_events')
      .insert({
        tenant_id: tenantId,
        event_type: eventType,
        stripe_event_id: stripeEventId,
        event_data: eventData
      });
  } catch (error) {
    console.error('Error recording billing event:', error);
    // Don't throw error as this is not critical
  }
}

/**
 * Get all billing plans
 */
export async function getBillingPlans(): Promise<BillingPlan[]> {
  try {
    const { data, error } = await supabase
      .from('billing_plans')
      .select('*')
      .eq('is_active', true)
      .order('monthly_price', { ascending: true });

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error getting billing plans:', error);
    throw error;
  }
}

/**
 * Get billing events for a tenant
 */
export async function getBillingEvents(tenantId: string, limit: number = 50): Promise<BillingEvent[]> {
  try {
    const { data, error } = await supabase
      .from('billing_events')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error getting billing events:', error);
    throw error;
  }
}

/**
 * Handle Stripe webhook events
 */
export async function handleStripeWebhook(event: Stripe.Event): Promise<void> {
  try {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        await handleSubscriptionEvent(event);
        break;
      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event);
        break;
      case 'invoice.payment_failed':
        await handlePaymentFailed(event);
        break;
      default:
        console.log(`Unhandled Stripe event type: ${event.type}`);
    }
  } catch (error) {
    console.error('Error handling Stripe webhook:', error);
    throw error;
  }
}

/**
 * Handle subscription events
 */
async function handleSubscriptionEvent(event: Stripe.Event): Promise<void> {
  const subscription = event.data.object as Stripe.Subscription;
  
  // Find tenant by Stripe customer ID
  const { data: tenant } = await supabase
    .from('tenants')
    .select('id')
    .eq('stripe_customer_id', subscription.customer)
    .single();

  if (!tenant) {
    console.warn('Tenant not found for Stripe customer:', subscription.customer);
    return;
  }

  // Update tenant subscription status
  await supabase
    .from('tenants')
    .update({
      subscription_status: subscription.status,
      next_billing_date: new Date(subscription.current_period_end * 1000).toISOString().split('T')[0]
    })
    .eq('id', tenant.id);

  // Record billing event
  await recordBillingEvent(tenant.id, 'subscription_updated', event.id, { subscription });
}

/**
 * Handle successful payment
 */
async function handlePaymentSucceeded(event: Stripe.Event): Promise<void> {
  const invoice = event.data.object as Stripe.Invoice;
  
  if (!invoice.customer) return;

  // Find tenant by Stripe customer ID
  const { data: tenant } = await supabase
    .from('tenants')
    .select('id')
    .eq('stripe_customer_id', invoice.customer)
    .single();

  if (!tenant) {
    console.warn('Tenant not found for Stripe customer:', invoice.customer);
    return;
  }

  // Mark usage billing as paid if this is an overage invoice
  if (invoice.description?.includes('Overage charges')) {
    await supabase
      .from('usage_billing')
      .update({ is_paid: true })
      .eq('stripe_invoice_id', invoice.id);
  }

  // Record billing event
  await recordBillingEvent(tenant.id, 'payment_succeeded', event.id, { invoice });
}

/**
 * Handle failed payment
 */
async function handlePaymentFailed(event: Stripe.Event): Promise<void> {
  const invoice = event.data.object as Stripe.Invoice;
  
  if (!invoice.customer) return;

  // Find tenant by Stripe customer ID
  const { data: tenant } = await supabase
    .from('tenants')
    .select('id')
    .eq('stripe_customer_id', invoice.customer)
    .single();

  if (!tenant) {
    console.warn('Tenant not found for Stripe customer:', invoice.customer);
    return;
  }

  // Update tenant subscription status
  await supabase
    .from('tenants')
    .update({ subscription_status: 'past_due' })
    .eq('id', tenant.id);

  // Record billing event
  await recordBillingEvent(tenant.id, 'payment_failed', event.id, { invoice });
}

/**
 * Create checkout session for subscription
 */
export async function createCheckoutSession(
  tenantId: string,
  planName: string,
  billingCycle: 'monthly' | 'yearly' = 'monthly',
  successUrl: string,
  cancelUrl: string
): Promise<Stripe.Checkout.Session> {
  try {
    // Get tenant's Stripe customer ID
    const { data: tenant } = await supabase
      .from('tenants')
      .select('stripe_customer_id')
      .eq('id', tenantId)
      .single();

    if (!tenant?.stripe_customer_id) {
      throw new Error('Tenant does not have a Stripe customer ID');
    }

    const priceId = billingCycle === 'yearly' 
      ? STRIPE_PRICE_IDS[planName as keyof typeof STRIPE_PRICE_IDS]?.yearly
      : STRIPE_PRICE_IDS[planName as keyof typeof STRIPE_PRICE_IDS]?.monthly;

    if (!priceId) {
      throw new Error(`Price ID not found for plan ${planName} and cycle ${billingCycle}`);
    }

    const session = await stripe.checkout.sessions.create({
      customer: tenant.stripe_customer_id,
      payment_method_types: ['card'],
      line_items: [{
        price: priceId,
        quantity: 1,
      }],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        tenant_id: tenantId,
        plan_name: planName,
        billing_cycle: billingCycle
      }
    });

    return session;
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw error;
  }
} 