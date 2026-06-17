"use client";

import { useState, useRef, useEffect } from 'react';
import { Magnet } from 'lucide-react';
import { Section, EMCard, Formula, WorkedExample, PracticeExercise, DidYouKnow, Applications, MiniQuiz, EMControl } from './shared';

// Wire B-field canvas
function WireBField({ current }: { current: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mu0 = 4 * Math.PI * 1e-7;
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
      const cx = w / 2, cy = h / 2;
      for (let r = 20; r <= 100; r += 20) {
        const alpha = Math.max(0.05, 0.4 * (100 / r) * Math.abs(current) / 10);
        ctx.strokeStyle = `rgba(16,185,129,${alpha})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, 2 * Math.PI);
        ctx.stroke();
        const arrowAngle = t * 2 + r * 0.05;
        const ax = cx + r * Math.cos(arrowAngle), ay = cy + r * Math.sin(arrowAngle);
        ctx.fillStyle = `rgba(16,185,129,${alpha + 0.2})`;
        ctx.beginPath();
        ctx.arc(ax, ay, 2, 0, 2 * Math.PI);
        ctx.fill();
      }
      ctx.beginPath();
      ctx.arc(cx, cy, 10, 0, 2 * Math.PI);
      ctx.fillStyle = '#f59e0b';
      ctx.fill();
      ctx.fillStyle = '#080818';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(current >= 0 ? '&#8857;' : '&#8855;', cx, cy + 1);
      ctx.fillStyle = '#737373';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`I = ${current} A`, 10, 18);
      const B = (mu0 * Math.abs(current)) / (2 * Math.PI * 0.05);
      ctx.fillText(`B at r=5cm: ${(B * 1000).toFixed(3)} mT`, 10, 30);
      ctx.fillText(`H at r=5cm: ${(current / (2 * Math.PI * 0.05)).toFixed(2)} A/m`, 10, 42);
      animId = requestAnimationFrame(draw);
    };
    animId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animId);
  }, [current]);
  return <canvas ref={canvasRef} width={300} height={200} className="w-full rounded-lg" />;
}

// Cyclotron canvas
function CyclotronCanvas({ v, Bfield }: { v: number; Bfield: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const q = 1.6e-19, m = 1.67e-27;
  const r = (m * v) / (q * Bfield);
  const f = (q * Bfield) / (2 * Math.PI * m);
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
      const cx = w / 2, cy = h / 2;
      const radiusPx = Math.min(70, Math.max(15, r * 1e6));
      ctx.strokeStyle = 'rgba(236,72,153,0.3)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(cx, cy, radiusPx, 0, 2 * Math.PI);
      ctx.stroke();
      const angle = t * 3;
      const px = cx + radiusPx * Math.cos(angle), py = cy + radiusPx * Math.sin(angle);
      ctx.beginPath();
      ctx.arc(px, py, 5, 0, 2 * Math.PI);
      ctx.fillStyle = '#ec4899';
      ctx.fill();
      ctx.fillStyle = '#737373';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`v = ${v.toExponential(1)} m/s`, 10, 18);
      ctx.fillText(`B = ${Bfield} T`, 10, 30);
      ctx.fillText(`r = ${(r * 100).toFixed(3)} cm`, 10, 42);
      ctx.fillText(`f = ${(f / 1e6).toFixed(2)} MHz`, 10, 54);
      animId = requestAnimationFrame(draw);
    };
    animId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animId);
  }, [v, Bfield, r, f]);
  return <canvas ref={canvasRef} width={300} height={200} className="w-full rounded-lg" />;
}

// Hysteresis Canvas
function HysteresisCanvas({ hField }: { hField: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const w = canvas.width, h = canvas.height, pad = 40;
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#080818';
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(pad, h / 2);
    ctx.lineTo(w - pad, h / 2);
    ctx.moveTo(w / 2, pad);
    ctx.lineTo(w / 2, h - pad);
    ctx.stroke();
    ctx.fillStyle = '#737373';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('H (A/m)', w / 2, h - 10);
    ctx.save();
    ctx.translate(12, h / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('B (T)', 0, 0);
    ctx.restore();
    const Hs = 100, Bs = 1.2, Hc = 30, Br = 0.8;
    const toX = (H: number) => w / 2 + (H / Hs) * ((w - 2 * pad) / 2);
    const toY = (B: number) => h / 2 - (B / Bs) * ((h - 2 * pad) / 2);
    ctx.strokeStyle = '#7c3aed';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let H = -Hc; H <= Hs; H += 1) { const t = (H + Hc) / (Hs + Hc); const B = Br + (Bs - Br) * (1 - Math.exp(-3 * t)); if (H === -Hc) ctx.moveTo(toX(H), toY(B)); else ctx.lineTo(toX(H), toY(B)); }
    for (let H = Hs; H >= -Hc; H -= 1) { const t = (Hs - H) / (Hs + Hc); const B = Bs * (1 - 0.3 * t) * Math.exp(-0.5 * t); ctx.lineTo(toX(H), toY(B)); }
    for (let H = -Hs; H <= Hc; H += 1) { const t = (H + Hs) / (Hs + Hc); const B = -(Br + (Bs - Br) * (1 - Math.exp(-3 * t))); if (H === -Hs) ctx.moveTo(toX(H), toY(B)); else ctx.lineTo(toX(H), toY(B)); }
    for (let H = Hc; H >= -Hs; H -= 1) { const t = (Hc - H) / (Hs + Hc); const B = -Bs * (1 - 0.3 * t) * Math.exp(-0.5 * t); ctx.lineTo(toX(H), toY(B)); }
    ctx.stroke();
    const clampedH = Math.max(-Hs, Math.min(Hs, hField));
    let currentB: number;
    if (clampedH >= 0) { const t = clampedH / Hs; currentB = Br + (Bs - Br) * (1 - Math.exp(-3 * t)); }
    else { const t = Math.abs(clampedH) / Hs; currentB = -(Br + (Bs - Br) * (1 - Math.exp(-3 * t))); }
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(toX(clampedH), toY(currentB), 5, 0, 2 * Math.PI);
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.fillStyle = '#a3a3a3';
    ctx.font = '9px sans-serif';
    ctx.fillText(`H = ${hField}`, w - 60, 20);
    ctx.fillText(`B = ${currentB.toFixed(3)} T`, w - 60, 32);
    ctx.fillText(`Bs = ${Bs} T`, pad + 5, pad + 10);
    ctx.fillText(`Br = ${Br} T`, pad + 5, h / 2 - 8);
    ctx.fillText(`Hc = ${Hc} A/m`, w / 2 + 5, h - pad - 5);
  }, [hField]);
  return <canvas ref={canvasRef} width={400} height={240} className="w-full rounded-lg" />;
}

export default function Part3Magnetostatics() {
  const [wireI, setWireI] = useState(5);
  const [cycV, setCycV] = useState(1e6);
  const [cycB, setCycB] = useState(0.5);
  const [hField, setHField] = useState(0);

  return (
    <Section id="magnetostatics" icon={<Magnet className="w-5 h-5" />} title="Part 3: Magnetostatics (Ch. 7&#8211;8)" color="#10b981">
      <p className="text-sm text-[#a3a3a3] leading-relaxed">
        &quot;There are two major laws governing magnetostatic fields: (1) Biot-Savart&apos;s law and (2) Ampere&apos;s circuit law.&quot; &#8212; Sadiku &#167;7.1
        Magnetostatics: magnetic fields produced by <strong className="text-white">steady (DC) currents</strong>. Key applications: motors, transformers, maglev trains.
      </p>

      {/* 7.2 Biot-Savart */}
      <EMCard title="7.2 Biot-Savart&apos;s Law" accent="#10b981">
        <Formula name="Biot-Savart Law" formula="dH = I dl &#215; a&#8341; / 4&#960;R&#178; = I dl &#215; R / 4&#960;R&#179;"
          vars="dH: infinitesimal H at P from current element I dl | R = r &#8722; r&apos; (source to field point) | H in A/m" />
        <Formula name="Infinite Straight Wire" formula="H = I / 2&#960;&#961; &#183; a&#966;"
          vars="H circumferential around wire. Decays as 1/&#961;. Right-hand rule: thumb = I, fingers = H." />
        <Formula name="Circular Loop (center)" formula="H = I / 2a &#183; a&#8342;"
          vars="a = loop radius. H perpendicular to loop plane, proportional to I." />
        <Formula name="Circular Loop (axis)" formula="H = Ia&#178; / 2(a&#178;+h&#178;)&#185;/&#178; &#183; a&#8342;"
          vars="h = distance along axis from loop center. At center (h=0): H = I/2a." />
      </EMCard>

      <EMCard title="Interactive: B-Field Around Current-Carrying Wire" accent="#10b981">
        <WireBField current={wireI} />
        <div className="mt-3">
          <EMControl label="Current I" value={wireI} unit="A" min={1} max={20} step={0.5} color="#f59e0b" onChange={setWireI} />
        </div>
      </EMCard>

      <WorkedExample
        title="Finite line current of length 2L along z-axis carrying I. Find H at perpendicular distance &#961; from midpoint."
        steps={[
          "dH = Idl &#215; a&#8341; / 4&#960;R&#178;. By symmetry, only a&#966; survives.",
          "H&#966; = &#8741;/4&#960;&#961; &#8747;&#8722;L&#8314;&#8314; cos&#952; dl/R&#178; where cos&#952; = &#961;/R",
          "Substitute R = &#8730;(&#961;&#178;+l&#178;), dl/R&#178; = dl/(&#961;&#178;+l&#178;)",
          "H&#966; = I/4&#960;&#961; [l/&#8730;(&#961;&#178;+l&#178;)]&#8314;/&#8316;/&#8314;/&#8316; = I &#183; 2L / 4&#960;&#961;(&#961;&#178;+L&#178;)&#185;/&#178;",
          "As L &#8594; &#8734;: H&#966; &#8592; I / 2&#960;&#961; (infinite wire result)"
        ]}
        answer="H = I&#183;2L / 4&#960;&#961;(&#961;&#178;+L&#178;)&#185;/&#178; a&#966;. Reduces to infinite wire as L &#8594; &#8734;."
      />
      <PracticeExercise title="Two semi-infinite wires and a 2m circular arc at origin, I = 5A. Find H at origin."
        answer="H = 5/4 a&#8342; = 1.25 a&#8342; A/m. Semi-infinite: H = I/4&#960;&#961; each. Arc: H = I/4a." />

      {/* 7.3 Ampere's Law */}
      <EMCard title="7.3 Ampere&apos;s Circuit Law &#8212; Maxwell&apos;s 3rd Equation" accent="#10b981">
        <Formula name="Integral Form (Maxwell&apos;s 3rd)" formula="&#8750; H &#183; dl = I&#8345;&#8273;&#8346;"
          vars="Circulation of H around closed path = current enclosed. Analogous to Gauss for magnetostatics." />
        <Formula name="Differential Form" formula="&#8711; &#215; H = J"
          vars="J = free current density. Curl of H equals free current density." />

        <div className="overflow-x-auto mt-3">
          <table className="w-full text-[10px]">
            <thead><tr className="border-b border-white/10">
              <th className="text-left py-1.5 px-2 text-[#737373]">Geometry</th>
              <th className="text-left py-1.5 px-2 text-[#737373]">Result</th>
            </tr></thead>
            <tbody>
              <tr className="border-b border-white/5"><td className="py-1.5 px-2 text-[#a3a3a3]">Infinite line</td><td className="py-1.5 px-2 text-[#d4d4d4] font-mono">H = I/2&#960;&#961; a&#966;</td></tr>
              <tr className="border-b border-white/5"><td className="py-1.5 px-2 text-[#a3a3a3]">Current sheet K</td><td className="py-1.5 px-2 text-[#d4d4d4] font-mono">H = &#189;K &#215; a&#8342;</td></tr>
              <tr className="border-b border-white/5"><td className="py-1.5 px-2 text-[#a3a3a3]">Solenoid</td><td className="py-1.5 px-2 text-[#d4d4d4] font-mono">H = nI a&#8342; (in), H = 0 (out)</td></tr>
              <tr className="border-b border-white/5"><td className="py-1.5 px-2 text-[#a3a3a3]">Toroid</td><td className="py-1.5 px-2 text-[#d4d4d4] font-mono">H = NI/2&#960;&#961;</td></tr>
            </tbody>
          </table>
        </div>
      </EMCard>

      {/* 7.5 B and Maxwell's eqns for static fields */}
      <EMCard title="7.5 Magnetic Flux Density B &#8212; Maxwell&apos;s 4th Equation" accent="#10b981">
        <Formula name="B = &#956;&#8320;H (free space)" formula="B = &#956;&#8320;H = 4&#960;&#215;10&#8315;&#8313; H"
          vars="&#956;&#8320; = 4&#960; &#215; 10&#8315;&#8313; H/m (permeability of free space). In material: B = &#956;H = &#956;&#8320;&#956;&#8341;H." />
        <Formula name="Gauss&apos;s Law for Magnetism (Maxwell&apos;s 4th)" formula="&#8750; B &#183; dS = 0,  &#8711; &#183; B = 0"
          vars="Magnetic field lines always form closed loops &#8212; no magnetic monopoles exist." />
      </EMCard>

      <WorkedExample
        title="Solenoid n = 1000 turns/m, I = 2A. Find H and B inside. Compare with Earth&apos;s field (~50 &#956;T)."
        steps={[
          "H = nI = 1000 &#215; 2 = <strong>2000 A/m</strong>",
          "B = &#956;&#8320;H = 4&#960;&#215;10&#8315;&#8313; &#215; 2000 = <strong>2.51 mT</strong>",
          "B/Earth = 2.51&#215;10&#8315;&#179; / 50&#215;10&#8315;&#8313; = <strong>50&#215;</strong> Earth&apos;s field"
        ]}
        answer="H = 2 kA/m, B = 2.51 mT (about 50x Earth&apos;s magnetic field)."
      />

      {/* 7.6 Maxwell's Equations for static fields summary */}
      <EMCard title="7.6 Maxwell&apos;s Equations for Static EM Fields (Summary)" accent="#10b981">
        <div className="overflow-x-auto">
          <table className="w-full text-[10px]">
            <thead><tr className="border-b border-white/10">
              <th className="text-left py-1.5 px-2 text-[#737373]">Equation</th>
              <th className="text-left py-1.5 px-2 text-[#737373]">Differential</th>
              <th className="text-left py-1.5 px-2 text-[#737373]">Remarks</th>
            </tr></thead>
            <tbody>
              <tr className="border-b border-white/5"><td className="py-1.5 px-2 text-[#ef4444] font-semibold">Gauss (E)</td><td className="py-1.5 px-2 text-[#d4d4d4] font-mono">&#8711;&#183;D = &#961;&#8341;</td><td className="py-1.5 px-2 text-[#737373]">From Coulomb&apos;s law</td></tr>
              <tr className="border-b border-white/5"><td className="py-1.5 px-2 text-[#3b82f6] font-semibold">Gauss (M)</td><td className="py-1.5 px-2 text-[#d4d4d4] font-mono">&#8711;&#183;B = 0</td><td className="py-1.5 px-2 text-[#737373]">No monopoles</td></tr>
              <tr className="border-b border-white/5"><td className="py-1.5 px-2 text-[#10b981] font-semibold">Faraday (static)</td><td className="py-1.5 px-2 text-[#d4d4d4] font-mono">&#8711;&#215;E = 0</td><td className="py-1.5 px-2 text-[#737373]">Electrostatic: conservative</td></tr>
              <tr className="border-b border-white/5"><td className="py-1.5 px-2 text-[#f59e0b] font-semibold">Ampere</td><td className="py-1.5 px-2 text-[#d4d4d4] font-mono">&#8711;&#215;H = J</td><td className="py-1.5 px-2 text-[#737373]">From Biot-Savart</td></tr>
            </tbody>
          </table>
        </div>
      </EMCard>

      {/* Chapter 8 — Forces, Materials, Devices */}
      <EMCard title="Ch. 8: Magnetic Forces, Materials, and Devices" accent="#ec4899">
        <Formula name="Lorentz Force" formula="F = Q(E + u &#215; B)"
          vars="Total force on charge Q with velocity u in E and B fields." />
        <Formula name="Force on Current Element" formula="dF = I dl &#215; B"
          vars="dF on wire segment dl carrying current I in field B." />
        <Formula name="Force Between Parallel Wires" formula="F = &#956;&#8320; I&#8321;I&#8322;&#8467; / 2&#960;d"
          vars="Parallel currents: attractive. Antiparallel: repulsive." />
        <Formula name="Torque on Current Loop" formula="T = m &#215; B,  m = I&#183;A&#183;a&#8342;"
          vars="m = magnetic dipole moment (A&#183;m&#178;). T = IAB sin&#952;." />
      </EMCard>

      <EMCard title="Interactive: Cyclotron Motion (Lorentz Force)" accent="#ec4899">
        <CyclotronCanvas v={cycV} Bfield={cycB} />
        <div className="grid grid-cols-2 gap-3 mt-3">
          <EMControl label="Velocity v" value={cycV} unit="m/s" min={1e5} max={5e6} step={1e5} color="#ec4899" onChange={setCycV} />
          <EMControl label="B Field" value={cycB} unit="T" min={0.1} max={2} step={0.05} color="#00d4ff" onChange={setCycB} />
        </div>
      </EMCard>

      {/* 8.6 Magnetic Materials */}
      <EMCard title="8.6 Classification of Magnetic Materials" accent="#7c3aed">
        <Formula name="Magnetization" formula="B = &#956;&#8320;(H + M) = &#956;&#8320;&#956;&#8341;H"
          vars="M = &#967;&#8341;H (magnetic susceptibility). &#956;&#8341; = 1 + &#967;&#8341;. M = dipole moment per unit volume." />
        <div className="grid grid-cols-2 gap-2 mt-3">
          {[
            { name: 'Diamagnetic', chi: '< 0', ex: 'Bi, Cu, Water', color: '#06b6d4' },
            { name: 'Paramagnetic', chi: '> 0', ex: 'Al, Pt, O&#8322;', color: '#10b981' },
            { name: 'Ferromagnetic', chi: '>> 1', ex: 'Fe, Co, Ni', color: '#ef4444' },
            { name: 'Antiferromagnetic', chi: '~0', ex: 'MnO, Cr', color: '#ec4899' },
          ].map((m, i) => (
            <div key={i} className="p-2 rounded-lg text-[10px]" style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${m.color}20` }}>
              <span style={{ color: m.color, fontWeight: 600 }}>{m.name}</span>
              <span className="text-[#737373] ml-2">&#967; {m.chi}</span>
              <div className="text-[#525252] mt-0.5">{m.ex}</div>
            </div>
          ))}
        </div>
      </EMCard>

      <EMCard title="Interactive: B-H Hysteresis Loop Tracer" accent="#7c3aed">
        <HysteresisCanvas hField={hField} />
        <div className="mt-3">
          <EMControl label="H (applied field)" value={hField} unit="A/m" min={-100} max={100} step={1} color="#7c3aed" onChange={setHField} />
        </div>
        <div className="grid grid-cols-2 gap-2 mt-2 text-[10px] text-[#737373]">
          <div><strong className="text-[#a3a3a3]">Bs:</strong> Saturation</div>
          <div><strong className="text-[#a3a3a3]">Br:</strong> Remanence</div>
          <div><strong className="text-[#a3a3a3]">Hc:</strong> Coercivity</div>
          <div><strong className="text-[#a3a3a3]">Area:</strong> Energy loss/cycle</div>
        </div>
      </EMCard>

      {/* 8.8 Inductance */}
      <EMCard title="8.8 Inductors and Inductance" accent="#ec4899">
        <Formula name="Self-Inductance" formula="L = N&#934;/I = &#955;/I"
          vars="L in Henrys (H). Flux linkage &#955; = N&#934; proportional to current I." />
        <div className="overflow-x-auto mt-2">
          <table className="w-full text-[10px]">
            <thead><tr className="border-b border-white/10">
              <th className="text-left py-1.5 px-2 text-[#737373]">Inductor</th>
              <th className="text-left py-1.5 px-2 text-[#737373]">Formula</th>
            </tr></thead>
            <tbody>
              <tr className="border-b border-white/5"><td className="py-1.5 px-2 text-[#a3a3a3]">Toroid</td><td className="py-1.5 px-2 text-[#d4d4d4] font-mono">L = &#956;N&#178;A/2&#960;&#961;&#8320;</td></tr>
              <tr className="border-b border-white/5"><td className="py-1.5 px-2 text-[#a3a3a3]">Solenoid</td><td className="py-1.5 px-2 text-[#d4d4d4] font-mono">L = &#956;N&#178;A/&#8467;</td></tr>
              <tr className="border-b border-white/5"><td className="py-1.5 px-2 text-[#a3a3a3]">Coaxial cable</td><td className="py-1.5 px-2 text-[#d4d4d4] font-mono">L = &#956;&#8467;/2&#960; ln(b/a)</td></tr>
            </tbody>
          </table>
        </div>
        <Formula name="Magnetic Energy" formula="W&#8342; = &#189;LI&#178; = &#189;&#8747;B&#183;H dv"
          vars="Energy density: w&#8342; = &#189;B&#183;H = B&#178;/2&#956; = &#189;&#956;H&#178; (J/m&#179;)" />
      </EMCard>

      {/* 8.10 Magnetic Circuits */}
      <EMCard title="8.10 Magnetic Circuits" accent="#f59e0b">
        <Formula name="Hopkinson&apos;s Law" formula="NI = &#934; &#183; &#8476;"
          vars="MMF (NI) in Amperes = Flux &#934; (Wb) &#215; Reluctance &#8476; (H&#8315;&#185;) | Analogous to V = IR" />
        <Formula name="Reluctance" formula="&#8476; = &#8467; / &#956;A"
          vars="&#8467; = path length, A = cross-section area, &#956; = permeability | Air gaps dominate &#8476;" />
        <div className="overflow-x-auto mt-2">
          <table className="w-full text-[10px]">
            <thead><tr className="border-b border-white/10">
              <th className="text-left py-1.5 px-2 text-[#737373]">Magnetic</th>
              <th className="text-left py-1.5 px-2 text-[#737373]">Electric</th>
            </tr></thead>
            <tbody>
              <tr className="border-b border-white/5"><td className="py-1.5 px-2 text-[#a3a3a3]">MMF (NI) [A]</td><td className="py-1.5 px-2 text-[#a3a3a3]">EMF (V) [V]</td></tr>
              <tr className="border-b border-white/5"><td className="py-1.5 px-2 text-[#a3a3a3]">Reluctance &#8476; [H&#8315;&#185;]</td><td className="py-1.5 px-2 text-[#a3a3a3]">Resistance R [&#937;]</td></tr>
              <tr className="border-b border-white/5"><td className="py-1.5 px-2 text-[#a3a3a3]">Flux &#934; [Wb]</td><td className="py-1.5 px-2 text-[#a3a3a3]">Current I [A]</td></tr>
            </tbody>
          </table>
        </div>
      </EMCard>

      <Applications items={[
        "Electric motors: F = I L &#215; B produces torque on coils in stator field (10 kW&#8211;10 MW scale)",
        "MRI machines: superconducting solenoids produce 1.5&#8211;7 T using niobium-titanium coils at 4 K",
        "Maglev trains: electromagnets levitate 40-ton cars, guided by linear motor propulsion at 600 km/h",
        "Hard disk drives: GMR read heads use spintronics to detect nanotesla-scale fields from bit patterns",
      ]} />

      <DidYouKnow>
        The strongest continuous magnetic field ever created was 45 T &#8212; 900,000 times Earth&apos;s field!
        Set at the National High Magnetic Field Laboratory using a hybrid resistive + superconducting magnet.
        By comparison, a fridge magnet is ~0.005 T. The 45 T magnet requires 33 MW of power and 10,000 L/hr of cooling water.
      </DidYouKnow>

      <MiniQuiz questions={[
        { question: "The direction of H around a current-carrying wire is found using:", options: ["A) Left-hand rule", "B) Right-hand grip rule", "C) Fleming's left-hand rule", "D) Thumb rule"], correct: 1, explanation: "Right-hand grip: thumb = current, fingers curl in H direction." },
        { question: "Inside a solenoid with n turns/m carrying current I:", options: ["A) H = 0", "B) H = nI", "C) H = I/n", "D) H = n/I"], correct: 1, explanation: "H = nI inside a solenoid (uniform). H = 0 outside." },
        { question: "Magnetic field lines always form closed loops because:", options: ["A) &#8711;&#183;B = 0", "B) &#8711;&#215;B = 0", "C) &#8711;&#183;H = J", "D) There are no charges"], correct: 0, explanation: "&#8711;&#183;B = 0 (Gauss's law for magnetism) &#8212; no magnetic monopoles means field lines never begin or end." },
      ]} />
    </Section>
  );
}
