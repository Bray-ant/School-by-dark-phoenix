"use client";

import { useState } from 'react';
import { Sigma } from 'lucide-react';
import { MSection, MCard, MFormula, WorkedEx, Caution, Exercises, MQuiz } from './shared';

export default function Module4Taylor() {
  const [xVal, setXVal] = useState(1);
  const [nTerms, setNTerms] = useState(4);
  const trueVal = Math.exp(xVal);
  let approx = 0;
  for (let k = 0; k <= nTerms; k++) approx += Math.pow(xVal, k) / factorial(k);
  const error = Math.abs(trueVal - approx);

  function factorial(n: number): number { return n <= 1 ? 1 : n * factorial(n - 1); }

  return (
    <MSection id="taylor" icon={<Sigma className="w-5 h-5" />} title="Module 4: Taylor Polynomials &amp; Series" color="#f59e0b">
      <p className="text-sm text-[#a3a3a3] leading-relaxed">
        Taylor polynomials approximate functions near a point using their derivatives. The more terms you include,
        the better the approximation. When you take infinitely many terms, you get a Taylor series.
      </p>

      <MCard title="4.1 Taylor Polynomials" accent="#f59e0b">
        <MFormula name="Taylor Polynomial (degree n at a)" formula="T&#8345;(x) = &#8721;&#8334;&#8345; f&#7517;&#7518;(a)/k! &#183; (x&#8722;a)&#7517;" note="Requires f to be n-times differentiable at a." />
        <MFormula name="Maclaurin Polynomial (a = 0)" formula="T&#8345;(x) = &#8721;&#8334;&#8345; f&#7517;&#7518;(0)/k! &#183; x&#7517;" note="Special case centered at origin. Often the simplest form." />
        <MFormula name="Taylor Remainder (Lagrange)" formula="R&#8345;(x) = f&#7518;&#8334;&#185;(c)/(n+1)! &#183; (x&#8722;a)&#8314;&#185;" note="c is between a and x. Controls approximation error." />

        <div className="grid grid-cols-2 gap-3 mt-3">
          <div className="p-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)' }}>
            <div className="text-[10px] text-[#f59e0b] mb-1">Maclaurin of e&#8331;</div>
            <div className="text-[10px] text-[#a3a3a3] font-mono">e&#8331; = 1 + x + x&#178;/2! + x&#179;/3! + ...</div>
          </div>
          <div className="p-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)' }}>
            <div className="text-[10px] text-[#f59e0b] mb-1">Maclaurin of sin(x)</div>
            <div className="text-[10px] text-[#a3a3a3] font-mono">sin(x) = x &#8722; x&#179;/3! + x&#8309;/5! &#8722; ...</div>
          </div>
          <div className="p-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)' }}>
            <div className="text-[10px] text-[#f59e0b] mb-1">Maclaurin of cos(x)</div>
            <div className="text-[10px] text-[#a3a3a3] font-mono">cos(x) = 1 &#8722; x&#178;/2! + x&#8310;/4! &#8722; ...</div>
          </div>
          <div className="p-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)' }}>
            <div className="text-[10px] text-[#f59e0b] mb-1">Maclaurin of ln(1+x)</div>
            <div className="text-[10px] text-[#a3a3a3] font-mono">ln(1+x) = x &#8722; x&#178;/2 + x&#179;/3 &#8722; ...</div>
          </div>
        </div>

        <div className="mt-3 p-3 rounded-lg" style={{ background: 'rgba(245,158,11,0.06)' }}>
          <div className="text-[10px] text-[#f59e0b] mb-2">Interactive: e&#8331; Taylor Approximation</div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-[10px] text-[#737373]">x = {xVal.toFixed(1)}</label><input type="range" min={-2} max={3} step={0.1} value={xVal} onChange={e => setXVal(Number(e.target.value))} className="w-full accent-[#f59e0b]" /></div>
            <div><label className="text-[10px] text-[#737373]">n = {nTerms} terms</label><input type="range" min={0} max={10} step={1} value={nTerms} onChange={e => setNTerms(Number(e.target.value))} className="w-full accent-[#f59e0b]" /></div>
          </div>
          <div className="text-center mt-2 space-y-0.5">
            <div className="text-[10px] font-mono text-[#a3a3a3]">True: e&#7519; = {trueVal.toFixed(6)}</div>
            <div className="text-[10px] font-mono text-[#f59e0b]">Approx: T&#8345;({xVal.toFixed(1)}) = {approx.toFixed(6)}</div>
            <div className="text-[10px] font-mono text-[#ef4444]">|Error| = {error.toFixed(8)}</div>
          </div>
        </div>

        <WorkedEx title="Find the 3rd degree Maclaurin polynomial for f(x) = e&#8331;." steps={[
          "f(0) = 1, f&apos;(0) = 1, f&apos;&apos;(0) = 1, f&apos;&apos;&apos;(0) = 1",
          "T&#8323;(x) = 1 + x + x&#178;/2! + x&#179;/3!",
          "= 1 + x + x&#178;/2 + x&#179;/6"
        ]} answer="T&#8323;(x) = 1 + x + x&#178;/2 + x&#179;/6" />
        <WorkedEx title="Approximate &#8730;e = e&#8314;/&#178; using T&#8323;." steps={[
          "T&#8323;(0.5) = 1 + 0.5 + (0.5)&#178;/2 + (0.5)&#179;/6",
          "= 1 + 0.5 + 0.25/2 + 0.125/6",
          "= 1 + 0.5 + 0.125 + 0.02083... = 1.64583...",
          "True &#8730;e &#8776; 1.64872. Error &#8776; 0.003"
        ]} answer="T&#8323;(0.5) &#8776; 1.646. True &#8776; 1.649. Error &#8776; 0.3%." />
        <Exercises items={[
          { q: "Find T&#8322;(x) for f(x) = cos(x) at a = 0.", level: 'Easy' },
          { q: "Find T&#8323;(x) for f(x) = ln(1+x) at a = 0.", level: 'Medium' },
          { q: "Use T&#8322; for sin(x) to estimate sin(0.1). Bound the error.", level: 'Hard' },
        ]} />
      </MCard>

      <MCard title="4.2 Convergence of Taylor Series" accent="#f59e0b">
        <MFormula name="Radius of Convergence" formula="R = 1/limsup |a&#8345;|&#185;/&#8345;" note="Series converges for |x&#8722;a| &lt; R, diverges for |x&#8722;a| &gt; R." />
        <MFormula name="Ratio Test" formula="L = lim |a&#8345;&#8330;&#185;/a&#8345;| &#183; |x|" note="If L &lt; 1: converges. L &gt; 1: diverges. L = 1: inconclusive." />

        <div className="grid grid-cols-2 gap-2 mt-3">
          {[
            { fn: 'e&#8331;', R: 'R = &#8734;', iv: '(&#8722;&#8734;, +&#8734;)' },
            { fn: 'sin(x), cos(x)', R: 'R = &#8734;', iv: '(&#8722;&#8734;, +&#8734;)' },
            { fn: '1/(1&#8722;x)', R: 'R = 1', iv: '(&#8722;1, 1)' },
            { fn: 'ln(1+x)', R: 'R = 1', iv: '(&#8722;1, 1]' },
          ].map((s, i) => (
            <div key={i} className="p-2 rounded-lg text-[10px]" style={{ background: 'rgba(255,255,255,0.03)' }}>
              <div className="text-[#f59e0b] font-semibold">{s.fn}</div>
              <div className="text-[#a3a3a3] font-mono">{s.R}</div>
              <div className="text-[#737373]">Interval: {s.iv}</div>
            </div>
          ))}
        </div>

        <Caution>At the <strong>endpoints</strong> (x = a &#177; R), the ratio test is inconclusive. You must test separately using comparison, integral, or alternating series tests.</Caution>

        <WorkedEx title="Find the radius of convergence of &#8721; x&#8345;/n!." steps={[
          "a&#8345; = 1/n!",
          "|a&#8345;&#8330;&#185;/a&#8345;| = n!/(n+1)! = 1/(n+1) &#8594; 0 as n &#8594; &#8734;",
          "L = 0 &#183; |x| = 0 &lt; 1 for all x",
          "R = &#8734; &#8594; converges everywhere"
        ]} answer="R = &#8734; (converges for all x &#8712; &#8477;)" />
        <Exercises items={[
          { q: "Find R for &#8721; n x&#8345;.", level: 'Easy' },
          { q: "Find R and interval for &#8721; x&#8345;/n.", level: 'Medium' },
          { q: "Find R for &#8721; n! x&#8345;.", level: 'Hard' },
        ]} />
      </MCard>

      <MQuiz questions={[
        { question: "The Maclaurin series for e&#8331; is:", options: ["A) &#8721; x&#7517;/n", "B) &#8721; x&#7517;/n!", "C) &#8721; n! x&#7517;", "D) &#8721; x&#7517;"], correct: 1, explanation: "e&#8331; = &#8721; x&#7517;/n! = 1 + x + x&#178;/2! + x&#179;/3! + ..." },
        { question: "The radius of convergence of the Taylor series for sin(x) is:", options: ["A) 1", "B) &#120529;", "C) &#8734;", "D) 0"], correct: 2, explanation: "sin(x) is entire (analytic everywhere), so R = &#8734;." },
        { question: "The remainder R&#8345;(x) in Lagrange form involves:", options: ["A) The (n+1)th derivative", "B) The nth derivative", "C) The first derivative", "D) No derivatives"], correct: 0, explanation: "R&#8345;(x) = f&#7518;&#8334;&#185;(c)/(n+1)! &#183; (x&#8722;a)&#8314;&#185; involves the (n+1)th derivative at some c." },
      ]} />
    </MSection>
  );
}
