-- ========================================================
-- Supabase Schema: 9 Unsur IKM MenPAN-RB (Kelurahan Lebakgede)
-- Format: Indonesian naming + numeric 1-4 scale
-- Includes: survey_responses table + auto-generated id_responden
-- 
-- FOKUS: Hanya untuk menyimpan data responden survei IKM
-- ========================================================

-- ========================================================
-- TABLE: survey_responses (Data Responden IKM)
-- ========================================================
CREATE TABLE IF NOT EXISTS public.survey_responses (
    -- Primary & Tracking
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    survey_date DATE DEFAULT CURRENT_DATE,
    survey_time TIME DEFAULT CURRENT_TIME,

    -- Auto-generated Respondent ID (RESPYYYYMMDDXXXXX)
    id_responden VARCHAR(50),

    -- Data Demografi Responden (Indonesian naming)
    jenis_kelamin VARCHAR(50),           -- Laki-laki / Perempuan
    usia VARCHAR(50),                    -- Umur responden
    pendidikan VARCHAR(50),              -- SD / SMP / SMA / S1 / dll
    jenis_layanan VARCHAR(150),          -- Jenis pelayanan yang diambil

    -- 9 Unsur Penilaian IKM (Skala 1 - 4, numeric)
    u1 SMALLINT NOT NULL CHECK (u1 BETWEEN 1 AND 4), -- Kesesuaian persyaratan
    u2 SMALLINT NOT NULL CHECK (u2 BETWEEN 1 AND 4), -- Kemudahan prosedur
    u3 SMALLINT NOT NULL CHECK (u3 BETWEEN 1 AND 4), -- Kecepatan waktu pelayanan
    u4 SMALLINT NOT NULL CHECK (u4 BETWEEN 1 AND 4), -- Kewajaran biaya/tarif
    u5 SMALLINT NOT NULL CHECK (u5 BETWEEN 1 AND 4), -- Kesesuaian produk pelayanan
    u6 SMALLINT NOT NULL CHECK (u6 BETWEEN 1 AND 4), -- Kompetensi petugas
    u7 SMALLINT NOT NULL CHECK (u7 BETWEEN 1 AND 4), -- Perilaku/keramahan petugas
    u8 SMALLINT NOT NULL CHECK (u8 BETWEEN 1 AND 4), -- Kualitas sarana prasarana
    u9 SMALLINT NOT NULL CHECK (u9 BETWEEN 1 AND 4), -- Penanganan pengaduan

    -- Saran dan Masukan dari Responden
    saran TEXT,

    -- Metadata Teknis
    user_agent TEXT,
    ip_hash VARCHAR(64)
);

-- ========================================================
-- INDEXES: Optimasi Query
-- ========================================================
CREATE INDEX IF NOT EXISTS idx_survey_responses_created_at 
    ON public.survey_responses(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_survey_responses_jenis_layanan 
    ON public.survey_responses(jenis_layanan);

CREATE INDEX IF NOT EXISTS idx_survey_responses_jenis_kelamin 
    ON public.survey_responses(jenis_kelamin);

CREATE INDEX IF NOT EXISTS idx_survey_responses_usia 
    ON public.survey_responses(usia);

CREATE INDEX IF NOT EXISTS idx_survey_responses_id_responden 
    ON public.survey_responses(id_responden);

-- ========================================================
-- TRIGGER FUNCTION: Auto-generate id_responden
-- Format: RESPYYYYMMDDXXXXX (contoh: RESP20261110000001)
-- ========================================================

CREATE OR REPLACE FUNCTION public.generate_monthly_respondent_code()
RETURNS TRIGGER AS $$
DECLARE
    cur_date_str TEXT;
    month_prefix TEXT;
    next_seq INT;
    new_code TEXT;
BEGIN
    -- Jika id_responden sudah diset, gunakan yang ada
    IF NEW.id_responden IS NOT NULL AND NEW.id_responden <> '' THEN
        RETURN NEW;
    END IF;

    -- Format tanggal: YYYYMMDD
    cur_date_str := to_char(COALESCE(NEW.created_at, CURRENT_TIMESTAMP), 'YYYYMMDD');
    month_prefix := 'RESP' || to_char(COALESCE(NEW.created_at, CURRENT_TIMESTAMP), 'YYYYMM');

    -- Hitung urutan dalam bulan ini
    SELECT COUNT(*) + 1 INTO next_seq
    FROM public.survey_responses
    WHERE id_responden LIKE (month_prefix || '%');

    -- Gabungkan: RESP + YYYYMMDD + 5 digit urutan
    new_code := 'RESP' || cur_date_str || LPAD(next_seq::TEXT, 5, '0');
    NEW.id_responden := new_code;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ========================================================
-- TRIGGER: Pasang BEFORE INSERT
-- ========================================================

DROP TRIGGER IF EXISTS trg_generate_respondent_code ON public.survey_responses;
CREATE TRIGGER trg_generate_respondent_code
BEFORE INSERT ON public.survey_responses
FOR EACH ROW
EXECUTE FUNCTION public.generate_monthly_respondent_code();

-- ========================================================
-- RLS: Row Level Security
-- ========================================================

-- Enable RLS pada tabel
ALTER TABLE public.survey_responses ENABLE ROW LEVEL SECURITY;

-- Policy 1: Public (anonymous) bisa INSERT survei
CREATE POLICY "Allow public insert survey" 
    ON public.survey_responses 
    FOR INSERT 
    WITH CHECK (true);

-- Policy 2: Service role (backend) bisa read/modify semua
CREATE POLICY "Allow service role full access" 
    ON public.survey_responses 
    FOR ALL 
    USING (auth.role() = 'service_role');

-- ========================================================
-- COMMENTS: Dokumentasi Kolom
-- ========================================================

COMMENT ON TABLE public.survey_responses IS 'Data responden IKM - Survei Kepuasan Masyarakat 9 Unsur MenPAN-RB dengan auto-generated id_responden';

COMMENT ON COLUMN public.survey_responses.id_responden IS 'Respondent ID auto-generated: RESPYYYYMMDDXXXXX (contoh: RESP20261110000001)';
COMMENT ON COLUMN public.survey_responses.u1 IS 'Kesesuaian persyaratan pelayanan dengan kebutuhan masyarakat (1=tidak sesuai, 4=sangat sesuai)';
COMMENT ON COLUMN public.survey_responses.u2 IS 'Kemudahan prosedur pelayanan (1=tidak mudah, 4=sangat mudah)';
COMMENT ON COLUMN public.survey_responses.u3 IS 'Kecepatan waktu pelayanan (1=tidak cepat, 4=sangat cepat)';
COMMENT ON COLUMN public.survey_responses.u4 IS 'Kewajaran biaya/tarif pelayanan (1=sangat mahal, 4=gratis)';
COMMENT ON COLUMN public.survey_responses.u5 IS 'Kesesuaian produk spesifikasi pelayanan (1=tidak sesuai, 4=sangat sesuai)';
COMMENT ON COLUMN public.survey_responses.u6 IS 'Kompetensi pelaksana pelayanan (1=tidak kompeten, 4=sangat kompeten)';
COMMENT ON COLUMN public.survey_responses.u7 IS 'Perilaku/keramahan pelaksana pelayanan (1=tidak sopan, 4=sangat sopan)';
COMMENT ON COLUMN public.survey_responses.u8 IS 'Kualitas sarana prasarana pelayanan (1=buruk, 4=sangat baik)';
COMMENT ON COLUMN public.survey_responses.u9 IS 'Penanganan pengaduan/keluhan (1=tidak ada, 4=dikelola baik)';
