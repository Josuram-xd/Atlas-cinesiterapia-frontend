import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { EjerciciosPanel } from './EjerciciosPanel';

const ejercicios = [
  { id: 1, nombre: 'Puente isométrico', resumen: 'Activar glúteos en estático.' },
  { id: 2, nombre: 'Plancha', resumen: 'Controlar la posición neutra.' },
];

describe('EjerciciosPanel', () => {
  it('titula con la categoría y la región, y lista los ejercicios', () => {
    render(
      <EjerciciosPanel
        region="Columna lumbar"
        categoria="Fortalecimiento isométrico"
        ejercicios={ejercicios}
        onCerrar={() => {}}
      />,
    );
    expect(
      screen.getByRole('heading', { name: 'Fortalecimiento isométrico' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Columna lumbar', { selector: 'p' })).toBeInTheDocument();
    const lista = screen.getByRole('list');
    expect(lista.querySelectorAll('li')).toHaveLength(2);
    expect(screen.getByText('Puente isométrico')).toBeInTheDocument();
    expect(screen.getByText('Controlar la posición neutra.')).toBeInTheDocument();
  });

  it('anuncia la cantidad en singular y en plural', () => {
    const { rerender } = render(
      <EjerciciosPanel
        region="Rodilla"
        categoria="Pasiva"
        ejercicios={ejercicios}
        onCerrar={() => {}}
      />,
    );
    expect(screen.getByText('2 ejercicios')).toBeInTheDocument();
    rerender(
      <EjerciciosPanel
        region="Rodilla"
        categoria="Pasiva"
        ejercicios={ejercicios.slice(0, 1)}
        onCerrar={() => {}}
      />,
    );
    expect(screen.getByText('1 ejercicio')).toBeInTheDocument();
  });

  it('se cierra con su botón', async () => {
    const user = userEvent.setup();
    const onCerrar = vi.fn();
    render(
      <EjerciciosPanel
        region="Rodilla"
        categoria="Pasiva"
        ejercicios={ejercicios}
        onCerrar={onCerrar}
      />,
    );
    await user.click(screen.getByRole('button', { name: 'Cerrar listado' }));
    expect(onCerrar).toHaveBeenCalledOnce();
  });
});
