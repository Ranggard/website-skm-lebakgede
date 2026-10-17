/**
 * Google Apps Script Scaffold for SKM Questionnaire Backend
 * 
 * This script handles form submissions from the Next.js frontend,
 * validates data, calculates scores, and appends responses to Google Sheet.
 * 
 * SETUP INSTRUCTIONS:
 * 1. Create a new Google Apps Script project at script.google.com
 * 2. Copy this entire file into the script editor (replace default Code.gs)
 * 3. Create a Google Sheet with the data structure defined in Data.gs
 * 4. Link this script to the sheet (click sheet icon and select your sheet)
 * 5. Deploy as web app:
 *    - Click "Deploy" > "New Deployment"
 *    - Type: "Web app"
 *    - Execute as: your Google account
 *    - Who has access: "Anyone"
 *    - Copy the deployment URL and add to GOOGLE_APPS_SCRIPT_URL env var
 * 6. Set up Triggers:
 *    - Click "Triggers" (clock icon)
 *    - Create trigger: recalculateAnalytics, Time-driven, Hourly
 */

// ============================================================================
// CONFIGURATION
// ============================================================================

const SHEET_NAME = 'responses';
const ANALYTICS_SHEET_NAME = 'analytics';
const SPREADSHEET_ID = '1GyQ0A2gGkTzueYkijoqXKd2FzUPPmHp5QirCMTkWOJ0';

// Admin token for data access (set this in deployment)
const ADMIN_TOKEN = 'admin-token-skm-questionnaire-default-12345678';

// Logging configuration
const ENABLE_DEBUG_LOGGING = true;
const LOG_SHEET_NAME = 'debug_logs';

// ============================================================================
// MAIN HTTP HANDLER
// ============================================================================

/**
 * Main entry point for POST requests from Next.js frontend
 * Handles form submissions and administrative queries
 * 
 * Request format (from Next.js /api/submit endpoint):
 * {
 *   "q1_accessibility": 4,
 *   "q2_service_quality": 5,
 *   "q3_professionalism": 4,
 *   "q4_courtesy": 5,
 *   "q5_reliability": 4,
 *   "q6_security": 3,
 *   "q7_response_time": 5,
 *   "q8_facilities": 4,
 *   "q9_suggestions": "Optional feedback text",
 *   "demographic_age": "25-34",
 *   "demographic_service": "Health"
 * }
 */
function doPost(e) {
  try {
    logDebug('Received POST request', {
      contentLength: e.postData?.length,
      contentType: e.postData?.type,
    });

    // Parse request body
    let requestBody;
    try {
      requestBody = JSON.parse(e.postData.contents);
      logDebug('Parsed request body', { keys: Object.keys(requestBody) });
    } catch (parseError) {
      return createErrorResponse(400, 'Invalid JSON in request body', parseError.message);
    }

    // Validate request structure
    const validationResult = validateQuestionnaireResponse(requestBody);
    if (!validationResult.isValid) {
      logDebug('Validation failed', { errors: validationResult.errors });
      return createErrorResponse(400, 'Validation failed', validationResult.errors);
    }

    // Enrich response with system data
    const enrichedResponse = enrichQuestionnaireResponse(requestBody);
    logDebug('Enriched response', { id: enrichedResponse.id, timestamp: enrichedResponse.timestamp });

    // Calculate overall score
    const overallScore = calculateOverallScore(enrichedResponse);
    enrichedResponse.overall_score = overallScore;

    // Append to sheet
    const rowIndex = appendResponseToSheet(enrichedResponse);
    logDebug('Appended to sheet', { rowIndex, responseId: enrichedResponse.id });

    // Return success response
    return createSuccessResponse({
      id: enrichedResponse.id,
      timestamp: enrichedResponse.timestamp,
      overallScore: overallScore,
      rowIndex: rowIndex,
      message: 'Response submitted successfully',
    });
  } catch (error) {
    const errorMsg = `Unhandled error in doPost: ${error.message}`;
    logError(errorMsg, error);
    return createErrorResponse(500, 'Internal server error', error.message);
  }
}

/**
 * Optional: GET handler for health checks and analytics queries
 * Supports basic admin queries with token authentication
 */
