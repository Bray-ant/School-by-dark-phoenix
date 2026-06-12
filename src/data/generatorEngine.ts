export type DifficultyLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7;
export type Topic =
  | 'Linear Equations' | 'Quadratic Equations' | 'Systems of Equations' | 'Polynomials'
  | 'Functions' | 'Exponents & Logarithms' | 'Trigonometry' | 'Derivatives' | 'Integrals'
  | 'Matrices' | 'Determinants' | 'Eigenvalues' | 'Probability' | 'Combinatorics' | 'Sequences & Series';

export const topics: Topic[] = [
  'Linear Equations', 'Quadratic Equations', 'Systems of Equations', 'Polynomials', 'Functions',
  'Exponents & Logarithms', 'Trigonometry', 'Derivatives', 'Integrals', 'Matrices',
  'Determinants', 'Eigenvalues', 'Probability', 'Combinatorics', 'Sequences & Series',
];

export const topicColors: Record<Topic, string> = {
  'Linear Equations': '#3b82f6', 'Quadratic Equations': '#8b5cf6', 'Systems of Equations': '#06b6d4',
  'Polynomials': '#10b981', 'Functions': '#f59e0b', 'Exponents & Logarithms': '#ef4444',
  'Trigonometry': '#ec4899', 'Derivatives': '#14b8a6', 'Integrals': '#f97316',
  'Matrices': '#6366f1', 'Determinants': '#8b5cf6', 'Eigenvalues': '#10b981',
  'Probability': '#3b82f6', 'Combinatorics': '#f59e0b', 'Sequences & Series': '#06b6d4',
};

export const difficultyLabels: Record<DifficultyLevel, string> = {
  1: 'Foundational', 2: 'Basic Application', 3: 'Intermediate', 4: 'Advanced', 5: 'Expert', 6: 'Competition', 7: 'Research',
};

export const difficultyColors: Record<DifficultyLevel, string> = {
  1: '#10b981', 2: '#34d399', 3: '#f59e0b', 4: '#f97316', 5: '#ef4444', 6: '#dc2626', 7: '#7c3aed',
};

export interface GeneratedExercise {
  id: string; topic: Topic; difficulty: DifficultyLevel; problemText: string;
  answer: string; solutionSteps: { title: string; content: string }[]; hints: string[];
  estimatedTime: string; verification: string; seed: number;
}

export interface MasteryProgress {
  topic: Topic; completed: number; correct: number; totalTime: number;
  currentStreak: number; bestStreak: number; lastPracticed: string;
}

const randInt = (min: number, max: number, seed: number): number => {
  const x = Math.sin(seed * 9301 + 49297) * 49297;
  return Math.floor(min + (x - Math.floor(x)) * (max - min + 1));
};
let globalSeed = Math.floor(Math.random() * 1000000);
const nextSeed = (): number => { globalSeed++; return globalSeed; };

function generateLinear(diff: DifficultyLevel, seed: number): GeneratedExercise {
  const x = diff <= 2 ? randInt(-20, 20, seed) : randInt(-10, 10, seed);
  const a = randInt(2, 12, seed + 1), b = randInt(-30, 30, seed + 2), c = a * x + b;
  const bStr = b >= 0 ? `+ ${b}` : `- ${Math.abs(b)}`;
  return {
    id: `lin-${seed}`, topic: 'Linear Equations', difficulty: diff,
    problemText: `Solve: ${a}x ${bStr} = ${c}`,
    answer: `x = ${x}`,
    solutionSteps: [
      { title: 'Isolate the variable term', content: `${a}x ${bStr} = ${c}<br>Subtract ${b}: ${a}x = ${c - b}` },
      { title: 'Solve for x', content: `x = ${c - b} / ${a}<br><strong>x = ${x}</strong>` },
      { title: 'Verify', content: `${a}(${x}) ${bStr} = ${c} ✓` },
    ],
    hints: [`Move the constant to the other side`, `Divide by ${a}`, `x = ${x}`],
    estimatedTime: diff <= 2 ? '2 min' : '3 min', verification: `${a}(${x}) ${bStr} = ${c} ✓`, seed,
  };
}

