const fs = require('fs');
const content = fs.readFileSync('lib/blog/us-manufacturing.ts', 'utf8');
const lines = content.split('\n');
const line = lines[949]; // 0-indexed = line 950

console.log('Line 950 length:', line.length);
console.log('First 20 chars as codepoints:');
for (let i = 0; i < Math.min(20, line.length); i++) {
  const code = line.charCodeAt(i);
  console.log(`  [${i}] U+${code.toString(16).toUpperCase().padStart(4,'0')} = ${JSON.stringify(line[i])}`);
}

// Check col 15 specifically (0-indexed = 14)
console.log('\nAround col 15 (the backtick area):');
for (let i = 12; i < 20; i++) {
  const code = line.charCodeAt(i);
  console.log(`  col ${i+1}: U+${code.toString(16).toUpperCase().padStart(4,'0')} = ${JSON.stringify(line[i])}`);
}

// Check for BOM
const raw = fs.readFileSync('lib/blog/us-manufacturing.ts');
console.log('\nFirst 3 bytes (BOM check):', raw[0].toString(16), raw[1].toString(16), raw[2].toString(16));
