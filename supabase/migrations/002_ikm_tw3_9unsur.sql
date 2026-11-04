-- ========================================================
-- Supabase Schema: 9 Unsur IKM MenPAN-RB (Kelurahan Lebakgede)
-- ========================================================

-- 1. Buat Tabel survey_responses
CREATE TABLE IF NOT EXISTS public.survey_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    survey_date DATE DEFAULT CURRENT_DATE,
    survey_time TIME DEFAULT CURRENT_TIME,

    -- Data Demografi Responden
    gender VARCHAR(50),
    age VARCHAR(50),
    education VARCHAR(50),
    service_type VARCHAR(150),

    -- 9 Unsur Pelayanan Publik (Skala 1 - 4)
    u1 SMALLINT NOT NULL CHECK (u1 BETWEEN 1 AND 4), -- Persyaratan
    u2 SMALLINT NOT NULL CHECK (u2 BETWEEN 1 AND 4), -- Prosedur
    u3 SMALLINT NOT NULL CHECK (u3 BETWEEN 1 AND 4), -- Waktu Pelayanan
    u4 SMALLINT NOT NULL CHECK (u4 BETWEEN 1 AND 4), -- Biaya/Tarif
    u5 SMALLINT NOT NULL CHECK (u5 BETWEEN 1 AND 4), -- Produk Spesifikasi Layanan
    u6 SMALLINT NOT NULL CHECK (u6 BETWEEN 1 AND 4), -- Kompetensi Pelaksana
    u7 SMALLINT NOT NULL CHECK (u7 BETWEEN 1 AND 4), -- Perilaku Pelaksana (Sopan/Ramah)
    u8 SMALLINT NOT NULL CHECK (u8 BETWEEN 1 AND 4), -- Sarana dan Prasarana
    u9 SMALLINT NOT NULL CHECK (u9 BETWEEN 1 AND 4), -- Penanganan Pengaduan

    -- Saran dan Masukan
    saran TEXT,

    -- Metadata Teknis (Opsional)
    user_agent TEXT,
    ip_hash VARCHAR(64)
);

-- 2. Index untuk kecepatan query tanggal & filter
CREATE INDEX IF NOT EXISTS idx_survey_responses_created_at 
    ON public.survey_responses(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_survey_responses_service 
    ON public.survey_responses(service_type);

-- 3. Aktifkan Row Level Security (RLS)
ALTER TABLE public.survey_responses ENABLE ROW LEVEL SECURITY;

-- 4. Kebijakan RLS:
-- Izinkan publik / siapapun (anon) mengisi formulir survei (INSERT)
CREATE POLICY "Allow public insert to survey_responses" 
    ON public.survey_responses 
    FOR INSERT 
    WITH CHECK (true);

-- Izinkan Service Role / Admin melihat seluruh data survei (SELECT)
CREATE POLICY "Allow service role read all survey_responses" 
    ON public.survey_responses 
    FOR SELECT 
    USING (true);

-- Izinkan Service Role melakukan modifikasi data (UPDATE/DELETE jika diperlukan)
CREATE POLICY "Allow service role manage survey_responses" 
    ON public.survey_responses 
    FOR ALL 
    USING (auth.role() = 'service_role' OR auth.role() = 'authenticated');
