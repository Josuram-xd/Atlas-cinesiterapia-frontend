import { render, screen } from '@testing-library/react';
import { App } from './App';

describe('App', () => {
  it('sin sesión muestra el inicio de sesión', async () => {
    render(<App />);
    expect(
      await screen.findByRole('heading', { name: 'Inicia sesión' }),
    ).toBeInTheDocument();
  });
});