function generateQuadratic(diff: DifficultyLevel, seed: number): GeneratedExercise {
  const r1 = randInt(-10, 10, seed), r2 = randInt(-10, 10, seed + 1);
  const a = diff <= 3 ? 1 : randInt(2, 5, seed + 2);
  const b = -(r1 + r2) * a, c = r1 * r2 * a;
  const D = b * b - 4 * a * c;
  return {
    id: `quad-${seed}`, topic: 'Quadratic Equations', difficulty: diff,
    problemText: `Solve: ${a === 1 ? '' : a}x² ${b >= 0 ? '+ ' + b : '- ' + Math.abs(b)}x ${c >= 0 ? '+ ' + c : '- ' + Math.abs(c)} = 0`,
    answer: `x₁ = ${r1}, x₂ = ${r2}`,
    solutionSteps: [
      { title: 'Identify coefficients', content: `a = ${a}, b = ${b}, c = ${c}` },
      { title: 'Calculate discriminant', content: `D = b² − 4ac = ${D}` },
      { title: 'Apply quadratic formula', content: `x = (${-b} ± √${D}) / ${2 * a}` },
      { title: 'Roots', content: `<strong>x₁ = ${r1}, x₂ = ${r2}</strong>` },
    ],
    hints: ['Use x = (−b ± √(b²−4ac))/2a', `D = ${D}`, `x = (${-b} ± ${Math.sqrt(D)})/${2 * a}`],
    estimatedTime: '3 min', verification: `Verify: ${a}(${r1})² + (${b})(${r1}) + ${c} = 0 ✓`, seed,
  };
}

function generateSystem(diff: DifficultyLevel, seed: number): GeneratedExercise {
  const x = randInt(-10, 10, seed), y = randInt(-10, 10, seed + 1);
  const a1 = randInt(1, 8, seed + 2), b1 = randInt(1, 8, seed + 3);
  const a2 = randInt(1, 8, seed + 4), b2 = randInt(1, 8, seed + 5);
  const c1 = a1 * x + b1 * y, c2 = a2 * x + b2 * y;
  return {
    id: `sys-${seed}`, topic: 'Systems of Equations', difficulty: diff,
    problemText: `Solve:<br>${a1}x + ${b1}y = ${c1}<br>${a2}x + ${b2}y = ${c2}`,
    answer: `x = ${x}, y = ${y}`,
    solutionSteps: [
      { title: 'Multiply to match coefficients', content: `Eq1 × ${a2}: ${a1 * a2}x + ${b1 * a2}y = ${c1 * a2}<br>Eq2 × ${a1}: ${a2 * a1}x + ${b2 * a1}y = ${c2 * a1}` },
      { title: 'Subtract and solve', content: `${b1 * a2 - b2 * a1}y = ${c1 * a2 - c2 * a1}<br>y = ${y}` },
      { title: 'Back-substitute', content: `x = ${x}` },
    ],
    hints: ['Use elimination method', `After elimination: y = ${y}`, `x = ${x}, y = ${y}`],
    estimatedTime: '4 min', verification: `Verified both equations.`, seed,
  };
}

function generateDerivative(diff: DifficultyLevel, seed: number): GeneratedExercise {
  const a = randInt(2, 8, seed), n = randInt(2, 6, seed + 1);
  return {
    id: `deriv-${seed}`, topic: 'Derivatives', difficulty: diff,
    problemText: `Find the derivative of f(x) = ${a}x^${n}`,
    answer: `f'(x) = ${a * n}x^${n - 1}`,
    solutionSteps: [
      { title: 'Apply power rule', content: `d/dx[x^n] = n·x^(n−1)` },
      { title: 'Differentiate', content: `f'(x) = ${a} · ${n} · x^${n - 1} = <strong>${a * n}x^${n - 1}</strong>` },
    ],
    hints: ['Power rule: d/dx[x^n] = n·x^(n−1)', `f'(x) = ${a * n}x^${n - 1}`],
    estimatedTime: '2 min', verification: `d/dx[${a}x^${n}] = ${a * n}x^${n - 1} ✓`, seed,
  };
}

