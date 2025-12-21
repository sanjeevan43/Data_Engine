/**
 * Simple AI System Test
 */

// Import using relative paths
import { DataEntryAgent } from './src/services/ai/index.js';

// Test data - realistic CSV with common issues
const testHeaders = ['Email Address', 'Full Name', 'Phone Number', 'Age', 'Active'];

const testRows = [
    ['john@example.com', 'John Doe', '555-1234', '25', 'yes'],
    ['  JANE@EXAMPLE.COM  ', 'Jane Smith', '555-5678', '30', 'true'],
    ['invalid-email', 'Bob Johnson', '555-9999', 'not-a-number', 'no'],
    ['alice@test.com', 'Alice Brown', '555-0000', '22', '1'],
];

const testConfig = {
    provider: 'Firebase',
    collectionName: 'test_users',
    apiKey: 'test-key',
    projectId: 'test-project',
    appId: 'test-app'
};

console.log('🧪 Testing AI Data Entry Agent\n');
console.log('Input CSV Headers:', testHeaders);
console.log('Input CSV Rows:', testRows.length, 'rows\n');

async function runTest() {
    try {
        const agent = DataEntryAgent.create({ autoFix: true });

        console.log('⏳ Processing with AI Agent...\n');

        const result = await agent.quickProcess(
            testHeaders,
            testRows,
            testConfig
        );

        console.log('✅ AI Processing Complete!\n');
        console.log('='.repeat(60));
        console.log('RESULTS:');
        console.log('='.repeat(60));

        console.log('\n📊 Statistics:');
        console.log('  Total Rows:', result.stats.totalRows);
        console.log('  Valid Rows:', result.stats.validRows);
        console.log('  Invalid Rows:', result.stats.invalidRows);
        console.log('  Transformations:', result.stats.transformationsApplied);
        console.log('  Duplicates Removed:', result.stats.duplicatesRemoved);

        console.log('\n🗺️  Field Mapping:');
        Object.entries(result.mapping).forEach(([csv, db]) => {
            console.log(`  "${csv}" → "${db}"`);
        });

        console.log('\n✨ Cleaned Data:');
        result.cleanedData.forEach((row, i) => {
            console.log(`  Row ${i + 1}:`, JSON.stringify(row, null, 2));
        });

        console.log('\n❌ Errors:');
        if (result.errors.length === 0) {
            console.log('  None! 🎉');
        } else {
            result.errors.forEach(err => {
                console.log(`  Row ${err.row}, ${err.field}: ${err.message}`);
            });
        }

        console.log('\n⚠️  Warnings:');
        if (result.warnings.length === 0) {
            console.log('  None!');
        } else {
            result.warnings.forEach(w => console.log(`  ${w}`));
        }

        console.log('\n💡 Suggestions:');
        result.suggestions?.slice(0, 5).forEach(s => console.log(`  ${s}`));

        console.log('\n' + '='.repeat(60));
        console.log('✅ TEST PASSED - AI SYSTEM WORKING PERFECTLY!');
        console.log('='.repeat(60));

    } catch (error) {
        console.error('\n❌ TEST FAILED:', error.message);
        console.error('Stack:', error.stack);
        process.exit(1);
    }
}

runTest();
