import { useEffect, useRef, useState } from 'react';
import { ChevronDown, ChevronUp, Target } from 'lucide-react';
import { api } from '../../lib/api';
import type { ProfileStats } from '../../types';

const GOAL_KEY = 'dizzy-daily-goal';

function loadGoal(): number {
  const raw = localStorage.getItem(GOAL_KEY);
  const n = parseInt(raw ?? '', 10);
  return isNaN(n) || n < 1 ? 5 : n;
}

export function StatsPanel({ profileId }: { profileId: string | null }) {
  const [stats, setStats] = useState<ProfileStats | null>(null);
  const [goal, setGoal] = useState<number>(loadGoal);
  const [editingGoal, setEditingGoal] = useState(false);
  const [goalInput, setGoalInput] = useState('');
  const [expanded, setExpanded] = useState(true);
  const goalRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!profileId) { setStats(null); return; }
    api.profiles.stats(profileId).then(setStats).catch(() => setStats(null));
  }, [profileId]);

  const handleGoalSave = () => {
    const n = parseInt(goalInput, 10);
    if (!isNaN(n) && n >= 1) {
      setGoal(n);
      localStorage.setItem(GOAL_KEY, String(n));
    }
    setEditingGoal(false);
  };

  const startEditGoal = () => {
    setGoalInput(String(goal));
    setEditingGoal(true);
    setTimeout(() => goalRef.current?.select(), 0);
  };

  if (!stats) return null;

  const todayPct = Math.min(100, (stats.today / goal) * 100);
  const weekPct = Math.min(100, (stats.this_week / (goal * 7)) * 100);
  const todayDone = stats.today >= goal;

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      {/* Collapsible header */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-2.5 bg-card hover:bg-secondary/50 transition-colors text-sm font-medium"
      >
        <span className="flex items-center gap-2">
          📊 Stats &amp; Goals
          {todayDone && <span className="text-xs bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded font-semibold">Goal hit!</span>}
        </span>
        {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
      </button>

      {expanded && (
        <div className="p-4 grid grid-cols-2 gap-4 border-t border-border bg-card/50">
          {/* Daily goal progress */}
          <div className="col-span-2">
            <div className="flex items-center justify-between mb-1.5 text-xs text-muted-foreground">
              <span className="font-medium text-foreground">Today's Applications</span>
              <span className="flex items-center gap-1">
                {editingGoal ? (
                  <form
                    onSubmit={(e) => { e.preventDefault(); handleGoalSave(); }}
                    className="flex items-center gap-1"
                  >
                    <input
                      ref={goalRef}
                      type="number"
                      min={1}
                      max={99}
                      value={goalInput}
                      onChange={(e) => setGoalInput(e.target.value)}
                      onBlur={handleGoalSave}
                      className="w-12 px-1 py-0.5 text-xs bg-background border border-border rounded text-center"
                    />
                    <span>/ day goal</span>
                  </form>
                ) : (
                  <button
                    onClick={startEditGoal}
                    className="flex items-center gap-1 hover:text-foreground transition-colors"
                    title="Edit daily goal"
                  >
                    <Target className="w-3 h-3" />
                    Goal: {goal}/day
                  </button>
                )}
              </span>
            </div>
            <div className="h-2.5 bg-secondary rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${todayDone ? 'bg-green-500' : 'bg-primary'}`}
                style={{ width: `${todayPct}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>{stats.today} applied today</span>
              <span>{todayDone ? '✓ Done!' : `${goal - stats.today} to go`}</span>
            </div>
          </div>

          {/* This week progress */}
          <div className="col-span-2">
            <div className="flex items-center justify-between mb-1.5 text-xs text-muted-foreground">
              <span className="font-medium text-foreground">This Week</span>
              <span>{goal * 7} weekly target</span>
            </div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full transition-all duration-500"
                style={{ width: `${weekPct}%` }}
              />
            </div>
            <div className="text-xs text-muted-foreground mt-1">{stats.this_week} this week</div>
          </div>

          {/* Key numbers */}
          <div className="space-y-1 text-sm">
            <div className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-2">Totals</div>
            <div className="flex justify-between">
              <span className="text-muted-foreground text-xs">Total applied</span>
              <span className="font-semibold">{stats.total_applications}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground text-xs">Response rate</span>
              <span className={`font-semibold ${stats.response_rate >= 20 ? 'text-green-400' : stats.response_rate >= 10 ? 'text-yellow-400' : 'text-muted-foreground'}`}>
                {stats.response_rate.toFixed(1)}%
              </span>
            </div>
            {stats.top_variant && (
              <div className="flex justify-between">
                <span className="text-muted-foreground text-xs">Top variant</span>
                <span className="font-medium text-xs truncate max-w-24 text-right" title={stats.top_variant}>
                  {stats.top_variant}
                </span>
              </div>
            )}
          </div>

          {/* Top ATS */}
          {stats.top_ats.length > 0 && (
            <div>
              <div className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-2">Top ATS</div>
              <div className="space-y-1.5">
                {stats.top_ats.map((ats) => {
                  const max = stats.top_ats[0].count;
                  const pct = (ats.count / max) * 100;
                  return (
                    <div key={ats.platform}>
                      <div className="flex justify-between text-xs mb-0.5">
                        <span className="text-muted-foreground truncate max-w-20" title={ats.platform}>
                          {ats.platform}
                        </span>
                        <span className="font-medium">{ats.count}</span>
                      </div>
                      <div className="h-1 bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full bg-orange-400 rounded-full"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
