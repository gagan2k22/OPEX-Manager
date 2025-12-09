const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Color codes for console output
const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m'
};

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
const errors = [];

function log(message, color = colors.reset) {
    console.log(`${color}${message}${colors.reset}`);
}

function logTest(testName, passed, error = null) {
    totalTests++;
    if (passed) {
        passedTests++;
        log(`✓ ${testName}`, colors.green);
    } else {
        failedTests++;
        log(`✗ ${testName}`, colors.red);
        if (error) {
            log(`  Error: ${error.message}`, colors.red);
            errors.push({ test: testName, error: error.message, stack: error.stack });
        }
    }
}

async function testDatabaseConnection() {
    log('\n=== Testing Database Connection ===', colors.cyan);
    try {
        await prisma.$connect();
        logTest('Database connection', true);
        return true;
    } catch (error) {
        logTest('Database connection', false, error);
        return false;
    }
}

async function testModels() {
    log('\n=== Testing Database Models ===', colors.cyan);

    const models = [
        'user', 'role', 'userRole', 'tower', 'budgetHead', 'vendor',
        'costCentre', 'pOEntity', 'serviceType', 'allocationBasis',
        'fiscalYear', 'lineItem', 'budgetMonth', 'pO', 'actual',
        'auditLog', 'userActivityLog', 'currencyRate', 'pOLineItem',
        'importJob', 'savedView', 'reconciliationNote'
    ];

    for (const model of models) {
        try {
            if (prisma[model]) {
                await prisma[model].count();
                logTest(`Model: ${model}`, true);
            } else {
                // Some models might be capitalized differently in client property
                // e.g. POEntity vs pOEntity. Let's try to verify property existence dynamically if needed
                // But generally prisma client uses camelCase for model names
                throw new Error(`Model ${model} not found in Prisma client`);
            }
        } catch (error) {
            // Check if error is just because table empty or something benign
            logTest(`Model: ${model}`, false, error);
        }
    }
}

async function testDataIntegrity() {
    log('\n=== Testing Data Integrity ===', colors.cyan);

    // Test 1: Check for users
    try {
        const count = await prisma.user.count();
        logTest(`Users exist (count: ${count})`, count > 0);
    } catch (error) {
        logTest('Users exist', false, error);
    }

    // Test 2: Check for towers
    try {
        const count = await prisma.tower.count();
        logTest(`Towers exist (count: ${count})`, count > 0);
    } catch (error) {
        logTest('Towers exist', false, error);
    }

    // Test 3: Check for budget heads
    try {
        const count = await prisma.budgetHead.count();
        logTest(`Budget Heads exist (count: ${count})`, count > 0);
    } catch (error) {
        logTest('Budget Heads exist', false, error);
    }

    // Test 4: Check for vendors
    try {
        const count = await prisma.vendor.count();
        logTest(`Vendors exist (count: ${count})`, count > 0);
    } catch (error) {
        logTest('Vendors exist', false, error);
    }

    // Test 5: Check for fiscal years
    try {
        const count = await prisma.fiscalYear.count();
        logTest(`Fiscal Years exist (count: ${count})`, count > 0);
    } catch (error) {
        logTest('Fiscal Years exist', false, error);
    }
}

async function testRelationships() {
    log('\n=== Testing Relationships ===', colors.cyan);

    // Test 1: User with roles
    try {
        // Just verify the query syntax is valid for the schema
        const userWithRoles = await prisma.user.findFirst({
            include: { roles: { include: { role: true } } }
        });
        logTest('User with roles relationship query works', true);
    } catch (error) {
        logTest('User with roles relationship', false, error);
    }

    // Test 2: Tower with budget heads
    try {
        const towerWithBudgetHeads = await prisma.tower.findFirst({
            include: { budget_heads: true }
        });
        logTest('Tower with budget heads relationship query works', true);
    } catch (error) {
        logTest('Tower with budget heads relationship', false, error);
    }

    // Test 3: LineItem relations
    try {
        const lineItem = await prisma.lineItem.findFirst({
            include: {
                tower: true,
                budgetHead: true,
                months: true
            }
        });
        logTest('LineItem relationships query works', true);
    } catch (error) {
        logTest('LineItem relationships query', false, error);
    }
}

async function testUniqueConstraints() {
    log('\n=== Testing Unique Constraints ===', colors.cyan);

    // Test 1: Unique email for users
    try {
        const users = await prisma.user.findMany();
        const emails = users.map(u => u.email);
        const uniqueEmails = new Set(emails);
        logTest('User emails are unique', emails.length === uniqueEmails.size);
    } catch (error) {
        logTest('User emails are unique', false, error);
    }
}

async function testDataValidation() {
    log('\n=== Testing Data Validation ===', colors.cyan);

    // Test 1: All users have valid emails
    try {
        const users = await prisma.user.findMany();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const allValid = users.every(u => emailRegex.test(u.email));
        logTest('All user emails are valid', allValid);
    } catch (error) {
        logTest('All user emails are valid', false, error);
    }
}

async function generateReport() {
    log('\n' + '='.repeat(60), colors.magenta);
    log('COMPREHENSIVE TEST REPORT', colors.magenta);
    log('='.repeat(60), colors.magenta);

    log(`\nTotal Tests: ${totalTests}`, colors.blue);
    log(`Passed: ${passedTests}`, colors.green);
    log(`Failed: ${failedTests}`, colors.red);

    const successRate = totalTests > 0 ? ((passedTests / totalTests) * 100).toFixed(2) : 0;
    log(`Success Rate: ${successRate}%`, successRate >= 80 ? colors.green : colors.yellow);

    if (errors.length > 0) {
        log('\n=== ERRORS DETAILS ===', colors.red);
        errors.forEach((err, index) => {
            log(`\n${index + 1}. ${err.test}`, colors.yellow);
            log(`   ${err.error}`, colors.red);
        });
    }

    log('\n' + '='.repeat(60), colors.magenta);
}

async function runAllTests() {
    log('Starting Comprehensive Test Suite...', colors.cyan);
    log('Timestamp: ' + new Date().toISOString(), colors.blue);

    const dbConnected = await testDatabaseConnection();

    if (dbConnected) {
        await testModels();
        await testDataIntegrity();
        await testRelationships();
        await testUniqueConstraints();
        await testDataValidation();
    } else {
        log('\nSkipping further tests due to database connection failure', colors.red);
    }

    await generateReport();

    await prisma.$disconnect();

    // Exit with error code if tests failed
    process.exit(failedTests > 0 ? 1 : 0);
}

// Run tests
runAllTests().catch(error => {
    console.error('Fatal error running tests:', error);
    process.exit(1);
});
