"use client";

import { useState, useRef, useEffect } from 'react';
import { Waves } from 'lucide-react';
import { Section, EMCard, Formula, DidYouKnow, Applications, MiniQuiz } from './shared';

// EM Wave propagation canvas
function EMWaveCanvas({ freq, showPoynting }: { freq: number; showPoynting: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let animId = 0;
    const t0 = Date.now();
    const draw = () => {
      const t = (Date.now() - t0) / 1000;
      const w = canvas.width, h = canvas.height;
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = '#080818';
      ctx.fillRect(0, 0, w, h);
      const cy = h / 2, amp = 35;
      const k = (2 * Math.PI * freq) / w, omega = 2 * freq;
      // E field (blue)
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      for (let x = 20; x < w - 20; x += 1) {
        const y = cy + amp * Math.sin(k * x - omega * t);
        if (x === 20) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.fillStyle = 'rgba(59,130,246,0.06)';
      ctx.beginPath();
      ctx.moveTo(20, cy);
      for (let x = 20; x < w - 20; x += 1) ctx.lineTo(x, cy + amp * Math.sin(k * x - omega * t));
      ctx.lineTo(w - 20, cy);
      ctx.closePath();
      ctx.fill();
      // B field (purple)
      ctx.strokeStyle = '#7c3aed';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      for (let x = 20; x < w - 20; x += 1) {
        const y = cy + 70 + amp * Math.sin(k * x - omega * t + Math.PI / 2);
        if (x === 20) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
      // Poynting
      if (showPoynting) {
        ctx.strokeStyle = '#00d4ff';
        ctx.lineWidth = 2;
        for (let x = 40; x < w - 40; x += 80) {
          const y = cy - 35;
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x + 30, y);
          ctx.stroke();
          ctx.fillStyle = '#00d4ff';
          ctx.beginPath();
          ctx.moveTo(x + 30, y - 4);
          ctx.lineTo(x + 40, y);
          ctx.lineTo(x + 30, y + 4);
          ctx.fill();
        }
        ctx.fillStyle = '#00d4ff';
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('S = (1/&#956;&#8320;) E &#215; B', w / 2 + 20, cy - 45);
      }
      ctx.fillStyle = '#3b82f6';
      ctx.font = '11px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('E (y)', 5, cy - 20);
      ctx.fillStyle = '#7c3aed';
      ctx.fillText('B (z)', 5, cy + 90);
      // Propagation arrow
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(w / 2 - 30, cy + 120);
      ctx.lineTo(w / 2 + 30, cy + 120);
      ctx.stroke();
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.moveTo(w / 2 + 25, cy + 116);
      ctx.lineTo(w / 2 + 35, cy + 120);
      ctx.lineTo(w / 2 + 25, cy + 124);
      ctx.fill();
      ctx.font = '9px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('k (propagation, x)', w / 2 + 20, cy + 138);
      animId = requestAnimationFrame(draw);
    };
    animId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animId);
  }, [freq, showPoynting]);
  return <canvas ref={canvasRef} width={500} height={280} className="w-full rounded-lg" />;
}

const SPECTRUM = [
  { band: 'Radio', lambda: '> 1 mm', freq: '< 300 GHz', uses: 'AM/FM radio, MRI, radar', color: '#10b981' },
  { band: 'Microwave', lambda: '1 mm &#8211; 1 m', freq: '300 MHz &#8211; 300 GHz', uses: 'WiFi, Bluetooth, microwave ovens', color: '#06b6d4' },
  { band: 'Infrared', lambda: '700 nm &#8211; 1 mm', freq: '300 GHz &#8211; 430 THz', uses: 'Night vision, TV remotes, heat sensing', color: '#ef4444' },
  { band: 'Visible', lambda: '380 &#8211; 700 nm', freq: '430 &#8211; 770 THz', uses: 'Human vision, photography, lasers', color: '#f59e0b' },
  { band: 'Ultraviolet', lambda: '10 &#8211; 380 nm', freq: '770 THz &#8211; 30 PHz', uses: 'Sterilization, vitamin D, fluorescence', color: '#8b5cf6' },
  { band: 'X-Ray', lambda: '0.01 &#8211; 10 nm', freq: '30 PHz &#8211; 30 EHz', uses: 'Medical imaging, security, crystallography', color: '#3b82f6' },
  { band: 'Gamma', lambda: '< 0.01 nm', freq: '> 30 EHz', uses: 'Cancer therapy, nuclear physics, astronomy', color: '#ec4899' },
];