function generateIntegral(diff: DifficultyLevel, seed: number): GeneratedExercise {
  const a = randInt(2, 6, seed), n = randInt(2, 5, seed + 1);
  return {
    id: `int-${seed}`, topic: 'Integrals', difficulty: diff,
    problemText: `Evaluate: ∫ ${a}x^${n} dx`,
    answer: `${a}/${n + 1} x^${n + 1} + C`,
    solutionSteps: [
      { title: 'Power rule for integration', content: `∫ x^n dx = x^(n+1)/(n+1) + C` },
      { title: 'Integrate', content: `∫ ${a}x^${n} dx = ${a}·x^${n + 1}/${n + 1} + C` },
    ],
    hints: ['∫x^n dx = x^(n+1)/(n+1) + C', `The answer is ${a}/${n + 1} x^${n + 1} + C`],
    estimatedTime: '2 min', verification: `d/dx[${a}/${n + 1} x^${n + 1}] = ${a}x^${n} ✓`, seed,
  };
}

function generateTrig(diff: DifficultyLevel, seed: number): GeneratedExercise {
  const angles = [0, 30, 45, 60, 90]; const idx = randInt(0, angles.length - 1, seed);
  const angle = angles[idx];
  const exact: Record<number, { sin: string; cos: string }> = {
    0: { sin: '0', cos: '1' }, 30: { sin: '1/2', cos: '√3/2' }, 45: { sin: '√2/2', cos: '√2/2' },
    60: { sin: '√3/2', cos: '1/2' }, 90: { sin: '1', cos: '0' },
  };
  const askSin = randInt(0, 1, seed + 1) === 0;
  return {
    id: `trig-${seed}`, topic: 'Trigonometry', difficulty: diff,
    problemText: `Find ${askSin ? 'sin' : 'cos'}(${angle}°)`,
    answer: askSin ? exact[angle].sin : exact[angle].cos,
    solutionSteps: [{ title: 'Unit circle', content: `${askSin ? 'sin' : 'cos'}(${angle}°) = <strong>${askSin ? exact[angle].sin : exact[angle].cos}</strong>` }],
    hints: [`Remember the unit circle value for ${angle}°`],
    estimatedTime: '1 min', verification: `${askSin ? 'sin' : 'cos'}(${angle}°) = ${askSin ? exact[angle].sin : exact[angle].cos} ✓`, seed,
  };
}

function generateDeterminant(diff: DifficultyLevel, seed: number): GeneratedExercise {
  const a = randInt(1, 8, seed), b = randInt(1, 8, seed + 1), c = randInt(1, 8, seed + 2), d = randInt(1, 8, seed + 3);
  const det = a * d - b * c;
  return {
    id: `det-${seed}`, topic: 'Determinants', difficulty: diff,
    problemText: `Find the determinant of [[${a}, ${b}], [${c}, ${d}]]`,
    answer: `${det}`,
    solutionSteps: [
      { title: 'Formula', content: `det = ad − bc` },
      { title: 'Compute', content: `(${a})(${d}) − (${b})(${c}) = ${a * d} − ${b * c} = <strong>${det}</strong>` },
    ],
    hints: ['det = ad − bc', `The answer is ${det}`],
    estimatedTime: '2 min', verification: `${a}·${d} − ${b}·${c} = ${det} ✓`, seed,
  };
}

