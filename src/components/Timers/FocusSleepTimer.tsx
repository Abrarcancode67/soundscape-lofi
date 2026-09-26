import React, { useState, useEffect } from 'react';
import { soundScapeEngine } from '../../audio/SoundScapeEngine';
import { TimerType } from '../../types/soundscape';
import { Timer, Moon, Play, Pause, RotateCcw, Bell, Check, Sparkles } from 'lucide-react';

interface FocusSleepTimerProps {
  onTimerEnd?: () => void;
  accentColor?: string;
  isModal?: boolean;
}

export const FocusSleepTimer: React.FC<FocusSleepTimerProps> = ({ onTimerEnd, isModal = false }) => {
  const [activeMode, setActiveMode] = useState<'pomodoro' | 'sleep'>('pomodoro');
  
  // Pomodoro state
  const [pomoType, setPomoType] = useState<'work' | 'break'>('work');
  const [pomoWorkMins, setPomoWorkMins] = useState<number>(25);
  const [pomoBreakMins, setPomoBreakMins] = useState<number>(5);
  const [pomoSecondsLeft, setPomoSecondsLeft] = useState<number>(25 * 60);
  const [isPomoRunning, setIsPomoRunning] = useState<boolean>(false);
  const [pomoRoundsCompleted, setPomoRoundsCompleted] = useState<number>(0);

  // Sleep Timer state
  const [sleepMinutes, setSleepMinutes] = useState<number>(30);
  const [sleepSecondsLeft, setSleepSecondsLeft] = useState<number>(30 * 60);
  const [isSleepRunning, setIsSleepRunning] = useState<boolean>(false);
  const [isFadingOut, setIsFadingOut] = useState<boolean>(false);

  // Pomodoro Interval Tick
  useEffect(() => {
    let interval: any;
    if (isPomoRunning && pomoSecondsLeft > 0) {
      interval = setInterval(() => {
        setPomoSecondsLeft(sec => sec - 1);
      }, 1000);
    } else if (isPomoRunning && pomoSecondsLeft === 0) {
      // Completed round
      soundScapeEngine.playGentleChime();
      if (pomoType === 'work') {
        setPomoRoundsCompleted(r => r + 1);
        setPomoType('break');
        setPomoSecondsLeft(pomoBreakMins * 60);
      } else {
        setPomoType('work');
        setPomoSecondsLeft(pomoWorkMins * 60);
      }
    }
    return () => clearInterval(interval);
  }, [isPomoRunning, pomoSecondsLeft, pomoType, pomoWorkMins, pomoBreakMins]);

  // Sleep Timer Interval Tick
  useEffect(() => {
    let interval: any;
    if (isSleepRunning && sleepSecondsLeft > 0) {
      interval = setInterval(() => {
        setSleepSecondsLeft(sec => {
          // Trigger gentle 30s fade out when exactly 30s remain
          if (sec === 30 && !isFadingOut) {
            setIsFadingOut(true);
            soundScapeEngine.executeSleepFadeOut(30, () => {
              setIsSleepRunning(false);
              setIsFadingOut(false);
              if (onTimerEnd) onTimerEnd();
            });
          }
          return sec - 1;
        });
      }, 1000);
    } else if (isSleepRunning && sleepSecondsLeft <= 0) {
      setIsSleepRunning(false);
    }
    return () => clearInterval(interval);
  }, [isSleepRunning, sleepSecondsLeft, isFadingOut, onTimerEnd]);

  const togglePomo = () => {
    if (!isPomoRunning) {
      soundScapeEngine.start();
    }
    setIsPomoRunning(!isPomoRunning);
  };

  const resetPomo = () => {
    setIsPomoRunning(false);
    setPomoSecondsLeft(pomoType === 'work' ? pomoWorkMins * 60 : pomoBreakMins * 60);
  };

  const startSleep = (mins: number) => {
    soundScapeEngine.start();
    setSleepMinutes(mins);
    setSleepSecondsLeft(mins * 60);
    setIsSleepRunning(true);
    setIsFadingOut(false);
  };

  const cancelSleep = () => {
    setIsSleepRunning(false);
    setIsFadingOut(false);
    setSleepSecondsLeft(sleepMinutes * 60);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className={isModal ? "space-y-4" : "p-4 bg-[var(--paper-card)] border border-[var(--border)] rounded-2xl space-y-4 shadow-sm"}>
      {/* Mode Switcher */}
      <div className="flex bg-[var(--paper-elevated)] p-1 rounded-xl">
        <button
          onClick={() => setActiveMode('pomodoro')}
          className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition flex items-center justify-center gap-1.5 ${
            activeMode === 'pomodoro'
              ? 'bg-[var(--accent)] text-slate-950 shadow-xs'
              : 'text-[var(--ink-muted)] hover:text-white'
          }`}
        >
          <Timer className="w-3.5 h-3.5" />
          <span>Pomodoro Focus</span>
        </button>
        <button
          onClick={() => setActiveMode('sleep')}
          className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition flex items-center justify-center gap-1.5 ${
            activeMode === 'sleep'
              ? 'bg-[var(--accent)] text-slate-950 shadow-xs'
              : 'text-[var(--ink-muted)] hover:text-white'
          }`}
        >
          <Moon className="w-3.5 h-3.5" />
          <span>Sleep & Drift</span>
        </button>
      </div>

      {activeMode === 'pomodoro' ? (
        <div className="space-y-4 text-center">
          {/* Work / Break Indicator */}
          <div className="flex items-center justify-center gap-2">
            <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
              pomoType === 'work'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
            }`}>
              {pomoType === 'work' ? 'Focus Interval' : 'Resting Break'}
            </span>
            <span className="text-[11px] text-[var(--ink-muted)] font-mono">
              Round #{pomoRoundsCompleted + 1}
            </span>
          </div>

          {/* Clock Display */}
          <div className="font-mono-tabular text-4xl lg:text-5xl font-extrabold text-[var(--ink)] tracking-tight">
            {formatTime(pomoSecondsLeft)}
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={togglePomo}
              className="px-5 py-2 bg-[var(--accent)] hover:opacity-90 text-slate-950 font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5"
            >
              {isPomoRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-slate-950" />}
              <span>{isPomoRunning ? 'Pause' : 'Start Focus'}</span>
            </button>
            <button
              onClick={resetPomo}
              className="p-2 bg-[var(--paper-elevated)] hover:bg-slate-700 text-slate-300 rounded-xl transition"
              title="Reset Timer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Interval Length Customizer */}
          <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-[var(--border)] text-left">
            <div>
              <span className="text-[10px] text-[var(--ink-muted)]">Work (mins)</span>
              <div className="flex gap-1 mt-1">
                {[20, 25, 45, 50].map(m => (
                  <button
                    key={m}
                    onClick={() => {
                      setPomoWorkMins(m);
                      if (pomoType === 'work' && !isPomoRunning) setPomoSecondsLeft(m * 60);
                    }}
                    className={`flex-1 py-1 rounded text-[10px] font-mono font-bold ${
                      pomoWorkMins === m ? 'bg-[var(--accent)] text-slate-950' : 'bg-[var(--paper-elevated)] text-[var(--ink-muted)]'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <span className="text-[10px] text-[var(--ink-muted)]">Break (mins)</span>
              <div className="flex gap-1 mt-1">
                {[5, 10, 15].map(m => (
                  <button
                    key={m}
                    onClick={() => {
                      setPomoBreakMins(m);
                      if (pomoType === 'break' && !isPomoRunning) setPomoSecondsLeft(m * 60);
                    }}
                    className={`flex-1 py-1 rounded text-[10px] font-mono font-bold ${
                      pomoBreakMins === m ? 'bg-[var(--accent)] text-slate-950' : 'bg-[var(--paper-elevated)] text-[var(--ink-muted)]'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4 text-center">
          <div className="text-xs text-[var(--ink-muted)]">
            Executes a gentle 30-second volume fade-out when time expires.
          </div>

          <div className="font-mono-tabular text-4xl lg:text-5xl font-extrabold text-[var(--ink)] tracking-tight">
            {formatTime(sleepSecondsLeft)}
          </div>

          {isFadingOut && (
            <div className="text-xs text-amber-400 font-semibold flex items-center justify-center gap-1 animate-pulse">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Gently fading out ambient mix...</span>
            </div>
          )}

          {/* Quick preset timers */}
          <div className="grid grid-cols-4 gap-2">
            {[15, 30, 45, 60].map(mins => (
              <button
                key={mins}
                onClick={() => startSleep(mins)}
                className={`py-2 rounded-xl text-xs font-mono font-bold transition ${
                  isSleepRunning && sleepMinutes === mins
                    ? 'bg-[var(--accent)] text-slate-950 shadow-xs'
                    : 'bg-[var(--paper-elevated)] text-[var(--ink)] hover:bg-slate-700'
                }`}
              >
                {mins}m
              </button>
            ))}
          </div>

          {isSleepRunning && (
            <button
              onClick={cancelSleep}
              className="w-full py-2 bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-xl text-xs font-bold hover:bg-rose-500/30 transition"
            >
              Cancel Sleep Timer
            </button>
          )}
        </div>
      )}
    </div>
  );
};
