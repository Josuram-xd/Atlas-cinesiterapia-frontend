import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { REGIONES_MOCK } from '../data/regiones';
import { BodyFigure } from './BodyFigure';
import { BODY_VIEWBOX, GEOMETRIA, ORDEN_REGIONES } from './geometry';

describe('geometría del cuerpo', () => {
  it('define las 13 regiones anteriores y las 14 posteriores', () => {
    expect(ORDEN_REGIONES.anterior).toHaveLength(13);
    expect(ORDEN_REGIONES.posterior).toHaveLength(14);
    expect(Object.keys(GEOMETRIA.anterior).sort()).toEqual(
      [...ORDEN_REGIONES.anterior].sort(),
    );
    expect(Object.keys(GEOMETRIA.posterior).sort()).toEqual(
      [...ORDEN_REGIONES.posterior].sort(),
    );
  });

  it('cada región tiene un trazado válido dentro del lienzo', () => {
    for (const vista of ['anterior', 'posterior'] as const) {
      for (const [slug, geo] of Object.entries(GEOMETRIA[vista])) {
        expect(geo.d, `${vista}-${slug}`).not.toMatch(/NaN|undefined/);
        expect(geo.d.startsWith('M')).toBe(true);
        for (const f of geo.focos) {
          expect(f.x).toBeGreaterThanOrEqual(BODY_VIEWBOX.x);
          expect(f.y).toBeGreaterThanOrEqual(BODY_VIEWBOX.y);
          expect(f.x + f.w).toBeLessThanOrEqual(BODY_VIEWBOX.w);
          expect(f.y + f.h).toBeLessThanOrEqual(BODY_VIEWBOX.h);
        }
      }
    }
  });

  it('dibuja un path por región con id igual al svgId del catálogo', () => {
    const { container } = render(
      <>
        <svg>
          <BodyFigure vista="anterior" regiones={REGIONES_MOCK} />
        </svg>
        <svg>
          <BodyFigure vista="posterior" regiones={REGIONES_MOCK} />
        </svg>
      </>,
    );
    const ids = [...container.querySelectorAll('path')].map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect([...ids].sort()).toEqual(REGIONES_MOCK.map((r) => r.svgId).sort());
  });
});
