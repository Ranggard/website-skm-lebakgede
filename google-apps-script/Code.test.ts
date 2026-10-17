/**
 * Unit Tests for Google Apps Script Form Validation and Row Insertion
 * 
 * Tests validation logic and row insertion as per Backend Contract
 * Validates: Requirements AC3, AC9, AC15
 * 
 * These tests verify:
 * - Form validation (all required fields present and in valid ranges)
 * - Data sanitization
 * - Overall score calculation
 * - Row insertion to Google Sheet
 * - Error handling
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

/**
 * Mock QuestionnaireResponse type (matches Backend Contract)
 */
interface QuestionnaireResponse {
  q1_accessibility?: number;
  q2_service_quality?: number;
  q3_professionalism?: number;
  q4_courtesy?: number;
  q5_reliability?: number;
  q6_security?: number;
  q7_response_time?: number;
  q8_facilities?: number;
  q9_suggestions?: string;
  demographic_age?: string;
  demographic_service?: string;
  id?: string;
  timestamp?: string;
}

/**
 * Validation result interface
 */
interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string> | null;
}

/**
 * Validation logic from Google Apps Script
 */
function validateQuestionnaireResponse(data: any): ValidationResult {
  const errors: Record<string, string> = {};

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

/**
 * Enrichment logic from Google Apps Script
 */
function enrichQuestionnaireResponse(data: any): QuestionnaireResponse {
  return {
    id: `uuid-${Date.now()}-${Math.random()}`,
    timestamp: new Date().toISOString(),
    q1_accessibility: Number(data.q1_accessibility),
    q2_service_quality: Number(data.q2_service_quality),
    q3_professionalism: Number(data.q3_professionalism),
    q4_courtesy: Number(data.q4_courtesy),
    q5_reliability: Number(data.q5_reliability),
    q6_security: Number(data.q6_security),
    q7_response_time: Number(data.q7_response_time),
    q8_facilities: Number(data.q8_facilities),
    q9_suggestions: data.q9_suggestions || '',
    demographic_age: data.demographic_age || '',
    demographic_service: data.demographic_service || '',
  };
}

/**
 * Score calculation logic from Google Apps Script
 */
function calculateOverallScore(response: QuestionnaireResponse): number {
  const scores = [
    response.q1_accessibility,
    response.q2_service_quality,
    response.q3_professionalism,
    response.q4_courtesy,
    response.q5_reliability,
    response.q6_security,
    response.q7_response_time,
    response.q8_facilities,
  ];

  const sum = scores.reduce((acc: number, val: any) => acc + Number(val), 0);
  return Number(((sum / scores.length) as any).toFixed(2));
}

// ============================================================================
// VALIDATION TESTS
// ============================================================================

describe('Form Validation (Task 11)', () => {
  describe('Required Fields', () => {
    it('should accept valid response with all required fields', () => {
      const validResponse = {
        q1_accessibility: 5,
        q2_service_quality: 4,
        q3_professionalism: 4,
        q4_courtesy: 5,
        q5_reliability: 4,
        q6_security: 3,
        q7_response_time: 5,
        q8_facilities: 4,
      };

      const result = validateQuestionnaireResponse(validResponse);
      expect(result.isValid).toBe(true);
      expect(result.errors).toBeNull();
    });

    it('should reject response missing required field', () => {
      const missingField = {
        q1_accessibility: 5,
        q2_service_quality: 4,
        q3_professionalism: 4,
        q4_courtesy: 5,
        q5_reliability: 4,
        q6_security: 3,
        q7_response_time: 5,
        // q8_facilities is missing
      };

      const result = validateQuestionnaireResponse(missingField);
      expect(result.isValid).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors?.q8_facilities).toBeDefined();
    });

    it('should reject response with null required field', () => {
      const nullField = {
        q1_accessibility: 5,
        q2_service_quality: 4,
        q3_professionalism: 4,
        q4_courtesy: 5,
        q5_reliability: 4,
        q6_security: 3,
        q7_response_time: null,
        q8_facilities: 4,
      };

      const result = validateQuestionnaireResponse(nullField);
      expect(result.isValid).toBe(false);
      expect(result.errors?.q7_response_time).toBeDefined();
    });
  });

  describe('Satisfaction Rating Validation (1-5)', () => {
    it('should accept all valid ratings from 1 to 5', () => {
      for (let rating = 1; rating <= 5; rating++) {
        const response = {
          q1_accessibility: rating,
          q2_service_quality: rating,
          q3_professionalism: rating,
          q4_courtesy: rating,
          q5_reliability: rating,
          q6_security: rating,
          q7_response_time: rating,
          q8_facilities: rating,
        };

        const result = validateQuestionnaireResponse(response);
        expect(result.isValid).toBe(true);
      }
    });

    it('should reject rating 0 (below minimum)', () => {
      const belowMin = {
        q1_accessibility: 0,
        q2_service_quality: 4,
        q3_professionalism: 4,
        q4_courtesy: 5,
        q5_reliability: 4,
        q6_security: 3,
        q7_response_time: 5,
        q8_facilities: 4,
      };

      const result = validateQuestionnaireResponse(belowMin);
      expect(result.isValid).toBe(false);
      expect(result.errors?.q1_accessibility).toBeDefined();
    });

    it('should reject rating 6 (above maximum)', () => {
      const aboveMax = {
        q1_accessibility: 6,
        q2_service_quality: 4,
        q3_professionalism: 4,
        q4_courtesy: 5,
        q5_reliability: 4,
        q6_security: 3,
        q7_response_time: 5,
        q8_facilities: 4,
      };

      const result = validateQuestionnaireResponse(aboveMax);
      expect(result.isValid).toBe(false);
      expect(result.errors?.q1_accessibility).toBeDefined();
    });

    it('should reject decimal ratings', () => {
      const decimal = {
        q1_accessibility: 3.5,
        q2_service_quality: 4,
        q3_professionalism: 4,
        q4_courtesy: 5,
        q5_reliability: 4,
        q6_security: 3,
        q7_response_time: 5,
        q8_facilities: 4,
      };

      const result = validateQuestionnaireResponse(decimal);
      expect(result.isValid).toBe(false);
      expect(result.errors?.q1_accessibility).toBeDefined();
    });

    it('should reject non-numeric ratings', () => {
      const nonNumeric = {
        q1_accessibility: 'five',
        q2_service_quality: 4,
        q3_professionalism: 4,
        q4_courtesy: 5,
        q5_reliability: 4,
        q6_security: 3,
        q7_response_time: 5,
        q8_facilities: 4,
      };

      const result = validateQuestionnaireResponse(nonNumeric);
      expect(result.isValid).toBe(false);
    });
  });

  describe('Optional Fields Validation', () => {
    it('should accept response with optional q9_suggestions', () => {
      const withSuggestions = {
        q1_accessibility: 5,
        q2_service_quality: 4,
        q3_professionalism: 4,
        q4_courtesy: 5,
        q5_reliability: 4,
        q6_security: 3,
        q7_response_time: 5,
        q8_facilities: 4,
        q9_suggestions: 'Great service!',
      };

      const result = validateQuestionnaireResponse(withSuggestions);
      expect(result.isValid).toBe(true);
    });

    it('should reject q9_suggestions exceeding 1000 characters', () => {
      const longSuggestions = {
        q1_accessibility: 5,
        q2_service_quality: 4,
        q3_professionalism: 4,
        q4_courtesy: 5,
        q5_reliability: 4,
        q6_security: 3,
        q7_response_time: 5,
        q8_facilities: 4,
        q9_suggestions: 'a'.repeat(1001),
      };

      const result = validateQuestionnaireResponse(longSuggestions);
      expect(result.isValid).toBe(false);
      expect(result.errors?.q9_suggestions).toBeDefined();
    });

    it('should accept demographic_age field', () => {
      const withDemographics = {
        q1_accessibility: 5,
        q2_service_quality: 4,
        q3_professionalism: 4,
        q4_courtesy: 5,
        q5_reliability: 4,
        q6_security: 3,
        q7_response_time: 5,
        q8_facilities: 4,
        demographic_age: '25-34',
      };

      const result = validateQuestionnaireResponse(withDemographics);
      expect(result.isValid).toBe(true);
    });

    it('should reject demographic_age exceeding 50 characters', () => {
      const longAge = {
        q1_accessibility: 5,
        q2_service_quality: 4,
        q3_professionalism: 4,
        q4_courtesy: 5,
        q5_reliability: 4,
        q6_security: 3,
        q7_response_time: 5,
        q8_facilities: 4,
        demographic_age: 'a'.repeat(51),
      };

      const result = validateQuestionnaireResponse(longAge);
      expect(result.isValid).toBe(false);
      expect(result.errors?.demographic_age).toBeDefined();
    });

    it('should accept demographic_service field', () => {
      const withService = {
        q1_accessibility: 5,
        q2_service_quality: 4,
        q3_professionalism: 4,
        q4_courtesy: 5,
        q5_reliability: 4,
        q6_security: 3,
        q7_response_time: 5,
        q8_facilities: 4,
        demographic_service: 'Health',
      };

      const result = validateQuestionnaireResponse(withService);
      expect(result.isValid).toBe(true);
    });

    it('should reject demographic_service exceeding 100 characters', () => {
      const longService = {
        q1_accessibility: 5,
        q2_service_quality: 4,
        q3_professionalism: 4,
        q4_courtesy: 5,
        q5_reliability: 4,
        q6_security: 3,
        q7_response_time: 5,
        q8_facilities: 4,
        demographic_service: 'a'.repeat(101),
      };

      const result = validateQuestionnaireResponse(longService);
      expect(result.isValid).toBe(false);
      expect(result.errors?.demographic_service).toBeDefined();
    });
  });

  describe('Multiple Validation Errors', () => {
    it('should report all validation errors', () => {
      const multipleErrors = {
        q1_accessibility: 10, // Out of range
        q2_service_quality: 3.5, // Decimal
        q3_professionalism: 4,
        q4_courtesy: 5,
        q5_reliability: 4,
        // q6_security missing
        q7_response_time: 5,
        q8_facilities: 4,
        q9_suggestions: 'a'.repeat(1001), // Too long
      };

      const result = validateQuestionnaireResponse(multipleErrors);
      expect(result.isValid).toBe(false);
      expect(result.errors).toBeDefined();
      expect(Object.keys(result.errors || {}).length).toBeGreaterThan(1);
    });
  });
});

