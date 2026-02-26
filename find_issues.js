const fs = require('fs');
const content = fs.readFileSync('lib/blog/us-manufacturing.ts', 'utf8');
const lines = content.split('\n');

// Scan lines 950-1201 for anything suspicious
for (let i = 949; i <= 1200; i++) {
  const l = lines[i] || '';
  // Check for non-ASCII chars
  for (let j = 0; j < l.length; j++) {
    const code = l.charCodeAt(j);
    if (code > 127) {
      console.log('Non-ASCII at line ' + (i+1) + ' col ' + j + ': U+' + code.toString(16).toUpperCase() + ' = ' + l[j]);
    }
  }
  // Check for template expression openers
  if (l.includes('${')) {
    console.log('Template expr at line ' + (i+1) + ':', JSON.stringify(l.substring(0, 120)));
  }
}
console.log('Scan complete.');
