import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { BotonTexto } from './BotonTexto';

afterEach(() => vi.restoreAllMocks());

describe('BotonTexto soloEnLinea', () => {
  it('se deshabilita sin conexión si es una acción de escritura', () => {
    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(false);
    render(<BotonTexto soloEnLinea>Eliminar</BotonTexto>);
    expect(screen.getByRole('button', { name: 'Eliminar' })).toBeDisabled();
  });
});
