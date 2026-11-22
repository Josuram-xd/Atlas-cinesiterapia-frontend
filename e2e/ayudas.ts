import { expect, type Page } from '@playwright/test';

export const API = 'http://localhost:4010';
export const PASSWORD = 'Atlas-1234';

export async function iniciarSesion(page: Page, correo = 'ana@atlas.test') {
  await page.goto('/login');
  await page.getByLabel('Correo').fill(correo);
  await page.getByLabel('Contraseña').fill(PASSWORD);
  await page.getByRole('button', { name: 'Entrar' }).click();
  await expect(
    page.getByRole('heading', { name: 'Elige una región del cuerpo' }),
  ).toBeVisible();
}

/** Región → categoría → primer ejercicio, hasta ver su ficha. */
export async function abrirFichaDeRodilla(page: Page) {
  // Por teclado: el centro de la caja de un path del SVG suele caer fuera de la forma.
  await page.getByRole('button', { name: 'Rodilla', exact: true }).first().focus();
  await page.keyboard.press('Enter');
  await page.getByRole('button', { name: 'Movilización pasiva' }).click();
  await page.getByRole('link', { name: /Flexoextensión pasiva de rodilla/ }).click();
  await expect(
    page.getByRole('heading', { level: 1, name: 'Flexoextensión pasiva de rodilla' }),
  ).toBeVisible();
}

/** URLs que el service worker guardó como datos (sin el precache de la aplicación). */
export function datosGuardados(page: Page): Promise<string[]> {
  return page.evaluate(async () => {
    const urls: string[] = [];
    for (const nombre of await caches.keys()) {
      if (nombre.startsWith('workbox-precache')) continue;
      for (const r of await (await caches.open(nombre)).keys()) urls.push(r.url);
    }
    return urls;
  });
}

/** Espera a que la ficha abierta quede guardada: el SW la escribe después de responder. */
export async function esperarFichaGuardada(page: Page) {
  await expect
    .poll(() => datosGuardados(page))
    .toContainEqual(expect.stringMatching(/\/ejercicios\/\d+$/));
}
