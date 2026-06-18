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
        <MFormula name="General Form" formula="\\sum a_n(x-a)^n = a_0 + a_1(x-a) + a_2(x-a)^2 + \\dots" note="Centered at $a$. Coefficients $a_n$ can be any sequence." />
        <MFormula name="Radius of Convergence" formula="R = 1/\\limsup |a_n|^{1/n}" note="Converges for $|x-a| &lt; R$. Diverges for $|x-a| &gt; R$." />
        <MFormula name="Interval of Convergence" formula="(a-R, a+R) \\text{ plus possibly endpoints}" note="Always test endpoints $x = a \\pm R$ separately." />

        <WorkedEx title="Find $R$ and interval for $\\sum x^n/n$." steps={[
          "$a_n = 1/n$. $|a_{n+1}/a_n| = n/(n+1) \\rightarrow 1$",
          "$R = 1/1 = 1$",
          "At $x = 1$: $\\sum 1/n$ (harmonic) $\\rightarrow$ <strong>diverges</strong>",
          "At $x = -1$: $\\sum (-1)^n/n = -1 + 1/2 - 1/3 + \\dots$ (alternating harmonic) $\\rightarrow$ <strong>converges</strong>",
          "Interval: <strong>$[-1, 1)$</strong>"
        ]} answer="$R = 1$, Interval = $[-1, 1)$" />

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
          { q: "Find $R$ for $\\sum (-1)^n x^n/n^2$.", level: 'Easy' },
          { q: "Find $R$ and interval for $\\sum (x-2)^n/n^2$.", level: 'Medium' },
          { q: "For what $x$ does $\\sum n^2(x+1)^n$ converge?", level: 'Hard' },
        ]} />
      </MCard>

      <MCard title="5.2 Operations on Power Series" accent="#ec4899">
        <MFormula name="Differentiation" formula="\\frac{d}{dx} \\sum a_n x^n = \\sum n a_n x^{n-1}" note="Term-by-term differentiation. $R$ stays the same (endpoints may change)." />
        <MFormula name="Integration" formula="\\int \\sum a_n x^n \\, dx = C + \\sum a_n \\frac{x^{n+1}}{n+1}" note="Term-by-term integration. $R$ stays the same (endpoints may change)." />
        <MFormula name="Multiplication (Cauchy Product)" formula="(\\sum a_n x^n)(\\sum b_n x^n) = \\sum c_n x^n \\text{ where } c_n = \\sum_{k=0}^{n} a_k b_{n-k}" note="Like polynomial multiplication extended to infinite series." />
        <WorkedEx title="Find the power series for $1/(1-x)^2$ by differentiating $1/(1-x)$." steps={[
          "$1/(1-x) = \\sum x^n$ for $|x| &lt; 1$",
          "$\\frac{d}{dx}$: $1/(1-x)^2 = \\sum n x^{n-1} = \\sum (n+1) x^n$",
          "$= 1 + 2x + 3x^2 + 4x^3 + \\dots$"
        ]} answer="$1/(1-x)^2 = \\sum (n+1)x^n$ for $|x| &lt; 1$" />
        <Exercises items={[
          { q: "Integrate $\\sum x^n$ term-by-term to find series for $-\\ln(1-x)$.", level: 'Easy' },
          { q: "Find series for $\\arctan(x)$ by integrating $1/(1+x^2)$.", level: 'Medium' },
          { q: "Multiply $(\\sum x^n) \\cdot (\\sum x^n)$ and identify the coefficient pattern.", level: 'Hard' },
        ]} />
      </MCard>

      <MCard title="5.3 Applications: Solving ODEs" accent="#ec4899">
        <p className="text-xs text-[#a3a3a3] mb-3">Assume solution y = &#8721; a&#8345;x&#8345;, substitute into ODE, equate coefficients.</p>
        <WorkedEx title="Solve $y'' + y = 0$ by power series." steps={[
          "Let $y = \\sum a_n x^n$. Then $y'' = \\sum n(n-1) a_n x^{n-2} = \\sum (n+2)(n+1) a_{n+1} x^n$",
          "$y'' + y = \\sum [(n+2)(n+1)a_{n+1} + a_n]x^n = 0$",
          "Recurrence: $a_{n+1} = -a_n/[(n+2)(n+1)]$",
          "$a_0$ arbitrary $\\rightarrow a_2 = -a_0/2!$, $a_4 = a_0/4!$, $\\dots$",
          "$a_1$ arbitrary $\\rightarrow a_3 = -a_1/3!$, $a_5 = a_1/5!$, $\\dots$",
          "$y = a_0\\cos(x) + a_1\\sin(x)$"
        ]} answer="$y = a_0 \\cos(x) + a_1 \\sin(x)$ &mdash; recovered the known solution!" />
        <Caution>Power series methods work best near ordinary points. At <strong>regular singular points</strong>, use the Frobenius method instead.</Caution>
        <Exercises items={[
          { q: "Solve $y' = 2y$ by power series.", level: 'Easy' },
          { q: "Solve $y'' - y = 0$ by power series.", level: 'Medium' },
          { q: "Solve $y'' + xy = 0$ (Airy equation) up to $x^6$.", level: 'Hard' },
        ]} />
      </MCard>

      <MQuiz questions={[
        { question: "The geometric series $\\sum x^n$ converges for:", options: ["A) All $x$", "B) $|x| &lt; 1$", "C) $|x| &gt; 1$", "D) $x = 0$ only"], correct: 1, explanation: "Geometric series converges iff $|x| &lt; 1$, sum = $1/(1-x)$." },
        { question: "Term-by-term differentiation of a power series:", options: ["A) Changes $R$", "B) Preserves $R$", "C) Doubles $R$", "D) Halves $R$"], correct: 1, explanation: "Differentiation and integration preserve the radius of convergence $R$ (though endpoints may differ)." },
        { question: "The p-series $\\sum 1/n^p$ converges when:", options: ["A) $p &gt; 0$", "B) $p &gt; 1$", "C) $p &lt; 1$", "D) $p = 1$"], correct: 1, explanation: "p-series converges iff $p &gt; 1$. At $p = 1$ (harmonic series), it diverges." },
      ]} />
    </MSection>
  );
}
