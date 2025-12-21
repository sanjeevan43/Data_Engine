/**
 * AI System Test Suite
 * Tests all AI tools and agent functionality
 */

import { DataEntryAgent } from './src/services/ai/agent/DataEntryAgent';
import { AnalyzeCsvTool } from './src/services/ai/tools/analyzeCsvTool';
import { MapFieldsTool } from './src/services/ai/tools/mapFieldsTool';
import { ValidateDataTool } from './src/services/ai/tools/validateDataTool';
import { FixDataTool } from './src/services/ai/tools/fixDataTool';
import { SchemaTool } from './src/services/ai/tools/schemaTool';
import type { CollectionSchema, PipelineConfig } from './src/services/ai/types';

// Test data
const testHeaders = ['Email Address', 'Full Name', 'Phone Number', 'Age', 'Active Status', 'Website'];

const testRows = [
    ['john@example.com', 'John Doe', '555-1234', '25', 'yes', 'https://john.com'],
    ['  JANE@EXAMPLE.COM  ', 'Jane Smith', '555-5678', '30', 'true', 'http://jane.com'],
    ['invalid-email', 'Bob Johnson', '555-9999', 'not-a-number', 'no', 'not-a-url'],
    ['alice@test.com', 'Alice Brown', '555-0000', '150', '1', 'https://alice.com'],
    ['charlie@test.com', 'Charlie Davis', '555-1111', '22', 'false', 'https://charlie.com'],
    ['john@example.com', 'John Doe', '555-1234', '25', 'yes', 'https://john.com'], // Duplicate
];

const testConfig: PipelineConfig = {
    provider: 'Firebase',
    collectionName: 'test_users',
    apiKey: 'test-key',
    projectId: 'test-project',
    appId: 'test-app'
};

const testSchema: CollectionSchema = {
    fields: [
        { name: 'email', type: 'email', required: true },
        { name: 'name', type: 'string', required: true },
        { name: 'phone', type: 'string', required: false },
        { name: 'age', type: 'number', required: false, validation: { min: 0, max: 120 } },
        { name: 'active', type: 'boolean', required: false },
        { name: 'website', type: 'url', required: false }
    ],
    required: ['email', 'name']
};

console.log('🧪 AI SYSTEM TEST SUITE\n');
console.log('='.repeat(80));

// Test 1: CSV Analysis
console.log('\n📊 TEST 1: CSV Analysis Tool');
console.log('-'.repeat(80));
try {
    const analysisResult = AnalyzeCsvTool.analyze(testHeaders, testRows);
    console.log('✅ Analysis completed successfully');
    console.log('Headers:', analysisResult.headers);
    console.log('Row count:', analysisResult.rowCount);
    console.log('Detected types:', JSON.stringify(analysisResult.detectedTypes, null, 2));
    console.log('Null counts:', JSON.stringify(analysisResult.nullCounts, null, 2));
    console.log('Recommendations:', analysisResult.recommendations);
} catch (error) {
    console.error('❌ Analysis failed:', error);
}

// Test 2: Field Mapping
console.log('\n🗺️  TEST 2: Field Mapping Tool');
console.log('-'.repeat(80));
try {
    const mappingResult = MapFieldsTool.createMapping(testHeaders, testSchema, 'Firebase');
    console.log('✅ Mapping completed successfully');
    console.log('Mapping:', JSON.stringify(mappingResult.mapping, null, 2));
    console.log('Confidence:', JSON.stringify(mappingResult.confidence, null, 2));
    console.log('Unmapped CSV fields:', mappingResult.unmappedCsvFields);
    console.log('Unmapped schema fields:', mappingResult.unmappedSchemaFields);
    console.log('Suggestions:', mappingResult.suggestions);
} catch (error) {
    console.error('❌ Mapping failed:', error);
}

// Test 3: Schema Inference
console.log('\n📋 TEST 3: Schema Inference Tool');
console.log('-'.repeat(80));
try {
    const analysisForSchema = AnalyzeCsvTool.analyze(testHeaders, testRows);
    const inferredSchema = SchemaTool.inferSchema(
        testHeaders,
        testRows,
        analysisForSchema.detectedTypes
    );
    console.log('✅ Schema inference completed successfully');
    console.log('Inferred schema:', JSON.stringify(inferredSchema, null, 2));

    const schemaValidation = SchemaTool.validateSchema(inferredSchema);
    console.log('Schema validation:', schemaValidation);
} catch (error) {
    console.error('❌ Schema inference failed:', error);
}

// Test 4: Data Transformation
console.log('\n🔄 TEST 4: Data Transformation');
console.log('-'.repeat(80));
try {
    const mappingResult = MapFieldsTool.createMapping(testHeaders, testSchema, 'Firebase');

    // Transform rows to objects
    const transformedData = testRows.map(row => {
        const obj: Record<string, any> = {};
        testHeaders.forEach((header, index) => {
            const mappedField = mappingResult.mapping[header];
            if (mappedField) {
                obj[mappedField] = row[index];
            }
        });
        return obj;
    });

    console.log('✅ Transformation completed successfully');
    console.log('Sample transformed row:', JSON.stringify(transformedData[0], null, 2));
    console.log('Total transformed rows:', transformedData.length);
} catch (error) {
    console.error('❌ Transformation failed:', error);
}

