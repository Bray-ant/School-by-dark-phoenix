export interface AnalysisSection {
  label: string;
  content: string;
}

export interface DCLesson {
  id: string;
  number: string;
  title: string;
  duration: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  type: 'theory' | 'example' | 'exercise' | 'visual' | 'lab';
  content: string;
  formulas?: { name: string; formula: string; variables: string[] }[];
  visualComponent?: string;
  executiveSummary?: string;
  simpleExplanation?: string;
  professionalExplanation?: string;
  deepTechnical?: string;
  webArchitecture?: string;
  eePerspective?: string;
  mathAnalysis?: string;
  codeAnalysis?: string;
  diagramAnalysis?: string;
  criticalReview?: string;
  teachingBeginner?: string;
  teachingStudent?: string;
  teachingSenior?: string;
  keyTakeaways?: string[];
  commonMistakes?: string[];
  completed?: boolean;
}

export interface DCSection {
  id: string;
  title: string;
  description: string;
  lessons: DCLesson[];
}

export interface DCChapter {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  color: string;
  learningObjectives: string[];
  sections: DCSection[];
  progress: number;
}

export const dcChapters: DCChapter[] = [
  {
    id: 'dc-fundamentals',
    number: 1,
    title: 'Fundamentals',
    subtitle: 'Mathematical Foundations for Circuit Analysis',
    description: 'Significant digits, scientific notation, engineering notation, the metric system, the scientific method, critical thinking, and environmental regulations.',
    icon: 'Ruler',
    color: '#10b981',
    learningObjectives: [
      'Describe significant digits and resolution',
      'Express and compute numeric values using scientific and engineering notation',
      'Describe the metric system and detail its advantages',
      'Define the scientific method',
      'Give examples of cognitive biases and logical fallacies',
      'Describe the RoHS directive',
    ],
    progress: 0,
    sections: [
      {
        id: 'f-intro',
        title: 'Introduction & Background',
        description: 'Historical context of electrical engineering and the distinction between electrical and electronic systems.',
        lessons: [
          {
            id: 'f-l1',
            number: '1.1',
            title: 'Introduction',
            duration: '10 min',
            difficulty: 'beginner',
            type: 'theory',
            content: `<h2>Introduction to DC Circuit Analysis</h2>
<p>This course focuses on the analysis of <strong>DC (direct current)</strong> electrical circuits. It assumes no prior knowledge of electrical quantities, systems, or circuit theory.</p>

<h3>Historical Perspective</h3>
<p>The initial research into electricity occurred in the late 18th and early 19th centuries by individuals such as <strong>Alessandro Volta</strong>, <strong>André-Marie Ampère</strong>, <strong>Michael Faraday</strong>, and <strong>Georg Ohm</strong>. This work was expanded later in the 19th century by <strong>Gustav Kirchhoff</strong>, <strong>James Clerk Maxwell</strong>, <strong>Léon Charles Thévenin</strong>, and others.</p>

<p>The late 1800s and early 1900s saw the practical application of electrical theory — the birth of <strong>electrical engineering</strong>. Two names most associated with this period are <strong>Thomas Edison</strong> and <strong>Nikola Tesla</strong>.</p>

<div class="callout"><strong>Key Insight:</strong> A little over a century ago, the average person did not have ready access to something as simple as a modern flashlight. The pace of development has been extraordinary.</div>

<h3>Electricity vs. Electronics</h3>
<table style="width:100%;border-collapse:collapse;margin:1rem 0;">
<tr style="border-bottom:1px solid rgba(255,255,255,0.1)"><th style="text-align:left;padding:0.75rem;color:#10b981;">Field</th><th style="text-align:left;padding:0.75rem;color:#10b981;">Focus</th><th style="text-align:left;padding:0.75rem;color:#10b981;">Examples</th></tr>
<tr style="border-bottom:1px solid rgba(255,255,255,0.05)"><td style="padding:0.75rem;"><strong>Electrical</strong></td><td style="padding:0.75rem;">Direct use of electrical energy for physical work</td><td style="padding:0.75rem;">Power generation, transmission, motors, lighting, heating</td></tr>
<tr><td style="padding:0.75rem;"><strong>Electronic</strong></td><td style="padding:0.75rem;">Use of electrical signals to represent, store, manipulate information</td><td style="padding:0.75rem;">Computers, radios, cell phones, cameras, sensors</td></tr>
</table>

<h3>Scale of Difference</h3>
<p>A DC hobby motor might run on 12 volts drawing a few hundredths of an amp. Compare this to an industrial DC motor: 4000 horsepower, drawing 4680 amps at 700 volts. Both follow the exact same fundamental laws — just at vastly different scales.</p>`,
            executiveSummary: `This section establishes the historical context of electrical engineering from the 18th century to today, distinguishes between electrical systems (power/physical work) and electronic systems (information processing), and illustrates the vast scale differences within the field — from milliamps to thousands of amps.`,
            simpleExplanation: `Electricity has been studied for over 200 years. Early scientists discovered the basic rules, then engineers figured out how to use those rules to build useful things. "Electrical" systems use electricity directly to do physical work like running motors or lighting rooms. "Electronic" systems use electricity as signals to process information like in computers or phones. The same basic laws apply whether you're looking at a tiny circuit board or a massive power station.`,
            professionalExplanation: `This section frames DC circuit analysis within the broader context of electrical engineering history, tracing the evolution from fundamental discoveries (Volta, Ampère, Ohm, Faraday) through theoretical formalization (Kirchhoff, Maxwell, Thévenin) to practical engineering application (Edison, Tesla). The distinction between electrical systems (energy conversion and power) and electronic systems (information representation and signal processing) establishes the domain boundaries for this course.`,
            deepTechnical: `The theoretical foundations trace back to Coulomb's law (1785), Ohm's law (1827), Kirchhoff's laws (1845), and Maxwell's equations (1865). The practical engineering applications leverage these fundamentals regardless of scale. A key unifying principle is that all conductive materials exhibit the same underlying charge transport mechanisms — electron drift under electric field influence — whether in a microchip trace or a 4/0 AWG transmission cable.`,
            teachingBeginner: `Think of electricity like water. A small pipe (thin wire) carries a little water (small current). A huge pipe (thick cable) carries lots of water (large current). But the water always follows the same rules — gravity makes it flow downhill, pressure pushes it through pipes, and valves control how much gets through. Electricity works the same way at every scale!`,
            keyTakeaways: [
              'DC circuit analysis studies direct current circuits with no prior knowledge assumed',
              'Electrical systems use energy directly for physical work; electronic systems process information',
              'The same fundamental laws apply across all scales of application',
              'Historical figures: Volta, Ampère, Ohm, Faraday, Kirchhoff, Maxwell, Thévenin, Edison, Tesla',
            ],
            commonMistakes: [
              'Confusing electrical systems with electronic systems',
              'Assuming different laws apply at different scales',
              'Thinking that AC and DC follow fundamentally different rules (AC builds on DC fundamentals)',
            ],
          },
        ],
      },
      {
        id: 'f-sigdig',
        title: 'Significant Digits & Resolution',
        description: 'Measurement accuracy, significant digits, and proper rounding in computations.',
        lessons: [
          {
            id: 'f-l2',
            number: '1.2',
            title: 'Significant Digits and Resolution',
            duration: '15 min',
            difficulty: 'beginner',
            type: 'theory',
            content: `<h2>Significant Digits and Resolution</h2>

<h3>Resolution</h3>
<p><strong>Resolution</strong> refers to the finest change or variation that can be discerned by a measurement system. For digital systems, this is typically the last digit displayed. A bathroom scale showing whole pounds has a resolution of 1 pound.</p>

<h3>Significant Digits</h3>
<p><strong>Significant digits</strong> represent potential percentage accuracy in measurement or computation. A 156-pound measurement on a 1-pound-resolution scale has 3 significant digits. A 23-pound measurement on the same scale has only 2 significant digits — the same absolute uncertainty (±1 lb) represents a much larger relative error.</p>

<div class="definition-box"><div class="label">Rules for Significant Digits</div>
<ul>
<li><strong>Leading zeros</strong> are NOT significant: 0.00143 has 3 significant digits (the "143")</li>
<li><strong>Trailing zeros</strong> are generally NOT significant: 5400 has 2 significant digits</li>
<li><strong>Exception:</strong> Trailing zeros from a measurement device ARE significant — 120.0 volts indicates the meter reads to tenths</li>
<li><strong>Embedded zeros</strong> ARE significant: 43.001 has 5 significant digits</li>
<li><strong>All non-zero digits</strong> are significant</li>
</ul></div>

<h3>Computations</h3>
<p><strong>Multiplication & Division:</strong> The result has the same number of significant digits as the factor with the fewest.</p>
<p>Example: 3.5 / 2.3 = 1.52173913... → <strong>1.5</strong> (2 sig digs)</p>

<p><strong>Addition & Subtraction:</strong> The result's resolution is limited by the least precise term.</p>
<p>Example: 750.2 − 0.004 = <strong>750.2</strong> (tenths place is the limit)</p>

<div class="callout-warning"><strong>Common Error:</strong> Reporting calculator results with all 10 digits implies false precision. Always round to match your least precise input.</div>`,
            formulas: [
              { name: 'Relative Uncertainty', formula: 'Uncertainty = Resolution / Measured Value', variables: ['Resolution: finest discernible change', 'Measured Value: the reading'] },
            ],
            executiveSummary: `This section covers measurement resolution and significant digits — essential concepts for ensuring accuracy and avoiding false precision in electrical calculations. Key rules determine how many digits to keep in multiplication/division (least sig digs) versus addition/subtraction (coarsest resolution).`,
            simpleExplanation: `When you measure something, your answer can't be more precise than your measuring tool. If a scale only shows whole pounds, you can't claim someone weighs 156.234 pounds. The rules tell you how many digits to keep when doing math with measured values — basically, don't claim more accuracy than you actually have.`,
            professionalExplanation: `Resolution defines the quantization limit of a measurement system. Significant digits propagate measurement uncertainty through computations. The rounding rules ensure that reported results honestly reflect input precision: multiplicative operations propagate relative uncertainty (sig digs), while additive operations propagate absolute uncertainty (decimal place resolution).`,
            mathAnalysis: `For multiplication/division: if A has m sig digs and B has n sig digs, the result has min(m,n) sig digs. Example: 2312.5 (5 sig digs) / 16.2 (3 sig digs) = 142.7469... → 143 (3 sig digs). For addition/subtraction: align decimal points and round to the least precise decimal place. Example: 1756.2 + 345.1 = 2101.3 (both precise to tenths).`,
            keyTakeaways: [
              'Resolution = finest discernible change in a measurement',
              'Significant digits indicate the precision of a measurement',
              'Leading zeros are not significant; embedded zeros are',
              'Multiplication/division: result has sig digs of the least precise factor',
              'Addition/subtraction: result limited by coarsest resolution',
            ],
            commonMistakes: [
              'Reporting calculator results with all displayed digits',
              'Counting leading zeros as significant',
              'Assuming trailing zeros are always significant',
              'Applying addition rules to multiplication problems',
            ],
          },
        ],
      },
      {
        id: 'f-notation',
        title: 'Scientific & Engineering Notation',
        description: 'Compact representation of very large and very small numbers.',
        lessons: [
          {
            id: 'f-l3',
            number: '1.3',
            title: 'Scientific and Engineering Notation',
            duration: '15 min',
            difficulty: 'beginner',
            type: 'theory',
            content: `<h2>Scientific and Engineering Notation</h2>

<h3>Scientific Notation</h3>
<p>Represents values in two parts: a <strong>mantissa</strong> (precision portion) and an <strong>exponent</strong> (power of ten).</p>
<div class="formula-block">Value = M × 10^N</div>
<p>Examples: 360 = 3.6 × 10²; 0.00275 = 2.75 × 10⁻³</p>
<p>Compact form uses "E": 3.6E2, 2.75E-3</p>

<h3>Operations in Scientific Notation</h3>
<p><strong>Addition/Subtraction:</strong> Make exponents equal first, then add mantissas.</p>
<p>3.6E2 + 5E1 = 3.6E2 + 0.5E2 = <strong>4.1E2</strong></p>

<p><strong>Multiplication:</strong> Multiply mantissas, add exponents.</p>
<p>2E4 × 3.6E5 = 7.2E9</p>

<p><strong>Division:</strong> Divide mantissas, subtract exponents.</p>
<p>6E-3 / 5E4 = 1.2E-7</p>

<h3>Engineering Notation</h3>
<p>Same as scientific notation, but the exponent <strong>must be a multiple of 3</strong>. Each multiple has a named prefix:</p>
<table style="width:100%;border-collapse:collapse;margin:1rem 0;">
<tr style="border-bottom:1px solid rgba(255,255,255,0.1)"><th style="padding:0.5rem;color:#10b981;">Exponent</th><th style="padding:0.5rem;color:#10b981;">Name</th><th style="padding:0.5rem;color:#10b981;">Symbol</th></tr>
<tr style="border-bottom:1px solid rgba(255,255,255,0.05)"><td style="padding:0.5rem;">12</td><td style="padding:0.5rem;">tera</td><td style="padding:0.5rem;">T</td></tr>
<tr style="border-bottom:1px solid rgba(255,255,255,0.05)"><td style="padding:0.5rem;">9</td><td style="padding:0.5rem;">giga</td><td style="padding:0.5rem;">G</td></tr>
<tr style="border-bottom:1px solid rgba(255,255,255,0.05)"><td style="padding:0.5rem;">6</td><td style="padding:0.5rem;">mega</td><td style="padding:0.5rem;">M</td></tr>
<tr style="border-bottom:1px solid rgba(255,255,255,0.05)"><td style="padding:0.5rem;">3</td><td style="padding:0.5rem;">kilo</td><td style="padding:0.5rem;">k</td></tr>
<tr style="border-bottom:1px solid rgba(255,255,255,0.05)"><td style="padding:0.5rem;">-3</td><td style="padding:0.5rem;">milli</td><td style="padding:0.5rem;">m</td></tr>
<tr style="border-bottom:1px solid rgba(255,255,255,0.05)"><td style="padding:0.5rem;">-6</td><td style="padding:0.5rem;">micro</td><td style="padding:0.5rem;">μ</td></tr>
<tr style="border-bottom:1px solid rgba(255,255,255,0.05)"><td style="padding:0.5rem;">-9</td><td style="padding:0.5rem;">nano</td><td style="padding:0.5rem;">n</td></tr>
<tr><td style="padding:0.5rem;">-12</td><td style="padding:0.5rem;">pico</td><td style="padding:0.5rem;">p</td></tr>
</table>

<div class="callout-success"><strong>Shortcuts:</strong> micro × kilo = milli; 1/kilo = milli; 1/micro = mega; milli/kilo = micro</div>`,
            formulas: [
              { name: 'Scientific Notation', formula: 'N = M × 10^E', variables: ['M: mantissa (1 ≤ M < 10)', 'E: integer exponent'] },
              { name: 'Engineering Notation', formula: 'N = M × 10^(3k)', variables: ['M: mantissa', 'k: integer (exponent must be multiple of 3)'] },
            ],
            executiveSummary: `Scientific notation expresses numbers as mantissa × 10^exponent, eliminating trailing/leading zeros. Engineering notation requires exponents to be multiples of 3, enabling compact prefix notation (kilo, milli, micro, etc.). Operations follow simple rules: multiply/divide mantissas and add/subtract exponents.`,
            simpleExplanation: `Instead of writing 0.000000000345, write 345E-12 or 345 picoseconds. It's much easier to read and less error-prone. When multiplying, multiply the front numbers and add the exponents. When dividing, divide the front numbers and subtract the exponents.`,
            teachingBeginner: `Imagine you have 3,600,000,000 dollars. That's hard to read! Write it as 3.6 billion. In engineering, we use special words for powers of 1000: thousand=kilo, million=mega, billion=giga. For small numbers: thousandth=milli, millionth=micro, billionth=nano. So 0.005 meters = 5 millimeters = 5 mm.`,
            keyTakeaways: [
              'Scientific: mantissa × 10^exponent (any integer exponent)',
              'Engineering: exponent must be multiple of 3, uses named prefixes',
              'Multiply: multiply mantissas, add exponents',
              'Divide: divide mantissas, subtract exponents',
              'Add/subtract: equalize exponents first',
              'Commit prefixes T, G, M, k, m, μ, n, p to memory',
            ],
          },
        ],
      },
      {
        id: 'f-metric',
        title: 'The Metric System',
        description: 'SI units, conversion advantages, and catastrophic unit failure.',
        lessons: [
          {
            id: 'f-l4',
            number: '1.4',
            title: 'The Metric System',
            duration: '10 min',
            difficulty: 'beginner',
            type: 'theory',
            content: `<h2>The Metric System (SI)</h2>

<p>The <strong>International System of Units (SI)</strong> is the global standard for science and technology. Roughly 95% of the world's population uses it. The USA is the only major economic power that has not fully adopted it for general consumer use.</p>

<h3>Why Metric is Superior</h3>
<ol>
<li><strong>Everything is powers of ten.</strong> No odd conversion factors like 12 inches/foot or 5280 feet/mile.</li>
<li><strong>One unit per quantity.</strong> Length = meter. Use prefixes (milli, kilo) for scale, not different unit names.</li>
</ol>

<div class="callout"><strong>Analogy:</strong> USA currency IS metric — 100 cents = 1 dollar. Imagine if a dollar had 13 flarkneks and 85 dollars made a skroon. Buying a computer for "21 skroon, 10 dollars, 12 flarkneks" with 6.5% tax would be absurd. That's the Imperial system.</div>

<h3>Common Quantities and Units</h3>
<table style="width:100%;border-collapse:collapse;margin:1rem 0;">
<tr style="border-bottom:1px solid rgba(255,255,255,0.1)"><th style="padding:0.5rem;color:#10b981;">Quantity</th><th style="padding:0.5rem;color:#10b981;">Unit</th><th style="padding:0.5rem;color:#10b981;">Approx. Equivalent</th></tr>
<tr style="border-bottom:1px solid rgba(255,255,255,0.05)"><td style="padding:0.5rem;">Length (l)</td><td style="padding:0.5rem;">meter (m)</td><td style="padding:0.5rem;">1 m ≈ 39.37 inches</td></tr>
<tr style="border-bottom:1px solid rgba(255,255,255,0.05)"><td style="padding:0.5rem;">Mass (m)</td><td style="padding:0.5rem;">kilogram (kg)</td><td style="padding:0.5rem;">1 kg ≈ 2.2 lb</td></tr>
<tr style="border-bottom:1px solid rgba(255,255,255,0.05)"><td style="padding:0.5rem;">Time (t)</td><td style="padding:0.5rem;">second (s)</td><td style="padding:0.5rem;">—</td></tr>
<tr style="border-bottom:1px solid rgba(255,255,255,0.05)"><td style="padding:0.5rem;">Force (F)</td><td style="padding:0.5rem;">newton (N)</td><td style="padding:0.5rem;">1 N ≈ 0.225 lbf</td></tr>
<tr style="border-bottom:1px solid rgba(255,255,255,0.05)"><td style="padding:0.5rem;">Energy (E)</td><td style="padding:0.5rem;">joule (J)</td><td style="padding:0.5rem;">3.6×10⁶ J = 1 kWh</td></tr>
<tr style="border-bottom:1px solid rgba(255,255,255,0.05)"><td style="padding:0.5rem;">Power (P)</td><td style="padding:0.5rem;">watt (W)</td><td style="padding:0.5rem;">746 W = 1 hp</td></tr>
<tr style="border-bottom:1px solid rgba(255,255,255,0.05)"><td style="padding:0.5rem;">Temperature (T)</td><td style="padding:0.5rem;">kelvin (K) or °C</td><td style="padding:0.5rem;">K = °C + 273.15</td></tr>
<tr style="border-bottom:1px solid rgba(255,255,255,0.05)"><td style="padding:0.5rem;">Charge (Q)</td><td style="padding:0.5rem;">coulomb (C)</td><td style="padding:0.5rem;">—</td></tr>
<tr style="border-bottom:1px solid rgba(255,255,255,0.05)"><td style="padding:0.5rem;">Current (I)</td><td style="padding:0.5rem;">ampere (A)</td><td style="padding:0.5rem;">—</td></tr>
<tr><td style="padding:0.5rem;">Voltage (V)</td><td style="padding:0.5rem;">volt (V)</td><td style="padding:0.5rem;">—</td></tr>
</table>

<div class="callout-warning"><strong>Cautionary Tale:</strong> The Mars Climate Orbiter (1999) was destroyed because a subcontractor used Imperial units (pound-force seconds) while NASA systems expected metric (newton-seconds). The $330 million mission failed due to unit mismatch. <strong>Always include units in every calculation.</strong></div>`,
            executiveSummary: `The SI (metric) system uses powers of ten with one base unit per physical quantity and standard prefixes for scale. It eliminates conversion errors and simplifies computation. The Mars Climate Orbiter disaster ($330M loss) demonstrates why unit consistency is critical.`,
            simpleExplanation: `The metric system is like decimal money — everything is based on 10s. Meters for length, kilograms for mass, seconds for time. Want something smaller? Add "milli" (thousandth). Something bigger? Add "kilo" (thousand). No weird conversions like 12 inches in a foot.`,
            criticalReview: `The Mars Climate Orbiter example highlights a systemic engineering risk: interface contracts between subsystems must explicitly specify units and include validation checks. Modern engineering practice requires unit-aware computation systems (e.g., F# units of measure, Boost.Units in C++) to prevent such failures at compile time.`,
            keyTakeaways: [
              'SI is the global standard — powers of ten, one unit per quantity',
              'Always include units in every calculation',
              'The Mars Climate Orbiter failed due to unit mismatch (Imperial vs metric)',
              'Common SI units: meter, kilogram, second, newton, joule, watt, coulomb, ampere, volt',
            ],
          },
        ],
      },
      {
        id: 'f-scimethod',
        title: 'The Scientific Method',
        description: 'Hypothesis, theory, falsifiability, and the predictive power of science.',
        lessons: [
          {
            id: 'f-l5',
            number: '1.5',
            title: 'The Scientific Method',
            duration: '12 min',
            difficulty: 'beginner',
            type: 'theory',
            content: `<h2>The Scientific Method</h2>

<p>The scientific method is a systematic process for uncovering and explaining physical phenomena:</p>

<div class="definition-box"><div class="label">The Scientific Method Process</div>
<ol>
<li><strong>Observation & Measurement:</strong> Collect data about a phenomenon</li>
<li><strong>Hypothesis:</strong> Formulate a tentative, testable explanation</li>
<li><strong>Testing:</strong> Design experiments to verify or falsify the hypothesis</li>
<li><strong>Peer Review:</strong> Subject findings to critique by other experts</li>
<li><strong>Theory:</strong> After repeated successful testing, elevate to theory</li>
</ol></div>

<h3>Hypothesis vs. Theory vs. Fact</h3>
<table style="width:100%;border-collapse:collapse;margin:1rem 0;">
<tr style="border-bottom:1px solid rgba(255,255,255,0.1)"><th style="padding:0.5rem;color:#10b981;">Term</th><th style="padding:0.5rem;color:#10b981;">Definition</th><th style="padding:0.5rem;color:#10b981;">Example</th></tr>
<tr style="border-bottom:1px solid rgba(255,255,255,0.05)"><td style="padding:0.5rem;"><strong>Hypothesis</strong></td><td style="padding:0.5rem;">Tentative, testable explanation</td><td style="padding:0.5rem;">"Dropped stones fall at same rate regardless of mass"</td></tr>
<tr style="border-bottom:1px solid rgba(255,255,255,0.05)"><td style="padding:0.5rem;"><strong>Theory</strong></td><td style="padding:0.5rem;">Hypothesis that has withstood rigorous testing; has predictive power</td><td style="padding:0.5rem;">Newtonian gravitation (later refined by Einstein)</td></tr>
<tr><td style="padding:0.5rem;"><strong>Fact</strong></td><td style="padding:0.5rem;">Direct/indirect observation or logical deduction</td><td style="padding:0.5rem;">"Stone hit ground at time t"</td></tr>
</table>

<p><strong>Critical requirement:</strong> A proper hypothesis must be <strong>falsifiable</strong> — it must be possible to prove it wrong through observation. If it cannot be falsified, it is philosophy, not science.</p>

<div class="callout"><strong>The power of theories:</strong> A fact ("stone fell") tells you little by itself. A theory (gravitation) lets you predict satellite orbits, design aircraft, and plan space missions. Theories are the most useful output of science because they have explanatory and predictive power.</div>`,
            teachingBeginner: `Science works like this: you notice something weird, you guess why it happens, you test your guess with experiments, and other scientists check your work. If your guess survives lots of testing, it becomes a "theory" — which in science means it's REALLY well-supported, not just a hunch. A good scientific idea must be testable — there has to be some experiment that could prove it wrong.`,
            keyTakeaways: [
              'Scientific method: observe → hypothesize → test → review → theory',
              'A hypothesis must be falsifiable to be scientific',
              'Theories have predictive power; facts alone do not',
              'Newtonian gravitation was refined, not discarded, by Einstein',
            ],
          },
        ],
      },
      {
        id: 'f-critical',
        title: 'Critical Thinking',
        description: 'Cognitive biases and logical fallacies that affect reasoning.',
        lessons: [
          {
            id: 'f-l6',
            number: '1.6',
            title: 'Critical Thinking',
            duration: '12 min',
            difficulty: 'beginner',
            type: 'theory',
            content: `<h2>Critical Thinking</h2>

<h3>Cognitive Biases</h3>
<p><strong>Confirmation bias:</strong> Overvaluing evidence that confirms expectations while discounting contradictory evidence. Solution: <strong>double-blind testing</strong>.</p>

<p><strong>Dunning-Kruger effect:</strong> Low-competence individuals overestimate their ability (illusory superiority). Highly competent individuals may undervalue themselves.</p>

<h3>Logical Fallacies</h3>
<table style="width:100%;border-collapse:collapse;margin:1rem 0;">
<tr style="border-bottom:1px solid rgba(255,255,255,0.1)"><th style="padding:0.5rem;color:#10b981;">Fallacy</th><th style="padding:0.5rem;color:#10b981;">Description</th><th style="padding:0.5rem;color:#10b981;">Example</th></tr>
<tr style="border-bottom:1px solid rgba(255,255,255,0.05)"><td style="padding:0.5rem;"><strong>Composition</strong></td><td style="padding:0.5rem;">What's true of parts must be true of whole</td><td style="padding:0.5rem;">"If one person stands, they see better. If everyone stands, everyone sees better." (False — nobody sees better)</td></tr>
<tr style="border-bottom:1px solid rgba(255,255,255,0.05)"><td style="padding:0.5rem;"><strong>Post hoc</strong></td><td style="padding:0.5rem;">A happened before B, therefore A caused B</td><td style="padding:0.5rem;">Waking up before sunrise doesn't cause sunrise</td></tr>
<tr style="border-bottom:1px solid rgba(255,255,255,0.05)"><td style="padding:0.5rem;"><strong>Proportional</strong></td><td style="padding:0.5rem;">Small percentage = negligible effect</td><td style="padding:0.5rem;">0.1% H₂S in air would kill everyone instantly</td></tr>
<tr style="border-bottom:1px solid rgba(255,255,255,0.05)"><td style="padding:0.5rem;"><strong>Excluded middle</strong></td><td style="padding:0.5rem;">Falsely reducing to only two choices</td><td style="padding:0.5rem;">"Either stupid or a communist" — excludes bribery, etc.</td></tr>
<tr><td style="padding:0.5rem;"><strong>Ad hominem</strong></td><td style="padding:0.5rem;">Attack the person, not the argument</td><td style="padding:0.5rem;">"Doug is evil, so his gravity theory must be wrong"</td></tr>
</table>

<div class="callout-warning"><strong>Non-linearity:</strong> Many systems are NOT linear. Braking distance varies with the <strong>square</strong> of speed. Doubling speed quadruples stopping distance, not doubles it.</div>`,
            teachingBeginner: `Our brains trick us sometimes. We tend to see what we expect to see (confirmation bias). People who know a little sometimes think they know a lot (Dunning-Kruger). And there are common "thinking traps" — like assuming that because A happened before B, A caused B. Just because you woke up before sunrise doesn't mean you made the sun rise!`,
            keyTakeaways: [
              'Confirmation bias: wanting to see expected results',
              'Dunning-Kruger: low skill → overconfidence; high skill → possible underconfidence',
              'Post hoc fallacy: correlation ≠ causation',
              'Systems are often non-linear (square law, exponential, etc.)',
              'Double-blind testing prevents confirmation bias',
            ],
          },
        ],
      },
      {
        id: 'f-rohs',
        title: 'RoHS & Environmental Regulations',
        description: 'Restriction of Hazardous Substances directive and environmental compliance.',
        lessons: [
          {
            id: 'f-l7',
            number: '1.7',
            title: 'RoHS',
            duration: '8 min',
            difficulty: 'beginner',
            type: 'theory',
            content: `<h2>RoHS — Restriction of Hazardous Substances</h2>

<p>The <strong>RoHS Directive</strong> is a European Union regulation controlling hazardous materials in electrical and electronic equipment. Restricted substances include:</p>
<ul>
<li><strong>Lead</strong> (limit: 1000 ppm)</li>
<li><strong>Mercury</strong> (limit: 1000 ppm)</li>
<li><strong>Cadmium</strong> (limit: 100 ppm — strictest!)</li>
<li><strong>Hexavalent chromium</strong> (limit: 1000 ppm)</li>
<li>Specific flame retardants (PBB, PBDE) (limit: 1000 ppm)</li>
</ul>

<h3>Key Concepts</h3>
<p><strong>Homogeneous material:</strong> The smallest part that can be separated mechanically (a screw, a switch lever, a speaker magnet). Each must individually meet the limits.</p>

<p><strong>WEEE:</strong> Waste from Electrical and Electronic Equipment — controls recovery and recycling. Products sold in the EU must meet both RoHS and WEEE requirements.</p>

<div class="callout">RoHS 3 became effective in 2019. Countries outside the EU (Japan, China, South Korea, Turkey) have adopted similar requirements. Several US states (California, Colorado, New York) have "RoHS-like" regulations.</div>

<p>Manufacturers use "RoHS compliant" labels on datasheets. Cadmium (used in CdS photoresistors and Ni-Cd batteries) is particularly restricted — important implications for component selection.</p>`,
            eePerspective: `RoHS compliance directly impacts component selection, supply chain management, and product design. Engineers must verify that every homogeneous material in a product meets the specified limits. This affects solder alloy selection (lead-free solders), plating choices (trivalent chromium instead of hexavalent), and battery chemistry (NiMH instead of Ni-Cd). The directive has driven significant materials science innovation in the electronics industry.`,
            keyTakeaways: [
              'RoHS restricts lead, mercury, cadmium (100 ppm), hexavalent chromium, and specific flame retardants',
              'Limits apply per homogeneous material, not per product',
              'WEEE governs disposal and recycling',
              'RoHS compliance affects component selection and solder alloys',
              'Cadmium is the most restricted substance (100 ppm)',
            ],
          },
        ],
      },
    ],
  },
  // CHAPTER 2: Basic Quantities
  {
    id: 'dc-quantities',
    number: 2,
    title: 'Basic Quantities',
    subtitle: 'Charge, Current, Voltage, Power, Resistance',
    description: 'The atomic model, fundamental electrical quantities, their relationships, resistor color code, instrumentation, and practical laboratory considerations.',
    icon: 'Zap',
    color: '#f59e0b',
    learningObjectives: [
      'Describe a basic functional atomic model',
      'Describe charge, current, energy, voltage, power, resistance, conductance',
      'Compute efficiency, energy cost, battery life, and DMM accuracy',
      'Utilize the resistor color code',
    ],
    progress: 0,
    sections: [
      {
        id: 'q-atomic',
        title: 'An Atomic Model',
        description: 'Bohr model, electron shells, orbitals, and charge.',
        lessons: [
          {
            id: 'q-l1',
            number: '2.1',
            title: 'An Atomic Model',
            duration: '15 min',
            difficulty: 'beginner',
            type: 'theory',
            content: `<h2>An Atomic Model for Electrical Circuits</h2>

<h3>The Planetary Model (Popular but Wrong)</h3>
<p>The planetary model shows electrons orbiting the nucleus like planets around the sun. While easy to visualize, it's inaccurate — electrons don't follow nice planar paths.</p>

<h3>What We Actually Know</h3>
<ul>
<li><strong>Protons</strong> (+charge) and <strong>neutrons</strong> (neutral) form the nucleus</li>
<li><strong>Electrons</strong> (-charge) orbit the nucleus</li>
<li>Number of protons = atomic number (defines the element)</li>
<li>In a stable atom: electrons = protons (if not, it's an <strong>ion</strong>)</li>
</ul>

<h3>Scale Perspective</h3>
<p>Proton radius ≈ 0.87×10⁻¹⁵ m. Distance to nearest electron ≈ 5.3×10⁻¹¹ m. The electron is <strong>60,000× farther</strong> from the proton than the proton's size. Like a golf ball inside a sphere 1.5 miles across. Solidity is an illusion — it's all empty space held together by atomic forces.</p>

<h3>The Bohr Model (Functional)</h3>
<p>The Bohr model is an <strong>energy description</strong>, not a physical picture. It shows concentric rings representing electron shells:</p>
<ul>
<li>Shell 1: max 2 electrons</li>
<li>Shell 2: max 8 electrons</li>
<li>Shell 3: max 18 electrons</li>
<li>General formula: max 2n² electrons in shell n</li>
</ul>

<h3>Copper: A Good Conductor</h3>
<p>Copper (atomic number 29) has configuration 2-8-18-1. A lone outer electron is <strong>loosely bound</strong> to the nucleus, making it easy to move through the material. This is why copper is an excellent conductor. Other good conductors (silver, gold, aluminum) also have 1-2 outer electrons.</p>

<h3>Charge</h3>
<p>Charge is measured in <strong>coulombs (C)</strong>. One electron carries:</p>
<div class="formula-block">q_e = 1.602 × 10⁻¹⁹ C</div>
<p>Therefore, 1 coulomb = charge of 6.242 × 10¹⁸ electrons.</p>`,
            formulas: [
              { name: 'Electron Charge', formula: 'q_e = 1.602 × 10⁻¹⁹ C', variables: ['q_e: charge of one electron'] },
              { name: 'Electrons per Coulomb', formula: '1 C = 6.242 × 10¹⁸ electrons', variables: [] },
              { name: 'Max electrons in shell n', formula: 'N_max = 2n²', variables: ['n: principal quantum number'] },
            ],
            visualComponent: 'bohr-model',
            executiveSummary: `This section establishes the atomic foundation for circuit analysis. The Bohr model describes electron energy shells; a single loosely-bound outer electron explains why metals like copper are good conductors. Charge is quantized at 1.602×10⁻¹⁹ C per electron.`,
            eePerspective: `The band theory of solids explains conduction: in metals, the valence and conduction bands overlap, allowing electrons to move freely. In insulators, a large band gap prevents electron movement. Semiconductors have a moderate gap that can be overcome with thermal energy or doping. The free electron model treats conduction electrons as a gas moving through a periodic potential of ion cores.`,
            teachingBeginner: `Atoms have a center part (nucleus) with positive particles (protons) and neutral particles (neutrons). Negative particles (electrons) surround the nucleus in layers called shells. Metals like copper have just ONE electron in their outermost shell, and that electron is barely holding on. Give it a little push (voltage), and it jumps to the next atom, creating electric current!`,
            keyTakeaways: [
              'Bohr model: energy shells, not physical orbits',
              'Copper (2-8-18-1) is a good conductor due to its single loosely-bound outer electron',
              '1 electron = 1.602×10⁻¹⁹ coulombs',
              'Good conductors have 1-2 outer electrons',
              'Atoms are mostly empty space',
            ],
          },
        ],
      },
      {
        id: 'q-charge-current',
        title: 'Charge and Current',
        description: 'The relationship between charge flow and electric current.',
        lessons: [
          {
            id: 'q-l2',
            number: '2.2',
            title: 'Charge and Current',
            duration: '12 min',
            difficulty: 'beginner',
            type: 'theory',
            content: `<h2>Charge and Current</h2>

<h3>Current Defined</h3>
<p><strong>Current (I)</strong> is the rate of charge movement over time:</p>
<div class="formula-block">I = Q / t</div>
<p>Where I is in <strong>amperes (A)</strong>, Q is charge in <strong>coulombs (C)</strong>, and t is time in <strong>seconds (s)</strong>.</p>
<p>1 amp = 1 coulomb/second = 6.242 × 10¹⁸ electrons passing a point per second.</p>

<h3>Water Analogy</h3>
<p>Current is like water flow rate — "gallons per minute" vs. "coulombs per second." The wire is the pipe; the electrons are the water molecules.</p>

<h3>Example Calculations</h3>
<div class="example-box"><div class="label">Example 2.1</div>
<p>A battery delivers 3 coulombs in 0.5 seconds. Find the current.</p>
<p>I = Q/t = 3/0.5 = <strong>6 A</strong></p></div>

<div class="example-box"><div class="label">Example 2.2</div>
<p>A device delivers 25 mA. Find charge transferred in 2 seconds and the equivalent number of electrons.</p>
<p>Q = I × t = 0.025 × 2 = <strong>0.05 C</strong></p>
<p>Electrons = 0.05 × 6.242×10¹⁸ = <strong>3.12 × 10¹⁷ electrons</strong></p></div>

<div class="callout">Modern systems handle currents from under a picoamp (10⁻¹² A) to thousands of amps — a range equivalent to one drop of water per second vs. 1000× the flow over Niagara Falls.</div>`,
            formulas: [
              { name: "Current", formula: 'I = Q / t', variables: ['I: current in amperes (A)', 'Q: charge in coulombs (C)', 't: time in seconds (s)'] },
              { name: 'Charge', formula: 'Q = I × t', variables: ['Q: charge', 'I: current', 't: time'] },
            ],
            executiveSummary: `Current is the rate of charge flow: I = Q/t. One ampere equals one coulomb per second, or approximately 6.24×10¹⁸ electrons passing a point each second. The water-flow analogy helps visualize this concept.`,
            simpleExplanation: `Current is just how fast charge is moving. If 6 billion billion electrons pass through a wire each second, that's 1 amp. It's like counting how many cars pass a point on a highway per minute — that's traffic flow, just like current is charge flow.`,
            mathAnalysis: `I = Q/t. Derivation: If Q electrons each carry charge q_e pass point P in time t, total charge Q_total = N × q_e. Current I = dQ/dt (instantaneous) or I = ΔQ/Δt (average). For DC, these are equivalent. 1 A = 1 C/s = 6.242×10¹⁸ e⁻/s.`,
            keyTakeaways: [
              'Current = charge / time: I = Q/t',
              'Unit: ampere (A) = coulomb/second',
              '1 A = 6.242 × 10¹⁸ electrons/second',
              'Current range in practice: pA to kA',
            ],
          },
        ],
      },
      {
        id: 'q-energy-voltage',
        title: 'Energy and Voltage',
        description: 'Potential energy, voltage, and the height analogy.',
        lessons: [
          {
            id: 'q-l3',
            number: '2.3',
            title: 'Energy and Voltage',
            duration: '15 min',
            difficulty: 'beginner',
            type: 'theory',
            content: `<h2>Energy and Voltage</h2>

<h3>Energy</h3>
<p><strong>Energy (E or W)</strong> is the ability to do work. Unit: <strong>joule (J)</strong>.</p>

<h3>Voltage Defined</h3>
<p><strong>Voltage (V)</strong> is the energy required to move a charge, per unit charge:</p>
<div class="formula-block">V = W / Q</div>
<p>Where V is in <strong>volts (V)</strong>, W is energy in <strong>joules (J)</strong>, and Q is charge in <strong>coulombs (C)</strong>.</p>
<p>1 volt = 1 joule per coulomb.</p>

<h3>Key Properties</h3>
<ul>
<li>Voltage always involves <strong>two points</strong> — it's a potential <em>difference</em></li>
<li>V_AB = voltage at point A relative to point B</li>
<li>V_BA = -V_AB (reversing reference points flips the sign)</li>
<li>Single subscript V_A means V_A relative to ground/common</li>
</ul>

<h3>The Height Analogy</h3>
<p>Voltage is like height, charge is like mass:</p>
<ul>
<li>Higher height = greater potential energy (PE = mgh)</li>
<li>Higher voltage = greater electrical potential energy</li>
<li>A small mass at great height = low total energy</li>
<li>A small charge at high voltage = low total energy</li>
</ul>
<p>Static electricity: thousands of volts but tiny charge → harmless. Wall outlet: 120V with large charge capacity → dangerous.</p>

<h3>ESD (Electrostatic Discharge)</h3>
<p>Static electricity can damage sensitive electronics. Prevention: humidity control, conductive wrist straps.</p>`,
            formulas: [
              { name: 'Voltage', formula: 'V = W / Q', variables: ['V: voltage in volts (V)', 'W: energy in joules (J)', 'Q: charge in coulombs (C)'] },
              { name: 'Energy from Voltage', formula: 'W = V × Q = V × I × t', variables: ['W: energy', 'V: voltage', 'Q: charge', 'I: current', 't: time'] },
            ],
            executiveSummary: `Voltage is energy per unit charge (V = W/Q), measured in volts. It's always a potential difference between two points. The height analogy helps: voltage is like elevation, charge is like mass. High voltage with small charge (static) is harmless; moderate voltage with large charge (wall outlet) is dangerous.`,
            simpleExplanation: `Voltage is like the "push" that makes electrons move. It's not the total energy — it's energy PER electron. Think of it like a waterfall: the higher the cliff (voltage), the harder each drop of water (electron) hits the bottom. But a tiny stream from a tall cliff (static electricity) won't hurt you, while a wide river from a medium cliff (wall outlet) can be deadly.`,
            teachingBeginner: `Voltage is like height. If you hold a ball 1 foot above the ground and drop it, it bounces a little. Hold it 100 feet up and it hits HARD. That's voltage — how much "push" each electron has. But just like a tiny ping-pong ball from 100 feet won't hurt much, a small amount of charge at high voltage (static electricity) is usually harmless. A bowling ball from 10 feet though... that's like a wall outlet.`,
            keyTakeaways: [
              'Voltage = energy/charge: V = W/Q',
              'Voltage is always measured between TWO points',
              '1 volt = 1 joule per coulomb',
              'High voltage + small charge = harmless (static)',
              'Moderate voltage + large charge = dangerous (outlet)',
              'V_AB = -V_BA',
            ],
          },
        ],
      },
      {
        id: 'q-power',
        title: 'Power and Efficiency',
        description: 'Power, energy consumption rate, and system efficiency.',
        lessons: [
          {
            id: 'q-l4',
            number: '2.4',
            title: 'Power and Efficiency',
            duration: '15 min',
            difficulty: 'beginner',
            type: 'theory',
            content: `<h2>Power and Efficiency</h2>

<h3>Power Defined</h3>
<p><strong>Power (P)</strong> is the rate of energy usage:</p>
<div class="formula-block">P = W / t</div>
<p>Unit: <strong>watt (W)</strong> = joule/second. 1 horsepower ≈ 746 watts.</p>

<h3>Power Law</h3>
<p>Combining P = W/t with V = W/Q and I = Q/t:</p>
<div class="formula-block">P = V × I</div>
<p>Power = voltage × current. This is the fundamental power law for DC circuits.</p>

<h3>Efficiency</h3>
<p><strong>Efficiency (η)</strong> is the ratio of useful output power to input power:</p>
<div class="formula-block">η = (P_out / P_in) × 100%</div>
<p>Efficiency is ALWAYS less than 100%. The wasted power becomes heat.</p>

<div class="example-box"><div class="label">Example</div>
<p>A device draws 200W and outputs 120W. Find efficiency and wasted power.</p>
<p>η = (120/200) × 100% = <strong>60%</strong></p>
<p>Wasted = 200 - 120 = <strong>80 W</strong> (becomes heat)</p></div>

<div class="example-box"><div class="label">Example</div>
<p>An audio amplifier outputs 100W to a speaker at 70% efficiency. Find input power and waste.</p>
<p>P_in = P_out/η = 100/0.70 = <strong>142.9 W</strong></p>
<p>Wasted = 142.9 - 100 = <strong>42.9 W</strong> (heats the amplifier)</p></div>`,
            formulas: [
              { name: 'Power', formula: 'P = W / t', variables: ['P: power in watts (W)', 'W: energy in joules (J)', 't: time in seconds (s)'] },
              { name: 'Power Law', formula: 'P = V × I', variables: ['P: power in watts', 'V: voltage in volts', 'I: current in amperes'] },
              { name: 'Efficiency', formula: 'η = (P_out / P_in) × 100%', variables: ['η: efficiency (%)', 'P_out: output power', 'P_in: input power'] },
              { name: 'Input Power', formula: 'P_in = P_out / η', variables: ['P_in: required input power', 'P_out: desired output', 'η: efficiency (decimal)'] },
            ],
            executiveSummary: `Power is the rate of energy usage: P = W/t = V×I. Efficiency η = P_out/P_in × 100% is always less than 100%; waste becomes heat. These concepts are fundamental for calculating energy costs, battery life, and thermal management in circuit design.`,
            eePerspective: `Power dissipation in resistors follows P = I²R = V²/R. This has direct thermal implications: a resistor carrying current will heat up. The power rating of a resistor (¼W, ½W, 1W, etc.) specifies the maximum it can dissipate without damage. Exceeding this rating causes permanent damage or fire. Thermal management is a critical design consideration.`,
            keyTakeaways: [
              'Power = energy/time: P = W/t',
              'Power Law: P = V × I',
              'Efficiency η = (P_out/P_in) × 100%, always < 100%',
              'Wasted power becomes heat',
              '1 hp ≈ 746 W',
            ],
          },
        ],
      },
      {
        id: 'q-energy-cost',
        title: 'Energy Cost and Battery Life',
        description: 'Practical calculations for operating costs and battery capacity.',
        lessons: [
          {
            id: 'q-l5',
            number: '2.5',
            title: 'Energy Cost and Battery Life',
            duration: '15 min',
            difficulty: 'beginner',
            type: 'example',
            content: `<h2>Energy Cost and Battery Life</h2>

<h3>Computing Energy Cost</h3>
<p>Electricity is billed by the <strong>kilowatt-hour (kWh)</strong> — energy consumed:</p>
<div class="formula-block">Energy (kWh) = Power (W) × Time (h) / 1000<br>Cost = Energy (kWh) × Rate ($/kWh)</div>

<div class="example-box"><div class="label">Example</div>
<p>A 100W bulb runs 24 hours at $0.15/kWh. Find cost.</p>
<p>Energy = 100 × 24 / 1000 = 2.4 kWh</p>
<p>Cost = 2.4 × 0.15 = <strong>$0.36 (36 cents)</strong></p></div>

<h3>LED vs. Incandescent Comparison</h3>
<p>A 14W LED = 75W incandescent (same light). LED: $11, 15,000 hr. Incandescent: $0.50, 1,000 hr. Electricity: $0.12/kWh.</p>
<p>For 15,000 hours:</p>
<ul>
<li>Incandescent: 15 bulbs × $0.50 = $7.50 + (75×15000/1000)×0.12 = <strong>$142.50 total</strong></li>
<li>LED: 1 bulb × $11 + (14×15000/1000)×0.12 = <strong>$36.20 total</strong></li>
</ul>
<p><strong>Savings: $106.30</strong> — and 14 fewer bulb changes!</p>

<h3>Battery Capacity</h3>
<p>Battery capacity is measured in <strong>amp-hours (Ah)</strong> or <strong>milliamp-hours (mAh)</strong>:</p>
<div class="formula-block">Life (hours) = Capacity (Ah) / Current (A)</div>

<div class="example-box"><div class="label">Example</div>
<p>A 10 Ah battery with 0.5 A draw. Find life.</p>
<p>Life = 10 / 0.5 = <strong>20 hours</strong></p></div>

<h3>Typical Battery Capacities</h3>
<table style="width:100%;border-collapse:collapse;margin:1rem 0;">
<tr style="border-bottom:1px solid rgba(255,255,255,0.1)"><th style="padding:0.5rem;color:#f59e0b;">Size</th><th style="padding:0.5rem;color:#f59e0b;">Capacity (mAh)</th></tr>
<tr style="border-bottom:1px solid rgba(255,255,255,0.05)"><td style="padding:0.5rem;">AAA</td><td style="padding:0.5rem;">1000</td></tr>
<tr style="border-bottom:1px solid rgba(255,255,255,0.05)"><td style="padding:0.5rem;">AA</td><td style="padding:0.5rem;">2500</td></tr>
<tr style="border-bottom:1px solid rgba(255,255,255,0.05)"><td style="padding:0.5rem;">C</td><td style="padding:0.5rem;">5000</td></tr>
<tr style="border-bottom:1px solid rgba(255,255,255,0.05)"><td style="padding:0.5rem;">D</td><td style="padding:0.5rem;">10000</td></tr>
<tr><td style="padding:0.5rem;">9V</td><td style="padding:0.5rem;">500</td></tr>
</table>`,
            formulas: [
              { name: 'Energy Cost', formula: 'Cost = (P × t / 1000) × Rate', variables: ['P: power in watts', 't: time in hours', 'Rate: $/kWh'] },
              { name: 'Battery Life', formula: 'Life = Capacity / I', variables: ['Life: hours', 'Capacity: Ah or mAh', 'I: current draw'] },
            ],
            executiveSummary: `Energy cost = Power × Time × Rate. LED lighting is typically 5-10× more efficient than incandescent, saving significant money over time. Battery life = Capacity / Current Draw. All AAA through D cells are 1.5V — they differ only in capacity (physical size).`,
            keyTakeaways: [
              'Electricity billed by kWh = W × h / 1000',
              'LEDs save ~75% vs incandescent lighting',
              'Battery life = capacity / current draw',
              'All alkaline cells (AAA-D) are 1.5V, differing in capacity',
              'Temperature reduces battery performance',
            ],
          },
        ],
      },
      {
        id: 'q-resistance',
        title: 'Resistance and Conductance',
        description: 'Resistance, resistivity, Ohm\'s Law, resistor color code, and special resistive devices.',
        lessons: [
          {
            id: 'q-l6',
            number: '2.6',
            title: 'Resistance and Conductance',
            duration: '25 min',
            difficulty: 'beginner',
            type: 'theory',
            content: `<h2>Resistance and Conductance</h2>

<h3>Resistance Defined</h3>
<p><strong>Resistance (R)</strong> measures opposition to current flow. Unit: <strong>ohm (Ω)</strong>.</p>
<p><strong>Conductance (G)</strong> measures ease of current flow. Unit: <strong>siemens (S)</strong>. G = 1/R.</p>

<h3>Resistivity</h3>
<p>Resistance depends on material and geometry:</p>
<div class="formula-block">R = ρ × L / A</div>
<p>Where ρ = resistivity (Ω·cm), L = length (cm), A = cross-sectional area (cm²).</p>

<h3>Resistivity of Common Materials (at 20°C)</h3>
<table style="width:100%;border-collapse:collapse;margin:1rem 0;">
<tr style="border-bottom:1px solid rgba(255,255,255,0.1)"><th style="padding:0.4rem;color:#f59e0b;">Material</th><th style="padding:0.4rem;color:#f59e0b;">ρ (μΩ·cm)</th><th style="padding:0.4rem;color:#f59e0b;">Type</th></tr>
<tr style="border-bottom:1px solid rgba(255,255,255,0.05)"><td style="padding:0.4rem;">Silver</td><td style="padding:0.4rem;">1.59</td><td style="padding:0.4rem;">Conductor</td></tr>
<tr style="border-bottom:1px solid rgba(255,255,255,0.05)"><td style="padding:0.4rem;">Copper</td><td style="padding:0.4rem;">1.68</td><td style="padding:0.4rem;">Conductor</td></tr>
<tr style="border-bottom:1px solid rgba(255,255,255,0.05)"><td style="padding:0.4rem;">Gold</td><td style="padding:0.4rem;">2.44</td><td style="padding:0.4rem;">Conductor</td></tr>
<tr style="border-bottom:1px solid rgba(255,255,255,0.05)"><td style="padding:0.4rem;">Aluminum</td><td style="padding:0.4rem;">2.65</td><td style="padding:0.4rem;">Conductor</td></tr>
<tr style="border-bottom:1px solid rgba(255,255,255,0.05)"><td style="padding:0.4rem;">Silicon</td><td style="padding:0.4rem;">6.4×10⁸</td><td style="padding:0.4rem;">Semiconductor</td></tr>
<tr><td style="padding:0.4rem;">Glass</td><td style="padding:0.4rem;">10¹² to 10¹⁴</td><td style="padding:0.4rem;">Insulator</td></tr>
</table>

<h3>Resistor Color Code</h3>
<p>Standard 4-band code:</p>
<table style="width:100%;border-collapse:collapse;margin:1rem 0;">
<tr style="border-bottom:1px solid rgba(255,255,255,0.1)"><th style="padding:0.4rem;color:#f59e0b;">Color</th><th style="padding:0.4rem;color:#f59e0b;">Digit</th><th style="padding:0.4rem;color:#f59e0b;">Multiplier</th><th style="padding:0.4rem;color:#f59e0b;">Tolerance</th></tr>
<tr style="border-bottom:1px solid rgba(255,255,255,0.05)"><td style="padding:0.4rem;">Black</td><td style="padding:0.4rem;">0</td><td style="padding:0.4rem;">×1</td><td style="padding:0.4rem;">—</td></tr>
<tr style="border-bottom:1px solid rgba(255,255,255,0.05)"><td style="padding:0.4rem;">Brown</td><td style="padding:0.4rem;">1</td><td style="padding:0.4rem;">×10</td><td style="padding:0.4rem;">±1%</td></tr>
<tr style="border-bottom:1px solid rgba(255,255,255,0.05)"><td style="padding:0.4rem;">Red</td><td style="padding:0.4rem;">2</td><td style="padding:0.4rem;">×100</td><td style="padding:0.4rem;">±2%</td></tr>
<tr style="border-bottom:1px solid rgba(255,255,255,0.05)"><td style="padding:0.4rem;">Orange</td><td style="padding:0.4rem;">3</td><td style="padding:0.4rem;">×1k</td><td style="padding:0.4rem;">—</td></tr>
<tr style="border-bottom:1px solid rgba(255,255,255,0.05)"><td style="padding:0.4rem;">Yellow</td><td style="padding:0.4rem;">4</td><td style="padding:0.4rem;">×10k</td><td style="padding:0.4rem;">—</td></tr>
<tr style="border-bottom:1px solid rgba(255,255,255,0.05)"><td style="padding:0.4rem;">Green</td><td style="padding:0.4rem;">5</td><td style="padding:0.4rem;">×100k</td><td style="padding:0.4rem;">±0.5%</td></tr>
<tr style="border-bottom:1px solid rgba(255,255,255,0.05)"><td style="padding:0.4rem;">Blue</td><td style="padding:0.4rem;">6</td><td style="padding:0.4rem;">×1M</td><td style="padding:0.4rem;">±0.25%</td></tr>
<tr style="border-bottom:1px solid rgba(255,255,255,0.05)"><td style="padding:0.4rem;">Violet</td><td style="padding:0.4rem;">7</td><td style="padding:0.4rem;">×10M</td><td style="padding:0.4rem;">±0.1%</td></tr>
<tr style="border-bottom:1px solid rgba(255,255,255,0.05)"><td style="padding:0.4rem;">Gray</td><td style="padding:0.4rem;">8</td><td style="padding:0.4rem;">×100M</td><td style="padding:0.4rem;">±0.05%</td></tr>
<tr style="border-bottom:1px solid rgba(255,255,255,0.05)"><td style="padding:0.4rem;">White</td><td style="padding:0.4rem;">9</td><td style="padding:0.4rem;">×1G</td><td style="padding:0.4rem;">—</td></tr>
<tr><td style="padding:0.4rem;">Gold</td><td style="padding:0.4rem;">—</td><td style="padding:0.4rem;">×0.1</td><td style="padding:0.4rem;">±5%</td></tr>
</table>
<p><strong>Mnemonic:</strong> "<strong>B</strong>ad <strong>B</strong>oys <strong>R</strong>un <strong>O</strong>ver <strong>Y</strong>our <strong>G</strong>arden <strong>B</strong>ehind <strong>V</strong>ictorian <strong>G</strong>arden <strong>W</strong>alls" = Black Brown Red Orange Yellow Green Blue Violet Gray White</p>

<h3>Special Resistive Devices</h3>
<ul>
<li><strong>FSR (Force Sensing Resistor):</strong> Resistance decreases with applied force</li>
<li><strong>Photoresistor (LDR/CdS):</strong> Resistance decreases with light</li>
<li><strong>Thermistor (NTC/PTC):</strong> Resistance changes with temperature</li>
<li><strong>Varistor:</strong> Nonlinear — high resistance at normal voltage, low resistance during spikes (surge protection)</li>
<li><strong>Strain gauge:</strong> Resistance changes with mechanical deformation</li>
</ul>`,
            formulas: [
              { name: 'Resistance', formula: 'R = ρ × L / A', variables: ['R: resistance (Ω)', 'ρ: resistivity (Ω·cm)', 'L: length (cm)', 'A: cross-sectional area (cm²)'] },
              { name: 'Conductance', formula: 'G = 1 / R', variables: ['G: conductance (S)', 'R: resistance (Ω)'] },
              { name: 'Resistor Value (4-band)', formula: 'R = (10×Band1 + Band2) × 10^Band3 ± Tolerance%', variables: ['Band1: first digit', 'Band2: second digit', 'Band3: power of 10', 'Band4: tolerance'] },
            ],
            visualComponent: 'resistor-color-code',
            executiveSummary: `Resistance R = ρL/A depends on material resistivity and geometry. Conductance G = 1/R. The resistor color code uses colored bands to indicate value and tolerance. Special resistive devices (thermistors, photoresistors, varistors, strain gauges) change resistance in response to environmental stimuli, enabling sensing applications.`,
            eePerspective: `Resistivity varies over 24 orders of magnitude across materials — from 10⁻⁸ Ω·m (silver) to 10¹⁶ Ω·m (teflon). This enormous range enables both conductors and insulators. The resistor color code is an industry standard (IEC 60062). Power derating curves are essential for reliable design: a resistor rated at 1/4W at 70°C may only handle 1/8W at 100°C. Varistors (MOVs) are critical for surge protection in power entry modules.`,
            teachingBeginner: `Resistance is like the width of a pipe — a thin pipe resists water flow more than a wide pipe. Longer pipe = more resistance. Wider pipe = less resistance. Different materials have different natural "pipe roughness" — copper is smooth (low resistance), rubber is rough (very high resistance, basically a blockage). The color code is like a secret language printed on resistors so engineers can tell their value without measuring.`,
            keyTakeaways: [
              'R = ρL/A: resistance depends on material, length, and cross-sectional area',
              'Conductance G = 1/R (unit: siemens)',
              'Resistor color code: 4 bands = 2 digits + multiplier + tolerance',
              'Gold = ×0.1, Silver = ×0.01 for multiplier band',
              'Special devices: thermistor (temp), photoresistor (light), FSR (force), varistor (voltage spike)',
            ],
          },
        ],
      },
      {
        id: 'q-instrumentation',
        title: 'Instrumentation and Laboratory',
        description: 'Power supplies, schematic symbols, and digital multimeters.',
        lessons: [
          {
            id: 'q-l7',
            number: '2.7',
            title: 'Instrumentation and Laboratory',
            duration: '15 min',
            difficulty: 'beginner',
            type: 'lab',
            content: `<h2>Instrumentation and Laboratory</h2>

<h3>DC Power Supplies</h3>
<p>Laboratory DC supplies are adjustable (typically 0-25V+) with current limiting. Multiple outputs are "floating" (negative terminal not tied to earth ground), enabling series wiring for higher voltages or split ± supplies.</p>

<h3>Schematic Symbols</h3>
<table style="width:100%;border-collapse:collapse;margin:1rem 0;">
<tr style="border-bottom:1px solid rgba(255,255,255,0.1)"><th style="padding:0.5rem;color:#f59e0b;">Component</th><th style="padding:0.5rem;color:#f59e0b;">ANSI Symbol</th><th style="padding:0.5rem;color:#f59e0b;">Notes</th></tr>
<tr style="border-bottom:1px solid rgba(255,255,255,0.05)"><td style="padding:0.5rem;">DC Voltage Source</td><td style="padding:0.5rem;font-family:monospace;">Long bar (+) / Short bar (-)</td><td style="padding:0.5rem;">Long = positive</td></tr>
<tr style="border-bottom:1px solid rgba(255,255,255,0.05)"><td style="padding:0.5rem;">DC Current Source</td><td style="padding:0.5rem;font-family:monospace;">Circle with arrow</td><td style="padding:0.5rem;">Arrow = conventional flow</td></tr>
<tr style="border-bottom:1px solid rgba(255,255,255,0.05)"><td style="padding:0.5rem;">Resistor (ANSI)</td><td style="padding:0.5rem;font-family:monospace;">Zigzag line</td><td style="padding:0.5rem;">North American standard</td></tr>
<tr style="border-bottom:1px solid rgba(255,255,255,0.05)"><td style="padding:0.5rem;">Resistor (IEC)</td><td style="padding:0.5rem;font-family:monospace;">Rectangle</td><td style="padding:0.5rem;">International standard</td></tr>
<tr style="border-bottom:1px solid rgba(255,255,255,0.05)"><td style="padding:0.5rem;">Earth Ground</td><td style="padding:0.5rem;font-family:monospace;">Three horizontal lines (descending)</td><td style="padding:0.5rem;">Tied to earth</td></tr>
<tr><td style="padding:0.5rem;">Chassis Ground</td><td style="padding:0.5rem;font-family:monospace;">Line with descending stripes</td><td style="padding:0.5rem;">Common reference, not earth</td></tr>
</table>

<h3>Digital Multimeter (DMM)</h3>
<p>A DMM measures voltage, current, and resistance. Key specifications:</p>
<ul>
<li><strong>Resolution:</strong> Set by "count" (e.g., 2000 count = 3½ digit)</li>
<li><strong>Accuracy:</strong> Specified as "% of reading + N counts"</li>
</ul>

<div class="example-box"><div class="label">Example</div>
<p>A 3½ digit DMM (2000 count) has accuracy ±(2% + 3 counts). On 20V scale, it reads 5.01V. Find uncertainty.</p>
<p>Resolution on 20V scale = 0.01V. 3 counts = 0.03V. 2% of 5.01 = 0.1002V.</p>
<p>Total uncertainty = 0.03 + 0.1002 = <strong>±0.13V</strong></p>
<p>True value is between <strong>4.88V and 5.14V</strong></p></div>

<div class="callout"><strong>Color coding:</strong> In electronics, RED = positive/hot, BLACK = common/ground. This is the opposite of North American residential wiring!</div>`,
            executiveSummary: `Laboratory DC supplies offer adjustable voltage with current limiting. Schematic symbols follow ANSI (North America) or IEC (international) standards. DMM accuracy is specified as percentage of reading plus a count term, creating an error envelope around the measured value.`,
            keyTakeaways: [
              'Lab supplies: adjustable 0-25V+, floating outputs, current limiting',
              'ANSI resistor = zigzag; IEC resistor = rectangle',
              'Electronics color code: RED = positive, BLACK = ground (opposite of residential wiring)',
              'DMM accuracy = ±(% of reading + N counts)',
              'Use the LOWEST scale that can display the value for best resolution',
            ],
          },
        ],
      },
    ],
  },
];

import { dcChapters3_10 } from './dcCircuitDataCh3_10';

export const dcChapterList: DCChapter[] = [...dcChapters, ...dcChapters3_10];

export function getDCTotalLessons(): number {
  return dcChapterList.reduce((total, ch) => total + ch.sections.reduce((s, sec) => s + sec.lessons.length, 0), 0);
}

export function getDCCompletedLessons(): number {
  return dcChapterList.reduce((total, ch) => total + ch.sections.reduce((s, sec) => s + sec.lessons.filter(l => l.completed).length, 0), 0);
}

// Types are already exported above
