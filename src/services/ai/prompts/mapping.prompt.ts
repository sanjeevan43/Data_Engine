/**
 * Mapping-specific prompts for field mapping
 */

export const MAPPING_PROMPT = `# Field Mapping Task

You are given:
- CSV headers: {csvHeaders}
- Database schema fields: {schemaFields}
- Database provider: {provider}

Your task: Create intelligent mappings between CSV headers and database schema fields.

## Mapping Rules:
1. Exact matches take priority (case-insensitive)
2. Handle common variations:
   - "email" ↔ "user_email" ↔ "email_address"
   - "name" ↔ "full_name" ↔ "user_name"
   - "phone" ↔ "mobile" ↔ "phone_number" ↔ "contact"
   - "dob" ↔ "birth_date" ↔ "date_of_birth"
   - "id" ↔ "user_id" ↔ "customer_id"
3. Normalize special characters (spaces → underscores, etc.)
4. Consider semantic similarity
5. Mark unmapped fields clearly
6. Assign confidence scores (0.0 to 1.0)

## Output Format:
Return ONLY valid JSON:
{
  "mapping": {
    "csv_header_1": "db_field_1",
    "csv_header_2": "db_field_2"
  },
  "confidence": {
    "csv_header_1": 1.0,
    "csv_header_2": 0.8
  },
  "unmappedCsvFields": ["csv_field_without_match"],
  "unmappedSchemaFields": ["schema_field_without_match"],
  "suggestions": [
    "Consider mapping 'tel' to 'phone_number' manually (low confidence)",
    "Field 'notes' has no schema match - may be ignored"
  ]
}

## Confidence Scoring:
- 1.0 = Exact match
- 0.9 = Very close match (email → user_email)
- 0.7 = Semantic match (phone → mobile)
- 0.5 = Possible match (requires review)
- 0.0 = No match

Process now and return JSON only.`;

export const getMappingPrompt = (
    csvHeaders: string[],
    schemaFields: string[],
    provider: string
): string => {
    return MAPPING_PROMPT
        .replace('{csvHeaders}', JSON.stringify(csvHeaders))
        .replace('{schemaFields}', JSON.stringify(schemaFields))
        .replace('{provider}', provider);
};
