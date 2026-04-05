import { motion, useMotionTemplate, useMotionValue, useSpring } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import { heroSceneCombos } from './content/heroMedia';

const introStepMs = 320;
const introFinalHoldMs = 420;
const introFadeMs = 360;

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function App() {
  const [introIndex, setIntroIndex] = useState(0);
  const [isIntroComplete, setIsIntroComplete] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const [isCompactViewport, setIsCompactViewport] = useState(false);

  const selectedScene = useMemo(() => {
    const index = Math.floor(Math.random() * heroSceneCombos.length);
    return heroSceneCombos[index];
  }, []);
  const introSequence = useMemo(
    () => [
      { id: `${selectedScene.id}-light`, src: selectedScene.lightIntro },
      { id: `${selectedScene.id}-dark`, src: selectedScene.darkIntro },
      { id: `${selectedScene.id}-light-return`, src: selectedScene.lightIntro },
    ],
    [selectedScene],
  );
  const introDurationMs = useMemo(
    () => introStepMs * Math.max(introSequence.length - 1, 0) + introFinalHoldMs,
    [introSequence.length],
  );

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
    if (typeof window === 'undefined') {
      return undefined;
    }

    const mediaQuery = window.matchMedia('(max-width: 860px), (max-height: 620px)');

    const applyViewportMode = (event) => {
      setIsCompactViewport(event.matches);
    };

    setIsCompactViewport(mediaQuery.matches);

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
    const stepTimer = window.setInterval(() => {
      setIntroIndex((current) => {
        if (current >= introSequence.length - 1) {
          return current;
        }

        return current + 1;
      });
    }, introStepMs);

    const completeTimer = window.setTimeout(() => {
      setIsIntroComplete(true);
    }, introDurationMs);

    return () => {
      window.clearInterval(stepTimer);
      window.clearTimeout(completeTimer);
    };
  }, [introSequence.length]);

  useEffect(() => {
    if (!isIntroComplete) {
      splitTarget.set(50);
      return undefined;
    }

    const canTrackPointer =
      typeof window !== 'undefined' &&
      window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    if (!canTrackPointer) {
      splitTarget.set(50);
      return undefined;
    }

    const handlePointerMove = (event) => {
      const next = (event.clientY / window.innerHeight) * 100;
      splitTarget.set(clamp(next, 24, 76));
    };

    const handlePointerLeave = () => {
      splitTarget.set(50);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerleave', handlePointerLeave);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerleave', handlePointerLeave);
    };
  }, [isIntroComplete, splitTarget]);

  return (
    <main className="page-shell">
      <div className="page-noise" aria-hidden="true" />
      <h1 className="sr-only">NKSV hero</h1>

      <section className="hero-stage" aria-label="NKSV split hero">
        <div className="hero-stage__frame">
          <motion.div className="hero-scene hero-scene--light" style={{ clipPath: topClip }}>
            <div
              className="hero-scene__still"
              style={{ backgroundImage: `url(${selectedScene.lightStill})` }}
            />
            <div className="hero-scene__wash hero-scene__wash--light" />
          </motion.div>

          <motion.div className="hero-scene hero-scene--dark" style={{ clipPath: bottomClip }}>
            <div
              className="hero-scene__still"
              style={{ backgroundImage: `url(${selectedScene.darkStill})` }}
            />
            <div className="hero-scene__wash hero-scene__wash--dark" />
          </motion.div>

          {!isCompactViewport && (
            <>
              <motion.div
                className="hero-logo hero-logo--full hero-logo--filled"
                style={{ clipPath: topClip }}
                initial={false}
                animate={
                  isIntroComplete
                    ? { opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }
                    : { opacity: 0, scale: 0.92, y: 10, filter: 'blur(6px)' }
                }
                transition={{
                  duration: 0.46,
                  ease: [0.22, 1, 0.36, 1],
                  delay: isIntroComplete ? 0.05 : 0,
                }}
              >
                <img src={selectedScene.fullFilledLogo} alt="" aria-hidden="true" />
              </motion.div>

              <motion.div
                className="hero-logo hero-logo--full hero-logo--outline"
                style={{ clipPath: bottomClip }}
                initial={false}
                animate={
                  isIntroComplete
                    ? { opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }
                    : { opacity: 0, scale: 0.92, y: 10, filter: 'blur(6px)' }
                }
                transition={{
                  duration: 0.5,
                  ease: [0.22, 1, 0.36, 1],
                  delay: isIntroComplete ? 0.08 : 0,
                }}
              >
                <img src={selectedScene.fullOutlineLogo} alt="" aria-hidden="true" />
              </motion.div>
            </>
          )}

          {isCompactViewport && (
            <>
              <motion.div
                className="hero-logo hero-logo--mark-split hero-logo--filled"
                style={{ clipPath: topClip }}
                initial={false}
                animate={
                  isIntroComplete
                    ? { opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }
                    : { opacity: 0, scale: 0.92, y: 10, filter: 'blur(6px)' }
                }
                transition={{
                  duration: 0.42,
                  ease: [0.22, 1, 0.36, 1],
                  delay: isIntroComplete ? 0.05 : 0,
                }}
              >
                <img src={selectedScene.markFilledLogo} alt="" aria-hidden="true" />
              </motion.div>

              <motion.div
                className="hero-logo hero-logo--mark-split hero-logo--outline"
                style={{ clipPath: bottomClip }}
                initial={false}
                animate={
                  isIntroComplete
                    ? { opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }
                    : { opacity: 0, scale: 0.92, y: 10, filter: 'blur(6px)' }
                }
                transition={{
                  duration: 0.46,
                  ease: [0.22, 1, 0.36, 1],
                  delay: isIntroComplete ? 0.08 : 0,
                }}
              >
                <img src={selectedScene.markOutlineLogo} alt="" aria-hidden="true" />
              </motion.div>
            </>
          )}

          <motion.div
            className="hero-logo hero-logo--mark-intro"
            initial={false}
            animate={
              isIntroComplete
                ? { opacity: 0, scale: 0.86, y: 10, filter: 'blur(6px)' }
                : { opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }
            }
            transition={{
              duration: 0.42,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <img src={selectedScene.markFilledLogo} alt="NKSV" />
          </motion.div>

          <motion.div className="hero-seam" style={{ top: seamTop }} aria-hidden="true">
            <span className="hero-seam__line" />
            <span className="hero-seam__glow" />
          </motion.div>

          {showIntro && (
            <motion.div
              className="hero-intro"
              initial={{ opacity: 1 }}
              animate={{ opacity: isIntroComplete ? 0 : 1 }}
              transition={{ duration: introFadeMs / 1000, ease: [0.22, 1, 0.36, 1] }}
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
                  className={`hero-intro__shot ${introIndex === index ? 'is-active' : ''}`}
                  autoPlay
                  muted
                  playsInline
                  loop
                  preload="auto"
                  src={shot.src}
                />
              ))}
              <div className="hero-intro__veil" />
            </motion.div>
          )}
        </div>
      </section>
    </main>
  );
}

export default App;