export default function Part4Waves() {
  const [waveFreq, setWaveFreq] = useState(3);
  const [showPoynting, setShowPoynting] = useState(true);

  return (
    <Section id="waves" icon={<Waves className="w-5 h-5" />} title="Part 4: Waves & Applications (Ch. 9&#8211;10)" color="#06b6d4">
      <p className="text-sm text-[#a3a3a3] leading-relaxed">
        &quot;We have so far considered fields that do not change with time. From now on, we shall examine situations where the fields are time-varying.&quot; &#8212; Sadiku &#167;9.1
        Maxwell&apos;s crowning achievement: unifying electricity and magnetism, predicting that <strong className="text-white">light is an electromagnetic wave</strong>.
      </p>

      {/* 9.2 Faraday's Law */}
      <EMCard title="9.2 Faraday&apos;s Law" accent="#06b6d4">
        <Formula name="Faraday&apos;s Law (Integral)" formula="EMF = &#8750; E &#183; dl = &#8722;d&#934;/dt = &#8722;d/dt &#8747; B &#183; dS"
          vars="A time-varying B field induces an EMF. Discovered 1831." />
        <Formula name="Differential Form (Maxwell&apos;s 3rd, time-varying)" formula="&#8711; &#215; E = &#8722;&#8706;B/&#8706;t"
          vars="The negative sign is Lenz&apos;s Law: induced EMF opposes the change in flux." />
        <p className="text-[11px] text-[#a3a3a3] mt-2">Three ways to induce EMF (Sadiku &#167;9.3):</p>
        <ol className="list-decimal list-inside text-[11px] text-[#d4d4d4] space-y-1 mt-1">
          <li><strong className="text-white">Stationary loop, time-varying B</strong> (transformer EMF): EMF = &#8722;N d&#934;/dt</li>
          <li><strong className="text-white">Moving loop in static B</strong> (motional EMF): EMF = &#8750; (u &#215; B) &#183; dl</li>
          <li><strong className="text-white">Moving loop in time-varying B</strong> (general): both contributions</li>
        </ol>
        <Formula name="Motional EMF (straight conductor)" formula="EMF = BuL"
          vars="Conductor length L, velocity u perpendicular to B." />
      </EMCard>

      {/* 9.4 Displacement Current */}
      <EMCard title="9.4 Displacement Current &#8212; Maxwell&apos;s Contribution" accent="#f59e0b">
        <p className="text-xs text-[#a3a3a3] mb-2">Ampere&apos;s law for statics violates charge conservation for time-varying fields. Maxwell resolved this:</p>
        <Formula name="Displacement Current Density" formula="J&#8342; = &#8706;D/&#8706;t = &#949; &#8706;E/&#8706;t"
          vars="J&#8342; in A/m&#178;. Changing E-field acts as a current source for H." />
        <Formula name="Ampere-Maxwell Law (Maxwell&apos;s 4th, final form)" formula="&#8711; &#215; H = J + &#8706;D/&#8706;t"
          vars="Real current J + displacement current &#8706;D/&#8706;t. This was Maxwell&apos;s key insight." />
        <p className="text-[11px] text-[#a3a3a3] mt-2">
          In a charging capacitor: no conduction current flows between plates, but changing E creates &#8706;D/&#8706;t,
          which sustains the magnetic field just like real current would.
        </p>
      </EMCard>

      {/* 9.5 Maxwell's Equations Final Form */}
      <EMCard title="9.5 Maxwell&apos;s Equations in Final Form" accent="#f59e0b">
        <div className="overflow-x-auto">
          <table className="w-full text-[10px]">
            <thead><tr className="border-b border-white/10">
              <th className="text-left py-1.5 px-2 text-[#737373]">#</th>
              <th className="text-left py-1.5 px-2 text-[#737373]">Name</th>
              <th className="text-left py-1.5 px-2 text-[#737373]">Differential</th>
              <th className="text-left py-1.5 px-2 text-[#737373]">Origin</th>
            </tr></thead>
            <tbody>
              <tr className="border-b border-white/5"><td className="py-1 px-2 text-[#ef4444]">1</td><td className="py-1 px-2 text-[#a3a3a3]">Gauss (E)</td><td className="py-1 px-2 text-[#d4d4d4] font-mono">&#8711;&#183;D = &#961;&#8341;</td><td className="py-1 px-2 text-[#737373]">Coulomb</td></tr>
              <tr className="border-b border-white/5"><td className="py-1 px-2 text-[#3b82f6]">2</td><td className="py-1 px-2 text-[#a3a3a3]">Gauss (M)</td><td className="py-1 px-2 text-[#d4d4d4] font-mono">&#8711;&#183;B = 0</td><td className="py-1 px-2 text-[#737373]">No monopoles</td></tr>
              <tr className="border-b border-white/5"><td className="py-1 px-2 text-[#10b981]">3</td><td className="py-1 px-2 text-[#a3a3a3]">Faraday</td><td className="py-1 px-2 text-[#d4d4d4] font-mono">&#8711;&#215;E = &#8722;&#8706;B/&#8706;t</td><td className="py-1 px-2 text-[#737373]">Faraday</td></tr>
              <tr className="border-b border-white/5"><td className="py-1 px-2 text-[#f59e0b]">4</td><td className="py-1 px-2 text-[#a3a3a3]">Ampere-Maxwell</td><td className="py-1 px-2 text-[#d4d4d4] font-mono">&#8711;&#215;H = J + &#8706;D/&#8706;t</td><td className="py-1 px-2 text-[#737373]">Ampere + Maxwell</td></tr>
            </tbody>
          </table>
        </div>
        <Formula name="Constitutive Relations" formula="D = &#949;E,  B = &#956;H,  J = &#963;E"
          vars="Material properties connecting field pairs. Ohm&apos;s Law point form: J = &#963;E." />
        <Formula name="Speed of Light" formula="c = 1/&#8730;(&#956;&#8320;&#949;&#8320;) = 2.998 &#215; 10&#8310; m/s"
          vars="Maxwell&apos;s greatest discovery: light IS an electromagnetic wave. Calculated c matched measured speed exactly." />
      </EMCard>

      {/* 10.1-10.2 Waves */}
      <EMCard title="10.1&#8211;10.2 Waves in General" accent="#06b6d4">
        <Formula name="Wave Equation (from Maxwell)" formula="&#8711;&#178;E = &#956;&#8320;&#949;&#8320; &#8706;&#178;E/&#8706;t&#178; = 1/c&#178; &#183; &#8706;&#178;E/&#8706;t&#178;"
          vars="Combining Faraday + Ampere-Maxwell yields the wave equation in free space." />
        <Formula name="Wave Parameters" formula="&#969; = 2&#960;f,  &#946; = &#969;/c = 2&#960;/&#955;,  u&#8346; = &#969;/&#946; = c"
          vars="&#946; = phase constant (rad/m), &#955; = wavelength, u&#8346; = phase velocity" />
      </EMCard>

      {/* 10.3-10.6 Wave in Various Media */}
      <EMCard title="10.3&#8211;10.6 Wave Propagation in Various Media" accent="#06b6d4">
        <Formula name="Propagation Constant" formula="&#947; = &#945; + j&#946; = &#8730;(j&#969;&#956;(&#963; + j&#969;&#949;))"
          vars="&#945; = attenuation (Np/m), &#946; = phase constant (rad/m)" />
        <Formula name="Lossless Dielectric (&#963; = 0)" formula="&#945; = 0,  &#946; = &#969;&#8730;(&#956;&#949;),  u&#8346; = 1/&#8730;(&#956;&#949;)"
          vars="No attenuation. Phase velocity &lt; c when &#949; &gt; &#949;&#8320;." />
        <Formula name="Good Conductor (&#963; >> &#969;&#949;)" formula="&#945; &#8776; &#946; &#8776; &#8730;(&#960;f&#956;&#963;)"
          vars="Skin depth: &#948; = 1/&#945; = 1/&#8730;(&#960;f&#956;&#963;) &#8212; wave penetration depth." />
        <div className="overflow-x-auto mt-2">
          <table className="w-full text-[10px]">
            <thead><tr className="border-b border-white/10">
              <th className="text-left py-1.5 px-2 text-[#737373]">Material</th>
              <th className="text-left py-1.5 px-2 text-[#737373]">&#948; at 60 Hz</th>
              <th className="text-left py-1.5 px-2 text-[#737373]">&#948; at 1 MHz</th>
            </tr></thead>
            <tbody>
              <tr className="border-b border-white/5"><td className="py-1.5 px-2 text-[#a3a3a3]">Copper</td><td className="py-1.5 px-2 text-[#d4d4d4]">8.5 mm</td><td className="py-1.5 px-2 text-[#d4d4d4]">0.066 mm</td></tr>
              <tr className="border-b border-white/5"><td className="py-1.5 px-2 text-[#a3a3a3]">Aluminum</td><td className="py-1.5 px-2 text-[#d4d4d4]">10.9 mm</td><td className="py-1.5 px-2 text-[#d4d4d4]">0.084 mm</td></tr>
              <tr className="border-b border-white/5"><td className="py-1.5 px-2 text-[#a3a3a3]">Seawater</td><td className="py-1.5 px-2 text-[#d4d4d4]">32.5 m</td><td className="py-1.5 px-2 text-[#d4d4d4]">0.25 m</td></tr>
            </tbody>
          </table>
        </div>
        <Formula name="Intrinsic Impedance (free space)" formula="&#951;&#8320; = &#8730;(&#956;&#8320;/&#949;&#8320;) = 376.6 &#937; &#8776; 120&#960; &#937;"
          vars="Ratio |E|/|H| for plane wave in free space. E and H perpendicular (TEM)." />
      </EMCard>

      {/* 10.7 Poynting Vector */}
      <EMCard title="10.7 Power and the Poynting Vector" accent="#06b6d4">
        <Formula name="Poynting Vector" formula="P = E &#215; H"
          vars="P in W/m&#178;. Direction = wave propagation. Magnitude = power per unit area." />
        <Formula name="Poynting&apos;s Theorem" formula="&#8722;&#8750;P&#183;dS = d/dt&#8747;(&#189;&#949;E&#178;+&#189;&#956;H&#178;)dv + &#8747;&#963;E&#178;dv"
          vars="Power in = rate of stored energy increase + Ohmic dissipation as heat." />
        <Formula name="Time-Average Poynting Vector" formula="P&#8344; = &#189; Re(E&#8341; &#215; H&#8341;*)"
          vars="For sinusoidal fields. Gives average power flow through a surface." />
      </EMCard>

      {/* 10.8 Reflection */}
      <EMCard title="10.8 Reflection at Normal Incidence" accent="#06b6d4">
        <Formula name="Reflection Coefficient" formula="&#915; = (&#951;&#8322; &#8722; &#951;&#8321;) / (&#951;&#8322; + &#951;&#8321;)"
          vars="&#8722;1 &#8804; &#915; &#8804; 1. &#915; = 0: no reflection (matched). &#915; = &#8722;1: total reflection (conductor)." />
        <Formula name="Transmission Coefficient" formula="&#964; = 2&#951;&#8322; / (&#951;&#8322; + &#951;&#8321;) = 1 + &#915;"
          vars="&#964; = 2 when &#951;&#8322; >> &#951;&#8321; (wave enters dense medium)." />
        <Formula name="Standing Wave Ratio" formula="SWR = (1 + |&#915;|) / (1 &#8722; |&#915;|)"
          vars="SWR = 1 when matched (&#915; = 0). SWR &#8594; &#8734; for total reflection." />
      </EMCard>

      {/* Animated EM Wave */}
      <EMCard title="Animated EM Wave Propagation" accent="#06b6d4">
        <EMWaveCanvas freq={waveFreq} showPoynting={showPoynting} />
        <div className="flex gap-4 mt-3 items-center">
          <div className="flex-1">
            <label className="text-[10px] text-[#737373] mb-1 block">Frequency</label>
            <input type="range" min={1} max={6} step={0.5} value={waveFreq} onChange={e => setWaveFreq(Number(e.target.value))} className="w-full accent-[#06b6d4]" />
          </div>
          <button onClick={() => setShowPoynting(!showPoynting)}
            className={`px-3 py-1.5 rounded-lg text-[10px] transition-all ${showPoynting ? 'bg-[#00d4ff]/15 text-[#00d4ff]' : 'bg-white/5 text-[#737373]'}`}>
            {showPoynting ? 'Hide' : 'Show'} Poynting
          </button>
        </div>
        <p className="text-[10px] text-[#525252] mt-2">E (blue), B (purple), S (cyan arrows) &#8212; all mutually perpendicular. E/B = &#951;&#8320; = 120&#960; &#937;.</p>
      </EMCard>

      {/* EM Spectrum */}
      <EMCard title="The Electromagnetic Spectrum" accent="#06b6d4">
        <div className="overflow-x-auto">
          <table className="w-full text-[10px]">
            <thead><tr className="border-b border-white/10">
              <th className="text-left py-1.5 px-2 text-[#737373]">Band</th>
              <th className="text-left py-1.5 px-2 text-[#737373]">Wavelength</th>
              <th className="text-left py-1.5 px-2 text-[#737373]">Frequency</th>
              <th className="text-left py-1.5 px-2 text-[#737373]">Uses</th>
            </tr></thead>
            <tbody>
              {SPECTRUM.map((s, i) => (
                <tr key={i} className="border-b border-white/5">
                  <td className="py-1.5 px-2"><span className="font-semibold" style={{ color: s.color }}>{s.band}</span></td>
                  <td className="py-1.5 px-2 text-[#a3a3a3]">{s.lambda}</td>
                  <td className="py-1.5 px-2 text-[#a3a3a3] font-mono">{s.freq}</td>
                  <td className="py-1.5 px-2 text-[#525252]">{s.uses}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex h-3 rounded-full overflow-hidden mt-3">
          {SPECTRUM.map((s, i) => <div key={i} className="flex-1" style={{ backgroundColor: s.color, opacity: 0.6 }} />)}
        </div>
        <div className="flex justify-between text-[8px] text-[#525252] mt-1">
          <span>Low Energy &#8594;</span>
          <span>&#8592; Increasing Energy & Frequency &#8594;</span>
          <span>High Energy</span>
        </div>
      </EMCard>

      <Applications items={[
        "Fiber optics use IR light (1.3&#8211;1.5 &#956;m) to transmit terabits/sec across oceans with &lt;0.2 dB/km loss",
        "GPS satellites broadcast L-band signals (1.575 GHz) that travel 20,200 km to receivers, achieving cm-level accuracy",
        "Submarine communication uses ELF (3&#8211;30 Hz) because skin depth in seawater is ~250 m at those frequencies",
        "Gamma knife surgery focuses 192 beams on brain tumors with sub-millimeter precision, sparing healthy tissue",
      ]} />

      <DidYouKnow>
        The cosmic microwave background (CMB) is the oldest light in the universe &#8212; a relic from 380,000 years after the Big Bang!
        It fills all space at 2.725 K, corresponding to 160.2 GHz microwaves. Discovered accidentally by Penzias and Wilson in 1965
        (Nobel 1978). They first thought the persistent noise was caused by bird droppings in their antenna!
      </DidYouKnow>

      <MiniQuiz questions={[
        { question: "In an EM wave, E, B, and k are:", options: ["A) All parallel", "B) E &#8869; B &#8869; k", "C) All perpendicular to each other", "D) E parallel to k"], correct: 1, explanation: "E &#8869; B &#8869; k (direction of propagation). All three mutually perpendicular. E and B oscillate in phase." },
        { question: "The displacement current was Maxwell&apos;s solution to a paradox involving:", options: ["A) A moving charge", "B) A charging capacitor", "C) A rotating magnet", "D) A solenoid"], correct: 1, explanation: "In a charging capacitor, no real current flows between plates. Maxwell&apos;s J&#8342; = &#8706;D/&#8706;t completes the circuit." },
        { question: "Skin depth in a good conductor:", options: ["A) Increases with frequency", "B) Decreases with &#8730;f", "C) Is independent of frequency", "D) Increases with conductivity"], correct: 1, explanation: "&#948; = 1/&#8730;(&#960;f&#956;&#963;) &#8212; decreases as 1/&#8730;f. Higher frequencies penetrate less." },
        { question: "Maxwell calculated the speed of EM waves as:", options: ["A) c = &#956;&#8320;&#949;&#8320;", "B) c = 1/&#8730;(&#956;&#8320;&#949;&#8320;)", "C) c = &#8730;(&#956;&#8320;&#949;&#8320;)", "D) c = &#956;&#8320;/&#949;&#8320;"], correct: 1, explanation: "c = 1/&#8730;(&#956;&#8320;&#949;&#8320;) = 2.998&#215;10&#8310; m/s. This matched the measured speed of light, proving light is EM." },
      ]} />
    </Section>
  );
}
