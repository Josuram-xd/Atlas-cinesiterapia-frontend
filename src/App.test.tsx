import { render, screen } from '@testing-library/react';
import { App } from './App';

describe('App', () => {
  it('muestra el título', () => {
    render(<App />);
    expect(
      screen.getByRole('heading', { name: /atlas de cinesiterapia/i }),
    ).toBeInTheDocument();
  });
});
