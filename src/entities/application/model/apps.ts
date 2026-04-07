import type { AppDefinition, AppId } from '../../../shared/types/desktop';

export const applicationCatalog: AppDefinition[] = [
  {
    id: 'about',
    icon: 'profile',
    title: 'About Me',
    shortTitle: 'About',
    subtitle: 'Базовое окно профиля',
    tint: '#C92455',
    defaultSize: { width: 980, height: 640 },
    launchLabel: 'Обо мне',
  },
  {
    id: 'projects',
    icon: 'briefcase',
    title: 'Casefiles',
    shortTitle: 'Cases',
    subtitle: 'Что я люблю проектировать',
    tint: '#ffb36b',
    defaultSize: { width: 920, height: 600 },
    launchLabel: 'Кейсы',
  },
  {
    id: 'lab',
    icon: 'brain',
    title: 'ML Lab',
    shortTitle: 'Lab',
    subtitle: 'Стек, процессы и интересы',
    tint: '#79e5d2',
    defaultSize: { width: 900, height: 600 },
    launchLabel: 'ML Lab',
  },
  {
    id: 'gallery',
    icon: 'gallery',
    title: 'Visual Assets',
    shortTitle: 'Gallery',
    subtitle: 'Материалы из public',
    tint: '#8fd0ff',
    defaultSize: { width: 930, height: 610 },
    launchLabel: 'Галерея',
  },
  {
    id: 'contact',
    icon: 'mail',
    title: 'Contact',
    shortTitle: 'Contact',
    subtitle: 'Как со мной связаться',
    tint: '#ff8aa7',
    defaultSize: { width: 720, height: 520 },
    launchLabel: 'Контакты',
  },
  {
    id: 'neon-xo',
    icon: 'gamepad',
    title: 'Neon XO',
    shortTitle: 'XO',
    subtitle: 'Мини-игра: крестики против модели',
    tint: '#ff79ab',
    defaultSize: { width: 520, height: 620 },
    launchLabel: 'Neon XO',
  },
  {
    id: 'signal-hunt',
    icon: 'target',
    title: 'Signal Hunt',
    shortTitle: 'Signal',
    subtitle: 'Мини-игра на реакцию',
    tint: '#6df0d7',
    defaultSize: { width: 640, height: 620 },
    launchLabel: 'Signal Hunt',
  },
];

export function getApplication(appId: AppId) {
  return applicationCatalog.find((app) => app.id === appId)!;
}
