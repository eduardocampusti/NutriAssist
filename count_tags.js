
const fs = require('fs');
const content = fs.readFileSync('components/PreparacaoEditor.tsx', 'utf-8');

let openDivs = 0;
let closeDivs = 0;
let openCard = 0;
let closeCard = 0;
let openButton = 0;
let closeButton = 0;

const lines = content.split('\n');
lines.forEach((line, i) => {
    const divs = (line.match(/<div/g) || []).length;
    const cdivs = (line.match(/<\/div>/g) || []).length;
    openDivs += divs;
    closeDivs += cdivs;

    // Check for other common tags
    openCard += (line.match(/<Card/g) || []).length;
    closeCard += (line.match(/<\/Card>/g) || []).length;

    // Check for adjacent elements after return
    if (line.includes('return (') || line.includes('return (')) {
        console.log(`Return starts at line ${i + 1}`);
    }
});

console.log(`Total <div>: ${openDivs}`);
console.log(`Total </div>: ${closeDivs}`);
console.log(`Diff: ${openDivs - closeDivs}`);
console.log(`Total <Card>: ${openCard}`);
console.log(`Total </Card>: ${closeCard}`);
console.log(`Diff: ${openCard - closeCard}`);
