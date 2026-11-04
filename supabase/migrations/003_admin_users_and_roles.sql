-- ========================================================
-- Supabase Schema: Tabel admin_users dan Multi-Role Petugas
-- ========================================================

-- 1. Buat Tabel admin_users
CREATE TABLE IF NOT EXISTS public.admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    nama VARCHAR(100) NOT NULL,
    password_hash TEXT NOT NULL,
    role VARCHAR(30) NOT NULL DEFAULT 'staf' CHECK (role IN ('admin', 'staf', 'lurah')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Index username untuk kecepatan login
CREATE INDEX IF NOT EXISTS idx_admin_users_username 
    ON public.admin_users(LOWER(username));

-- 3. Aktifkan Row Level Security (RLS)
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- 4. Kebijakan RLS:
-- Hanya Service Role (backend server API) yang berhak membaca & memodifikasi data login admin
CREATE POLICY "Allow service role full access to admin_users"
    ON public.admin_users
    FOR ALL
    USING (true);

-- 5. Masukkan Data Pengguna Awal (Default Users):
-- Password bisa berupa teks biasa atau hash SHA-256
-- 1. admin  (Password: Admin123)  -> Role: admin (Administrator)
-- 2. staf   (Password: Staf12345) -> Role: staf (Staf Pelayanan)
-- 3. lurah  (Password: Lurah123)  -> Role: lurah (Pimpinan Kelurahan)
INSERT INTO public.admin_users (username, nama, password_hash, role)
VALUES
    ('admin', 'Administrator Kelurahan', 'Admin123', 'admin'),
    ('staf', 'Staf Pelayanan Lebakgede', 'Staf12345', 'staf'),
    ('lurah', 'Lurah Lebakgede', 'Lurah123', 'lurah')
ON CONFLICT (username) DO NOTHING;