function doGet(e) {
  try {
    const action = e.parameter?.action;
    const token = e.parameter?.token;

    logDebug('Received GET request', { action, tokenProvided: !!token });

    // Health check endpoint (no auth required)
    if (action === 'health') {
      return createSuccessResponse({
        status: 'ok',
        timestamp: new Date().toISOString(),
        backend: 'google-sheets',
      });
    }

    // Protected endpoints require admin token
    if (action === 'analytics' || action === 'debug') {
      if (!token || token !== ADMIN_TOKEN) {
        logDebug('Unauthorized access attempt', { action });
        return createErrorResponse(401, 'Unauthorized', 'Invalid or missing admin token');
      }
    }

    // Admin: retrieve analytics data
    if (action === 'analytics') {
      const analytics = getAnalyticsData();
      return createSuccessResponse(analytics);
    }

    // Admin: retrieve debug logs
    if (action === 'debug') {
      const logs = getDebugLogs();
      return createSuccessResponse({ logs, count: logs.length });
    }

    // Admin: clear debug logs
    if (action === 'clear-logs') {
      clearDebugLogs();
      return createSuccessResponse({ message: 'Debug logs cleared' });
    }

    return createErrorResponse(404, 'Not found', `Unknown action: ${action}`);
  } catch (error) {
    const errorMsg = `Unhandled error in doGet: ${error.message}`;
    logError(errorMsg, error);
    return createErrorResponse(500, 'Internal server error', error.message);
  }
}

// ============================================================================
// VALIDATION
// ============================================================================

/**
 * Validates incoming questionnaire response
 * Ensures all required fields are present and within valid ranges
 */
function validateQuestionnaireResponse(data) {
  const errors = {};

  // Required SKM core questions (1-5 rating)
  const requiredQuestions = [
    'q1_accessibility',
    'q2_service_quality',
    'q3_professionalism',
    'q4_courtesy',
    'q5_reliability',
    'q6_security',
    'q7_response_time',
    'q8_facilities',
  ];

  for (const question of requiredQuestions) {
    const value = data[question];

    if (value === undefined || value === null) {
      errors[question] = 'Required field missing';
      continue;
    }

    const numValue = Number(value);
    if (!Number.isInteger(numValue) || numValue < 1 || numValue > 5) {
      errors[question] = 'Must be integer between 1 and 5';
    }
  }

  // Optional fields validation
  if (data.q9_suggestions && typeof data.q9_suggestions !== 'string') {
    errors.q9_suggestions = 'Must be a string';
  }

  if (data.q9_suggestions && data.q9_suggestions.length > 1000) {
    errors.q9_suggestions = 'Text too long (max 1000 characters)';
  }

  if (data.demographic_age && data.demographic_age.length > 50) {
    errors.demographic_age = 'Value too long (max 50 characters)';
  }

  if (data.demographic_service && data.demographic_service.length > 100) {
    errors.demographic_service = 'Value too long (max 100 characters)';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors: Object.keys(errors).length > 0 ? errors : null,
  };
}

// ============================================================================
// DATA MAPPING & FORMATTING HELPERS
// ============================================================================

/**
 * Daftar teks pilihan jawaban unsur SKM (Permenpan RB No. 14 Tahun 2017)
 */
