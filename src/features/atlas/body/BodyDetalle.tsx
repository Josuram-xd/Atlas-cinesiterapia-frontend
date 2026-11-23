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
    'M182 112 C185 124 190 137 195 149',
    'M195 152 C181 150 165 152 151 158',
    // Pectoral mayor: borde inferior hasta la axila.
    'M200 232 C188 241 168 241 153 221',
    // Surco deltopectoral y borde anterior del deltoides.
    'M148 158 Q160 194 150 226',
    'M137 166 C125 186 117 208 113 228',
    // Serrato anterior.
    'M154 246 l7 4',
    'M155 259 l7 4',
    // Arco costal, recto abdominal e intersecciones tendinosas.
    'M153 274 Q180 272 200 246',
    'M182 258 C180 292 182 332 188 384',
    'M183 286 Q192 289 200 288',
    'M184 314 Q192 317 200 316',
    // Oblicuo externo y línea inguinal.
    'M156 304 C162 330 166 352 168 372',
    'M151 386 Q174 412 200 420',
    // Bíceps y braquiorradial.
    'M118 246 C112 270 106 298 104 324',
    'M92 344 C86 372 81 400 77 426',
    'M115 352 C109 380 101 404 92 428',
    // Pulgar y dedos.
    'M71 462 C67 472 67 482 71 490',
    'M77 494 L78 515',
    'M83 493 L85 516',
    // Sartorio, recto femoral y vasto medial.
    'M143 440 C162 500 178 560 186 618',
    'M150 470 C152 520 155 570 159 612',
    'M186 584 C176 598 172 622 178 642',
    // Rótula y tendón rotuliano.
    'M167 630 C176 630 179 640 178 648 C176 657 158 657 156 648 C155 640 159 630 167 630 Z',
    'M164 660 L165 674',
    'M170 660 L169 674',
    // Cresta tibial, tibial anterior y gemelo medial.
    'M168 692 C166 732 165 780 168 822',
    'M154 700 C157 732 160 770 164 812',
    'M184 702 C190 722 188 746 182 766',
    // Maléolos y dedos del pie.
    'M157 830 q5 6 1 13',
    'M178 826 q-5 6 -1 13',
    'M162 872 C168 876 176 877 184 873',
  ],
  posterior: [
    // Trapecio: borde superior y descendente hasta T12.
    'M184 120 C179 136 164 148 150 156',
    'M184 197 C192 236 196 270 200 300',
    // Espina y borde medial de la escápula.
    'M148 177 C162 182 174 188 184 196',
    'M184 199 C186 222 180 244 167 254',
    // Deltoides posterior.
    'M144 162 C135 184 125 208 116 232',
    // Dorsal ancho.
    'M153 264 C166 298 184 322 200 336',
    // Erectores de la columna.
    'M189 300 C186 336 186 366 190 396',
    // Glúteo medio y glúteo mayor.
    'M198 418 C176 420 156 436 145 464',
    // Tríceps y olécranon.
    'M112 246 C106 270 101 296 99 322',
    'M98 330 Q105 338 114 330',
    // Extensores del antebrazo y nudillos.
    'M91 350 C85 380 81 404 77 426',
    'M73 494 Q81 499 90 493',
    // Isquiotibiales y hueco poplíteo.
    'M166 506 C164 546 165 584 168 626',
    'M155 650 Q168 662 181 650',
    // Gemelos, tendón de Aquiles y talón.
    'M166 680 C156 704 153 736 161 762',
    'M168 680 C182 704 187 738 176 764',
    'M164 772 C166 794 167 812 168 830',
    'M174 772 C172 794 171 812 170 830',
    'M157 858 C162 870 176 871 182 860',
  ],
};

const ESPEJO = `matrix(-1 0 0 1 ${BODY_VIEWBOX.w} 0)`;
const CENTRO = {
  anterior:
    'M200 158 L200 232 M200 250 L200 340 M198.5 347 Q200 351 201.5 347 M200 356 L200 414',
  posterior: 'M200 126 L200 392 M200 424 L200 452',
};

