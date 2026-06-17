"use client";

import { Grid3X3 } from 'lucide-react';
import { MSection, MCard, MFormula, WorkedEx, Caution, Exercises, MQuiz, MTable } from './shared';

export default function Module2LinearAlgebra() {
  return (
    <MSection id="linear-algebra" icon={<Grid3X3 className="w-5 h-5" />} title="Module 2: Linear Algebra — Eigenvalues, Definiteness &amp; Extrema" color="#8b5cf6">
      <p className="text-sm text-[#a3a3a3] leading-relaxed">
        Eigenvectors are special directions where a linear transformation only scales (not rotates) the vector.
        Combined with the Hessian, they let us classify critical points as minima, maxima, or saddle points.
      </p>

      <MCard title="2.1 Eigenvalues &amp; Eigenvectors" accent="#8b5cf6">
        <MFormula name="Definition" formula="Av = &#955;v,  v &#8800; 0" note="v = eigenvector (direction), &#955; = eigenvalue (scaling factor)." />
        <MFormula name="Characteristic Equation" formula="det(A &#8722; &#955;I) = 0" note="Solve for &#955;. For n&#215;n matrix: n eigenvalues (possibly repeated or complex)." />
        <WorkedEx title="A = [[2,0],[0,3]]. Find eigenvalues and eigenvectors." steps={[
          "det(A &#8722; &#955;I) = (2&#8722;&#955;)(3&#8722;&#955;) = 0",
          "&#955;&#8321; = 2, &#955;&#8322; = 3",
          "For &#955;=2: (A&#8722;2I)v = 0 &#8594; v&#8321; = (1,0)",
          "For &#955;=3: (A&#8722;3I)v = 0 &#8594; v&#8322; = (0,1)"
        ]} answer="&#955;&#8321;=2, v&#8321;=(1,0); &#955;&#8322;=3, v&#8322;=(0,1)" />
        <WorkedEx title="A = [[2,1],[1,2]]. Find eigenvalues, eigenvectors, verify A = QDQ&#7787;." steps={[
          "det(A&#8722;&#955;I) = (2&#8722;&#955;)&#178; &#8722; 1 = &#955;&#178; &#8722; 4&#955; + 3 = 0",
          "&#955;&#8321; = 3, &#955;&#8322; = 1",
          "&#955;=3: v&#8321; = (1,1)/&#8730;2;  &#955;=1: v&#8322; = (1,&#8722;1)/&#8730;2",
          "Q = [v&#8321;|v&#8322;], D = diag(3,1). Check: A = QDQ&#7787; &#9989;"
        ]} answer="&#955;&#8321;=3 (v&#8321;=(1,1)/&#8730;2), &#955;&#8322;=1 (v&#8322;=(1,&#8722;1)/&#8730;2). A = QDQ&#7787; verified." />
        <Exercises items={[
          { q: "Find eigenvalues of A = [[1,2],[0,3]].", level: 'Easy' },
          { q: "Find eigenvalues and eigenvectors of A = [[0,1],[&#8722;2,3]].", level: 'Medium' },
          { q: "For A = [[2,1],[1,2]], find eigenvalues, eigenvectors, and verify A = QDQ&#7787;.", level: 'Hard' },
        ]} />
      </MCard>

      <MCard title="2.2 Definiteness &amp; Convexity" accent="#8b5cf6">
        <p className="text-xs text-[#a3a3a3] mb-3">Classify symmetric matrices (and Hessians) by their eigenvalues:</p>
        <MTable headers={["Eigenvalues", "Definiteness", "Behavior"]} rows={[
          ["All &#955;&#8331; &gt; 0", "<span style='color:#10b981'>Positive definite</span>", "Strictly convex, local min"],
          ["All &#955;&#8331; &lt; 0", "<span style='color:#ef4444'>Negative definite</span>", "Strictly concave, local max"],
          ["Mixed signs", "<span style='color:#f59e0b'>Indefinite</span>", "Saddle point"],
          ["All &#955;&#8331; &#8805; 0", "<span style='color:#3b82f6'>Positive semidefinite</span>", "Convex (not strict)"],
        ]} />
        <WorkedEx title="A = [[2,1],[1,2]]. Classify." steps={[
          "Eigenvalues: &#955;&#8321;=3, &#955;&#8322;=1 (from previous example)",
          "Both positive &#8594; positive definite"
        ]} answer="Positive definite &#8594; strictly convex." />
        <Caution>For 2&#215;2 Hessian H = [[a,b],[b,c]]: definite if det(H) = ac&#8722;b&#178; &gt; 0. Then a &gt; 0 &#8594; positive definite, a &lt; 0 &#8594; negative definite. If det(H) &lt; 0 &#8594; indefinite (saddle).</Caution>
        <Exercises items={[
          { q: "Classify A = [[&#8722;3,0],[0,&#8722;5]].", level: 'Easy' },
          { q: "Classify A = [[1,2],[2,1]].", level: 'Medium' },
          { q: "For f(x,y) = 2x&#178; + 3xy + 2y&#178;, find Hessian and determine convexity.", level: 'Hard' },
        ]} />
      </MCard>

      <MCard title="2.3 Finding &amp; Classifying Extrema — Full Algorithm" accent="#8b5cf6">
        <div className="rounded-lg p-3 font-mono text-[11px] text-[#d4d4d4] leading-relaxed" style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.2)' }}>
          <div className="text-[10px] text-[#8b5cf6] uppercase mb-2">Algorithm</div>
          1. Compute &#8711;f(x)<br/>
          2. Solve &#8711;f(x) = 0 &#8594; critical points<br/>
          3. Compute Hessian Hf(x)<br/>
          4. Evaluate H at each critical point<br/>
          5. Check eigenvalues:<br/>
          &nbsp;&nbsp;&nbsp;&#183; All &#955; &gt; 0 &#8594; local minimum<br/>
          &nbsp;&nbsp;&nbsp;&#183; All &#955; &lt; 0 &#8594; local maximum<br/>
          &nbsp;&nbsp;&nbsp;&#183; Mixed &#8594; saddle point<br/>
          6. If f convex: local min = global min<br/>
          7. Check boundary if domain bounded
        </div>
        <WorkedEx title="f(x,y) = x&#179; &#8722; 3x + y&#178; &#8722; 2y. Find and classify critical points." steps={[
          "&#8711;f = (3x&#178; &#8722; 3, 2y &#8722; 2)",
          "Set = 0: 3x&#178; &#8722; 3 = 0 &#8594; x = &#177;1;  2y &#8722; 2 = 0 &#8594; y = 1",
          "Critical points: (1,1) and (&#8722;1,1)",
          "H = [[6x, 0], [0, 2]]",
          "At (1,1): H = [[6,0],[0,2]] &#8594; &#955;=6,2 (both +) &#8594; <strong>local min</strong>",
          "At (&#8722;1,1): H = [[&#8722;6,0],[0,2]] &#8594; &#955;=&#8722;6,2 (mixed) &#8594; <strong>saddle</strong>"
        ]} answer="(1,1): local minimum. (&#8722;1,1): saddle point." />
        <Exercises items={[
          { q: "Find and classify critical points of f(x,y) = x&#178; + y&#178; &#8722; 4x &#8722; 6y.", level: 'Easy' },
          { q: "Find and classify critical points of f(x,y) = x&#179; + y&#179; &#8722; 3xy.", level: 'Medium' },
          { q: "Find and classify all critical points of f(x,y) = x&#8308; + y&#8308; &#8722; 4xy.", level: 'Hard' },
        ]} />
      </MCard>

      <MQuiz questions={[
        { question: "The characteristic equation for finding eigenvalues is:", options: ["A) det(A) = 0", "B) det(A &#8722; &#955;I) = 0", "C) Av = 0", "D) tr(A) = 0"], correct: 1, explanation: "det(A &#8722; &#955;I) = 0 is the characteristic equation. Its roots are the eigenvalues." },
        { question: "If all eigenvalues of a Hessian are positive, the critical point is a:", options: ["A) Saddle", "B) Local maximum", "C) Local minimum", "D) Cannot determine"], correct: 2, explanation: "All positive eigenvalues &#8594; positive definite Hessian &#8594; local minimum." },
        { question: "For 2&#215;2 Hessian H = [[a,b],[b,c]], if det(H) &lt; 0:", options: ["A) Local min", "B) Local max", "C) Saddle point", "D) Inconclusive"], correct: 2, explanation: "det(H) = ac &#8722; b&#178; &lt; 0 means eigenvalues have opposite signs &#8594; indefinite &#8594; saddle." },
      ]} />
    </MSection>
  );
}
