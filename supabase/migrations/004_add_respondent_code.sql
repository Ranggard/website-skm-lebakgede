-- ========================================================
-- Supabase Migration: Tambah Kolom respondent_code
-- Format: RESPYYYYMMDDXXXXX (contoh: RESP2026111000001)
-- Reset setiap pergantian bulan
-- ========================================================

-- 1. Tambah kolom respondent_code jika belum ada
ALTER TABLE public.survey_responses 
ADD COLUMN IF NOT EXISTS respondent_code VARCHAR(50);

-- 2. Index untuk pencarian cepat berdasarkan respondent_code
CREATE INDEX IF NOT EXISTS idx_survey_responses_code 
ON public.survey_responses(respondent_code);

-- 3. Fungsi generator kode responden bulanan otomatis (PostgreSQL trigger fallback)
CREATE OR REPLACE FUNCTION public.generate_monthly_respondent_code()
RETURNS TRIGGER AS $$
DECLARE
    cur_date_str TEXT;
    month_prefix TEXT;
    next_seq INT;
    new_code TEXT;
BEGIN
    -- Jika respondent_code sudah diset oleh backend, gunakan yang sudah ada
    IF NEW.respondent_code IS NOT NULL AND NEW.respondent_code <> '' THEN
        RETURN NEW;
    END IF;

    -- Format tanggal: YYYYMMDD dan prefix bulan YYYYMM
    cur_date_str := to_char(COALESCE(NEW.created_at, CURRENT_TIMESTAMP), 'YYYYMMDD');
    month_prefix := 'RESP' || to_char(COALESCE(NEW.created_at, CURRENT_TIMESTAMP), 'YYYYMM');

    -- Hitung jumlah entri dalam bulan yang sama untuk menentukan urutan berikutnya
    SELECT COUNT(*) + 1 INTO next_seq
    FROM public.survey_responses
    WHERE respondent_code LIKE (month_prefix || '%');

    -- Gabungkan kode: RESP + YYYYMMDD + 5 digit nomor urut
    new_code := 'RESP' || cur_date_str || LPAD(next_seq::TEXT, 5, '0');
    NEW.respondent_code := new_code;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Pasang trigger sebelum insert ke survey_responses
DROP TRIGGER IF EXISTS trg_generate_respondent_code ON public.survey_responses;
CREATE TRIGGER trg_generate_respondent_code
BEFORE INSERT ON public.survey_responses
FOR EACH ROW
EXECUTE FUNCTION public.generate_monthly_respondent_code();

-- 5. Berikan default kode untuk data lama yang belum memiliki respondent_code
UPDATE public.survey_responses
SET respondent_code = 'RESP' || to_char(created_at, 'YYYYMMDD') || LPAD(row_num::TEXT, 5, '0')
FROM (
    SELECT id, ROW_NUMBER() OVER (
        PARTITION BY to_char(created_at, 'YYYYMM') 
        ORDER BY created_at ASC
    ) AS row_num
    FROM public.survey_responses
    WHERE respondent_code IS NULL OR respondent_code = ''
) sub
WHERE public.survey_responses.id = sub.id
  AND (public.survey_responses.respondent_code IS NULL OR public.survey_responses.respondent_code = '');

