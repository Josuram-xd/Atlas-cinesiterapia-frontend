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
  await page.getByRole('button', { name: 'Rodilla', exact: true }).first().click();
  await page.getByRole('button', { name: 'Movilización pasiva' }).click();
  await page.getByRole('link', { name: /Flexoextensión pasiva de rodilla/ }).click();
  await expect(
    page.getByRole('heading', { level: 1, name: 'Flexoextensión pasiva de rodilla' }),
  ).toBeVisible();
}