const LABEL_MAP = {
  pendidikan: {
    'SD': 'SD / Sederajat',
    'SMP': 'SMP / Sederajat',
    'SMA': 'SMA / Sederajat',
    'D1-D3': 'D1 - D3',
    'S1': 'S1 / D4',
    'S2': 'S2',
    'S3': 'S3'
  },
  q1: {
    '1': 'Tidak Sesuai',
    '2': 'Kurang Sesuai',
    '3': 'Sesuai',
    '4': 'Sangat Sesuai',
    'A': 'Tidak Sesuai',
    'B': 'Kurang Sesuai',
    'C': 'Sesuai',
    'D': 'Sangat Sesuai'
  },
  q2: {
    '1': 'Tidak Mudah',
    '2': 'Kurang Mudah',
    '3': 'Mudah',
    '4': 'Sangat Mudah',
    'A': 'Tidak Mudah',
    'B': 'Kurang Mudah',
    'C': 'Mudah',
    'D': 'Sangat Mudah'
  },
  q3: {
    '1': 'Tidak Cepat',
    '2': 'Kurang Cepat',
    '3': 'Cepat',
    '4': 'Sangat Cepat',
    'A': 'Tidak Cepat',
    'B': 'Kurang Cepat',
    'C': 'Cepat',
    'D': 'Sangat Cepat'
  },
  q4: {
    '1': 'Sangat Mahal',
    '2': 'Cukup Mahal',
    '3': 'Murah',
    '4': 'Gratis',
    'A': 'Sangat Mahal',
    'B': 'Cukup Mahal',
    'C': 'Murah',
    'D': 'Gratis'
  },
  q5: {
    '1': 'Tidak Sesuai',
    '2': 'Kurang Sesuai',
    '3': 'Sesuai',
    '4': 'Sangat Sesuai',
    'A': 'Tidak Sesuai',
    'B': 'Kurang Sesuai',
    'C': 'Sesuai',
    'D': 'Sangat Sesuai'
  },
  q6: {
    '1': 'Tidak Kompeten',
    '2': 'Kurang Kompeten',
    '3': 'Kompeten',
    '4': 'Sangat Kompeten',
    'A': 'Tidak Kompeten',
    'B': 'Kurang Kompeten',
    'C': 'Kompeten',
    'D': 'Sangat Kompeten'
  },
  q7: {
    '1': 'Tidak Sopan',
    '2': 'Kurang Sopan',
    '3': 'Sopan',
    '4': 'Sangat Sopan',
    'A': 'Tidak Sopan',
    'B': 'Kurang Sopan',
    'C': 'Sopan',
    'D': 'Sangat Sopan'
  },
  q8: {
    '1': 'Buruk',
    '2': 'Cukup',
    '3': 'Baik',
    '4': 'Sangat Baik',
    'A': 'Buruk',
    'B': 'Cukup',
    'C': 'Baik',
    'D': 'Sangat Baik'
  },
  q9: {
    '1': 'Tidak Ada',
    '2': 'Ada Tapi Tidak Berfungsi',
    '3': 'Kurang Maksimal',
    '4': 'Dikelola Baik',
    'A': 'Tidak Ada',
    'B': 'Ada Tapi Tidak Berfungsi',
    'C': 'Kurang Maksimal',
    'D': 'Dikelola Baik'
  }
};

/**
 * Header kolom Google Sheet dalam Bahasa Indonesia
 */
const INDONESIAN_HEADERS = [
  'ID Responden',
  'Waktu Pengisian',
  'Jenis Kelamin',
  'Usia',
  'Pendidikan Terakhir',
  'Jenis Layanan',
  '1. Persyaratan Pelayanan',
  '2. Prosedur Pelayanan',
  '3. Waktu Pelayanan',
  '4. Biaya / Tarif',
  '5. Produk Spesifikasi Pelayanan',
  '6. Kompetensi Petugas',
  '7. Perilaku / Keramahan Petugas',
  '8. Sarana & Prasarana',
  '9. Penanganan Pengaduan',
  'Saran & Masukan',
  'Nilai Rata-rata',
];

/**
 * Format ID Responden sederhana dengan format: SKM-YYYYMMDD-XXXX
 * Contoh: SKM-20261016-0001
 */
function generateCustomId(sequenceNumber) {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const seq = String(sequenceNumber).padStart(4, '0');
  return `SKM-${year}${month}${day}-${seq}`;
}

/**
 * Format tanggal dan waktu lokal Indonesia (DD/MM/YYYY HH:mm:ss)
 */
function formatIndonesianTimestamp(date) {
  const d = date || new Date();
  const pad = function(n) { return String(n).padStart(2, '0'); };
  const day = pad(d.getDate());
  const month = pad(d.getMonth() + 1);
  const year = d.getFullYear();
  const hours = pad(d.getHours());
  const minutes = pad(d.getMinutes());
  const seconds = pad(d.getSeconds());
  return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
}

/**
 * Konversi nilai pilihan ke teks deskriptif
 */
function getOptionLabel(questionKey, val) {
  if (val === undefined || val === null || val === '') return '-';
  const strVal = String(val).trim();
  const map = LABEL_MAP[questionKey];
  if (map && map[strVal]) {
    return map[strVal];
  }
  return strVal;
}

const TEXT_SCORE_MAP = {
  // Skor 1
  'tidak sesuai': 1,
  'tidak mudah': 1,
  'tidak cepat': 1,
  'sangat mahal': 1,
  'tidak kompeten': 1,
  'tidak sopan': 1,
  'buruk': 1,
  'tidak ada': 1,

  // Skor 2
  'kurang sesuai': 2,
  'kurang mudah': 2,
  'kurang cepat': 2,
  'cukup mahal': 2,
  'kurang kompeten': 2,
  'kurang sopan': 2,
  'cukup': 2,
  'ada tapi tidak berfungsi': 2,

  // Skor 3
  'sesuai': 3,
  'mudah': 3,
  'cepat': 3,
  'murah': 3,
  'kompeten': 3,
  'sopan': 3,
  'baik': 3,
  'kurang maksimal': 3,

  // Skor 4
  'sangat sesuai': 4,
  'sangat mudah': 4,
  'sangat cepat': 4,
  'gratis': 4,
  'sangat kompeten': 4,
  'sangat sopan': 4,
  'sangat baik': 4,
  'dikelola baik': 4,
};

