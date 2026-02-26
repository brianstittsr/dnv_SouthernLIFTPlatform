const fs = require('fs');

const file = 'lib/blog/us-manufacturing.ts';
let content = fs.readFileSync(file, 'utf8');

// Replace smart quotes with ASCII
content = content.replace(/\u2019/g, "'")  // '
           .replace(/\u2018/g, "'")  // '
           .replace(/\u2014/g, '--'); // —

fs.writeFileSync(file, content, 'utf8');
console.log('✓ Fixed Unicode characters');
