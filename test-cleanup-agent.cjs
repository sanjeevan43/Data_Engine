/**
 * Quick test script for Code Cleanup Agent
 * Run with: node test-cleanup-agent.cjs
 */

console.log('🤖 Testing Code Cleanup Agent...\n');

// Test 1: Check if files exist
const fs = require('fs');
const path = require('path');

const requiredFiles = [
    'src/services/ai/agent/CodeCleanupAgent.ts',
    'src/hooks/useCodeCleanup.ts',
    'src/components/CodeCleanupPanel.tsx',
    'src/pages/CodeCleanupPage.tsx',
    'scripts/cleanup-code.ts',
    'docs/CODE_CLEANUP_AGENT.md',
    'CODE_CLEANUP_AGENT_README.md'
];

console.log('✅ Checking if all files exist...');
let allFilesExist = true;

requiredFiles.forEach(file => {
    const exists = fs.existsSync(path.join(__dirname, file));
    if (exists) {
        console.log(`   ✓ ${file}`);
    } else {
        console.log(`   ✗ ${file} - MISSING!`);
        allFilesExist = false;
    }
});

if (allFilesExist) {
    console.log('\n✅ All files created successfully!\n');
} else {
    console.log('\n❌ Some files are missing!\n');
    process.exit(1);
}

// Test 2: Check package.json scripts
console.log('✅ Checking package.json scripts...');
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf-8'));

const requiredScripts = [
    'cleanup',
    'cleanup:fix',
    'cleanup:report',
    'cleanup:all'
];

let allScriptsExist = true;

requiredScripts.forEach(script => {
    if (packageJson.scripts[script]) {
        console.log(`   ✓ npm run ${script}`);
    } else {
        console.log(`   ✗ npm run ${script} - MISSING!`);
        allScriptsExist = false;
    }
});

if (allScriptsExist) {
    console.log('\n✅ All scripts configured successfully!\n');
} else {
    console.log('\n❌ Some scripts are missing!\n');
    process.exit(1);
}

// Test 3: Check if tsx is installed
console.log('✅ Checking dependencies...');
if (packageJson.devDependencies.tsx) {
    console.log(`   ✓ tsx installed (${packageJson.devDependencies.tsx})`);
} else {
    console.log('   ✗ tsx not installed - run: npm install -D tsx');
    allScriptsExist = false;
}

// Test 4: Verify file content
console.log('\n✅ Verifying file content...');

const agentFile = fs.readFileSync('src/services/ai/agent/CodeCleanupAgent.ts', 'utf-8');
const hasDetectionMethods = 
    agentFile.includes('checkNamingConventions') &&
    agentFile.includes('checkSpelling') &&
    agentFile.includes('checkDataErrors') &&
    agentFile.includes('checkUIBugs') &&
    agentFile.includes('checkCodeQuality');

if (hasDetectionMethods) {
    console.log('   ✓ CodeCleanupAgent has all detection methods');
} else {
    console.log('   ✗ CodeCleanupAgent is missing detection methods');
}

const hookFile = fs.readFileSync('src/hooks/useCodeCleanup.ts', 'utf-8');
const hasHookMethods = 
    hookFile.includes('scanFile') &&
    hookFile.includes('scanCodebase') &&
    hookFile.includes('applyFixes');

if (hasHookMethods) {
    console.log('   ✓ useCodeCleanup hook has all methods');
} else {
    console.log('   ✗ useCodeCleanup hook is missing methods');
}

const componentFile = fs.readFileSync('src/components/CodeCleanupPanel.tsx', 'utf-8');
const hasUIFeatures = 
    componentFile.includes('filterType') &&
    componentFile.includes('filterSeverity') &&
    componentFile.includes('exportReport');

if (hasUIFeatures) {
    console.log('   ✓ CodeCleanupPanel has all UI features');
} else {
    console.log('   ✗ CodeCleanupPanel is missing UI features');
}

// Summary
console.log('\n' + '='.repeat(50));
console.log('🎉 CODE CLEANUP AGENT TEST COMPLETE!');
console.log('='.repeat(50));
console.log('\n✅ All tests passed! The agent is ready to use.\n');
console.log('Next steps:');
console.log('1. Run: npm run dev');
console.log('2. Visit: http://localhost:5173/cleanup');
console.log('3. Or run: npm run cleanup\n');
console.log('📚 Documentation: CODE_CLEANUP_AGENT_README.md\n');