function generateMatrix(diff: DifficultyLevel, seed: number): GeneratedExercise {
  const a = randInt(1, 5, seed), b = randInt(1, 5, seed + 1), c = randInt(1, 5, seed + 2), d = randInt(1, 5, seed + 3), k = randInt(2, 4, seed + 4);
  return {
    id: `mat-${seed}`, topic: 'Matrices', difficulty: diff,
    problemText: `Given A = [[${a}, ${b}], [${c}, ${d}]], compute ${k}A`,
    answer: `[[${k * a}, ${k * b}], [${k * c}, ${k * d}]]`,
    solutionSteps: [{ title: 'Scalar multiplication', content: `${k} · [[${a}, ${b}], [${c}, ${d}]] = [[${k * a}, ${k * b}], [${k * c}, ${k * d}]]` }],
    hints: [`Multiply every entry by ${k}`], estimatedTime: '2 min', verification: `All entries × ${k} ✓`, seed,
  };
}

function generateProbability(diff: DifficultyLevel, seed: number): GeneratedExercise {
  const total = randInt(20, 52, seed), favorable = randInt(5, Math.floor(total / 2), seed + 1);
  const prob = Math.round((favorable / total) * 100);
  return {
    id: `prob-${seed}`, topic: 'Probability', difficulty: diff,
    problemText: `A bag contains ${total} balls, ${favorable} of which are blue. What is the probability of selecting a blue ball?`,
    answer: `${favorable}/${total} = ${prob}%`,
    solutionSteps: [
      { title: 'Identify values', content: `Favorable: ${favorable}, Total: ${total}` },
      { title: 'Compute', content: `P = ${favorable}/${total} = <strong>${prob}%</strong>` },
    ],
    hints: ['P = favorable / total', `The answer is ${favorable}/${total}`],
    estimatedTime: '2 min', verification: `${favorable}/${total} = ${prob}% ✓`, seed,
  };
}

function generateCombinatorics(diff: DifficultyLevel, seed: number): GeneratedExercise {
  const n = randInt(5, 12, seed), k = randInt(2, Math.min(n - 1, 5), seed + 1);
  const fact = (x: number): number => x <= 1 ? 1 : x * fact(x - 1);
  const c = fact(n) / (fact(k) * fact(n - k));
  return {
    id: `comb-${seed}`, topic: 'Combinatorics', difficulty: diff,
    problemText: `How many ways can you choose ${k} items from ${n}?`,
    answer: `C(${n}, ${k}) = ${c}`,
    solutionSteps: [
      { title: 'Formula', content: `C(n,k) = n! / (k!(n−k)!)` },
      { title: 'Compute', content: `C(${n}, ${k}) = ${fact(n)} / (${fact(k)} · ${fact(n - k)}) = <strong>${c}</strong>` },
    ],
    hints: ['Use C(n,k) = n!/(k!(n-k)!)', `The answer is ${c}`],
    estimatedTime: '2 min', verification: `C(${n},${k}) = ${c} ✓`, seed,
  };
}

function generateSequence(diff: DifficultyLevel, seed: number): GeneratedExercise {
  const a1 = randInt(2, 10, seed), d = randInt(2, 8, seed + 1), n = randInt(5, 12, seed + 2);
  const an = a1 + (n - 1) * d;
  return {
    id: `seq-${seed}`, topic: 'Sequences & Series', difficulty: diff,
    problemText: `Find the ${n}th term of: ${a1}, ${a1 + d}, ${a1 + 2 * d}, ...`,
    answer: `a_${n} = ${an}`,
    solutionSteps: [
      { title: 'Identify', content: `a₁ = ${a1}, d = ${d}` },
      { title: 'Apply formula', content: `a_n = a₁ + (n−1)d<br>a_${n} = ${a1} + ${n - 1}·${d} = <strong>${an}</strong>` },
    ],
    hints: ['a_n = a₁ + (n−1)d', `The answer is ${an}`],
    estimatedTime: '2 min', verification: `a_${n} = ${a1} + ${n-1}·${d} = ${an} ✓`, seed,
  };
}

