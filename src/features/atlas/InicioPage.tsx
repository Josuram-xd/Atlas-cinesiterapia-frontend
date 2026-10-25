import { BodyFigure } from './body/BodyFigure';
import { BODY_VIEWBOX } from './body/geometry';

export function InicioPage() {
  const { x, y, w, h } = BODY_VIEWBOX;
  return (
    <>
      <h1 className="sr-only">Atlas de cinesiterapia</h1>
      <div className="grid flex-1 grid-cols-2 gap-6">
        {(['anterior', 'posterior'] as const).map((v) => (
          <svg key={v} viewBox={`${x} ${y} ${w} ${h}`} className="max-h-[80dvh] w-full">
            <BodyFigure vista={v} />
          </svg>
        ))}
      </div>
    </>
  );
}
