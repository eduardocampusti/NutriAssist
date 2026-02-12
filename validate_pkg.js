const fs = require('fs');
try {
    const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    console.log('Valid JSON');
} catch (e) {
    console.error(e.message);
    process.exit(1);
}
