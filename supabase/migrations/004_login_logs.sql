-- Migration 004: Tabel login_logs untuk mencatat riwayat login & logout pengguna admin/staf

CREATE TABLE IF NOT EXISTS public.login_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT NOT NULL,
  login_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  logout_time TIMESTAMPTZ,
  ip_address TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed'))
);

CREATE INDEX IF NOT EXISTS idx_login_logs_username ON public.login_logs (username);
CREATE INDEX IF NOT EXISTS idx_login_logs_login_time ON public.login_logs (login_time DESC);

ALTER TABLE public.login_logs ENABLE ROW LEVEL SECURITY;

-- Izinkan akses penuh untuk service_role / backend API
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'login_logs' AND policyname = 'Allow service role full access on login_logs'
  ) THEN
    CREATE POLICY "Allow service role full access on login_logs"
      ON public.login_logs
      FOR ALL
      USING (true)
      WITH CHECK (true);
  END IF;
END
$$;
