-- ========================================================
-- Migration 005: Recreate survey_responses
-- Menempatkan id_responden (format RESPYYYYMMDDXXXXX) 
-- sebagai kolom kedua setelah id (UUID)
-- 
-- ⚠️ PERINGATAN: Migration ini MENGHAPUS semua data!
-- Hanya gunakan saat tahap uji coba (tidak ada data penting)
-- ========================================================

-- 1. Hapus trigger dan fungsi lama
DROP TRIGGER IF EXISTS trg_generate_respondent_code ON public.survey_responses;
DROP FUNCTION IF EXISTS public.generate_monthly_respondent_code();

-- 2. Hapus tabel lama beserta seluruh datanya
DROP TABLE IF EXISTS public.survey_responses CASCADE;

-- 3. Buat ulang tabel dengan id_responden di posisi kedua
CREATE TABLE public.survey_responses (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_responden    VARCHAR(50),                                   -- Format: RESPYYYYMMDDXXXXX

    -- Waktu pengisian
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    survey_date     DATE DEFAULT CURRENT_DATE,
    survey_time     TIME DEFAULT CURRENT_TIME,

    -- Data Demografi Responden
    gender          VARCHAR(50),
    age             VARCHAR(50),
    education       VARCHAR(50),
    service_type    VARCHAR(150),

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
    saran           TEXT,

    -- Metadata Teknis (Opsional)
    user_agent      TEXT,
    ip_hash         VARCHAR(64)
);

-- 4. Index untuk performa query
CREATE INDEX idx_survey_responses_created_at   ON public.survey_responses(created_at DESC);
CREATE INDEX idx_survey_responses_service      ON public.survey_responses(service_type);
CREATE INDEX idx_survey_responses_id_responden ON public.survey_responses(id_responden);

-- 5. Aktifkan Row Level Security (RLS)
ALTER TABLE public.survey_responses ENABLE ROW LEVEL SECURITY;

-- 6. Kebijakan RLS
CREATE POLICY "Allow public insert to survey_responses"
    ON public.survey_responses FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow service role read all survey_responses"
    ON public.survey_responses FOR SELECT USING (true);

CREATE POLICY "Allow service role manage survey_responses"
    ON public.survey_responses FOR ALL
    USING (auth.role() = 'service_role' OR auth.role() = 'authenticated');

-- 7. Fungsi trigger: auto-generate id_responden saat INSERT
CREATE OR REPLACE FUNCTION public.generate_monthly_respondent_code()
RETURNS TRIGGER AS $$
DECLARE
    cur_date_str TEXT;
    month_prefix TEXT;
    next_seq     INT;
    new_code     TEXT;
BEGIN
    -- Jika id_responden sudah diset oleh backend, pakai yang sudah ada
    IF NEW.id_responden IS NOT NULL AND NEW.id_responden <> '' THEN
        RETURN NEW;
    END IF;

    -- Format tanggal: YYYYMMDD dan prefix bulan YYYYMM
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

-- 8. Pasang trigger BEFORE INSERT
CREATE TRIGGER trg_generate_respondent_code
BEFORE INSERT ON public.survey_responses
FOR EACH ROW
EXECUTE FUNCTION public.generate_monthly_respondent_code();