/**
 * Konversi nilai pilihan ke skor angka (1-4) untuk keperluan perhitungan
 */
function getNumericScore(val) {
  if (val === undefined || val === null || val === '') return 3;
  if (val === 'A' || val === 1 || val === '1') return 1;
  if (val === 'B' || val === 2 || val === '2') return 2;
  if (val === 'C' || val === 3 || val === '3') return 3;
  if (val === 'D' || val === 4 || val === '4') return 4;
  const num = Number(val);
  if (!isNaN(num) && num >= 1 && num <= 4) return num;

  const textKey = String(val).trim().toLowerCase();
  if (TEXT_SCORE_MAP[textKey] !== undefined) {
    return TEXT_SCORE_MAP[textKey];
  }
  return 3;
}

/**
 * Mengisi objek response dengan teks bahasa Indonesia dan metadata
 */
function enrichQuestionnaireResponse(data) {
  const q1Score = getNumericScore(data.q1_accessibility || data.Q1);
  const q2Score = getNumericScore(data.q2_service_quality || data.Q2);
  const q3Score = getNumericScore(data.q3_professionalism || data.Q3);
  const q4Score = getNumericScore(data.q4_courtesy || data.Q4);
  const q5Score = getNumericScore(data.q5_reliability || data.Q5);
  const q6Score = getNumericScore(data.q6_security || data.Q6);
  const q7Score = getNumericScore(data.q7_response_time || data.Q7);
  const q8Score = getNumericScore(data.q8_facilities || data.Q8);
  const q9Score = getNumericScore(data.q9_complaints || data.Q9);

  // Format demografi
  const rawPendidikan = data.education || data.demographic_education || '';
  const pendidikanLabel = LABEL_MAP.pendidikan[rawPendidikan] || rawPendidikan;

  const rawUsia = data.age || data.demographic_age || '';
  const usiaLabel = rawUsia ? (String(rawUsia).includes('Tahun') ? String(rawUsia) : `${rawUsia} Tahun`) : '';

  return {
    id: '', // Diisi di appendResponseToSheet berdasarkan nomor urut baris
    timestamp: new Date().toISOString(),
    waktu_pengisian: formatIndonesianTimestamp(new Date()),

    // Profil Responden
    jenis_kelamin: data.gender || data.demographic_gender || '-',
    usia: usiaLabel || '-',
    pendidikan: pendidikanLabel || '-',
    jenis_layanan: data.service_type || data.demographic_service || '-',

    // Teks Deskriptif Jawaban Pilihan (Bukan Angka)
    q1_persyaratan_text: getOptionLabel('q1', data.q1_accessibility || data.Q1),
    q2_prosedur_text: getOptionLabel('q2', data.q2_service_quality || data.Q2),
    q3_waktu_text: getOptionLabel('q3', data.q3_professionalism || data.Q3),
    q4_biaya_text: getOptionLabel('q4', data.q4_courtesy || data.Q4),
    q5_produk_text: getOptionLabel('q5', data.q5_reliability || data.Q5),
    q6_kompetensi_text: getOptionLabel('q6', data.q6_security || data.Q6),
    q7_perilaku_text: getOptionLabel('q7', data.q7_response_time || data.Q7),
    q8_sarana_text: getOptionLabel('q8', data.q8_facilities || data.Q8),
    q9_pengaduan_text: getOptionLabel('q9', data.q9_complaints || data.Q9),

    // Saran & Masukan
    saran_masukan: data.saran || data.q9_suggestions || data.Q21 || '-',

    // Nilai angka untuk analitik
    q1_accessibility: q1Score,
    q2_service_quality: q2Score,
    q3_professionalism: q3Score,
    q4_courtesy: q4Score,
    q5_reliability: q5Score,
    q6_security: q6Score,
    q7_response_time: q7Score,
    q8_facilities: q8Score,
    q9_complaints: q9Score,
  };
}

/**
 * Menghitung Nilai Rata-rata dan Predikat Mutu Pelayanan
 */