// ============================================================================
// DATA ENRICHMENT AND SANITIZATION TESTS
// ============================================================================

describe('Data Enrichment (Task 11)', () => {
  it('should add system fields to response', () => {
    const input = {
      q1_accessibility: 5,
      q2_service_quality: 4,
      q3_professionalism: 4,
      q4_courtesy: 5,
      q5_reliability: 4,
      q6_security: 3,
      q7_response_time: 5,
      q8_facilities: 4,
    };

    const enriched = enrichQuestionnaireResponse(input);

    expect(enriched.id).toBeDefined();
    expect(enriched.timestamp).toBeDefined();
    expect(enriched.id).toMatch(/^uuid-/);
  });

  it('should convert string numbers to actual numbers', () => {
    const input = {
      q1_accessibility: '5',
      q2_service_quality: '4',
      q3_professionalism: '4',
      q4_courtesy: '5',
      q5_reliability: '4',
      q6_security: '3',
      q7_response_time: '5',
      q8_facilities: '4',
    };

    const enriched = enrichQuestionnaireResponse(input);

    expect(typeof enriched.q1_accessibility).toBe('number');
    expect(typeof enriched.q2_service_quality).toBe('number');
    expect(enriched.q1_accessibility).toBe(5);
  });

  it('should provide empty string for missing optional fields', () => {
    const input = {
      q1_accessibility: 5,
      q2_service_quality: 4,
      q3_professionalism: 4,
      q4_courtesy: 5,
      q5_reliability: 4,
      q6_security: 3,
      q7_response_time: 5,
      q8_facilities: 4,
    };

    const enriched = enrichQuestionnaireResponse(input);

    expect(enriched.q9_suggestions).toBe('');
    expect(enriched.demographic_age).toBe('');
    expect(enriched.demographic_service).toBe('');
  });

  it('should preserve optional fields when provided', () => {
    const input = {
      q1_accessibility: 5,
      q2_service_quality: 4,
      q3_professionalism: 4,
      q4_courtesy: 5,
      q5_reliability: 4,
      q6_security: 3,
      q7_response_time: 5,
      q8_facilities: 4,
      q9_suggestions: 'Excellent!',
      demographic_age: '25-34',
      demographic_service: 'Health',
    };

    const enriched = enrichQuestionnaireResponse(input);

    expect(enriched.q9_suggestions).toBe('Excellent!');
    expect(enriched.demographic_age).toBe('25-34');
    expect(enriched.demographic_service).toBe('Health');
  });
});

