import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useActualizacion } from './actualizacion';
import { AvisosSistema } from './AvisosSistema';

afterEach(() => useActualizacion.getState().descartar());

describe('AvisosSistema: versión nueva', () => {
  it('no muestra nada si no hay versión nueva', () => {
    const { container } = render(<AvisosSistema />);
    expect(container).toBeEmptyDOMElement();
  });

  it('avisa y aplica la actualización solo cuando la persona lo pide', async () => {
    const aplicar = vi.fn();
    render(<AvisosSistema />);
    act(() => useActualizacion.getState().anunciar(aplicar));
    expect(screen.getByRole('status')).toHaveTextContent(/versión nueva/i);
    expect(aplicar).not.toHaveBeenCalled();

    await userEvent.click(screen.getByRole('button', { name: /actualizar ahora/i }));
    expect(aplicar).toHaveBeenCalledOnce();
  });

  it('«Más tarde» cierra el aviso sin actualizar', async () => {
    const aplicar = vi.fn();
    render(<AvisosSistema />);
    act(() => useActualizacion.getState().anunciar(aplicar));
    await userEvent.click(screen.getByRole('button', { name: /más tarde/i }));
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(aplicar).not.toHaveBeenCalled();
  });
});
