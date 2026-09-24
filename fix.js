const fs = require('fs');
const files = [
  'src/app/(app)/leads/[id]/page.tsx',
  'src/app/(app)/leads/new/page.tsx',
  'src/app/(app)/follow-ups/page.tsx',
  'src/app/(app)/courses/page.tsx'
];
for(const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/\\\`/g, '\`');
  content = content.replace(/\\\$/g, '$');
  fs.writeFileSync(file, content);
}
console.log("Fixed!");
