"use client";

import { FunctionSquare } from 'lucide-react';
import { MSection, MCard, MFormula, WorkedEx, Caution, Exercises, MQuiz, MTable } from './shared';
import MathText from '../MathText';

export default function Module1Multivariable() {
  return (
    <MSection id="multivariable" icon={<FunctionSquare className="w-5 h-5" />} title="Module 1: Multivariable Functions &amp; Differential Calculus" color="#f97316">
      <p className="text-sm text-[#a3a3a3] leading-relaxed">
        Imagine standing on a hilly terrain. Your height at any position <MathText text="$(x, y)$" /> is <MathText text="$f(x, y)$" />. Multivariable calculus answers:
        how steep is the hill right here? In which direction should I walk to climb fastest?
      </p>

      <MCard title="1.1 Level Sets &amp; Pre-images" accent="#f97316">
        <p className="text-xs text-[#a3a3a3] mb-3">
          A <strong className="text-white">level set</strong> <MathText text="$N_c(f) = \\{x \\in D : f(x) = c\\}$" /> is all inputs giving the same output <MathText text="$c$" />.
          Think of contour lines on a topographic map &mdash; every point on a contour is at the same altitude.
        </p>
        <MFormula name="Level Set" formula="N_c(f) = \\{x \\in D : f(x) = c\\}" note="Pre-image of a single point. $f^{-1}(A)$ = all inputs mapping into set $A$." />
        <WorkedEx title="$f(x,y) = x^2 + y^2$. Find level set for $c = 4$." steps={["Set $f(x,y) = c$: $x^2 + y^2 = 4$", "This is a circle of radius $\\sqrt{4} = 2$ centered at origin"]} answer="Circle: $x^2 + y^2 = 4$, radius $2$" />
        <WorkedEx title="$g(x,y) = x^2 - y$. Find level set for $c = 1$." steps={["$x^2 - y = 1 \\rightarrow y = x^2 - 1$", "Parabola shifted down by 1 unit"]} answer="Parabola: $y = x^2 - 1$" />
        <Caution>Students confuse pre-image <MathText text="$f^{-1}(A)$" /> (mapping into a <em>set</em> <MathText text="$A$" />) with level set (single value <MathText text="$c$" />). Level set = pre-image of a point.</Caution>
        <Exercises items={[
          { q: "Find the level set of $f(x,y) = 2x + 3y$ for $c = 6$. What shape?", level: 'Easy' },
          { q: "For $f(x,y) = x^2 + y^2$, find $f^{-1}([0,1])$. Describe geometrically.", level: 'Medium' },
          { q: "For $f(x,y,z) = x^2 + y^2 + z^2$, describe level sets for $c > 0$, $c = 0$, $c < 0$.", level: 'Hard' },
        ]} />
      </MCard>

      <MCard title="1.2 Limits in Several Variables" accent="#f97316">
        <p className="text-sm text-[#a3a3a3] mb-3">In 1D you approach from 2 directions (left/right). In 2D you can approach from <strong className="text-white">infinitely many paths</strong>. The limit only exists if all paths agree.</p>
        <MFormula name="Limit Definition" formula="\\lim_{x \\to x_0} f(x) = L" note="Must hold for ALL paths approaching $x_0$. One counterexample disproves." />
        <WorkedEx title="$f(x,y) = \\frac{x^2-y^2}{x^2+y^2}$ as $(x,y)\\to(0,0)$" steps={[
          "Along $y = 0$: $f(x,0) = \\frac{x^2}{x^2} = 1$",
          "Along $x = 0$: $f(0,y) = -\\frac{y^2}{y^2} = -1$",
          "Along $y = x$: $f(x,x) = \\frac{0}{2x^2} = 0$",
          "Three different values $\\rightarrow$ limit does NOT exist"
        ]} answer="Limit DNE (different paths give $1$, $-1$, $0$)" />
        <WorkedEx title="$g(x,y) = \\frac{2x^2y}{x^2+y^2}$ as $(x,y)\\to(0,0)$" steps={[
          "Use bound: $\\frac{x^2}{x^2+y^2} \\le 1$ always",
          "$|g(x,y)| = |2y| \\cdot \\frac{x^2}{x^2+y^2} \\le 2|y|$",
          "As $(x,y)\\to(0,0)$, $|y|\\to 0$, so $g(x,y)\\to 0$ by squeeze theorem"
        ]} answer="Limit = $0$ (proven by bounding inequality)" />
        <Caution>Checking only a few paths is <strong>not enough</strong> to prove a limit exists. You need an <MathText text="\\varepsilon" />&ndash;<MathText text="\\delta" /> argument or bounding. Paths can only <em>disprove</em> existence.</Caution>
        <Exercises items={[
          { q: "Show $\\lim_{(x,y)\\to(0,0)} (x+y)$ exists and equals $0$.", level: 'Easy' },
          { q: "Determine whether $\\lim_{(x,y)\\to(0,0)} \\frac{xy}{x^2+y^2}$ exists.", level: 'Medium' },
          { q: "Prove via $\\varepsilon$&ndash;$\\delta$ that $\\lim_{(x,y)\\to(0,0)} \\frac{x^2y}{x^2+y^2} = 0$.", level: 'Hard' },
        ]} />
      </MCard>

      <MCard title="1.3 Partial Derivatives" accent="#f97316">
        <MFormula name="Partial Derivative" formula="\\frac{\\partial f}{\\partial x_i} = \\lim_{h \\to 0} \\frac{f(x+he_i) - f(x)}{h}" note="Rate of change when only $x_i$ varies, others held constant." />
        <WorkedEx title="$f(x,y) = x^2y + \\sin(xy)$. Compute $\\frac{\\partial f}{\\partial x}$ and $\\frac{\\partial f}{\\partial y}$." steps={[
          "$\\frac{\\partial f}{\\partial x}$: treat $y$ as constant. $\\frac{\\partial}{\\partial x}(x^2y) = 2xy$. $\\frac{\\partial}{\\partial x}(\\sin(xy)) = y\\cos(xy)$",
          "$\\rightarrow \\frac{\\partial f}{\\partial x} = 2xy + y\\cos(xy)$",
          "$\\frac{\\partial f}{\\partial y}$: treat $x$ as constant. $\\frac{\\partial}{\\partial y}(x^2y) = x^2$. $\\frac{\\partial}{\\partial y}(\\sin(xy)) = x\\cos(xy)$",
          "$\\rightarrow \\frac{\\partial f}{\\partial y} = x^2 + x\\cos(xy)$"
        ]} answer="$\\frac{\\partial f}{\\partial x} = 2xy + y\\cos(xy)$; $\\frac{\\partial f}{\\partial y} = x^2 + x\\cos(xy)$" />
        <Caution><strong>Partial derivatives existing does NOT imply continuity.</strong> Example: <MathText text="$f(x,y) = \\frac{xy}{x^2+y^2}$ ($f(0,0)=0$)" />. Both partials exist at origin, but <MathText text="$f$" /> is not continuous there (approach <MathText text="$y=x$" /> gives <MathText text="$\\frac{1}{2} \\ne 0$" />).</Caution>
        <Exercises items={[
          { q: "Compute $\\frac{\\partial f}{\\partial x}$ and $\\frac{\\partial f}{\\partial y}$ for $f(x,y) = 3x^2y - y^3$.", level: 'Easy' },
          { q: "All partials of $f(x,y,z) = x\\ln(yz) + z^2x$.", level: 'Medium' },
          { q: "For $f(x,y) = \\frac{xy}{x^2+y^2}$ ($f(0,0)=0$), show partials exist at $(0,0)$ but $f$ is not continuous.", level: 'Hard' },
        ]} />
      </MCard>

      <MCard title="1.4 Gradient &amp; Directional Derivatives" accent="#f97316">
        <MFormula name="Gradient" formula="\\nabla f(x) = \\left(\\frac{\\partial f}{\\partial x_1}, \\ldots, \\frac{\\partial f}{\\partial x_n}\\right)" note="Points in direction of steepest ascent. Magnitude = rate of steepest increase." />
        <MFormula name="Directional Derivative" formula="D_v f(x) = \\nabla f(x) \\cdot v = \\|\\nabla f(x)\\| \\cos \\theta" note="$v$ must be a unit vector. Rate of change in direction $v$." />
        <MTable headers={[
          "Angle $\\theta$ between $v$ and $\\nabla f$",
          "Result"
        ]} rows={[
          [
            "$\\theta = 0$ (same direction)",
            "Maximum increase = $\\|\\nabla f\\|$"
          ],
          [
            "$\\theta = 90^\\circ$ (perpendicular)",
            "No change &mdash; tangent to level curve"
          ],
          [
            "$\\theta = 180^\\circ$ (opposite)",
            "Maximum decrease = $-\\|\\nabla f\\|$"
          ]
        ]} />
        <WorkedEx title="$f(x,y) = x^2+y^2$. Find $D_v f$ at $(1,2)$ in direction $v = (3/5, 4/5)$." steps={[
          "$\\nabla f(1,2) = (2\\cdot 1, 2\\cdot 2) = (2, 4)$",
          "$D_v f = (2,4) \\cdot (3/5, 4/5) = 6/5 + 16/5 = 22/5$"
        ]} answer="$D_v f = 22/5 = 4.4$" />
        <Exercises items={[
          { q: "Find $\\nabla f$ for $f(x,y) = x^3 - 2xy^2$. Evaluate at $(1,1)$.", level: 'Easy' },
          { q: "Directional derivative of $f(x,y) = x^2y + y^3$ at $(2,1)$ in direction $v = (1/\\sqrt{2}, 1/\\sqrt{2})$.", level: 'Medium' },
          { q: "In which direction does $f(x,y,z) = xyz$ increase most rapidly at $(1,2,3)$? What is the max rate?", level: 'Hard' },
        ]} />
      </MCard>

      <MCard title="1.5 Hessian Matrix &amp; Second Derivatives" accent="#f97316">
        <MFormula name="Hessian Matrix" formula="H_f(x) = \\left[\\frac{\\partial^2 f}{\\partial x_i \\partial x_j}\\right]" note="Matrix of all second partials. Captures curvature &mdash; convex, concave, or saddle." />
        <MFormula name="Schwarz&apos;s Theorem" formula="\\text{If } f_{ij} \\text{ continuous near } x, \\text{ then } f_{ij} = f_{ji} \\text{ (Hessian is symmetric)}" note="Order of differentiation does not matter for smooth functions." />
        <WorkedEx title="$f(x,y) = x^2 + 4xy + y^2$. Compute Hessian." steps={[
          "$f_1 = 2x + 4y$, $f_2 = 4x + 2y$",
          "$f_{11} = 2$, $f_{22} = 2$, $f_{12} = f_{21} = 4$",
          "$H_f = \\begin{bmatrix} 2 & 4 \\\\ 4 & 2 \\end{bmatrix}$"
        ]} answer="$H_f = \\begin{bmatrix} 2 & 4 \\\\ 4 & 2 \\end{bmatrix}$ (symmetric)" />
        <Exercises items={[
          { q: "Hessian of $f(x,y) = x^3 + y^3$.", level: 'Easy' },
          { q: "Verify Schwarz for $f(x,y) = x^2y^3$.", level: 'Medium' },
          { q: "Full Hessian of $f(x,y,z) = e^x\\sin(y) + z^2x$. Verify symmetry.", level: 'Hard' },
        ]} />
      </MCard>

      <MCard title="1.6 Total Differentiability &amp; Tangent Planes" accent="#f97316">
        <MFormula name="Tangent Plane" formula="z = f(x_0,y_0) + f_x(x_0,y_0)(x-x_0) + f_y(x_0,y_0)(y-y_0)" note="Best linear approximation to $f$ near $(x_0, y_0)$." />
        <MFormula name="Hierarchy" formula="\\text{Total diff} \\Rightarrow \\text{Continuous} \\Rightarrow \\text{Partials exist}" note="None of the reverse implications hold in general!" />
        <WorkedEx title="$f(x,y) = x^2+y^2$ at $(1,2)$. Find tangent plane." steps={[
          "$f(1,2) = 5$, $f_x(1,2) = 2$, $f_y(1,2) = 4$",
          "$z = 5 + 2(x-1) + 4(y-2) = 2x + 4y - 5$"
        ]} answer="$z = 2x + 4y - 5$" />
        <Exercises items={[
          { q: "Tangent plane to $f(x,y) = xy$ at $(2, 3)$.", level: 'Easy' },
          { q: "Tangent plane to $f(x,y) = e^x\\cos(y)$ at $(0, 0)$.", level: 'Medium' },
          { q: "Show $f(x,y) = \\frac{xy}{\\sqrt{x^2+y^2}}$ ($f(0,0)=0$) is NOT totally differentiable at $(0,0)$.", level: 'Hard' },
        ]} />
      </MCard>

      <MQuiz questions={[
        { question: "The level set of $f(x,y) = x^2 + y^2$ for $c = 9$ is:", options: ["A) A line", "B) A circle of radius 3", "C) A parabola", "D) An ellipse"], correct: 1, explanation: "$x^2 + y^2 = 9 \\rightarrow$ circle radius $\\sqrt{9} = 3$ centered at origin." },
        { question: "To prove a limit in 2D does NOT exist, you should:", options: ["A) Use $\\varepsilon$&ndash;$\\delta$ proof", "B) Find two paths with different limits", "C) Check 100 paths", "D) Compute partial derivatives"], correct: 1, explanation: "Finding two paths with different limits is sufficient to disprove existence." },
        { question: "The gradient $\\nabla f$ always points in the direction of:", options: ["A) Steepest descent", "B) Steepest ascent", "C) The origin", "D) Zero change"], correct: 1, explanation: "$\\nabla f$ points in the direction of maximum increase of $f$." },
      ]} />
    </MSection>
  );
}
