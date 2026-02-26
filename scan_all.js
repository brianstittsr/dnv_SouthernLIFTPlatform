const fs = require('fs');
const content = fs.readFileSync('lib/blog/us-manufacturing.ts');

console.log('File size:', content.length, 'bytes');

// Scan every byte for non-ASCII
const issues = [];
let lineNum = 1;
let lineStart = 0;

for (let i = 0; i < content.length; i++) {
  if (content[i] === 0x0a) {
    lineNum++;
    lineStart = i + 1;
  }
  const b = content[i];
  if (b > 127) {
    const col = i - lineStart + 1;
    // Get the 3-byte sequence for UTF-8
    const seq = content.slice(i, i+3).toString('hex');
    const char = content.slice(i, i+4).toString('utf8')[0];
    const code = char.codePointAt(0);
    issues.push({ line: lineNum, col, hex: seq, char, code: 'U+' + code.toString(16).toUpperCase() });
  }
}

console.log('Total non-ASCII positions:', issues.length);
issues.forEach(issue => {
  console.log(`  Line ${issue.line} col ${issue.col}: ${issue.code} (${issue.char}) hex=${issue.hex}`);
});
