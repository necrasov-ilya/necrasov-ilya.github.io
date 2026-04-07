import { useContext } from 'react';
import { DesktopManagerStore } from './desktopManagerStore';

export function useDesktopManager() {
  const context = useContext(DesktopManagerStore);

  if (!context) {
    throw new Error('useDesktopManager must be used inside DesktopManagerProvider');
  }

  return context;
}
