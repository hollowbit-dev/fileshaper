import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import fs from 'fs';
const lorem = 'This agreement is made between the landlord and the tenant for the rental of the property described below. The tenant agrees to pay the monthly rent on the first day of each month and to keep the property clean and in good condition. Both parties agree to the terms set out in this document.';
async function make(name, title, pages) {
  const d = await PDFDocument.create();
  const bold = await d.embedFont(StandardFonts.HelveticaBold); const reg = await d.embedFont(StandardFonts.Helvetica);
  for (let i = 1; i <= pages; i++) {
    const p = d.addPage([595, 842]);
    p.drawRectangle({ x: 0, y: 792, width: 595, height: 50, color: rgb(0.13, 0.15, 0.22) });
    p.drawText(title.toUpperCase(), { x: 50, y: 810, size: 13, font: bold, color: rgb(1, 1, 1) });
    p.drawText(i === 1 ? title : `Section ${i}`, { x: 50, y: 735, size: 24, font: bold, color: rgb(0.1, 0.1, 0.15) });
    let y = 700;
    for (let k = 0; k < 6; k++) {
      const words = lorem.split(' '); let line = '';
      for (const w of words) { if (reg.widthOfTextAtSize(line + w, 11) > 495) { p.drawText(line, { x: 50, y, size: 11, font: reg, color: rgb(.25,.25,.3) }); y -= 16; line = ''; } line += w + ' '; }
      p.drawText(line, { x: 50, y, size: 11, font: reg, color: rgb(.25,.25,.3) }); y -= 30;
    }
    if (i === 1) {
      p.drawText('Tenant signature', { x: 50, y: 150, size: 10, font: reg, color: rgb(.4,.4,.45) });
      p.drawLine({ start: { x: 50, y: 170 }, end: { x: 270, y: 170 }, thickness: 1, color: rgb(.3,.3,.35) });
      p.drawText('Date', { x: 330, y: 150, size: 10, font: reg, color: rgb(.4,.4,.45) });
      p.drawLine({ start: { x: 330, y: 170 }, end: { x: 545, y: 170 }, thickness: 1, color: rgb(.3,.3,.35) });
    }
    p.drawText(`${i} / ${pages}`, { x: 280, y: 30, size: 9, font: reg, color: rgb(.5,.5,.55) });
  }
  fs.writeFileSync(`demo/${name}`, await d.save());
}
await make('Rental agreement.pdf', 'Rental Agreement', 4);
await make('Chemistry notes.pdf', 'Chemistry Notes', 6);
