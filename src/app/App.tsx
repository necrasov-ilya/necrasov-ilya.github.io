import { DesktopManagerProvider } from '../features/desktop-manager/model/DesktopManagerContext';
import { Desktop } from '../widgets/desktop/Desktop';

function App() {
  return (
    <DesktopManagerProvider>
      <Desktop />
    </DesktopManagerProvider>
  );
}

export default App;
