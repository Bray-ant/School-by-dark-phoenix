"use client";

import { useState } from 'react';
import { CircleDot } from 'lucide-react';
import { MSection, MCard, MFormula, WorkedEx, Caution, Exercises, MQuiz } from './shared';

export default function Module3ComplexFunctions() {
  const [zReal, setZReal] = useState(1);
  const [zImag, setZImag] = useState(1);
  const modulus = Math.sqrt(zReal * zReal + zImag * zImag);
  const arg = Math.atan2(zImag, zReal);

  return (
    <MSection id="complex" icon={<CircleDot className="w-5 h-5" />} title="Module 3: Complex Functions" color="#06b6d4">
      <p className="text-sm text-[#a3a3a3] leading-relaxed">
        Complex analysis extends calculus to the complex plane. Analytic functions have remarkable properties:
        differentiability in a neighborhood implies infinite differentiability, and contour integrals depend only on endpoints for analytic functions.
      </p>

      <MCard title="3.1 Complex Numbers — Rectangular &amp; Polar Forms" accent="#06b6d4">
        <MFormula name="Rectangular Form" formula="z = x + iy,  where i&#178; = &#8722;1" note="x = Re(z), y = Im(z). Complex conjugate: z&#773; = x &#8722; iy." />
        <MFormula name="Polar Form" formula="z = r e&#7496;&#7497; = r(cos &#952; + i sin &#952;)" note="r = |z| = &#8730;(x&#178;+y&#178;) = modulus. &#952; = arg(z) = atan2(y,x)." />
        <MFormula name="Euler&apos;s Formula" formula="e&#7496;&#7497; = cos &#952; + i sin &#952;" note="The most beautiful equation in mathematics. Special case: e&#7496;&#120529; + 1 = 0." />

        <div className="grid grid-cols-2 gap-3 mt-3">
          <div className="p-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)' }}>
            <div className="text-[10px] text-[#00d4ff] mb-1">Arithmetic</div>
            <div className="text-[10px] text-[#a3a3a3] font-mono">z&#8321; + z&#8322; = (x&#8321;+x&#8322;) + i(y&#8321;+y&#8322;)</div>
            <div className="text-[10px] text-[#a3a3a3] font-mono">z&#8321;z&#8322; = r&#8321;r&#8322;e&#7496;(&#952;&#8321;+&#952;&#8322;)</div>
            <div className="text-[10px] text-[#a3a3a3] font-mono">z&#8315;&#185; = (1/r)e&#7496;(&#8722;&#952;)</div>
            <div className="text-[10px] text-[#a3a3a3] font-mono">z&#8315; = r&#8315;e&#7496;n&#952; (De Moivre)</div>
          </div>
          <div className="p-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)' }}>
            <div className="text-[10px] text-[#00d4ff] mb-1">Key Identities</div>
            <div className="text-[10px] text-[#a3a3a3] font-mono">|z&#8321;z&#8322;| = |z&#8321;||z&#8322;|</div>
            <div className="text-[10px] text-[#a3a3a3] font-mono">arg(z&#8321;z&#8322;) = arg(z&#8321;) + arg(z&#8322;)</div>
            <div className="text-[10px] text-[#a3a3a3] font-mono">z&#183;z&#773; = |z|&#178;</div>
            <div className="text-[10px] text-[#a3a3a3] font-mono">Re(z) = (z+z&#773;)/2</div>
          </div>
        </div>

        <div className="mt-3 p-3 rounded-lg" style={{ background: 'rgba(6,182,212,0.06)' }}>
          <div className="text-[10px] text-[#06b6d4] mb-2">Interactive: Rectangular &#8596; Polar Conversion</div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-[10px] text-[#737373]">x (real)</label><input type="range" min={-5} max={5} step={0.1} value={zReal} onChange={e => setZReal(Number(e.target.value))} className="w-full accent-[#06b6d4]" /></div>
            <div><label className="text-[10px] text-[#737373]">y (imag)</label><input type="range" min={-5} max={5} step={0.1} value={zImag} onChange={e => setZImag(Number(e.target.value))} className="w-full accent-[#06b6d4]" /></div>
          </div>
          <div className="text-center mt-2">
            <span className="text-[11px] font-mono text-[#d4d4d4]">z = {zReal.toFixed(1)} + i({zImag.toFixed(1)}) </span>
            <span className="text-[#737373]">&#8594;</span>
            <span className="text-[11px] font-mono text-[#06b6d4]"> |z| = {modulus.toFixed(2)}, arg = {(arg * 180 / Math.PI).toFixed(1)}&#176;</span>
          </div>
        </div>

        <WorkedEx title="Convert z = 1 + i&#8730;3 to polar form." steps={[
          "r = &#8730;(1&#178; + (&#8730;3)&#178;) = &#8730;(1+3) = 2",
          "&#952; = arctan(&#8730;3/1) = &#120529;/3 = 60&#176;",
          "z = 2e&#7496;&#120529;/&#8323;"
        ]} answer="z = 2e&#7496;&#120529;/&#8323; (or 2(cos 60&#176; + i sin 60&#176;))" />
        <Exercises items={[
          { q: "Convert z = &#8730;3 + i to polar form.", level: 'Easy' },
          { q: "Compute (1+i)&#185;&#8304; using De Moivre.", level: 'Medium' },
          { q: "Find all cube roots of z = 8. Sketch them.", level: 'Hard' },
        ]} />
      </MCard>

      <MCard title="3.2 Analytic Functions &amp; Cauchy-Riemann" accent="#06b6d4">
        <MFormula name="Cauchy-Riemann Equations" formula="&#8706;u/&#8706;x = &#8706;v/&#8706;y,  &#8706;u/&#8706;y = &#8722;&#8706;v/&#8706;x" note="f(z) = u(x,y) + iv(x,y) is analytic iff C-R hold AND partials are continuous." />
        <MFormula name="Derivative of Analytic Function" formula="f&apos;(z) = &#8706;u/&#8706;x + i&#8706;v/&#8706;x = &#8706;v/&#8706;y &#8722; i&#8706;u/&#8706;y" note="All expressions are equal when C-R hold." />
        <WorkedEx title="Is f(z) = z&#178; analytic? If so, find f&apos;(z)." steps={[
          "z&#178; = (x+iy)&#178; = x&#178; &#8722; y&#178; + 2ixy",
          "u = x&#178; &#8722; y&#178;, v = 2xy",
          "&#8706;u/&#8706;x = 2x, &#8706;v/&#8706;y = 2x &#9989;  &#8706;u/&#8706;y = &#8722;2y, &#8706;v/&#8706;x = 2y &#9989; (with sign)",
          "C-R satisfied everywhere &#8594; f is <strong>entire</strong> (analytic on all of &#8450;)",
          "f&apos;(z) = 2x + i(2y) = 2(x+iy) = 2z"
        ]} answer="Yes, entire. f&apos;(z) = 2z." />
        <Caution>f(z) = z&#773; = x &#8722; iy is <strong>nowhere analytic</strong>! &#8706;u/&#8706;x = 1 but &#8706;v/&#8706;y = &#8722;1. C-R fail everywhere. Conjugation is not analytic.</Caution>
        <Exercises items={[
          { q: "Verify C-R for f(z) = e&#7496; = e&#8331;(cos y + i sin y).", level: 'Easy' },
          { q: "Show f(z) = |z|&#178; is differentiable only at z = 0.", level: 'Medium' },
          { q: "Find where f(z) = z&#183;Re(z) is differentiable.", level: 'Hard' },
        ]} />
      </MCard>

      <MCard title="3.3 Contour Integration &amp; Cauchy&apos;s Theorems" accent="#06b6d4">
        <MFormula name="Cauchy&apos;s Integral Theorem" formula="&#8750;&#8341; f(z) dz = 0" note="If f is analytic inside and on simple closed contour C." />
        <MFormula name="Cauchy&apos;s Integral Formula" formula="f(z&#8320;) = 1/2&#960;i &#8750;&#8341; f(z)/(z&#8722;z&#8320;) dz" note="Value of analytic function at interior point determined by boundary values." />
        <MFormula name="Residue Theorem" formula="&#8750;&#8341; f(z) dz = 2&#960;i &#8721; Res(f, z&#8331;)" note="Sum of residues inside C. Powerful tool for evaluating real integrals." />
        <WorkedEx title="Evaluate &#8750; dz/z around |z| = 1." steps={[
          "f(z) = 1/z has simple pole at z = 0 inside |z|=1",
          "Res(1/z, 0) = 1 (coefficient of 1/z in Laurent series)",
          "By residue theorem: integral = 2&#960;i &#183; 1 = 2&#960;i"
        ]} answer="2&#960;i" />
        <Exercises items={[
          { q: "Evaluate &#8750; dz/z&#178; around |z| = 1.", level: 'Easy' },
          { q: "Evaluate &#8750; e&#7496;/(z&#178;+1) dz around |z| = 2.", level: 'Medium' },
          { q: "Use residues to evaluate &#8747;&#8334;&#8734;&#8304; dx/(1+x&#178;).", level: 'Hard' },
        ]} />
      </MCard>

      <MQuiz questions={[
        { question: "e&#7496;&#120529; + 1 equals:", options: ["A) 0", "B) 1", "C) i", "D) Undefined"], correct: 0, explanation: "Euler's identity: e&#7496;&#120529; = cos &#120529; + i sin &#120529; = &#8722;1 + 0 = &#8722;1, so e&#7496;&#120529; + 1 = 0." },
        { question: "If f(z) = u + iv is analytic, then:", options: ["A) u and v are unrelated", "B) C-R equations hold", "C) v = 0 always", "D) f is constant"], correct: 1, explanation: "The Cauchy-Riemann equations are the necessary and sufficient condition for analyticity (with continuous partials)." },
        { question: "The function f(z) = z&#773; is:", options: ["A) Entire", "B) Analytic at z=0 only", "C) Nowhere analytic", "D) Analytic except at origin"], correct: 2, explanation: "f(z) = z&#773; = x &#8722; iy fails C-R everywhere: &#8706;u/&#8706;x = 1 &#8800; &#8706;v/&#8706;y = &#8722;1." },
      ]} />
    </MSection>
  );
}
