import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef, type ComponentProps } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { CATEGORIAS_MOCK } from '../data/regiones';
import { CategoriaMenu } from './CategoriaMenu';

function montar(props: Partial<ComponentProps<typeof CategoriaMenu>> = {}) {
  const onElegir = vi.fn();
  const onVolver = vi.fn();
  render(
    <CategoriaMenu
      region="Rodilla"
      categorias={CATEGORIAS_MOCK}
      activaId={null}
      onElegir={onElegir}
      onVolver={onVolver}
      ventana={createRef<HTMLDivElement>()}
      {...props}
    />,
  );
  return { onElegir, onVolver };
}

describe('CategoriaMenu', () => {
  it('ofrece las 9 categorías con su nombre completo como nombre accesible', () => {
    montar();
    expect(
      screen.getByRole('navigation', { name: /categorías.*rodilla/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', {
        name: 'Facilitación neuromuscular propioceptiva (FNP)',
      }),
    ).toBeInTheDocument();
    // 9 categorías + volver al cuerpo completo
    expect(screen.getAllByRole('button')).toHaveLength(10);
  });

  it('muestra el texto corto en el botón', () => {
    montar();
    expect(screen.getByText('Control motor')).toBeInTheDocument();
    expect(screen.getByText('FNP')).toBeInTheDocument();
  });

  it('elige una categoría y marca la activa', async () => {
    const user = userEvent.setup();
    const { onElegir } = montar({ activaId: 3 });
    expect(
      screen.getByRole('button', { name: 'Movilización activa libre' }),
    ).toHaveAttribute('aria-pressed', 'true');
    await user.click(screen.getByRole('button', { name: 'Movilización pasiva' }));
    expect(onElegir).toHaveBeenCalledWith(CATEGORIAS_MOCK[0]);
  });

  it('vuelve al cuerpo completo', async () => {
    const user = userEvent.setup();
    const { onVolver } = montar();
    await user.click(screen.getByRole('button', { name: 'Cuerpo completo' }));
    expect(onVolver).toHaveBeenCalledOnce();
  });
});
