import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { renderAtlas } from '@/test/renderAtlas';
import { InicioPage } from './InicioPage';

/** Espera a que el catálogo de regiones llegue de la API (mock) y los paths sean botones. */
async function cuerpoListo() {
  await screen.findByRole('button', { name: 'Rodilla' });
}

describe('InicioPage', () => {
  it('empieza en la vista anterior', async () => {
    renderAtlas(<InicioPage />);
    await cuerpoListo();
    expect(screen.getByRole('group', { name: /vista anterior/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Anterior' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getAllByRole('button', { name: /./ }).filter((b) => b.id)).toHaveLength(
      13,
    );
  });

  it('alterna a la vista posterior y muestra sus regiones', async () => {
    const user = userEvent.setup();
    renderAtlas(<InicioPage />);
    await cuerpoListo();
    await user.click(screen.getByRole('button', { name: 'Posterior' }));

    expect(
      await screen.findByRole('group', { name: /vista posterior/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Posterior' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByRole('button', { name: 'Columna lumbar' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Abdomen' })).not.toBeInTheDocument();
  });

  it('acerca la cámara a la región y vuelve con el botón, Escape o el fondo', async () => {
    const user = userEvent.setup();
    renderAtlas(<InicioPage />);
    await cuerpoListo();
    const svg = screen.getByRole('group', { name: /vista anterior/i });
    expect(svg).toHaveAttribute('viewBox', '0 0 400 900');

    await user.click(screen.getByRole('button', { name: 'Rodilla' }));
    expect(svg.getAttribute('viewBox')).not.toBe('0 0 400 900');
    const [, , w, h] = svg.getAttribute('viewBox')!.split(' ').map(Number);
    expect(w).toBeLessThan(400);
    expect(h).toBeLessThan(900);

    await user.click(screen.getByRole('button', { name: 'Cuerpo completo' }));
    expect(svg).toHaveAttribute('viewBox', '0 0 400 900');

    await user.click(screen.getByRole('button', { name: 'Codo' }));
    await user.keyboard('{Escape}');
    expect(svg).toHaveAttribute('viewBox', '0 0 400 900');

    await user.click(screen.getByRole('button', { name: 'Brazo' }));
    await user.click(svg);
    expect(svg).toHaveAttribute('viewBox', '0 0 400 900');
  });

  it('muestra el nombre de la región elegida', async () => {
    const user = userEvent.setup();
    renderAtlas(<InicioPage />);
    await cuerpoListo();
    await user.click(screen.getByRole('button', { name: 'Codo' }));
    expect(screen.getByText('Codo', { selector: 'p' })).toBeInTheDocument();
  });

  it('rodea la región ampliada con las 9 categorías, pedidas a la API', async () => {
    const user = userEvent.setup();
    renderAtlas(<InicioPage />);
    await cuerpoListo();
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Rodilla' }));
    const menu = await screen.findByRole('navigation', { name: /categorías.*rodilla/i });
    expect(await within(menu).findAllByRole('button', { name: /./ })).toHaveLength(10);
    expect(
      within(menu).getByRole('button', { name: 'Ejercicio activo resistido' }),
    ).toBeInTheDocument();
  });

  it('al elegir una categoría la marca; al cambiar de región se desmarca', async () => {
    const user = userEvent.setup();
    renderAtlas(<InicioPage />);
    await cuerpoListo();
    await user.click(screen.getByRole('button', { name: 'Rodilla' }));
    const boton = await screen.findByRole('button', { name: 'Movilización pasiva' });
    await user.click(boton);
    expect(boton).toHaveAttribute('aria-pressed', 'true');

    await user.click(screen.getByRole('button', { name: 'Cuerpo completo' }));
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
  });
});

describe('InicioPage: listado de ejercicios', () => {
  it('al elegir región y categoría muestra los ejercicios de esa combinación', async () => {
    const user = userEvent.setup();
    renderAtlas(<InicioPage />);
    await cuerpoListo();
    await user.click(screen.getByRole('button', { name: 'Rodilla' }));
    await user.click(
      await screen.findByRole('button', { name: 'Ejercicio activo resistido' }),
    );
    expect(
      await screen.findByRole('heading', { name: 'Ejercicio activo resistido' }),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Extensión de rodilla con banda elástica'),
    ).toBeInTheDocument();
    expect(screen.getByText('3 ejercicios')).toBeInTheDocument();
  });

  it('cambiar de categoría cambia el listado y cerrar lo oculta', async () => {
    const user = userEvent.setup();
    renderAtlas(<InicioPage />);
    await cuerpoListo();
    await user.click(screen.getByRole('button', { name: 'Rodilla' }));
    await user.click(await screen.findByRole('button', { name: 'Movilización pasiva' }));
    expect(
      await screen.findByText('Flexoextensión pasiva de rodilla'),
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Fortalecimiento isométrico' }));
    expect(
      await screen.findByText('Isométrico de cuádriceps con toalla'),
    ).toBeInTheDocument();
    expect(
      screen.queryByText('Flexoextensión pasiva de rodilla'),
    ).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Cerrar listado' }));
    expect(
      screen.queryByRole('heading', { name: 'Fortalecimiento isométrico' }),
    ).not.toBeInTheDocument();
  });

  it('al cambiar de región se cierra el listado', async () => {
    const user = userEvent.setup();
    renderAtlas(<InicioPage />);
    await cuerpoListo();
    await user.click(screen.getByRole('button', { name: 'Rodilla' }));
    await user.click(await screen.findByRole('button', { name: 'Movilización pasiva' }));
    await screen.findByText('Flexoextensión pasiva de rodilla');
    await user.click(screen.getByRole('button', { name: 'Cuerpo completo' }));
    expect(
      screen.queryByText('Flexoextensión pasiva de rodilla'),
    ).not.toBeInTheDocument();
  });
});
