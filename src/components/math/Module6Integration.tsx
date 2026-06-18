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
        <MFormula name="Power Rule" formula="\\int x^n \\, dx = \\frac{x^{n+1}}{n+1} + C, \\quad n \\ne -1" note="Most basic rule. Extends to all real $n$ except $-1$." />
        <MFormula name="Integration by Parts" formula="\\int u \\, dv = uv - \\int v \\, du" note="Choose $u$ by LIATE: Log, Inverse trig, Algebraic, Trig, Exponential." />
        <MFormula name="Substitution" formula="\\int f(g(x)) g'(x) \\, dx = \\int f(u) \\, du" note="$u = g(x)$, $du = g'(x)\\,dx$. Key skill: recognizing the pattern." />
        <MFormula name="Partial Fractions" formula="\\frac{P(x)}{Q(x)} = \\sum \\frac{A_i}{x - r_i} + \\dots" note="For rational functions. Factor $Q$, decompose, integrate each term." />

        <WorkedEx title="$\\int x e^x \\, dx$ by parts." steps={[
          "$u = x,\\ dv = e^x \\, dx \\Rightarrow du = dx,\\ v = e^x$",
          "$\\int x e^x \\, dx = x e^x - \\int e^x \\, dx$",
          "$= x e^x - e^x + C$",
          "$= e^x(x - 1) + C$"
        ]} answer="$e^x(x - 1) + C$" />
        <WorkedEx title="$\\int \\sin^2(x) \\, dx$." steps={[
          "Use identity: $\\sin^2(x) = \\frac{1 - \\cos(2x)}{2}$",
          "$\\int \\sin^2(x) \\, dx = \\int \\left(\\frac{1}{2} - \\frac{\\cos(2x)}{2}\\right) dx$",
          "$= \\frac{x}{2} - \\frac{\\sin(2x)}{4} + C$"
        ]} answer="$\\frac{x}{2} - \\frac{\\sin(2x)}{4} + C$" />
        <Exercises items={[
          { q: "$\\int x \\ln(x) \\, dx$.", level: 'Easy' },
          { q: "$\\int \\frac{dx}{x^2 - 1}$ using partial fractions.", level: 'Medium' },
          { q: "$\\int e^x \\sin(x) \\, dx$ (integrate by parts twice).", level: 'Hard' },
        ]} />
      </MCard>

      <MCard title="6.2 Improper Integrals" accent="#10b981">
        <MFormula name="Infinite Limit" formula="\\int_a^\\infty f(x) \\, dx = \\lim_{b \\to \\infty} \\int_a^b f(x) \\, dx" note="Take limit. If limit exists = finite, integral converges." />
        <MFormula name="Unbounded Integrand" formula="\\int_a^b f(x) \\, dx = \\lim_{t \\to a^+} \\int_t^b f(x) \\, dx" note="If $f \\to \\infty$ at $x = a$, split at singularity." />
        <MFormula name="p-test (infinite)" formula="\\int_1^\\infty \\frac{dx}{x^p} \\text{ converges iff } p > 1" note="Fundamental test. Analogous to p-series." />
        <MFormula name="Comparison Test" formula="0 \\le f(x) \\le g(x): \\text{ if } \\int g \\text{ converges, then } \\int f \\text{ converges}" note="If $\\int f$ diverges, then $\\int g$ diverges (contrapositive)." />
        <WorkedEx title="Does $\\int_1^\\infty \\frac{dx}{x^2}$ converge? If so, evaluate." steps={[
          "$p = 2 > 1 \\Rightarrow$ converges by $p$-test",
          "$\\int_1^\\infty x^{-2} \\, dx = \\lim_{b \\to \\infty} \\left[-x^{-1}\\right]_1^b$",
          "$= \\lim_{b \\to \\infty} (-1/b + 1) = 1$"
        ]} answer="Converges to 1." />
        <Exercises items={[
          { q: "Does $\\int_1^\\infty \\frac{dx}{x^{3/2}}$ converge? Evaluate if yes.", level: 'Easy' },
          { q: "Does $\\int_0^1 \\frac{dx}{\\sqrt{x}}$ converge?", level: 'Medium' },
          { q: "Does $\\int_0^\\infty \\frac{dx}{x^2 + 1}$ converge? Evaluate.", level: 'Hard' },
        ]} />
      </MCard>

      <MCard title="6.3 Numerical Integration" accent="#10b981">
        <MFormula name="Trapezoidal Rule" formula="\\int_a^b f(x) \\, dx \\approx \\frac{b-a}{2} \\left[f(a) + f(b)\\right]" note="Error: $-\\frac{(b-a)^3}{12} f''(\\xi)$. Exact for linear functions." />
        <MFormula name="Midpoint Rule" formula="\\int_a^b f(x) \\, dx \\approx (b-a) \\cdot f\\left(\\frac{a+b}{2}\\right)" note="Error: $\\frac{(b-a)^3}{24} f''(\\xi)$. Often better than trapezoidal." />
        <MFormula name="Simpson&apos;s Rule" formula="\\int_a^b f(x) \\, dx \\approx \\frac{b-a}{6} \\left[f(a) + 4f(m) + f(b)\\right]" note="$m = \\frac{a+b}{2}$. Error: $-\\frac{(b-a)^5}{2880} f^{(4)}(\\xi)$. Exact for cubics." />

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

        <WorkedEx title="Approximate $\\int_0^1 x^2 \\, dx$ using trapezoidal and Simpson's rules." steps={[
          "True: $\\int_0^1 x^2 \\, dx = \\frac{1}{3} \\approx 0.3333$",
          "Trapezoidal: $\\frac{1}{2}[0 + 1] = 0.5$. Error $= 0.1667$",
          "Simpson: $\\frac{1}{6}[0 + 4(0.5)^2 + 1] = \\frac{1}{6}[0 + 1 + 1] = \\frac{1}{3}$",
          "Simpson gives <strong>exact</strong> answer ($x^2$ is degree 2, Simpson exact for degree $\\le 3$)"
        ]} answer="Trapezoidal: $0.5$ (error $50\\%$). Simpson: $\\frac{1}{3}$ exact." />
        <Caution>Simpson's rule requires <strong>even number of subintervals</strong> (odd number of points). Don't apply it blindly. For composite rules, divide [a,b] into n equal subintervals first.</Caution>
        <Exercises items={[
          { q: "Approximate $\\int_0^1 e^x \\, dx$ using trapezoidal rule.", level: 'Easy' },
          { q: "Use Simpson's rule with $n=4$ for $\\int_0^1 \\frac{dx}{1+x^2}$.", level: 'Medium' },
          { q: "Compare trapezoidal error bound for $\\int_0^1 \\sin(x) \\, dx$.", level: 'Hard' },
        ]} />
      </MCard>

      <MCard title="6.4 Engineering Applications" accent="#10b981">
        <MFormula name="Area Between Curves" formula="A = \\int_a^b [f(x) - g(x)] \\, dx" note="$f(x) \\ge g(x)$ on $[a,b]$." />
        <MFormula name="Volume of Revolution" formula="V = \\pi \\int_a^b [f(x)]^2 \\, dx" note="Disk method: rotating $y=f(x)$ about $x$-axis." />
        <MFormula name="Arc Length" formula="L = \\int_a^b \\sqrt{1 + [f'(x)]^2} \\, dx" note="Pythagorean theorem applied to infinitesimal segments." />
        <MFormula name="Center of Mass (x̄)" formula="\\bar{x} = \\frac{1}{A} \\int_a^b x f(x) \\, dx" note="$A = \\int f(x) \\, dx$. First moment divided by total area." />
        <MFormula name="Work by Variable Force" formula="W = \\int_a^b F(x) \\, dx" note="$F(x) =$ force as function of position." />
        <WorkedEx title="Find the volume when $y = \\sqrt{x}$ from $x=0$ to $x=4$ is rotated about $x$-axis." steps={[
          "$V = \\pi \\int_0^4 (\\sqrt{x})^2 \\, dx = \\pi \\int_0^4 x \\, dx$",
          "$= \\pi \\left[\\frac{x^2}{2}\\right]_0^4 = \\pi \\left(\\frac{16}{2} - 0\\right) = 8\\pi$"
        ]} answer="$V = 8\\pi \\approx 25.13$ cubic units" />
        <Exercises items={[
          { q: "Area between $y = x^2$ and $y = x$.", level: 'Easy' },
          { q: "Volume of sphere radius $R$ by disk method.", level: 'Medium' },
          { q: "Arc length of $y = \\cosh(x)$ from $0$ to $1$.", level: 'Hard' },
        ]} />
      </MCard>

      <MQuiz questions={[
        { question: "$\\int x e^x \\, dx$ by parts gives:", options: ["A) $e^x(x+1) + C$", "B) $e^x(x-1) + C$", "C) $x e^x + C$", "D) $e^x/x + C$"], correct: 1, explanation: "$u=x$, $dv=e^x \\, dx \\Rightarrow du=dx$, $v=e^x$. $\\int = x e^x - e^x + C = e^x(x-1) + C$." },
        { question: "Simpson's rule is exact for polynomials of degree:", options: ["A) 1", "B) 2", "C) 3", "D) 5"], correct: 2, explanation: "Simpson's rule is exact for polynomials up to degree $3$ (cubics)." },
        { question: "$\\int_1^\\infty \\frac{dx}{x^p}$ converges when:", options: ["A) $p &lt; 1$", "B) $p &gt; 1$", "C) $p = 1$", "D) All $p$"], correct: 1, explanation: "The $p$-test for improper integrals: converges iff $p &gt; 1$. At $p=1$ (harmonic), diverges." },
      ]} />
    </MSection>
  );
}
