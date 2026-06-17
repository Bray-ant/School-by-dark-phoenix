"use client";

import type { ReactNode } from 'react';

// ─── Types ────────────────────────────────────────────────

export interface SliderConfig {
  label: string;
  value: number;
  setter: (v: number) => void;
  min: number;
  max: number;
  color: string;
  unit?: string;
  format?: (value: number) => string;
}

// ─── LabSlider ────────────────────────────────────────────

interface LabSliderProps {
  config: SliderConfig;
  accentColor?: string;
}

export function LabSlider({ config, accentColor }: LabSliderProps) {
  const { label, value, setter, min, max, color, unit, format } = config;
  const displayValue = format
    ? format(value)
    : Math.abs(value) >= 1000
      ? `${(value / 1000).toFixed(1)}k`
      : String(value);
  const displayUnit = unit ?? (label.startsWith('V') ? 'V' : 'Ω');

  return (
    <div>
      <label className="text-[10px] text-[#737373] mb-1 block">
        {label} ({displayUnit})
      </label>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={e => setter(Number(e.target.value))}
        className="w-full"
        style={{ accentColor: accentColor ?? '#3b82f6' }}
      />
      <span className="text-xs font-mono" style={{ color }}>
        {displayValue} {displayUnit}
      </span>
    </div>
  );
}

// ─── LabControls ──────────────────────────────────────────

interface LabControlsProps {
  sliders: SliderConfig[];
  columns?: string;
  accentColor?: string;
  children?: ReactNode;
}

export function LabControls({ sliders, columns, accentColor, children }: LabControlsProps) {
  const gridCols = columns ?? `grid-cols-2 md:grid-cols-${Math.min(sliders.length, 5)}`;
  return (
    <div className="glass-panel rounded-xl p-4">
      <div className={`grid ${gridCols} gap-4`}>
        {sliders.map(c => (
          <LabSlider key={c.label} config={c} accentColor={accentColor} />
        ))}
      </div>
      {children}
    </div>
  );
}

// ─── LabLayout ────────────────────────────────────────────

interface LabLayoutProps {
  title: string;
  subtitle: string;
  children: ReactNode;
}

export function LabLayout({ title, subtitle, children }: LabLayoutProps) {
  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        <div className="text-center">
          <h2 className="text-lg font-bold mb-1">{title}</h2>
          <p className="text-xs text-[#737373]">{subtitle}</p>
        </div>
        {children}
      </div>
    </div>
  );
}

// ─── ArrowIn / ArrowOut (used by KCL and similar labs) ────

export function ArrowIn({ color }: { color: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16">
      <line x1="8" y1="16" x2="8" y2="4" stroke={color} strokeWidth="2" />
      <polygon points="8,0 4,6 12,6" fill={color} />
    </svg>
  );
}

export function ArrowOut({ color }: { color: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16">
      <line x1="8" y1="0" x2="8" y2="12" stroke={color} strokeWidth="2" />
      <polygon points="8,16 4,10 12,10" fill={color} />
    </svg>
  );
}
