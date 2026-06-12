// Circuit Solver Engine - Nodal Analysis-based DC Circuit Simulator
// Solves circuits using Modified Nodal Analysis (MNA)

export interface CircuitNode {
  id: string;
  x: number;
  y: number;
  voltage: number;
  isGround: boolean;
  label: string;
}

export interface CircuitComponent {
  id: string;
  type: 'resistor' | 'capacitor' | 'inductor' | 'vsource' | 'isource' | 'ground';
  value: number; // ohms, farads, henries, volts, amps
  nodeA: string;
  nodeB: string;
  label: string;
  current: number; // computed
  voltageDrop: number; // computed
  power: number; // computed
}

export interface CircuitNetlist {
  nodes: CircuitNode[];
  components: CircuitComponent[];
}

export interface SolverResult {
  nodeVoltages: Record<string, number>;
  branchCurrents: Record<string, number>;
  branchPower: Record<string, number>;
  totalPower: number;
  converged: boolean;
  iterations: number;
}

// Matrix operations for MNA
function createMatrix(n: number): number[][] {
  return Array.from({ length: n }, () => Array(n).fill(0));
}

function createVector(n: number): number[] {
  return Array(n).fill(0);
}

// Gaussian elimination with partial pivoting
function solveLinearSystem(A: number[][], b: number[]): number[] | null {
  const n = A.length;
  const M = A.map((row, i) => [...row, b[i]]); // Augmented matrix

  for (let col = 0; col < n; col++) {
    // Partial pivoting
    let maxRow = col;
    let maxVal = Math.abs(M[col][col]);
    for (let row = col + 1; row < n; row++) {
      if (Math.abs(M[row][col]) > maxVal) {
        maxVal = Math.abs(M[row][col]);
        maxRow = row;
      }
    }

    if (maxVal < 1e-12) continue; // Singular or near-singular

    if (maxRow !== col) {
      [M[col], M[maxRow]] = [M[maxRow], M[col]];
    }

    // Eliminate below
    for (let row = col + 1; row < n; row++) {
      const factor = M[row][col] / M[col][col];
      for (let j = col; j <= n; j++) {
        M[row][j] -= factor * M[col][j];
      }
    }
  }

  // Back substitution
  const x = createVector(n);
  for (let i = n - 1; i >= 0; i--) {
    if (Math.abs(M[i][i]) < 1e-12) {
      x[i] = 0;
      continue;
    }
    let sum = M[i][n];
    for (let j = i + 1; j < n; j++) {
      sum -= M[i][j] * x[j];
    }
    x[i] = sum / M[i][i];
  }

  return x;
}

// Modified Nodal Analysis solver
export function solveCircuit(netlist: CircuitNetlist): SolverResult {
  const nodes = netlist.nodes.filter(n => !n.isGround);
  const ground = netlist.nodes.find(n => n.isGround);
  const components = netlist.components;
  const numNodes = nodes.length;

  if (numNodes === 0) {
    return {
      nodeVoltages: {},
      branchCurrents: {},
      branchPower: {},
      totalPower: 0,
      converged: false,
      iterations: 0,
    };
  }

  // Count voltage sources for MNA
  const vSources = components.filter(c => c.type === 'vsource');
  const numVSources = vSources.length;
  const matrixSize = numNodes + numVSources;

  const G = createMatrix(matrixSize);
  const I = createVector(matrixSize);

  // Build conductance matrix (G) and current vector (I)
  for (const comp of components) {
    if (comp.type === 'resistor') {
      const conductance = 1 / comp.value;
      const nodeA = nodes.findIndex(n => n.id === comp.nodeA);
      const nodeB = nodes.findIndex(n => n.id === comp.nodeB);

      if (nodeA >= 0) G[nodeA][nodeA] += conductance;
      if (nodeB >= 0) G[nodeB][nodeB] += conductance;
      if (nodeA >= 0 && nodeB >= 0) {
        G[nodeA][nodeB] -= conductance;
        G[nodeB][nodeA] -= conductance;
      }
    } else if (comp.type === 'isource') {
      const nodeA = nodes.findIndex(n => n.id === comp.nodeA);
      const nodeB = nodes.findIndex(n => n.id === comp.nodeB);
      const current = comp.value;

      if (nodeA >= 0) I[nodeA] -= current; // leaving nodeA
      if (nodeB >= 0) I[nodeB] += current; // entering nodeB
    }
  }

  // Add voltage source equations (MNA extension)
  for (let i = 0; i < vSources.length; i++) {
    const vs = vSources[i];
    const nodeA = nodes.findIndex(n => n.id === vs.nodeA);
    const nodeB = nodes.findIndex(n => n.id === vs.nodeB);
    const eqRow = numNodes + i;

    if (nodeA >= 0) {
      G[eqRow][nodeA] = 1;
      G[nodeA][eqRow] = 1;
    }
    if (nodeB >= 0) {
      G[eqRow][nodeB] = -1;
      G[nodeB][eqRow] = -1;
    }

    I[eqRow] = vs.value;
  }

  // Solve
  const solution = solveLinearSystem(G, I);

  if (!solution) {
    return {
      nodeVoltages: {},
      branchCurrents: {},
      branchPower: {},
      totalPower: 0,
      converged: false,
      iterations: 1,
    };
  }

  // Extract results
  const nodeVoltages: Record<string, number> = {};
  if (ground) nodeVoltages[ground.id] = 0;

  for (let i = 0; i < numNodes; i++) {
    nodeVoltages[nodes[i].id] = solution[i];
  }

  // Compute branch currents and power
  const branchCurrents: Record<string, number> = {};
  const branchPower: Record<string, number> = {};
  let totalPower = 0;

  for (const comp of components) {
    const vA = nodeVoltages[comp.nodeA] || 0;
    const vB = nodeVoltages[comp.nodeB] || 0;
    const vDrop = vA - vB;
    comp.voltageDrop = vDrop;

    let current = 0;
    if (comp.type === 'resistor') {
      current = vDrop / comp.value;
    } else if (comp.type === 'vsource') {
      // Current through voltage source from MNA
      const vsIdx = vSources.indexOf(comp);
      if (vsIdx >= 0) {
        current = solution[numNodes + vsIdx];
      }
    } else if (comp.type === 'isource') {
      current = comp.value;
    } else if (comp.type === 'capacitor' || comp.type === 'inductor') {
      // For DC steady state
      current = comp.type === 'capacitor' ? 0 : vDrop / 1e-6; // capacitor = open, inductor = short approx
    }

    comp.current = current;
    comp.power = vDrop * current;
    branchCurrents[comp.id] = current;
    branchPower[comp.id] = comp.power;
    totalPower += Math.abs(comp.power);
  }

  return {
    nodeVoltages,
    branchCurrents,
    branchPower,
    totalPower,
    converged: true,
    iterations: 1,
  };
}

