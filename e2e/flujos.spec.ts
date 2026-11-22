import { expect, test } from '@playwright/test';
import { abrirFichaDeRodilla, iniciarSesion, PASSWORD } from './ayudas';

// Proyecto `mock`: el atlas y el panel usan datos en memoria; la sesión pasa por la API falsa.

test('inicia sesión y rechaza una contraseña incorrecta', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Correo').fill('ana@atlas.test');
  await page.getByLabel('Contraseña').fill('mal-1234');
  await page.getByRole('button', { name: 'Entrar' }).click();
  await expect(page.getByRole('alert')).toHaveText('Correo o contraseña incorrectos.');

  await page.getByLabel('Contraseña').fill(PASSWORD);
  await page.getByRole('button', { name: 'Entrar' }).click();
  await expect(
    page.getByRole('heading', { name: 'Elige una región del cuerpo' }),
  ).toBeVisible();
});

test('explora el cuerpo por región hasta ver los ejercicios de una categoría', async ({
  page,
}) => {
  await iniciarSesion(page);
  // Por teclado: el centro de la caja de un path del SVG suele caer fuera de la forma.
  await page.getByRole('button', { name: 'Rodilla', exact: true }).first().focus();
  await page.keyboard.press('Enter');
  await page.getByRole('button', { name: 'Movilización pasiva' }).click();
  await expect(
    page.getByRole('link', { name: /Flexoextensión pasiva de rodilla/ }),
  ).toBeVisible();
});

test('abre la ficha de un ejercicio con su título y sus secciones', async ({ page }) => {
  await iniciarSesion(page);
  await abrirFichaDeRodilla(page);
  await expect(
    page.getByRole('heading', { name: 'Ejecución', exact: true }),
  ).toBeVisible();
});

test('un administrador completa un borrador y lo publica', async ({ page }) => {
  await iniciarSesion(page, 'admin@atlas.test');
  await page.goto('/admin/fichas/3'); // borrador de ejemplo con datos pendientes
  const pasos = page.getByRole('navigation', { name: 'Pasos de la ficha' });

  await pasos.getByRole('button', { name: /Protocolo clínico/ }).click();
  await page.getByLabel('Indicaciones', { exact: true }).fill('Rigidez posterior.');

  await pasos.getByRole('button', { name: /Dosificación y progresión/ }).click();
  const dosis: Array<[string, string]> = [
    ['Repeticiones', '10'],
    ['Intensidad', 'Leve'],
    ['Tiempo', '2 s'],
    ['Descanso', '60 s'],
    ['Frecuencia', 'Diaria'],
  ];
  for (const [etiqueta, valor] of dosis) {
    await page.getByLabel(etiqueta, { exact: true }).fill(valor);
  }

  await pasos.getByRole('button', { name: /Multimedia/ }).click();
  await page.getByLabel('Qué muestra la imagen').selectOption('POSICION_INICIAL');
  await page.locator('#archivo-imagen').setInputFiles({
    name: 'posicion.png',
    mimeType: 'image/png',
    buffer: Buffer.from('iVBORw0KGgo=', 'base64'),
  });
  await page.getByRole('button', { name: 'Subir imagen' }).click();
  await expect(page.getByText(/1 de \d+ imágenes/)).toBeVisible();

  await page.getByRole('button', { name: 'Publicar', exact: true }).click();
  await expect(
    page.getByText('Ficha publicada. Ya la ven todas las personas usuarias.'),
  ).toBeVisible();
});

test('comenta una ficha y el comentario aparece en la lista', async ({ page }) => {
  await iniciarSesion(page);
  await abrirFichaDeRodilla(page);
  const texto = `Buena guía para el control del rango ${Date.now()}`;
  await page.getByLabel('Escribe un comentario').fill(texto);
  await page.getByRole('button', { name: 'Publicar comentario' }).click();
  await expect(
    page.getByRole('region', { name: 'Comentarios' }).getByText(texto),
  ).toBeVisible();
});
