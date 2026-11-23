import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { crearMockAtlasApi } from '../../atlas/api/mockAtlasApi';
import { renderWithRouter } from '@/test/renderWithRouter';
import type { AdminApi } from '../api/adminApi';
import { crearMockAdminApi } from '../api/mockAdminApi';
import { ApiError } from '@/lib/api';
import { FichaFormPage } from './FichaFormPage';

const rutas = [
  { path: '/admin', element: <p>Lista de fichas</p> },
  { path: '/admin/fichas/nueva', element: <FichaFormPage /> },
  { path: '/admin/fichas/:id', element: <FichaFormPage /> },
];

function montar(ruta: string, api: AdminApi = crearMockAdminApi()) {
  const utils = renderWithRouter(rutas, [ruta], crearMockAtlasApi(), api);
  return { api, user: userEvent.setup(), ...utils };
}

async function completarGeneral(user: ReturnType<typeof userEvent.setup>) {
  await screen.findAllByRole('option', { name: 'Rodilla' });
  await user.type(screen.getByLabelText('Nombre del ejercicio'), 'Sentadilla asistida');
  await user.selectOptions(screen.getByLabelText('Región anatómica'), '11');
  await user.selectOptions(screen.getByLabelText('Categoría terapéutica'), '4');
}

describe('FichaFormPage: nueva ficha', () => {
  it('muestra los seis pasos y arranca en información general', async () => {
    montar('/admin/fichas/nueva');
    const pasos = screen.getByRole('navigation', { name: 'Pasos de la ficha' });
    expect(
      within(pasos)
        .getAllByRole('button')
        .map((b) => b.textContent),
    ).toEqual([
      'Información general',
      'Protocolo clínico',
      'Ejecución',
      'Dosificación y progresión',
      'Multimedia',
      'Metadatos académicos',
    ]);
    expect(
      within(pasos).getByRole('button', { name: 'Información general' }),
    ).toHaveAttribute('aria-current', 'step');
    expect(
      screen.getByRole('heading', { level: 2, name: 'Información general' }),
    ).toBeInTheDocument();
  });

  it('cambia de paso con la barra y con los botones anterior y siguiente', async () => {
    const { user } = montar('/admin/fichas/nueva');
    await user.click(screen.getByRole('button', { name: 'Paso siguiente' }));
    expect(
      screen.getByRole('heading', { level: 2, name: 'Protocolo clínico' }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Indicaciones')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Dosificación y progresión' }));
    expect(screen.getByLabelText('Series')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Paso anterior' }));
    expect(screen.getByLabelText('Posición del paciente')).toBeInTheDocument();
  });

  it('no guarda sin nombre, región y categoría y lleva al paso del error', async () => {
    const { user, api } = montar('/admin/fichas/nueva');
    const crear = vi.spyOn(api, 'crearFicha');
    await user.click(screen.getByRole('button', { name: 'Metadatos académicos' }));
    await user.click(screen.getByRole('button', { name: 'Guardar borrador' }));
    expect(await screen.findByText('Revisa los campos marcados.')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 2, name: 'Información general' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Escribe el nombre del ejercicio.')).toBeInTheDocument();
    expect(screen.getByText('Elige la región.')).toBeInTheDocument();
    expect(crear).not.toHaveBeenCalled();
  });

  it('guarda el borrador con el cuerpo del contrato y pasa a la dirección de la ficha', async () => {
    const { user, api, router } = montar('/admin/fichas/nueva');
    const crear = vi.spyOn(api, 'crearFicha');
    await completarGeneral(user);
    await user.click(screen.getByRole('button', { name: 'Guardar borrador' }));
    await waitFor(() =>
      expect(router.state.location.pathname).toMatch(/^\/admin\/fichas\/\d+$/),
    );
    expect(crear).toHaveBeenCalledOnce();
    expect(crear.mock.calls[0][0]).toMatchObject({
      nombre: 'Sentadilla asistida',
      regionId: 11,
      categoriaId: 4,
      indicaciones: null,
      estudiantesCreadores: [],
      cohorte: null,
    });
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Sentadilla asistida' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Borrador')).toBeInTheDocument();
  });

  it('avisa antes de salir con cambios sin guardar', async () => {
    const { user, router } = montar('/admin/fichas/nueva');
    await user.type(screen.getByLabelText('Nombre del ejercicio'), 'Algo');
    await user.click(screen.getByRole('link', { name: /Volver a las fichas/ }));
    const dialogo = await screen.findByRole('alertdialog');
    expect(dialogo).toHaveTextContent('cambios sin guardar');
    await user.click(within(dialogo).getByRole('button', { name: 'Seguir editando' }));
    expect(router.state.location.pathname).toBe('/admin/fichas/nueva');
    await user.click(screen.getByRole('link', { name: /Volver a las fichas/ }));
    await user.click(await screen.findByRole('button', { name: 'Salir sin guardar' }));
    expect(await screen.findByText('Lista de fichas')).toBeInTheDocument();
  });

  it('sin cambios no estorba al salir', async () => {
    const { user } = montar('/admin/fichas/nueva');
    await user.click(screen.getByRole('link', { name: /Volver a las fichas/ }));
    expect(await screen.findByText('Lista de fichas')).toBeInTheDocument();
  });

  it('agrega y quita estudiantes creadores', async () => {
    const { user } = montar('/admin/fichas/nueva');
    await user.click(screen.getByRole('button', { name: 'Metadatos académicos' }));
    expect(screen.queryByRole('button', { name: /Quitar/ })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Agregar estudiante' }));
    expect(screen.getByLabelText('Estudiante 2')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Quitar al estudiante 2' }));
    expect(screen.queryByLabelText('Estudiante 2')).not.toBeInTheDocument();
  });

  it('valida el formato de la cohorte antes de enviar', async () => {
    const { user } = montar('/admin/fichas/nueva');
    await completarGeneral(user);
    await user.click(screen.getByRole('button', { name: 'Metadatos académicos' }));
    await user.type(screen.getByLabelText('Cohorte'), 'abc');
    await user.click(screen.getByRole('button', { name: 'Guardar borrador' }));
    expect(await screen.findByText(/año-periodo/)).toBeInTheDocument();
  });

  it('muestra el error del servidor y conserva lo escrito', async () => {
    const api = crearMockAdminApi();
    api.crearFicha = () => Promise.reject(new Error('caído'));
    const { user } = montar('/admin/fichas/nueva', api);
    await completarGeneral(user);
    await user.click(screen.getByRole('button', { name: 'Guardar borrador' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(/No se pudo completar/);
    expect(screen.getByLabelText('Nombre del ejercicio')).toHaveValue(
      'Sentadilla asistida',
    );
  });
});

describe('FichaFormPage: editar', () => {
  it('carga la ficha existente en el formulario', async () => {
    montar('/admin/fichas/3');
    expect(
      await screen.findByRole('heading', {
        level: 1,
        name: 'Elevación activa en el plano escapular',
      }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Nombre del ejercicio')).toHaveValue(
      'Elevación activa en el plano escapular',
    );
    expect(screen.getByLabelText('Región anatómica')).toHaveValue('2');
    expect(screen.getByLabelText('Objetivo terapéutico')).toHaveValue(
      'Recuperar el rango articular.',
    );
  });

  it('guarda los cambios con PUT sobre la misma ficha', async () => {
    const { user, api } = montar('/admin/fichas/3');
    const actualizar = vi.spyOn(api, 'actualizarFicha');
    const nombre = await screen.findByLabelText('Nombre del ejercicio');
    await user.clear(nombre);
    await user.type(nombre, 'Elevación escapular');
    await user.click(screen.getByRole('button', { name: 'Guardar borrador' }));
    expect(await screen.findByText('Borrador guardado.')).toBeInTheDocument();
    expect(actualizar).toHaveBeenCalledWith(
      3,
      expect.objectContaining({ nombre: 'Elevación escapular' }),
    );
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Elevación escapular' }),
    ).toBeInTheDocument();
  });

  it('una ficha inexistente muestra un aviso y no el formulario', async () => {
    montar('/admin/fichas/9999');
    expect(
      await screen.findByRole('heading', { name: 'Esta ficha no existe' }),
    ).toBeInTheDocument();
  });

  it('un identificador que no es número se trata como inexistente', async () => {
    montar('/admin/fichas/abc');
    expect(
      await screen.findByRole('heading', { name: 'Esta ficha no existe' }),
    ).toBeInTheDocument();
  });
});

/** Deja el borrador 3 completo (todos los campos y una imagen) para poder publicarlo. */
async function completar(api: AdminApi) {
  const f = await api.obtenerFicha(3);
  await api.actualizarFicha(3, {
    nombre: f.nombre,
    regionId: f.region.id,
    categoriaId: f.categoria.id,
    objetivoTerapeutico: 'o',
    estructurasIntervenidas: 'e',
    indicaciones: 'i',
    precaucionesContraindicaciones: 'p',
    posicionPaciente: 'pp',
    posicionFisioterapeuta: 'pf',
    ejecucion: 'x',
    comandosVerbales: 'c',
    dosificacion: {
      series: '3',
      repeticiones: '10',
      intensidad: 'l',
      tiempo: '2 s',
      descanso: '60 s',
      frecuencia: 'd',
    },
    progresion: null,
    erroresComunes: null,
    estudiantesCreadores: ['Ana'],
    cohorte: '2025-1',
    profesoraRevisora: 'Dra. R',
  });
  const s = await api.solicitarSubida(3, {
    tipo: 'IMAGEN',
    rol: 'OTRO',
    nombreArchivo: 'a.png',
    contentType: 'image/png',
    tamanoBytes: 10,
  });
  await api.confirmarMedia(3, s.mediaId);
}

describe('FichaFormPage: publicar', () => {
  it('lista por paso lo que falta para publicar', async () => {
    montar('/admin/fichas/3');
    const panel = await screen.findByRole('region', {
      name: /datos obligatorios para publicar/,
    });
    expect(
      within(panel).getByRole('button', { name: 'Protocolo clínico' }),
    ).toBeInTheDocument();
    expect(within(panel).getByText(/Indicaciones/)).toBeInTheDocument();
    expect(within(panel).getByRole('button', { name: 'Multimedia' })).toBeInTheDocument();
  });

  it('al publicar con campos faltantes muestra los del 422 y lleva al primer paso afectado', async () => {
    const { user, api } = montar('/admin/fichas/3');
    const publicar = vi.spyOn(api, 'publicarFicha');
    await user.click(await screen.findByRole('button', { name: 'Publicar' }));
    expect(
      await screen.findByText('Faltan datos obligatorios para publicar la ficha.'),
    ).toBeInTheDocument();
    expect(publicar).toHaveBeenCalledOnce();
    expect(
      screen.getByRole('heading', { level: 2, name: 'Protocolo clínico' }),
    ).toBeInTheDocument();
    expect(
      within(screen.getByLabelText('Indicaciones').closest('div')!).getByText(
        'Campo obligatorio',
      ),
    ).toBeInTheDocument();
    const panel = screen.getByRole('region', {
      name: /datos obligatorios para publicar/,
    });
    expect(within(panel).getByText(/Repeticiones/)).toBeInTheDocument();
  });

  it('publica una ficha completa y cambia su estado', async () => {
    const api = crearMockAdminApi();
    await completar(api);
    const { user } = montar('/admin/fichas/3', api);
    await user.click(await screen.findByRole('button', { name: 'Publicar' }));
    expect(await screen.findByText(/Ficha publicada/)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Publicar' })).not.toBeInTheDocument();
    expect(
      screen.queryByRole('region', { name: /datos obligatorios/ }),
    ).not.toBeInTheDocument();
    expect(screen.getByText('Publicada')).toBeInTheDocument();
  });

  it('guarda los cambios pendientes antes de publicar', async () => {
    const api = crearMockAdminApi();
    await completar(api);
    const { user } = montar('/admin/fichas/3', api);
    const orden: string[] = [];
    const guardar = api.actualizarFicha.bind(api);
    const publicar = api.publicarFicha.bind(api);
    api.actualizarFicha = (...a) => (orden.push('guardar'), guardar(...a));
    api.publicarFicha = (...a) => (orden.push('publicar'), publicar(...a));
    await user.type(await screen.findByLabelText('Estructuras intervenidas'), ' y más');
    await user.click(screen.getByRole('button', { name: 'Publicar' }));
    await screen.findByText(/Ficha publicada/);
    expect(orden).toEqual(['guardar', 'publicar']);
  });

  it('un nuevo borrador no se puede publicar hasta guardarlo', async () => {
    montar('/admin/fichas/nueva');
    expect(screen.queryByRole('button', { name: 'Publicar' })).not.toBeInTheDocument();
  });

  it('muestra el error si el servidor rechaza la publicación por estado', async () => {
    const api = crearMockAdminApi();
    await completar(api);
    api.publicarFicha = () =>
      Promise.reject(new ApiError(409, { code: 'ESTADO_INVALIDO', message: 'x' }));
    const { user } = montar('/admin/fichas/3', api);
    await user.click(await screen.findByRole('button', { name: 'Publicar' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(/cambió de estado/);
  });
});

describe('FichaFormPage: editar una ficha publicada', () => {
  it('avisa que está publicada y ofrece guardar cambios, sin botón de publicar', async () => {
    montar('/admin/fichas/1');
    expect(await screen.findByText(/Esta ficha está publicada/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Guardar cambios' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Publicar' })).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Guardar borrador' }),
    ).not.toBeInTheDocument();
    expect(screen.getByText('Publicada')).toBeInTheDocument();
  });

  it('guarda los cambios con PUT y confirma', async () => {
    const { user, api } = montar('/admin/fichas/1');
    const actualizar = vi.spyOn(api, 'actualizarFicha');
    const nombre = await screen.findByLabelText('Nombre del ejercicio');
    await user.clear(nombre);
    await user.type(nombre, 'Flexoextensión de rodilla');
    await user.click(screen.getByRole('button', { name: 'Guardar cambios' }));
    expect(await screen.findByText('Cambios guardados.')).toBeInTheDocument();
    expect(actualizar).toHaveBeenCalledWith(
      1,
      expect.objectContaining({ nombre: 'Flexoextensión de rodilla' }),
    );
    expect(
      screen.getByRole('heading', { level: 1, name: 'Flexoextensión de rodilla' }),
    ).toBeInTheDocument();
  });

  it('si el cambio deja la ficha incompleta, el servidor no guarda y se muestra qué falta', async () => {
    const { user, api } = montar('/admin/fichas/1');
    const objetivo = await screen.findByLabelText('Objetivo terapéutico');
    await user.clear(objetivo);
    await user.click(screen.getByRole('button', { name: 'Guardar cambios' }));
    expect(
      await screen.findByText('Faltan datos obligatorios para publicar la ficha.'),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('region', { name: /para guardar los cambios/ }),
    ).toHaveTextContent('Objetivo terapéutico');
    const guardada = await api.obtenerFicha(1);
    expect(guardada.objetivoTerapeutico).toBe('Recuperar el rango articular.');
    // sigue habiendo cambios sin guardar: salir pide confirmación
    await user.click(screen.getByRole('link', { name: /Volver a las fichas/ }));
    expect(await screen.findByRole('alertdialog')).toBeInTheDocument();
  });

  it('una ficha archivada se puede editar y explica cómo volver a verla', async () => {
    montar('/admin/fichas/4');
    expect(await screen.findByText(/está archivada/)).toBeInTheDocument();
    expect(screen.getByText('Archivada')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Guardar cambios' })).toBeInTheDocument();
  });
});

describe('FichaFormPage: archivar, restaurar y eliminar', () => {
  it('archiva desde el formulario y luego ofrece restaurar', async () => {
    const { user } = montar('/admin/fichas/1');
    await user.click(await screen.findByRole('button', { name: 'Archivar' }));
    await user.click(
      within(await screen.findByRole('alertdialog')).getByRole('button', {
        name: 'Archivar ficha',
      }),
    );
    expect(await screen.findByText('Ficha archivada.')).toBeInTheDocument();
    expect(screen.getByText('Archivada')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Restaurar' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Archivar' })).not.toBeInTheDocument();
  });

  it('elimina y vuelve a la lista sin pedir confirmar cambios sin guardar', async () => {
    const { user, api } = montar('/admin/fichas/3');
    const eliminar = vi.spyOn(api, 'eliminarFicha');
    await user.type(await screen.findByLabelText('Nombre del ejercicio'), ' editado');
    await user.click(screen.getByRole('button', { name: 'Eliminar' }));
    await user.click(
      within(await screen.findByRole('alertdialog')).getByRole('button', {
        name: 'Eliminar ficha',
      }),
    );
    expect(await screen.findByText('Lista de fichas')).toBeInTheDocument();
    expect(eliminar).toHaveBeenCalledWith(3);
  });

  it('una ficha nueva todavía no ofrece acciones de estado', async () => {
    montar('/admin/fichas/nueva');
    expect(screen.queryByRole('button', { name: 'Eliminar' })).not.toBeInTheDocument();
  });
});
