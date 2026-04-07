export interface HeroSceneCombo {
  id: string;
  lightIntro: string;
  darkIntro: string;
  lightStill: string;
  darkStill: string;
  fullFilledLogo: string;
  fullOutlineLogo: string;
  markFilledLogo: string;
  markOutlineLogo: string;
}

const logoBase = '/media/hero/logo';
const introBase = '/media/hero/intro/desktop';
const stillBase = '/media/hero/stills';

const baseLogos = {
  fullFilledLogo: `${logoBase}/logo-nksv-filled.svg`,
  fullOutlineLogo: `${logoBase}/logo-nksv-outline.svg`,
  markFilledLogo: `${logoBase}/logo-nksv-mark-filled.svg`,
  markOutlineLogo: `${logoBase}/logo-nksv-mark-outlined.svg`,
};

export const heroSceneCombos: HeroSceneCombo[] = [
  {
    id: 'pair-01',
    lightIntro: `${introBase}/hero-intro-light-01.webm`,
    darkIntro: `${introBase}/hero-intro-dark-01.webm`,
    lightStill: `${stillBase}/light/hero-still-light-01.webp`,
    darkStill: `${stillBase}/dark/hero-still-dark-01.webp`,
    ...baseLogos,
  },
  {
    id: 'pair-02',
    lightIntro: `${introBase}/hero-intro-light-02.webm`,
    darkIntro: `${introBase}/hero-intro-dark-02.webm`,
    lightStill: `${stillBase}/light/hero-still-light-02.webp`,
    darkStill: `${stillBase}/dark/hero-still-dark-02.webp`,
    ...baseLogos,
  },
  {
    id: 'pair-03',
    lightIntro: `${introBase}/hero-intro-light-03.webm`,
    darkIntro: `${introBase}/hero-intro-dark-03.webm`,
    lightStill: `${stillBase}/light/hero-still-light-03.webp`,
    darkStill: `${stillBase}/dark/hero-still-dark-03.webp`,
    ...baseLogos,
  },
  {
    id: 'hybrid-02-03',
    lightIntro: `${introBase}/hero-intro-light-03.webm`,
    darkIntro: `${introBase}/hero-intro-dark-02.webm`,
    lightStill: `${stillBase}/light/hero-still-light-03.webp`,
    darkStill: `${stillBase}/dark/hero-still-dark-02.webp`,
    ...baseLogos,
  },
];