function calculateOverallScore(response) {
  const scores = [
    response.q1_accessibility,
    response.q2_service_quality,
    response.q3_professionalism,
    response.q4_courtesy,
    response.q5_reliability,
    response.q6_security,
    response.q7_response_time,
    response.q8_facilities,
    response.q9_complaints,
  ];

  const sum = scores.reduce(function(acc, val) { return acc + val; }, 0);
  const avg = (sum / scores.length).toFixed(2);
  const avgNum = parseFloat(avg);

  let predikat = 'Sangat Baik';
  if (avgNum < 1.76) {
    predikat = 'Tidak Baik';
  } else if (avgNum <= 2.50) {
    predikat = 'Kurang Baik';
  } else if (avgNum <= 3.25) {
    predikat = 'Baik';
  }

  return `${avg} (${predikat})`;
}

// ============================================================================
// SHEET OPERATIONS
// ============================================================================

/**
 * Mengakses Google Spreadsheet secara aman
 */
function getSpreadsheet() {
  try {
    const active = SpreadsheetApp.getActiveSpreadsheet();
    if (active) return active;
  } catch (e) {}

  if (typeof SPREADSHEET_ID !== 'undefined' && SPREADSHEET_ID) {
    return SpreadsheetApp.openById(SPREADSHEET_ID);
  }

  throw new Error('Spreadsheet not found. Link script or configure SPREADSHEET_ID.');
}

/**
 * Format baris header tabel dengan style Emerald Green
 */
function formatHeaderRow(sheet) {
  const headerRange = sheet.getRange(1, 1, 1, INDONESIAN_HEADERS.length);
  headerRange.setFontWeight('bold');
  headerRange.setBackground('#059669'); // Hijau Emerald
  headerRange.setFontColor('#FFFFFF');
  headerRange.setHorizontalAlignment('center');
  headerRange.setVerticalAlignment('middle');
  sheet.setRowHeight(1, 35);
}

/**
 * Memastikan baris header menggunakan Bahasa Indonesia
 */
function ensureIndonesianHeaders(sheet) {
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(INDONESIAN_HEADERS);
    formatHeaderRow(sheet);
  } else {
    const currentFirstCell = String(sheet.getRange(1, 1).getValue()).trim().toLowerCase();
    // Jika header masih menggunakan kolom Inggris 'id' atau kosong, perbarui ke Bahasa Indonesia
    if (!currentFirstCell || currentFirstCell === 'id') {
      sheet.getRange(1, 1, 1, INDONESIAN_HEADERS.length).setValues([INDONESIAN_HEADERS]);
      formatHeaderRow(sheet);
    }
  }
}

/**
 * Menambahkan data respon ke Google Sheet
 */
function appendResponseToSheet(response) {
  try {
    const sheet = getResponseSheet();
    if (!sheet) {
      throw new Error('Response sheet not found');
    }

    // Pastikan header rapi dalam Bahasa Indonesia
    ensureIndonesianHeaders(sheet);

    // Nomor urut responden: baris ke-2 = Responden ke-1
    const nextSeq = Math.max(1, sheet.getLastRow());
    response.id = generateCustomId(nextSeq);

    // Baris data sesuai isi pilihan responden (Teks, bukan angka)
    const rowData = [
      response.id,
      response.waktu_pengisian || formatIndonesianTimestamp(new Date()),
      response.jenis_kelamin,
      response.usia,
      response.pendidikan,
      response.jenis_layanan,
      response.q1_persyaratan_text,
      response.q2_prosedur_text,
      response.q3_waktu_text,
      response.q4_biaya_text,
      response.q5_produk_text,
      response.q6_kompetensi_text,
      response.q7_perilaku_text,
      response.q8_sarana_text,
      response.q9_pengaduan_text,
      response.saran_masukan,
      response.overall_score,
    ];

    // Tambah baris baru
    sheet.appendRow(rowData);

    const lastRow = sheet.getLastRow();

    // Rata tengah kolom ID, Tanggal, dan Nilai
    sheet.getRange(lastRow, 1).setHorizontalAlignment('center');
    sheet.getRange(lastRow, 2).setHorizontalAlignment('center');
    sheet.getRange(lastRow, 17).setHorizontalAlignment('center');

    logDebug('Row appended', { responseId: response.id, rowIndex: lastRow });

    return lastRow;
  } catch (error) {
    throw new Error(`Failed to append response to sheet: ${error.message}`);
  }
}

/**
 * Mendapatkan atau membuat sheet 'responses'
 */
