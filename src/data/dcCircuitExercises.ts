export interface DCExercise {
  id: string;
  lessonId: string;
  chapterId: string;
  problem: string;
  hint?: string;
  solution?: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

export const dcCircuitExercises: DCExercise[] = [
  { id: 'dc-e1', lessonId: 's-l2', chapterId: 'dc-series', problem: 'A 12V battery is connected to a 4Ω resistor. Find the current.', hint: 'Use Ohm\'s Law: I = V/R', solution: 'I = 12V / 4Ω = 3A', difficulty: 'beginner' },
  { id: 'dc-e2', lessonId: 's-l2', chapterId: 'dc-series', problem: 'A resistor has 5mA flowing through it with 10V across it. Find its resistance.', hint: 'R = V/I. Convert mA to A.', solution: 'R = 10V / 0.005A = 2000Ω = 2kΩ', difficulty: 'beginner' },
  { id: 'dc-e3', lessonId: 's-l2', chapterId: 'dc-series', problem: 'A 100Ω resistor carries 50mA. Find the voltage across it and the power dissipated.', hint: 'V = IR, then P = VI or P = I²R', solution: 'V = 0.05 × 100 = 5V. P = 0.05² × 100 = 0.25W = 250mW', difficulty: 'beginner' },
  { id: 'dc-e4', lessonId: 's-l3', chapterId: 'dc-series', problem: 'Three resistors (100Ω, 200Ω, 300Ω) are in series with a 12V source. Find the current and voltage across each resistor.', hint: 'R_eq = R1+R2+R3, I = V/R_eq, Vx = I×Rx', solution: 'R_eq = 600Ω, I = 12/600 = 20mA. V₁=2V, V₂=4V, V₃=6V', difficulty: 'beginner' },
  { id: 'dc-e5', lessonId: 's-l3', chapterId: 'dc-series', problem: 'Using the voltage divider rule: A 9V battery connects to 1kΩ and 2kΩ in series. Find the voltage across the 2kΩ resistor.', hint: 'VDR: Vx = V_total × (Rx/R_total)', solution: 'V_2k = 9 × (2000/3000) = 9 × (2/3) = 6V', difficulty: 'beginner' },
  { id: 'dc-e6', lessonId: 'p-l1', chapterId: 'dc-parallel', problem: 'Two resistors (6Ω and 3Ω) are in parallel with a 12V source. Find the equivalent resistance and total current.', hint: 'R_eq = (R1×R2)/(R1+R2), I = V/R_eq', solution: 'R_eq = (6×3)/(6+3) = 18/9 = 2Ω. I = 12/2 = 6A', difficulty: 'beginner' },
  { id: 'dc-e7', lessonId: 'p-l1', chapterId: 'dc-parallel', problem: 'Three resistors (2Ω, 4Ω, 8Ω) are in parallel. Find the equivalent resistance.', hint: '1/R_eq = 1/R1 + 1/R2 + 1/R3', solution: '1/R_eq = 1/2 + 1/4 + 1/8 = 4/8 + 2/8 + 1/8 = 7/8. R_eq = 8/7 ≈ 1.14Ω', difficulty: 'intermediate' },
  { id: 'dc-e8', lessonId: 't-l1', chapterId: 'dc-theorems', problem: 'A circuit has two voltage sources (10V and 5V) and three resistors (2Ω, 4Ω, 6Ω). Use superposition to find the current through the 4Ω resistor.', hint: 'Consider each source alone: short the other source, find contribution, then sum.', solution: 'From 10V: I_4 = 10/(2+4+6) = 0.833A. From 5V: I_4 = 5/(2+4+6) = 0.417A. Total: 1.25A (direction matters!)', difficulty: 'intermediate' },
  { id: 'dc-e9', lessonId: 't-l2', chapterId: 'dc-theorems', problem: 'Find the Thevenin equivalent of a circuit with a 12V source in series with 4Ω and 8Ω, looking across the 8Ω resistor.', hint: 'V_th = open-circuit voltage. R_th = deactivate sources and find resistance.', solution: 'V_th = 12 × (8/(4+8)) = 8V. R_th = 4Ω (8Ω removed, 12V shorted).', difficulty: 'intermediate' },
  { id: 'dc-e10', lessonId: 'c-l2', chapterId: 'dc-capacitors', problem: 'An RC circuit has R = 10kΩ and C = 100μF. Find the time constant. How long until the capacitor is 99% charged?', hint: 'τ = RC. 99% ≈ 5τ.', solution: 'τ = 10,000 × 0.0001 = 1s. 5τ = 5s for 99.3% charged.', difficulty: 'intermediate' },
];

export const dcGlossary = [
  { term: 'Ampere (A)', definition: 'Unit of electric current; 1 coulomb per second' },
  { term: 'Capacitance', definition: 'Ability to store charge per unit voltage; unit: farad (F)' },
  { term: 'Conductance', definition: 'Ease of current flow; G = 1/R; unit: siemens (S)' },
  { term: 'Conventional Current', definition: 'Flow from positive to negative terminal (Franklin convention)' },
  { term: 'Coulomb (C)', definition: 'Unit of electric charge; charge of 6.242×10¹⁸ electrons' },
  { term: 'Current', definition: 'Rate of charge flow; I = Q/t; unit: ampere' },
  { term: 'DC', definition: 'Direct current — unidirectional, constant flow' },
  { term: 'Electron', definition: 'Negatively charged subatomic particle; charge carrier in metals' },
  { term: 'Inductance', definition: 'Ability to store energy in a magnetic field; unit: henry (H)' },
  { term: 'KCL', definition: "Kirchhoff's Current Law: sum of currents at a node = 0" },
  { term: 'KVL', definition: "Kirchhoff's Voltage Law: sum of voltages around a loop = 0" },
  { term: 'Ohm', definition: 'Unit of electrical resistance' },
  { term: "Ohm's Law", definition: 'V = I×R — fundamental relationship in circuit analysis' },
  { term: 'Power', definition: 'Rate of energy transfer; P = V×I; unit: watt (W)' },
  { term: 'Resistance', definition: 'Opposition to current flow; unit: ohm (Ω)' },
  { term: 'Resistivity', definition: 'Material property; ρ; unit: Ω·m' },
  { term: 'Thevenin Equivalent', definition: 'Any linear network = voltage source + series resistance' },
  { term: 'Time Constant', definition: 'τ = RC for capacitors, τ = L/R for inductors' },
  { term: 'Transformer', definition: 'Device transferring energy between coils via magnetic field' },
  { term: 'Voltage', definition: 'Energy per unit charge; V = W/Q; unit: volt (V)' },
];

export const dcFAQ = [
  { q: 'Why do we use conventional current flow instead of electron flow?', a: 'It is the historical standard established by Benjamin Franklin. Both conventions produce identical mathematical results in circuit analysis. Engineers use conventional flow because it is the universal standard.' },
  { q: 'What is the difference between a conductor and an insulator?', a: 'Conductors have loosely bound outer electrons that can move freely (copper, silver, aluminum). Insulators have tightly bound electrons that resist movement (glass, rubber, plastic). Resistivity differs by 24+ orders of magnitude.' },
  { q: 'Why does the capacitor block DC but pass AC?', a: 'A capacitor charges until its voltage equals the source voltage, then current stops. With DC, this happens once and current ceases. With AC, the continuously changing voltage keeps charging/discharging the capacitor, allowing current to flow.' },
  { q: 'What is the significance of 5 time constants?', a: 'After 5τ, a capacitor is 99.3% charged (or discharged). For practical engineering purposes, the transient is considered complete at this point.' },
  { q: 'When should I use nodal analysis vs mesh analysis?', a: 'Use nodal analysis when the circuit has fewer nodes than meshes. Use mesh analysis when the circuit has fewer meshes than nodes. Both methods always work — choose the one that produces fewer equations.' },
];

export const dcInterviewQuestions = [
  { q: 'State Ohm\'s Law and give all three forms.', a: 'V = IR, I = V/R, R = V/I' },
  { q: 'What is the difference between Thevenin and Norton equivalents?', a: 'Thevenin: voltage source V_th in series with R_th. Norton: current source I_n in parallel with R_n (= R_th). I_n = V_th/R_th.' },
  { q: 'How do you calculate the time constant of an RC circuit?', a: 'τ = R × C, where R is in ohms and C is in farads. Result is in seconds.' },
  { q: 'What is maximum power transfer theorem?', a: 'Maximum power transfers to the load when R_load = R_th. P_max = V_th²/(4R_th). Only 50% efficient.' },
  { q: 'Explain why inductor current cannot change instantaneously.', a: 'V = L(dI/dt). An instantaneous change implies infinite dI/dt, requiring infinite voltage. Physically impossible.' },
];
