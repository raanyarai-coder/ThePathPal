// =========================================================================
// PathPal Stripe Client Service
// Handles Checkout session creation, payment entitlement verification,
// and membership tracking against Supabase and Stripe
// =========================================================================

import { supabase } from './supabaseClient';

export type PlanType = 'single_visit' | 'monthly_pass' | 'annual_family';

export interface PaymentEntitlement {
  isEntitled: boolean;
  planType: PlanType | null;
  planLabel: string;
  hasActiveMembership: boolean;
  activeMembershipId?: number;
  validPaymentId?: number;
  details?: string;
}

/**
 * Calls the Supabase Edge Function to securely generate a Stripe Checkout session.
 * Never trust amount from the browser; only plan identifier is sent.
 */
export async function createStripeCheckoutSession(
  plan: PlanType,
  returnUrl?: string
): Promise<{ url: string | null; sessionId: string | null; error: string | null }> {
  try {
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session?.access_token) {
      return {
        url: null,
        sessionId: null,
        error: 'Please sign in or create an account to continue to secure checkout.',
      };
    }

    const { data, error } = await supabase.functions.invoke('create-checkout-session', {
      body: {
        plan,
        return_url: returnUrl || window.location.origin,
      },
    });

    if (error) {
      console.error('[StripeService] Edge function invocation error:', error);
      return {
        url: null,
        sessionId: null,
        error: error.message || 'Unable to connect to Stripe payment gateway.',
      };
    }

    if (data?.url) {
      return { url: data.url, sessionId: data.sessionId, error: null };
    }

    return {
      url: null,
      sessionId: null,
      error: data?.error || 'Payment gateway did not return a valid checkout session URL.',
    };
  } catch (err: any) {
    console.error('[StripeService] Checkout session exception:', err);
    return {
      url: null,
      sessionId: null,
      error: err?.message || 'Failed to initialize payment session. Please try again.',
    };
  }
}

/**
 * Validates whether the authenticated patient holds a confirmed Stripe payment
 * or an active PathPal Plus membership to book a hospital escort.
 */
export async function checkPatientEntitlement(userId?: string): Promise<PaymentEntitlement> {
  if (!userId) {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    userId = session?.user?.id;
  }

  if (!userId) {
    return {
      isEntitled: false,
      planType: null,
      planLabel: 'Unauthenticated',
      hasActiveMembership: false,
      details: 'Please log in to verify your membership or payment status.',
    };
  }

  try {
    // 1. Resolve patient ID from public.patients
    const { data: patient } = await supabase
      .from('patients')
      .select('id')
      .eq('auth_user_id', userId)
      .maybeSingle();

    const patientId = patient?.id;

    // 2. Check for active membership (Monthly Pass or Annual Family)
    if (patientId) {
      const { data: activeMembership } = await supabase
        .from('memberships')
        .select('*')
        .eq('patient_id', patientId)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (activeMembership) {
        const isAnnual = activeMembership.billing_cycle === 'annual';
        return {
          isEntitled: true,
          planType: isAnnual ? 'annual_family' : 'monthly_pass',
          planLabel: isAnnual ? 'Annual Family (Active)' : 'Monthly Pass (Active)',
          hasActiveMembership: true,
          activeMembershipId: activeMembership.id,
          details: `Unlimited escort visits active under ${isAnnual ? 'Annual Family' : 'Monthly'} membership.`,
        };
      }
    }

    // 3. Check for successful single visit payment
    if (patientId) {
      // Find payments where status is succeeded
      const { data: payments } = await supabase
        .from('payments')
        .select('*')
        .eq('patient_id', patientId)
        .eq('status', 'succeeded')
        .eq('payment_type', 'per_visit')
        .order('created_at', { ascending: false })
        .limit(5);

      if (payments && payments.length > 0) {
        // Check if there are unused payments or valid recent payment
        const validPayment = payments[0];
        return {
          isEntitled: true,
          planType: 'single_visit',
          planLabel: 'Single Visit ($35 Confirmed)',
          hasActiveMembership: false,
          validPaymentId: validPayment.id,
          details: 'Single hospital escort visit confirmed via Stripe.',
        };
      }
    }

    return {
      isEntitled: false,
      planType: null,
      planLabel: 'No Active Plan',
      hasActiveMembership: false,
      details: 'Select a Single Visit ($35) or PathPal Plus Membership ($49/mo) to book an escort.',
    };
  } catch (err) {
    console.warn('[StripeService] Error verifying entitlement:', err);
    return {
      isEntitled: false,
      planType: null,
      planLabel: 'Verification Error',
      hasActiveMembership: false,
      details: 'Unable to check entitlement at this moment.',
    };
  }
}

/**
 * Polls database after returning from Stripe checkout to verify webhook has completed.
 */
export async function pollPaymentConfirmation(
  authUserId: string,
  maxAttempts = 5,
  intervalMs = 1500
): Promise<PaymentEntitlement> {
  for (let i = 0; i < maxAttempts; i++) {
    const entitlement = await checkPatientEntitlement(authUserId);
    if (entitlement.isEntitled) {
      return entitlement;
    }
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }
  return await checkPatientEntitlement(authUserId);
}
