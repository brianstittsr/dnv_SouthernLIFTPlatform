const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'lib', 'blog', 'us-manufacturing.ts');
const buf = fs.readFileSync(filePath);

// Replace Unicode smart quotes and em-dashes at byte level
// U+2018 LEFT SINGLE QUOTATION MARK  -> '
// U+2019 RIGHT SINGLE QUOTATION MARK -> '
// U+2014 EM DASH                     -> --
let content = buf.toString('utf8');
const before = content.length;

content = content
  .replace(/\u2018/g, "'")
  .replace(/\u2019/g, "'")
  .replace(/\u2014/g, '--');

const after = content.length;
fs.writeFileSync(filePath, content, 'utf8');
console.log(`Done. Characters changed: ${before - after} bytes reduced (replacements made).`);

// Verify no smart quotes remain
const remaining = (content.match(/[\u2018\u2019\u2014]/g) || []).length;
console.log(`Remaining smart quotes/em-dashes: ${remaining}`);
