import { useState, useRef, useCallback, useEffect } from 'react';

import { Play, RotateCcw, Plus, Minus, Zap, Eye, Settings2 } from 'lucide-react';
import { solveCircuit, formatEng } from '../../lib/circuitSolver';
import type { CircuitNode, CircuitComponent, CircuitNetlist } from '../../lib/circuitSolver';

// Pre-built demo circuits
const DEMO_CIRCUITS: Record<string, { name: string; nodes: CircuitNode[]; components: CircuitComponent[] }> = {
  'series': {
    name: 'Series Circuit',
    nodes: [
      { id: 'n0', x: 50, y: 300, voltage: 0, isGround: true, label: 'GND' },
      { id: 'n1', x: 200, y: 300, voltage: 0, isGround: false, label: 'A' },
      { id: 'n2', x: 350, y: 300, voltage: 0, isGround: false, label: 'B' },
      { id: 'n3', x: 500, y: 300, voltage: 0, isGround: false, label: 'C' },
    ],
    components: [
      { id: 'v1', type: 'vsource', value: 12, nodeA: 'n0', nodeB: 'n3', label: 'V1', current: 0, voltageDrop: 0, power: 0 },
      { id: 'r1', type: 'resistor', value: 1000, nodeA: 'n3', nodeB: 'n2', label: 'R1', current: 0, voltageDrop: 0, power: 0 },
      { id: 'r2', type: 'resistor', value: 2000, nodeA: 'n2', nodeB: 'n1', label: 'R2', current: 0, voltageDrop: 0, power: 0 },
      { id: 'r3', type: 'resistor', value: 1000, nodeA: 'n1', nodeB: 'n0', label: 'R3', current: 0, voltageDrop: 0, power: 0 },
    ],
  },
  'parallel': {
    name: 'Parallel Circuit',
    nodes: [
      { id: 'n0', x: 100, y: 100, voltage: 0, isGround: true, label: 'GND' },
      { id: 'n1', x: 100, y: 400, voltage: 0, isGround: false, label: 'A' },
      { id: 'n2', x: 400, y: 100, voltage: 0, isGround: false, label: 'B' },
      { id: 'n3', x: 400, y: 400, voltage: 0, isGround: false, label: 'C' },
    ],
    components: [
      { id: 'v1', type: 'vsource', value: 12, nodeA: 'n0', nodeB: 'n1', label: 'V1', current: 0, voltageDrop: 0, power: 0 },
      { id: 'r1', type: 'resistor', value: 1000, nodeA: 'n1', nodeB: 'n2', label: 'R1', current: 0, voltageDrop: 0, power: 0 },
      { id: 'r2', type: 'resistor', value: 2000, nodeA: 'n1', nodeB: 'n3', label: 'R2', current: 0, voltageDrop: 0, power: 0 },
      { id: 'r3', type: 'resistor', value: 3000, nodeA: 'n1', nodeB: 'n0', label: 'R3', current: 0, voltageDrop: 0, power: 0 },
      { id: 'wire1', type: 'resistor', value: 0.001, nodeA: 'n2', nodeB: 'n0', label: 'W1', current: 0, voltageDrop: 0, power: 0 },
      { id: 'wire2', type: 'resistor', value: 0.001, nodeA: 'n3', nodeB: 'n0', label: 'W2', current: 0, voltageDrop: 0, power: 0 },
    ],
  },
  'divider': {
    name: 'Voltage Divider',
    nodes: [
      { id: 'n0', x: 100, y: 300, voltage: 0, isGround: true, label: 'GND' },
      { id: 'n1', x: 300, y: 300, voltage: 0, isGround: false, label: 'A' },
      { id: 'n2', x: 500, y: 300, voltage: 0, isGround: false, label: 'B' },
    ],
    components: [
      { id: 'v1', type: 'vsource', value: 10, nodeA: 'n0', nodeB: 'n2', label: 'V1', current: 0, voltageDrop: 0, power: 0 },
      { id: 'r1', type: 'resistor', value: 4000, nodeA: 'n2', nodeB: 'n1', label: 'R1', current: 0, voltageDrop: 0, power: 0 },
      { id: 'r2', type: 'resistor', value: 6000, nodeA: 'n1', nodeB: 'n0', label: 'R2', current: 0, voltageDrop: 0, power: 0 },
    ],
  },
};

