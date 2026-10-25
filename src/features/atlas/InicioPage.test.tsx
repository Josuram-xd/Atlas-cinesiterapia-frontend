import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { InicioPage } from './InicioPage';

describe('InicioPage', () => {
  it('empieza en la vista anterior', () => {
    render(<InicioPage />);
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
    render(<InicioPage />);
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

  it('muestra el nombre de la región elegida', async () => {
    const user = userEvent.setup();
    render(<InicioPage />);
    await user.click(screen.getByRole('button', { name: 'Codo' }));
    expect(screen.getByText('Codo', { selector: 'p' })).toBeInTheDocument();
  });
});
