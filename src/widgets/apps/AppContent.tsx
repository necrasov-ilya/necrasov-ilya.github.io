import type { AppId } from '../../shared/types/desktop';
import { AboutApp } from './AboutApp';
import './AppWindows.css';
import { ContactApp } from './ContactApp';
import { GalleryApp } from './GalleryApp';
import { LabApp } from './LabApp';
import { NeonXOApp } from './NeonXOApp';
import { ProjectsApp } from './ProjectsApp';
import { SignalHuntApp } from './SignalHuntApp';

export function AppContent({ appId }: { appId: AppId }) {
  switch (appId) {
    case 'about':
      return <AboutApp />;
    case 'projects':
      return <ProjectsApp />;
    case 'lab':
      return <LabApp />;
    case 'gallery':
      return <GalleryApp />;
    case 'contact':
      return <ContactApp />;
    case 'neon-xo':
      return <NeonXOApp />;
    case 'signal-hunt':
      return <SignalHuntApp />;
    default:
      return null;
  }
}
