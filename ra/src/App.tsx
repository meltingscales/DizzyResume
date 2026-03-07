import { useState } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { ProfilesView } from './components/profiles/ProfilesView';
import { TrackerView } from './components/tracker/TrackerView';
import { TemplatesView } from './components/templates/TemplatesView';
import { SettingsView } from './components/layout/SettingsView';
import type { ViewId } from './types';
import './App.css';

function App() {
  const [currentView, setCurrentView] = useState<ViewId>('profiles');
  const [isDarkMode, setIsDarkMode] = useState(true);

  const renderView = () => {
    switch (currentView) {
      case 'profiles':
        return <ProfilesView />;
      case 'tracker':
        return <TrackerView />;
      case 'templates':
        return <TemplatesView />;
      case 'settings':
        return <SettingsView />;
      default:
        return (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">Coming soon...</p>
          </div>
        );
    }
  };

  return (
    <div className={isDarkMode ? 'dark' : ''}>
      <div className="flex h-screen bg-background text-foreground overflow-hidden">
        <Sidebar
          currentView={currentView}
          onViewChange={setCurrentView}
          isDarkMode={isDarkMode}
          onDarkModeToggle={() => setIsDarkMode(!isDarkMode)}
        />
        <main className="flex-1 overflow-auto scrollbar-thin">
          {renderView()}
        </main>
      </div>
    </div>
  );
}

export default App;
