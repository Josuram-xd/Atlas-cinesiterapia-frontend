import { useId } from 'react';
import { BODY_VIEWBOX, GEOMETRIA, ORDEN_REGIONES, type VistaId } from './geometry';

/**
 * Relieve anatómico del cuerpo, dibujado a mano para el lado izquierdo del lienzo y reflejado.
 * Son referencias de superficie (no un modelo médico): bordes musculares y relieves óseos que
 * un fisioterapeuta reconoce al palpar. Coordenadas del lienzo de 400 x 900.
 */
const RELIEVE: Record<VistaId, string[]> = {
  anterior: [
    // Esternocleidomastoideo y clavícula.
    'M176 98 C182 116 189 133 197 147',
    'M190 148 C176 146 163 148 152 154',
    // Pectoral mayor: borde inferior hasta la axila.
    'M199 252 C186 263 164 258 148 224',
    // Surco deltopectoral.
    'M154 156 C142 176 134 200 131 226',
    // Recto abdominal: borde lateral e intersecciones tendinosas.
    'M178 270 C180 305 183 345 188 382',
    'M181 294 Q191 299 200 296',
    'M183 320 Q192 325 200 322',
    'M185 347 Q193 351 200 349',
    // Serrato anterior.
    'M152 236 L161 243',
    'M153 251 L163 257',
    // Línea inguinal.
    'M156 362 C166 398 180 434 196 468',
    // Bíceps braquial.
    'M120 236 C114 268 108 300 104 332',
    // Braquiorradial.
    'M97 352 C89 388 81 418 75 452',
    // Sartorio y recto femoral.
    'M147 474 C164 524 179 584 188 640',
    'M159 486 C162 530 165 575 167 632',
    // Vasto medial.
    'M186 594 C177 612 173 638 179 660',
    // Rótula.
    'M168 647 C177 647 179 657 178 664 C177 673 160 673 158 664 C157 656 160 647 168 647 Z',
    // Cresta tibial y gemelo medial.
    'M171 690 C169 730 167 768 169 800',
    'M186 702 C192 724 190 748 184 768',
  ],
  posterior: [
    // Trapecio: borde superior y descendente hasta T12.
    'M188 118 C176 134 162 146 150 153',
    'M151 156 C170 192 188 252 200 300',
    // Escápula.
    'M179 184 L157 179 C152 206 160 238 178 252 C183 230 183 204 179 184 Z',
    'M157 190 Q168 194 179 196',
    // Deltoides posterior.
    'M150 160 C137 180 130 204 129 228',
    // Dorsal ancho.
    'M152 262 C166 300 184 324 200 338',
    // Erectores lumbares.
    'M190 300 C187 338 187 370 190 402',
    // Glúteo mayor y pliegue glúteo.
    'M198 410 C180 405 160 414 148 432',
    'M199 472 Q176 488 147 478',
    // Tríceps braquial.
    'M114 240 C111 270 107 300 103 330',
    // Isquiotibiales.
    'M166 500 C166 540 166 580 168 640',
    // Hueco poplíteo.
    'M155 662 Q168 672 183 662',
    // Gemelos y tendón de Aquiles.
    'M168 690 C159 716 160 746 169 772',
    'M171 690 C181 712 185 742 176 772',
    'M171 776 L171 816',
  ],
};

const ESPEJO = `matrix(-1 0 0 1 ${BODY_VIEWBOX.w} 0)`;
const CENTRO = {
  anterior: 'M200 150 L200 262 M200 270 L200 382',
  posterior: 'M200 140 L200 404',
};

/** Capas que van detrás de las regiones: sombra en el suelo y borde de luz de la silueta. */
export function BodyFondo({ vista }: { vista: VistaId }) {
  const sombra = useId();
  return (
    <g aria-hidden className="cuerpo-detalle">
      <defs>
        <radialGradient id={sombra}>
          <stop offset="0" stopColor="#000" stopOpacity="0.55" />
          <stop offset="1" stopColor="#000" stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx="200" cy="886" rx="110" ry="12" fill={`url(#${sombra})`} />
      <g
        fill="none"
        stroke="var(--color-acento-vivo)"
        strokeOpacity="0.35"
        strokeWidth="5"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      >
        {ORDEN_REGIONES[vista].map((slug) => (
          <path
            key={slug}
            d={GEOMETRIA[vista][slug].d}
            vectorEffect="non-scaling-stroke"
          />
        ))}
      </g>
    </g>
  );
}

/**
 * Capas sobre las regiones, recortadas a la silueta: luz principal desde arriba a la izquierda,
 * surcos de sombra entre regiones (dan volumen de yeso) y el relieve anatómico.
 */
export function BodyRelieve({ vista }: { vista: VistaId }) {
  const base = useId();
  const silueta = `${base}-silueta`;
  const luz = `${base}-luz`;
  const regiones = ORDEN_REGIONES[vista].map((slug) => GEOMETRIA[vista][slug].d);
  const trazos = RELIEVE[vista];
  return (
    <g aria-hidden className="cuerpo-detalle">
      <defs>
        <clipPath id={silueta}>
          {regiones.map((d, i) => (
            <path key={i} d={d} />
          ))}
        </clipPath>
        <linearGradient
          id={luz}
          gradientUnits="userSpaceOnUse"
          x1="80"
          y1="60"
          x2="330"
          y2="880"
        >
          <stop offset="0" stopColor="#fff" stopOpacity="0.28" />
          <stop offset="0.45" stopColor="#fff" stopOpacity="0" />
          <stop offset="1" stopColor="#0f1e1a" stopOpacity="0.3" />
        </linearGradient>
      </defs>
      <g clipPath={`url(#${silueta})`}>
        <rect width={BODY_VIEWBOX.w} height={BODY_VIEWBOX.h} fill={`url(#${luz})`} />
        <g fill="none" stroke="#0f1e1a" strokeLinejoin="round">
          {regiones.map((d, i) => (
            <path key={`a${i}`} d={d} strokeWidth="6" strokeOpacity="0.05" />
          ))}
          {regiones.map((d, i) => (
            <path key={`b${i}`} d={d} strokeWidth="2.5" strokeOpacity="0.06" />
          ))}
        </g>
        <path className="trazo-anatomico" d={CENTRO[vista]} pathLength={1} />
        {[undefined, ESPEJO].map((transform) => (
          <g key={transform ?? 'izq'} transform={transform}>
            {trazos.map((d) => (
              <path key={d} className="trazo-anatomico" d={d} pathLength={1} />
            ))}
          </g>
        ))}
      </g>
    </g>
  );
}
