-- =========================================================================
-- PATHPAL PRODUCTION DATABASE MIGRATION
-- Idempotent schema upgrades, security definers, RPCs, and RLS policies
-- Date: 2026-09-03
-- =========================================================================

-- 1. NOTIFICATIONS TABLE (Ensure table exists and has proper structure)
CREATE TABLE IF NOT EXISTS public.notifications (
  id serial PRIMARY KEY,
  user_id text NULL,
  title text NOT NULL,
  message text NOT NULL,
  type text DEFAULT 'info',
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Index for notifications query by user_id
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);

-- 2. ESCORT SESSIONS SCHEMA UPGRADE
-- Add membership_id, payment_id, and service_type if they do not exist
DO $$
BEGIN
  -- Add membership_id
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'escort_sessions' 
      AND column_name = 'membership_id'
  ) THEN
    ALTER TABLE public.escort_sessions 
    ADD COLUMN membership_id integer NULL REFERENCES public.memberships(id);
  END IF;

  -- Add payment_id
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'escort_sessions' 
      AND column_name = 'payment_id'
  ) THEN
    ALTER TABLE public.escort_sessions 
    ADD COLUMN payment_id integer NULL REFERENCES public.payments(id);
  END IF;

  -- Add service_type
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'escort_sessions' 
      AND column_name = 'service_type'
  ) THEN
    ALTER TABLE public.escort_sessions 
    ADD COLUMN service_type text NOT NULL DEFAULT 'single_visit';
  END IF;
END $$;

-- Ensure service_type check constraint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'escort_sessions_service_type_check'
  ) THEN
    ALTER TABLE public.escort_sessions 
    ADD CONSTRAINT escort_sessions_service_type_check 
    CHECK (service_type IN ('single_visit', 'monthly_pass', 'annual_family'));
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Indexes on escort_sessions
CREATE INDEX IF NOT EXISTS idx_escort_sessions_request_id ON public.escort_sessions(request_id);
CREATE INDEX IF NOT EXISTS idx_escort_sessions_pal_id ON public.escort_sessions(pal_id);
CREATE INDEX IF NOT EXISTS idx_escort_sessions_patient_id ON public.escort_sessions(patient_id);
CREATE INDEX IF NOT EXISTS idx_escort_sessions_status ON public.escort_sessions(status);

-- Ensure pal_requests has proper indexes
CREATE INDEX IF NOT EXISTS idx_pal_requests_assigned_pal_id ON public.pal_requests(assigned_pal_id);
CREATE INDEX IF NOT EXISTS idx_pal_requests_status ON public.pal_requests(status);

-- Ensure pals table has index on auth_user_id
CREATE INDEX IF NOT EXISTS idx_pals_auth_user_id ON public.pals(auth_user_id);

-- Ensure payments has index on stripe_payment_intent_id
CREATE INDEX IF NOT EXISTS idx_payments_stripe_pi ON public.payments(stripe_payment_intent_id);

-- Ensure memberships has index on stripe_subscription_id
CREATE INDEX IF NOT EXISTS idx_memberships_stripe_sub ON public.memberships(stripe_subscription_id);


-- =========================================================================
-- 3. SECURITY DEFINER HELPER FUNCTIONS
-- =========================================================================

-- Helper: Check if current authenticated user is an active admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE id = auth.uid()
      AND is_active = true
  );
END;
$$;

-- Helper: Check if current authenticated user is a verified PAL
CREATE OR REPLACE FUNCTION public.is_verified_pal()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.pals
    WHERE auth_user_id = auth.uid()
      AND (
        background_check_status IN ('cleared', 'approved', 'active')
        OR background_check_status IS NULL
      )
  );
END;
$$;

-- Helper: Get current PAL's integer ID from auth.uid()
CREATE OR REPLACE FUNCTION public.get_current_pal_id()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id integer;
BEGIN
  SELECT id INTO v_id
  FROM public.pals
  WHERE auth_user_id = auth.uid()
  LIMIT 1;

  RETURN v_id;
END;
$$;

-- Helper: Get current patient's integer ID from auth.uid()
CREATE OR REPLACE FUNCTION public.get_current_patient_id()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id integer;
BEGIN
  SELECT id INTO v_id
  FROM public.patients
  WHERE auth_user_id = auth.uid()
  LIMIT 1;

  RETURN v_id;
END;
$$;