/** Silueta: todas las regiones como un solo dibujo (para halos, volumen y recortes). */
function Silueta({ vista }: { vista: VistaId }) {
  return (
    <>
      {ORDEN_REGIONES[vista].map((slug) => (
        <path key={slug} d={GEOMETRIA[vista][slug].d} />
      ))}
    </>
  );
}

/** Capas detrás de las regiones: sombra en el suelo y un halo suave de luz alrededor. */
export function BodyFondo({ vista }: { vista: VistaId }) {
  const base = useId();
  const sombra = `${base}-sombra`;
  const halo = `${base}-halo`;
  return (
    <g aria-hidden className="cuerpo-detalle">
      <defs>
        <radialGradient id={sombra}>
          <stop offset="0" stopColor="#000" stopOpacity="0.6" />
          <stop offset="1" stopColor="#000" stopOpacity="0" />
        </radialGradient>
        <filter id={halo} x="-30%" y="-10%" width="160%" height="120%">
          <feGaussianBlur stdDeviation="9" />
        </filter>
      </defs>
      <ellipse cx="200" cy="888" rx="96" ry="10" fill={`url(#${sombra})`} />
      <g fill="var(--color-acento-vivo)" opacity="0.22" filter={`url(#${halo})`}>
        <Silueta vista={vista} />
      </g>
    </g>
  );
}

/**
 * Capas sobre las regiones, recortadas a la silueta: volumen de yeso (sombra propia abajo a la
 * derecha y brillo arriba a la izquierda, calculados sobre la silueta entera para que no se
 * noten las uniones), surcos musculares difuminados y el trazo anatómico fino encima.
 */
export function BodyRelieve({ vista }: { vista: VistaId }) {
  const base = useId();
  const silueta = `${base}-silueta`;
  const luz = `${base}-luz`;
  const volumen = `${base}-volumen`;
  const difuso = `${base}-difuso`;
  const trazos = RELIEVE[vista];
  const lados = [undefined, ESPEJO];
  return (
    <g aria-hidden className="cuerpo-detalle">
      <defs>
        <clipPath id={silueta}>
          <Silueta vista={vista} />
        </clipPath>
        <linearGradient
          id={luz}
          gradientUnits="userSpaceOnUse"
          x1="90"
          y1="40"
          x2="320"
          y2="890"
        >
          <stop offset="0" stopColor="#fff" stopOpacity="0.22" />
          <stop offset="0.4" stopColor="#fff" stopOpacity="0" />
          <stop offset="1" stopColor="#0f1e1a" stopOpacity="0.28" />
        </linearGradient>
        <filter id={volumen} x="-5%" y="-5%" width="110%" height="110%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="8" result="b" />
          <feOffset in="b" dx="-5" dy="-4" result="bs" />
          <feComposite in="SourceAlpha" in2="bs" operator="out" result="borde" />
          <feFlood floodColor="#0f1e1a" floodOpacity="0.62" />
          <feComposite in2="borde" operator="in" result="sombra" />
          <feGaussianBlur in="SourceAlpha" stdDeviation="2.5" result="b2" />
          <feOffset in="b2" dx="2.5" dy="2" result="bl" />
          <feComposite in="SourceAlpha" in2="bl" operator="out" result="filo" />
          <feFlood floodColor="#fff" floodOpacity="0.55" />
          <feComposite in2="filo" operator="in" result="brillo" />
          <feMerge>
            <feMergeNode in="sombra" />
            <feMergeNode in="brillo" />
          </feMerge>
        </filter>
        <filter id={difuso} x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur stdDeviation="2.2" />
        </filter>
      </defs>
      <g filter={`url(#${volumen})`}>
        <Silueta vista={vista} />
      </g>
      <g clipPath={`url(#${silueta})`}>
        <rect width={BODY_VIEWBOX.w} height={BODY_VIEWBOX.h} fill={`url(#${luz})`} />
        <g className="surco-anatomico" filter={`url(#${difuso})`}>
          {lados.map((transform) => (
            <g key={transform ?? 'izq'} transform={transform}>
              {trazos.map((d) => (
                <path key={d} d={d} />
              ))}
            </g>
          ))}
        </g>
        <path className="trazo-anatomico" d={CENTRO[vista]} pathLength={1} />
        {lados.map((transform) => (
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
