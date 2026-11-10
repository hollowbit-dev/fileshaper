import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import fs from 'fs';
for (const [name, n] of [['a.pdf', 3], ['b.pdf', 5]]) {
  const d = await PDFDocument.create(); const f = await d.embedFont(StandardFonts.HelveticaBold);
  for (let i = 1; i <= n; i++) { const p = d.addPage([595, 842]); p.drawText(`${name} page ${i}`, { x: 60, y: 760, size: 32, font: f, color: rgb(.2,.2,.6) }); p.drawText('Sign here: ____________', { x: 60, y: 120, size: 18, font: f }); }
  fs.writeFileSync(new URL(`./media/${name}`, import.meta.url), await d.save());
}
