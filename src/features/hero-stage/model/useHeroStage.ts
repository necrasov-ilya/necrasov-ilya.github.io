import { useEffect, useMemo, useState } from 'react';
import { heroSceneCombos } from '../../../entities/application/model/heroScenes';

const INTRO_STEP_MS = 320;
const INTRO_FINAL_HOLD_MS = 420;

export function useHeroStage(desktopActive: boolean) {
  const [introIndex, setIntroIndex] = useState(0);
  const [isIntroComplete, setIsIntroComplete] = useState(false);
  const [showIntro, setShowIntro] = useState(false);
  const [isCompactViewport, setIsCompactViewport] = useState(() => {
    if (typeof window === 'undefined') {
      return false;
    }

    return window.matchMedia('(max-width: 960px), (max-height: 700px)').matches;
  });
  const [isWindowActive, setIsWindowActive] = useState(() => {
    if (typeof document === 'undefined') {
      return true;
    }

    return !document.hidden && document.hasFocus();
  });

  const [selectedScene] = useState(() => {
    const index = Math.floor(Math.random() * heroSceneCombos.length);
    return heroSceneCombos[index];
  });

  const introSequence = useMemo(
    () => [
      { id: `${selectedScene.id}-light`, src: selectedScene.lightIntro },
      { id: `${selectedScene.id}-dark`, src: selectedScene.darkIntro },
      { id: `${selectedScene.id}-light-return`, src: selectedScene.lightIntro },
    ],
    [selectedScene],
  );

  const introDurationMs = useMemo(
    () => INTRO_STEP_MS * Math.max(introSequence.length - 1, 0) + INTRO_FINAL_HOLD_MS,
    [introSequence.length],
  );

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    const mediaQuery = window.matchMedia('(max-width: 960px), (max-height: 700px)');

    const applyViewportMode = (event: MediaQueryList | MediaQueryListEvent) => {
      setIsCompactViewport(event.matches);
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', applyViewportMode);

      return () => {
        mediaQuery.removeEventListener('change', applyViewportMode);
      };
    }

    mediaQuery.addListener(applyViewportMode);

    return () => {
      mediaQuery.removeListener(applyViewportMode);
    };
  }, []);

  useEffect(() => {
    if (!desktopActive || typeof window === 'undefined') {
      return undefined;
    }

    let stepTimer = 0;
    let completeTimer = 0;

    const kickoffTimer = window.setTimeout(() => {
      setIntroIndex(0);
      setIsIntroComplete(false);
      setShowIntro(true);

      stepTimer = window.setInterval(() => {
        setIntroIndex((current) => {
          if (current >= introSequence.length - 1) {
            return current;
          }

          return current + 1;
        });
      }, INTRO_STEP_MS);

      completeTimer = window.setTimeout(() => {
        setIsIntroComplete(true);
      }, introDurationMs);
    }, 0);

    return () => {
      window.clearTimeout(kickoffTimer);
      window.clearInterval(stepTimer);
      window.clearTimeout(completeTimer);
    };
  }, [desktopActive, introDurationMs, introSequence.length]);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return undefined;
    }

    const syncActivity = () => {
      setIsWindowActive(!document.hidden && document.hasFocus());
    };

    window.addEventListener('focus', syncActivity);
    window.addEventListener('blur', syncActivity);
    document.addEventListener('visibilitychange', syncActivity);

    return () => {
      window.removeEventListener('focus', syncActivity);
      window.removeEventListener('blur', syncActivity);
      document.removeEventListener('visibilitychange', syncActivity);
    };
  }, []);

  return {
    introIndex,
    introSequence,
    isCompactViewport,
    isIntroComplete,
    isWindowActive,
    selectedScene,
    showIntro,
    setShowIntro,
  };
}
