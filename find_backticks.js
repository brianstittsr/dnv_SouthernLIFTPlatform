const fs = require('fs');
const content = fs.readFileSync('lib/blog/us-manufacturing.ts', 'utf8');
const lines = content.split('\n');

// Find all backtick occurrences in the reshoring post range
let inPost = false;
for (let i = 940; i <= 1210; i++) {
  const l = lines[i] || '';
  if (l.includes('reshoring-success-capturing')) inPost = true;
  if (inPost) {
    const backtickCount = (l.match(/`/g) || []).length;
    if (backtickCount > 0) {
      console.log((i + 1) + ' (' + backtickCount + ' backticks):', JSON.stringify(l.substring(0, 120)));
    }
  }
  if (inPost && i > 1205) break;
}
