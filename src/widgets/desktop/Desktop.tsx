import { useState } from 'react';
import { DesktopSurface } from './DesktopSurface';
import { HeroStage } from '../hero-stage/HeroStage';

export function Desktop() {
  const [entryAppId, setEntryAppId] = useState<'portfolio' | null>('portfolio');

  return (
    <main className="page-shell is-desktop-active">
      <div aria-hidden="true" className="page-noise" />
      <HeroStage>
        <DesktopSurface
          entryAppId={entryAppId}
          onEntryAppHandled={() => setEntryAppId(null)}
        />
      </HeroStage>
    </main>
  );
}