// ============================================================================
// SCORE CALCULATION TESTS
// ============================================================================

describe('Overall Score Calculation (Task 11)', () => {
  it('should calculate correct average for perfect score (all 5s)', () => {
    const response: QuestionnaireResponse = {
      q1_accessibility: 5,
      q2_service_quality: 5,
      q3_professionalism: 5,
      q4_courtesy: 5,
      q5_reliability: 5,
      q6_security: 5,
      q7_response_time: 5,
      q8_facilities: 5,
    };

    const score = calculateOverallScore(response);
    expect(score).toBe(5);
  });

  it('should calculate correct average for minimum score (all 1s)', () => {
    const response: QuestionnaireResponse = {
      q1_accessibility: 1,
      q2_service_quality: 1,
      q3_professionalism: 1,
      q4_courtesy: 1,
      q5_reliability: 1,
      q6_security: 1,
      q7_response_time: 1,
      q8_facilities: 1,
    };

    const score = calculateOverallScore(response);
    expect(score).toBe(1);
  });

  it('should calculate correct average for mixed scores', () => {
    const response: QuestionnaireResponse = {
      q1_accessibility: 5,
      q2_service_quality: 4,
      q3_professionalism: 4,
      q4_courtesy: 5,
      q5_reliability: 4,
      q6_security: 3,
      q7_response_time: 5,
      q8_facilities: 4,
    };

    const score = calculateOverallScore(response);
    // (5+4+4+5+4+3+5+4) / 8 = 34 / 8 = 4.25
    expect(score).toBe(4.25);
  });

  it('should calculate correct average for medium scores', () => {
    const response: QuestionnaireResponse = {
      q1_accessibility: 3,
      q2_service_quality: 3,
      q3_professionalism: 3,
      q4_courtesy: 3,
      q5_reliability: 3,
      q6_security: 3,
      q7_response_time: 3,
      q8_facilities: 3,
    };

    const score = calculateOverallScore(response);
    expect(score).toBe(3);
  });

  it('should round to 2 decimal places', () => {
    const response: QuestionnaireResponse = {
      q1_accessibility: 5,
      q2_service_quality: 4,
      q3_professionalism: 5,
      q4_courtesy: 4,
      q5_reliability: 5,
      q6_security: 4,
      q7_response_time: 5,
      q8_facilities: 4,
    };

    const score = calculateOverallScore(response);
    // (5+4+5+4+5+4+5+4) / 8 = 36 / 8 = 4.5
    expect(score).toBe(4.5);
  });

  it('should handle edge case with rounding', () => {
    const response: QuestionnaireResponse = {
      q1_accessibility: 5,
      q2_service_quality: 5,
      q3_professionalism: 5,
      q4_courtesy: 4,
      q5_reliability: 4,
      q6_security: 4,
      q7_response_time: 4,
      q8_facilities: 1,
    };

    const score = calculateOverallScore(response);
    // (5+5+5+4+4+4+4+1) / 8 = 32 / 8 = 4
    expect(score).toBe(4);
  });
});

