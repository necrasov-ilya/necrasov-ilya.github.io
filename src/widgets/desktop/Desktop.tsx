import { useEffect, useState } from 'react';
import { useDesktopManager } from '../../features/desktop-manager/model/useDesktopManager';
import type { AppId } from '../../shared/types/desktop';
import { DesktopSurface } from './DesktopSurface';
import { HeroStage } from '../hero-stage/HeroStage';
import { LandingHero } from '../landing-hero/LandingHero';

const DESKTOP_OUTRO_MS = 620;

export function Desktop() {
  const { resetDesktop, setStartMenuOpen } = useDesktopManager();
  const [isDesktopActive, setDesktopActive] = useState(false);
  const [isLeavingDesktop, setLeavingDesktop] = useState(false);
  const [entryAppId, setEntryAppId] = useState<AppId | null>(null);

  useEffect(() => {
    if (!isLeavingDesktop) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      resetDesktop();
      setEntryAppId(null);
      setDesktopActive(false);
      setLeavingDesktop(false);
    }, DESKTOP_OUTRO_MS);

    return () => {
      window.clearTimeout(timer);
    };
  }, [isLeavingDesktop, resetDesktop]);

  function handleOpenDesktop(appId?: AppId) {
    setEntryAppId(appId ?? null);
    setDesktopActive(true);
  }

  function handleReturnToLanding() {
    setStartMenuOpen(false);
    setLeavingDesktop(true);
  }

  const shellStateClass =
    isDesktopActive && !isLeavingDesktop ? 'is-desktop-active' : 'is-landing-active';

  return (
    <main className={`page-shell ${shellStateClass}`}>
      <div aria-hidden="true" className="page-noise" />
      <HeroStage
        desktopActive={isDesktopActive}
        isLeavingDesktop={isLeavingDesktop}
        landing={<LandingHero onOpenDesktop={handleOpenDesktop} />}
      >
        <DesktopSurface
          entryAppId={entryAppId}
          isLeavingDesktop={isLeavingDesktop}
          onEntryAppHandled={() => setEntryAppId(null)}
          onReturnToLanding={handleReturnToLanding}
        />
      </HeroStage>
    </main>
  );
}
