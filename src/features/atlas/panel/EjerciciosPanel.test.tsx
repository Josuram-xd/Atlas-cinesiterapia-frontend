import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ComponentProps } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { EjerciciosPanel } from './EjerciciosPanel';

const base = {
  region: { id: 9, nombre: 'Columna lumbar', svgId: 'posterior-lumbar' },
  categoria: { id: 6, nombre: 'Fortalecimiento isométrico' },
};
const ejercicios = [
  { id: 1, nombre: 'Puente isométrico', ...base },
  { id: 2, nombre: 'Plancha', ...base },
];

function montar(props: Partial<ComponentProps<typeof EjerciciosPanel>> = {}) {
  const onCerrar = vi.fn();
  const onReintentar = vi.fn();
  const utils = render(
    <MemoryRouter>
      <EjerciciosPanel
        region="Columna lumbar"
        categoria="Fortalecimiento isométrico"
        estado="listo"
        ejercicios={ejercicios}
        onCerrar={onCerrar}
        onReintentar={onReintentar}
        {...props}
      />
    </MemoryRouter>,
  );
  return { onCerrar, onReintentar, ...utils };
}

describe('EjerciciosPanel con datos', () => {
  it('titula con la categoría y la región, y lista los ejercicios', () => {
    montar();
    expect(
      screen.getByRole('heading', { name: 'Fortalecimiento isométrico' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Columna lumbar', { selector: 'p' })).toBeInTheDocument();
    expect(screen.getByRole('list').querySelectorAll('li')).toHaveLength(2);
    expect(screen.getByText('Puente isométrico')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Puente isométrico/ })).toHaveAttribute(
      'href',
      '/ejercicios/1',
    );
  });

  it('anuncia la cantidad en singular y en plural', () => {
    const { rerender } = montar();
    expect(screen.getByText('2 ejercicios')).toBeInTheDocument();
    rerender(
      <MemoryRouter>
        <EjerciciosPanel
          region="Rodilla"
          categoria="Pasiva"
          estado="listo"
          ejercicios={ejercicios.slice(0, 1)}
          onCerrar={() => {}}
          onReintentar={() => {}}
        />
      </MemoryRouter>,
    );
    expect(screen.getByText('1 ejercicio')).toBeInTheDocument();
  });

  it('se cierra con su botón', async () => {
    const user = userEvent.setup();
    const { onCerrar } = montar();
    await user.click(screen.getByRole('button', { name: 'Cerrar listado' }));
    expect(onCerrar).toHaveBeenCalledOnce();
  });
});

describe('EjerciciosPanel: estados', () => {
  it('cargando: avisa con un estado accesible y no muestra el listado', () => {
    montar({ estado: 'cargando', ejercicios: undefined });
    expect(screen.getByRole('status')).toHaveTextContent('Cargando ejercicios');
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /isométrico/ })).toBeInTheDocument();
  });

  it('vacío: explica que no hay fichas y sugiere otra categoría', () => {
    montar({ estado: 'listo', ejercicios: [] });
    expect(screen.getByRole('status')).toHaveTextContent(
      'Todavía no hay ejercicios publicados',
    );
    expect(screen.getByRole('status')).toHaveTextContent('otra categoría');
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
    expect(screen.queryByText('0 ejercicios')).not.toBeInTheDocument();
  });

  it('error: muestra el aviso y permite reintentar', async () => {
    const user = userEvent.setup();
    const { onReintentar } = montar({
      estado: 'error',
      ejercicios: undefined,
      mensajeError: 'El servidor tuvo un problema.',
    });
    expect(screen.getByRole('alert')).toHaveTextContent('El servidor tuvo un problema.');
    await user.click(screen.getByRole('button', { name: 'Reintentar' }));
    expect(onReintentar).toHaveBeenCalledOnce();
  });
});
