const fs = require('fs');
const content = fs.readFileSync('lib/blog/us-manufacturing.ts', 'utf8');
const lines = content.split('\n');

let backtickCount = 0;
const opens = [];

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  for (let j = 0; j < line.length; j++) {
    if (line[j] === '`') {
      backtickCount++;
      if (backtickCount % 2 === 1) {
        // Opening backtick
        opens.push({ line: i + 1, col: j + 1, text: line.substring(0, 40) });
      } else {
        // Closing backtick - pair found
        opens.pop();
      }
    }
  }
}

console.log('Total backticks:', backtickCount);
console.log('Unpaired (should be 0):', opens.length);
if (opens.length > 0) {
  console.log('Unclosed backticks at:');
  opens.forEach(o => console.log(`  Line ${o.line} col ${o.col}: ${o.text}`));
}

// Also show all backtick lines for context
console.log('\nAll backtick occurrences:');
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  const count = (line.match(/`/g) || []).length;
  if (count > 0) {
    console.log(`  Line ${i+1} (${count} backtick(s)): ${JSON.stringify(line.substring(0, 80))}`);
  }
}
