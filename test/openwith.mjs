// Launches the app the way "Open with Filesmith" does (file path as an argument) and checks it lands in the right tool.
import { _electron as electron } from 'playwright';
import path from 'path';
const exe = process.env.FILESMITH_EXE;
const file = path.resolve('test/media/a.pdf');
const app = await electron.launch(exe ? { executablePath: exe, args: ['--user-data-dir=/tmp/fs-openwith', file] } : { args: [path.resolve('.'), '--user-data-dir=/tmp/fs-openwith', file] });
const page = await app.firstWindow();
await page.waitForSelector('.cmd, .page');
await page.waitForTimeout(2500);
const r = await page.evaluate(() => ({ view: window.__filesmithTest.S.view, rows: document.querySelectorAll('#pdf-left .qitem').length }));
console.log('open-with result:', JSON.stringify(r), r.view === 'pdf' && r.rows === 1 ? 'PASS' : 'FAIL');
await app.close();
