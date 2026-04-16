import type { AppIconKey } from '../../types/desktop';

interface AppIconProps {
  icon: AppIconKey;
  size?: number;
}

const iconMap: Record<AppIconKey, string> = {
  profile:
    'M12 3.5a3.5 3.5 0 1 1 0 7a3.5 3.5 0 0 1 0-7Zm0 9.75c4.78 0 8 2.17 8 4.25V20.5H4v-3c0-2.08 3.22-4.25 8-4.25Z',
  briefcase:
    'M8.5 5.5h7a2 2 0 0 1 2 2v1.25H21V19a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 19V8.75h3.5V7.5a2 2 0 0 1 2-2Zm0 3.25h7V7.5h-7v1.25Zm-2.5 3.5h12',
  article:
    'M6 5.5h12A1.5 1.5 0 0 1 19.5 7v10A1.5 1.5 0 0 1 18 18.5H6A1.5 1.5 0 0 1 4.5 17V7A1.5 1.5 0 0 1 6 5.5Zm2 3h8m-8 3h8m-8 3h5',
  system:
    'M7 5.5h10A1.5 1.5 0 0 1 18.5 7v10A1.5 1.5 0 0 1 17 18.5H7A1.5 1.5 0 0 1 5.5 17V7A1.5 1.5 0 0 1 7 5.5Zm2.5 3h5m-7 3h9m-9 3h6M9 2.5v2M15 2.5v2M9 19.5v2M15 19.5v2M2.5 9h2M2.5 15h2M19.5 9h2M19.5 15h2',
  mail:
    'M4.5 6.5h15A1.5 1.5 0 0 1 21 8v8a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 16V8a1.5 1.5 0 0 1 1.5-1.5Zm0 1.5 7.5 5 7.5-5',
  gamepad:
    'M8 8.5h8a3.5 3.5 0 0 1 3.46 4.02l-.7 4.25a2 2 0 0 1-3.15 1.25l-1.74-1.23H10.1l-1.72 1.23a2 2 0 0 1-3.15-1.25l-.7-4.25A3.5 3.5 0 0 1 8 8.5Zm-1.5 3.5h3m-1.5-1.5v3m8-1h.01m2 0h.01',
  target:
    'M12 4.5a7.5 7.5 0 1 1 0 15a7.5 7.5 0 0 1 0-15Zm0 3a4.5 4.5 0 1 0 0 9a4.5 4.5 0 0 0 0-9Zm0 2.5a2 2 0 1 1 0 4a2 2 0 0 1 0-4ZM12 2v2m0 16v2m10-10h-2M4 12H2',
};

export function AppIcon({ icon, size = 20 }: AppIconProps) {
  return (
    <svg
      aria-hidden="true"
      className="app-icon-svg"
      fill="none"
      height={size}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.5"
      viewBox="0 0 24 24"
      width={size}
    >
      <path d={iconMap[icon]} />
    </svg>
  );
}
