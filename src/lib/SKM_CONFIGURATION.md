# SKM Configuration Documentation

**File:** `src/lib/constants.ts`

This document describes the complete SKM (Survei Kepuasan Masyarakat) questionnaire configuration and compliance with acceptance criteria AC2 and AC15.

---

## Table of Contents

1. [Overview](#overview)
2. [SKM Question Set](#skm-question-set)
3. [Question Categories/Dimensions](#question-categoriesdimensions)
4. [Likert Scale Mapping](#likert-scale-mapping)
5. [Configuration Structure](#configuration-structure)
6. [Validation & Compliance](#validation--compliance)
7. [Usage Examples](#usage-examples)

---

## Overview

### What is SKM?

SKM (Survei Kepuasan Masyarakat) is the Indonesian Standard for measuring citizen satisfaction with public services. It provides a standardized framework for:

- Measuring service quality across 8 key dimensions
- Using a 5-point Likert scale for consistent responses
- Aggregating feedback for data-driven service improvement
- Ensuring compliance with Indonesian government service standards

### Compliance References

- **AC2:** Standard SKM questionnaire structure (15-25 questions) with proper Likert scale pattern
- **AC15:** SKM compliance verification with proper question structure and satisfaction level definitions

---

## SKM Question Set

### Overview

The questionnaire consists of:
- **20 Mandatory Questions** (Q1-Q20): All use 5-point Likert scale (1-5 ratings)
- **1 Optional Question** (Q21): Open-ended text for suggestions/comments

### Question Coverage

Questions are systematically distributed across 8 service quality dimensions:

```
Total Questions: 21
├── Mandatory (Likert): 20 questions
└── Optional (Text): 1 question
```

### Question Structure

Each question is defined with the following properties:

```typescript
interface SKMQuestion {
  id: string              // Unique identifier (Q1, Q2, ...)
  questionNumber: number  // Display order (1, 2, ...)
  text: string           // English question text
  indonesian: string     // Indonesian translation
  category: SKMCategory  // Dimension/category (e.g., ACCESSIBILITY)
  isRequired: boolean    // Whether mandatory (true for Q1-Q20, false for Q21)
  type: 'likert' | 'text' // Response type
}
```

---

## Question Categories/Dimensions

### The 8 SKM Dimensions

#### 1. **Accessibility** (Q1-Q3)
- Ease of access to service facilities
- Availability of information about services
- Clarity and completeness of service procedures

#### 2. **Service Quality** (Q4-Q6)
- Overall quality of services provided
- Accuracy and precision of services
- Consistency across all transactions

#### 3. **Professionalism** (Q7-Q8)
- Staff competence and expertise
- Problem-solving abilities

#### 4. **Courtesy** (Q9-Q10)
- Courtesy and respect shown by staff
- Friendliness and hospitality

#### 5. **Reliability** (Q11-Q13)
- Consistency of service delivery
- Fulfillment of promises and commitments
- Absence of errors and mistakes

#### 6. **Security & Confidentiality** (Q14-Q15)
- Protection of personal information
- Transaction confidentiality

#### 7. **Response Time & Efficiency** (Q16-Q18)
- Speed and promptness of service
- Efficiency of service process
- Minimal waiting times

#### 8. **Facilities & Infrastructure** (Q19-Q20)
- Adequacy and cleanliness of physical facilities
- Availability and functionality of equipment

### Category Distribution

```
ACCESSIBILITY:     3 questions (Q1, Q2, Q3)
QUALITY:           3 questions (Q4, Q5, Q6)
PROFESSIONALISM:   2 questions (Q7, Q8)
COURTESY:          2 questions (Q9, Q10)
RELIABILITY:       3 questions (Q11, Q12, Q13)
SECURITY:          2 questions (Q14, Q15)
RESPONSE_TIME:     3 questions (Q16, Q17, Q18)
FACILITIES:        2 questions (Q19, Q20)
────────────────────────────────────────────
TOTAL:            20 mandatory questions
```

---

## Likert Scale Mapping

### 5-Point Likert Scale Definition

All mandatory SKM questions (Q1-Q20) use a standardized 5-point Likert scale:

| Rating | English Label | Indonesian | Color | Meaning |
|--------|---------------|-----------|-------|---------|
| **5** | Very Satisfied | Sangat Puas | 🟢 Green | Excellent, exceeds expectations |
| **4** | Satisfied | Puas | 🟢 Lime | Good, meets expectations |
| **3** | Neutral | Netral | 🟠 Amber | Adequate, meets basic needs |
| **2** | Dissatisfied | Tidak Puas | 🟠 Orange | Below expectations |
| **1** | Very Dissatisfied | Sangat Tidak Puas | 🔴 Red | Unacceptable |

### Scale Semantics

- **Upper Scale (4-5):** Satisfied - Service meets or exceeds expectations
- **Middle Scale (3):** Neutral - Service is adequate but unremarkable
- **Lower Scale (1-2):** Dissatisfied - Service falls short of expectations

### UI Color Mapping

The color scheme supports visual feedback in the interface:

```typescript
SATISFACTION_COLORS: {
  5: '#10B981', // Emerald Green
  4: '#84CC16', // Lime
  3: '#F59E0B', // Amber
  2: '#F97316', // Orange
  1: '#EF4444', // Red
}
```

---

## Configuration Structure

### Main Exports

The configuration file exports several key constants and utilities:

#### 1. **SKM_QUESTIONS: SKMQuestion[]**
Array of 21 question objects with complete metadata.

```typescript
// Access a specific question:
const firstQuestion = SKM_QUESTIONS[0]
// {
//   id: 'Q1',
//   questionNumber: 1,
//   text: 'How satisfied are you with the accessibility...',
//   indonesian: 'Bagaimana tingkat kepuasan Anda terhadap...',
//   category: 'accessibility',
//   isRequired: true,
//   type: 'likert'
// }

// Filter mandatory questions:
const mandatory = SKM_QUESTIONS.filter(q => q.isRequired) // 20 questions

// Filter by category:
const accessibility = SKM_QUESTIONS.filter(q => q.category === 'accessibility')
```

#### 2. **SATISFACTION_LEVELS**
Map of all 5 satisfaction levels with labels and descriptions.

```typescript
// Access a satisfaction level:
const level = SATISFACTION_LEVELS[5]
// {
//   value: 5,
//   label: 'Very Satisfied',
//   indonesian: 'Sangat Puas',
//   description: 'Excellent service exceeds expectations'
// }
```

#### 3. **SKM_CATEGORIES**
Enum of all 8 dimension keys.

```typescript
SKM_CATEGORIES = {
  ACCESSIBILITY: 'accessibility',
  QUALITY: 'quality',
  PROFESSIONALISM: 'professionalism',
  COURTESY: 'courtesy',
  RELIABILITY: 'reliability',
  SECURITY: 'security',
  RESPONSE_TIME: 'response_time',
  FACILITIES: 'facilities'
}
```

#### 4. **SKM_CATEGORY_INFO: Record<SKMCategory, CategoryInfo>**
Metadata for each dimension with label, description, and question count.

```typescript
// Access category metadata:
const accessibilityInfo = SKM_CATEGORY_INFO['accessibility']
// {
//   label: 'Accessibility',
//   description: 'Ease of access to service facilities...',
//   questionCount: 3
// }
```

#### 5. **DEFAULT_CONFIG: AppConfig**
Complete application configuration object combining all SKM settings.

```typescript
DEFAULT_CONFIG = {
  version: '1.0.0',
  skm: {
    totalQuestions: 21,
    mandatoryQuestions: 20,
    categories: ['accessibility', 'quality', ...],
    minRating: 1,
    maxRating: 5
  },
  validation: { /* ... */ },
  api: { /* ... */ }
}
```

#### 6. **validateSKMConfiguration(): ValidationResult**
Function that validates the entire configuration against AC2 and AC15 requirements.

```typescript
const result = validateSKMConfiguration()
// {
//   isValid: true,
//   issues: [],
//   stats: {
//     totalQuestions: 21,
//     mandatoryQuestions: 20,
//     byCategory: {
//       accessibility: 3,
//       quality: 3,
//       professionalism: 2,
//       ...
//     }
//   }
// }
```

### Validation Configuration

```typescript
VALIDATION = {
  MIN_SATISFACTION_RATING: 1,
  MAX_SATISFACTION_RATING: 5,
  MAX_TEXT_LENGTH: 500,
  MAX_EMAIL_LENGTH: 254,
  MAX_NAME_LENGTH: 100,
  MIN_QUESTIONS_REQUIRED: 20  // Minimum 20 core questions must be answered
}
```

### Additional Constants

- **DEMOGRAPHIC_OPTIONS:** Age groups, service types, gender, education levels
- **API_ENDPOINTS:** Submit, analytics, export, health check endpoints
- **BACKEND_TYPES:** Google Sheets and Supabase support
- **HTTP_STATUS:** Standard HTTP status codes
- **PAGINATION:** Default page size and limits
- **CACHE_TTL:** Cache duration for analytics and responses

---

## Validation & Compliance

### AC2 Compliance Checklist

✅ **Standard SKM Questionnaire Structure**
- [x] 15-25 questions (have 21)
- [x] All questions follow Likert scale pattern (1-5)
- [x] Question categories/dimensions documented (8 categories)
- [x] Satisfaction levels defined (Very Satisfied → Very Dissatisfied)
- [x] Configuration properly typed with TypeScript

### AC15 Compliance Checklist

✅ **SKM Compliance Verification**
- [x] Proper question structure with IDs and categories
- [x] All 8 dimensions covered
- [x] Likert scale fully mapped (5 levels)
- [x] Satisfaction level definitions complete
- [x] Configuration validation function provided
- [x] Exports from `src/lib/constants.ts`

### Validation Function

The `validateSKMConfiguration()` function performs comprehensive checks:

```typescript
// Check 1: Total question count (15-25)
if (totalQuestions < 15 || totalQuestions > 25) {
  issues.push('Invalid question count')
}

// Check 2: Mandatory question count (minimum 20)
if (mandatoryQuestions < 20) {
  issues.push('Insufficient mandatory questions')
}

// Check 3: All categories represented
for (const category of expectedCategories) {
  if (questionsByCategory[category] === 0) {
    issues.push(`Missing category: ${category}`)
  }
}

// Check 4: Likert scale coverage
if (!hasLikertQuestions) {
  issues.push('No Likert scale questions')
}

// Check 5: All satisfaction levels defined
for (const level of [1, 2, 3, 4, 5]) {
  if (!satisfactionLevels[level]) {
    issues.push(`Missing level: ${level}`)
  }
}
```

---

## Usage Examples

### 1. Rendering a Single Question

```typescript
import { SKM_QUESTIONS, SATISFACTION_LEVELS } from '@/lib/constants'

function QuestionComponent({ index }: { index: number }) {
  const question = SKM_QUESTIONS[index]
  
  return (
    <div>
      <h3>{question.questionNumber}. {question.text}</h3>
      <p className="text-sm text-gray-600">{question.indonesian}</p>
      <div>
        {Object.entries(SATISFACTION_LEVELS).map(([rating, level]) => (
          <label key={rating}>
            <input type="radio" name={question.id} value={rating} />
            {level.label}
          </label>
        ))}
      </div>
    </div>
  )
}
```

### 2. Building a Response Object

```typescript
import { SKM_QUESTIONS } from '@/lib/constants'

// Collect responses for mandatory questions
const responses: Record<string, number> = {}
SKM_QUESTIONS.filter(q => q.isRequired).forEach(q => {
  responses[q.id] = getResponseForQuestion(q.id) // 1-5
})

// Build questionnaire response
const questionnaireResponse = {
  Q1: responses['Q1'],
  Q2: responses['Q2'],
  // ... etc
  Q21: openEndedComments // optional text
}
```

### 3. Calculating Dimension Averages

```typescript
import { SKM_QUESTIONS, SKM_CATEGORIES } from '@/lib/constants'

function calculateDimensionAverage(
  dimension: SKMCategory,
  responses: Record<string, number>
) {
  const dimensionQuestions = SKM_QUESTIONS.filter(
    q => q.category === dimension && q.type === 'likert'
  )
  
  const ratings = dimensionQuestions
    .map(q => responses[q.id])
    .filter(r => r !== undefined)
  
  const average = ratings.reduce((a, b) => a + b, 0) / ratings.length
  return Math.round(average * 100) / 100
}

// Usage:
const accessibilityScore = calculateDimensionAverage('accessibility', responses)
```

### 4. Validating Configuration

```typescript
import { validateSKMConfiguration } from '@/lib/constants'

// At application startup
const validation = validateSKMConfiguration()

if (!validation.isValid) {
  console.error('Configuration validation failed:')
  validation.issues.forEach(issue => console.error(`  - ${issue}`))
  process.exit(1)
}

console.log(`Configuration valid. Stats:`)
console.log(`  Total questions: ${validation.stats.totalQuestions}`)
console.log(`  Mandatory questions: ${validation.stats.mandatoryQuestions}`)
```

### 5. Displaying Satisfaction Distribution

```typescript
import { SATISFACTION_LEVELS, SATISFACTION_COLORS } from '@/lib/constants'

function SatisfactionChart({ distribution }: { distribution: Record<number, number> }) {
  return (
    <div>
      {Object.entries(SATISFACTION_LEVELS).map(([rating, level]) => (
        <div key={rating}>
          <span style={{ color: SATISFACTION_COLORS[rating as 1 | 2 | 3 | 4 | 5] }}>
            {level.label}: {distribution[rating] || 0} responses
          </span>
        </div>
      ))}
    </div>
  )
}
```

---

## Technical Details

### TypeScript Types

All constants are fully typed for compile-time safety:

```typescript
type SKMCategory = typeof SKM_CATEGORIES[keyof typeof SKM_CATEGORIES]
// Type: 'accessibility' | 'quality' | 'professionalism' | 'courtesy' 
//       | 'reliability' | 'security' | 'response_time' | 'facilities'

interface SKMQuestion {
  id: string
  questionNumber: number
  text: string
  indonesian: string
  category: SKMCategory
  isRequired: boolean
  type: 'likert' | 'text'
}

interface AppConfig {
  version: string
  skm: {
    totalQuestions: number
    mandatoryQuestions: number
    categories: SKMCategory[]
    minRating: number
    maxRating: number
  }
  validation: typeof VALIDATION
  api: typeof API_ENDPOINTS
}
```

### Immutability

All exported objects use `as const` assertions for full type inference and immutability:

```typescript
// Keys are literal types, values cannot be modified
export const SKM_CATEGORIES = {
  ACCESSIBILITY: 'accessibility',
  // ...
} as const
```

---

## Related Files

- **Type Definitions:** `src/lib/types/questionnaire.ts` (Question/Response types)
- **Backend Types:** `src/lib/types/backend.ts` (Backend strategies)
- **Tests:** `src/lib/constants.test.ts` (Validation tests)
- **Usage Example:** See component implementations in `src/app/`

---

## Support & Questions

For questions about the SKM configuration:

1. Check the **Usage Examples** section above
2. Review the **inline code comments** in `constants.ts`
3. Run the validation function: `validateSKMConfiguration()`
4. Check the unit tests for expected behavior
