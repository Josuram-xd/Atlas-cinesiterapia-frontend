import { useState } from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Link } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { ConfirmarSalida } from '@/components/ConfirmarSalida';
import { renderWithRouter } from '@/test/renderWithRouter';
import { useUnsavedChanges } from './useUnsavedChanges';

function Formulario() {
  const [texto, setTexto] = useState('');
  const blocker = useUnsavedChanges(texto !== '');
  return (
    <div>
      <label>
        Comentario
        <input value={texto} onChange={(e) => setTexto(e.target.value)} />
      </label>
      <button onClick={() => setTexto('')}>Guardar</button>
      <Link to="/otra">Ir a otra</Link>
      <ConfirmarSalida blocker={blocker} />
    </div>
  );
}

const rutas = [
  { path: '/', element: <Formulario /> },
  { path: '/otra', element: <h1>Otra pantalla</h1> },
];

function dispararBeforeUnload() {
  const evento = new Event('beforeunload', { cancelable: true });
  window.dispatchEvent(evento);
  return evento;
}

describe('useUnsavedChanges', () => {
  it('navega sin preguntar cuando no hay cambios', async () => {
    const user = userEvent.setup();
    renderWithRouter(rutas);
    await user.click(screen.getByRole('link', { name: 'Ir a otra' }));
    expect(screen.getByRole('heading', { name: 'Otra pantalla' })).toBeInTheDocument();
  });

  it('pregunta antes de salir con cambios y permite seguir editando', async () => {
    const user = userEvent.setup();
    renderWithRouter(rutas);
    await user.type(screen.getByLabelText('Comentario'), 'borrador');
    await user.click(screen.getByRole('link', { name: 'Ir a otra' }));

    expect(screen.getByRole('alertdialog')).toHaveTextContent(
      'Tienes cambios sin guardar. ¿Seguro que quieres salir?',
    );
    await user.click(screen.getByRole('button', { name: 'Seguir editando' }));

    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    expect(screen.getByLabelText('Comentario')).toHaveValue('borrador');
  });

  it('permite salir sin guardar', async () => {
    const user = userEvent.setup();
    renderWithRouter(rutas);
    await user.type(screen.getByLabelText('Comentario'), 'borrador');
    await user.click(screen.getByRole('link', { name: 'Ir a otra' }));
    await user.click(screen.getByRole('button', { name: 'Salir sin guardar' }));
    expect(screen.getByRole('heading', { name: 'Otra pantalla' })).toBeInTheDocument();
  });

  it('activa el aviso del navegador solo cuando hay cambios', async () => {
    const user = userEvent.setup();
    renderWithRouter(rutas);
    expect(dispararBeforeUnload().defaultPrevented).toBe(false);

    await user.type(screen.getByLabelText('Comentario'), 'x');
    expect(dispararBeforeUnload().defaultPrevented).toBe(true);

    await user.click(screen.getByRole('button', { name: 'Guardar' }));
    expect(dispararBeforeUnload().defaultPrevented).toBe(false);
  });
});
