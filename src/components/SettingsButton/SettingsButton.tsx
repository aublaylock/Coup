import { useEffect, useRef, useState } from 'react';
import styles from './SettingsButton.module.css';

const STORAGE_KEY = 'coup_settings';
const MIN_SCALE = 1;
const MAX_SCALE = 3;
const DEFAULT_SCALE = 2.5;

interface Settings {
  handScale: number;
  tableScale: number;
}

function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { handScale: DEFAULT_SCALE, tableScale: DEFAULT_SCALE, ...JSON.parse(raw) };
  } catch {
    /* ignore */
  }
  return { handScale: DEFAULT_SCALE, tableScale: DEFAULT_SCALE };
}

function saveSettings(settings: Settings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    /* ignore */
  }
}

/** Fixed top-right button (left of the info button) with card-size sliders.
 * The sliders drive CSS variables read by the Hand, Table, and modal styles. */
export function SettingsButton() {
  const [open, setOpen] = useState(false);
  const [settings, setSettings] = useState(loadSettings);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = document.documentElement.style;
    root.setProperty('--hand-card-scale', String(settings.handScale));
    root.setProperty('--table-card-scale', String(settings.tableScale));
    saveSettings(settings);
  }, [settings]);

  // Close when clicking outside the panel or pressing Escape.
  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('pointerdown', onPointer);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('pointerdown', onPointer);
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const slider = (label: string, key: keyof Settings) => (
    <label className={styles.row}>
      <span className={styles.label}>
        {label}
        <span className={styles.value}>{settings[key].toFixed(1)}×</span>
      </span>
      <input
        type="range"
        min={MIN_SCALE}
        max={MAX_SCALE}
        step={0.1}
        value={settings[key]}
        onChange={(e) => setSettings((s) => ({ ...s, [key]: Number(e.target.value) }))}
      />
    </label>
  );

  return (
    <div ref={wrapRef} className={styles.wrap}>
      <button
        className={styles.settingsBtn}
        onClick={() => setOpen((o) => !o)}
        aria-label="Settings"
        aria-expanded={open}
      >
        ⚙
      </button>
      {open && (
        <div className={styles.panel}>
          <h3 className={styles.heading}>Settings</h3>
          {slider('Hand card size', 'handScale')}
          {slider('Table card size', 'tableScale')}
          <button
            className={styles.resetBtn}
            onClick={() => setSettings({ handScale: DEFAULT_SCALE, tableScale: DEFAULT_SCALE })}
          >
            Reset
          </button>
        </div>
      )}
    </div>
  );
}
