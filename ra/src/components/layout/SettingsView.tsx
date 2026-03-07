import { useEffect, useState } from 'react';
import { Save } from 'lucide-react';

type ApiStatus = 'checking' | 'up' | 'down';

export function SettingsView() {
  const [apiStatus, setApiStatus] = useState<ApiStatus>('checking');

  const checkApi = () => {
    setApiStatus('checking');
    fetch('http://127.0.0.1:9741/health', { signal: AbortSignal.timeout(2000) })
      .then((r) => setApiStatus(r.ok ? 'up' : 'down'))
      .catch(() => setApiStatus('down'));
  };

  useEffect(() => {
    checkApi();
  }, []);

  const statusDot = {
    checking: 'bg-yellow-400 animate-pulse',
    up: 'bg-green-500',
    down: 'bg-red-500',
  }[apiStatus];

  const statusLabel = {
    checking: 'Checking…',
    up: 'Running on port 9741',
    down: 'Not reachable — is Ra running?',
  }[apiStatus];

  return (
    <div className="p-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">⚙️ Settings</h1>
          <p className="text-sm text-muted-foreground">
            Configure Ra and manage your preferences
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
          <Save className="w-4 h-4" />
          Save
        </button>
      </div>

      <div className="space-y-6">
        {/* General Settings */}
        <section className="p-5 bg-card rounded-lg border border-border">
          <h2 className="text-lg font-semibold mb-4">General Settings</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Theme</p>
                <p className="text-sm text-muted-foreground">Choose your preferred appearance</p>
              </div>
              <select className="px-3 py-2 bg-secondary border border-border rounded-md text-sm">
                <option>🌙 Dark</option>
                <option>☀️ Light</option>
                <option>🌗 Auto</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Daily Application Goal</p>
                <p className="text-sm text-muted-foreground">Target applications per day</p>
              </div>
              <input
                type="number"
                defaultValue={10}
                className="w-20 px-3 py-2 bg-secondary border border-border rounded-md text-sm text-center"
              />
            </div>
          </div>
        </section>

        {/* Horus Integration */}
        <section className="p-5 bg-card rounded-lg border border-border">
          <h2 className="text-lg font-semibold mb-4">Horus Integration</h2>
          <div className="space-y-4">
            {/* Hapi's Flow status */}
            <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
              <div>
                <p className="font-medium flex items-center gap-2">
                  Hapi's Flow — Local API
                  <span className={`w-2 h-2 rounded-full ${statusDot}`} />
                </p>
                <p className="text-sm text-muted-foreground">{statusLabel}</p>
              </div>
              <button
                onClick={checkApi}
                className="px-3 py-2 text-sm bg-secondary hover:bg-secondary/80 rounded-md transition-colors"
              >
                {apiStatus === 'checking' ? 'Checking…' : 'Recheck'}
              </button>
            </div>

            {/* Extension status — static until Horus is built */}
            <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
              <div>
                <p className="font-medium flex items-center gap-2">
                  Horus Browser Extension
                  <span className="w-2 h-2 bg-muted-foreground/40 rounded-full" />
                </p>
                <p className="text-sm text-muted-foreground">Not yet installed</p>
              </div>
              <button className="px-3 py-2 text-sm bg-secondary hover:bg-secondary/80 rounded-md transition-colors">
                Install Guide
              </button>
            </div>
          </div>
        </section>

        {/* Backup & Export */}
        <section className="p-5 bg-card rounded-lg border border-border">
          <h2 className="text-lg font-semibold mb-4">Backup & Export</h2>
          <div className="space-y-3">
            <button className="w-full flex items-center justify-between p-3 bg-secondary hover:bg-secondary/80 rounded-md transition-colors">
              <span>Export All Data (JSON)</span>
              <span className="text-sm text-muted-foreground">↓</span>
            </button>
            <button className="w-full flex items-center justify-between p-3 bg-secondary hover:bg-secondary/80 rounded-md transition-colors">
              <span>Export to CSV</span>
              <span className="text-sm text-muted-foreground">↓</span>
            </button>
            <button className="w-full flex items-center justify-between p-3 bg-secondary hover:bg-secondary/80 rounded-md transition-colors">
              <span>Backup Database</span>
              <span className="text-sm text-muted-foreground">↓</span>
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
