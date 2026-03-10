import { useState } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { ProfilesView } from './components/profiles/ProfilesView';
import { ResumesView } from './components/resumes/ResumesView';
import { TrackerView } from './components/tracker/TrackerView';
import { TemplatesView } from './components/templates/TemplatesView';
import { SnippetsView } from './components/snippets/SnippetsView';
import { DiscoveryView } from './components/discovery/DiscoveryView';
import { SettingsView } from './components/layout/SettingsView';
import { ProfileProvider } from './lib/ProfileContext';
import type { ViewId } from './types';
import './App.css';

function App() {
  const [currentView, setCurrentView] = useState<ViewId>('profiles');
  const [isDarkMode, setIsDarkMode] = useState(true);

  const renderView = () => {
    switch (currentView) {
      case 'profiles':
        return <ProfilesView />;
      case 'resumes':
        return <ResumesView />;
      case 'tracker':
        return <TrackerView />;
      case 'templates':
        return <TemplatesView />;
      case 'snippets':
        return <SnippetsView />;
      case 'discovery':
        return <DiscoveryView />;
      case 'settings':
        return <SettingsView />;
    }
  };

  return (
    <div className={isDarkMode ? 'dark' : ''}>
      <ProfileProvider>
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
      </ProfileProvider>
    </div>
  );
}

export default App;
