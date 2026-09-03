// =========================================================================
// Supabase Edge Function: create-checkout-session
// Securely initiates Stripe Checkout for PathPal plans
// =========================================================================

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";
import Stripe from "https://esm.sh/stripe@14.14.0?target=deno";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      return new Response(
        JSON.stringify({ error: "STRIPE_SECRET_KEY is not configured on the server." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const stripe = new Stripe(stripeKey, {
      apiVersion: "2023-10-16",
      httpClient: Stripe.createFetchHttpClient(),
    });

    // 1. Authenticate the Supabase user from Authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing Authorization header. You must be signed in to purchase a plan." }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") || "";
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized. Invalid authentication token." }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 2. Parse request body
    const body = await req.json().catch(() => ({}));
    const { plan, return_url, request_id } = body;

    // Strict validation: accept ONLY the three authorized plans
    if (!["single_visit", "monthly_pass", "annual_family"].includes(plan)) {
      return new Response(
        JSON.stringify({ error: "Invalid plan identifier. Allowed plans: single_visit, monthly_pass, annual_family." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 3. Find or link patient associated with auth.uid()
    let patientId: number | null = null;
    const { data: patientRow } = await supabaseClient
      .from("patients")
      .select("id")
      .eq("auth_user_id", user.id)
      .maybeSingle();

    if (patientRow?.id) {
      patientId = patientRow.id;
    }

    // 4. Map plan to server-side Price IDs or authoritative price data
    // Never trust frontend-supplied amounts
    const isSubscription = plan === "monthly_pass" || plan === "annual_family";
    const mode: Stripe.Checkout.SessionCreateParams.Mode = isSubscription ? "subscription" : "payment";

    let lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];

    const envSinglePrice = Deno.env.get("STRIPE_SINGLE_VISIT_PRICE_ID");
    const envMonthlyPrice = Deno.env.get("STRIPE_MONTHLY_PASS_PRICE_ID");
    const envAnnualPrice = Deno.env.get("STRIPE_ANNUAL_FAMILY_PRICE_ID");

    if (plan === "single_visit") {
      if (envSinglePrice) {
        lineItems = [{ price: envSinglePrice, quantity: 1 }];
      } else {
        lineItems = [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: "PathPal Single Visit Hospital Escort",
                description: "One-time 2-hour door-to-department companion escort with verified PAL.",
              },
              unit_amount: 3500, // $35.00
            },
            quantity: 1,
          },
        ];
      }
    } else if (plan === "monthly_pass") {
      if (envMonthlyPrice) {
        lineItems = [{ price: envMonthlyPrice, quantity: 1 }];
      } else {
        lineItems = [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: "PathPal Plus Monthly Pass",
                description: "Unlimited hospital companion visits (up to 2 hrs per escort) for subscriber.",
              },
              unit_amount: 4900, // $49.00 / month
              recurring: { interval: "month" },
            },
            quantity: 1,
          },
        ];
      }
    } else if (plan === "annual_family") {
      if (envAnnualPrice) {
        lineItems = [{ price: envAnnualPrice, quantity: 1 }];
      } else {
        lineItems = [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: "PathPal Plus Annual Family Membership",
                description: "Full year family protection: unlimited hospital escort visits (up to 2 hrs each).",
              },
              unit_amount: 39900, // $399.00 / year
              recurring: { interval: "year" },
            },
            quantity: 1,
          },
        ];
      }
    }

    // 5. Construct success and cancel URLs
    const origin = return_url || req.headers.get("origin") || "https://pathpal.org";
    const successUrl = `${origin}/#patient?payment_success=true&session_id={CHECKOUT_SESSION_ID}&plan=${plan}`;
    const cancelUrl = `${origin}/#patient?payment_cancelled=true&plan=${plan}`;

    // 6. Create Stripe Checkout Session
    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: mode,
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: user.email,
      client_reference_id: user.id,
      metadata: {
        auth_user_id: user.id,
        patient_id: patientId ? String(patientId) : "",
        plan: plan,
        booking_type: "hospital_escort",
        pal_request_id: request_id || "",
      },
    };

    if (isSubscription) {
      sessionParams.subscription_data = {
        metadata: {
          auth_user_id: user.id,
          patient_id: patientId ? String(patientId) : "",
          plan: plan,
        },
      };
    } else {
      sessionParams.payment_intent_data = {
        metadata: {
          auth_user_id: user.id,
          patient_id: patientId ? String(patientId) : "",
          plan: plan,
          pal_request_id: request_id || "",
        },
      };
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    return new Response(
      JSON.stringify({
        url: session.url,
        sessionId: session.id,
        plan: plan,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    console.error("[create-checkout-session] Error:", err);
    return new Response(
      JSON.stringify({ error: err?.message || "Failed to create Stripe Checkout session." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
