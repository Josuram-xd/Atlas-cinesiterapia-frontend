import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { crearMockAtlasApi } from '../../atlas/api/mockAtlasApi';
import { renderWithRouter } from '@/test/renderWithRouter';
import type { AdminApi } from '../api/adminApi';
import { crearMockAdminApi } from '../api/mockAdminApi';
import { FichaFormPage } from '../ficha/FichaFormPage';
import { REGLAS_MEDIA } from './validacion';

const rutas = [
  { path: '/admin', element: <p>Lista de fichas</p> },
  { path: '/admin/fichas/nueva', element: <FichaFormPage /> },
  { path: '/admin/fichas/:id', element: <FichaFormPage /> },
];

function montar(ruta: string, api: AdminApi = crearMockAdminApi()) {
  renderWithRouter(rutas, [ruta], crearMockAtlasApi(), api);
  // applyAccept apagado para poder probar archivos que el selector del navegador filtraría
  return { api, user: userEvent.setup({ applyAccept: false }) };
}

const imagen = (nombre = 'inicio.png', tipo = 'image/png') =>
  new File([new Uint8Array(2048)], nombre, { type: tipo });

describe('PasoMultimedia', () => {
  it('pide guardar el borrador si la ficha es nueva', async () => {
    montar('/admin/fichas/nueva?paso=multimedia');
    expect(
      await screen.findByText(/primero hay que guardar el borrador/),
    ).toBeInTheDocument();
  });

  it('muestra las imágenes de la ficha y el contador', async () => {
    montar('/admin/fichas/1?paso=multimedia');
    expect(await screen.findByText('1 de 8 imágenes')).toBeInTheDocument();
    expect(
      screen.getByAltText('Posición inicial de Flexoextensión pasiva de rodilla'),
    ).toBeInTheDocument();
  });

  it('sube una imagen en tres pasos, muestra el progreso y la agrega a la lista', async () => {
    const { user, api } = montar('/admin/fichas/3?paso=multimedia');
    const solicitar = vi.spyOn(api, 'solicitarSubida');
    const confirmar = vi.spyOn(api, 'confirmarMedia');
    await screen.findByText('0 de 8 imágenes');
    await user.selectOptions(
      screen.getByLabelText('Qué muestra la imagen'),
      'POSICION_FINAL',
    );
    await user.upload(screen.getByLabelText('Archivo de imagen'), imagen('final.png'));
    await user.click(screen.getByRole('button', { name: 'Subir imagen' }));

    expect(
      await screen.findByRole('progressbar', { name: /final\.png/ }),
    ).toBeInTheDocument();
    expect(await screen.findByText('Imagen subida.')).toBeInTheDocument();
    expect(solicitar).toHaveBeenCalledWith(
      3,
      expect.objectContaining({
        tipo: 'IMAGEN',
        rol: 'POSICION_FINAL',
        contentType: 'image/png',
        tamanoBytes: 2048,
      }),
    );
    expect(confirmar).toHaveBeenCalledOnce();
    expect(await screen.findByText('1 de 8 imágenes')).toBeInTheDocument();
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
  });

  it('exige el rol de la imagen y un archivo antes de subir', async () => {
    const { user, api } = montar('/admin/fichas/3?paso=multimedia');
    const solicitar = vi.spyOn(api, 'solicitarSubida');
    await screen.findByText('0 de 8 imágenes');
    await user.click(screen.getByRole('button', { name: 'Subir imagen' }));
    expect(
      await screen.findByText('Elige un archivo antes de subirlo.'),
    ).toBeInTheDocument();
    await user.upload(screen.getByLabelText('Archivo de imagen'), imagen());
    await user.click(screen.getByRole('button', { name: 'Subir imagen' }));
    expect(await screen.findByText('Indica qué muestra la imagen.')).toBeInTheDocument();
    expect(solicitar).not.toHaveBeenCalled();
  });

  it('rechaza un formato no permitido sin llamar al backend', async () => {
    const { user, api } = montar('/admin/fichas/3?paso=multimedia');
    const solicitar = vi.spyOn(api, 'solicitarSubida');
    await screen.findByText('0 de 8 imágenes');
    await user.selectOptions(screen.getByLabelText('Qué muestra la imagen'), 'OTRO');
    await user.upload(
      screen.getByLabelText('Archivo de imagen'),
      imagen('a.gif', 'image/gif'),
    );
    await user.click(screen.getByRole('button', { name: 'Subir imagen' }));
    expect(await screen.findByText(/Formato no permitido/)).toBeInTheDocument();
    expect(solicitar).not.toHaveBeenCalled();
  });

  it('rechaza un archivo que supera el tamaño máximo', async () => {
    const { user, api } = montar('/admin/fichas/3?paso=multimedia');
    const solicitar = vi.spyOn(api, 'solicitarSubida');
    await screen.findByText('0 de 8 imágenes');
    const grande = imagen('grande.png');
    Object.defineProperty(grande, 'size', { value: REGLAS_MEDIA.IMAGEN.maxBytes + 1 });
    await user.selectOptions(screen.getByLabelText('Qué muestra la imagen'), 'OTRO');
    await user.upload(screen.getByLabelText('Archivo de imagen'), grande);
    await user.click(screen.getByRole('button', { name: 'Subir imagen' }));
    expect(await screen.findByText(/el máximo es 5 MB/)).toBeInTheDocument();
    expect(solicitar).not.toHaveBeenCalled();
  });

  it('sube un video y luego ofrece eliminarlo en lugar de subir otro', async () => {
    const { user } = montar('/admin/fichas/3?paso=multimedia');
    await user.upload(
      await screen.findByLabelText('Archivo de video'),
      new File([new Uint8Array(4096)], 'ejercicio.mp4', { type: 'video/mp4' }),
    );
    await user.click(screen.getByRole('button', { name: 'Subir video' }));
    expect(await screen.findByText('Video subido.')).toBeInTheDocument();
    expect(
      await screen.findByRole('button', { name: 'Eliminar video' }),
    ).toBeInTheDocument();
    expect(screen.queryByLabelText('Archivo de video')).not.toBeInTheDocument();
  });

  it('muestra el error de la subida sin perder la pantalla', async () => {
    const api = crearMockAdminApi();
    api.subirArchivo = () => Promise.reject(new Error('403'));
    const { user } = montar('/admin/fichas/3?paso=multimedia', api);
    await screen.findByText('0 de 8 imágenes');
    await user.selectOptions(screen.getByLabelText('Qué muestra la imagen'), 'OTRO');
    await user.upload(screen.getByLabelText('Archivo de imagen'), imagen());
    await user.click(screen.getByRole('button', { name: 'Subir imagen' }));
    expect(await screen.findByRole('alert')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Subir imagen' })).toBeEnabled();
  });

  it('elimina una imagen solo tras confirmar', async () => {
    const { user, api } = montar('/admin/fichas/3?paso=multimedia');
    const borrar = vi.spyOn(api, 'eliminarMedia');
    await screen.findByText('0 de 8 imágenes');
    await user.selectOptions(screen.getByLabelText('Qué muestra la imagen'), 'OTRO');
    await user.upload(screen.getByLabelText('Archivo de imagen'), imagen());
    await user.click(screen.getByRole('button', { name: 'Subir imagen' }));
    await screen.findByText('1 de 8 imágenes');

    await user.click(screen.getByRole('button', { name: /Eliminar imagen/ }));
    const dialogo = await screen.findByRole('alertdialog');
    expect(borrar).not.toHaveBeenCalled();
    await user.click(within(dialogo).getByRole('button', { name: 'Cancelar' }));
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Eliminar imagen/ }));
    await user.click(
      within(await screen.findByRole('alertdialog')).getByRole('button', {
        name: 'Eliminar archivo',
      }),
    );
    await waitFor(() => expect(borrar).toHaveBeenCalledOnce());
    expect(await screen.findByText('0 de 8 imágenes')).toBeInTheDocument();
  });

  it('no deja quitar el último archivo de una ficha publicada y lo explica', async () => {
    const { user } = montar('/admin/fichas/1?paso=multimedia');
    await user.click(await screen.findByRole('button', { name: /Eliminar imagen/ }));
    await user.click(
      within(await screen.findByRole('alertdialog')).getByRole('button', {
        name: 'Eliminar archivo',
      }),
    );
    expect(
      await screen.findByText(/debe conservar al menos un archivo/),
    ).toBeInTheDocument();
  });

  it('desde una ficha nueva guarda el borrador y sigue en el paso de multimedia', async () => {
    const { user, api } = montar('/admin/fichas/nueva?paso=multimedia');
    await screen.findByText(/primero hay que guardar/);
    await user.click(screen.getByRole('button', { name: 'Información general' }));
    await screen.findAllByRole('option', { name: 'Rodilla' });
    await user.type(screen.getByLabelText('Nombre del ejercicio'), 'Nuevo');
    await user.selectOptions(screen.getByLabelText('Región anatómica'), '11');
    await user.selectOptions(screen.getByLabelText('Categoría terapéutica'), '4');
    await user.click(screen.getByRole('button', { name: 'Multimedia' }));
    const crear = vi.spyOn(api, 'crearFicha');
    await user.click(
      screen.getByRole('button', { name: 'Guardar borrador y continuar' }),
    );
    // la pantalla se vuelve a montar al pasar a la dirección de la ficha: se consulta de nuevo
    await waitFor(() =>
      expect(screen.getByLabelText('Archivo de imagen')).toBeInTheDocument(),
    );
    expect(crear).toHaveBeenCalledOnce();
  });
});
