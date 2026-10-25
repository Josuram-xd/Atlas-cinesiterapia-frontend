import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, expect, it, vi } from 'vitest';
import { ApiError } from '@/lib/api';
import type { Comentario } from '@/lib/api';
import type { ComentariosApi } from './api/comentariosApi';
import { ComentariosApiProvider } from './api/ComentariosApiProvider';
import { crearMockComentariosApi } from './api/mockComentariosApi';
import { SeccionComentarios } from './SeccionComentarios';

function montar(api: ComentariosApi = crearMockComentariosApi(), ejercicioId = 1) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <ComentariosApiProvider api={api}>
        <SeccionComentarios ejercicioId={ejercicioId} />
      </ComentariosApiProvider>
    </QueryClientProvider>,
  );
}

function comentario(parcial: Partial<Comentario>): Comentario {
  return {
    id: 1,
    ejercicioId: 1,
    padreId: null,
    autor: { id: 20, nombre: 'otra.persona', rolPerfil: 'VISITANTE' },
    texto: 'Hola',
    estado: 'PUBLICADO',
    enRevision: false,
    eliminado: false,
    propio: false,
    createdAt: '2026-10-20T10:00:00Z',
    editadoAt: null,
    respuestas: [],
    ...parcial,
  };
}

describe('SeccionComentarios: lista e hilos', () => {
  it('muestra los comentarios con sus respuestas bajo la raíz', async () => {
    montar();
    expect(await screen.findByText(/post-operatorio de rodilla/)).toBeInTheDocument();
    const hilo = screen.getByRole('list', { name: 'Respuestas a ana.martinez' });
    expect(within(hilo).getAllByRole('article')).toHaveLength(2);
    expect(within(hilo).getByText(/3 series de 10/)).toBeInTheDocument();
  });

  it('un comentario eliminado con respuestas se muestra como «Comentario eliminado»', async () => {
    montar();
    await screen.findByText(/post-operatorio/);
    const eliminado = screen.getAllByRole('article', { name: 'Comentario eliminado' });
    expect(eliminado).toHaveLength(1);
    expect(screen.queryByText(/su autora borró/)).not.toBeInTheDocument();
    expect(screen.getByText(/Estoy de acuerdo/)).toBeInTheDocument();
  });

  it('muestra el estado vacío cuando no hay comentarios', async () => {
    montar(crearMockComentariosApi(), 999);
    expect(await screen.findByText(/Aún no hay comentarios/)).toBeInTheDocument();
  });

  it('el texto se renderiza como texto, nunca como HTML', async () => {
    const api = crearMockComentariosApi();
    api.listar = async () => ({
      content: [comentario({ texto: '<img src=x onerror=alert(1)> <b>negrita</b>' })],
      page: 0,
      size: 20,
      totalElements: 1,
      totalPages: 1,
    });
    const { container } = montar(api);
    expect(
      await screen.findByText('<img src=x onerror=alert(1)> <b>negrita</b>'),
    ).toBeInTheDocument();
    expect(container.querySelector('img, b')).toBeNull();
  });

  it('pide más páginas con «Ver más comentarios»', async () => {
    const api = crearMockComentariosApi();
    const listar = vi.fn(async (_id: number, pagina: number) => ({
      content: [comentario({ id: pagina + 1, texto: `Texto de la página ${pagina}` })],
      page: pagina,
      size: 20,
      totalElements: 2,
      totalPages: 2,
    }));
    api.listar = listar;
    const user = userEvent.setup();
    montar(api);
    expect(await screen.findByText('Texto de la página 0')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Ver más comentarios' }));
    expect(await screen.findByText('Texto de la página 1')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Ver más comentarios' }),
    ).not.toBeInTheDocument();
  });

  it('muestra el error de carga con la opción de reintentar', async () => {
    const api = crearMockComentariosApi();
    api.listar = () => Promise.reject(new ApiError(500));
    montar(api);
    expect(await screen.findByRole('button', { name: 'Reintentar' })).toBeInTheDocument();
  });
});

describe('SeccionComentarios: escribir y responder', () => {
  it('publica un comentario nuevo y lo muestra en la lista', async () => {
    const user = userEvent.setup();
    montar();
    await screen.findByText(/post-operatorio/);
    await user.type(
      screen.getByLabelText('Escribe un comentario'),
      'Gracias por la ficha',
    );
    await user.click(screen.getByRole('button', { name: 'Publicar comentario' }));
    expect(await screen.findByText('Gracias por la ficha')).toBeInTheDocument();
    expect(screen.getByText('Comentario publicado.')).toBeInTheDocument();
    expect(screen.getByLabelText('Escribe un comentario')).toHaveValue('');
  });

  it('no envía un comentario vacío', async () => {
    const api = crearMockComentariosApi();
    const crear = vi.spyOn(api, 'crear');
    const user = userEvent.setup();
    montar(api);
    await screen.findByText(/post-operatorio/);
    await user.click(screen.getByRole('button', { name: 'Publicar comentario' }));
    expect(screen.getByText('Escribe algo antes de enviar.')).toBeInTheDocument();
    expect(crear).not.toHaveBeenCalled();
  });

  it('avisa si el texto lleva HTML (TEXTO_INVALIDO) y conserva lo escrito', async () => {
    const user = userEvent.setup();
    montar();
    await screen.findByText(/post-operatorio/);
    const campo = screen.getByLabelText('Escribe un comentario');
    await user.type(campo, 'hola <script>x</script>');
    await user.click(screen.getByRole('button', { name: 'Publicar comentario' }));
    expect(await screen.findByText(/no puede llevar etiquetas HTML/)).toBeInTheDocument();
    expect(campo).toHaveValue('hola <script>x</script>');
  });

  it('muestra el límite de intentos (429)', async () => {
    const api = crearMockComentariosApi();
    api.crear = () => Promise.reject(new ApiError(429, { code: 'DEMASIADOS_INTENTOS' }));
    const user = userEvent.setup();
    montar(api);
    await screen.findByText(/post-operatorio/);
    await user.type(screen.getByLabelText('Escribe un comentario'), 'otro más');
    await user.click(screen.getByRole('button', { name: 'Publicar comentario' }));
    expect(await screen.findByText(/demasiado rápido/)).toBeInTheDocument();
  });

  it('responde a un comentario y la respuesta cuelga de la raíz', async () => {
    const user = userEvent.setup();
    montar();
    const raiz = (await screen.findByText(/post-operatorio/)).closest('article')!;
    await user.click(within(raiz).getByRole('button', { name: /Responder/ }));
    await user.type(
      screen.getByLabelText('Tu respuesta a ana.martinez'),
      'Excelente dato',
    );
    await user.click(screen.getByRole('button', { name: 'Publicar respuesta' }));
    const hilo = await screen.findByRole('list', { name: 'Respuestas a ana.martinez' });
    expect(await within(hilo).findByText('Excelente dato')).toBeInTheDocument();
  });

  it('al responder a una respuesta antepone @nombre', async () => {
    const user = userEvent.setup();
    montar();
    const respuesta = (await screen.findByText(/qué dosificación/i)).closest('article')!;
    await user.click(within(respuesta).getByRole('button', { name: /Responder/ }));
    expect(screen.getByLabelText('Tu respuesta a luis.rojas')).toHaveValue(
      '@luis.rojas ',
    );
  });

  it('no ofrece responder a un comentario eliminado', async () => {
    montar();
    await screen.findByText(/post-operatorio/);
    const eliminado = screen.getByRole('article', { name: 'Comentario eliminado' });
    expect(within(eliminado).queryByRole('button')).not.toBeInTheDocument();
  });
});

describe('SeccionComentarios: editar y eliminar el propio', () => {
  async function propio() {
    const texto = await screen.findByText(/Faltaría una foto/);
    return texto.closest('article')!;
  }

  it('solo ofrece Editar y Eliminar en los comentarios propios', async () => {
    montar();
    const mio = await propio();
    expect(within(mio).getByRole('button', { name: /Editar/ })).toBeInTheDocument();
    expect(within(mio).getByRole('button', { name: /Eliminar/ })).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /Editar/ })).toHaveLength(1);
    expect(screen.getAllByRole('button', { name: /Eliminar/ })).toHaveLength(1);
  });

  it('edita el comentario propio y lo marca como editado', async () => {
    const user = userEvent.setup();
    montar();
    const mio = await propio();
    await user.click(within(mio).getByRole('button', { name: /Editar/ }));
    const campo = screen.getByLabelText('Editar tu comentario');
    expect(campo).toHaveValue('Faltaría una foto de la posición del terapeuta.');
    await user.clear(campo);
    await user.type(campo, 'Ahora sí hay foto, gracias');
    await user.click(screen.getByRole('button', { name: 'Guardar cambios' }));
    expect(await screen.findByText('Ahora sí hay foto, gracias')).toBeInTheDocument();
    expect(screen.getByText('Comentario actualizado.')).toBeInTheDocument();
    expect(screen.getByText(/· editado/)).toBeInTheDocument();
  });

  it('cancelar la edición conserva el texto original', async () => {
    const user = userEvent.setup();
    montar();
    const mio = await propio();
    await user.click(within(mio).getByRole('button', { name: /Editar/ }));
    await user.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(screen.getByText(/Faltaría una foto/)).toBeInTheDocument();
    expect(screen.queryByLabelText('Editar tu comentario')).not.toBeInTheDocument();
  });

  it('muestra el error si la edición lleva HTML', async () => {
    const user = userEvent.setup();
    montar();
    const mio = await propio();
    await user.click(within(mio).getByRole('button', { name: /Editar/ }));
    const campo = screen.getByLabelText('Editar tu comentario');
    await user.clear(campo);
    await user.type(campo, '<b>hola</b>');
    await user.click(screen.getByRole('button', { name: 'Guardar cambios' }));
    expect(await screen.findByText(/no puede llevar etiquetas HTML/)).toBeInTheDocument();
  });

  it('pide confirmación antes de eliminar y luego lo quita de la lista', async () => {
    const api = crearMockComentariosApi();
    const eliminar = vi.spyOn(api, 'eliminar');
    const user = userEvent.setup();
    montar(api);
    const mio = await propio();
    await user.click(within(mio).getByRole('button', { name: /Eliminar/ }));
    expect(eliminar).not.toHaveBeenCalled();
    const dialogo = screen.getByRole('alertdialog');
    await user.click(
      within(dialogo).getByRole('button', { name: 'Eliminar comentario' }),
    );
    expect(eliminar).toHaveBeenCalledWith(105);
    await vi.waitFor(() =>
      expect(screen.queryByText(/Faltaría una foto/)).not.toBeInTheDocument(),
    );
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  });

  it('cancelar la confirmación no elimina nada', async () => {
    const api = crearMockComentariosApi();
    const eliminar = vi.spyOn(api, 'eliminar');
    const user = userEvent.setup();
    montar(api);
    const mio = await propio();
    await user.click(within(mio).getByRole('button', { name: /Eliminar/ }));
    await user.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(eliminar).not.toHaveBeenCalled();
    expect(screen.getByText(/Faltaría una foto/)).toBeInTheDocument();
  });

  it('si eliminar falla, el diálogo sigue abierto con el motivo', async () => {
    const api = crearMockComentariosApi();
    api.eliminar = () =>
      Promise.reject(new ApiError(404, { code: 'COMENTARIO_NO_ENCONTRADO' }));
    const user = userEvent.setup();
    montar(api);
    const mio = await propio();
    await user.click(within(mio).getByRole('button', { name: /Eliminar/ }));
    await user.click(screen.getByRole('button', { name: 'Eliminar comentario' }));
    expect(await screen.findByText(/ya no existe/)).toBeInTheDocument();
    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
  });
});
