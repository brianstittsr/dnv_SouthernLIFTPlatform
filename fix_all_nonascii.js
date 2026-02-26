const fs = require('fs');
const filePath = 'lib/blog/us-manufacturing.ts';

// Read as buffer
let buf = fs.readFileSync(filePath);
let content = buf.toString('utf8');

const before = content;

// Replace all non-ASCII characters:
// é (U+00E9) -> e  (in protégé -> protege, résumé -> resume, etc.)
// Any remaining smart quotes
content = content
  .replace(/\u00e9/g, 'e')  // é -> e
  .replace(/\u00e8/g, 'e')  // è -> e
  .replace(/\u00ea/g, 'e')  // ê -> e
  .replace(/\u00eb/g, 'e')  // ë -> e
  .replace(/\u2018/g, "'")  // left single quote
  .replace(/\u2019/g, "'")  // right single quote
  .replace(/\u201c/g, '"')  // left double quote
  .replace(/\u201d/g, '"')  // right double quote
  .replace(/\u2014/g, '--') // em dash
  .replace(/\u2013/g, '-')  // en dash
  .replace(/\u00e0/g, 'a')  // à -> a
  .replace(/\u00e1/g, 'a')  // á -> a
  .replace(/\u00e2/g, 'a')  // â -> a
  .replace(/\u00e4/g, 'a')  // ä -> a
  .replace(/[\u0080-\uffff]/g, (ch) => {
    // Catch-all: replace any remaining non-ASCII with ?
    console.warn('Unexpected char U+' + ch.codePointAt(0).toString(16).toUpperCase() + ' = ' + ch);
    return '?';
  });

if (content !== before) {
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('File updated successfully.');
} else {
  console.log('No changes needed.');
}

// Verify
const verify = fs.readFileSync(filePath, 'utf8');
let remaining = 0;
for (let i = 0; i < verify.length; i++) {
  if (verify.charCodeAt(i) > 127) remaining++;
}
console.log('Remaining non-ASCII chars:', remaining);
