import { spawn } from 'node:child_process';
import { createReadStream, copyFileSync, existsSync, mkdirSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, resolve } from 'node:path';
import { findNote, listNotes } from '../src/lib/content-ir/notes';

function arg(flag: string): string | undefined {
  const i = process.argv.indexOf(flag);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

const MIME: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.json': 'application/json',
  '.ico': 'image/x-icon',
};

function serve(root: string, port: number): Promise<{ close: () => Promise<void>; url: string }> {
  const server = createServer((req, res) => {
    const url = new URL(req.url ?? '/', `http://127.0.0.1:${port}`);
    let filePath = join(root, decodeURIComponent(url.pathname));
    if (filePath.endsWith('/') || extname(filePath) === '') {
      filePath = join(filePath, 'index.html');
    }
    if (!existsSync(filePath) || statSync(filePath).isDirectory()) {
      res.writeHead(404);
      res.end('not found');
      return;
    }
    res.writeHead(200, { 'Content-Type': MIME[extname(filePath)] ?? 'application/octet-stream' });
    createReadStream(filePath).pipe(res);
  });
  return new Promise((resolveServer) => {
    server.listen(port, '127.0.0.1', () => {
      resolveServer({
        url: `http://127.0.0.1:${port}`,
        close: () =>
          new Promise((res, rej) => server.close((err) => (err ? rej(err) : res()))),
      });
    });
  });
}

async function ensureBuild(dist: string): Promise<void> {
  if (existsSync(join(dist, 'index.html'))) return;
  console.log('dist/ missing — running astro build…');
  await new Promise<void>((resolvePromise, reject) => {
    const child = spawn('npx', ['astro', 'build'], { stdio: 'inherit', shell: false });
    child.on('exit', (code) => (code === 0 ? resolvePromise() : reject(new Error(`astro build exited ${code}`))));
  });
}

const outRoot = arg('--out') ?? 'media';
const spec = arg('--note');
const dist = resolve('dist');
const sources = spec ? [findNote(spec)].filter(Boolean) : listNotes();

if (sources.length === 0) {
  console.error('No notes found.');
  process.exit(1);
}

await ensureBuild(dist);

let playwright: typeof import('playwright');
try {
  playwright = await import('playwright');
} catch {
  console.error('Playwright is not installed. Run: npm install -D playwright && npx playwright install chromium');
  process.exit(1);
}

const server = await serve(dist, 4173);
const browser = await playwright.chromium.launch();
const page = await browser.newPage();

try {
  for (const source of sources) {
    if (!source) continue;
    const dir = join(outRoot, source.collection, source.id);
    mkdirSync(dir, { recursive: true });
    const url = `${server.url}${source.url}?theme=latex`;
    console.log(`pdf ${url}`);
    await page.goto(url, { waitUntil: 'networkidle', timeout: 60_000 });
    await page.emulateMedia({ media: 'print' });
    await page.pdf({
      path: join(dir, 'note.pdf'),
      format: 'A4',
      printBackground: true,
      margin: { top: '16mm', bottom: '16mm', left: '14mm', right: '14mm' },
    });
    console.log(`wrote ${join(dir, 'note.pdf')}`);
    const pub = join('public', 'media', source.collection, source.id);
    mkdirSync(pub, { recursive: true });
    copyFileSync(join(dir, 'note.pdf'), join(pub, 'note.pdf'));
  }
} finally {
  await browser.close();
  await server.close();
}
