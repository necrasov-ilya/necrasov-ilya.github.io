import { DesktopSurface } from './DesktopSurface';
import { HeroStage } from '../hero-stage/HeroStage';

export function Desktop() {
  return (
    <main className="page-shell">
      <div aria-hidden="true" className="page-noise" />
      <HeroStage>
        <DesktopSurface />
      </HeroStage>
    </main>
  );
}
