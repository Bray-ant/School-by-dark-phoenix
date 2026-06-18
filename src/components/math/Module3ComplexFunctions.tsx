"use client";

import { useState } from 'react';
import { CircleDot } from 'lucide-react';
import MathText from '../MathText';
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
        <MFormula name="Rectangular Form" formula="z = x + iy, \\text{ where } i^2 = -1" note="$x = \\text{Re}(z)$, $y = \\text{Im}(z)$. Complex conjugate: $\\bar{z} = x - iy$." />
        <MFormula name="Polar Form" formula="z = r e^{i\\theta} = r(\\cos \\theta + i \\sin \\theta)" note="$r = |z| = \\sqrt{x^2+y^2} = \\text{modulus}$. $\\theta = \\arg(z) = \\operatorname{atan2}(y,x)$." />
        <MFormula name="Euler&apos;s Formula" formula="e^{i\\theta} = \\cos \\theta + i \\sin \\theta" note="The most beautiful equation in mathematics. Special case: $e^{i\\pi} + 1 = 0$." />

        <div className="grid grid-cols-2 gap-3 mt-3">
          <div className="p-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)' }}>
            <div className="text-[10px] text-[#00d4ff] mb-1">Arithmetic</div>
            <div className="text-[10px] text-[#a3a3a3] font-mono"><MathText text="$z_1 + z_2 = (x_1+x_2) + i(y_1+y_2)$" /></div>
            <div className="text-[10px] text-[#a3a3a3] font-mono"><MathText text="$z_1z_2 = r_1r_2e^{i(\\theta_1+\\theta_2)}$" /></div>
            <div className="text-[10px] text-[#a3a3a3] font-mono"><MathText text="$z^{-1} = \\frac{1}{r}e^{-i\\theta}$" /></div>
            <div className="text-[10px] text-[#a3a3a3] font-mono"><MathText text="$z^n = r^n e^{i n\\theta}$ (De Moivre)" /></div>
          </div>
          <div className="p-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)' }}>
            <div className="text-[10px] text-[#00d4ff] mb-1">Key Identities</div>
            <div className="text-[10px] text-[#a3a3a3] font-mono"><MathText text="$|z_1z_2| = |z_1||z_2|$" /></div>
            <div className="text-[10px] text-[#a3a3a3] font-mono"><MathText text="$\\arg(z_1z_2) = \\arg(z_1) + \\arg(z_2)$" /></div>
            <div className="text-[10px] text-[#a3a3a3] font-mono"><MathText text="$z\\cdot\\bar{z} = |z|^2$" /></div>
            <div className="text-[10px] text-[#a3a3a3] font-mono"><MathText text="$\\text{Re}(z) = \\frac{z+\\bar{z}}{2}$" /></div>
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

        <WorkedEx title="Convert $z = 1 + i\\sqrt{3}$ to polar form." steps={[
          "$r = \\sqrt{1^2 + (\\sqrt{3})^2} = \\sqrt{1+3} = 2$",
          "$\\theta = \\arctan(\\sqrt{3}/1) = \\pi/3 = 60^\\circ$",
          "$z = 2e^{i\\pi/3}$"
        ]} answer="$z = 2e^{i\\pi/3}$ (or $2(\\cos 60^\\circ + i \\sin 60^\\circ)$)" />
        <Exercises items={[
          { q: "Convert $z = \\sqrt{3} + i$ to polar form.", level: 'Easy' },
          { q: "Compute $(1+i)^{10}$ using De Moivre.", level: 'Medium' },
          { q: "Find all cube roots of $z = 8$. Sketch them.", level: 'Hard' },
        ]} />
      </MCard>

      <MCard title="3.2 Analytic Functions &amp; Cauchy-Riemann" accent="#06b6d4">
        <MFormula name="Cauchy-Riemann Equations" formula="\\frac{\\partial u}{\\partial x} = \\frac{\\partial v}{\\partial y}, \\frac{\\partial u}{\\partial y} = -\\frac{\\partial v}{\\partial x}" note="$f(z) = u(x,y) + iv(x,y)$ is analytic iff C-R hold AND partials are continuous." />
        <MFormula name="Derivative of Analytic Function" formula="f'(z) = \\frac{\\partial u}{\\partial x} + i\\frac{\\partial v}{\\partial x} = \\frac{\\partial v}{\\partial y} - i\\frac{\\partial u}{\\partial y}" note="All expressions are equal when C-R hold." />
        <WorkedEx title="Is $f(z) = z^2$ analytic? If so, find $f'(z)$." steps={[
          "$z^2 = (x+iy)^2 = x^2 - y^2 + 2ixy$",
          "$u = x^2 - y^2$, $v = 2xy$",
          "$\\frac{\\partial u}{\\partial x} = 2x$, $\\frac{\\partial v}{\\partial y} = 2x$ ✅  $\\frac{\\partial u}{\\partial y} = -2y$, $\\frac{\\partial v}{\\partial x} = 2y$ ✅ (with sign)",
          "C-R satisfied everywhere $\\to$ $f$ is <strong>entire</strong> (analytic on all of $\\mathbb{C}$)",
          "$f'(z) = 2x + i(2y) = 2(x+iy) = 2z$"
        ]} answer="Yes, entire. $f'(z) = 2z$." />
        <Caution><MathText text="$f(z) = \\bar{z} = x - iy$ is <strong>nowhere analytic</strong>! $\\frac{\\partial u}{\\partial x} = 1$ but $\\frac{\\partial v}{\\partial y} = -1$. C-R fail everywhere. Conjugation is not analytic." /></Caution>
        <Exercises items={[
          { q: "Verify C-R for $f(z) = e^z = e^x(\\cos y + i \\sin y)$.", level: 'Easy' },
          { q: "Show $f(z) = |z|^2$ is differentiable only at $z = 0$.", level: 'Medium' },
          { q: "Find where $f(z) = z\\cdot\\text{Re}(z)$ is differentiable.", level: 'Hard' },
        ]} />
      </MCard>

      <MCard title="3.3 Contour Integration &amp; Cauchy&apos;s Theorems" accent="#06b6d4">
        <MFormula name="Cauchy&apos;s Integral Theorem" formula="\\oint_C f(z)\\,dz = 0" note="If $f$ is analytic inside and on simple closed contour $C$." />
        <MFormula name="Cauchy&apos;s Integral Formula" formula="f(z_0) = \\frac{1}{2\\pi i} \\oint_C \\frac{f(z)}{z-z_0}\\,dz" note="Value of analytic function at interior point determined by boundary values." />
        <MFormula name="Residue Theorem" formula="\\oint_C f(z)\\,dz = 2\\pi i \\sum \\operatorname{Res}(f, z_i)" note="Sum of residues inside $C$. Powerful tool for evaluating real integrals." />
        <WorkedEx title="Evaluate $\\oint \\frac{dz}{z}$ around $|z| = 1$." steps={[
          "$f(z) = 1/z$ has simple pole at $z = 0$ inside $|z|=1$",
          "$\\operatorname{Res}(1/z, 0) = 1$ (coefficient of $1/z$ in Laurent series)",
          "By residue theorem: integral = $2\\pi i \\cdot 1 = 2\\pi i$"
        ]} answer="$2\\pi i$" />
        <Exercises items={[
          { q: "Evaluate $\\oint \\frac{dz}{z^2}$ around $|z| = 1$.", level: 'Easy' },
          { q: "Evaluate $\\oint \\frac{e^z}{z^2+1}\\,dz$ around $|z| = 2$.", level: 'Medium' },
          { q: "Use residues to evaluate $\\int_{-\\infty}^{0} \\frac{dx}{1+x^2}$.", level: 'Hard' },
        ]} />
      </MCard>

      <MQuiz questions={[
        { question: "$e^{i\\pi} + 1$ equals:", options: ["A) 0", "B) 1", "C) i", "D) Undefined"], correct: 0, explanation: "Euler's identity: $e^{i\\pi} = \\cos \\pi + i \\sin \\pi = -1 + 0 = -1$, so $e^{i\\pi} + 1 = 0$." },
        { question: "If $f(z) = u + iv$ is analytic, then:", options: ["A) $u$ and $v$ are unrelated", "B) C-R equations hold", "C) $v = 0$ always", "D) $f$ is constant"], correct: 1, explanation: "The Cauchy-Riemann equations are the necessary and sufficient condition for analyticity (with continuous partials)." },
        { question: "The function $f(z) = \\bar{z}$ is:", options: ["A) Entire", "B) Analytic at $z=0$ only", "C) Nowhere analytic", "D) Analytic except at origin"], correct: 2, explanation: "$f(z) = \\bar{z} = x - iy$ fails C-R everywhere: $\\frac{\\partial u}{\\partial x} = 1 \\ne \\frac{\\partial v}{\\partial y} = -1$." },
      ]} />
    </MSection>
  );
}
