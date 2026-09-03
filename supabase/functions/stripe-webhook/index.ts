// =========================================================================
// Supabase Edge Function: stripe-webhook
// Secure, idempotent webhook listener for Stripe payments & subscriptions
// =========================================================================

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";
import Stripe from "https://esm.sh/stripe@14.14.0?target=deno";

serve(async (req: Request) => {
  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return new Response("Missing stripe-signature header", { status: 400 });
  }

  const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

  if (!stripeKey || !webhookSecret) {
    console.error("Missing STRIPE_SECRET_KEY or STRIPE_WEBHOOK_SECRET");
    return new Response("Server configuration error", { status: 500 });
  }

  const stripe = new Stripe(stripeKey, {
    apiVersion: "2023-10-16",
    httpClient: Stripe.createFetchHttpClient(),
  });

  const body = await req.text();
  let event: Stripe.Event;

  try {
    event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
  } catch (err: any) {
    console.error(`⚠️ Webhook signature verification failed: ${err.message}`);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  // Supabase Service Role client for authoritative writes
  const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
  const supabase = createClient(supabaseUrl, serviceRoleKey);

  console.log(`[Stripe Webhook] Processing event: ${event.type} (${event.id})`);

  try {
    switch (event.type) {
      // -------------------------------------------------------------------
      // 1. CHECKOUT SESSION COMPLETED (Initial payment or subscription)
      // -------------------------------------------------------------------
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const metadata = session.metadata || {};
        const authUserId = metadata.auth_user_id || session.client_reference_id;
        const plan = metadata.plan || "single_visit";

        // Resolve integer patient_id from metadata or public.patients table
        let patientId: number | null = metadata.patient_id ? parseInt(metadata.patient_id, 10) : null;
        if (!patientId && authUserId) {
          const { data: patientRow } = await supabase
            .from("patients")
            .select("id")
            .eq("auth_user_id", authUserId)
            .maybeSingle();

          if (patientRow?.id) {
            patientId = patientRow.id;
          }
        }

        const amountTotal = session.amount_total || (plan === "single_visit" ? 3500 : plan === "monthly_pass" ? 4900 : 39900);

        if (session.mode === "payment") {
          // SINGLE VISIT PURCHASE
          const paymentIntentId = session.payment_intent as string || session.id;

          // Idempotent check: verify payment intent not already recorded
          const { data: existingPayment } = await supabase
            .from("payments")
            .select("id")
            .eq("stripe_payment_intent_id", paymentIntentId)
            .maybeSingle();

          if (!existingPayment) {
            const { error: paymentErr } = await supabase.from("payments").insert({
              patient_id: patientId,
              payment_type: "per_visit",
              amount_cents: amountTotal,
              stripe_payment_intent_id: paymentIntentId,
              status: "succeeded",
            });

            if (paymentErr) {
              console.error("[Webhook] Failed to record single_visit payment:", paymentErr.message);
            } else {
              console.log(`[Webhook] Recorded single_visit payment for patient ${patientId}`);
            }
          }
        } else if (session.mode === "subscription") {
          // SUBSCRIPTION (Monthly Pass or Annual Family)
          const subscriptionId = session.subscription as string;
          const billingCycle = plan === "annual_family" ? "annual" : "monthly";

          // 1. Upsert membership record
          let membershipId: number | null = null;
          const { data: existingMembership } = await supabase
            .from("memberships")
            .select("id")
            .eq("stripe_subscription_id", subscriptionId)
            .maybeSingle();

          if (existingMembership) {
            membershipId = existingMembership.id;
            await supabase
              .from("memberships")
              .update({
                status: "active",
                plan: "pathpal_plus",
                billing_cycle: billingCycle,
              })
              .eq("id", membershipId);
          } else {
            const { data: newMembership, error: memErr } = await supabase
              .from("memberships")
              .insert({
                patient_id: patientId,
                plan: "pathpal_plus",
                billing_cycle: billingCycle,
                stripe_subscription_id: subscriptionId,
                status: "active",
              })
              .select("id")
              .single();

            if (memErr) {
              console.error("[Webhook] Membership insert error:", memErr.message);
            } else if (newMembership) {
              membershipId = newMembership.id;
            }
          }

          // 2. Record initial payment for subscription
          const paymentIntentId = (session.payment_intent as string) || `sub_initial_${session.id}`;
          const { data: existingPayment } = await supabase
            .from("payments")
            .select("id")
            .eq("stripe_payment_intent_id", paymentIntentId)
            .maybeSingle();

          if (!existingPayment) {
            await supabase.from("payments").insert({
              patient_id: patientId,
              membership_id: membershipId,
              payment_type: "membership_fee",
              amount_cents: amountTotal,
              stripe_payment_intent_id: paymentIntentId,
              status: "succeeded",
            });
          }
        }

        break;
      }

      // -------------------------------------------------------------------
      // 2. INVOICE PAID (Recurring monthly/annual renewal)
      // -------------------------------------------------------------------
      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = invoice.subscription as string;

        if (subscriptionId) {
          // 1. Maintain active status on membership
          const { data: membership } = await supabase
            .from("memberships")
            .select("id, patient_id")
            .eq("stripe_subscription_id", subscriptionId)
            .maybeSingle();

          if (membership) {
            await supabase
              .from("memberships")
              .update({ status: "active" })
              .eq("id", membership.id);

            // 2. Record recurring invoice payment idempotently
            const paymentIntentId = (invoice.payment_intent as string) || invoice.id;
            const { data: existingPayment } = await supabase
              .from("payments")
              .select("id")
              .eq("stripe_payment_intent_id", paymentIntentId)
              .maybeSingle();

            if (!existingPayment) {
              await supabase.from("payments").insert({
                patient_id: membership.patient_id,
                membership_id: membership.id,
                payment_type: "membership_fee",
                amount_cents: invoice.amount_paid,
                stripe_payment_intent_id: paymentIntentId,
                status: "succeeded",
              });
            }
          }
        }
        break;
      }

      // -------------------------------------------------------------------
      // 3. INVOICE PAYMENT FAILED
      // -------------------------------------------------------------------
      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = invoice.subscription as string;

        if (subscriptionId) {
          await supabase
            .from("memberships")
            .update({ status: "past_due" })
            .eq("stripe_subscription_id", subscriptionId);
        }
        break;
      }

      // -------------------------------------------------------------------
      // 4. SUBSCRIPTION UPDATED OR CANCELED
      // -------------------------------------------------------------------
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const newStatus = subscription.status === "active" ? "active" : subscription.status === "past_due" ? "past_due" : "cancelled";

        await supabase
          .from("memberships")
          .update({ status: newStatus })
          .eq("stripe_subscription_id", subscription.id);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await supabase
          .from("memberships")
          .update({ status: "cancelled" })
          .eq("stripe_subscription_id", subscription.id);
        break;
      }

      default:
        console.log(`[Stripe Webhook] Unhandled event type: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("[Stripe Webhook] Processing error:", err);
    return new Response(JSON.stringify({ error: err?.message || "Webhook handler failed" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