function getResponseSheet() {
  const spreadsheet = getSpreadsheet();
  let sheet = spreadsheet.getSheetByName(SHEET_NAME);

  if (!sheet) {
    const sheets = spreadsheet.getSheets();
    if (sheets.length === 1 && sheets[0].getLastRow() <= 1) {
      sheet = sheets[0];
      sheet.setName(SHEET_NAME);
      ensureIndonesianHeaders(sheet);
    } else {
      logDebug('Creating response sheet', { name: SHEET_NAME });
      sheet = spreadsheet.insertSheet(SHEET_NAME);
      ensureIndonesianHeaders(sheet);
    }
  }

  return sheet;
}

// ============================================================================
// ANALYTICS
// ============================================================================

/**
 * Mengambil dan mengkalkulasi data analitik statistika lengkap dari Google Sheet
 */
function getAnalyticsData() {
  try {
    const sheet = getResponseSheet();
    if (!sheet || sheet.getLastRow() < 2) {
      return {
        totalResponses: 0,
        ikmKonversi: 0,
        ikmSkala4: 0,
        avgSatisfaction: 0,
        mutuPelayanan: '-',
        satisfactionDistribution: {
          verySatisfied: 0,
          satisfied: 0,
          neutral: 0,
          dissatisfied: 0,
          veryDissatisfied: 0,
        },
        dimensionAverages: {
          accessibility: 0,
          serviceQuality: 0,
          professionalism: 0,
          courtesy: 0,
          reliability: 0,
          security: 0,
          responseTime: 0,
          facilities: 0,
        },
        elements: {
          u1: { name: 'Persyaratan Pelayanan', score: 0 },
          u2: { name: 'Prosedur Pelayanan', score: 0 },
          u3: { name: 'Waktu Pelayanan', score: 0 },
          u4: { name: 'Biaya / Tarif', score: 0 },
          u5: { name: 'Produk Pelayanan', score: 0 },
          u6: { name: 'Kompetensi Petugas', score: 0 },
          u7: { name: 'Perilaku Petugas', score: 0 },
          u8: { name: 'Sarana & Prasarana', score: 0 },
          u9: { name: 'Penanganan Pengaduan', score: 0 },
        },
        demographics: {
          gender: {},
          age: {},
          education: {},
          serviceType: {},
        },
        responses: [],
        lastUpdated: new Date().toISOString(),
      };
    }

    const data = sheet.getDataRange().getValues();
    const rawRows = data.slice(1);

    const elementSums = [0, 0, 0, 0, 0, 0, 0, 0, 0];
    const demographics = {
      gender: {},
      age: {},
      education: {},
      serviceType: {},
    };
    const satisfactionCounts = { 4: 0, 3: 0, 2: 0, 1: 0 };
    let totalScoreSum = 0;

    const mappedResponses = rawRows.map(function(row, idx) {
      const id = String(row[0] || '');
      const waktu = String(row[1] || '');
      const gender = String(row[2] || '-');
      const usia = String(row[3] || '-');
      const pendidikan = String(row[4] || '-');
      const layanan = String(row[5] || '-');

      const uScores = [];
      for (var i = 0; i < 9; i++) {
        var sc = getNumericScore(row[6 + i]);
        elementSums[i] += sc;
        uScores.push(sc);
      }

      var rowAvg = (uScores.reduce(function(a, b) { return a + b; }, 0) / 9);
      totalScoreSum += rowAvg;

      var roundedScore = Math.min(4, Math.max(1, Math.round(rowAvg)));
      satisfactionCounts[roundedScore] = (satisfactionCounts[roundedScore] || 0) + 1;

      // Agregasi demografi
      if (gender && gender !== '-') demographics.gender[gender] = (demographics.gender[gender] || 0) + 1;
      if (usia && usia !== '-') demographics.age[usia] = (demographics.age[usia] || 0) + 1;
      if (pendidikan && pendidikan !== '-') demographics.education[pendidikan] = (demographics.education[pendidikan] || 0) + 1;
      if (layanan && layanan !== '-') demographics.serviceType[layanan] = (demographics.serviceType[layanan] || 0) + 1;

      return {
        no: idx + 1,
        id: id,
        waktu: waktu,
        jenis_kelamin: gender,
        usia: usia,
        pendidikan: pendidikan,
        jenis_layanan: layanan,
        q1: String(row[6] || '-'),
        q2: String(row[7] || '-'),
        q3: String(row[8] || '-'),
        q4: String(row[9] || '-'),
        q5: String(row[10] || '-'),
        q6: String(row[11] || '-'),
        q7: String(row[12] || '-'),
        q8: String(row[13] || '-'),
        q9: String(row[14] || '-'),
        saran: String(row[15] || '-'),
        nilai: String(row[16] || rowAvg.toFixed(2)),
        skor_rata: Number(rowAvg.toFixed(2)),
      };
    });

    const N = rawRows.length;
    const elementAvgs = elementSums.map(function(s) { return Number((s / N).toFixed(2)); });
    const avgSatisfaction = Number((totalScoreSum / N).toFixed(2));
    const ikmKonversi = Number((avgSatisfaction * 25).toFixed(2));

    var mutuPelayanan = 'A (Sangat Baik)';
    if (ikmKonversi < 65.00) mutuPelayanan = 'D (Tidak Baik)';
    else if (ikmKonversi <= 76.60) mutuPelayanan = 'C (Kurang Baik)';
    else if (ikmKonversi <= 88.30) mutuPelayanan = 'B (Baik)';

    return {
      totalResponses: N,
      avgSatisfaction: avgSatisfaction,
      ikmSkala4: avgSatisfaction,
      ikmKonversi: ikmKonversi,
      mutuPelayanan: mutuPelayanan,
      satisfactionDistribution: {
        verySatisfied: satisfactionCounts[4] || 0,
        satisfied: satisfactionCounts[3] || 0,
        neutral: satisfactionCounts[2] || 0,
        dissatisfied: satisfactionCounts[1] || 0,
        veryDissatisfied: 0,
      },
      dimensionAverages: {
        accessibility: elementAvgs[0],
        serviceQuality: elementAvgs[1],
        professionalism: elementAvgs[2],
        courtesy: elementAvgs[3],
        reliability: elementAvgs[4],
        security: elementAvgs[5],
        responseTime: elementAvgs[6],
        facilities: elementAvgs[7],
      },
      elements: {
        u1: { name: 'Persyaratan Pelayanan', score: elementAvgs[0] },
        u2: { name: 'Prosedur Pelayanan', score: elementAvgs[1] },
        u3: { name: 'Waktu Pelayanan', score: elementAvgs[2] },
        u4: { name: 'Biaya / Tarif', score: elementAvgs[3] },
        u5: { name: 'Produk Pelayanan', score: elementAvgs[4] },
        u6: { name: 'Kompetensi Petugas', score: elementAvgs[5] },
        u7: { name: 'Perilaku Petugas', score: elementAvgs[6] },
        u8: { name: 'Sarana & Prasarana', score: elementAvgs[7] },
        u9: { name: 'Penanganan Pengaduan', score: elementAvgs[8] },
      },
      demographics: demographics,
      responses: mappedResponses,
      lastUpdated: new Date().toISOString(),
    };
  } catch (error) {
    logError('Failed to get analytics data', error);
    throw error;
  }
}