// Format engineering notation
export function formatEng(value: number, unit: string): string {
  if (Math.abs(value) < 1e-9) return `0 ${unit}`;
  const prefixes = [
    { val: 1e12, pre: 'T' }, { val: 1e9, pre: 'G' }, { val: 1e6, pre: 'M' },
    { val: 1e3, pre: 'k' }, { val: 1, pre: '' }, { val: 1e-3, pre: 'm' },
    { val: 1e-6, pre: 'μ' }, { val: 1e-9, pre: 'n' }, { val: 1e-12, pre: 'p' },
  ];
  const abs = Math.abs(value);
  for (const p of prefixes) {
    if (abs >= p.val) return `${(value / p.val).toFixed(2)} ${p.pre}${unit}`;
  }
  return `${value.toExponential(2)} ${unit}`;
}

// Gauss-Jordan elimination for educational display
export function gaussJordanElimination(A: number[][], b: number[]): { steps: string[]; solution: number[] } {
  const n = A.length;
  const M = A.map((row, i) => [...row, b[i]]);
  const steps: string[] = [];
  steps.push('Initial augmented matrix:');
  steps.push(matrixToString(M));

  for (let col = 0; col < n; col++) {
    // Pivot
    let maxRow = col;
    for (let row = col + 1; row < n; row++) {
      if (Math.abs(M[row][col]) > Math.abs(M[maxRow][col])) maxRow = row;
    }
    if (Math.abs(M[maxRow][col]) < 1e-12) continue;

    if (maxRow !== col) {
      [M[col], M[maxRow]] = [M[maxRow], M[col]];
      steps.push(`Swap R${col + 1} ↔ R${maxRow + 1}`);
      steps.push(matrixToString(M));
    }

    // Normalize pivot row
    const pivot = M[col][col];
    for (let j = col; j <= n; j++) M[col][j] /= pivot;
    if (Math.abs(pivot - 1) > 1e-12) {
      steps.push(`R${col + 1} ÷ ${pivot.toFixed(3)}`);
      steps.push(matrixToString(M));
    }

    // Eliminate other rows
    for (let row = 0; row < n; row++) {
      if (row === col) continue;
      const factor = M[row][col];
      if (Math.abs(factor) < 1e-12) continue;
      for (let j = col; j <= n; j++) M[row][j] -= factor * M[col][j];
      steps.push(`R${row + 1} - (${factor.toFixed(3)}) × R${col + 1}`);
      steps.push(matrixToString(M));
    }
  }

  const solution = M.map(row => row[n]);
  steps.push('Solution: ' + solution.map((v, i) => `x${i + 1} = ${v.toFixed(4)}`).join(', '));

  return { steps, solution };
}

function matrixToString(M: number[][]): string {
  return M.map(row =>
    row.map(v => {
      if (Math.abs(v) < 0.001) return '  0.00';
      if (Math.abs(v) > 999) return v.toExponential(1).padStart(7);
      return v.toFixed(2).padStart(7);
    }).join(' ')
  ).join('\n');
}
