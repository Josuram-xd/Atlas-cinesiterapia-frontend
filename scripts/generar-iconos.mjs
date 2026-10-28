// Genera los PNG del manifest PWA a partir de public/favicon.svg.
// Uso: node scripts/generar-iconos.mjs   (requiere Edge o Chrome instalados)
import { readFile, writeFile } from 'node:fs/promises';
import { chromium } from '@playwright/test';

const svg = await readFile(new URL('../public/favicon.svg', import.meta.url), 'utf8');
const lanzar = async () => {
  for (const channel of ['msedge', 'chrome', undefined]) {
    try {
      return await chromium.launch({ channel });
    } catch {
      /* prueba el siguiente */
    }
  }
  throw new Error('No hay Chrome, Edge ni Chromium disponibles');
};
const navegador = await lanzar();
const tamanos = { 'icon-192.png': 192, 'icon-512.png': 512, 'apple-touch-icon.png': 180 };
for (const [archivo, lado] of Object.entries(tamanos)) {
  const page = await navegador.newPage({ viewport: { width: lado, height: lado } });
  await page.setContent(
    `<style>html,body{margin:0}svg{display:block;width:${lado}px;height:${lado}px}</style>${svg}`,
  );
  await writeFile(
    new URL(`../public/${archivo}`, import.meta.url),
    await page.screenshot(),
  );
  await page.close();
}
await navegador.close();