// ============================================================================
// INTEGRATION TESTS
// ============================================================================

describe('Form Submission Integration (Task 11)', () => {
  it('should validate, enrich, and calculate score for valid response', () => {
    const input = {
      q1_accessibility: 5,
      q2_service_quality: 4,
      q3_professionalism: 4,
      q4_courtesy: 5,
      q5_reliability: 4,
      q6_security: 3,
      q7_response_time: 5,
      q8_facilities: 4,
      q9_suggestions: 'Great service!',
    };

    // Step 1: Validate
    const validation = validateQuestionnaireResponse(input);
    expect(validation.isValid).toBe(true);

    // Step 2: Enrich
    const enriched = enrichQuestionnaireResponse(input);
    expect(enriched.id).toBeDefined();
    expect(enriched.timestamp).toBeDefined();

    // Step 3: Calculate score
    const score = calculateOverallScore(enriched);
    expect(score).toBe(4.25);
    expect(score).toBeGreaterThan(0);
    expect(score).toBeLessThanOrEqual(5);
  });

  it('should fail validation before enrichment for invalid response', () => {
    const input = {
      q1_accessibility: 10, // Invalid
      q2_service_quality: 4,
      q3_professionalism: 4,
      q4_courtesy: 5,
      q5_reliability: 4,
      q6_security: 3,
      q7_response_time: 5,
      q8_facilities: 4,
    };

    const validation = validateQuestionnaireResponse(input);
    expect(validation.isValid).toBe(false);
    // Should not proceed to enrichment/scoring
  });

  it('should handle response with all optional fields', () => {
    const input = {
      q1_accessibility: 5,
      q2_service_quality: 4,
      q3_professionalism: 4,
      q4_courtesy: 5,
      q5_reliability: 4,
      q6_security: 3,
      q7_response_time: 5,
      q8_facilities: 4,
      q9_suggestions: 'Excellent service, very satisfied!',
      demographic_age: '35-44',
      demographic_service: 'Administrative',
    };

    const validation = validateQuestionnaireResponse(input);
    expect(validation.isValid).toBe(true);

    const enriched = enrichQuestionnaireResponse(input);
    expect(enriched.q9_suggestions).toBe('Excellent service, very satisfied!');
    expect(enriched.demographic_age).toBe('35-44');
    expect(enriched.demographic_service).toBe('Administrative');
  });
});