/**
 * Scheduled trigger: Recalculates and caches analytics hourly
 */
function recalculateAnalytics() {
  try {
    logDebug('Starting scheduled analytics recalculation');

    const analytics = getAnalyticsData();
    const spreadsheet = getSpreadsheet();

    let analyticsSheet = spreadsheet.getSheetByName(ANALYTICS_SHEET_NAME);
    if (!analyticsSheet) {
      analyticsSheet = spreadsheet.insertSheet(ANALYTICS_SHEET_NAME);
      initializeAnalyticsSheetHeaders(analyticsSheet);
    }

    // Append analytics record
    const today = new Date().toISOString().split('T')[0];
    analyticsSheet.appendRow([
      today,
      analytics.totalResponses,
      analytics.avgSatisfaction,
      analytics.satisfactionDistribution.verySatisfied,
      analytics.satisfactionDistribution.satisfied,
      analytics.satisfactionDistribution.neutral,
      analytics.satisfactionDistribution.dissatisfied,
      analytics.satisfactionDistribution.veryDissatisfied,
      analytics.dimensionAverages.accessibility,
      analytics.dimensionAverages.serviceQuality,
      analytics.dimensionAverages.professionalism,
      analytics.dimensionAverages.courtesy,
      analytics.dimensionAverages.reliability,
      analytics.dimensionAverages.security,
      analytics.dimensionAverages.responseTime,
      analytics.dimensionAverages.facilities,
      new Date().toISOString(),
    ]);

    logDebug('Analytics recalculation completed', {
      totalResponses: analytics.totalResponses,
      avgSatisfaction: analytics.avgSatisfaction,
    });
  } catch (error) {
    logError('Failed to recalculate analytics', error);
  }
}