function generateFunction(diff: DifficultyLevel, seed: number): GeneratedExercise {
  const a = randInt(2, 6, seed), b = randInt(1, 10, seed + 1), x = randInt(1, 5, seed + 2);
  return {
    id: `func-${seed}`, topic: 'Functions', difficulty: diff,
    problemText: `Given f(x) = ${a}x + ${b}, find f(${x})`,
    answer: `f(${x}) = ${a * x + b}`,
    solutionSteps: [
      { title: 'Substitute', content: `f(${x}) = ${a}(${x}) + ${b} = <strong>${a * x + b}</strong>` },
    ],
    hints: [`Substitute x = ${x}`, `f(${x}) = ${a * x + b}`],
    estimatedTime: '1 min', verification: `f(${x}) = ${a * x + b} ✓`, seed,
  };
}

function generateExpLog(diff: DifficultyLevel, seed: number): GeneratedExercise {
  if (diff <= 3) {
    const base = randInt(2, 5, seed), exp = randInt(2, 5, seed + 1);
    return { id: `explog-${seed}`, topic: 'Exponents & Logarithms', difficulty: diff,
      problemText: `Simplify: ${base}^${exp}`, answer: `${base ** exp}`,
      solutionSteps: [{ title: 'Compute', content: `${base}^${exp} = <strong>${base ** exp}</strong>` }],
      hints: [`${base}^${exp} = ${base ** exp}`], estimatedTime: '1 min', verification: `${base}^${exp} = ${base ** exp} ✓`, seed,
    };
  } else {
    const base = randInt(2, 10, seed), result = randInt(2, 5, seed + 1), arg = base ** result;
    return { id: `explog-${seed}`, topic: 'Exponents & Logarithms', difficulty: diff,
      problemText: `Evaluate: log_${base}(${arg})`, answer: `${result}`,
      solutionSteps: [{ title: 'Definition', content: `log_${base}(${arg}) = x means ${base}^x = ${arg}` }, { title: 'Solve', content: `${base}^${result} = ${arg}, so <strong>x = ${result}</strong>` }],
      hints: [`${base}^${result} = ${arg}`], estimatedTime: '2 min', verification: `${base}^${result} = ${arg} ✓`, seed,
    };
  }
}

function generateEigenvalue(diff: DifficultyLevel, seed: number): GeneratedExercise {
  const a = randInt(1, 5, seed), d = randInt(1, 5, seed + 2);
  const tr = a + d, det = a * d;
  const disc = tr * tr - 4 * det;
  if (disc < 0) return generateEigenvalue(diff, seed + 100);
  const l1 = (tr + Math.sqrt(disc)) / 2, l2 = (tr - Math.sqrt(disc)) / 2;
  return {
    id: `eig-${seed}`, topic: 'Eigenvalues', difficulty: diff,
    problemText: `Find the eigenvalues of A = [[${a}, 0], [0, ${d}]]`,
    answer: `λ₁ = ${l1}, λ₂ = ${l2}`,
    solutionSteps: [
      { title: 'Characteristic equation', content: `det(A − λI) = (${a}−λ)(${d}−λ) = 0` },
      { title: 'Expand', content: `λ² − ${tr}λ + ${det} = 0` },
      { title: 'Solve', content: `<strong>λ₁ = ${l1}, λ₂ = ${l2}</strong>` },
    ],
    hints: [`Characteristic: λ² − ${tr}λ + ${det} = 0`, `λ = (${tr} ± √${disc})/2`],
    estimatedTime: '4 min', verification: `λ₁+λ₂=${tr}=tr(A) ✓`, seed,
  };
}

