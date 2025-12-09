const axios = require('axios');

const BASE_URL = 'http://localhost:5000';
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
            log(`  Error: ${error}`, colors.red);
            errors.push({ test: testName, error });
        }
    }
}

async function testServerConnection() {
    log('\n=== Testing Server Connection ===', colors.cyan);
    try {
        const response = await axios.get(`${BASE_URL}/`);
        logTest('Server is running', response.status === 200);
        return true;
    } catch (error) {
        logTest('Server is running', false, error.message);
        return false;
    }
}

async function testAuthEndpoints() {
    log('\n=== Testing Auth Endpoints ===', colors.cyan);

    // Test login endpoint
    try {
        const response = await axios.post(`${BASE_URL}/api/auth/login`, {
            email: 'admin@example.com',
            password: 'admin123'
        });
        logTest('POST /api/auth/login', response.status === 200 && response.data.token);
        return response.data.token;
    } catch (error) {
        logTest('POST /api/auth/login', false, error.response?.data?.message || error.message);
        return null;
    }
}

async function testGetEndpoint(name, url, token) {
    try {
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const response = await axios.get(`${BASE_URL}${url}`, { headers });
        logTest(`GET ${url}`, response.status === 200 && Array.isArray(response.data));
    } catch (error) {
        logTest(`GET ${url}`, false, error.response?.data?.message || error.message);
    }
}

async function testMasterDataEndpoints(token) {
    log('\n=== Testing Master Data Endpoints ===', colors.cyan);
    await testGetEndpoint('Towers', '/api/master/towers', token);
    await testGetEndpoint('Budget Heads', '/api/master/budget-heads', token);
    await testGetEndpoint('Vendors', '/api/master/vendors', token);
    await testGetEndpoint('Cost Centres', '/api/master/cost-centres', token);
    await testGetEndpoint('PO Entities', '/api/master/po-entities', token);
    await testGetEndpoint('Service Types', '/api/master/service-types', token);
    await testGetEndpoint('Allocation Bases', '/api/master/allocation-bases', token);
}

async function testBudgetEndpoints(token) {
    log('\n=== Testing Budget Endpoints ===', colors.cyan);
    // Note: /api/budgets/tracker must be verified directly if /api/budgets root isn't array
    // Checking route structure: router.get('/', getBudgets) returns array.
    await testGetEndpoint('Budgets', '/api/budgets', token);
    await testGetEndpoint('Budget Tracker', '/api/budgets/tracker', token);
}

async function testLineItemEndpoints(token) {
    log('\n=== Testing Line Item Endpoints ===', colors.cyan);
    await testGetEndpoint('Line Items', '/api/line-items', token);
}

async function testPOEndpoints(token) {
    log('\n=== Testing PO Endpoints ===', colors.cyan);
    await testGetEndpoint('POs', '/api/pos', token);
}

async function testActualsEndpoints(token) {
    log('\n=== Testing Actuals Endpoints ===', colors.cyan);
    await testGetEndpoint('Actuals', '/api/actuals', token);
}

async function testFiscalYearEndpoints(token) {
    log('\n=== Testing Fiscal Year Endpoints ===', colors.cyan);
    await testGetEndpoint('Fiscal Years', '/api/fiscal-years', token);
    await testGetEndpoint('Active Fiscal Year', '/api/fiscal-years/active', token);
}

async function generateReport() {
    log('\n' + '='.repeat(60), colors.magenta);
    log('API TEST REPORT', colors.magenta);
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
    log('Starting API Test Suite...', colors.cyan);
    log('Timestamp: ' + new Date().toISOString(), colors.blue);

    const serverRunning = await testServerConnection();
    if (!serverRunning) return;

    const token = await testAuthEndpoints();
    if (token) {
        await testMasterDataEndpoints(token);
        await testBudgetEndpoints(token);
        await testLineItemEndpoints(token);
        await testPOEndpoints(token);
        await testActualsEndpoints(token);
        await testFiscalYearEndpoints(token);
    } else {
        log('Skipping authenticated tests due to login failure', colors.red);
    }

    await generateReport();
    process.exit(failedTests > 0 ? 1 : 0);
}

runAllTests().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
});
