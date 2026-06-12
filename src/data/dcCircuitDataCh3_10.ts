import type { DCChapter } from './dcCircuitData';

export const dcChapters3_10: DCChapter[] = [
  {
    id: 'dc-series',
    number: 3,
    title: 'Series Resistive Circuits',
    subtitle: "Ohm's Law and Kirchhoff's Voltage Law",
    description: 'Conventional vs electron flow, series connections, Ohm\'s Law, KVL, voltage divider rule, and potentiometers.',
    icon: 'GitCommitVertical',
    color: '#3b82f6',
    learningObjectives: [
      'Distinguish conventional current flow from electron flow',
      'Identify series circuits with voltage or current sources',
      'Compute equivalent resistance, component voltages, and circulating current',
      'Apply Ohm\'s Law, KVL, and the Voltage Divider Rule',
    ],
    progress: 0,
    sections: [
      {
        id: 's-flow',
        title: 'Conventional vs Electron Flow',
        description: 'Historical convention and why the difference does not matter.',
        lessons: [
          {
            id: 's-l1', number: '3.1', title: 'Current Flow Direction', duration: '10 min', difficulty: 'beginner', type: 'theory',
            content: `<h2>Conventional vs Electron Flow</h2><p>Benjamin Franklin (1746) guessed electricity flowed positive to negative. This became <strong>conventional current flow</strong>. We now know electrons (negative) flow from negative to positive — <strong>electron flow</strong>.</p><p><strong>It does not matter.</strong> Both produce identical results. Moving negative charge left = moving positive "holes" right. Engineers use conventional flow (positive to negative) as standard.</p><table style="width:100%;border-collapse:collapse;margin:1rem 0;"><tr style="border-bottom:1px solid rgba(255,255,255,0.1)"><th style="padding:0.5rem;color:#3b82f6;">Model</th><th style="padding:0.5rem;color:#3b82f6;">Direction</th><th style="padding:0.5rem;color:#3b82f6;">When Used</th></tr><tr><td style="padding:0.5rem;"><strong>Conventional</strong></td><td style="padding:0.5rem;">+ to -</td><td style="padding:0.5rem;">Standard circuit analysis (this text)</td></tr><tr><td style="padding:0.5rem;"><strong>Electron</strong></td><td style="padding:0.5rem;">- to +</td><td style="padding:0.5rem;">Semiconductor physics</td></tr></table>`,
            executiveSummary: 'Franklin guessed wrong about current direction, but his convention (positive to negative) remains standard. Both models give identical results.',
            keyTakeaways: ['Conventional flow: + to - (standard)', 'Electron flow: - to + (actual electron movement)', 'Both models produce identical analysis results'],
          },
        ],
      },
      {
        id: 's-ohms-law',
        title: "Ohm's Law",
        description: 'The most fundamental relationship in circuit analysis.',
        lessons: [
          {
            id: 's-l2', number: '3.2', title: "Ohm's Law", duration: '15 min', difficulty: 'beginner', type: 'theory',
            content: `<h2>Ohm's Law</h2><p>V = I x R. Three forms: V = IR, I = V/R, R = V/I.</p><div class="formula-block">V = I x R<br>I = V / R<br>R = V / I</div><p>Power: P = I^2 R = V^2 / R = VI</p>`,
            formulas: [
              { name: "Ohm's Law", formula: 'V = I x R', variables: ['V: voltage (V)', 'I: current (A)', 'R: resistance (ohm)'] },
              { name: 'Power', formula: 'P = I^2 R = V^2 / R = VI', variables: ['P: power (W)'] },
            ],
            visualComponent: 'ohms-law',
            keyTakeaways: ['V = IR', 'I = V/R', 'R = V/I', 'P = I^2R = V^2/R = VI'],
          },
        ],
      },
      {
        id: 's-kvl',
        title: 'KVL and Series Analysis',
        description: "Kirchhoff's Voltage Law and the voltage divider rule.",
        lessons: [
          {
            id: 's-l3', number: '3.3', title: 'KVL and Voltage Divider', duration: '20 min', difficulty: 'beginner', type: 'theory',
            content: `<h2>Kirchhoff's Voltage Law (KVL)</h2><p>Sum of voltages around any closed loop = 0.</p><div class="formula-block">Sum V = 0 (around closed loop)</div><h3>Series Resistance</h3><div class="formula-block">R_eq = R1 + R2 + ... + Rn</div><h3>Voltage Divider Rule</h3><div class="formula-block">Vx = V_source x (Rx / R_total)</div>`,
            formulas: [
              { name: 'KVL', formula: 'Sum V = 0', variables: [] },
              { name: 'Series R', formula: 'R_eq = Sum R_n', variables: [] },
              { name: 'Voltage Divider', formula: 'Vx = V_total x (Rx / R_total)', variables: ['Vx: voltage across Rx', 'V_total: source voltage', 'Rx: target resistor', 'R_total: sum of all resistors'] },
            ],
            visualComponent: 'series-circuit',
            keyTakeaways: ['KVL: sum of voltages around loop = 0', 'Series R adds: R_eq = R1 + R2 + ...', 'VDR: Vx = V_total x Rx/R_total'],
          },
        ],
      },
    ],
  },
  {
    id: 'dc-parallel',
    number: 4,
    title: 'Parallel Resistive Circuits',
    subtitle: "Kirchhoff's Current Law",
    description: 'Parallel connections, equivalent resistance, KCL, current divider rule, and circuit protection.',
    icon: 'GitFork',
    color: '#8b5cf6',
    learningObjectives: [
      'Identify parallel circuit configurations',
      'Compute equivalent parallel resistance',
      'Apply KCL and the Current Divider Rule',
      'Describe fuses and circuit breakers',
    ],
    progress: 0,
    sections: [
      {
        id: 'p-parallel',
        title: 'Parallel Connections',
        description: 'Identifying parallel circuits and combining parallel resistors.',
        lessons: [
          {
            id: 'p-l1', number: '4.1', title: 'Parallel Circuits and KCL', duration: '20 min', difficulty: 'beginner', type: 'theory',
            content: `<h2>Parallel Circuits</h2><p>Components are in <strong>parallel</strong> when they share the same two connection points (nodes), so the voltage across each is identical.</p><h3>Kirchhoff's Current Law (KCL)</h3><p>Sum of currents entering a node = sum of currents leaving:</p><div class="formula-block">Sum I_in = Sum I_out</div><p>Or: Sum I = 0 at any node</p><h3>Parallel Resistance</h3><div class="formula-block">1/R_eq = 1/R1 + 1/R2 + ... + 1/Rn</div><p>For two resistors:</p><div class="formula-block">R_eq = (R1 x R2) / (R1 + R2)</div><h3>Current Divider Rule</h3><div class="formula-block">Ix = I_total x (R_eq / Rx) = I_total x (R_other / (Rx + R_other))</div><p>Note: Current through a branch is INVERSELY proportional to its resistance.</p>`,
            formulas: [
              { name: 'KCL', formula: 'Sum I = 0 at any node', variables: [] },
              { name: 'Parallel R', formula: '1/R_eq = Sum(1/Rn)', variables: [] },
              { name: 'Two-resistor parallel', formula: 'R_eq = (R1 x R2)/(R1 + R2)', variables: [] },
              { name: 'Current Divider', formula: 'Ix = I_total x (R_eq / Rx)', variables: ['Ix: current through Rx', 'I_total: total entering current'] },
            ],
            visualComponent: 'parallel-circuit',
            keyTakeaways: ['Parallel: same voltage across all components', 'KCL: sum of currents at node = 0', '1/Req = 1/R1 + 1/R2 + ...', 'Current divider: current splits inversely proportional to resistance'],
          },
        ],
      },
    ],
  },
  {
    id: 'dc-series-parallel',
    number: 5,
    title: 'Series-Parallel Circuits',
    subtitle: 'Combining Series and Parallel Analysis',
    description: 'Simplifying series-parallel combinations, ladder networks, and bridge circuits.',
    icon: 'Network',
    color: '#ec4899',
    learningObjectives: [
      'Identify series and parallel sub-circuits within larger networks',
      'Simplify circuits by successive combination',
      'Analyze ladder networks and bridge circuits',
    ],
    progress: 0,
    sections: [
      {
        id: 'sp-analysis',
        title: 'Series-Parallel Analysis',
        description: 'Systematic reduction of complex circuits.',
        lessons: [
          {
            id: 'sp-l1', number: '5.1', title: 'Series-Parallel Analysis', duration: '25 min', difficulty: 'intermediate', type: 'theory',
            content: `<h2>Series-Parallel Circuit Analysis</h2><h3>Strategy: Successive Simplification</h3><ol><li>Identify series and parallel combinations</li><li>Replace each combination with its equivalent</li><li>Repeat until one equivalent resistance remains</li><li>Work backwards to find individual voltages and currents</li></ol><h3>Ladder Networks</h3><p>Start from the end farthest from the source and work toward it, combining as you go.</p><h3>Delta-Y (Pi-Tee) Transformations</h3><p>For circuits that cannot be reduced by simple series/parallel combinations:</p><div class="formula-block">Ra = (RAB x RAC) / (RAB + RAC + RBC)</div><div class="formula-block">Rab = Ra + Rb + (Ra x Rb)/Rc</div>`,
            keyTakeaways: ['Simplify from the outside in', 'Work backwards from total to individual components', 'Delta-Y transforms bridge circuits into series-parallel networks'],
          },
        ],
      },
    ],
  },
  {
    id: 'dc-theorems',
    number: 6,
    title: 'Analysis Theorems',
    subtitle: 'Superposition, Thevenin, Norton, and Max Power Transfer',
    description: 'Source conversions, superposition theorem, equivalent circuits, and maximum power transfer.',
    icon: 'Lightbulb',
    color: '#f97316',
    learningObjectives: [
      'Apply source conversions',
      'Use the superposition theorem',
      'Find Thevenin and Norton equivalent circuits',
      'Apply the maximum power transfer theorem',
      'Perform delta-Y conversions',
    ],
    progress: 0,
    sections: [
      {
        id: 't-superposition',
        title: 'Superposition Theorem',
        description: 'Analyzing circuits with multiple sources.',
        lessons: [
          {
            id: 't-l1', number: '6.1', title: 'Superposition Theorem', duration: '20 min', difficulty: 'intermediate', type: 'theory',
            content: `<h2>Superposition Theorem</h2><p>For linear circuits with multiple sources, the total response equals the sum of responses from each source acting alone.</p><h3>Procedure</h3><ol><li>Keep one source active, replace all other <strong>voltage sources</strong> with <strong>short circuits</strong></li><li>Replace all other <strong>current sources</strong> with <strong>open circuits</strong></li><li>Compute the desired voltage/current from this single source</li><li>Repeat for each source</li><li>Algebraically sum all individual contributions</li></ol><div class="callout-warning">Superposition applies ONLY to linear circuits. It works for voltage and current but NOT for power (power is quadratic, not linear).</div>`,
            keyTakeaways: ['Replace inactive voltage sources with shorts', 'Replace inactive current sources with opens', 'Sum individual responses algebraically', 'Does NOT apply to power calculations'],
          },
        ],
      },
      {
        id: 't-thevenin',
        title: 'Thevenin and Norton Equivalents',
        description: 'Simplifying complex networks into equivalent circuits.',
        lessons: [
          {
            id: 't-l2', number: '6.2', title: 'Thevenin and Norton Theorems', duration: '25 min', difficulty: 'intermediate', type: 'theory',
            content: `<h2>Thevenin's Theorem</h2><p>Any linear DC network can be replaced by an equivalent circuit with:</p><ul><li><strong>V_th</strong>: open-circuit voltage at the terminals</li><li><strong>R_th</strong>: equivalent resistance with all sources deactivated</li></ul><h2>Norton's Theorem</h2><p>The current-source equivalent:</p><ul><li><strong>I_n</strong>: short-circuit current at the terminals</li><li><strong>R_n</strong> = R_th (same resistance)</li></ul><h3>Relationships</h3><div class="formula-block">V_th = I_n x R_th<br>I_n = V_th / R_th<br>R_th = V_th / I_n</div><h3>Finding R_th</h3><ol><li>Deactivate all sources (V sources → short, I sources → open)</li><li>Compute resistance looking into the terminals</li></ol>`,
            formulas: [
              { name: 'Thevenin', formula: 'V_th = V_open_circuit', variables: [] },
              { name: 'Norton', formula: 'I_n = I_short_circuit', variables: [] },
              { name: 'R_th', formula: 'R_th = V_th / I_n', variables: [] },
            ],
            keyTakeaways: ['Thevenin: V_source + R_series', 'Norton: I_source + R_parallel', 'R_th = R_n = V_th / I_n', 'Deactivate sources to find R_th'],
          },
        ],
      },
      {
        id: 't-maxpower',
        title: 'Maximum Power Transfer',
        description: 'When does a load receive maximum power from a source?',
        lessons: [
          {
            id: 't-l3', number: '6.3', title: 'Maximum Power Transfer Theorem', duration: '15 min', difficulty: 'intermediate', type: 'theory',
            content: `<h2>Maximum Power Transfer Theorem</h2><p>Maximum power is transferred to the load when the load resistance equals the Thevenin resistance of the source network:</p><div class="formula-block">R_load = R_th</div><p>At maximum power transfer:</p><div class="formula-block">P_max = V_th^2 / (4 x R_th)</div><div class="callout"><strong>Important:</strong> Maximum power transfer occurs at 50% efficiency. For power systems, this is wasteful — we want maximum efficiency, not maximum power transfer. This theorem is most relevant in communication and audio systems where signal strength matters more than efficiency.</div>`,
            formulas: [
              { name: 'Max Power Condition', formula: 'R_load = R_th', variables: [] },
              { name: 'Max Power', formula: 'P_max = V_th^2 / (4 x R_th)', variables: ['V_th: Thevenin voltage', 'R_th: Thevenin resistance'] },
            ],
            keyTakeaways: ['R_load = R_th for max power transfer', 'P_max = V_th^2 / (4 R_th)', 'Only 50% efficient at max power', 'Used in signal systems, not power systems'],
          },
        ],
      },
    ],
  },
  {
    id: 'dc-nodal-mesh',
    number: 7,
    title: 'Nodal and Mesh Analysis',
    subtitle: 'Systematic Circuit Analysis Methods',
    description: 'Nodal analysis, mesh analysis, and dependent sources.',
    icon: 'Grid3x3',
    color: '#06b6d4',
    learningObjectives: [
      'Apply nodal analysis using KCL',
      'Apply mesh analysis using KVL',
      'Handle dependent (controlled) sources',
    ],
    progress: 0,
    sections: [
      {
        id: 'nm-nodal',
        title: 'Nodal Analysis',
        description: 'Using KCL at nodes to solve for node voltages.',
        lessons: [
          {
            id: 'nm-l1', number: '7.1', title: 'Nodal Analysis', duration: '25 min', difficulty: 'intermediate', type: 'theory',
            content: `<h2>Nodal Analysis</h2><p>A systematic method using KCL at each node (except reference) to solve for node voltages.</p><h3>Procedure</h3><ol><li>Select a reference node (ground), usually the node with most connections</li><li>Label remaining node voltages (V1, V2, ...)</li><li>Apply KCL at each non-reference node: sum of currents leaving = 0</li><li>Express each current using Ohm's Law: I = (V_node - V_neighbor) / R</li><li>Solve the resulting system of equations</li></ol><div class="formula-block">At node N: Sum[(V_N - V_X) / R_NX] = 0</div><p>For a node connected to a voltage source, use a <strong>supernode</strong> (enclose the source in the KCL equation).</p>`,
            keyTakeaways: ['Pick reference node (ground)', 'Apply KCL at each unknown node', 'Express currents as (V_node - V_neighbor)/R', 'Use supernodes for voltage sources between nodes'],
          },
        ],
      },
      {
        id: 'nm-mesh',
        title: 'Mesh Analysis',
        description: 'Using KVL around mesh loops to solve for mesh currents.',
        lessons: [
          {
            id: 'nm-l2', number: '7.2', title: 'Mesh Analysis', duration: '25 min', difficulty: 'intermediate', type: 'theory',
            content: `<h2>Mesh Analysis</h2><p>A systematic method using KVL around each independent loop (mesh) to solve for mesh currents.</p><h3>Procedure</h3><ol><li>Identify all meshes (loops with no inner loops)</li><li>Assign a mesh current to each mesh (clockwise convention)</li><li>Apply KVL around each mesh</li><li>Express voltage drops using Ohm's Law</li><li>Solve the resulting system of equations</li></ol><div class="formula-block">For mesh N: Sum(R x I_N) - Sum(R x I_adjacent) = Sum(V_sources)</div><p>For a current source shared by two meshes, use a <strong>supermesh</strong> (combine the meshes, excluding the shared current source).</p>`,
            keyTakeaways: ['Assign clockwise mesh currents', 'Apply KVL around each mesh', 'Shared resistors create coupling terms', 'Use supermesh for shared current sources'],
          },
        ],
      },
    ],
  },
  {
    id: 'dc-capacitors',
    number: 8,
    title: 'Capacitors',
    subtitle: 'RC Circuits and Transient Response',
    description: 'Capacitance, RC time constants, charging/discharging, and transient analysis.',
    icon: 'Battery',
    color: '#10b981',
    learningObjectives: [
      'Define capacitance and describe capacitor construction',
      'Analyze RC circuit transient response',
      'Calculate time constants and charging/discharging behavior',
    ],
    progress: 0,
    sections: [
      {
        id: 'c-capacitance',
        title: 'Capacitance and Capacitors',
        description: 'Physical principles and capacitor types.',
        lessons: [
          {
            id: 'c-l1', number: '8.1', title: 'Capacitance', duration: '15 min', difficulty: 'intermediate', type: 'theory',
            content: `<h2>Capacitance</h2><p>A capacitor stores energy in an electric field between two conductive plates separated by a dielectric.</p><div class="formula-block">C = epsilon x A / d</div><p>Where C is capacitance in <strong>farads (F)</strong>, epsilon is permittivity, A is plate area, d is separation.</p><h3>Key Relationships</h3><div class="formula-block">Q = C x V<br>I = C x dV/dt<br>W = 1/2 x C x V^2</div><p>Common units: microfarads (uF), nanofarads (nF), picofarads (pF).</p><h3>Series and Parallel</h3><div class="formula-block">Parallel: C_eq = C1 + C2 + ...<br>Series: 1/C_eq = 1/C1 + 1/C2 + ...</div><p>Note: Opposite of resistors!</p>`,
            formulas: [
              { name: 'Capacitance', formula: 'C = Q / V', variables: ['C: capacitance (F)', 'Q: charge (C)', 'V: voltage (V)'] },
              { name: 'Current', formula: 'I = C x dV/dt', variables: ['I: current', 'C: capacitance', 'dV/dt: rate of voltage change'] },
              { name: 'Stored Energy', formula: 'W = 1/2 C V^2', variables: ['W: energy (J)', 'C: capacitance', 'V: voltage'] },
            ],
            keyTakeaways: ['C = Q/V', 'I = C dV/dt (current only flows when voltage changes)', 'Energy stored: W = 1/2 C V^2', 'Parallel C adds; series C uses reciprocal (opposite of resistors)'],
          },
        ],
      },
      {
        id: 'c-rc',
        title: 'RC Transient Response',
        description: 'Charging and discharging behavior of RC circuits.',
        lessons: [
          {
            id: 'c-l2', number: '8.2', title: 'RC Transient Response', duration: '20 min', difficulty: 'intermediate', type: 'theory',
            content: `<h2>RC Transient Response</h2><h3>Time Constant</h3><div class="formula-block">tau = R x C (seconds)</div><h3>Charging (step response)</h3><div class="formula-block">V_c(t) = V_final x (1 - e^(-t/tau))</div><h3>Discharging</h3><div class="formula-block">V_c(t) = V_initial x e^(-t/tau)</div><h3>Key Time Points</h3><table style="width:100%;border-collapse:collapse;margin:1rem 0;"><tr style="border-bottom:1px solid rgba(255,255,255,0.1)"><th style="padding:0.5rem;color:#10b981;">Time</th><th style="padding:0.5rem;color:#10b981;">Charged To</th></tr><tr><td style="padding:0.5rem;">1 tau</td><td style="padding:0.5rem;">63.2%</td></tr><tr><td style="padding:0.5rem;">2 tau</td><td style="padding:0.5rem;">86.5%</td></tr><tr><td style="padding:0.5rem;">3 tau</td><td style="padding:0.5rem;">95.0%</td></tr><tr><td style="padding:0.5rem;">5 tau</td><td style="padding:0.5rem;">99.3% (steady state)</td></tr></table><div class="callout">At 5 time constants, the capacitor is considered fully charged/discharged for practical purposes.</div>`,
            formulas: [
              { name: 'Time Constant', formula: 'tau = R x C', variables: ['tau: time constant (s)', 'R: resistance (ohm)', 'C: capacitance (F)'] },
              { name: 'Charging', formula: 'V(t) = V_f (1 - e^(-t/tau))', variables: ['V_f: final voltage'] },
              { name: 'Discharging', formula: 'V(t) = V_0 e^(-t/tau)', variables: ['V_0: initial voltage'] },
            ],
            visualComponent: 'rc-charging',
            keyTakeaways: ['Time constant tau = RC', 'Charging: V(t) = V_f(1 - e^(-t/tau))', 'Discharging: V(t) = V_0 e^(-t/tau)', '5 tau = steady state (99.3%)', 'Capacitor acts as open circuit at DC steady state'],
          },
        ],
      },
    ],
  },
  {
    id: 'dc-inductors',
    number: 9,
    title: 'Inductors',
    subtitle: 'RL Circuits and Transient Response',
    description: 'Inductance, RL time constants, energy storage, and transient analysis.',
    icon: 'Magnet',
    color: '#f59e0b',
    learningObjectives: [
      'Define inductance and describe inductor construction',
      'Analyze RL circuit transient response',
      'Understand energy storage in magnetic fields',
    ],
    progress: 0,
    sections: [
      {
        id: 'i-inductance',
        title: 'Inductance',
        description: 'Physical principles and inductor behavior.',
        lessons: [
          {
            id: 'i-l1', number: '9.1', title: 'Inductance and Inductors', duration: '15 min', difficulty: 'intermediate', type: 'theory',
            content: `<h2>Inductance</h2><p>An inductor stores energy in a magnetic field created by current flowing through a coil.</p><div class="formula-block">V = L x dI/dt</div><p>Where L is inductance in <strong>henries (H)</strong>. Common: mH, uH.</p><h3>Key Relationships</h3><div class="formula-block">V = L dI/dt<br>W = 1/2 x L x I^2</div><p>The voltage across an inductor is proportional to the <em>rate of change</em> of current.</p><h3>Series and Parallel</h3><div class="formula-block">Series: L_eq = L1 + L2 + ... (same as resistors)<br>Parallel: 1/L_eq = 1/L1 + 1/L2 + ...</div><h3>Important Property</h3><p>Inductor current cannot change instantaneously. At DC steady state, an inductor acts as a <strong>short circuit</strong>.</p>`,
            formulas: [
              { name: 'Inductor Voltage', formula: 'V = L x dI/dt', variables: ['V: voltage', 'L: inductance (H)', 'dI/dt: rate of current change'] },
              { name: 'Stored Energy', formula: 'W = 1/2 L I^2', variables: ['W: energy (J)', 'L: inductance', 'I: current'] },
            ],
            keyTakeaways: ['V = L dI/dt (voltage proportional to current change rate)', 'Energy: W = 1/2 L I^2', 'Current through inductor cannot change instantaneously', 'Acts as short circuit at DC steady state', 'Series L adds; parallel L uses reciprocal'],
          },
        ],
      },
      {
        id: 'i-rl',
        title: 'RL Transient Response',
        description: 'Time constant behavior of RL circuits.',
        lessons: [
          {
            id: 'i-l2', number: '9.2', title: 'RL Transient Response', duration: '15 min', difficulty: 'intermediate', type: 'theory',
            content: `<h2>RL Transient Response</h2><h3>Time Constant</h3><div class="formula-block">tau = L / R (seconds)</div><h3>Current Rise (energizing)</h3><div class="formula-block">I(t) = I_final x (1 - e^(-t/tau))</div><h3>Current Decay (de-energizing)</h3><div class="formula-block">I(t) = I_initial x e^(-t/tau)</div><p>Same time constant behavior as RC, but for current instead of voltage. At 5 tau, steady state is reached.</p><div class="callout">Inductors oppose changes in current. When a switch opens in an RL circuit, the inductor tries to maintain current, potentially creating a large voltage spike (V = L dI/dt). This is why flyback diodes are used with relays and solenoids.</div>`,
            formulas: [
              { name: 'RL Time Constant', formula: 'tau = L / R', variables: ['tau: time constant (s)', 'L: inductance (H)', 'R: resistance (ohm)'] },
              { name: 'Current Rise', formula: 'I(t) = I_f (1 - e^(-t/tau))', variables: [] },
              { name: 'Current Decay', formula: 'I(t) = I_0 e^(-t/tau)', variables: [] },
            ],
            keyTakeaways: ['tau = L/R', 'Current rise: I(t) = I_f(1 - e^(-t/tau))', 'Current decay: I(t) = I_0 e^(-t/tau)', '5 tau = steady state', 'Opening switch in RL can cause voltage spikes'],
          },
        ],
      },
    ],
  },
  {
    id: 'dc-magnetics',
    number: 10,
    title: 'Magnetics & Transformers',
    subtitle: 'Magnetic Circuits and Transformer Analysis',
    description: 'Electromagnetic induction, magnetic circuits, and transformer principles.',
    icon: 'Magnet',
    color: '#ef4444',
    learningObjectives: [
      'Describe electromagnetic induction',
      'Analyze basic magnetic circuits',
      'Understand transformer operation and turns ratio',
    ],
    progress: 0,
    sections: [
      {
        id: 'm-transformers',
        title: 'Transformers',
        description: 'Transformer principles and analysis.',
        lessons: [
          {
            id: 'm-l1', number: '10.1', title: 'Transformers', duration: '20 min', difficulty: 'intermediate', type: 'theory',
            content: `<h2>Transformers</h2><p>A transformer transfers electrical energy between two coils through a shared magnetic field. Works only with <strong>AC</strong> (or changing current).</p><h3>Turns Ratio</h3><div class="formula-block">Vp/Vs = Np/Ns = a (turns ratio)</div><h3>Voltage Relationship</h3><div class="formula-block">Vs = Vp x (Ns/Np) = Vp / a</div><h3>Current Relationship</h3><div class="formula-block">Is = Ip x (Np/Ns) = Ip x a</div><h3>Types</h3><ul><li><strong>Step-up:</strong> Ns > Np, Vs > Vp (a < 1)</li><li><strong>Step-down:</strong> Ns < Np, Vs < Vp (a > 1)</li><li><strong>Isolation:</strong> Ns = Np, no voltage change but galvanic isolation</li></ul><div class="callout">Ideal transformers conserve power: P_in = P_out. Real transformers have losses (copper loss, core loss, leakage flux).</div>`,
            formulas: [
              { name: 'Turns Ratio', formula: 'a = Np / Ns = Vp / Vs', variables: ['a: turns ratio', 'Np: primary turns', 'Ns: secondary turns'] },
              { name: 'Secondary Voltage', formula: 'Vs = Vp x Ns/Np', variables: [] },
              { name: 'Secondary Current', formula: 'Is = Ip x Np/Ns', variables: [] },
              { name: 'Reflected Impedance', formula: 'Z_p = a^2 x Z_s', variables: ['Z_p: impedance seen at primary', 'Z_s: load on secondary'] },
            ],
            keyTakeaways: ['Vp/Vs = Np/Ns = turns ratio', 'Is/Ip = Np/Ns (inverse of voltage)', 'Step-up: more secondary turns', 'Reflected impedance: Z_p = a^2 Z_s', 'Works only with changing current (AC)'],
          },
        ],
      },
    ],
  },
];
