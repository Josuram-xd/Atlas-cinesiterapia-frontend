import { defineConfig, devices } from '@playwright/test';

/**
 * E2E contra una compilación de producción (el service worker solo existe ahí) y una API
 * falsa que reutiliza los datos del mock. Dos compilaciones:
 *  - `mock` (VITE_ATLAS_API=mock, puerto 4173): flujos del atlas con los datos de ejemplo.
 *  - `http` (VITE_ATLAS_API=http, puerto 4174): el atlas pide datos a la API falsa, así el
 *    service worker puede guardarlos y atenderlos sin conexión.
 * Navegador: Edge o Chrome instalados (`E2E_CANAL`), o el Chromium de Playwright con
 * `E2E_CANAL=chromium` (`npx playwright install chromium`).
 */
const canal = process.env.E2E_CANAL ?? (process.env.CI ? 'chromium' : 'msedge');
const API = 'http://localhost:4010';
const construir = (modo: 'mock' | 'http', puerto: number) => ({
  command: `npx vite build --outDir dist-e2e/${modo} && npx vite preview --outDir dist-e2e/${modo} --port ${puerto} --strictPort`,
  url: `http://localhost:${puerto}`,
  env: { VITE_ATLAS_API: modo, VITE_API_URL: API },
  reuseExistingServer: !process.env.CI,
  timeout: 180_000,
});

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    channel: canal === 'chromium' ? undefined : canal,
  },
  projects: [
    {
      name: 'mock',
      testMatch: /flujos\.spec\.ts/,
      use: { ...devices['Desktop Chrome'], baseURL: 'http://localhost:4173' },
    },
    {
      name: 'http',
      testMatch: /sin-conexion\.spec\.ts/,
      use: { ...devices['Desktop Chrome'], baseURL: 'http://localhost:4174' },
    },
  ],
  webServer: [
    {
      command: 'node e2e/api-falsa.mjs',
      url: `${API}/__peticiones`,
      reuseExistingServer: !process.env.CI,
    },
    construir('mock', 4173),
    construir('http', 4174),
  ],
});
