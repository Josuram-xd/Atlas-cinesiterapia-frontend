import { expect, test } from '@playwright/test';
import { abrirFichaDeRodilla, iniciarSesion } from './ayudas';

test.describe('PWA: service worker y caché de datos', () => {
  test('tras visitar el atlas, regiones y ficha siguen disponibles sin conexión', async ({
    page,
    context,
  }) => {
    await iniciarSesion(page);
    await page.evaluate(() => navigator.serviceWorker.ready);
    await page.reload(); // la pestaña ya está controlada por el service worker
    await expect(page.getByRole('button', { name: 'Rodilla' }).first()).toBeVisible();
    await abrirFichaDeRodilla(page);
    // Deja que la revalidación en segundo plano termine de guardar.
    await page.waitForLoadState('networkidle');

    await context.setOffline(true);
    await page.reload();
    await expect(page.getByRole('button', { name: 'Rodilla' }).first()).toBeVisible();
    await page.goto('/');
    await abrirFichaDeRodilla(page);
  });

  test('no guarda autenticación ni administración; cerrar sesión limpia los datos', async ({
    page,
  }) => {
    await iniciarSesion(page);
    await page.evaluate(() => navigator.serviceWorker.ready);
    await page.reload();
    await abrirFichaDeRodilla(page);
    await page.waitForLoadState('networkidle');

    const rutas = () =>
      page.evaluate(async () => {
        const nombres = await caches.keys();
        const urls: string[] = [];
        for (const n of nombres) {
          if (n.startsWith('workbox-precache')) continue;
          for (const r of await (await caches.open(n)).keys()) urls.push(r.url);
        }
        return urls;
      });
    const guardadas = await rutas();
    expect(guardadas.length).toBeGreaterThan(0);
    expect(guardadas.every((u) => /\/(regiones|ejercicios)(\/|\?|$)/.test(u))).toBe(true);
    expect(guardadas.some((u) => /\/(auth|admin)\//.test(u))).toBe(false);

    await page.getByRole('button', { name: 'Cerrar sesión' }).click();
    await expect(page).toHaveURL(/\/login/);
    await expect.poll(rutas).toEqual([]);
  });
});
