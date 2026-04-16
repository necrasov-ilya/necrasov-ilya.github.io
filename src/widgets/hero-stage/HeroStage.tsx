import { useEffect, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react';
import { motion, useMotionTemplate, useMotionValue, useSpring } from 'framer-motion';
import { useHeroStage } from '../../features/hero-stage/model/useHeroStage';
import './HeroStage.css';

const INTRO_FADE_S = 0.36;

interface HeroStageProps {
  children: ReactNode;
  landing: ReactNode;
  desktopActive: boolean;
  isLeavingDesktop?: boolean;
}

export function HeroStage({
  children,
  landing,
  desktopActive,
  isLeavingDesktop = false,
}: HeroStageProps) {
  const {
    introIndex,
    introSequence,
    isCompactViewport,
    isIntroComplete,
    isWindowActive,
    selectedScene,
    showIntro,
    setShowIntro,
  } = useHeroStage(desktopActive);
  const shouldShowLanding = !desktopActive || isLeavingDesktop;
  const isDesktopReady = desktopActive && isIntroComplete && !isLeavingDesktop;
  const isDesktopVisible = desktopActive;
  const splitTarget = useMotionValue(50);
  const splitY = useSpring(splitTarget, {
    stiffness: 185,
    damping: 29,
    mass: 0.24,
  });

  const topClip = useMotionTemplate`polygon(0 0, 100% 0, 100% ${splitY}%, 0 ${splitY}%)`;
  const bottomClip = useMotionTemplate`polygon(0 ${splitY}%, 100% ${splitY}%, 100% 100%, 0 100%)`;
  const seamTop = useMotionTemplate`${splitY}%`;

  useEffect(() => {
    if (!desktopActive || isLeavingDesktop || !isWindowActive || isCompactViewport || !isIntroComplete) {
      splitTarget.set(50);
    }
  }, [
    desktopActive,
    isCompactViewport,
    isIntroComplete,
    isLeavingDesktop,
    isWindowActive,
    splitTarget,
  ]);

  function clamp(value: number, min: number, max: number) {
    return Math.min(Math.max(value, min), max);
  }

  function handlePointerMove(event: ReactPointerEvent<HTMLElement>) {
    if (!desktopActive || isLeavingDesktop || !isIntroComplete || isCompactViewport || !isWindowActive) {
      return;
    }

    if (typeof window !== 'undefined') {
      const canTrackPointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

      if (!canTrackPointer) {
        return;
      }
    }

    if ((event.target as HTMLElement).closest('[data-hero-lock="true"]')) {
      splitTarget.set(50);
      return;
    }

    const frameRect = event.currentTarget.getBoundingClientRect();
    const next = ((event.clientY - frameRect.top) / frameRect.height) * 100;
    splitTarget.set(clamp(next, 24, 76));
  }

  function handlePointerLeave() {
    if (!desktopActive || isLeavingDesktop || !isIntroComplete || isCompactViewport) {
      return;
    }

    splitTarget.set(50);
  }

  return (
    <section className="hero-stage" aria-label="NKSV split hero desktop">
      <div
        className={`hero-stage__frame ${isDesktopReady ? 'is-ready' : ''} ${
          desktopActive ? 'is-desktop-active' : 'is-landing-active'
        } ${isLeavingDesktop ? 'is-desktop-leaving' : ''}`}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
      >
        {desktopActive && (
          <>
            <motion.div
              animate={{ opacity: isLeavingDesktop ? 0.12 : 1 }}
              className="hero-scene hero-scene--light"
              style={{ clipPath: topClip }}
              transition={{ duration: 0.48, ease: [0.22, 1, 0.36, 1] }}
            >
              <div
                className="hero-scene__still"
                style={{ backgroundImage: `url(${selectedScene.lightStill})` }}
              />
              <div className="hero-scene__wash hero-scene__wash--light" />
            </motion.div>

            <motion.div
              animate={{ opacity: isLeavingDesktop ? 0.16 : 1 }}
              className="hero-scene hero-scene--dark"
              style={{ clipPath: bottomClip }}
              transition={{ duration: 0.48, ease: [0.22, 1, 0.36, 1] }}
            >
              <div
                className="hero-scene__still"
                style={{ backgroundImage: `url(${selectedScene.darkStill})` }}
              />
              <div className="hero-scene__wash hero-scene__wash--dark" />
            </motion.div>

            {!isCompactViewport && (
              <>
                <motion.div
                  className={`hero-logo hero-logo--full hero-logo--filled ${
                    isDesktopReady ? 'is-visible' : ''
                  }`}
                  initial={false}
                  animate={
                    isDesktopReady
                      ? { opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }
                      : { opacity: 0, scale: 0.92, y: 10, filter: 'blur(6px)' }
                  }
                  transition={{
                    duration: 0.46,
                    ease: [0.22, 1, 0.36, 1],
                    delay: isDesktopReady ? 0.05 : 0,
                  }}
                  style={{ clipPath: topClip }}
                >
                  <img src={selectedScene.fullFilledLogo} alt="" aria-hidden="true" />
                </motion.div>

                <motion.div
                  className={`hero-logo hero-logo--full hero-logo--outline ${
                    isDesktopReady ? 'is-visible' : ''
                  }`}
                  initial={false}
                  animate={
                    isDesktopReady
                      ? { opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }
                      : { opacity: 0, scale: 0.92, y: 10, filter: 'blur(6px)' }
                  }
                  transition={{
                    duration: 0.5,
                    ease: [0.22, 1, 0.36, 1],
                    delay: isDesktopReady ? 0.08 : 0,
                  }}
                  style={{ clipPath: bottomClip }}
                >
                  <img src={selectedScene.fullOutlineLogo} alt="" aria-hidden="true" />
                </motion.div>
              </>
            )}

            {isCompactViewport && (
              <>
                <motion.div
                  className={`hero-logo hero-logo--mark-split hero-logo--filled ${
                    isDesktopReady ? 'is-visible' : ''
                  }`}
                  initial={false}
                  animate={
                    isDesktopReady
                      ? { opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }
                      : { opacity: 0, scale: 0.92, y: 10, filter: 'blur(6px)' }
                  }
                  transition={{
                    duration: 0.42,
                    ease: [0.22, 1, 0.36, 1],
                    delay: isDesktopReady ? 0.05 : 0,
                  }}
                  style={{ clipPath: topClip }}
                >
                  <img src={selectedScene.markFilledLogo} alt="" aria-hidden="true" />
                </motion.div>

                <motion.div
                  className={`hero-logo hero-logo--mark-split hero-logo--outline ${
                    isDesktopReady ? 'is-visible' : ''
                  }`}
                  initial={false}
                  animate={
                    isDesktopReady
                      ? { opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }
                      : { opacity: 0, scale: 0.92, y: 10, filter: 'blur(6px)' }
                  }
                  transition={{
                    duration: 0.46,
                    ease: [0.22, 1, 0.36, 1],
                    delay: isDesktopReady ? 0.08 : 0,
                  }}
                  style={{ clipPath: bottomClip }}
                >
                  <img src={selectedScene.markOutlineLogo} alt="" aria-hidden="true" />
                </motion.div>
              </>
            )}

            <motion.div
              animate={{ opacity: isLeavingDesktop ? 0 : 1 }}
              className="hero-seam"
              style={{ top: seamTop }}
              transition={{ duration: 0.36, ease: [0.22, 1, 0.36, 1] }}
              aria-hidden="true"
            >
              <span className="hero-seam__line" />
              <span className="hero-seam__glow" />
            </motion.div>
          </>
        )}

        {shouldShowLanding && (
          <motion.div
            className="hero-stage__landing"
            initial={false}
            animate={
              isLeavingDesktop
                ? { opacity: 1, y: 0, scale: 1 }
                : { opacity: 1, y: 0, scale: 1 }
            }
            style={{ pointerEvents: desktopActive ? 'none' : 'auto' }}
            transition={{ duration: isLeavingDesktop ? 0.54 : 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            {landing}
          </motion.div>
        )}

        <motion.div
          className="hero-stage__desktop"
          initial={false}
          animate={
            isDesktopVisible
              ? isLeavingDesktop
                ? { opacity: 0, y: 36, scale: 0.968, filter: 'blur(10px)' }
                : { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }
              : { opacity: 0, y: 24, scale: 0.985, filter: 'blur(6px)' }
          }
          transition={{
            duration: isLeavingDesktop ? 0.58 : 0.48,
            ease: [0.22, 1, 0.36, 1],
            delay: isDesktopVisible && !isLeavingDesktop ? 0.04 : 0,
          }}
          style={{ pointerEvents: isDesktopReady ? 'auto' : 'none' }}
        >
          {children}
        </motion.div>

        {desktopActive && showIntro && !isLeavingDesktop && (
          <motion.div
            className="hero-intro"
            initial={{ opacity: 1 }}
            animate={{ opacity: isIntroComplete ? 0 : 1 }}
            transition={{ duration: INTRO_FADE_S, ease: [0.22, 1, 0.36, 1] }}
            onAnimationComplete={() => {
              if (isIntroComplete) {
                setShowIntro(false);
              }
            }}
            aria-hidden="true"
          >
            {introSequence.map((shot, index) => (
              <video
                key={shot.id}
                autoPlay
                className={`hero-intro__shot ${introIndex === index ? 'is-active' : ''}`}
                loop
                muted
                playsInline
                preload="auto"
                src={shot.src}
              />
            ))}
            <motion.div
              className="hero-logo hero-logo--mark-intro"
              initial={{ opacity: 0, scale: 0.92, y: 10, filter: 'blur(6px)' }}
              animate={
                isIntroComplete
                  ? { opacity: 0, scale: 0.86, y: 10, filter: 'blur(6px)' }
                  : { opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }
              }
              transition={{
                duration: INTRO_FADE_S,
                ease: [0.22, 1, 0.36, 1],
                delay: isIntroComplete ? 0 : 0.08,
              }}
            >
              <img src={selectedScene.markFilledLogo} alt="NKSV" />
            </motion.div>
            <div className="hero-intro__veil" />
          </motion.div>
        )}
      </div>
    </section>
  );
}
