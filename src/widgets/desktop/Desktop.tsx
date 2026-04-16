import { useState } from 'react';
import type { AppId } from '../../shared/types/desktop';
import { DesktopSurface } from './DesktopSurface';
import { HeroStage } from '../hero-stage/HeroStage';
import { LandingHero } from '../landing-hero/LandingHero';

export function Desktop() {
  const [isDesktopActive, setDesktopActive] = useState(false);
  const [entryAppId, setEntryAppId] = useState<AppId | null>(null);

  function handleOpenDesktop(appId?: AppId) {
    setEntryAppId(appId ?? null);
    setDesktopActive(true);
  }

  return (
    <main className="page-shell">
      <div aria-hidden="true" className="page-noise" />
      <HeroStage
        desktopActive={isDesktopActive}
        landing={<LandingHero onOpenDesktop={handleOpenDesktop} />}
      >
        <DesktopSurface entryAppId={entryAppId} onEntryAppHandled={() => setEntryAppId(null)} />
      </HeroStage>
    </main>
  );
}
