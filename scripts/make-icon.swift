// Draws Fileshaper's app icon (1024x1024 PNG): ember gradient, white anvil and spark.
import AppKit
let size: CGFloat = 1024
let img = NSImage(size: NSSize(width: size, height: size))
img.lockFocus()
let ctx = NSGraphicsContext.current!.cgContext
let inset: CGFloat = 100
let rect = CGRect(x: inset, y: inset, width: size - inset * 2, height: size - inset * 2)
let path = CGPath(roundedRect: rect, cornerWidth: 190, cornerHeight: 190, transform: nil)
ctx.saveGState()
ctx.setShadow(offset: CGSize(width: 0, height: -14), blur: 40, color: NSColor(white: 0, alpha: 0.35).cgColor)
ctx.addPath(path); ctx.setFillColor(NSColor.black.cgColor); ctx.fillPath()
ctx.restoreGState()
ctx.saveGState()
ctx.addPath(path); ctx.clip()
let cs = CGColorSpaceCreateDeviceRGB()
let g = CGGradient(colorsSpace: cs, colors: [
  NSColor(red: 1.0, green: 0.78, blue: 0.36, alpha: 1).cgColor,
  NSColor(red: 1.0, green: 0.48, blue: 0.24, alpha: 1).cgColor,
  NSColor(red: 0.86, green: 0.22, blue: 0.20, alpha: 1).cgColor] as CFArray, locations: [0, 0.55, 1])!
ctx.drawLinearGradient(g, start: CGPoint(x: 0, y: size - inset), end: CGPoint(x: 0, y: inset), options: [])
let glow = CGGradient(colorsSpace: cs, colors: [NSColor(white: 1, alpha: 0.35).cgColor, NSColor(white: 1, alpha: 0).cgColor] as CFArray, locations: [0, 1])!
ctx.drawRadialGradient(glow, startCenter: CGPoint(x: size/2, y: size*0.42), startRadius: 0, endCenter: CGPoint(x: size/2, y: size*0.42), endRadius: 330, options: [])
ctx.restoreGState()
// Anvil with a spark: Fileshaper's mark.
ctx.saveGState()
ctx.setShadow(offset: CGSize(width: 0, height: -10), blur: 24, color: NSColor(red: 0.45, green: 0.08, blue: 0.02, alpha: 0.35).cgColor)
ctx.setFillColor(NSColor.white.cgColor)
let a = CGMutablePath()
let dx: CGFloat = 8, dy: CGFloat = -20
func P(_ x: CGFloat, _ y: CGFloat) -> CGPoint { CGPoint(x: x + dx, y: y + dy) }
a.move(to: P(205, 600))
a.addQuadCurve(to: P(360, 655), control: P(262, 655))
a.addLine(to: P(805, 655))
a.addLine(to: P(805, 572))
a.addLine(to: P(705, 562))
a.addQuadCurve(to: P(640, 470), control: P(648, 545))
a.addLine(to: P(640, 445))
a.addQuadCurve(to: P(740, 382), control: P(652, 392))
a.addLine(to: P(740, 330))
a.addLine(to: P(390, 330))
a.addLine(to: P(390, 382))
a.addQuadCurve(to: P(490, 445), control: P(478, 392))
a.addLine(to: P(490, 470))
a.addQuadCurve(to: P(425, 562), control: P(482, 545))
a.addLine(to: P(372, 562))
a.addQuadCurve(to: P(205, 600), control: P(280, 556))
a.closeSubpath()
ctx.addPath(a); ctx.fillPath()
func star(_ c: CGPoint, _ r: CGFloat) {
  let s = CGMutablePath()
  s.move(to: CGPoint(x: c.x, y: c.y + r))
  s.addQuadCurve(to: CGPoint(x: c.x + r, y: c.y), control: CGPoint(x: c.x + r * 0.16, y: c.y + r * 0.16))
  s.addQuadCurve(to: CGPoint(x: c.x, y: c.y - r), control: CGPoint(x: c.x + r * 0.16, y: c.y - r * 0.16))
  s.addQuadCurve(to: CGPoint(x: c.x - r, y: c.y), control: CGPoint(x: c.x - r * 0.16, y: c.y - r * 0.16))
  s.addQuadCurve(to: CGPoint(x: c.x, y: c.y + r), control: CGPoint(x: c.x - r * 0.16, y: c.y + r * 0.16))
  ctx.addPath(s); ctx.fillPath()
}
star(CGPoint(x: 668, y: 768), 78)
star(CGPoint(x: 776, y: 718), 36)
ctx.restoreGState()
img.unlockFocus()
let rep = NSBitmapImageRep(data: img.tiffRepresentation!)!
let out = rep.representation(using: .png, properties: [:])!
try! out.write(to: URL(fileURLWithPath: CommandLine.arguments[1]))
