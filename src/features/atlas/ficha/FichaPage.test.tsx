import { screen, within } from '@testing-library/react';
import { Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { renderAtlas } from '@/test/renderAtlas';
import { crearMockAtlasApi } from '../api/mockAtlasApi';
import { FichaPage } from './FichaPage';

function montar(ruta: string, fallar = false) {
  return renderAtlas(
    <Routes>
      <Route path="/ejercicios/:id" element={<FichaPage />} />
    </Routes>,
    crearMockAtlasApi({ fallar }),
    ruta,
  );
}

describe('FichaPage', () => {
  it('muestra la ficha por secciones con el nombre como título', async () => {
    montar('/ejercicios/1');
    expect(
      await screen.findByRole('heading', {
        level: 1,
        name: 'Flexoextensión pasiva de rodilla',
      }),
    ).toBeInTheDocument();
    for (const nombre of [
      'Información general',
      'Protocolo clínico',
      'Ejecución',
      'Dosificación',
      'Metadatos académicos',
    ]) {
      expect(screen.getByRole('heading', { level: 2, name: nombre })).toBeInTheDocument();
    }
  });

  it('presenta la dosificación como lista de definiciones con sus seis campos', async () => {
    montar('/ejercicios/1');
    const seccion = (await screen.findByRole('region', {
      name: 'Dosificación',
    })) as HTMLElement;
    expect(within(seccion).getAllByRole('term')).toHaveLength(6);
    expect(within(seccion).getByText('Repeticiones')).toBeInTheDocument();
  });

  it('oculta progresión y errores comunes cuando la ficha no los trae', async () => {
    montar('/ejercicios/2');
    await screen.findByRole('heading', { level: 1 });
    expect(screen.queryByRole('heading', { name: 'Progresión' })).not.toBeInTheDocument();
    montar('/ejercicios/1');
    expect(
      await screen.findByRole('heading', { name: 'Progresión' }),
    ).toBeInTheDocument();
  });

  it('lista los autores y la profesora revisora', async () => {
    montar('/ejercicios/1');
    const seccion = await screen.findByRole('region', { name: 'Metadatos académicos' });
    expect(seccion).toHaveTextContent('Laura Gómez');
    expect(seccion).toHaveTextContent('Dra. María Rojas');
    expect(seccion).toHaveTextContent('2025, periodo 1');
  });

  it('vuelve al atlas desde un enlace', async () => {
    montar('/ejercicios/1');
    expect(await screen.findByRole('link', { name: /Volver al atlas/ })).toHaveAttribute(
      'href',
      '/',
    );
  });

  it('una ficha inexistente explica que no está disponible', async () => {
    montar('/ejercicios/99999');
    expect(
      await screen.findByRole('heading', { name: /no está disponible/i }),
    ).toBeInTheDocument();
  });

  it('un identificador que no es número se trata como inexistente', async () => {
    montar('/ejercicios/abc');
    expect(
      await screen.findByRole('heading', { name: /no está disponible/i }),
    ).toBeInTheDocument();
  });

  it('un fallo del servidor muestra el error con reintento', async () => {
    montar('/ejercicios/1', true);
    expect(await screen.findByRole('alert')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Reintentar' })).toBeInTheDocument();
  });

  it('muestra el texto como texto, sin interpretar HTML', async () => {
    const api = crearMockAtlasApi();
    const original = await api.obtenerEjercicio(1);
    renderAtlas(
      <Routes>
        <Route path="/ejercicios/:id" element={<FichaPage />} />
      </Routes>,
      {
        ...api,
        obtenerEjercicio: async () => ({
          ...original,
          ejecucion: '<img src=x onerror=alert(1)>',
        }),
      },
      '/ejercicios/1',
    );
    expect(await screen.findByText('<img src=x onerror=alert(1)>')).toBeInTheDocument();
    expect(document.querySelector('img[src="x"]')).toBeNull();
  });
});

describe('FichaPage: registro de visita', () => {
  function montarConEspia(ruta: string) {
    const api = crearMockAtlasApi();
    const espia = vi.spyOn(api, 'registrarVisita');
    renderAtlas(
      <Routes>
        <Route path="/ejercicios/:id" element={<FichaPage />} />
      </Routes>,
      api,
      ruta,
    );
    return espia;
  }

  it('registra una visita al abrir la ficha, una sola vez', async () => {
    const espia = montarConEspia('/ejercicios/1');
    await screen.findByRole('heading', { level: 1 });
    expect(espia).toHaveBeenCalledTimes(1);
    expect(espia).toHaveBeenCalledWith(1);
  });

  it('no registra nada si la ficha no existe', async () => {
    const espia = montarConEspia('/ejercicios/99999');
    await screen.findByRole('heading', { name: /no está disponible/i });
    expect(espia).not.toHaveBeenCalled();
  });

  it('un fallo al registrar no afecta a la lectura de la ficha', async () => {
    const api = crearMockAtlasApi();
    api.registrarVisita = () => Promise.reject(new Error('caído'));
    renderAtlas(
      <Routes>
        <Route path="/ejercicios/:id" element={<FichaPage />} />
      </Routes>,
      api,
      '/ejercicios/1',
    );
    expect(await screen.findByRole('heading', { level: 1 })).toBeInTheDocument();
  });
});
