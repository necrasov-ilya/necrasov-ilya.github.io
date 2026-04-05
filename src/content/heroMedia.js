const logoBase = '/media/hero/logo';
const introBase = '/media/hero/intro/desktop';
const stillBase = '/media/hero/stills';

export const heroIntroShots = [
  { id: 'intro-light-01', src: `${introBase}/hero-intro-light-01.webm` },
  { id: 'intro-dark-01', src: `${introBase}/hero-intro-dark-01.webm` },
  { id: 'intro-light-02', src: `${introBase}/hero-intro-light-02.webm` },
  { id: 'intro-dark-02', src: `${introBase}/hero-intro-dark-02.webm` },
  { id: 'intro-light-03', src: `${introBase}/hero-intro-light-03.webm` },
  { id: 'intro-dark-03', src: `${introBase}/hero-intro-dark-03.webm` },
];

const baseLogos = {
  fullFilledLogo: `${logoBase}/logo-nksv-filled.svg`,
  fullOutlineLogo: `${logoBase}/logo-nksv-outline.svg`,
  markFilledLogo: `${logoBase}/logo-nksv-mark-filled.svg`,
  markOutlineLogo: `${logoBase}/logo-nksv-mark-outlined.svg`,
};

export const heroSceneCombos = [
  {
    id: 'pair-01',
    lightStill: `${stillBase}/light/hero-still-light-01.webp`,
    darkStill: `${stillBase}/dark/hero-still-dark-01.webp`,
    ...baseLogos,
  },
  {
    id: 'pair-02',
    lightStill: `${stillBase}/light/hero-still-light-02.webp`,
    darkStill: `${stillBase}/dark/hero-still-dark-02.webp`,
    ...baseLogos,
  },
  {
    id: 'pair-03',
    lightStill: `${stillBase}/light/hero-still-light-03.webp`,
    darkStill: `${stillBase}/dark/hero-still-dark-03.webp`,
    ...baseLogos,
  },
  {
    id: 'hybrid-02-03',
    lightStill: `${stillBase}/light/hero-still-light-03.webp`,
    darkStill: `${stillBase}/dark/hero-still-dark-02.webp`,
    ...baseLogos,
  },
];
