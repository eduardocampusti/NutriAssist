const { exec } = require('child_process');
const fs = require('fs');

exec('npx tsc --noEmit', (error, stdout, stderr) => {
    const output = stdout + stderr;
    fs.writeFileSync('tsc_full_log.txt', output);
    console.log('TSC finished. Log written to tsc_full_log.txt');
    if (error) {
        console.log('TSC failed with code', error.code);
    } else {
        console.log('TSC passed');
    }
});