-- =========================================================================
-- 4. ATOMIC PAL ACCEPTANCE RPC (Section 18 & 19)
-- =========================================================================
CREATE OR REPLACE FUNCTION public.accept_pal_request(p_request_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_auth_uid uuid;
  v_pal_id integer;
  v_req record;
  v_session record;
  v_patient_id integer;
  v_active_membership record;
  v_service_type text := 'single_visit';
  v_membership_id integer := NULL;
  v_payment_id integer := NULL;
BEGIN
  -- 1. Verify authenticated user
  v_auth_uid := auth.uid();
  IF v_auth_uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated. Please sign in to accept assignments.';
  END IF;

  -- 2. Verify caller is a valid PAL
  SELECT id INTO v_pal_id
  FROM public.pals
  WHERE auth_user_id = v_auth_uid
  LIMIT 1;

  IF v_pal_id IS NULL THEN
    RAISE EXCEPTION 'PAL profile not found for this account. Please complete PAL verification.';
  END IF;

  -- 3. Lock the request row to prevent race conditions
  SELECT * INTO v_req
  FROM public.pal_requests
  WHERE id = p_request_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'The requested appointment could not be found.';
  END IF;

  IF v_req.status <> 'pending' OR v_req.assigned_pal_id IS NOT NULL THEN
    RAISE EXCEPTION 'This request has already been claimed or is no longer pending.';
  END IF;

  -- 4. Update pal_requests atomically
  UPDATE public.pal_requests
  SET status = 'matched',
      assigned_pal_id = v_auth_uid
  WHERE id = p_request_id;

  -- 5. Record match in public.matches (matches.pal_id is INTEGER pals.id)
  INSERT INTO public.matches (
    request_id,
    pal_id,
    status,
    matched_at
  ) VALUES (
    p_request_id,
    v_pal_id,
    'accepted',
    now()
  )
  ON CONFLICT DO NOTHING;

  -- 6. Determine service_type & membership/payment linkage if patient exists
  IF v_req.patient_id IS NOT NULL THEN
    -- Try to resolve integer patient_id
    BEGIN
      v_patient_id := v_req.patient_id::integer;
    EXCEPTION WHEN OTHERS THEN
      v_patient_id := NULL;
    END;
  END IF;

  IF v_patient_id IS NOT NULL THEN
    -- Check for active membership
    SELECT id, billing_cycle INTO v_active_membership
    FROM public.memberships
    WHERE patient_id = v_patient_id
      AND status = 'active'
    ORDER BY created_at DESC
    LIMIT 1;

    IF FOUND THEN
      v_membership_id := v_active_membership.id;
      IF v_active_membership.billing_cycle = 'annual' THEN
        v_service_type := 'annual_family';
      ELSE
        v_service_type := 'monthly_pass';
      END IF;
    ELSE
      -- Check for single visit payment
      SELECT id INTO v_payment_id
      FROM public.payments
      WHERE patient_id = v_patient_id
        AND payment_type = 'per_visit'
        AND status = 'succeeded'
      ORDER BY created_at DESC
      LIMIT 1;
    END IF;
  END IF;

  -- 7. Create exactly ONE escort_sessions row
  INSERT INTO public.escort_sessions (
    request_id,
    patient_id,
    pal_id,
    status,
    scheduled_start_at,
    included_minutes,
    service_type,
    membership_id,
    payment_id
  ) VALUES (
    p_request_id,
    v_patient_id,
    v_pal_id,
    'scheduled',
    now(),
    120,
    v_service_type,
    v_membership_id,
    v_payment_id
  )
  ON CONFLICT DO NOTHING
  RETURNING * INTO v_session;

  -- 8. Create notifications for patient and PAL
  IF v_req.patient_id IS NOT NULL THEN
    INSERT INTO public.notifications (user_id, title, message, type)
    VALUES (
      v_req.patient_id::text,
      'PAL Escort Matched!',
      'A companion PAL has accepted your request for ' || COALESCE(v_req.hospital_name, 'the hospital') || ' and is assigned to your appointment.',
      'success'
    );
  END IF;

  INSERT INTO public.notifications (user_id, title, message, type)
  VALUES (
    v_auth_uid::text,
    'Assignment Confirmed',
    'You accepted assignment for ' || COALESCE(v_req.patient_name, 'Patient') || ' at ' || COALESCE(v_req.hospital_name, 'the hospital') || '.',
    'success'
  );

  RETURN jsonb_build_object(
    'success', true,
    'request_id', p_request_id,
    'pal_id', v_pal_id,
    'session_id', v_session.id
  );
END;
$$;


-- =========================================================================
-- 5. ESCORT SESSION LIFECYCLE RPCs (Section 20, 21, 22)
-- =========================================================================

-- Start Escort: sets started_at = server now(), status = 'in_progress'
CREATE OR REPLACE FUNCTION public.start_escort_session(
  p_session_id uuid,
  p_lat double precision DEFAULT NULL,
  p_lng double precision DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_auth_uid uuid;
  v_pal_id integer;
  v_session record;
BEGIN
  v_auth_uid := auth.uid();
  IF v_auth_uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated.';
  END IF;

  SELECT id INTO v_pal_id FROM public.pals WHERE auth_user_id = v_auth_uid;

  SELECT * INTO v_session
  FROM public.escort_sessions
  WHERE id = p_session_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Escort session not found.';
  END IF;

  -- Ensure caller is the assigned PAL or admin
  IF v_session.pal_id <> v_pal_id AND NOT public.is_admin() THEN
    RAISE EXCEPTION 'Permission denied. You are not assigned to this escort session.';
  END IF;

  IF v_session.status <> 'scheduled' THEN
    RAISE EXCEPTION 'Session is already % and cannot be started again.', v_session.status;
  END IF;

  UPDATE public.escort_sessions
  SET status = 'in_progress',
      started_at = now(),
      start_latitude = COALESCE(p_lat, start_latitude),
      start_longitude = COALESCE(p_lng, start_longitude)
  WHERE id = p_session_id
  RETURNING * INTO v_session;

  -- Update associated request status to 'in_progress'
  UPDATE public.pal_requests
  SET status = 'in_progress'
  WHERE id = v_session.request_id;

  RETURN to_jsonb(v_session);
END;
$$;

-- Complete Escort: sets completed_at = server now(), calculates actual/overtime minutes
CREATE OR REPLACE FUNCTION public.complete_escort_session(
  p_session_id uuid,
  p_lat double precision DEFAULT NULL,
  p_lng double precision DEFAULT NULL,
  p_completion_notes text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_auth_uid uuid;
  v_pal_id integer;
  v_session record;
  v_actual_minutes integer;
  v_overtime_minutes integer;
BEGIN
  v_auth_uid := auth.uid();
  IF v_auth_uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated.';
  END IF;

  SELECT id INTO v_pal_id FROM public.pals WHERE auth_user_id = v_auth_uid;

  SELECT * INTO v_session
  FROM public.escort_sessions
  WHERE id = p_session_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Escort session not found.';
  END IF;

  IF v_session.pal_id <> v_pal_id AND NOT public.is_admin() THEN
    RAISE EXCEPTION 'Permission denied. You are not assigned to this escort session.';
  END IF;

  IF v_session.status <> 'in_progress' THEN
    RAISE EXCEPTION 'Only in-progress sessions can be completed. Current status: %', v_session.status;
  END IF;

  -- Calculate server duration
  v_actual_minutes := GREATEST(1, ROUND(EXTRACT(epoch FROM (now() - v_session.started_at)) / 60)::integer);
  v_overtime_minutes := GREATEST(0, v_actual_minutes - v_session.included_minutes);

  UPDATE public.escort_sessions
  SET status = 'completed',
      completed_at = now(),
      actual_minutes = v_actual_minutes,
      overtime_minutes = v_overtime_minutes,
      end_latitude = COALESCE(p_lat, end_latitude),
      end_longitude = COALESCE(p_lng, end_longitude),
      completion_notes = COALESCE(p_completion_notes, completion_notes)
  WHERE id = p_session_id
  RETURNING * INTO v_session;

  -- Update associated request status to 'completed'
  UPDATE public.pal_requests
  SET status = 'completed'
  WHERE id = v_session.request_id;

  -- End active location sessions for this request
  UPDATE public.location_sessions
  SET status = 'ended',
      ended_at = now(),
      sharing_enabled = false
  WHERE request_id = v_session.request_id::text
    AND status = 'active';

  RETURN to_jsonb(v_session);
END;
$$;


-- =========================================================================
-- 6. ROW LEVEL SECURITY (RLS) POLICIES (Section 27)
-- =========================================================================

-- Enable RLS on all relevant tables
ALTER TABLE public.pal_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.escort_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- -------------------------------------------------------------------------
-- POLICIES: pal_requests
-- -------------------------------------------------------------------------
DROP POLICY IF EXISTS "pal_requests_select_policy" ON public.pal_requests;
CREATE POLICY "pal_requests_select_policy" ON public.pal_requests
FOR SELECT USING (
  -- Verified PALs see all open pending requests OR their assigned requests
  (public.is_verified_pal() AND (status = 'pending' OR assigned_pal_id = auth.uid()))
  -- Patients see their own requests
  OR (patient_id::text = auth.uid()::text)
  -- Admins see all
  OR public.is_admin()
);

DROP POLICY IF EXISTS "pal_requests_insert_policy" ON public.pal_requests;
CREATE POLICY "pal_requests_insert_policy" ON public.pal_requests
FOR INSERT WITH CHECK (
  auth.uid() IS NOT NULL
);

DROP POLICY IF EXISTS "pal_requests_update_policy" ON public.pal_requests;
CREATE POLICY "pal_requests_update_policy" ON public.pal_requests
FOR UPDATE USING (
  -- Assigned PAL or Admin can update
  assigned_pal_id = auth.uid()
  OR public.is_admin()
  OR (status = 'pending' AND public.is_verified_pal())
);

-- -------------------------------------------------------------------------
-- POLICIES: escort_sessions
-- -------------------------------------------------------------------------
DROP POLICY IF EXISTS "escort_sessions_select_policy" ON public.escort_sessions;
CREATE POLICY "escort_sessions_select_policy" ON public.escort_sessions
FOR SELECT USING (
  pal_id = public.get_current_pal_id()
  OR patient_id = public.get_current_patient_id()
  OR EXISTS (
    SELECT 1 FROM public.pal_requests pr
    WHERE pr.id = escort_sessions.request_id
      AND pr.patient_id::text = auth.uid()::text
  )
  OR public.is_admin()
);

DROP POLICY IF EXISTS "escort_sessions_update_policy" ON public.escort_sessions;
CREATE POLICY "escort_sessions_update_policy" ON public.escort_sessions
FOR UPDATE USING (
  pal_id = public.get_current_pal_id()
  OR public.is_admin()
);

-- -------------------------------------------------------------------------
-- POLICIES: payments
-- -------------------------------------------------------------------------
DROP POLICY IF EXISTS "payments_select_policy" ON public.payments;
CREATE POLICY "payments_select_policy" ON public.payments
FOR SELECT USING (
  patient_id = public.get_current_patient_id()
  OR public.is_admin()
);

-- -------------------------------------------------------------------------
-- POLICIES: memberships
-- -------------------------------------------------------------------------
DROP POLICY IF EXISTS "memberships_select_policy" ON public.memberships;
CREATE POLICY "memberships_select_policy" ON public.memberships
FOR SELECT USING (
  patient_id = public.get_current_patient_id()
  OR public.is_admin()
);

-- -------------------------------------------------------------------------
-- POLICIES: notifications
-- -------------------------------------------------------------------------
DROP POLICY IF EXISTS "notifications_select_policy" ON public.notifications;
CREATE POLICY "notifications_select_policy" ON public.notifications
FOR SELECT USING (
  user_id = auth.uid()::text
  OR public.is_admin()
);

DROP POLICY IF EXISTS "notifications_update_policy" ON public.notifications;
CREATE POLICY "notifications_update_policy" ON public.notifications
FOR UPDATE USING (
  user_id = auth.uid()::text
  OR public.is_admin()
);

DROP POLICY IF EXISTS "notifications_insert_policy" ON public.notifications;
CREATE POLICY "notifications_insert_policy" ON public.notifications
FOR INSERT WITH CHECK (
  auth.uid() IS NOT NULL
);

-- -------------------------------------------------------------------------
-- POLICIES: pals
-- -------------------------------------------------------------------------
DROP POLICY IF EXISTS "pals_select_policy" ON public.pals;
CREATE POLICY "pals_select_policy" ON public.pals
FOR SELECT USING (
  -- Anyone authenticated can view active verified pals
  background_check_status IN ('cleared', 'approved', 'active')
  -- PAL can view their own record
  OR auth_user_id = auth.uid()
  -- Admins can view all
  OR public.is_admin()
);

DROP POLICY IF EXISTS "pals_update_policy" ON public.pals;
CREATE POLICY "pals_update_policy" ON public.pals
FOR UPDATE USING (
  auth_user_id = auth.uid()
  OR public.is_admin()
);

-- -------------------------------------------------------------------------
-- POLICIES: matches
-- -------------------------------------------------------------------------
DROP POLICY IF EXISTS "matches_select_policy" ON public.matches;
CREATE POLICY "matches_select_policy" ON public.matches
FOR SELECT USING (
  pal_id = public.get_current_pal_id()
  OR EXISTS (
    SELECT 1 FROM public.pal_requests pr
    WHERE pr.id = matches.request_id
      AND pr.patient_id::text = auth.uid()::text
  )
  OR public.is_admin()
);
