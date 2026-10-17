/**
 * Unit Tests for SKM Configuration Constants
 * Validates AC2 and AC15 compliance (Standard SKM structure and compliance)
 */

import {
  SKM_QUESTIONS,
  SKM_CATEGORIES,
  SATISFACTION_LEVELS,
  SKM_CATEGORY_INFO,
  VALIDATION,
  DEFAULT_CONFIG,
  validateSKMConfiguration,
  DEMOGRAPHIC_OPTIONS,
  API_ENDPOINTS,
  HTTP_STATUS,
} from './constants'

describe('SKM Configuration Constants', () => {
  describe('SKM_QUESTIONS (AC2: Standard SKM Structure)', () => {
    it('should have between 15-25 questions', () => {
      expect(SKM_QUESTIONS.length).toBeGreaterThanOrEqual(15)
      expect(SKM_QUESTIONS.length).toBeLessThanOrEqual(25)
    })

    it('should have exactly 20 mandatory Likert questions + 1 optional text question', () => {
      const mandatoryQuestions = SKM_QUESTIONS.filter((q) => q.isRequired)
      const optionalQuestions = SKM_QUESTIONS.filter((q) => !q.isRequired)

      expect(mandatoryQuestions.length).toBe(20)
      expect(optionalQuestions.length).toBeGreaterThan(0)
    })

    it('should have unique question IDs', () => {
      const ids = SKM_QUESTIONS.map((q) => q.id)
      const uniqueIds = new Set(ids)
      expect(uniqueIds.size).toBe(SKM_QUESTIONS.length)
    })

    it('should have sequential question numbers', () => {
      SKM_QUESTIONS.forEach((question, index) => {
        expect(question.questionNumber).toBe(index + 1)
      })
    })

    it('should have all mandatory questions with Likert type', () => {
      const mandatoryLikertQuestions = SKM_QUESTIONS.filter(
        (q) => q.isRequired && q.type === 'likert'
      )
      expect(mandatoryLikertQuestions.length).toBeGreaterThanOrEqual(20)
    })

    it('should have required and English text for all questions', () => {
      SKM_QUESTIONS.forEach((question) => {
        expect(question.id).toBeTruthy()
        expect(question.text).toBeTruthy()
        expect(question.text.length).toBeGreaterThan(0)
        expect(question.category).toBeTruthy()
      })
    })

    it('should have Indonesian translations for all questions', () => {
      SKM_QUESTIONS.forEach((question) => {
        expect(question.indonesian).toBeTruthy()
        expect(question.indonesian.length).toBeGreaterThan(0)
      })
    })

    it('should cover all 8 SKM dimensions/categories', () => {
      const categoriesInQuestions = new Set(SKM_QUESTIONS.map((q) => q.category))
      const expectedCategories = Object.values(SKM_CATEGORIES)

      expectedCategories.forEach((category) => {
        expect(categoriesInQuestions.has(category)).toBe(true)
      })
    })

    it('should have minimum coverage per dimension', () => {
      const categoryDistribution = {} as Record<string, number>

      SKM_QUESTIONS.forEach((q) => {
        if (!categoryDistribution[q.category]) {
          categoryDistribution[q.category] = 0
        }
        categoryDistribution[q.category]++
      })

      // Each category should have at least 2 questions
      Object.entries(categoryDistribution).forEach(([category, count]) => {
        expect(count).toBeGreaterThanOrEqual(2)
      })
    })
  })

  describe('SATISFACTION_LEVELS (Likert Scale 1-5)', () => {
    it('should have all 5 satisfaction levels', () => {
      expect(Object.keys(SATISFACTION_LEVELS).length).toBe(5)
    })

    it('should have levels from 1 to 5', () => {
      const keys = Object.keys(SATISFACTION_LEVELS)
        .map(Number)
        .sort((a, b) => a - b)
      expect(keys).toEqual([1, 2, 3, 4, 5])
    })

    it('should have distinct labels for each level', () => {
      const labels = Object.values(SATISFACTION_LEVELS).map((v) => v.label)
      const uniqueLabels = new Set(labels)
      expect(uniqueLabels.size).toBe(5)
    })

    it('should have distinct Indonesian labels for each level', () => {
      const labels = Object.values(SATISFACTION_LEVELS).map((v) => v.indonesian)
      const uniqueLabels = new Set(labels)
      expect(uniqueLabels.size).toBe(5)
    })

    it('should have proper mapping: 5=Very Satisfied, 1=Very Dissatisfied', () => {
      expect(SATISFACTION_LEVELS[5].label).toBe('Very Satisfied')
      expect(SATISFACTION_LEVELS[1].label).toBe('Very Dissatisfied')
      expect(SATISFACTION_LEVELS[4].label).toBe('Satisfied')
      expect(SATISFACTION_LEVELS[3].label).toBe('Neutral')
      expect(SATISFACTION_LEVELS[2].label).toBe('Dissatisfied')
    })

    it('should have descriptions for each level', () => {
      Object.values(SATISFACTION_LEVELS).forEach((level) => {
        expect(level.description).toBeTruthy()
        expect(level.description.length).toBeGreaterThan(0)
      })
    })
  })

  describe('SKM_CATEGORIES (AC2: Dimensions)', () => {
    it('should have 8 main categories/dimensions', () => {
      const categories = Object.values(SKM_CATEGORIES)
      expect(categories.length).toBe(8)
    })

    it('should have accessibility category', () => {
      expect(SKM_CATEGORIES.ACCESSIBILITY).toBeTruthy()
    })

    it('should have quality category', () => {
      expect(SKM_CATEGORIES.QUALITY).toBeTruthy()
    })

    it('should have professionalism category', () => {
      expect(SKM_CATEGORIES.PROFESSIONALISM).toBeTruthy()
    })

    it('should have courtesy category', () => {
      expect(SKM_CATEGORIES.COURTESY).toBeTruthy()
    })

    it('should have reliability category', () => {
      expect(SKM_CATEGORIES.RELIABILITY).toBeTruthy()
    })

    it('should have security category', () => {
      expect(SKM_CATEGORIES.SECURITY).toBeTruthy()
    })

    it('should have response_time category', () => {
      expect(SKM_CATEGORIES.RESPONSE_TIME).toBeTruthy()
    })

    it('should have facilities category', () => {
      expect(SKM_CATEGORIES.FACILITIES).toBeTruthy()
    })
  })

  describe('SKM_CATEGORY_INFO (Documentation)', () => {
    it('should have info for all 8 categories', () => {
      const categories = Object.values(SKM_CATEGORIES)
      expect(Object.keys(SKM_CATEGORY_INFO).length).toBe(8)
    })

    it('should have label and description for each category', () => {
      Object.entries(SKM_CATEGORY_INFO).forEach(([key, info]) => {
        expect(info.label).toBeTruthy()
        expect(info.label.length).toBeGreaterThan(0)
        expect(info.description).toBeTruthy()
        expect(info.description.length).toBeGreaterThan(0)
        expect(info.questionCount).toBeGreaterThan(0)
      })
    })
  })

  describe('VALIDATION Constants', () => {
    it('should have correct satisfaction rating range (1-5)', () => {
      expect(VALIDATION.MIN_SATISFACTION_RATING).toBe(1)
      expect(VALIDATION.MAX_SATISFACTION_RATING).toBe(5)
    })

    it('should require minimum 20 mandatory questions', () => {
      expect(VALIDATION.MIN_QUESTIONS_REQUIRED).toBe(20)
    })

    it('should have reasonable text length limits', () => {
      expect(VALIDATION.MAX_TEXT_LENGTH).toBeGreaterThan(100)
      expect(VALIDATION.MAX_EMAIL_LENGTH).toBeGreaterThan(0)
      expect(VALIDATION.MAX_NAME_LENGTH).toBeGreaterThan(0)
    })
  })

  describe('DEFAULT_CONFIG (AC15: SKM Compliance)', () => {
    it('should have valid version', () => {
      expect(DEFAULT_CONFIG.version).toMatch(/^\d+\.\d+\.\d+$/)
    })

    it('should have correct SKM configuration', () => {
      expect(DEFAULT_CONFIG.skm.totalQuestions).toBe(SKM_QUESTIONS.length)
      expect(DEFAULT_CONFIG.skm.mandatoryQuestions).toBeGreaterThanOrEqual(20)
      expect(DEFAULT_CONFIG.skm.categories.length).toBe(8)
    })

    it('should have rating range in config', () => {
      expect(DEFAULT_CONFIG.skm.minRating).toBe(1)
      expect(DEFAULT_CONFIG.skm.maxRating).toBe(5)
    })

    it('should reference VALIDATION constants', () => {
      expect(DEFAULT_CONFIG.validation).toEqual(VALIDATION)
    })

    it('should reference API_ENDPOINTS constants', () => {
      expect(DEFAULT_CONFIG.api).toEqual(API_ENDPOINTS)
    })
  })

  describe('validateSKMConfiguration() (AC2 & AC15 Validation)', () => {
    it('should return valid status', () => {
      const result = validateSKMConfiguration()
      expect(result.isValid).toBe(true)
      expect(result.issues.length).toBe(0)
    })

    it('should validate question count', () => {
      const result = validateSKMConfiguration()
      expect(result.stats.totalQuestions).toBeGreaterThanOrEqual(15)
      expect(result.stats.totalQuestions).toBeLessThanOrEqual(25)
    })

    it('should validate mandatory questions', () => {
      const result = validateSKMConfiguration()
      expect(result.stats.mandatoryQuestions).toBeGreaterThanOrEqual(20)
    })

    it('should validate all categories have questions', () => {
      const result = validateSKMConfiguration()
      Object.values(SKM_CATEGORIES).forEach((category) => {
        expect(result.stats.byCategory[category]).toBeGreaterThan(0)
      })
    })

    it('should not report any validation issues', () => {
      const result = validateSKMConfiguration()
      result.issues.forEach((issue) => {
        console.warn(`Validation issue: ${issue}`)
      })
      expect(result.issues).toEqual([])
    })
  })

  describe('DEMOGRAPHIC_OPTIONS', () => {
    it('should have age groups', () => {
      expect(DEMOGRAPHIC_OPTIONS.age.length).toBeGreaterThan(0)
    })

    it('should have service types', () => {
      expect(DEMOGRAPHIC_OPTIONS.serviceTypes.length).toBeGreaterThan(0)
    })

    it('should have gender options', () => {
      expect(DEMOGRAPHIC_OPTIONS.gender.length).toBeGreaterThan(0)
    })

    it('should have education level options', () => {
      expect(DEMOGRAPHIC_OPTIONS.educationLevel.length).toBeGreaterThan(0)
    })
  })

  describe('API_ENDPOINTS', () => {
    it('should have submit endpoint', () => {
      expect(API_ENDPOINTS.submit).toMatch(/^\/api\//)
    })

    it('should have analytics endpoint', () => {
      expect(API_ENDPOINTS.analytics).toMatch(/^\/api\//)
    })

    it('should have export endpoint', () => {
      expect(API_ENDPOINTS.export).toMatch(/^\/api\//)
    })

    it('should have health check endpoint', () => {
      expect(API_ENDPOINTS.healthCheck).toMatch(/^\/api\//)
    })
  })

  describe('HTTP_STATUS', () => {
    it('should have success status codes', () => {
      expect(HTTP_STATUS.OK).toBe(200)
      expect(HTTP_STATUS.CREATED).toBe(201)
    })

    it('should have error status codes', () => {
      expect(HTTP_STATUS.BAD_REQUEST).toBe(400)
      expect(HTTP_STATUS.NOT_FOUND).toBe(404)
      expect(HTTP_STATUS.INTERNAL_ERROR).toBe(500)
    })
  })

  describe('SKM Compliance Summary (AC2 & AC15)', () => {
    it('should meet all AC2 requirements', () => {
      // AC2: Standard SKM questionnaire structure (15-25 questions)
      expect(SKM_QUESTIONS.length).toBeGreaterThanOrEqual(15)
      expect(SKM_QUESTIONS.length).toBeLessThanOrEqual(25)

      // All questions follow Likert scale pattern (1-5)
      const likertQuestions = SKM_QUESTIONS.filter((q) => q.type === 'likert')
      expect(likertQuestions.length).toBeGreaterThanOrEqual(15)

      // Question categories/dimensions documented
      const categories = new Set(SKM_QUESTIONS.map((q) => q.category))
      expect(categories.size).toBe(8)
    })

    it('should meet all AC15 requirements', () => {
      // AC15: SKM compliance verified with proper question structure
      const validation = validateSKMConfiguration()
      expect(validation.isValid).toBe(true)

      // Satisfaction levels properly defined
      expect(SATISFACTION_LEVELS[5].label).toBe('Very Satisfied')
      expect(SATISFACTION_LEVELS[1].label).toBe('Very Dissatisfied')

      // Configuration properly typed
      expect(DEFAULT_CONFIG.skm.totalQuestions).toBe(SKM_QUESTIONS.length)
    })
  })
})
