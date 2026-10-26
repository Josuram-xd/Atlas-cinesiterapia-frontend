import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { REGIONES_MOCK } from '../data/regiones';
import { BodyAtlas } from './BodyAtlas';

const anteriores = REGIONES_MOCK.filter((r) => r.vista === 'ANTERIOR');
const posteriores = REGIONES_MOCK.filter((r) => r.vista === 'POSTERIOR');

describe('BodyAtlas', () => {
  it('expone cada región como botón con su nombre accesible', () => {
    render(<BodyAtlas vista="anterior" regiones={anteriores} onSelect={() => {}} />);
    expect(screen.getByRole('group', { name: /vista anterior/i })).toBeInTheDocument();
    expect(screen.getAllByRole('button')).toHaveLength(13);
    expect(screen.getByRole('button', { name: 'Muñeca y mano' })).toHaveAttribute(
      'id',
      'anterior-muneca-mano',
    );
  });

  it('muestra las 14 regiones de la vista posterior', () => {
    render(<BodyAtlas vista="posterior" regiones={posteriores} onSelect={() => {}} />);
    expect(screen.getAllByRole('button')).toHaveLength(14);
    expect(screen.getByRole('button', { name: 'Hombro y escápula' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Glúteo' })).toBeInTheDocument();
  });

  it('selecciona con clic', async () => {
    const onSelect = vi.fn();
    render(<BodyAtlas vista="anterior" regiones={anteriores} onSelect={onSelect} />);
    await userEvent.click(screen.getByRole('button', { name: 'Rodilla' }));
    expect(onSelect).toHaveBeenCalledWith(
      expect.objectContaining({ svgId: 'anterior-rodilla' }),
    );
  });

  it('se recorre con Tab y se activa con Enter o Espacio', async () => {
    const onSelect = vi.fn();
    const user = userEvent.setup();
    render(<BodyAtlas vista="anterior" regiones={anteriores} onSelect={onSelect} />);
    await user.tab();
    expect(screen.getByRole('button', { name: 'Cabeza y cuello' })).toHaveFocus();
    await user.keyboard('{Enter}');
    await user.tab();
    await user.keyboard(' ');
    expect(onSelect).toHaveBeenCalledTimes(2);
    expect(onSelect.mock.calls[1][0].svgId).toBe('anterior-hombro');
  });

  it('marca la región elegida con aria-pressed y avisa el foco y el cursor', async () => {
    const onHover = vi.fn();
    const user = userEvent.setup();
    render(
      <BodyAtlas
        vista="anterior"
        regiones={anteriores}
        seleccionada="anterior-codo"
        onSelect={() => {}}
        onHover={onHover}
      />,
    );
    expect(screen.getByRole('button', { name: 'Codo' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByRole('button', { name: 'Brazo' })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
    await user.hover(screen.getByRole('button', { name: 'Abdomen' }));
    expect(onHover).toHaveBeenLastCalledWith(
      expect.objectContaining({ nombre: 'Abdomen' }),
    );
    await user.unhover(screen.getByRole('button', { name: 'Abdomen' }));
    expect(onHover).toHaveBeenLastCalledWith(null);
  });
});

describe('BodyAtlas con gestos táctiles', () => {
  function dedo(tipo: string, id: number, x: number, y: number) {
    return { pointerType: 'touch', pointerId: id, clientX: x, clientY: y, type: tipo };
  }

  it('un toque corto elige la región', () => {
    const onSelect = vi.fn();
    render(<BodyAtlas vista="anterior" regiones={anteriores} onSelect={onSelect} />);
    const rodilla = screen.getByRole('button', { name: 'Rodilla' });
    fireEvent.pointerDown(rodilla, dedo('pointerdown', 1, 100, 100));
    fireEvent.pointerUp(rodilla, dedo('pointerup', 1, 102, 101));
    fireEvent.click(rodilla);
    expect(onSelect).toHaveBeenCalledOnce();
  });

  it('un arrastre no elige la región bajo el dedo', () => {
    const onSelect = vi.fn();
    render(<BodyAtlas vista="anterior" regiones={anteriores} onSelect={onSelect} />);
    const rodilla = screen.getByRole('button', { name: 'Rodilla' });
    fireEvent.pointerDown(rodilla, dedo('pointerdown', 1, 100, 100));
    fireEvent.pointerMove(rodilla, dedo('pointermove', 1, 100, 180));
    fireEvent.pointerUp(rodilla, dedo('pointerup', 1, 100, 180));
    fireEvent.click(rodilla);
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('el ratón no activa los gestos: un clic siempre elige', () => {
    const onSelect = vi.fn();
    render(<BodyAtlas vista="anterior" regiones={anteriores} onSelect={onSelect} />);
    const rodilla = screen.getByRole('button', { name: 'Rodilla' });
    fireEvent.pointerDown(rodilla, {
      ...dedo('pointerdown', 1, 0, 0),
      pointerType: 'mouse',
    });
    fireEvent.pointerMove(rodilla, {
      ...dedo('pointermove', 1, 0, 200),
      pointerType: 'mouse',
    });
    fireEvent.click(rodilla);
    expect(onSelect).toHaveBeenCalledOnce();
  });
});