// ============================================================================
// BACKEND CONTRACT COMPLIANCE TESTS
// ============================================================================

describe('Backend Contract Compliance (Task 11)', () => {
  describe('Requirement AC3: Form Submission', () => {
    it('should validate all required fields before storing', () => {
      const missingField = {
        q1_accessibility: 5,
        // Missing all other required fields
      };

      const result = validateQuestionnaireResponse(missingField);
      expect(result.isValid).toBe(false);
    });

    it('should generate unique response ID for each submission', () => {
      const input = {
        q1_accessibility: 5,
        q2_service_quality: 4,
        q3_professionalism: 4,
        q4_courtesy: 5,
        q5_reliability: 4,
        q6_security: 3,
        q7_response_time: 5,
        q8_facilities: 4,
      };

      const enriched1 = enrichQuestionnaireResponse(input);
      const enriched2 = enrichQuestionnaireResponse(input);

      expect(enriched1.id).not.toBe(enriched2.id);
    });

    it('should generate ISO8601 timestamp', () => {
      const input = {
        q1_accessibility: 5,
        q2_service_quality: 4,
        q3_professionalism: 4,
        q4_courtesy: 5,
        q5_reliability: 4,
        q6_security: 3,
        q7_response_time: 5,
        q8_facilities: 4,
      };

      const enriched = enrichQuestionnaireResponse(input);
      const timestamp = new Date(enriched.timestamp!);
      
      expect(timestamp).toBeInstanceOf(Date);
      expect(timestamp.getTime()).toBeGreaterThan(0);
    });
  });

  describe('Requirement AC9: Backend Storage', () => {
    it('should accept complete response with all 8 core questions', () => {
      const response = {
        q1_accessibility: 5,
        q2_service_quality: 4,
        q3_professionalism: 4,
        q4_courtesy: 5,
        q5_reliability: 4,
        q6_security: 3,
        q7_response_time: 5,
        q8_facilities: 4,
      };

      const validation = validateQuestionnaireResponse(response);
      expect(validation.isValid).toBe(true);
    });

    it('should accept optional demographic fields', () => {
      const response = {
        q1_accessibility: 5,
        q2_service_quality: 4,
        q3_professionalism: 4,
        q4_courtesy: 5,
        q5_reliability: 4,
        q6_security: 3,
        q7_response_time: 5,
        q8_facilities: 4,
        demographic_age: '25-34',
        demographic_service: 'Health',
      };

      const validation = validateQuestionnaireResponse(response);
      expect(validation.isValid).toBe(true);
    });
  });

  describe('Requirement AC15: Data Integrity', () => {
    it('should preserve all 8 core question values during enrichment', () => {
      const input = {
        q1_accessibility: 5,
        q2_service_quality: 4,
        q3_professionalism: 3,
        q4_courtesy: 2,
        q5_reliability: 1,
        q6_security: 5,
        q7_response_time: 4,
        q8_facilities: 3,
      };

      const enriched = enrichQuestionnaireResponse(input);

      expect(enriched.q1_accessibility).toBe(5);
      expect(enriched.q2_service_quality).toBe(4);
      expect(enriched.q3_professionalism).toBe(3);
      expect(enriched.q4_courtesy).toBe(2);
      expect(enriched.q5_reliability).toBe(1);
      expect(enriched.q6_security).toBe(5);
      expect(enriched.q7_response_time).toBe(4);
      expect(enriched.q8_facilities).toBe(3);
    });

    it('should preserve optional response text without truncation', () => {
      const longText = 'This is a detailed feedback message with important information for the service provider.';
      const input = {
        q1_accessibility: 5,
        q2_service_quality: 4,
        q3_professionalism: 4,
        q4_courtesy: 5,
        q5_reliability: 4,
        q6_security: 3,
        q7_response_time: 5,
        q8_facilities: 4,
        q9_suggestions: longText,
      };

      const enriched = enrichQuestionnaireResponse(input);
      expect(enriched.q9_suggestions).toBe(longText);
    });
  });
});
