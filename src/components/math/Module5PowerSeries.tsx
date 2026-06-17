"use client";

import { Infinity as InfiniteIcon } from 'lucide-react';
import { MSection, MCard, MFormula, WorkedEx, Caution, Exercises, MQuiz } from './shared';

export default function Module5PowerSeries() {
  return (
    <MSection id="power-series" icon={<InfiniteIcon className="w-5 h-5" />} title="Module 5: Power Series" color="#ec4899">
      <p className="text-sm text-[#a3a3a3] leading-relaxed">
        A power series is an infinite polynomial. It can represent functions, be differentiated and integrated term-by-term,
        and provides a powerful tool for solving differential equations and computing function values.
      </p>

      <MCard title="5.1 Power Series Basics" accent="#ec4899">
        <MFormula name="General Form" formula="&#8721; a&#8345;(x&#8722;a)&#8345; = a&#8320; + a&#8321;(x&#8722;a) + a&#8322;(x&#8722;a)&#178; + ..." note="Centered at a. Coefficients a&#8345; can be any sequence." />
        <MFormula name="Radius of Convergence" formula="R = 1/limsup |a&#8345;|&#185;/&#8345;" note="Converges for |x&#8722;a| &lt; R. Diverges for |x&#8722;a| &gt; R." />
        <MFormula name="Interval of Convergence" formula="(a&#8722;R, a+R) plus possibly endpoints" note="Always test endpoints x = a &#177; R separately." />

        <WorkedEx title="Find R and interval for &#8721; x&#8345;/n." steps={[
          "a&#8345; = 1/n. |a&#8345;&#8330;&#185;/a&#8345;| = n/(n+1) &#8594; 1",
          "R = 1/1 = 1",
          "At x = 1: &#8721; 1/n (harmonic) &#8594; <strong>diverges</strong>",
          "At x = &#8722;1: &#8721; (&#8722;1)&#8345;/n = &#8722;1 + 1/2 &#8722; 1/3 + ... (alternating harmonic) &#8594; <strong>converges</strong>",
          "Interval: <strong>[&#8722;1, 1)</strong>"
        ]} answer="R = 1, Interval = [&#8722;1, 1)" />

        <div className="grid grid-cols-2 gap-2 mt-3">
          {[
            { test: 'Geometric', cond: '|r| &lt; 1', sum: 'a/(1&#8722;r)' },
            { test: 'p-series', cond: 'p &gt; 1', sum: 'converges' },
            { test: 'Alternating', cond: 'b&#8345; &#8595; 0', sum: 'converges' },
            { test: 'Ratio', cond: 'L &lt; 1', sum: 'converges' },
          ].map((t, i) => (
            <div key={i} className="p-2 rounded-lg text-[10px]" style={{ background: 'rgba(255,255,255,0.03)' }}>
              <span className="text-[#ec4899] font-semibold">{t.test}</span>
              <div className="text-[#a3a3a3]">Cond: {t.cond}</div>
              <div className="text-[#737373]">Sum: {t.sum}</div>
            </div>
          ))}
        </div>
        <Exercises items={[
          { q: "Find R for &#8721; (&#8722;1)&#8345; x&#8345;/n&#178;.", level: 'Easy' },
          { q: "Find R and interval for &#8721; (x&#8722;2)&#8345;/n&#178;.", level: 'Medium' },
          { q: "For what x does &#8721; n&#178;(x+1)&#8345; converge?", level: 'Hard' },
        ]} />
      </MCard>

      <MCard title="5.2 Operations on Power Series" accent="#ec4899">
        <MFormula name="Differentiation" formula="d/dx &#8721; a&#8345;x&#8345; = &#8721; n a&#8345; x&#8345;&#8315;&#185;" note="Term-by-term differentiation. R stays the same (endpoints may change)." />
        <MFormula name="Integration" formula="&#8747; &#8721; a&#8345;x&#8345; dx = C + &#8721; a&#8345; x&#8345;&#8330;&#185;/(n+1)" note="Term-by-term integration. R stays the same (endpoints may change)." />
        <MFormula name="Multiplication (Cauchy Product)" formula="(&#8721; a&#8345;x&#8345;)(&#8721; b&#8345;x&#8345;) = &#8721; c&#8345;x&#8345; where c&#8345; = &#8721;&#8334;&#8345; a&#8334;b&#8345;&#8315;&#8334;" note="Like polynomial multiplication extended to infinite series." />
        <WorkedEx title="Find the power series for 1/(1&#8722;x)&#178; by differentiating 1/(1&#8722;x)." steps={[
          "1/(1&#8722;x) = &#8721; x&#8345; for |x| &lt; 1",
          "d/dx: 1/(1&#8722;x)&#178; = &#8721; n x&#8345;&#8315;&#185; = &#8721; (n+1) x&#8345;",
          "= 1 + 2x + 3x&#178; + 4x&#179; + ..."
        ]} answer="1/(1&#8722;x)&#178; = &#8721; (n+1)x&#8345; for |x| &lt; 1" />
        <Exercises items={[
          { q: "Integrate &#8721; x&#8345; term-by-term to find series for &#8722;ln(1&#8722;x).", level: 'Easy' },
          { q: "Find series for arctan(x) by integrating 1/(1+x&#178;).", level: 'Medium' },
          { q: "Multiply (&#8721; x&#8345;) &#183; (&#8721; x&#8345;) and identify the coefficient pattern.", level: 'Hard' },
        ]} />
      </MCard>

      <MCard title="5.3 Applications: Solving ODEs" accent="#ec4899">
        <p className="text-xs text-[#a3a3a3] mb-3">Assume solution y = &#8721; a&#8345;x&#8345;, substitute into ODE, equate coefficients.</p>
        <WorkedEx title="Solve y&apos;&apos; + y = 0 by power series." steps={[
          "Let y = &#8721; a&#8345;x&#8345;. Then y&apos;&apos; = &#8721; n(n&#8722;1)a&#8345;x&#8345;&#8315;&#178; = &#8721; (n+2)(n+1)a&#8345;&#8330;&#185;x&#8345;",
          "y&apos;&apos; + y = &#8721;[(n+2)(n+1)a&#8345;&#8330;&#185; + a&#8345;]x&#8345; = 0",
          "Recurrence: a&#8345;&#8330;&#185; = &#8722;a&#8345;/[(n+2)(n+1)]",
          "a&#8320; arbitrary &#8594; a&#8322; = &#8722;a&#8320;/2!, a&#8324; = a&#8320;/4!, ...",
          "a&#8321; arbitrary &#8594; a&#8323; = &#8722;a&#8321;/3!, a&#8325; = a&#8321;/5!, ...",
          "y = a&#8320;cos(x) + a&#8321;sin(x)"
        ]} answer="y = a&#8320; cos(x) + a&#8321; sin(x) &#8212; recovered the known solution!" />
        <Caution>Power series methods work best near ordinary points. At <strong>regular singular points</strong>, use the Frobenius method instead.</Caution>
        <Exercises items={[
          { q: "Solve y&apos; = 2y by power series.", level: 'Easy' },
          { q: "Solve y&apos;&apos; &#8722; y = 0 by power series.", level: 'Medium' },
          { q: "Solve y&apos;&apos; + xy = 0 (Airy equation) up to x&#8310;.", level: 'Hard' },
        ]} />
      </MCard>

      <MQuiz questions={[
        { question: "The geometric series &#8721; x&#8345; converges for:", options: ["A) All x", "B) |x| &lt; 1", "C) |x| &gt; 1", "D) x = 0 only"], correct: 1, explanation: "Geometric series converges iff |x| &lt; 1, sum = 1/(1&#8722;x)." },
        { question: "Term-by-term differentiation of a power series:", options: ["A) Changes R", "B) Preserves R", "C) Doubles R", "D) Halves R"], correct: 1, explanation: "Differentiation and integration preserve the radius of convergence R (though endpoints may differ)." },
        { question: "The p-series &#8721; 1/n&#8319; converges when:", options: ["A) p &gt; 0", "B) p &gt; 1", "C) p &lt; 1", "D) p = 1"], correct: 1, explanation: "p-series converges iff p &gt; 1. At p = 1 (harmonic series), it diverges." },
      ]} />
    </MSection>
  );
}