export default function CircuitSandbox({ showInfo }: { showInfo?: boolean }) {
  const [selectedCircuit, setSelectedCircuit] = useState('series');
  const [nodes, setNodes] = useState<CircuitNode[]>([...DEMO_CIRCUITS.series.nodes]);
  const [components, setComponents] = useState<CircuitComponent[]>([...DEMO_CIRCUITS.series.components]);
  const [results, setResults] = useState<ReturnType<typeof solveCircuit> | null>(null);
  const [selectedComp, setSelectedComp] = useState<string | null>(null);
  const animTimeRef = useRef(0);
  const rafRef = useRef<number>(0);
  const svgRef = useRef<SVGSVGElement>(null);

  const solve = useCallback(() => {
    const netlist: CircuitNetlist = { nodes, components };
    const res = solveCircuit(netlist);
    setResults(res);
  }, [nodes, components]);

  useEffect(() => { solve(); }, [solve]);

  // Animation loop - uses ref to avoid React re-renders
  useEffect(() => {
    let running = true;
    const loop = () => {
      if (!running) return;
      animTimeRef.current += 0.02;
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => { running = false; cancelAnimationFrame(rafRef.current); };
  }, []);

  const loadCircuit = (key: string) => {
    const c = DEMO_CIRCUITS[key];
    setNodes([...c.nodes]);
    setComponents([...c.components]);
    setSelectedCircuit(key);
    setSelectedComp(null);
  };

  const updateComponentValue = (id: string, delta: number) => {
    setComponents(prev => prev.map(c => {
      if (c.id === id) {
        const newVal = Math.max(0.1, c.value * (1 + delta));
        return { ...c, value: newVal };
      }
      return c;
    }));
  };

  const getNodePos = (nodeId: string) => {
    const n = nodes.find(n => n.id === nodeId);
    return n ? { x: n.x, y: n.y } : { x: 0, y: 0 };
  };

  
  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-4 py-2 border-b border-white/5 overflow-x-auto">
        {Object.entries(DEMO_CIRCUITS).map(([key, c]) => (
          <button
            key={key}
            onClick={() => loadCircuit(key)}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-medium transition-all whitespace-nowrap ${
              selectedCircuit === key ? 'bg-[#3b82f6]/20 text-[#3b82f6] border border-[#3b82f6]/30' : 'bg-white/5 text-[#737373] hover:text-white border border-transparent'
            }`}
          >
            {c.name}
          </button>
        ))}
        <div className="w-px h-5 bg-white/10 mx-1" />
        <button onClick={solve} className="p-1.5 rounded-lg bg-white/5 text-[#737373] hover:text-[#10b981] transition-colors" title="Solve">
          <Play className="w-3.5 h-3.5" />
        </button>
        <button onClick={() => loadCircuit(selectedCircuit)} className="p-1.5 rounded-lg bg-white/5 text-[#737373] hover:text-white transition-colors" title="Reset">
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Circuit Canvas */}
        <div className="flex-1 relative bg-[#080808] overflow-hidden">
          <svg ref={svgRef} width="100%" height="100%" viewBox="0 0 600 500" preserveAspectRatio="xMidYMid meet">
            {/* Grid */}
            <defs>
              <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
                <path d="M 50 0 L 0 0 0 50" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />
              </pattern>
              {/* Glow filter */}
              <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />

            {/* Wires */}
            {components.map(comp => {
              const a = getNodePos(comp.nodeA);
              const b = getNodePos(comp.nodeB);
              const current = results?.branchCurrents[comp.id] || 0;
              const isSelected = selectedComp === comp.id;
              const color = comp.type === 'vsource' ? '#f59e0b' : comp.type === 'isource' ? '#10b981' : '#3b82f6';
              const intensity = Math.min(Math.abs(current) / 0.01, 1);

              return (
                <g key={comp.id} onClick={() => setSelectedComp(isSelected ? null : comp.id)} className="cursor-pointer">
                  {/* Wire path */}
                  <line
                    x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                    stroke={isSelected ? color : `rgba(255,255,255,${0.15 + intensity * 0.5})`}
                    strokeWidth={isSelected ? 3 : 2 + intensity}
                    strokeLinecap="round"
                  />

                  {/* Current flow particles */}
                  {Math.abs(current) > 1e-6 && comp.type !== 'ground' && (
                    <>
                      {[0, 1, 2, 3].map(p => {
                        const speed = Math.min(Math.abs(current) * 30, 20);
                        const t = ((animTimeRef.current * speed + p * 10) % 40) / 40;
                        const px = a.x + (b.x - a.x) * t;
                        const py = a.y + (b.y - a.y) * t;
                        return (
                          <circle
                            key={p}
                            cx={px} cy={py} r={2 + intensity * 2}
                            fill={current > 0 ? '#3b82f6' : '#ef4444'}
                            opacity={0.6 + intensity * 0.4}
                            filter="url(#glow)"
                          />
                        );
                      })}
                    </>
                  )}

                  {/* Component symbol */}
                  <ComponentSymbol
                    type={comp.type}
                    x={(a.x + b.x) / 2}
                    y={(a.y + b.y) / 2}
                    angle={Math.atan2(b.y - a.y, b.x - a.x) * 180 / Math.PI}
                    color={color}
                    label={comp.label}
                    value={comp.value}
                    isSelected={isSelected}
                  />
                </g>
              );
            })}

            {/* Nodes */}
            {nodes.map(node => (
              <g key={node.id}>
                <circle
                  cx={node.x} cy={node.y} r={6}
                  fill={node.isGround ? '#10b981' : results ? `rgba(59,130,246,${0.3 + (results.nodeVoltages[node.id] || 0) / 20})` : '#3b82f6'}
                  stroke={node.isGround ? '#10b981' : '#3b82f6'}
                  strokeWidth={2}
                />
                <text x={node.x} y={node.y - 12} textAnchor="middle" fill="#a3a3a3" fontSize="10" fontFamily="monospace">
                  {node.label} {results ? `(${formatEng(results.nodeVoltages[node.id] || 0, 'V')})` : ''}
                </text>
              </g>
            ))}
          </svg>

          {/* Legend */}
          <div className="absolute bottom-3 left-3 flex items-center gap-3 text-[9px] text-[#525252]">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#3b82f6]" /> Current flow</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#10b981]" /> Ground</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#f59e0b]" /> Source</span>
          </div>
        </div>

        {/* Right Panel */}
        {showInfo !== false && (
          <div className="w-72 border-l border-white/5 bg-[#0a0a0a] overflow-y-auto shrink-0 hidden lg:block">
            {/* Selected Component */}
            {selectedComp && (() => {
              const comp = components.find(c => c.id === selectedComp);
              if (!comp) return null;
              return (
                <div className="p-4 border-b border-white/5">
                  <h3 className="text-xs font-semibold mb-3 flex items-center gap-2">
                    <Eye className="w-3.5 h-3.5 text-[#3b82f6]" />
                    {comp.label} ({comp.type})
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-[#737373]">Value</span>
                      <div className="flex items-center gap-1">
                        <button onClick={() => updateComponentValue(comp.id, -0.2)} className="p-1 rounded bg-white/5 text-[#737373] hover:text-white"><Minus className="w-3 h-3" /></button>
                        <span className="text-[10px] font-mono w-20 text-center">
                          {comp.type === 'vsource' ? formatEng(comp.value, 'V') : comp.type === 'isource' ? formatEng(comp.value, 'A') : formatEng(comp.value, 'Ohm')}
                        </span>
                        <button onClick={() => updateComponentValue(comp.id, 0.2)} className="p-1 rounded bg-white/5 text-[#737373] hover:text-white"><Plus className="w-3 h-3" /></button>
                      </div>
                    </div>
                    {results && (
                      <>
                        <div className="flex justify-between text-[10px]">
                          <span className="text-[#737373]">Current</span>
                          <span className="font-mono text-[#3b82f6]">{formatEng(results.branchCurrents[comp.id] || 0, 'A')}</span>
                        </div>
                        <div className="flex justify-between text-[10px]">
                          <span className="text-[#737373]">Voltage Drop</span>
                          <span className="font-mono text-[#f59e0b]">{formatEng(comp.voltageDrop, 'V')}</span>
                        </div>
                        <div className="flex justify-between text-[10px]">
                          <span className="text-[#737373]">Power</span>
                          <span className="font-mono text-[#10b981]">{formatEng(Math.abs(comp.power), 'W')}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              );
            })()}

            {/* Results Summary */}
            {results && results.converged && (
              <div className="p-4 border-b border-white/5">
                <h3 className="text-xs font-semibold mb-3 flex items-center gap-2">
                  <Zap className="w-3.5 h-3.5 text-[#f59e0b]" />
                  Simulation Results
                </h3>
                <div className="space-y-1.5">
                  {components.filter(c => c.type !== 'ground' && Math.abs(results.branchCurrents[c.id] || 0) > 1e-9).map(comp => (
                    <div key={comp.id} className="flex justify-between text-[10px]">
                      <span className="text-[#737373]">{comp.label}</span>
                      <span className="font-mono">I={formatEng(results.branchCurrents[comp.id], 'A')}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 pt-3 border-t border-white/5">
                  <div className="flex justify-between text-[10px]">
                    <span className="text-[#737373]">Total Power</span>
                    <span className="font-mono text-[#10b981]">{formatEng(results.totalPower, 'W')}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Component List */}
            <div className="p-4">
              <h3 className="text-xs font-semibold mb-3 flex items-center gap-2">
                <Settings2 className="w-3.5 h-3.5 text-[#737373]" />
                Components
              </h3>
              <div className="space-y-1.5">
                {components.filter(c => c.type !== 'ground' && !c.label.startsWith('W')).map(comp => (
                  <button
                    key={comp.id}
                    onClick={() => setSelectedComp(selectedComp === comp.id ? null : comp.id)}
                    className={`w-full text-left px-2.5 py-2 rounded-lg text-[10px] transition-all ${
                      selectedComp === comp.id ? 'bg-white/10 text-white' : 'bg-white/[0.02] text-[#737373] hover:bg-white/5'
                    }`}
                  >
                    <div className="flex justify-between">
                      <span>{comp.label}</span>
                      <span className="font-mono">
                        {comp.type === 'vsource' ? formatEng(comp.value, 'V') : comp.type === 'isource' ? formatEng(comp.value, 'A') : formatEng(comp.value, 'Ohm')}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Component Symbol Renderer
function ComponentSymbol({ type, x, y, angle, color, label, isSelected }: {
  type: string; x: number; y: number; angle: number; color: string; label: string; value: number; isSelected: boolean;
}) {
  const size = isSelected ? 22 : 18;
  const bgSize = size + 8;

  if (type === 'resistor') {
    return (
      <g transform={`translate(${x}, ${y}) rotate(${angle})`}>
        <rect x={-bgSize / 2} y={-bgSize / 2} width={bgSize} height={bgSize} rx={4} fill={isSelected ? `${color}20` : '#111'} stroke={isSelected ? color : 'transparent'} strokeWidth={1} />
        <rect x={-size / 2} y={-5} width={size} height={10} rx={2} fill="none" stroke={color} strokeWidth={2} />
        <text x={0} y={-size / 2 - 2} textAnchor="middle" fill="#a3a3a3" fontSize="8" fontFamily="monospace">{label}</text>
      </g>
    );
  }

  if (type === 'vsource') {
    return (
      <g transform={`translate(${x}, ${y}) rotate(${angle})`}>
        <circle cx={0} cy={0} r={size / 2} fill={isSelected ? `${color}20` : '#111'} stroke={color} strokeWidth={2} />
        <text x={0} y={1} textAnchor="middle" fill={color} fontSize="10" fontWeight="bold">+</text>
        <text x={0} y={-size / 2 - 2} textAnchor="middle" fill="#a3a3a3" fontSize="8" fontFamily="monospace">{label}</text>
      </g>
    );
  }

  if (type === 'isource') {
    return (
      <g transform={`translate(${x}, ${y}) rotate(${angle})`}>
        <circle cx={0} cy={0} r={size / 2} fill={isSelected ? `${color}20` : '#111'} stroke={color} strokeWidth={2} />
        <text x={0} y={1} textAnchor="middle" fill={color} fontSize="10" fontWeight="bold">I</text>
        <text x={0} y={-size / 2 - 2} textAnchor="middle" fill="#a3a3a3" fontSize="8" fontFamily="monospace">{label}</text>
      </g>
    );
  }

  if (type === 'capacitor') {
    return (
      <g transform={`translate(${x}, ${y}) rotate(${angle})`}>
        <line x1={-5} y1={-8} x2={-5} y2={8} stroke={color} strokeWidth={2} />
        <line x1={5} y1={-8} x2={5} y2={8} stroke={color} strokeWidth={2} />
        <text x={0} y={-10} textAnchor="middle" fill="#a3a3a3" fontSize="8" fontFamily="monospace">{label}</text>
      </g>
    );
  }

  if (type === 'inductor') {
    return (
      <g transform={`translate(${x}, ${y}) rotate(${angle})`}>
        {[0, 1, 2, 3].map(i => (
          <path key={i} d={`M ${-12 + i * 6} 0 Q ${-9 + i * 6} -6 ${-6 + i * 6} 0`} fill="none" stroke={color} strokeWidth={2} />
        ))}
        <text x={0} y={-10} textAnchor="middle" fill="#a3a3a3" fontSize="8" fontFamily="monospace">{label}</text>
      </g>
    );
  }

  return null;
}