/**
 * Initializes analytics sheet headers
 */
function initializeAnalyticsSheetHeaders(sheet) {
  const headers = [
    'date',
    'total_responses',
    'avg_satisfaction',
    'satisfaction_very_satisfied',
    'satisfaction_satisfied',
    'satisfaction_neutral',
    'satisfaction_dissatisfied',
    'satisfaction_very_dissatisfied',
    'dimension_accessibility_avg',
    'dimension_quality_avg',
    'dimension_professionalism_avg',
    'dimension_courtesy_avg',
    'dimension_reliability_avg',
    'dimension_security_avg',
    'dimension_response_time_avg',
    'dimension_facilities_avg',
    'updated_at',
  ];

  sheet.appendRow(headers);
  sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold').setBackground('#4285F4').setFontColor('#FFFFFF');
}

// ============================================================================
// ERROR HANDLING & RESPONSES
// ============================================================================

/**
 * Creates a standardized success response
 */
function createSuccessResponse(data) {
  const response = {
    success: true,
    data: data,
    timestamp: new Date().toISOString(),
  };

  return ContentService.createTextOutput(JSON.stringify(response)).setMimeType(ContentService.MimeType.JSON);
}

/**
 * Creates a standardized error response
 */
function createErrorResponse(statusCode, errorType, errorMessage) {
  const response = {
    success: false,
    error: {
      code: statusCode,
      type: errorType,
      message: errorMessage,
      timestamp: new Date().toISOString(),
    },
  };

  return ContentService.createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON);
}

// ============================================================================
// LOGGING
// ============================================================================

/**
 * Logs debug information to debug sheet and console
 */
function logDebug(message, context = {}) {
  if (!ENABLE_DEBUG_LOGGING) return;

  const logEntry = {
    timestamp: new Date().toISOString(),
    level: 'DEBUG',
    message: message,
    context: JSON.stringify(context),
  };

  appendDebugLog(logEntry);
  console.log(`[DEBUG] ${message}`, context);
}

/**
 * Logs error information
 */
function logError(message, error) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    level: 'ERROR',
    message: message,
    context: JSON.stringify({
      errorMessage: error?.message,
      errorStack: error?.stack?.substring(0, 500),
    }),
  };

  appendDebugLog(logEntry);
  console.error(`[ERROR] ${message}`, error);
}

/**
 * Appends log entry to debug sheet
 */
function appendDebugLog(logEntry) {
  try {
    const spreadsheet = getSpreadsheet();
    let logSheet = spreadsheet.getSheetByName(LOG_SHEET_NAME);

    if (!logSheet) {
      logSheet = spreadsheet.insertSheet(LOG_SHEET_NAME);
      logSheet.appendRow(['timestamp', 'level', 'message', 'context']);
    }

    if (logSheet.getLastRow() > 10000) {
      // Keep log sheet from growing too large
      logSheet.deleteRows(2, Math.min(1000, logSheet.getLastRow() - 1));
    }

    logSheet.appendRow([logEntry.timestamp, logEntry.level, logEntry.message, logEntry.context]);
  } catch (error) {
    console.error('Failed to append debug log', error);
  }
}

/**
 * Retrieves debug logs
 */
function getDebugLogs() {
  try {
    const spreadsheet = getSpreadsheet();
    const logSheet = spreadsheet.getSheetByName(LOG_SHEET_NAME);

    if (!logSheet || logSheet.getLastRow() < 2) {
      return [];
    }

    const data = logSheet.getDataRange().getValues();
    const logs = [];

    for (let i = 1; i < data.length; i++) {
      logs.push({
        timestamp: data[i][0],
        level: data[i][1],
        message: data[i][2],
        context: JSON.parse(data[i][3] || '{}'),
      });
    }

    return logs;
  } catch (error) {
    console.error('Failed to retrieve debug logs', error);
    return [];
  }
}

/**
 * Clears debug logs
 */
function clearDebugLogs() {
  try {
    const spreadsheet = getSpreadsheet();
    const logSheet = spreadsheet.getSheetByName(LOG_SHEET_NAME);

    if (logSheet && logSheet.getLastRow() > 1) {
      logSheet.deleteRows(2, logSheet.getLastRow() - 1);
      logDebug('Debug logs cleared');
    }
  } catch (error) {
    console.error('Failed to clear debug logs', error);
  }
}
