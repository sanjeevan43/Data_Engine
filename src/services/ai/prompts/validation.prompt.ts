/**
 * Validation-specific prompts
 */

export const VALIDATION_PROMPT = `# Data Validation Task

You are given:
- Data rows: {dataPreview}
- Schema: {schema}
- Required fields: {requiredFields}

Your task: Validate each row against the schema and return structured errors/warnings.

## Validation Checks:
1. Required fields present and non-empty
2. Data type correctness
3. Email format (RFC 5322)
4. URL format (valid HTTP/HTTPS)
5. Number ranges (if specified in schema)
6. String length limits
7. Date format validity
8. Enum/allowed values

## Error Severity:
- "error": Blocks import (missing required field, invalid type)
- "warning": Suggest review (suspicious format, out of range)

## Output Format:
Return ONLY valid JSON:
{
  "isValid": boolean,
  "errors": [
    {
      "row": 1,
      "field": "email",
      "message": "Invalid email format",
      "severity": "error",
      "originalValue": "not-an-email",
      "suggestedValue": null
    }
  ],
  "warnings": [
    "Row 5: Age value 150 seems unrealistic",
    "Row 10: Empty optional field 'phone'"
  ],
  "validRowCount": number,
  "invalidRowCount": number
}

## Common Validation Patterns:
- Email: /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/
- URL: Must start with http:// or https://
- Phone: Basic format check (digits, dashes, parentheses)
- Date: ISO 8601 or common formats
- Number: Numeric, handle commas/currency symbols

Process now and return JSON only.`;

export const getValidationPrompt = (
    dataPreview: any[],
    schema: any,
    requiredFields: string[]
): string => {
    return VALIDATION_PROMPT
        .replace('{dataPreview}', JSON.stringify(dataPreview.slice(0, 100))) // Limit to 100 rows
        .replace('{schema}', JSON.stringify(schema))
        .replace('{requiredFields}', JSON.stringify(requiredFields));
};
