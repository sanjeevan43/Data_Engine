/**
 * Direct AI System Test (No Build Required)
 * Tests the AI agent with sample CSV data
 */

import { DataEntryAgent } from '../services/ai/agent/DataEntryAgent';
import type { PipelineConfig } from '../context/FirebaseContext';

// Sample CSV data with common real-world issues
const sampleHeaders = [
    'Email Address',
    'Full Name',
    'Phone Number',
    'Age',
    'Active Status',
    'Join Date'
];

const sampleRows = [
    // Good data
    ['john.doe@company.com', 'John Doe', '555-1234', '28', 'yes', '2024-01-15'],

    // Whitespace issues
    ['  jane.smith@company.com  ', '  Jane Smith  ', '555-5678', '32', 'true', '2024-02-20'],

    // Case issues
    ['BOB.JONES@COMPANY.COM', 'Bob Jones', '555-9999', '45', 'YES', '2024-03-10'],

    // Invalid email
    ['not-an-email', 'Invalid User', '555-0000', '25', 'no', '2024-04-01'],

    // Invalid age (too high)
    ['alice@test.com', 'Alice Brown', '555-1111', '150', '1', '2024-05-15'],

    // Invalid age (not a number)
    ['charlie@test.com', 'Charlie Davis', '555-2222', 'twenty-five', 'false', '2024-06-20'],

    // Duplicate of first row
    ['john.doe@company.com', 'John Doe', '555-1234', '28', 'yes', '2024-01-15'],

    // Number with comma
    ['david@test.com', 'David Wilson', '555-3333', '1,234', '0', '2024-07-01'],
];

const config: PipelineConfig = {
    provider: 'Firebase',
    collectionName: 'users',
    apiKey: 'test-api-key',
    projectId: 'test-project',
    appId: 'test-app-id'
};

console.log('\n' + '='.repeat(80));
console.log('🧪 AI DATA ENTRY AGENT - COMPREHENSIVE TEST');
console.log('='.repeat(80));

console.log('\n📥 INPUT DATA:');
console.log('Headers:', sampleHeaders);
console.log('Total Rows:', sampleRows.length);
console.log('\nSample rows:');
sampleRows.slice(0, 3).forEach((row, i) => {
    console.log(`  Row ${i + 1}:`, row);
});

async function testAIAgent() {
    try {
        console.log('\n⏳ Creating AI Agent with auto-fix enabled...');
        const agent = DataEntryAgent.create({ autoFix: true });

        console.log('⏳ Processing data with AI...\n');

        const result = await agent.quickProcess(
            sampleHeaders,
            sampleRows,
            config
        );

        console.log('✅ AI PROCESSING COMPLETE!\n');
        console.log('='.repeat(80));
        console.log('📊 RESULTS SUMMARY');
        console.log('='.repeat(80));

        // Statistics
        console.log('\n📈 Statistics:');
        console.log(`  ✓ Total Rows Processed: ${result.stats.totalRows}`);
        console.log(`  ✓ Valid Rows: ${result.stats.validRows}`);
        console.log(`  ✗ Invalid Rows: ${result.stats.invalidRows}`);
        console.log(`  🔧 Transformations Applied: ${result.stats.transformationsApplied}`);
        console.log(`  🗑️  Duplicates Removed: ${result.stats.duplicatesRemoved}`);
        console.log(`  📋 Fields Processed: ${result.stats.fieldsProcessed}`);

        // Field Mapping
        console.log('\n🗺️  Field Mapping (CSV → Database):');
        Object.entries(result.mapping).forEach(([csvField, dbField]) => {
            console.log(`  "${csvField}" → "${dbField}"`);
        });

        // Cleaned Data
        console.log('\n✨ Cleaned Data (Ready for Import):');
        console.log(`Total cleaned rows: ${result.cleanedData.length}\n`);
        result.cleanedData.forEach((row, index) => {
            console.log(`Row ${index + 1}:`);
            Object.entries(row).forEach(([key, value]) => {
                if (!key.startsWith('_')) { // Skip metadata fields
                    console.log(`  ${key}: ${JSON.stringify(value)}`);
                }
            });
            console.log('');
        });

        // Errors
        console.log('❌ Validation Errors:');
        if (result.errors.length === 0) {
            console.log('  🎉 No errors! All data is valid.\n');
        } else {
            console.log(`  Found ${result.errors.length} errors:\n`);
            result.errors.forEach((error, i) => {
                console.log(`  ${i + 1}. Row ${error.row}, Field "${error.field}"`);
                console.log(`     Message: ${error.message}`);
                console.log(`     Severity: ${error.severity}`);
                console.log(`     Original Value: ${JSON.stringify(error.originalValue)}`);
                if (error.suggestedValue !== undefined) {
                    console.log(`     Suggested Fix: ${JSON.stringify(error.suggestedValue)}`);
                }
                console.log('');
            });
        }

        // Warnings
        console.log('⚠️  Warnings:');
        if (result.warnings.length === 0) {
            console.log('  None.\n');
        } else {
            result.warnings.forEach(warning => {
                console.log(`  • ${warning}`);
            });
            console.log('');
        }

        // Suggestions
        console.log('💡 AI Suggestions:');
        if (result.suggestions && result.suggestions.length > 0) {
            result.suggestions.forEach(suggestion => {
                console.log(`  • ${suggestion}`);
            });
        } else {
            console.log('  None.');
        }

        console.log('\n' + '='.repeat(80));
        console.log('✅ TEST COMPLETED SUCCESSFULLY!');
        console.log('='.repeat(80));

        console.log('\n📝 SUMMARY:');
        console.log(`  • Processed ${result.stats.totalRows} rows`);
        console.log(`  • Cleaned ${result.cleanedData.length} rows ready for database import`);
        console.log(`  • Applied ${result.stats.transformationsApplied} automatic fixes`);
        console.log(`  • Removed ${result.stats.duplicatesRemoved} duplicate(s)`);
        console.log(`  • Found ${result.errors.length} validation error(s)`);

        console.log('\n🎯 NEXT STEP:');
        console.log('  Use result.cleanedData with DataManager.importData() to write to database');
        console.log('  Example: await DataManager.importData(result.cleanedData, config);');

        console.log('\n' + '='.repeat(80));

        return result;

    } catch (error: any) {
        console.error('\n💥 TEST FAILED!');
        console.error('='.repeat(80));
        console.error('Error:', error.message);
        console.error('\nStack Trace:');
        console.error(error.stack);
        console.error('='.repeat(80));
        throw error;
    }
}

// Run the test
testAIAgent()
    .then(() => {
        console.log('\n✅ All tests passed!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n❌ Tests failed:', error.message);
        process.exit(1);
    });
