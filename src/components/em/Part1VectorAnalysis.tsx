"use client";

import { Compass } from 'lucide-react';
import { Section, EMCard, Formula, DidYouKnow } from './shared';

export default function Part1VectorAnalysis() {
  return (
    <Section id="vector-analysis" icon={<Compass className="w-5 h-5" />} title="Part 1: Vector Analysis Reference" color="#737373">
      <p className="text-sm text-[#a3a3a3] leading-relaxed">
        Sadiku devotes Chapters 1&#8211;3 to vector analysis. It is the mathematical foundation for everything that follows.
        Master these tools before proceeding to the physics of electromagnetics.
      </p>

      <EMCard title="Coordinate Systems" accent="#737373">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="p-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)' }}>
            <div className="text-[10px] text-[#00d4ff] font-semibold mb-1">Cartesian</div>
            <div className="text-[11px] text-[#d4d4d4] font-mono">P(x, y, z)</div>
            <div className="text-[10px] text-[#737373] mt-1">Basis: <strong className="text-white">a&#8341;, a&#129;, a&#8342;</strong></div>
          </div>
          <div className="p-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)' }}>
            <div className="text-[10px] text-[#7c3aed] font-semibold mb-1">Cylindrical</div>
            <div className="text-[11px] text-[#d4d4d4] font-mono">P(&#961;, &#966;, z)</div>
            <div className="text-[10px] text-[#737373] mt-1">Basis: <strong className="text-white">a&#961;, a&#966;, a&#8342;</strong></div>
          </div>
          <div className="p-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)' }}>
            <div className="text-[10px] text-[#f59e0b] font-semibold mb-1">Spherical</div>
            <div className="text-[11px] text-[#d4d4d4] font-mono">P(r, &#952;, &#966;)</div>
            <div className="text-[10px] text-[#737373] mt-1">Basis: <strong className="text-white">a&#8341;, a&#952;, a&#966;</strong></div>
          </div>
        </div>
      </EMCard>

      <Formula name="Gradient" formula="&#8711;V = &#8706;V/&#8706;x a&#8341; + &#8706;V/&#8706;y a&#129; + &#8706;V/&#8706;z a&#8342;"
        vars="Points in direction of maximum increase of scalar V. Gives a vector from a scalar field." />
      <Formula name="Divergence" formula="&#8711; &#183; A = &#8706;A&#8341;/&#8706;x + &#8706;A&#129;/&#8706;y + &#8706;A&#8342;/&#8706;z"
        vars="Net outward flux per unit volume. Measures how much a vector field 'spreads out' from a point." />
      <Formula name="Curl" formula="&#8711; &#215; A"
        vars="Circulation per unit area. Measures rotation/twist in a vector field. Zero curl = irrotational (conservative)." />
      <Formula name="Laplacian" formula="&#8711;&#178;V = &#8706;&#178;V/&#8706;x&#178; + &#8706;&#178;V/&#8706;y&#178; + &#8706;&#178;V/&#8706;z&#178;"
        vars="Appears in Poisson's and Laplace's equations throughout electrostatics and magnetostatics." />
      <Formula name="Divergence Theorem" formula="&#8750; A &#183; dS = &#8747; (&#8711; &#183; A) dv"
        vars="Relates flux through a closed surface to divergence throughout the volume. Foundation of Gauss's law." />
      <Formula name="Stokes's Theorem" formula="&#8750; A &#183; dl = &#8747; (&#8711; &#215; A) &#183; dS"
        vars="Relates circulation around a closed loop to curl over the surface. Foundation of Faraday's and Ampere's laws." />

      <DidYouKnow>
        The divergence theorem was first discovered by Lagrange in 1762, then rediscovered by Gauss in 1813,
        Ostrogradsky in 1826, and Green in 1828. Stokes's theorem was actually stated by Lord Kelvin in a letter
        to Stokes in 1850, who then made it a famous examination question at Cambridge!
      </DidYouKnow>
    </Section>
  );
}
