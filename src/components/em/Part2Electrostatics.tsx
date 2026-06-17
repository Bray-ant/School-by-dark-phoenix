"use client";

import { useState, useRef, useEffect } from 'react';
import { Zap } from 'lucide-react';
import { Section, EMCard, Formula, WorkedExample, PracticeExercise, DidYouKnow, Applications, MiniQuiz, EMControl } from './shared';

// Coulomb force canvas
function CoulombCanvas({ q1, q2 }: { q1: number; q2: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [p1, setP1] = useState({ x: 80, y: 100 });
  const [p2, setP2] = useState({ x: 220, y: 100 });
  const [dragging, setDragging] = useState<1 | 2 | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const w = canvas.width, h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#080818';
    ctx.fillRect(0, 0, w, h);

    const dx = p2.x - p1.x, dy = p2.y - p1.y;
    const r = Math.sqrt(dx * dx + dy * dy);
    const k = 8.99e9;
    const F = Math.abs(k * (q1 * 1e-6) * (q2 * 1e-6) / (r * r * 1e-6));

    // Force arrows
    const ux = dx / r, uy = dy / r;
    const arrowLen = Math.min(60, F * 1e6 * 50);
    const sign = q1 * q2 >= 0 ? 1 : -1;

    ctx.strokeStyle = sign > 0 ? '#ef4444' : '#3b82f6';
    ctx.lineWidth = 2;
    // Arrow on q1
    ctx.beginPath();
    ctx.moveTo(p1.x + 15 * ux, p1.y + 15 * uy);
    ctx.lineTo(p1.x + 15 * ux + arrowLen * (sign > 0 ? -ux : ux), p1.y + 15 * uy + arrowLen * (sign > 0 ? -uy : uy));
    ctx.stroke();
    // Arrow on q2
    ctx.beginPath();
    ctx.moveTo(p2.x - 15 * ux, p2.y - 15 * uy);
    ctx.lineTo(p2.x - 15 * ux + arrowLen * (sign > 0 ? ux : -ux), p2.y - 15 * uy + arrowLen * (sign > 0 ? uy : -uy));
    ctx.stroke();

    // Charges
    ctx.beginPath();
    ctx.arc(p1.x, p1.y, 14, 0, 2 * Math.PI);
    ctx.fillStyle = q1 >= 0 ? '#ef4444' : '#3b82f6';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.stroke();
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(q1 >= 0 ? '+' : '−', p1.x, p1.y + 1);

    ctx.beginPath();
    ctx.arc(p2.x, p2.y, 14, 0, 2 * Math.PI);
    ctx.fillStyle = q2 >= 0 ? '#ef4444' : '#3b82f6';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.stroke();
    ctx.fillStyle = '#fff';
    ctx.fillText(q2 >= 0 ? '+' : '−', p2.x, p2.y + 1);

    // Labels
    ctx.fillStyle = '#737373';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`Q₁ = ${q1 > 0 ? '+' : ''}${q1} μC`, 10, 18);
    ctx.fillText(`Q₂ = ${q2 > 0 ? '+' : ''}${q2} μC`, 10, 30);
    ctx.fillText(`r = ${(r / 40).toFixed(2)} m`, 10, 42);
    ctx.fillText(`|F| = ${F.toExponential(2)} N`, 10, 54);
    ctx.fillText(`${sign > 0 ? 'Repulsive' : 'Attractive'}`, 10, 66);
  }, [q1, q2, p1, p2]);

  const handleMouse = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);
    if (dragging === 1) setP1({ x, y });
    if (dragging === 2) setP2({ x, y });
  };

  return (
    <canvas ref={canvasRef} width={300} height={200} className="w-full rounded-lg cursor-crosshair"
      style={{ background: '#080818' }}
      onMouseDown={(e) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        const x = (e.clientX - rect.left) * (canvas.width / rect.width);
        const y = (e.clientY - rect.top) * (canvas.height / rect.height);
        const d1 = Math.hypot(x - p1.x, y - p1.y);
        const d2 = Math.hypot(x - p2.x, y - p2.y);
        if (d1 < 20) setDragging(1);
        else if (d2 < 20) setDragging(2);
      }}
      onMouseMove={handleMouse}
      onMouseUp={() => setDragging(null)}
    />
  );
}

