/**
 * Generates high-quality PNG logo files using Playwright.
 * Run with: node export-logos.mjs
 * Output: public/logo-full.png, public/logo-icon.png, public/logo-dark.png
 */
import { chromium } from "playwright";
import { mkdir } from "fs/promises";
import { existsSync } from "fs";

const OUT = "./public";

const ICON_SVG = `
<svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="100" cy="100" r="100" fill="#7c5cfc"/>
  <!-- decorative glow -->
  <circle cx="100" cy="100" r="80" fill="rgba(255,255,255,0.04)"/>
  <!-- left ring -->
  <circle cx="75" cy="100" r="37.5" stroke="white" stroke-width="12.5" fill="none" opacity="0.95"/>
  <!-- right ring -->
  <circle cx="125" cy="100" r="37.5" stroke="white" stroke-width="12.5" fill="none" opacity="0.95"/>
</svg>`;

const makeFullLogo = (dark) => `
<svg width="600" height="160" viewBox="0 0 600 160" fill="none" xmlns="http://www.w3.org/2000/svg">
  ${dark ? `<rect width="600" height="160" rx="16" fill="#0f0d1a"/>` : ""}
  <!-- Icon circle -->
  <circle cx="80" cy="80" r="80" fill="#7c5cfc"/>
  <circle cx="57" cy="80" r="30" stroke="white" stroke-width="10" fill="none" opacity="0.95"/>
  <circle cx="103" cy="80" r="30" stroke="white" stroke-width="10" fill="none" opacity="0.95"/>
  <!-- Wordmark -->
  <text
    x="185" y="102"
    font-family="'Plus Jakarta Sans', 'Arial Black', sans-serif"
    font-weight="800"
    font-size="72"
    fill="${dark ? "#ffffff" : "#12112a"}"
    letter-spacing="-2"
  >Vybrr</text>
  <!-- Accent dot -->
  <circle cx="574" cy="30" r="9" fill="#7c5cfc"/>
</svg>`;

const makeIconBadge = (size, bg) => `
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" fill="none" xmlns="http://www.w3.org/2000/svg">
  ${bg ? `<rect width="${size}" height="${size}" rx="${size * 0.22}" fill="#7c5cfc"/>` : ""}
  <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="#7c5cfc"/>
  <circle cx="${size * 0.375}" cy="${size / 2}" r="${size * 0.1875}" stroke="white" stroke-width="${size * 0.0625}" fill="none" opacity="0.95"/>
  <circle cx="${size * 0.625}" cy="${size / 2}" r="${size * 0.1875}" stroke="white" stroke-width="${size * 0.0625}" fill="none" opacity="0.95"/>
</svg>`;

async function exportLogos() {
  if (!existsSync(OUT)) await mkdir(OUT, { recursive: true });

  const browser = await chromium.launch();
  const page = await browser.newPage();

  const shots = [
    // [filename, svg, width, height, scale]
    ["logo-full-light.png",  makeFullLogo(false), 600, 160, 2],
    ["logo-full-dark.png",   makeFullLogo(true),  600, 160, 2],
    ["logo-icon-512.png",    ICON_SVG,            200, 200, 2.56],  // → 512px
    ["logo-icon-256.png",    ICON_SVG,            200, 200, 1.28],  // → 256px
    ["logo-icon-128.png",    ICON_SVG,            200, 200, 0.64],  // → 128px
    ["favicon-new.png",      makeIconBadge(200, false), 200, 200, 0.16], // → 32px
  ];

  for (const [filename, svg, w, h, scale] of shots) {
    const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: ${w}px; height: ${h}px; background: transparent; }
  body { display: flex; align-items: center; justify-content: center; }
</style>
</head>
<body>${svg}</body>
</html>`;

    await page.setContent(html, { waitUntil: "networkidle" });
    await page.setViewportSize({ width: w, height: h });

    const outPath = `${OUT}/${filename}`;
    await page.screenshot({
      path: outPath,
      clip: { x: 0, y: 0, width: w, height: h },
      scale: "device",
      omitBackground: true,
    });

    // Re-screenshot at target scale by resizing viewport
    const tw = Math.round(w * scale);
    const th = Math.round(h * scale);
    await page.setViewportSize({ width: tw, height: th });
    const html2 = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: ${tw}px; height: ${th}px; background: transparent; }
  body { display: flex; align-items: center; justify-content: center; }
  svg { width: ${tw}px; height: ${th}px; }
</style>
</head>
<body>${svg}</body>
</html>`;
    await page.setContent(html2, { waitUntil: "networkidle" });
    await page.screenshot({
      path: outPath,
      clip: { x: 0, y: 0, width: tw, height: th },
      omitBackground: true,
    });

    console.log(`✓ ${filename}  (${tw}×${th}px)`);
  }

  await browser.close();
  console.log("\nAll logos saved to ./public/");
}

exportLogos().catch((e) => { console.error(e); process.exit(1); });
