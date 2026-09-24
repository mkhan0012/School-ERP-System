const fs = require('fs');

const files = [
  'src/app/(app)/leads/[id]/page.tsx',
  'src/app/(app)/leads/[id]/follow-up/page.tsx',
  'src/app/(app)/leads/[id]/reassign/page.tsx',
  'src/app/(app)/leads/[id]/status/page.tsx',
  'src/app/(app)/counsellors/[id]/edit/page.tsx',
  'src/app/(app)/courses/[id]/edit/page.tsx',
  'src/app/(app)/follow-ups/page.tsx',
  'src/app/(app)/leads/page.tsx'
];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  
  // Fix params
  if (content.includes('params }:')) {
    content = content.replace(/params }: { params: { id: string } }/g, 'params }: { params: Promise<{ id: string }> }');
    content = content.replace(/params\.id/g, '(await params).id');
  }

  // Fix searchParams
  if (content.includes('searchParams }:')) {
    content = content.replace(/searchParams }: { searchParams: { [^}]+ } }/g, 'searchParams }: { searchParams: Promise<any> }');
    content = content.replace(/searchParams\.filter/g, '(await searchParams).filter');
    content = content.replace(/searchParams\.q/g, '(await searchParams).q');
  }

  fs.writeFileSync(file, content);
}

console.log("Fixed all params and searchParams");
