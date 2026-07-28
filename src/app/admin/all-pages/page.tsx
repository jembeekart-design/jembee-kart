import fs from 'fs';
import path from 'path';
import Link from 'next/link';

// Recursive scanner to find all page.tsx files
function getAllPages(dir: string, baseDir: string = ''): { title: string, link: string }[] {
  let pages: { title: string, link: string }[] = [];
  const items = fs.readdirSync(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const relativePath = path.join(baseDir, item);

    if (fs.statSync(fullPath).isDirectory()) {
      // Ignore excluded folders
      if (['api', '_components', 'components', 'node_modules', '.next'].includes(item)) continue;
      pages = pages.concat(getAllPages(fullPath, relativePath));
    } else if (item === 'page.tsx') {
      // Convert path to route
      let route = '/' + relativePath.replace(/\\/g, '/').replace('/page.tsx', '');
      if (route === '/page.tsx') route = '/';
      
      // Title from folder name
      const title = item === 'page.tsx' && baseDir === '' ? 'Home' : path.basename(path.dirname(fullPath))
        .split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

      pages.push({ title, link: route });
    }
  }
  return pages;
}

export default async function AllPagesPage() {
  const appPath = path.join(process.cwd(), 'src/app');
  const pages = getAllPages(appPath);

  return (
    <main className="min-h-screen bg-[var(--card-color)] p-6">
      <h1 className="text-3xl font-black mb-6">Total Pages: {pages.length}</h1>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {pages.map((page, index) => (
          <div key={page.link} className="border border-[var(--border-color)] rounded-xl p-4">
            <p className="text-xs text-[var(--muted-text-color)]">#{String(index + 1).padStart(3, '0')}</p>
            <h2 className="font-bold">{page.title}</h2>
            <p className="text-sm font-mono text-[var(--primary-color)]">{page.link}</p>
            <Link href={page.link} className="mt-2 block text-sm font-bold underline">Open →</Link>
          </div>
        ))}
      </div>
    </main>
  );
}
