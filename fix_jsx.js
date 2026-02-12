
import fs from 'fs';
import path from 'path';

const filepath = path.resolve('components', 'PreparacaoEditor.tsx');
const lines = fs.readFileSync(filepath, 'utf-8').split('\n');

// We suspected line 712 (0-indexed 711) is extra.
// 711: close H
// 712: extra
// 713: close F
// 714: close D
// 715: close I
// 716: close K
// 717: close L

console.log('Line 711: [' + lines[710] + ']');
console.log('Line 712: [' + lines[711] + ']');
console.log('Line 713: [' + lines[712] + ']');

if (lines[711].trim() === '</div>' && lines[712].trim() === '</div>') {
    console.log('Removing extra div at line 712...');
    lines.splice(711, 1);
    fs.writeFileSync(filepath, lines.join('\n'));
    console.log('Success!');
} else {
    console.log('Content does not match expectation. Aborting.');
}
