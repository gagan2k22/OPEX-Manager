
const path = require('path');
// Mock express and other things if needed, but let's just see if they load
process.env.NODE_ENV = 'development';
process.env.DATABASE_URL = 'file:./dev.db';

try {
    console.log('Testing requires...');
    require('./src/config');
    console.log('config ok');
    require('./src/routes/auth.routes');
    console.log('auth.routes ok');
    require('./src/routes/user.routes');
    console.log('user.routes ok');
    require('./src/routes/masterData.routes');
    console.log('masterData.routes ok');
    require('./src/routes/budget.routes');
    console.log('budget.routes ok');
    require('./src/routes/po.routes');
    console.log('po.routes ok');
    require('./src/routes/actuals.routes');
    console.log('actuals.routes ok');
    require('./src/routes/actualsImport.routes');
    console.log('actualsImport.routes ok');
    require('./src/routes/neno.routes');
    console.log('neno.routes ok');
} catch (e) {
    console.error('Error in require:', e.message);
    console.error(e.stack);
}