function generatePolynomial(diff: DifficultyLevel, seed: number): GeneratedExercise {
  const x = randInt(-5, 5, seed), a = randInt(2, 6, seed + 1), b = randInt(-10, 10, seed + 2), c = randInt(-10, 10, seed + 3);
  const result = a * x * x + b * x + c;
  return {
    id: `poly-${seed}`, topic: 'Polynomials', difficulty: diff,
    problemText: `Evaluate f(x) = ${a}x² ${b >= 0 ? '+ ' + b : '- ' + Math.abs(b)}x ${c >= 0 ? '+ ' + c : '- ' + Math.abs(c)} at x = ${x}`,
    answer: `f(${x}) = ${result}`,
    solutionSteps: [
      { title: 'Substitute', content: `f(${x}) = ${a}(${x})² ${b >= 0 ? '+ ' + b : '- ' + Math.abs(b)}(${x}) ${c >= 0 ? '+ ' + c : '- ' + Math.abs(c)}` },
      { title: 'Compute', content: `= ${a * x * x} ${b * x >= 0 ? '+ ' + b * x : '- ' + Math.abs(b * x)} ${c >= 0 ? '+ ' + c : '- ' + Math.abs(c)} = <strong>${result}</strong>` },
    ],
    hints: [`Substitute x = ${x}`, `The answer is ${result}`],
    estimatedTime: '2 min', verification: `f(${x}) = ${result} ✓`, seed,
  };
}

const generators: Record<Topic, (diff: DifficultyLevel, seed: number) => GeneratedExercise> = {
  'Linear Equations': generateLinear, 'Quadratic Equations': generateQuadratic, 'Systems of Equations': generateSystem,
  'Polynomials': generatePolynomial, 'Functions': generateFunction, 'Exponents & Logarithms': generateExpLog,
  'Trigonometry': generateTrig, 'Derivatives': generateDerivative, 'Integrals': generateIntegral,
  'Matrices': generateMatrix, 'Determinants': generateDeterminant, 'Eigenvalues': generateEigenvalue,
  'Probability': generateProbability, 'Combinatorics': generateCombinatorics, 'Sequences & Series': generateSequence,
};

export function generateExercise(topic: Topic, difficulty: DifficultyLevel, customSeed?: number): GeneratedExercise {
  return generators[topic](difficulty, customSeed ?? nextSeed());
}
export function generateSimilarExercise(exercise: GeneratedExercise): GeneratedExercise {
  return generators[exercise.topic](exercise.difficulty, nextSeed());
}
export function generateHarderExercise(exercise: GeneratedExercise): GeneratedExercise {
  return generators[exercise.topic](Math.min(7, exercise.difficulty + 1) as DifficultyLevel, nextSeed());
}
export function generateEasierExercise(exercise: GeneratedExercise): GeneratedExercise {
  return generators[exercise.topic](Math.max(1, exercise.difficulty - 1) as DifficultyLevel, nextSeed());
}
export function generateRandomExercise(difficulty?: DifficultyLevel): GeneratedExercise {
  const t = topics[Math.floor(Math.random() * topics.length)];
  return generators[t](difficulty || (Math.floor(Math.random() * 4) + 1) as DifficultyLevel, nextSeed());
}
export function generateExam(count: number, topic?: Topic, difficulty?: DifficultyLevel): GeneratedExercise[] {
  const exs: GeneratedExercise[] = [];
  for (let i = 0; i < count; i++) {
    const t = topic || topics[Math.floor(Math.random() * topics.length)];
    exs.push(generators[t](difficulty || (Math.floor(Math.random() * 3) + 1) as DifficultyLevel, nextSeed()));
  }
  return exs;
}

export function getMasteryProgress(): MasteryProgress[] {
  try { const d = localStorage.getItem('dp_mastery'); return d ? JSON.parse(d) : []; } catch { return []; }
}
export function updateMasteryProgress(topic: Topic, correct: boolean, timeMs: number): void {
  const p = getMasteryProgress();
  const e = p.find(x => x.topic === topic);
  if (e) {
    e.completed++; if (correct) { e.correct++; e.currentStreak++; if (e.currentStreak > e.bestStreak) e.bestStreak = e.currentStreak; } else e.currentStreak = 0;
    e.totalTime += timeMs; e.lastPracticed = new Date().toISOString();
  } else {
    p.push({ topic, completed: 1, correct: correct ? 1 : 0, totalTime: timeMs, currentStreak: correct ? 1 : 0, bestStreak: correct ? 1 : 0, lastPracticed: new Date().toISOString() });
  }
  localStorage.setItem('dp_mastery', JSON.stringify(p));
}
