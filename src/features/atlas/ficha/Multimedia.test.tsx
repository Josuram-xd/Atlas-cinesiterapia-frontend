import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import type { Media } from '@/lib/api';
import { GaleriaImagenes } from './GaleriaImagenes';
import { ReproductorVideo } from './ReproductorVideo';

const img = (id: number, rol: Media['rol'], url = `/mock/${id}.svg`): Media => ({
  id,
  tipo: 'IMAGEN',
  rol,
  contentType: 'image/png',
  tamanoBytes: 10,
  url,
  orden: id,
});
const imagenes = [img(1, 'POSICION_INICIAL'), img(2, 'POSICION_FINAL'), img(3, 'OTRO')];

describe('GaleriaImagenes y visor', () => {
  it('muestra una miniatura por imagen con texto alternativo descriptivo', () => {
    render(<GaleriaImagenes nombre="Puente" imagenes={imagenes} />);
    expect(screen.getAllByRole('button')).toHaveLength(3);
    expect(screen.getByAltText('Posición inicial de Puente')).toBeInTheDocument();
    expect(screen.getByAltText('Imagen adicional 3 de Puente')).toBeInTheDocument();
  });

  it('abre el visor como diálogo modal y lleva el foco dentro', async () => {
    const user = userEvent.setup();
    render(<GaleriaImagenes nombre="Puente" imagenes={imagenes} />);
    await user.click(screen.getByRole('button', { name: /Posición final/ }));
    const dialogo = screen.getByRole('dialog', { name: /imágenes/i });
    expect(dialogo).toHaveAttribute('aria-modal', 'true');
    expect(dialogo).toContainElement(document.activeElement as HTMLElement);
    expect(within(dialogo).getByText('2 de 3')).toBeInTheDocument();
    expect(within(dialogo).getByAltText('Posición final de Puente')).toBeInTheDocument();
  });

  it('navega con los botones y con las flechas, sin pasar de los extremos', async () => {
    const user = userEvent.setup();
    render(<GaleriaImagenes nombre="Puente" imagenes={imagenes} />);
    await user.click(screen.getByRole('button', { name: /Posición inicial/ }));
    const dialogo = screen.getByRole('dialog');
    expect(
      within(dialogo).getByRole('button', { name: 'Imagen anterior' }),
    ).toBeDisabled();
    await user.click(within(dialogo).getByRole('button', { name: 'Imagen siguiente' }));
    expect(within(dialogo).getByText('2 de 3')).toBeInTheDocument();
    await user.keyboard('{ArrowRight}');
    expect(within(dialogo).getByText('3 de 3')).toBeInTheDocument();
    await user.keyboard('{ArrowRight}');
    expect(within(dialogo).getByText('3 de 3')).toBeInTheDocument();
    await user.keyboard('{ArrowLeft}');
    expect(within(dialogo).getByText('2 de 3')).toBeInTheDocument();
  });

  it('cierra con Escape y devuelve el foco a la miniatura', async () => {
    const user = userEvent.setup();
    render(<GaleriaImagenes nombre="Puente" imagenes={imagenes} />);
    const miniatura = screen.getByRole('button', { name: /Posición final/ });
    await user.click(miniatura);
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(miniatura).toHaveFocus();
  });

  it('mantiene el foco dentro del visor al tabular', async () => {
    const user = userEvent.setup();
    render(<GaleriaImagenes nombre="Puente" imagenes={imagenes} />);
    await user.click(screen.getByRole('button', { name: /Posición inicial/ }));
    const dialogo = screen.getByRole('dialog');
    for (let i = 0; i < 6; i++) {
      await user.tab();
      expect(dialogo).toContainElement(document.activeElement as HTMLElement);
    }
    await user.tab({ shift: true });
    expect(dialogo).toContainElement(document.activeElement as HTMLElement);
  });

  it('cierra al pulsar el botón Cerrar', async () => {
    const user = userEvent.setup();
    render(<GaleriaImagenes nombre="Puente" imagenes={imagenes} />);
    await user.click(screen.getByRole('button', { name: /Posición inicial/ }));
    await user.click(screen.getByRole('button', { name: 'Cerrar visor' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('no muestra imágenes con URL insegura', () => {
    render(
      <GaleriaImagenes
        nombre="Puente"
        imagenes={[img(1, 'OTRO', 'javascript:alert(1)'), img(2, 'OTRO')]}
      />,
    );
    expect(screen.getAllByRole('button')).toHaveLength(1);
  });

  it('no dibuja nada sin imágenes', () => {
    const { container } = render(<GaleriaImagenes nombre="Puente" imagenes={[]} />);
    expect(container).toBeEmptyDOMElement();
  });
});

describe('ReproductorVideo', () => {
  const video: Media = {
    id: 9,
    tipo: 'VIDEO',
    rol: null,
    contentType: 'video/mp4',
    tamanoBytes: 100,
    url: 'https://cdn.ejemplo.com/v.mp4',
    orden: 1,
  };

  it('usa el reproductor nativo con controles y sin autoplay', () => {
    const { container } = render(<ReproductorVideo nombre="Puente" video={video} />);
    const el = container.querySelector('video')!;
    expect(el).toHaveAttribute('controls');
    expect(el).not.toHaveAttribute('autoplay');
    expect(el).toHaveAttribute('src', 'https://cdn.ejemplo.com/v.mp4');
    expect(el).toHaveAttribute('aria-label', 'Video de Puente');
  });

  it('un GIF se muestra como imagen', () => {
    const { container } = render(
      <ReproductorVideo nombre="Puente" video={{ ...video, contentType: 'image/gif' }} />,
    );
    expect(container.querySelector('video')).toBeNull();
    expect(screen.getByAltText('Video de Puente (animación)')).toBeInTheDocument();
  });

  it('avisa si el video no carga', async () => {
    const { container } = render(<ReproductorVideo nombre="Puente" video={video} />);
    container.querySelector('video')!.dispatchEvent(new Event('error'));
    expect(await screen.findByRole('status')).toHaveTextContent(/no se pudo cargar/i);
  });

  it('no dibuja nada con URL insegura', () => {
    const { container } = render(
      <ReproductorVideo
        nombre="Puente"
        video={{ ...video, url: 'javascript:alert(1)' }}
      />,
    );
    expect(container).toBeEmptyDOMElement();
  });
});
