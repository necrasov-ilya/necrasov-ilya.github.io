import type { AppId } from '../../shared/types/desktop';
import './AppWindows.css';
import { BlogApp } from './BlogApp';
import { ContactApp } from './ContactApp';
import { GalleryApp } from './GalleryApp';
import { NeonXOApp } from './NeonXOApp';
import { ProjectsApp } from './ProjectsApp';
import { SignalHuntApp } from './SignalHuntApp';
import { SystemApp } from './SystemApp';

export function AppContent({ appId }: { appId: AppId }) {
  switch (appId) {
    case 'projects':
      return <ProjectsApp />;
    case 'blog':
      return <BlogApp />;
    case 'system':
      return <SystemApp />;
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
