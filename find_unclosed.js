const fs = require('fs');
const content = fs.readFileSync('lib/blog/us-manufacturing.ts', 'utf8');
const lines = content.split('\n');

// Track template literal depth properly
// A backtick on a `content: \`` line opens a template literal
// A backtick at end of a line like "...*\`" closes it
// We need to find which content: ` is missing its closing `

// Find all content: ` openings and their closing backticks
const contentStarts = [];
for (let i = 0; i < lines.length; i++) {
  const line = lines[i].replace(/\r$/, '');
  if (/^\s+content:\s+`/.test(line)) {
    contentStarts.push({ line: i + 1, text: line.substring(0, 60) });
  }
}

console.log('Content template literal openings:');
contentStarts.forEach(s => console.log(`  Line ${s.line}: ${s.text}`));

// Find all closing backtick lines (end of template literal)
// These are lines that end with a backtick (possibly followed by whitespace/CR)
const closings = [];
for (let i = 0; i < lines.length; i++) {
  const line = lines[i].replace(/\r$/, '');
  if (/`\s*$/.test(line) && !/^\s+content:\s+`/.test(line)) {
    closings.push({ line: i + 1, text: line.substring(Math.max(0, line.length - 60)) });
  }
}

console.log('\nTemplate literal closings (lines ending with backtick):');
closings.forEach(c => console.log(`  Line ${c.line}: ...${c.text}`));

console.log('\nOpenings count:', contentStarts.length);
console.log('Closings count:', closings.length);
