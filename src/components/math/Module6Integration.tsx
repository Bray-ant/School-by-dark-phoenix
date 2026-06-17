"use client";

import { useState } from 'react';
import { Divide } from 'lucide-react';
import { MSection, MCard, MFormula, WorkedEx, Caution, Exercises, MQuiz } from './shared';

export default function Module6Integration() {
  const [fn, setFn] = useState<'x2' | 'sin' | 'exp'>('x2');
  const [a, setA] = useState(0);
  const [b, setB] = useState(2);

  const f = (x: number) => fn === 'x2' ? x * x : fn === 'sin' ? Math.sin(x) : Math.exp(x);
  const trueVal = fn === 'x2' ? (b * b * b - a * a * a) / 3 : fn === 'sin' ? (-Math.cos(b) + Math.cos(a)) : (Math.exp(b) - Math.exp(a));
  const trap = (b - a) * (f(a) + f(b)) / 2;
  const mid = (b - a) * f((a + b) / 2);
  const simp = (b - a) * (f(a) + 4 * f((a + b) / 2) + f(b)) / 6;

  return (
    <MSection id="integration" icon={<Divide className="w-5 h-5" />} title="Module 6: Engineering Integration &amp; Applications" color="#10b981">
      <p className="text-sm text-[#a3a3a3] leading-relaxed">
        Integration computes areas, volumes, work, centroids, and moments in engineering.
        Numerical methods (trapezoidal, Simpson's) approximate integrals when closed-form solutions are impossible.
      </p>

      <MCard title="6.1 Fundamental Techniques" accent="#10b981">
        <MFormula name="Power Rule" formula="&#8741; x&#8319; dx = x&#8319;&#8330;&#185;/(n+1) + C,  n &#8800; &#8722;1" note="Most basic rule. Extends to all real n except &#8722;1." />
        <MFormula name="Integration by Parts" formula="&#8741; u dv = uv &#8722; &#8741; v du" note="Choose u by LIATE: Log, Inverse trig, Algebraic, Trig, Exponential." />
        <MFormula name="Substitution" formula="&#8741; f(g(x))g&apos;(x) dx = &#8741; f(u) du" note="u = g(x), du = g&apos;(x)dx. Key skill: recognizing the pattern." />
        <MFormula name="Partial Fractions" formula="P(x)/Q(x) = &#8721; A&#8331;/(x&#8722;r&#8331;) + ..." note="For rational functions. Factor Q, decompose, integrate each term." />

        <WorkedEx title="&#8741; x e&#8331; dx by parts." steps={[
          "u = x, dv = e&#8331;dx &#8594; du = dx, v = e&#8331;",
          "&#8741; x e&#8331; dx = x e&#8331; &#8722; &#8741; e&#8331; dx",
          "= x e&#8331; &#8722; e&#8331; + C",
          "= e&#8331;(x &#8722; 1) + C"
        ]} answer="e&#8331;(x &#8722; 1) + C" />
        <WorkedEx title="&#8741; sin&#178;(x) dx." steps={[
          "Use identity: sin&#178;(x) = (1 &#8722; cos(2x))/2",
          "&#8741; sin&#178;(x) dx = &#8741; (1/2 &#8722; cos(2x)/2) dx",
          "= x/2 &#8722; sin(2x)/4 + C"
        ]} answer="x/2 &#8722; sin(2x)/4 + C" />
        <Exercises items={[
          { q: "&#8741; x ln(x) dx.", level: 'Easy' },
          { q: "&#8741; dx/(x&#178; &#8722; 1) using partial fractions.", level: 'Medium' },
          { q: "&#8741; e&#8331; sin(x) dx (integrate by parts twice).", level: 'Hard' },
        ]} />
      </MCard>

      <MCard title="6.2 Improper Integrals" accent="#10b981">
        <MFormula name="Infinite Limit" formula="&#8741;&#8334;&#8734; f(x) dx = lim&#8338;&#8594;&#8734; &#8741;&#8334;&#8338; f(x) dx" note="Take limit. If limit exists = finite, integral converges." />
        <MFormula name="Unbounded Integrand" formula="&#8741;&#8334;&#8338; f(x) dx = lim&#8339;&#8594;a&#8314; &#8741;&#8339;&#8338; f(x) dx" note="If f &#8594; &#8734; at x = a, split at singularity." />
        <MFormula name="p-test (infinite)" formula="&#8741;&#8321;&#8734; dx/x&#8319; converges iff p &gt; 1" note="Fundamental test. Analogous to p-series." />
        <MFormula name="Comparison Test" formula="0 &#8804; f(x) &#8804; g(x): if &#8741; g converges, then &#8741; f converges" note="If &#8741; f diverges, then &#8741; g diverges (contrapositive)." />
        <WorkedEx title="Does &#8741;&#8321;&#8734; dx/x&#178; converge? If so, evaluate." steps={[
          "p = 2 &gt; 1 &#8594; converges by p-test",
          "&#8741;&#8321;&#8734; x&#8315;&#178; dx = lim&#8338;&#8594;&#8734; [&#8722;x&#8315;&#185;]&#8321;&#8338;",
          "= lim&#8338;&#8594;&#8734; (&#8722;1/b + 1) = 1"
        ]} answer="Converges to 1." />
        <Exercises items={[
          { q: "Does &#8741;&#8321;&#8734; dx/x&#179;/&#178; converge? Evaluate if yes.", level: 'Easy' },
          { q: "Does &#8741;&#8320;&#8321; dx/&#8730;x converge?", level: 'Medium' },
          { q: "Does &#8741;&#8320;&#8734; dx/(x&#178;+1) converge? Evaluate.", level: 'Hard' },
        ]} />
      </MCard>

      <MCard title="6.3 Numerical Integration" accent="#10b981">
        <MFormula name="Trapezoidal Rule" formula="&#8741;&#8334;&#8338; f(x) dx &#8776; (b&#8722;a)/2 &#183; [f(a) + f(b)]" note="Error: &#8722;(b&#8722;a)&#179;/12 &#183; f&apos;&apos;(&#958;). Exact for linear functions." />
        <MFormula name="Midpoint Rule" formula="&#8741;&#8334;&#8338; f(x) dx &#8776; (b&#8722;a) &#183; f((a+b)/2)" note="Error: (b&#8722;a)&#179;/24 &#183; f&apos;&apos;(&#958;). Often better than trapezoidal." />
        <MFormula name="Simpson&apos;s Rule" formula="&#8741;&#8334;&#8338; f(x) dx &#8776; (b&#8722;a)/6 &#183; [f(a) + 4f(m) + f(b)]" note="m = (a+b)/2. Error: &#8722;(b&#8722;a)&#8309;/2880 &#183; f&#8308;(&#958;). Exact for cubics." />

        <div className="mt-3 p-3 rounded-lg" style={{ background: 'rgba(16,185,129,0.06)' }}>
          <div className="text-[10px] text-[#10b981] mb-2">Interactive: Numerical Integration Comparison</div>
          <div className="flex gap-2 mb-2">
            {[{ k: 'x2' as const, l: 'x²' }, { k: 'sin' as const, l: 'sin(x)' }, { k: 'exp' as const, l: 'eˣ' }].map(o => (
              <button key={o.k} onClick={() => setFn(o.k)} className={`px-2 py-1 rounded text-[10px] ${fn === o.k ? 'bg-[#10b981]/20 text-[#10b981]' : 'bg-white/5 text-[#737373]'}`}>{o.l}</button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-[10px] text-[#737373]">a = {a.toFixed(1)}</label><input type="range" min={0} max={3} step={0.1} value={a} onChange={e => setA(Number(e.target.value))} className="w-full accent-[#10b981]" /></div>
            <div><label className="text-[10px] text-[#737373]">b = {b.toFixed(1)}</label><input type="range" min={0.5} max={5} step={0.1} value={b} onChange={e => setB(Number(e.target.value))} className="w-full accent-[#10b981]" /></div>
          </div>
          <div className="text-center mt-2 space-y-0.5">
            <div className="text-[10px] font-mono text-[#a3a3a3]">True: {trueVal.toFixed(6)}</div>
            <div className="text-[10px] font-mono text-[#f59e0b]">Trapezoidal: {trap.toFixed(6)} (err: {Math.abs(trap - trueVal).toFixed(6)})</div>
            <div className="text-[10px] font-mono text-[#3b82f6]">Midpoint: {mid.toFixed(6)} (err: {Math.abs(mid - trueVal).toFixed(6)})</div>
            <div className="text-[10px] font-mono text-[#10b981]">Simpson: {simp.toFixed(6)} (err: {Math.abs(simp - trueVal).toFixed(6)})</div>
          </div>
        </div>

        <WorkedEx title="Approximate &#8741;&#8320;&#185; x&#178; dx using trapezoidal and Simpson's rules." steps={[
          "True: &#8741;&#8320;&#185; x&#178; dx = 1/3 &#8776; 0.3333",
          "Trapezoidal: (1/2)[0 + 1] = 0.5. Error = 0.1667",
          "Simpson: (1/6)[0 + 4(0.5)&#178; + 1] = (1/6)[0 + 1 + 1] = 1/3",
          "Simpson gives <strong>exact</strong> answer (x&#178; is degree 2, Simpson exact for degree &#8804; 3)"
        ]} answer="Trapezoidal: 0.5 (error 50%). Simpson: 1/3 exact." />
        <Caution>Simpson's rule requires <strong>even number of subintervals</strong> (odd number of points). Don't apply it blindly. For composite rules, divide [a,b] into n equal subintervals first.</Caution>
        <Exercises items={[
          { q: "Approximate &#8741;&#8320;&#185; e&#8331; dx using trapezoidal rule.", level: 'Easy' },
          { q: "Use Simpson's rule with n=4 for &#8741;&#8320;&#185; dx/(1+x&#178;).", level: 'Medium' },
          { q: "Compare trapezoidal error bound for &#8741;&#8320;&#185; sin(x) dx.", level: 'Hard' },
        ]} />
      </MCard>

      <MCard title="6.4 Engineering Applications" accent="#10b981">
        <MFormula name="Area Between Curves" formula="A = &#8741;&#8334;&#8338; [f(x) &#8722; g(x)] dx" note="f(x) &#8805; g(x) on [a,b]." />
        <MFormula name="Volume of Revolution" formula="V = &#120529; &#8741;&#8334;&#8338; [f(x)]&#178; dx" note="Disk method: rotating y=f(x) about x-axis." />
        <MFormula name="Arc Length" formula="L = &#8741;&#8334;&#8338; &#8730;(1 + [f&apos;(x)]&#178;) dx" note="Pythagorean theorem applied to infinitesimal segments." />
        <MFormula name="Center of Mass (x̄)" formula="x̄ = (1/A) &#8741;&#8334;&#8338; x f(x) dx" note="A = &#8741; f(x) dx. First moment divided by total area." />
        <MFormula name="Work by Variable Force" formula="W = &#8741;&#8334;&#8338; F(x) dx" note="F(x) = force as function of position." />
        <WorkedEx title="Find the volume when y = &#8730;x from x=0 to x=4 is rotated about x-axis." steps={[
          "V = &#120529; &#8741;&#8320;&#8316; (&#8730;x)&#178; dx = &#120529; &#8741;&#8320;&#8316; x dx",
          "= &#120529; [x&#178;/2]&#8320;&#8316; = &#120529; (16/2 &#8722; 0) = 8&#120529;"
        ]} answer="V = 8&#120529; &#8776; 25.13 cubic units" />
        <Exercises items={[
          { q: "Area between y = x&#178; and y = x.", level: 'Easy' },
          { q: "Volume of sphere radius R by disk method.", level: 'Medium' },
          { q: "Arc length of y = cosh(x) from 0 to 1.", level: 'Hard' },
        ]} />
      </MCard>

      <MQuiz questions={[
        { question: "&#8741; x e&#8331; dx by parts gives:", options: ["A) e&#8331;(x+1) + C", "B) e&#8331;(x&#8722;1) + C", "C) x e&#8331; + C", "D) e&#8331;/x + C"], correct: 1, explanation: "u=x, dv=e&#8331;dx &#8594; du=dx, v=e&#8331;. &#8741; = x e&#8331; &#8722; e&#8331; + C = e&#8331;(x&#8722;1) + C." },
        { question: "Simpson's rule is exact for polynomials of degree:", options: ["A) 1", "B) 2", "C) 3", "D) 5"], correct: 2, explanation: "Simpson's rule is exact for polynomials up to degree 3 (cubics)." },
        { question: "&#8741;&#8321;&#8734; dx/x&#8319; converges when:", options: ["A) p &lt; 1", "B) p &gt; 1", "C) p = 1", "D) All p"], correct: 1, explanation: "The p-test for improper integrals: converges iff p &gt; 1. At p=1 (harmonic), diverges." },
      ]} />
    </MSection>
  );
}
