import fs from 'fs';
import path from 'path';

function getPages(dir: string, baseDir: string = ''): string[] {
  let pages: string[] = [];
  const items = fs.readdirSync(dir);
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const relativePath = path.join(baseDir, item);
    if (fs.statSync(fullPath).isDirectory()) {
      if (['api', '_components', 'components', 'node_modules', '.next'].includes(item)) continue;
      pages = pages.concat(getPages(fullPath, relativePath));
    } else if (item === 'page.tsx') {
      pages.push(relativePath);
    }
  }
  return pages;
}

const pages = getPages(path.join(process.cwd(), 'src/app'));
const report = pages.map(page => ({
  route: page.replace(/\\/g, '/').replace('/page.tsx', ''),
  file: `src/app/${page}`,
  status: "Needs Major Improvements",
  score: 40,
  critique: "Awaiting manual audit per page."
}));

fs.writeFileSync('production-readiness.json', JSON.stringify(report, null, 2));
console.log('Report template generated.');
