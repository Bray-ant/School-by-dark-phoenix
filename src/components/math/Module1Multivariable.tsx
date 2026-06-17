"use client";

import { FunctionSquare } from 'lucide-react';
import { MSection, MCard, MFormula, WorkedEx, Caution, Exercises, MQuiz, MTable } from './shared';

export default function Module1Multivariable() {
  return (
    <MSection id="multivariable" icon={<FunctionSquare className="w-5 h-5" />} title="Module 1: Multivariable Functions &amp; Differential Calculus" color="#f97316">
      <p className="text-sm text-[#a3a3a3] leading-relaxed">
        Imagine standing on a hilly terrain. Your height at any position (x, y) is f(x, y). Multivariable calculus answers:
        how steep is the hill right here? In which direction should I walk to climb fastest?
      </p>

      <MCard title="1.1 Level Sets &amp; Pre-images" accent="#f97316">
        <p className="text-xs text-[#a3a3a3] mb-3">
          A <strong className="text-white">level set</strong> N&#8345;(f) = &#123;x &#8712; D : f(x) = c&#125; is all inputs giving the same output c.
          Think of contour lines on a topographic map &#8212; every point on a contour is at the same altitude.
        </p>
        <MFormula name="Level Set" formula="N&#8345;(f) = &#123;x &#8712; D : f(x) = c&#125;" note="Pre-image of a single point. f&#8315;&#185;(A) = all inputs mapping into set A." />
        <WorkedEx title="f(x,y) = x&#178; + y&#178;. Find level set for c = 4." steps={["Set f(x,y) = c: x&#178; + y&#178; = 4", "This is a circle of radius &#8730;4 = 2 centered at origin"]} answer="Circle: x&#178; + y&#178; = 4, radius 2" />
        <WorkedEx title="g(x,y) = x&#178; &#8722; y. Find level set for c = 1." steps={["x&#178; &#8722; y = 1 &#8594; y = x&#178; &#8722; 1", "Parabola shifted down by 1 unit"]} answer="Parabola: y = x&#178; &#8722; 1" />
        <Caution>Students confuse pre-image f&#8315;&#185;(A) (mapping into a <em>set</em> A) with level set (single value c). Level set = pre-image of a point.</Caution>
        <Exercises items={[
          { q: "Find the level set of f(x,y) = 2x + 3y for c = 6. What shape?", level: 'Easy' },
          { q: "For f(x,y) = x&#178; + y&#178;, find f&#8315;&#185;([0,1]). Describe geometrically.", level: 'Medium' },
          { q: "For f(x,y,z) = x&#178; + y&#178; + z&#178;, describe level sets for c &gt; 0, c = 0, c &lt; 0.", level: 'Hard' },
        ]} />
      </MCard>

      <MCard title="1.2 Limits in Several Variables" accent="#f97316">
        <p className="text-xs text-[#a3a3a3] mb-3">In 1D you approach from 2 directions (left/right). In 2D you can approach from <strong className="text-white">infinitely many paths</strong>. The limit only exists if all paths agree.</p>
        <MFormula name="Limit Definition" formula="lim&#8339;&#8594;&#8338; f(x) = L" note="Must hold for ALL paths approaching x&#8320;. One counterexample disproves." />
        <WorkedEx title="f(x,y) = (x&#178;&#8722;y&#178;)/(x&#178;+y&#178;) as (x,y)&#8594;(0,0)" steps={[
          "Along y = 0: f(x,0) = x&#178;/x&#178; = 1",
          "Along x = 0: f(0,y) = &#8722;y&#178;/y&#178; = &#8722;1",
          "Along y = x: f(x,x) = 0/(2x&#178;) = 0",
          "Three different values &#8594; limit does NOT exist"
        ]} answer="Limit DNE (different paths give 1, &#8722;1, 0)" />
        <WorkedEx title="g(x,y) = 2x&#178;y/(x&#178;+y&#178;) as (x,y)&#8594;(0,0)" steps={[
          "Use bound: x&#178;/(x&#178;+y&#178;) &#8804; 1 always",
          "|g(x,y)| = |2y| &#183; x&#178;/(x&#178;+y&#178;) &#8804; 2|y|",
          "As (x,y)&#8594;(0,0), |y|&#8594;0, so g(x,y)&#8594;0 by squeeze theorem"
        ]} answer="Limit = 0 (proven by bounding inequality)" />
        <Caution>Checking only a few paths is <strong>not enough</strong> to prove a limit exists. You need an &#949;&#8211;&#948; argument or bounding. Paths can only <em>disprove</em> existence.</Caution>
        <Exercises items={[
          { q: "Show lim&#8339;,&#8339;&#8594;(&#8320;,&#8320;) (x+y) exists and equals 0.", level: 'Easy' },
          { q: "Determine whether lim&#8339;,&#8339;&#8594;(&#8320;,&#8320;) xy/(x&#178;+y&#178;) exists.", level: 'Medium' },
          { q: "Prove via &#949;&#8211;&#948; that lim&#8339;,&#8339;&#8594;(&#8320;,&#8320;) x&#178;y/(x&#178;+y&#178;) = 0.", level: 'Hard' },
        ]} />
      </MCard>

      <MCard title="1.3 Partial Derivatives" accent="#f97316">
        <MFormula name="Partial Derivative" formula="&#8706;f/&#8706;x&#8331; = lim&#8337;&#8594;&#8320; [f(x+he&#8331;) &#8722; f(x)]/h" note="Rate of change when only x&#8331; varies, others held constant." />
        <WorkedEx title="f(x,y) = x&#178;y + sin(xy). Compute &#8706;f/&#8706;x and &#8706;f/&#8706;y." steps={[
          "&#8706;f/&#8706;x: treat y as constant. &#8706;/&#8706;x(x&#178;y) = 2xy. &#8706;/&#8706;x(sin(xy)) = y&#183;cos(xy)",
          "&#8594; &#8706;f/&#8706;x = 2xy + y&#183;cos(xy)",
          "&#8706;f/&#8706;y: treat x as constant. &#8706;/&#8706;y(x&#178;y) = x&#178;. &#8706;/&#8706;y(sin(xy)) = x&#183;cos(xy)",
          "&#8594; &#8706;f/&#8706;y = x&#178; + x&#183;cos(xy)"
        ]} answer="&#8706;f/&#8706;x = 2xy + ycos(xy); &#8706;f/&#8706;y = x&#178; + xcos(xy)" />
        <Caution><strong>Partial derivatives existing does NOT imply continuity.</strong> Example: f(x,y) = xy/(x&#178;+y&#178;) (f(0,0)=0). Both partials exist at origin, but f is not continuous there (approach y=x gives 1/2 &#8800; 0).</Caution>
        <Exercises items={[
          { q: "Compute &#8706;f/&#8706;x and &#8706;f/&#8706;y for f(x,y) = 3x&#178;y &#8722; y&#179;.", level: 'Easy' },
          { q: "All partials of f(x,y,z) = x&#183;ln(yz) + z&#178;.", level: 'Medium' },
          { q: "For f(x,y) = xy/(x&#178;+y&#178;) (f(0,0)=0), show partials exist at (0,0) but f is not continuous.", level: 'Hard' },
        ]} />
      </MCard>

      <MCard title="1.4 Gradient &amp; Directional Derivatives" accent="#f97316">
        <MFormula name="Gradient" formula="&#8711;f(x) = (&#8706;f/&#8706;x&#8321;, ..., &#8706;f/&#8706;x&#8345;)" note="Points in direction of steepest ascent. Magnitude = rate of steepest increase." />
        <MFormula name="Directional Derivative" formula="D&#8341;f(x) = &#8711;f(x) &#183; v = ||&#8711;f(x)|| cos &#952;" note="v must be a unit vector. Rate of change in direction v." />
        <MTable headers={["Angle &#952; between v and &#8711;f", "Result"]} rows={[
          ["&#952; = 0 (same direction)", "Maximum increase = ||&#8711;f||"],
          ["&#952; = 90&#176; (perpendicular)", "No change &#8212; tangent to level curve"],
          ["&#952; = 180&#176; (opposite)", "Maximum decrease = &#8722;||&#8711;f||"],
        ]} />
        <WorkedEx title="f(x,y) = x&#178;+y&#178;. Find D&#8341;f at (1,2) in direction v = (3/5, 4/5)." steps={[
          "&#8711;f(1,2) = (2&#183;1, 2&#183;2) = (2, 4)",
          "D&#8341;f = (2,4) &#183; (3/5, 4/5) = 6/5 + 16/5 = 22/5"
        ]} answer="D&#8341;f = 22/5 = 4.4" />
        <Exercises items={[
          { q: "Find &#8711;f for f(x,y) = x&#179; &#8722; 2xy&#178;. Evaluate at (1,1).", level: 'Easy' },
          { q: "Directional derivative of f(x,y) = x&#178;y + y&#179; at (2,1) in direction v = (1/&#8730;2, 1/&#8730;2).", level: 'Medium' },
          { q: "In which direction does f(x,y,z) = xyz increase most rapidly at (1,2,3)? What is the max rate?", level: 'Hard' },
        ]} />
      </MCard>

      <MCard title="1.5 Hessian Matrix &amp; Second Derivatives" accent="#f97316">
        <MFormula name="Hessian Matrix" formula="Hf(x) = [&#8706;&#178;f/&#8706;x&#8331;&#8706;x&#8342;]" note="Matrix of all second partials. Captures curvature &#8212; convex, concave, or saddle." />
        <MFormula name="Schwarz&apos;s Theorem" formula="If f&#8331;&#8342; continuous near x, then f&#8331;&#8342; = f&#8342;&#8331; (Hessian is symmetric)" note="Order of differentiation does not matter for smooth functions." />
        <WorkedEx title="f(x,y) = x&#178; + 4xy + y&#178;. Compute Hessian." steps={[
          "f&#8331; = 2x + 4y, f&#129; = 4x + 2y",
          "f&#8331;&#8331; = 2, f&#129;&#129; = 2, f&#8331;&#129; = f&#129;&#8331; = 4",
          "Hf = [[2, 4], [4, 2]]"
        ]} answer="Hf = [[2, 4], [4, 2]] (symmetric)" />
        <Exercises items={[
          { q: "Hessian of f(x,y) = x&#179; + y&#179;.", level: 'Easy' },
          { q: "Verify Schwarz for f(x,y) = x&#178;y&#179;.", level: 'Medium' },
          { q: "Full Hessian of f(x,y,z) = e&#8331;sin(y) + z&#178;x. Verify symmetry.", level: 'Hard' },
        ]} />
      </MCard>

      <MCard title="1.6 Total Differentiability &amp; Tangent Planes" accent="#f97316">
        <MFormula name="Tangent Plane" formula="z = f(x&#8320;,y&#8320;) + f&#8331;(x&#8320;,y&#8320;)(x&#8722;x&#8320;) + f&#129;(x&#8320;,y&#8320;)(y&#8722;y&#8320;)" note="Best linear approximation to f near (x&#8320;, y&#8320;)." />
        <MFormula name="Hierarchy" formula="Total diff &rArr; Continuous &rArr; Partials exist" note="None of the reverse implications hold in general!" />
        <WorkedEx title="f(x,y) = x&#178;+y&#178; at (1,2). Find tangent plane." steps={[
          "f(1,2) = 5, f&#8331;(1,2) = 2, f&#129;(1,2) = 4",
          "z = 5 + 2(x&#8722;1) + 4(y&#8722;2) = 2x + 4y &#8722; 5"
        ]} answer="z = 2x + 4y &#8722; 5" />
        <Exercises items={[
          { q: "Tangent plane to f(x,y) = xy at (2, 3).", level: 'Easy' },
          { q: "Tangent plane to f(x,y) = e&#8331;cos(y) at (0, 0).", level: 'Medium' },
          { q: "Show f(x,y) = xy/&#8730;(x&#178;+y&#178;) (f(0,0)=0) is NOT totally differentiable at (0,0).", level: 'Hard' },
        ]} />
      </MCard>

      <MQuiz questions={[
        { question: "The level set of f(x,y) = x&#178; + y&#178; for c = 9 is:", options: ["A) A line", "B) A circle of radius 3", "C) A parabola", "D) An ellipse"], correct: 1, explanation: "x&#178; + y&#178; = 9 &#8594; circle radius &#8730;9 = 3 centered at origin." },
        { question: "To prove a limit in 2D does NOT exist, you should:", options: ["A) Use &#949;&#8211;&#948; proof", "B) Find two paths with different limits", "C) Check 100 paths", "D) Compute partial derivatives"], correct: 1, explanation: "Finding two paths with different limits is sufficient to disprove existence." },
        { question: "The gradient &#8711;f always points in the direction of:", options: ["A) Steepest descent", "B) Steepest ascent", "C) The origin", "D) Zero change"], correct: 1, explanation: "&#8711;f points in the direction of maximum increase of f." },
      ]} />
    </MSection>
  );
}