export default function Part2Electrostatics() {
  const [coulombQ1, setCoulombQ1] = useState(2);
  const [coulombQ2, setCoulombQ2] = useState(-3);
  const [capA, setCapA] = useState(0.01);
  const [capD, setCapD] = useState(0.001);
  const [capKappa, setCapKappa] = useState(1);

  const eps0 = 8.854e-12;
  const capacitance = (capKappa * eps0 * capA) / capD;

  return (
    <Section id="electrostatics" icon={<Zap className="w-5 h-5" />} title="Part 2: Electrostatics (Ch. 4&#8211;6)" color="#ef4444">
      <p className="text-sm text-[#a3a3a3] leading-relaxed">
        &quot;We shall begin with those fundamental concepts applicable to static electric fields in free space.&quot; &#8212; Sadiku &#167;4.1
        An electrostatic field is produced by a <strong className="text-white">static charge distribution</strong>.
        The two fundamental governing laws are <strong className="text-white">Coulomb&apos;s Law</strong> and <strong className="text-white">Gauss&apos;s Law</strong>.
      </p>

      {/* 4.2 Coulomb's Law */}
      <EMCard title="4.2 Coulomb&apos;s Law and Field Intensity" accent="#ef4444">
        <p className="text-xs text-[#a3a3a3] mb-3">The force <strong className="text-white">F</strong> between two point charges Q&#8321; and Q&#8322; is: (1) along the line joining them, (2) directly proportional to Q&#8321;Q&#8322;, (3) inversely proportional to the square of distance R.</p>
        <Formula name="Coulomb&apos;s Law (Scalar)" formula="F = Q&#8321;Q&#8322; / 4&#960;&#949;&#8320;R&#178;" vars="F in Newtons | &#949;&#8320; = 8.854 &#215; 10&#8315;&#185;&#178; F/m | 1/4&#960;&#949;&#8320; = 9 &#215; 10&#8313; m/F" />
        <Formula name="Vector Form" formula="F&#8321;&#8322; = Q&#8321;Q&#8322;(r&#8322; &#8722; r&#8321;) / 4&#960;&#949;&#8320;|r&#8322; &#8722; r&#8321;|&#179;"
          vars="Force on Q&#8322; due to Q&#8321;. F&#8322;&#8321; = &#8722;F&#8321;&#8322; (Newton&apos;s third law). Like charges repel, unlike charges attract." />
        <Formula name="Electric Field Intensity E" formula="E = F/Q = Q(r &#8722; r&apos;) / 4&#960;&#949;&#8320;|r &#8722; r&apos;|&#179;"
          vars="E in V/m or N/C | Force per unit charge on a test charge Q &#8594; 0" />
        <Formula name="Superposition" formula="E = &#8721; Q&#8342;(r &#8722; r&#8342;) / 4&#960;&#949;&#8320;|r &#8722; r&#8342;|&#179;"
          vars="For N point charges: vector sum of individual fields" />
      </EMCard>

      {/* Coulomb Interactive */}
      <EMCard title="Interactive: Draggable Charges with Force Arrows" accent="#ef4444">
        <CoulombCanvas q1={coulombQ1} q2={coulombQ2} />
        <div className="grid grid-cols-2 gap-4 mt-3">
          <EMControl label="Q₁" value={coulombQ1} unit="μC" min={-10} max={10} step={0.5} color="#ef4444" onChange={setCoulombQ1} />
          <EMControl label="Q₂" value={coulombQ2} unit="μC" min={-10} max={10} step={0.5} color="#3b82f6" onChange={setCoulombQ2} />
        </div>
        <p className="text-[9px] text-[#525252] mt-2">Drag the charges to change distance. Red = positive, Blue = negative.</p>
      </EMCard>

      <WorkedExample
        title="Point charges 1 mC and &#8722;2 mC at (3,2,&#8722;1) and (&#8722;1,&#8722;1,4). Find force on 10-nC charge at (0,3,1)."
        steps={[
          "R&#8321; = (0&#8722;3)a&#8341; + (3&#8722;2)a&#129; + (1&#8722;(&#8722;1))a&#8342; = &#8722;3a&#8341; + a&#129; + 2a&#8342;, |R&#8321;| = &#8730;(9+1+4) = &#8730;14",
          "R&#8322; = (0&#8722;(&#8722;1))a&#8341; + (3&#8722;(&#8722;1))a&#129; + (1&#8722;4)a&#8342; = a&#8341; + 4a&#129; &#8722; 3a&#8342;, |R&#8322;| = &#8730;(1+16+9) = &#8730;26",
          "F&#8321; = (10&#215;10&#8315;&#185;)(10&#8315;&#179;)(&#8722;3a&#8341;+a&#129;+2a&#8342;) / 4&#960;&#949;&#8320;(14&#8730;14) = k&#8321;(&#8722;3a&#8341;+a&#129;+2a&#8342;)",
          "F&#8322; = (10&#215;10&#8315;&#185;)(&#8722;2&#215;10&#8315;&#179;)(a&#8341;+4a&#129;&#8722;3a&#8342;) / 4&#960;&#949;&#8320;(26&#8730;26) = k&#8322;(a&#8341;+4a&#129;&#8722;3a&#8342;)",
          "F = F&#8321; + F&#8322; = <strong>&#8722;10.52a&#8341; &#8722; 3.20a&#129; + 4.62a&#8342; mN</strong>"
        ]}
        answer="F = &#8722;10.52a&#8341; &#8722; 3.20a&#129; + 4.62a&#8342; mN. E = F/Q = &#8722;1.052a&#8341; &#8722; 0.320a&#129; + 0.462a&#8342; kV/m."
      />
      <PracticeExercise title="Point charges 5 nC and &#8722;2 nC at (2,0,4) and (&#8722;3,0,5). Find (a) force on 1-nC charge at (1,&#8722;3,7), (b) E at that point."
        answer="(a) F = 2.06a&#8341; &#8722; 1.03a&#129; + 2.06a&#8342; nN. (b) E = 2.06a&#8341; &#8722; 1.03a&#129; + 2.06a&#8342; V/m." />

      {/* 4.3 Continuous Distributions */}
      <EMCard title="4.3 Electric Fields Due to Continuous Charge Distributions" accent="#ef4444">
        <div className="grid grid-cols-3 gap-2 mb-3">
          <div className="p-2 rounded text-center text-[10px]" style={{ background: 'rgba(255,255,255,0.03)' }}>
            <div className="text-[#00d4ff] font-semibold">Line</div>
            <div className="text-[#d4d4d4] font-mono">&#961;&#8343; (C/m)</div>
            <div className="text-[#737373]">dQ = &#961;&#8343; dl</div>
          </div>
          <div className="p-2 rounded text-center text-[10px]" style={{ background: 'rgba(255,255,255,0.03)' }}>
            <div className="text-[#7c3aed] font-semibold">Surface</div>
            <div className="text-[#d4d4d4] font-mono">&#961;&#8342; (C/m&#178;)</div>
            <div className="text-[#737373]">dQ = &#961;&#8342; dS</div>
          </div>
          <div className="p-2 rounded text-center text-[10px]" style={{ background: 'rgba(255,255,255,0.03)' }}>
            <div className="text-[#f59e0b] font-semibold">Volume</div>
            <div className="text-[#d4d4d4] font-mono">&#961;&#8341; (C/m&#179;)</div>
            <div className="text-[#737373]">dQ = &#961;&#8341; dv</div>
          </div>
        </div>
        <Formula name="Infinite Line Charge (z-axis)" formula="E = &#961;&#8343; / 2&#960;&#949;&#8320;&#961; &#183; a&#961;"
          vars="Key result: E falls off as 1/&#961;, not 1/&#961;&#178;! | &#961; = perpendicular distance" />
        <Formula name="Infinite Sheet" formula="E = &#961;&#8342; / 2&#949;&#8320; &#183; a&#8342;"
          vars="Uniform E field: magnitude independent of distance from sheet!" />
        <Formula name="Ring of Charge (z-axis)" formula="E = &#961;&#8343;a h / 2&#949;&#8320;(h&#178;+a&#178;)&#185;/&#178; &#183; a&#8342;"
          vars="h = height above ring, a = ring radius | Radial components cancel by symmetry; only z survives" />
      </EMCard>

      <WorkedExample
        title="Ring of charge &#961;&#8343; = 5 mC/m, radius a = 2 m, z = 0 plane. Find E at (0,0,3)."
        steps={[
          "By symmetry: dE&#961; from opposite dQ elements cancel; only dE&#8342; survives",
          "dE&#8342; = dQ cos&#952; / 4&#960;&#949;&#8320;R&#178; where R = &#8730;(h&#178;+a&#178;), cos&#952; = h/R",
          "E&#8342; = &#961;&#8343;ah / 4&#960;&#949;&#8320;(h&#178;+a&#178;)&#185;/&#178; &#8747; d&#966; = &#961;&#8343;ah / 2&#949;&#8320;(h&#178;+a&#178;)&#185;/&#178;",
          "= (5&#215;10&#8315;&#179;)(2)(3) / 2(8.854&#215;10&#8315;&#185;&#178;)(9+4)&#185;/&#178;",
          "= 30&#215;10&#8315;&#179; / (17.708&#215;10&#8315;&#185;&#178; &#215; 46.87) = <strong>3.61a&#8342; MV/m</strong>"
        ]}
        answer="E = 3.61 a&#8342; MV/m. The radial components perfectly cancel by symmetry."
      />

      {/* 4.5 Gauss's Law */}
      <EMCard title="4.5 Gauss&apos;s Law &#8212; Maxwell&apos;s 1st Equation" accent="#ef4444">
        <Formula name="Integral Form (Maxwell&apos;s 1st)" formula="&#8750; D &#183; dS = Q&#8345;&#8273;&#8346; = &#8747; &#961;&#8341; dv"
          vars="Total electric flux through any closed surface equals total charge enclosed. D in C/m&#178;." />
        <Formula name="Differential Form" formula="&#8711; &#183; D = &#961;&#8341;"
          vars="Divergence of D equals volume charge density at that point." />

        <div className="overflow-x-auto mt-3">
          <table className="w-full text-[10px]">
            <thead><tr className="border-b border-white/10">
              <th className="text-left py-1.5 px-2 text-[#737373]">Distribution</th>
              <th className="text-left py-1.5 px-2 text-[#737373]">Gaussian Surface</th>
              <th className="text-left py-1.5 px-2 text-[#737373]">Result</th>
            </tr></thead>
            <tbody>
              <tr className="border-b border-white/5">
                <td className="py-1.5 px-2 text-[#a3a3a3]">Point Q</td>
                <td className="py-1.5 px-2 text-[#a3a3a3]">Sphere radius r</td>
                <td className="py-1.5 px-2 text-[#d4d4d4] font-mono">D = Q/4&#960;r&#178; &#183; a&#8341;</td>
              </tr>
              <tr className="border-b border-white/5">
                <td className="py-1.5 px-2 text-[#a3a3a3]">Infinite line &#961;&#8343;</td>
                <td className="py-1.5 px-2 text-[#a3a3a3]">Cylinder radius &#961;</td>
                <td className="py-1.5 px-2 text-[#d4d4d4] font-mono">D = &#961;&#8343;/2&#960;&#961; &#183; a&#961;</td>
              </tr>
              <tr className="border-b border-white/5">
                <td className="py-1.5 px-2 text-[#a3a3a3]">Infinite sheet &#961;&#8342;</td>
                <td className="py-1.5 px-2 text-[#a3a3a3]">Pillbox</td>
                <td className="py-1.5 px-2 text-[#d4d4d4] font-mono">D = &#961;&#8342;/2 &#183; a&#8342;</td>
              </tr>
              <tr className="border-b border-white/5">
                <td className="py-1.5 px-2 text-[#a3a3a3]">Uniform sphere (r&lt;a)</td>
                <td className="py-1.5 px-2 text-[#a3a3a3]">Sphere radius r</td>
                <td className="py-1.5 px-2 text-[#d4d4d4] font-mono">D = &#961;&#8341;r/3 &#183; a&#8341;</td>
              </tr>
            </tbody>
          </table>
        </div>
      </EMCard>

      <WorkedExample
        title="Planes x=0 and x=d carry &#961;&#8342; and &#8722;&#961;&#8342;. Derive D and E in all three regions."
        steps={[
          "For x &lt; 0: pillbox encloses x=0 sheet only. D = &#8722;&#961;&#8342;/2 a&#8341; (leftward)",
          "For 0 &lt; x &lt; d: pillbox encloses both sheets. D = &#961;&#8342; a&#8341; (rightward from x=0 dominates)",
          "For x &gt; d: pillbox encloses both. D = 0 (equal and opposite contributions cancel)",
          "E = D/&#949;&#8320; in free space: E = &#961;&#8342;/&#949;&#8320; a&#8341; between plates, E = 0 elsewhere"
        ]}
        answer="D = 0 (x&lt;0, x&gt;d), D = &#961;&#8342; a&#8341; (0&lt;x&lt;d). Uniform field between plates, zero outside."
      />

      {/* 4.7 Electric Potential */}
      <EMCard title="4.7 Electric Potential V" accent="#ef4444">
        <Formula name="Potential Difference" formula="V&#8341;&#8342; = &#8722;&#8747;&#8341;&#8342; E &#183; dl = V&#8341; &#8722; V&#8342;"
          vars="Work per unit charge moving from A to B against E. V in Volts." />
        <Formula name="Point Charge Potential" formula="V = Q / 4&#960;&#949;&#8320;r"
          vars="V &#8594; 0 as r &#8594; &#8734; (reference at infinity)" />
        <Formula name="E = &#8722;&#8711;V (Maxwell&apos;s 2nd)" formula="E = &#8722;&#8711;V = &#8722;&#8706;V/&#8706;x a&#8341; &#8722; &#8706;V/&#8706;y a&#129; &#8722; &#8706;V/&#8706;z a&#8342;"
          vars="E always points from high V to low V. Perpendicular to equipotential surfaces." />
      </EMCard>

      {/* 4.9 Electric Dipole */}
      <EMCard title="4.9 Electric Dipole" accent="#ef4444">
        <Formula name="Dipole Moment" formula="p = Q &#183; d"
          vars="p in C&#183;m, directed from &#8722;Q to +Q" />
        <Formula name="Dipole Potential (r &gt;&gt; d)" formula="V = Qd cos&#952; / 4&#960;&#949;&#8320;r&#178; = p cos&#952; / 4&#960;&#949;&#8320;r&#178;"
          vars="Falls as 1/r&#178; (monopole falls as 1/r)" />
        <Formula name="Dipole E-field" formula="E&#8341; = 2p cos&#952;/4&#960;&#949;&#8320;r&#179;,  E&#952; = p sin&#952;/4&#960;&#949;&#8320;r&#179;"
          vars="Falls as 1/r&#179;. Characteristic figure-8 flux line pattern." />
      </EMCard>

      {/* 4.10 Energy Density */}
      <EMCard title="4.10 Energy Density in Electrostatic Fields" accent="#ef4444">
        <Formula name="Energy Density" formula="w&#8341; = &#189; D &#183; E = &#189; &#949;&#8320;E&#178;"
          vars="w&#8341; in J/m&#179; | Total energy: W&#8341; = &#189; &#8747; D&#183;E dv = &#189; &#8747; &#961;&#8341;V dv" />
        <Formula name="Capacitor Energy" formula="W&#8341; = &#189;CV&#178; = Q&#178;/2C = &#189;QV"
          vars="Energy stored in the electric field between capacitor plates" />
      </EMCard>

      {/* Chapter 5 — Materials */}
      <EMCard title="Ch. 5: Electric Fields in Material Space" accent="#7c3aed">
        <p className="text-xs text-[#a3a3a3] mb-3">&quot;We shall extend the concepts of the previous chapter to electric fields in material space.&quot; &#8212; Sadiku &#167;5.1</p>

        <Formula name="Conduction Current (Ohm&apos;s Law, point form)" formula="J = &#963;E"
          vars="J in A/m&#178;, &#963; in S/m (conductivity). Macro form: V = IR, R = &#8467;/&#963;S" />
        <Formula name="Polarization" formula="P = &#949;&#8320;&#967;&#8341;E"
          vars="&#967;&#8341; = electric susceptibility. Bound charges: &#961;&#8341;&#8343; = &#8722;&#8711;&#183;P, &#961;&#8342;&#8343; = P&#183;a&#8342;" />
        <Formula name="Dielectric Constant" formula="&#949;&#8341; = &#949;/&#949;&#8320; = 1 + &#967;&#8341;"
          vars="&#949;&#8341; &#8805; 1 always | D = &#949;E = &#949;&#8320;&#949;&#8341;E" />
        <Formula name="Boundary Conditions (Dielectric-Dielectric)" formula="E&#8321;&#8341; = E&#8322;&#8341;,  D&#8321;&#8342; &#8722; D&#8322;&#8342; = &#961;&#8342;"
          vars="Tangential E is continuous. Normal D jumps by surface charge. If &#961;&#8342; = 0: &#949;&#8321;E&#8321;&#8342; = &#949;&#8322;E&#8322;&#8342;." />
        <Formula name="Law of Refraction" formula="tan &#952;&#8321; / tan &#952;&#8322; = &#949;&#8341;&#8321; / &#949;&#8341;&#8322;"
          vars="E-lines bend at dielectric interface like light refracts at optical boundary." />
        <Formula name="Relaxation Time" formula="T&#8341; = &#949;/&#963;"
          vars="Time for charge to decay to 37% of initial. Copper: ~10&#8315;&#185;&#8313; s. Mica: ~10&#8309; s (~15 hours)." />
      </EMCard>

      {/* Chapter 6 — BV Problems */}
      <EMCard title="Ch. 6: Boundary-Value Problems" accent="#10b981">
        <Formula name="Poisson&apos;s Equation" formula="&#8711;&#178;V = &#8722;&#961;&#8341;/&#949;"
          vars="General form with charge density present" />
        <Formula name="Laplace&apos;s Equation" formula="&#8711;&#178;V = 0"
          vars="Charge-free region. In Cartesian: &#8706;&#178;V/&#8706;x&#178; + &#8706;&#178;V/&#8706;y&#178; + &#8706;&#178;V/&#8706;z&#178; = 0" />

        <div className="overflow-x-auto mt-3">
          <table className="w-full text-[10px]">
            <thead><tr className="border-b border-white/10">
              <th className="text-left py-1.5 px-2 text-[#737373]">Capacitor</th>
              <th className="text-left py-1.5 px-2 text-[#737373]">Formula</th>
            </tr></thead>
            <tbody>
              <tr className="border-b border-white/5"><td className="py-1.5 px-2 text-[#a3a3a3]">Parallel plate</td><td className="py-1.5 px-2 text-[#d4d4d4] font-mono">C = &#949;A/d</td></tr>
              <tr className="border-b border-white/5"><td className="py-1.5 px-2 text-[#a3a3a3]">Coaxial</td><td className="py-1.5 px-2 text-[#d4d4d4] font-mono">C = 2&#960;&#949;&#8467;/ln(b/a)</td></tr>
              <tr className="border-b border-white/5"><td className="py-1.5 px-2 text-[#a3a3a3]">Spherical</td><td className="py-1.5 px-2 text-[#d4d4d4] font-mono">C = 4&#960;&#949;ab/(b&#8722;a)</td></tr>
            </tbody>
          </table>
        </div>
      </EMCard>

      {/* Capacitor Interactive */}
      <EMCard title="Interactive: Parallel Plate Capacitor" accent="#ef4444">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <EMControl label="Plate Area A" value={capA} unit="m&#178;" min={0.001} max={0.1} step={0.001} color="#00d4ff" onChange={setCapA} />
          <EMControl label="Separation d" value={capD} unit="mm" min={0.1} max={10} step={0.1} onChange={v => setCapD(v / 1000)} color="#7c3aed" />
          <EMControl label="Dielectric &#949;&#8341;" value={capKappa} unit="" min={1} max={100} step={0.5} color="#10b981" onChange={setCapKappa} />
        </div>
        <div className="mt-3 text-center p-3 rounded-lg" style={{ background: 'rgba(239,68,68,0.06)' }}>
          <span className="text-[10px] text-[#737373]">Capacitance C = &#949;&#8341;&#949;&#8320;A/d = </span>
          <span className="text-lg font-mono font-bold text-[#ef4444]">{(capacitance * 1e12).toFixed(2)} pF</span>
        </div>
      </EMCard>

      <Applications items={[
        "CRT displays use electrostatic deflection: electron beams are steered by E-fields between charged plates",
        "Capacitive keyboards detect finger proximity by measuring capacitance change (&#916;C ~ &#949;&#8341; of finger vs air)",
        "ECG/EEG measure tiny bioelectric potentials (mV/μV) created by charge separation across cell membranes",
        "Electrostatic paint spraying: charged paint particles follow E-field lines to coat even complex surfaces evenly",
      ]} />

      <DidYouKnow>
        The human body can store roughly 10&#8315;&#185; C of static charge on a dry day &#8212; enough to produce a 10,000 V
        spark when touching a doorknob! The energy is tiny (~0.005 J), but the voltage is impressive because
        C = Q/V and the body&apos;s capacitance to ground is only ~100 pF. That&apos;s why V = Q/C = 10&#8315;&#185;/10&#8315;&#185;&#8304; = 10,000 V.
      </DidYouKnow>

      <MiniQuiz questions={[
        { question: "Gauss's law: the total electric flux through a closed surface depends only on:", options: ["A) The surface area", "B) The enclosed charge", "C) The shape", "D) External charges"], correct: 1, explanation: "&#8750; D&#183;dS = Q_enc. Only enclosed charge matters &#8212; not shape, size, or external charges." },
        { question: "Inside a conductor at electrostatic equilibrium:", options: ["A) E is maximum", "B) E = 0", "C) V is maximum", "D) Charge is uniformly distributed"], correct: 1, explanation: "E = 0 inside conductor. Charges redistribute on surface until interior field cancels." },
        { question: "The boundary condition for tangential E at a dielectric interface:", options: ["A) E&#8321;&#8341; = 2E&#8322;&#8341;", "B) E&#8321;&#8341; = E&#8322;&#8341;", "C) D&#8321;&#8341; = D&#8322;&#8341;", "D) &#949;&#8321;E&#8321;&#8341; = &#949;&#8322;E&#8322;&#8341;"], correct: 1, explanation: "Tangential E is always continuous across any interface." },
      ]} />
    </Section>
  );
}
