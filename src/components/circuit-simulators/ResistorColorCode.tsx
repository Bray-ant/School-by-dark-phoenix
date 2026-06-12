import { useState, useMemo } from 'react';


const colorData: Record<string, { digit: number; mult: number; tol?: number; hex: string }> = {
  black: { digit: 0, mult: 1, hex: '#1a1a1a' },
  brown: { digit: 1, mult: 10, tol: 1, hex: '#8B4513' },
  red: { digit: 2, mult: 100, tol: 2, hex: '#DC2626' },
  orange: { digit: 3, mult: 1000, hex: '#F97316' },
  yellow: { digit: 4, mult: 10000, hex: '#EAB308' },
  green: { digit: 5, mult: 100000, tol: 0.5, hex: '#16A34A' },
  blue: { digit: 6, mult: 1000000, tol: 0.25, hex: '#2563EB' },
  violet: { digit: 7, mult: 10000000, tol: 0.1, hex: '#7C3AED' },
  gray: { digit: 8, mult: 100000000, tol: 0.05, hex: '#6B7280' },
  white: { digit: 9, mult: 1000000000, hex: '#F3F4F6' },
  gold: { digit: -1, mult: 0.1, tol: 5, hex: '#D4AF37' },
  silver: { digit: -1, mult: 0.01, tol: 10, hex: '#C0C0C0' },
};

const colorNames = Object.keys(colorData);

export default function ResistorColorCode() {
  const [bands, setBands] = useState(['brown', 'black', 'red', 'gold']);

  const result = useMemo(() => {
    const d1 = colorData[bands[0]].digit;
    const d2 = colorData[bands[1]].digit;
    const mult = colorData[bands[2]].mult;
    const tol = colorData[bands[3]]?.tol ?? 5;
    const value = (d1 * 10 + d2) * mult;
    return { value, tol, d1, d2, mult };
  }, [bands]);

  const formatValue = (v: number) => {
    if (v >= 1e9) return `${(v / 1e9).toFixed(2)}G`;
    if (v >= 1e6) return `${(v / 1e6).toFixed(2)}M`;
    if (v >= 1e3) return `${(v / 1e3).toFixed(2)}k`;
    return `${v.toFixed(2)}`;
  };

  return (
    <div className="glass-panel rounded-2xl p-6">
      <h3 className="text-sm font-semibold mb-4">Resistor Color Code Decoder</h3>

      {/* Resistor Visual */}
      <div className="flex justify-center mb-6">
        <div className="flex items-center">
          {/* Lead left */}
          <div className="w-12 h-1 bg-[#737373]" />
          {/* Body */}
          <div className="w-48 h-14 bg-[#d4a574] rounded-lg flex overflow-hidden relative">
            {bands.map((color, i) => (
              <div
                key={i}
                className="h-full border-r border-[#d4a574]/30 cursor-pointer hover:opacity-80 transition-opacity"
                style={{
                  backgroundColor: colorData[color].hex,
                  width: i === 0 || i === 3 ? '12%' : '20%',
                  marginLeft: i === 1 ? '15%' : i === 2 ? '10%' : i === 3 ? '20%' : '5%',
                }}
                title={`Band ${i + 1}: ${color}`}
              />
            ))}
          </div>
          {/* Lead right */}
          <div className="w-12 h-1 bg-[#737373]" />
        </div>
      </div>

      {/* Band Selectors */}
      <div className="grid grid-cols-4 gap-3 mb-5">
        {['1st Digit', '2nd Digit', 'Multiplier', 'Tolerance'].map((label, bandIdx) => (
          <div key={bandIdx}>
            <div className="text-[10px] text-[#737373] uppercase tracking-wider mb-1.5 text-center">{label}</div>
            <select
              value={bands[bandIdx]}
              onChange={e => {
                const next = [...bands];
                next[bandIdx] = e.target.value;
                setBands(next);
              }}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-xs capitalize"
            >
              {colorNames.map(c => (
                <option key={c} value={c}>
                  <span className="inline-block w-2 h-2 rounded-full mr-1" style={{ backgroundColor: colorData[c].hex }} />{c}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>

      {/* Result */}
      <div className="text-center p-4 rounded-xl bg-white/5 border border-white/10">
        <div className="text-[10px] text-[#737373] mb-1">RESISTANCE</div>
        <div className="text-2xl font-bold font-mono text-[#f6f6f6]">
          {formatValue(result.value)}Ω ±{result.tol}%
        </div>
        <div className="text-[10px] text-[#737373] mt-1">
          ({colorData[bands[0]].digit}{colorData[bands[1]].digit} × {colorData[bands[2]].mult} = {result.value}Ω)
        </div>
      </div>

      {/* Quick Reference */}
      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-[10px]">
          <thead>
            <tr className="text-[#737373]">
              <th className="text-left p-1">Color</th>
              <th className="text-center p-1">Digit</th>
              <th className="text-center p-1">Multiplier</th>
              <th className="text-center p-1">Tolerance</th>
            </tr>
          </thead>
          <tbody>
            {colorNames.slice(0, 10).map(c => (
              <tr key={c} className="border-t border-white/5">
                <td className="p-1 flex items-center gap-1.5 capitalize">
                  <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: colorData[c].hex }} />{c}
                </td>
                <td className="text-center p-1 font-mono">{colorData[c].digit}</td>
                <td className="text-center p-1 font-mono">×{colorData[c].mult >= 1000 ? colorData[c].mult / 1000 + 'k' : colorData[c].mult}</td>
                <td className="text-center p-1 font-mono">{colorData[c].tol ? `±${colorData[c].tol}%` : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
