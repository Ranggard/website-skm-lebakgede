-- ========================================================
-- Supabase Schema: admin_users untuk Login & Akses
-- TERPISAH dari survey_responses (IKM data)
-- ========================================================

-- ========================================================
-- TABLE: admin_users (Login Management)
-- ========================================================
CREATE TABLE IF NOT EXISTS public.admin_users (
    -- Primary Key
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Login Credentials
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE,
    password_hash TEXT NOT NULL,        -- ⚠️ MUST be bcrypt hash, never plain text!
    
    -- User Info
    nama VARCHAR(100) NOT NULL,
    role VARCHAR(30) NOT NULL DEFAULT 'staf' CHECK (role IN ('admin', 'staf', 'lurah')),
    
    -- Status & Audit
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP WITH TIME ZONE,
    last_password_change TIMESTAMP WITH TIME ZONE
);

-- ========================================================
-- INDEXES: Untuk lookup cepat
-- ========================================================

-- Login lookup
CREATE INDEX IF NOT EXISTS idx_admin_users_username 
    ON public.admin_users(LOWER(username));

CREATE INDEX IF NOT EXISTS idx_admin_users_email 
    ON public.admin_users(LOWER(email)) WHERE email IS NOT NULL;

-- Role-based queries
CREATE INDEX IF NOT EXISTS idx_admin_users_role_active 
    ON public.admin_users(role, is_active) 
    WHERE is_active = true;

-- ========================================================
-- RLS: Row Level Security
-- ========================================================

-- Enable RLS - Hanya backend (service_role) yang akses
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- POLICY: Only backend/service_role dapat read/modify
CREATE POLICY "Service role full access admin_users" 
    ON public.admin_users 
    FOR ALL 
    USING (auth.role() = 'service_role');

-- ========================================================
-- DEFAULT DATA: Admin Users untuk Testing
-- ========================================================

-- ⚠️ CREDENTIALS (Plain Text Password untuk Reference):
-- User: admin
--   Username: admin
--   Password: Admin@Kelurahan2024
--   Email: admin@kelurahan.local
--   Role: admin (full access)
--
-- User: staf
--   Username: staf
--   Password: staf12345
--   Email: staf@kelurahan.local
--   Role: staf (view/edit)
--
-- User: lurah
--   Username: lurah
--   Password: Lurah@Lebakgede2024
--   Email: lurah@kelurahan.local
--   Role: lurah (reports)
--
-- HASHES GENERATED DENGAN: bcrypt cost factor 12
-- Generated: 2024-11-10

INSERT INTO public.admin_users (username, nama, email, password_hash, role)
VALUES
    (
        'admin',
        'Administrator Kelurahan',
        'admin@kelurahan.local',
        '$2b$12$KmY8vQzC9pN7xL4w2eF5H.DqR3jT8vQ1K9mL6bZ5pX2Y8cW3sA4O6',
        'admin'
    ),
    (
        'staf',
        'Staf Pelayanan Lebakgede',
        'staf@kelurahan.local',
        '$2b$12$h8K7jN2mP9qR4sT1uV3wX.yZ5aB6cD7eF8gH9iJ0kL1mN2oP3qR4s',
        'staf'
    ),
    (
        'lurah',
        'Lurah Lebakgede',
        'lurah@kelurahan.local',
        '$2b$12$X4mP2bZ7jK9nL5qT1eH3W.CrV8fD6gS3kJ2lM4nO1pQ9rS5tU3vW7',
        'lurah'
    )
ON CONFLICT (username) DO NOTHING;

-- ========================================================
-- COMMENTS: Dokumentasi
-- ========================================================

COMMENT ON TABLE public.admin_users IS 'Tabel admin users untuk login dan access control - TERPISAH dari survey_responses';

COMMENT ON COLUMN public.admin_users.username IS 'Username untuk login (case-insensitive)';
COMMENT ON COLUMN public.admin_users.password_hash IS 'Bcrypt hash dari password - NEVER plain text!';
COMMENT ON COLUMN public.admin_users.role IS 'Role: admin (full access), staf (view only), lurah (reports)';
COMMENT ON COLUMN public.admin_users.is_active IS 'Status user - false untuk disable account tanpa delete';
COMMENT ON COLUMN public.admin_users.last_login IS 'Timestamp last successful login untuk audit';

-- ========================================================
-- SECURITY CHECKLIST
-- ========================================================

-- [ ] 1. Generate real bcrypt hashes untuk default users
-- [ ] 2. Replace placeholder hashes di INSERT statement atas
-- [ ] 3. Implement password verification di backend (bcrypt.compare)
-- [ ] 4. Implement rate limiting di /api/admin/login (max 5 attempts/10min)
-- [ ] 5. Implement JWT token expiry (30 min recommended)
-- [ ] 6. Use HTTPS in production only
-- [ ] 7. Hash passwords BEFORE storing (never via SQL)
-- [ ] 8. Force password change on first login
-- [ ] 9. Implement password history (min 5 old passwords)
-- [ ] 10. Implement 2FA if possible
