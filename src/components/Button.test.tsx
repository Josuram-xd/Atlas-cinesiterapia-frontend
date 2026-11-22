import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Button } from './Button';

afterEach(() => vi.restoreAllMocks());

describe('Button soloEnLinea', () => {
  it('se deshabilita sin conexión si es una acción de escritura', () => {
    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(false);
    render(<Button soloEnLinea>Publicar</Button>);
    expect(screen.getByRole('button', { name: 'Publicar' })).toBeDisabled();
  });

  it('sigue habilitado sin conexión si no es una escritura', () => {
    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(false);
    render(<Button>Volver</Button>);
    expect(screen.getByRole('button', { name: 'Volver' })).toBeEnabled();
  });

  it('con conexión, una escritura queda habilitada', () => {
    render(<Button soloEnLinea>Guardar</Button>);
    expect(screen.getByRole('button', { name: 'Guardar' })).toBeEnabled();
  });
});
