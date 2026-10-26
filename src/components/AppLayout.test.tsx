import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AppLayout } from './AppLayout';

describe('AppLayout', () => {
  it('ofrece enlace para saltar al contenido y un único main', () => {
    render(
      <MemoryRouter>
        <AppLayout>
          <p>Hola</p>
        </AppLayout>
      </MemoryRouter>,
    );
    expect(screen.getByRole('link', { name: /saltar al contenido/i })).toHaveAttribute(
      'href',
      '#contenido',
    );
    expect(screen.getAllByRole('main')).toHaveLength(1);
    expect(screen.getByRole('link', { name: /inicio/i })).toBeInTheDocument();
  });
});
