import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useActualizacion } from './actualizacion';
import { AvisosSistema } from './AvisosSistema';

afterEach(() => {
  useActualizacion.getState().descartar();
  vi.restoreAllMocks();
});

describe('AvisosSistema: sin conexión', () => {
  it('avisa al perder la conexión y se quita al recuperarla', () => {
    render(<AvisosSistema />);
    expect(screen.queryByRole('status')).not.toBeInTheDocument();

    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(false);
    act(() => void window.dispatchEvent(new Event('offline')));
    expect(screen.getByRole('status')).toHaveTextContent(/sin conexión/i);

    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(true);
    act(() => void window.dispatchEvent(new Event('online')));
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });
});

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