// Test 5: Data Validation
console.log('\n✅ TEST 5: Data Validation Tool');
console.log('-'.repeat(80));
try {
    const mappingResult = MapFieldsTool.createMapping(testHeaders, testSchema, 'Firebase');
    const transformedData = testRows.map(row => {
        const obj: Record<string, any> = {};
        testHeaders.forEach((header, index) => {
            const mappedField = mappingResult.mapping[header];
            if (mappedField) {
                obj[mappedField] = row[index];
            }
        });
        return obj;
    });

    const validationResult = ValidateDataTool.validate(transformedData, testSchema);
    console.log('✅ Validation completed successfully');
    console.log('Is valid:', validationResult.isValid);
    console.log('Valid rows:', validationResult.validRowCount);
    console.log('Invalid rows:', validationResult.invalidRowCount);
    console.log('Errors found:', validationResult.errors.length);
    console.log('\nFirst 3 errors:');
    validationResult.errors.slice(0, 3).forEach(error => {
        console.log(`  - Row ${error.row}, Field "${error.field}": ${error.message} (${error.severity})`);
    });
    console.log('Warnings:', validationResult.warnings);
} catch (error) {
    console.error('❌ Validation failed:', error);
}

// Test 6: Data Fixing
console.log('\n🔧 TEST 6: Data Fixing Tool');
console.log('-'.repeat(80));
try {
    const mappingResult = MapFieldsTool.createMapping(testHeaders, testSchema, 'Firebase');
    const transformedData = testRows.map(row => {
        const obj: Record<string, any> = {};
        testHeaders.forEach((header, index) => {
            const mappedField = mappingResult.mapping[header];
            if (mappedField) {
                obj[mappedField] = row[index];
            }
        });
        return obj;
    });

    const validationResult = ValidateDataTool.validate(transformedData, testSchema);
    const fixResult = FixDataTool.fix(transformedData, validationResult.errors);

    console.log('✅ Fixing completed successfully');
    console.log('Fixed data rows:', fixResult.fixedData.length);
    console.log('Transformations applied:', fixResult.transformations.length);
    console.log('Unfixable errors:', fixResult.unfixableErrors.length);

    console.log('\nFirst 3 transformations:');
    fixResult.transformations.slice(0, 3).forEach(t => {
        console.log(`  - Row ${t.row}, Field "${t.field}": ${t.operation}`);
        console.log(`    Before: ${JSON.stringify(t.originalValue)}`);
        console.log(`    After: ${JSON.stringify(t.newValue)}`);
    });

    console.log('\nSample fixed row:', JSON.stringify(fixResult.fixedData[0], null, 2));
} catch (error) {
    console.error('❌ Fixing failed:', error);
}

// Test 7: Full Agent Integration
console.log('\n🤖 TEST 7: Full AI Agent Integration');
console.log('-'.repeat(80));
async function testAgent() {
    try {
        const agent = DataEntryAgent.create({ autoFix: true });

        const result = await agent.process({
            csvHeaders: testHeaders,
            csvRows: testRows,
            sampleRows: testRows.slice(0, 3),
            selectedDatabaseProvider: 'Firebase',
            targetCollectionName: 'test_users',
            collectionSchema: testSchema,
            pipelineConfig: testConfig,
            autoFix: true
        });

        console.log('✅ Agent processing completed successfully');
        console.log('\n📊 FINAL RESULTS:');
        console.log('='.repeat(80));

        console.log('\n1. Field Mapping:');
        console.log(JSON.stringify(result.mapping, null, 2));

        console.log('\n2. Statistics:');
        console.log(`   Total rows: ${result.stats.totalRows}`);
        console.log(`   Valid rows: ${result.stats.validRows}`);
        console.log(`   Invalid rows: ${result.stats.invalidRows}`);
        console.log(`   Fields processed: ${result.stats.fieldsProcessed}`);
        console.log(`   Transformations applied: ${result.stats.transformationsApplied}`);
        console.log(`   Duplicates removed: ${result.stats.duplicatesRemoved}`);

        console.log('\n3. Cleaned Data (first 2 rows):');
        result.cleanedData.slice(0, 2).forEach((row, i) => {
            console.log(`   Row ${i + 1}:`, JSON.stringify(row, null, 2));
        });

        console.log('\n4. Errors:');
        if (result.errors.length === 0) {
            console.log('   ✅ No errors!');
        } else {
            result.errors.forEach(error => {
                console.log(`   ❌ Row ${error.row}, Field "${error.field}": ${error.message}`);
            });
        }

        console.log('\n5. Warnings:');
        if (result.warnings.length === 0) {
            console.log('   ✅ No warnings!');
        } else {
            result.warnings.forEach(warning => {
                console.log(`   ⚠️  ${warning}`);
            });
        }

        console.log('\n6. Suggestions:');
        result.suggestions?.forEach(suggestion => {
            console.log(`   💡 ${suggestion}`);
        });

        console.log('\n' + '='.repeat(80));
        console.log('🎉 ALL TESTS COMPLETED SUCCESSFULLY!');
        console.log('='.repeat(80));

        return result;
    } catch (error) {
        console.error('❌ Agent processing failed:', error);
        if (error instanceof Error) {
            console.error('Error message:', error.message);
            console.error('Stack trace:', error.stack);
        }
        throw error;
    }
}

// Run the agent test
testAgent().catch(err => {
    console.error('\n💥 FATAL ERROR:', err);
    process.exit(1);
});
