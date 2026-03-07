import { Save } from 'lucide-react';

export function SettingsView() {
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

      {/* Settings Sections */}
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
            <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
              <div>
                <p className="font-medium flex items-center gap-2">
                  Local API Server
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                </p>
                <p className="text-sm text-muted-foreground">Running on port 9741</p>
              </div>
              <button className="px-3 py-2 text-sm bg-secondary hover:bg-secondary/80 rounded-md transition-colors">
                Restart
              </button>
            </div>

            <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
              <div>
                <p className="font-medium flex items-center gap-2">
                  Browser Extension
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                </p>
                <p className="text-sm text-muted-foreground">Connected and active</p>
              </div>
              <button className="px-3 py-2 text-sm bg-secondary hover:bg-secondary/80 rounded-md transition-colors">
                Configure
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
              <span className="text-sm text-muted-foreground">3 days ago</span>
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
