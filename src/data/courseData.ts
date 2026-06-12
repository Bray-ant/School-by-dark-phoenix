export interface Lesson {
  id: string;
  title: string;
  duration: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  type: 'theory' | 'example' | 'exercise' | 'visual';
  content: string;
  formulas?: string[];
  visualComponent?: string;
  completed?: boolean;
}

export interface Section {
  id: string;
  title: string;
  description: string;
  lessons: Lesson[];
  completed?: boolean;
}

export interface Chapter {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  color: string;
  sections: Section[];
  progress: number;
}

export const chapters: Chapter[] = [
  {
    id: 'stereostatics',
    number: 1,
    title: 'Stereostatics',
    subtitle: 'The Study of Bodies at Rest',
    description: 'Master the fundamentals of forces, equilibrium, and structural analysis. From free-body diagrams to support reactions, build the foundation for all engineering mechanics.',
    icon: 'Box',
    color: '#3b82f6',
    progress: 0,
    sections: [
      {
        id: 's1-intro',
        title: 'Introduction & Motivation',
        description: 'Why study mechanics? Real-world applications and fundamental concepts.',
        lessons: [
          {
            id: 's1-l1',
            title: 'Why Mechanics Matters',
            duration: '10 min',
            difficulty: 'beginner',
            type: 'theory',
            content: `<h2>Introduction and Motivation</h2><p>Every visible object interacts mechanically with its environment. It is therefore impossible to escape mechanics. Even when an object or body is at rest, forces act upon it.</p><div class="callout"><strong>Key Insight:</strong> Mechanics is not just an academic subject — it is the fundamental language of physical reality.</div><h3>Real-World Questions in Mechanics</h3><ul><li><strong>Why does a four-legged table wobble</strong> when one leg is shorter, but a three-legged table does not?</li><li><strong>Why is an inclined position in a curve</strong> more favorable than an upright one?</li><li><strong>Why do wind turbines fail catastrophically</strong> under certain conditions?</li></ul>`,
            formulas: ['F = m·a', 'ΣF = 0', 'ΣM = 0'],
            completed: false
          },
          {
            id: 's1-l2',
            title: 'Basic Concepts',
            duration: '15 min',
            difficulty: 'beginner',
            type: 'theory',
            content: `<h2>Important Terms in Technical Mechanics</h2><div class="definition-box"><div class="label">Fundamental Definitions</div><p><strong>Point Mass:</strong> A point-like body characterized only by its mass.</p><p><strong>Rigid Body:</strong> A body that does not deform under the influence of forces.</p><p><strong>Force:</strong> An effect on a body that causes a change in its state of deformation or motion.</p><p><strong>Moment:</strong> Describes the rotational effect of a force around a reference point.</p></div><h3>Right-Handed Cartesian Coordinate System</h3><p>We use a right-handed Cartesian coordinate system where the space is at rest (inertial system).</p><div class="formula-block">r⃗ = x·e⃗ₓ + y·e⃗ᵧ + z·e⃗₂<br>|r⃗| = √(x² + y² + z²)</div>`,
            formulas: ['r⃗ = x·e⃗ₓ + y·e⃗ᵧ + z·e⃗₂', '|r⃗| = √(x² + y² + z²)'],
            completed: false
          }
        ]
      },
      {
        id: 's2-forces',
        title: 'Forces & Equilibrium',
        description: 'Classification of forces, free-body diagrams, and the axioms of statics.',
        lessons: [
          {
            id: 's2-l1',
            title: 'Classification of Forces',
            duration: '15 min',
            difficulty: 'beginner',
            type: 'theory',
            content: `<h2>Classification of Forces</h2><h3>By Distance</h3><ul><li><strong>Long-range force:</strong> Force that acts over medium to long distances. Example: Gravitational force.</li><li><strong>Short-range force:</strong> Contact force between two bodies. Example: Support forces.</li></ul><h3>By Type of Application</h3><ul><li><strong>Volume force:</strong> Acts on the entire volume (gravity, electromagnetic).</li><li><strong>Area force:</strong> Water pressure on a dam, wind loads.</li><li><strong>Line force:</strong> Very thin contact surfaces (knife blade).</li><li><strong>Point load:</strong> Needle or rope — an idealization.</li></ul>`,
            formulas: ['G = m·g', 'g ≈ 9.81 m/s²'],
            completed: false
          },
          {
            id: 's2-l2',
            title: 'The Free-Body Principle',
            duration: '20 min',
            difficulty: 'beginner',
            type: 'theory',
            content: `<h2>The Free-Body Principle</h2><p>The free-body principle involves freeing the body from its geometric connections and replacing contact points with forces.</p><div class="definition-box"><div class="label">Procedure</div><ol><li>Identify the body to be analyzed</li><li>Remove all supports and connections</li><li>Replace each support with its reaction force</li><li>Draw all external forces</li><li>Establish a coordinate system</li><li>Apply equilibrium conditions</li></ol></div><h3>Force Vector</h3><p>Force is defined by magnitude, direction, and point of application.</p><div class="formula-block">Unit of Force: 1 N = 1 kg·m/s²</div>`,
            formulas: ['1 N = 1 kg·m/s²'],
            visualComponent: 'freebody',
            completed: false
          },
          {
            id: 's2-l3',
            title: 'Axioms of Statics',
            duration: '20 min',
            difficulty: 'beginner',
            type: 'theory',
            content: `<h2>Axioms of Statics</h2><h3>1. Axiom of Equilibrium (Newton)</h3><p>Two forces are in equilibrium if their lines of action coincide, magnitudes are the same, and they are opposite.</p><div class="formula-block">F⃗₁ + F⃗₂ = 0⃗</div><h3>2. Principle of Transmissibility (Varignon)</h3><p>The point of application may be moved along its line of action.</p><div class="callout-success"><strong>Conclusion:</strong> Force is a <strong>sliding vector</strong>.</div><h3>3. Newton's Third Law</h3><div class="formula-block">actio = reactio</div><h3>4. Parallelogram of Forces</h3><div class="formula-block">R⃗ = F⃗₁ + F⃗₂</div>`,
            formulas: ['F⃗₁ + F⃗₂ = 0⃗', 'actio = reactio', 'R⃗ = F⃗₁ + F⃗₂'],
            completed: false
          }
        ]
      },
      {
        id: 's3-central',
        title: 'Central Force System',
        description: 'Planar central force systems, resultants, and equilibrium.',
        lessons: [
          {
            id: 's3-l1',
            title: 'Planar Central Force System',
            duration: '20 min',
            difficulty: 'intermediate',
            type: 'theory',
            content: `<h2>Planar Central Force System</h2><div class="definition-box"><div class="label">Definition</div><p>In a <strong>central force system</strong>, the lines of action of ALL forces pass through a common point.</p></div><h3>Analytical Solution</h3><div class="formula-block">Rₓ = Σ Fᵢₓ<br>Rᵧ = Σ Fᵢᵧ<br>Magnitude: R = √(Rₓ² + Rᵧ²)<br>Direction: tan(α) = Rᵧ / Rₓ</div>`,
            formulas: ['Rₓ = Σ Fᵢₓ', 'Rᵧ = Σ Fᵢᵧ', 'R = √(Rₓ² + Rᵧ²)', 'tan(α) = Rᵧ / Rₓ'],
            visualComponent: 'centralforces',
            completed: false
          },
          {
            id: 's3-l2',
            title: 'Forces in Equilibrium',
            duration: '15 min',
            difficulty: 'intermediate',
            type: 'theory',
            content: `<h2>Forces in Equilibrium</h2><div class="formula-block">Σ Fᵢₓ = 0<br>Σ Fᵢᵧ = 0</div><div class="callout-success"><strong>Conclusion:</strong> The body does not change its state of motion. The force plan is closed.</div><h3>Three-Force Principle</h3><p>Three forces are in equilibrium if their lines of action intersect at one point and the force polygon is closed.</p>`,
            formulas: ['Σ Fᵢₓ = 0', 'Σ Fᵢᵧ = 0'],
            completed: false
          }
        ]
      },
      {
        id: 's4-noncentral',
        title: 'Non-Central Force System',
        description: 'Moments, torque, and equilibrium of non-central force systems.',
        lessons: [
          {
            id: 's4-l1',
            title: 'Moment of a Force',
            duration: '20 min',
            difficulty: 'intermediate',
            type: 'theory',
            content: `<h2>Planar Non-Central Force System</h2><div class="definition-box"><div class="label">Definition of Moment</div><p>The measure of rotational force:</p><div class="formula-block">M = F · h</div><p>where <strong>h</strong> is the lever arm.</p></div><h3>Vector Cross Product</h3><div class="formula-block">M⃗ = r⃗ × F⃗</div><div class="callout-warning"><strong>Attention:</strong> The vector product is not commutative.</div><p>For planar problems:</p><div class="formula-block">M = rₓ·Fᵧ - rᵧ·Fₓ = F · h</div>`,
            formulas: ['M = F · h', 'M⃗ = r⃗ × F⃗'],
            visualComponent: 'moment',
            completed: false
          },
          {
            id: 's4-l2',
            title: 'Equilibrium of Force Groups',
            duration: '20 min',
            difficulty: 'intermediate',
            type: 'theory',
            content: `<h2>Equilibrium of Force Groups</h2><div class="formula-block">Σ Fᵢₓ = 0<br>Σ Fᵢᵧ = 0<br>Σ Mᵢ = 0</div><div class="callout-success">Three scalar equations for three degrees of freedom in the plane: 2× translation, 1× rotation.</div><h3>Special Case: Force Couple</h3><p>Two antiparallel forces of equal magnitude have no resultant but generate torque: M = F · h (constant).</p>`,
            formulas: ['Σ Fᵢₓ = 0', 'Σ Fᵢᵧ = 0', 'Σ Mᵢ = 0', 'M = F · h'],
            completed: false
          }
        ]
      },
      {
        id: 's5-centroid',
        title: 'Center of Gravity & Resultant',
        description: 'Centroids of lines, areas, and volumes.',
        lessons: [
          {
            id: 's5-l1',
            title: 'Centroid of a Line',
            duration: '15 min',
            difficulty: 'intermediate',
            type: 'theory',
            content: `<h2>Center of Gravity and Resultant</h2><div class="formula-block">Resultant: R = Σ Fᵢ<br>Position: xₛ = Σ(Fᵢ · xᵢ) / R</div><h3>Common Line Load Cases</h3><table style="width:100%;border-collapse:collapse;margin:1rem 0;"><tr style="border-bottom:1px solid rgba(255,255,255,0.1)"><th style="text-align:left;padding:0.75rem;color:#3b82f6;">Load Type</th><th style="text-align:left;padding:0.75rem;color:#3b82f6;">Resultant R</th><th style="text-align:left;padding:0.75rem;color:#3b82f6;">Position xₛ</th></tr><tr style="border-bottom:1px solid rgba(255,255,255,0.05)"><td style="padding:0.75rem;">Uniform load</td><td style="padding:0.75rem;font-family:monospace;">R = q₀ · l</td><td style="padding:0.75rem;font-family:monospace;">xₛ = l/2</td></tr><tr><td style="padding:0.75rem;">Triangular load</td><td style="padding:0.75rem;font-family:monospace;">R = ½ q₀ · l</td><td style="padding:0.75rem;font-family:monospace;">xₛ = ⅔ l</td></tr></table>`,
            formulas: ['R = Σ Fᵢ', 'xₛ = Σ(Fᵢ·xᵢ) / R'],
            completed: false
          },
          {
            id: 's5-l2',
            title: 'Centroid of an Area',
            duration: '15 min',
            difficulty: 'intermediate',
            type: 'theory',
            content: `<h2>Center of Gravity of an Area</h2><div class="formula-block">xₛ = Σ(Aᵢ · xₛᵢ) / ΣAᵢ<br>yₛ = Σ(Aᵢ · yₛᵢ) / ΣAᵢ</div><div class="callout"><strong>Method:</strong> Treat cutouts (holes) as negative areas.</div>`,
            formulas: ['xₛ = Σ(Aᵢ·xₛᵢ) / ΣAᵢ', 'yₛ = Σ(Aᵢ·yₛᵢ) / ΣAᵢ'],
            completed: false
          }
        ]
      },
      {
        id: 's6-supports',
        title: 'Support Reactions',
        description: 'Types of supports, degrees of freedom, and determinacy.',
        lessons: [
          {
            id: 's6-l1',
            title: 'Types of Supports',
            duration: '20 min',
            difficulty: 'intermediate',
            type: 'theory',
            content: `<h2>Support Reaction of Planar Structures</h2><h3>Three Basic Types of Supports</h3><table style="width:100%;border-collapse:collapse;margin:1rem 0;"><tr style="border-bottom:1px solid rgba(255,255,255,0.1)"><th style="text-align:left;padding:0.75rem;color:#3b82f6;">Support Type</th><th style="text-align:left;padding:0.75rem;color:#3b82f6;">Reactions</th></tr><tr style="border-bottom:1px solid rgba(255,255,255,0.05)"><td style="padding:0.75rem;"><strong>Hinge</strong></td><td style="padding:0.75rem;font-family:monospace;">Aₓ, Aᵧ (2)</td></tr><tr style="border-bottom:1px solid rgba(255,255,255,0.05)"><td style="padding:0.75rem;"><strong>Roller</strong></td><td style="padding:0.75rem;font-family:monospace;">Aᵧ (1)</td></tr><tr><td style="padding:0.75rem;"><strong>Clamped</strong></td><td style="padding:0.75rem;font-family:monospace;">Aₓ, Aᵧ, Mₐ (3)</td></tr></table><h3>Determinacy</h3><div class="formula-block">n = r + v - 3·s</div>`,
            formulas: ['n = r + v - 3·s'],
            completed: false
          }
        ]
      },
      {
        id: 's7-composite',
        title: 'Composite Structures',
        description: 'Multi-part systems, joints, and Gerber beams.',
        lessons: [
          {
            id: 's7-l1',
            title: 'Joints and Connecting Elements',
            duration: '20 min',
            difficulty: 'advanced',
            type: 'theory',
            content: `<h2>Composite Structures</h2><p>Support structures consist of several individual parts assembled using <strong>joints</strong>.</p><h3>Gerber Beam</h3><p>For large spans, multiple supports are necessary. By inserting <strong>joints</strong>, a statically determined structure is created.</p><div class="formula-block">n = r + v - 3·s = 0 (statically determinate)</div>`,
            formulas: ['n = r + v - 3·s'],
            completed: false
          }
        ]
      },
      {
        id: 's8-internal',
        title: 'Internal Forces',
        description: 'Normal force, shear force, and bending moment in beams.',
        lessons: [
          {
            id: 's8-l1',
            title: 'Internal Forces and Moments',
            duration: '20 min',
            difficulty: 'advanced',
            type: 'theory',
            content: `<h2>Stress on Planar Structures</h2><ul><li><strong>Normal force N⃗</strong> — acts perpendicular to the cross-section</li><li><strong>Shear force V⃗</strong> — acts parallel to the cross-section</li><li><strong>Bending moment M⃗</strong> — causes rotation about an axis</li></ul><h3>Sign Convention</h3><ul><li><strong>N</strong>: Positive when pointing away from the section (tension)</li><li><strong>V</strong>: Positive when pointing downward on the left face</li><li><strong>M</strong>: Positive when causing compression in top fibers</li></ul>`,
            formulas: ['N = ∫ σ dA', 'V = ∫ τ dA', 'M = ∫ σ·y dA'],
            completed: false
          }
        ]
      },
      {
        id: 's9-friction',
        title: 'Friction',
        description: 'Static and kinetic friction, friction laws.',
        lessons: [
          {
            id: 's9-l1',
            title: 'Friction Laws',
            duration: '15 min',
            difficulty: 'intermediate',
            type: 'theory',
            content: `<h2>Friction</h2><h3>Coulomb's Friction Law</h3><div class="definition-box"><div class="label">Static Friction</div><div class="formula-block">H ≤ H_max = μ₀ · N</div></div><div class="definition-box"><div class="label">Kinetic Friction</div><div class="formula-block">R = μ · N</div></div><h3>Friction Angle</h3><div class="formula-block">tan(ρ) = μ</div><div class="callout-success"><strong>Self-locking:</strong> If α ≤ ρ₀, the body remains at rest regardless of load.</div>`,
            formulas: ['H ≤ μ₀ · N', 'R = μ · N', 'tan(ρ) = μ'],
            completed: false
          }
        ]
      }
    ]
  },
  {
    id: 'kinematics',
    number: 2,
    title: 'Kinematics',
    subtitle: 'The Geometry of Motion',
    description: 'Study motion without reference to its causes. From point mass trajectories to rigid body rotation.',
    icon: 'Orbit',
    color: '#10b981',
    progress: 0,
    sections: [
      {
        id: 'k1-intro',
        title: 'Introduction & Definitions',
        description: 'Position, velocity, acceleration, and momentum.',
        lessons: [
          {
            id: 'k1-l1',
            title: 'Fundamental Definitions',
            duration: '15 min',
            difficulty: 'beginner',
            type: 'theory',
            content: `<h2>Kinematics: Definitions</h2><div class="definition-box"><div class="label">Core Definitions</div><p><strong>Kinematics:</strong> Description of motion without reference to external cause.</p><p><strong>Kinetics:</strong> Motion under the influence of external forces.</p></div><h3>Velocity</h3><div class="formula-block">v⃗ = dr⃗/dt = r⃗̇</div><h3>Momentum</h3><div class="formula-block">p⃗ = m · v⃗</div>`,
            formulas: ['v⃗ = dr⃗/dt', 'p⃗ = m·v⃗', 'a⃗ = dv⃗/dt'],
            completed: false
          },
          {
            id: 'k1-l2',
            title: 'Linear Motion',
            duration: '15 min',
            difficulty: 'beginner',
            type: 'example',
            content: `<h2>Example: Free Fall</h2><p>Uniformly accelerated motion with a(t) = g = 9.81 m/s².</p><div class="formula-block">v(t) = g·t<br>x(t) = h - ½g·t²<br>t_fall = √(2h/g)<br>v_impact = √(2gh)</div>`,
            formulas: ['t_fall = √(2h/g)', 'v_impact = √(2gh)'],
            completed: false
          }
        ]
      },
      {
        id: 'k2-rotation',
        title: 'Rotational Motion',
        description: 'Circular motion, angular velocity, and rigid body rotation.',
        lessons: [
          {
            id: 'k2-l1',
            title: 'Circular Motion',
            duration: '20 min',
            difficulty: 'intermediate',
            type: 'theory',
            content: `<h2>Circular Motion</h2><h3>Angular Velocity and Acceleration</h3><div class="formula-block">ω = dφ/dt = φ̇<br>α = dω/dt = ω̇ = φ̈</div><h3>Velocity and Acceleration Components</h3><div class="formula-block">v = r · ω<br>aₜ = r · α (tangential)<br>aₙ = r · ω² = v²/r (normal)</div><div class="callout">The normal acceleration always points toward the center of rotation.</div>`,
            formulas: ['v = r·ω', 'aₜ = r·α', 'aₙ = v²/r'],
            visualComponent: 'projectile',
            completed: false
          },
          {
            id: 'k2-l2',
            title: 'Rigid Body Rotation',
            duration: '20 min',
            difficulty: 'intermediate',
            type: 'theory',
            content: `<h2>Rotation of a Rigid Body</h2><p>For a rigid body rotating about a fixed axis, all points move in concentric circles.</p><div class="formula-block">v⃗ = ω⃗ × r⃗<br>a⃗ = α⃗ × r⃗ + ω⃗ × (ω⃗ × r⃗)</div><p>The first term is tangential acceleration, the second is centripetal acceleration.</p>`,
            formulas: ['v⃗ = ω⃗ × r⃗', 'a⃗ = α⃗ × r⃗ + ω⃗ × (ω⃗ × r⃗)'],
            completed: false
          }
        ]
      },
      {
        id: 'k3-combined',
        title: 'Combined Motion',
        description: 'Translation and rotation, instantaneous center of rotation.',
        lessons: [
          {
            id: 'k3-l1',
            title: 'General Plane Motion',
            duration: '20 min',
            difficulty: 'advanced',
            type: 'theory',
            content: `<h2>General Plane Motion</h2><p>Any plane motion can be decomposed into translation plus rotation.</p><div class="formula-block">v⃗_B = v⃗_A + ω⃗ × r⃗_AB</div><p>This is the fundamental equation for analyzing mechanisms and linkages.</p>`,
            formulas: ['v⃗_B = v⃗_A + ω⃗ × r⃗_AB'],
            completed: false
          }
        ]
      }
    ]
  },
  {
    id: 'kinetics',
    number: 3,
    title: 'Kinetics',
    subtitle: 'Motion Under Forces',
    description: 'Newton\'s laws, work-energy principle, and impulse-momentum. Master the dynamics of particles and rigid bodies.',
    icon: 'Zap',
    color: '#f59e0b',
    progress: 0,
    sections: [
      {
        id: 'd1-newton',
        title: "Newton's Laws",
        description: 'The three laws of motion and their applications.',
        lessons: [
          {
            id: 'd1-l1',
            title: "Newton's Second Law",
            duration: '15 min',
            difficulty: 'beginner',
            type: 'theory',
            content: `<h2>Newton's Second Law</h2><div class="formula-block">F⃗ = m · a⃗</div><p>The acceleration of a particle is proportional to the net force acting on it and inversely proportional to its mass.</p><h3>Equation of Motion</h3><div class="formula-block">m · r⃗̈ = F⃗</div><p>This is a second-order ordinary differential equation. Given initial conditions r⃗₀ and v⃗₀, the motion is uniquely determined.</p>`,
            formulas: ['F⃗ = m·a⃗', 'm·r⃗̈ = F⃗'],
            completed: false
          },
          {
            id: 'd1-l2',
            title: 'Inclined Plane Example',
            duration: '15 min',
            difficulty: 'beginner',
            type: 'example',
            content: `<h2>Example: Block on an Inclined Plane</h2><p><strong>Given:</strong> Mass m, angle α, coefficient of friction μ</p><p><strong>Find:</strong> Acceleration of the block</p><div class="formula-block">Forces in x-direction (along plane):<br>m·g·sin(α) - μ·m·g·cos(α) = m·a<br><br>a = g·(sin(α) - μ·cos(α))</div>`,
            formulas: ['a = g·(sin(α) - μ·cos(α))'],
            visualComponent: 'inclined',
            completed: false
          }
        ]
      },
      {
        id: 'd2-energy',
        title: 'Work and Energy',
        description: 'Work-energy principle and conservation of energy.',
        lessons: [
          {
            id: 'd2-l1',
            title: 'Work-Energy Principle',
            duration: '20 min',
            difficulty: 'intermediate',
            type: 'theory',
            content: `<h2>Work and Energy</h2><h3>Work Done by a Force</h3><div class="formula-block">W = ∫ F⃗ · dr⃗</div><h3>Kinetic Energy</h3><div class="formula-block">T = ½ m · v²</div><h3>Work-Energy Principle</h3><div class="formula-block">W = ΔT = T₂ - T₁</div><div class="callout-success">The total work done on a particle equals its change in kinetic energy.</div>`,
            formulas: ['W = ∫ F⃗·dr⃗', 'T = ½m·v²', 'W = ΔT'],
            completed: false
          },
          {
            id: 'd2-l2',
            title: 'Conservation of Energy',
            duration: '15 min',
            difficulty: 'intermediate',
            type: 'theory',
            content: `<h2>Conservation of Mechanical Energy</h2><p>For conservative forces only:</p><div class="formula-block">E = T + V = constant</div><p>where V is the potential energy.</p><div class="callout">Gravity: V = m·g·h<br>Spring: V = ½k·x²</div>`,
            formulas: ['E = T + V = const'],
            completed: false
          }
        ]
      },
      {
        id: 'd3-impulse',
        title: 'Impulse and Momentum',
        description: 'Impulse-momentum principle and collisions.',
        lessons: [
          {
            id: 'd3-l1',
            title: 'Linear Impulse and Momentum',
            duration: '20 min',
            difficulty: 'intermediate',
            type: 'theory',
            content: `<h2>Impulse and Momentum</h2><div class="formula-block">I⃗ = ∫ F⃗ dt = Δp⃗ = m·Δv⃗</div><h3>Conservation of Momentum</h3><p>If the net external force is zero, total momentum is conserved:</p><div class="formula-block">Σ p⃗ = constant</div><h3>Collisions</h3><div class="formula-block">Coefficient of restitution:<br>e = (v₂' - v₁') / (v₁ - v₂)</div>`,
            formulas: ['I⃗ = Δp⃗', 'e = (v₂′-v₁′)/(v₁-v₂)'],
            completed: false
          }
        ]
      },
      {
        id: 'd4-rigid',
        title: 'Rigid Body Kinetics',
        description: 'Equations of motion for rigid bodies.',
        lessons: [
          {
            id: 'd4-l1',
            title: 'Equations of Motion',
            duration: '20 min',
            difficulty: 'advanced',
            type: 'theory',
            content: `<h2>Rigid Body Kinetics</h2><h3>Translation</h3><div class="formula-block">Σ F⃗ = m · a⃗_G</div><h3>Rotation about Center of Mass</h3><div class="formula-block">Σ M⃗_G = I_G · α⃗</div><p>where I_G is the mass moment of inertia about the center of mass.</p><h3>Parallel Axis Theorem</h3><div class="formula-block">I = I_G + m·d²</div>`,
            formulas: ['ΣF⃗ = m·a⃗_G', 'ΣM⃗_G = I_G·α⃗', 'I = I_G + m·d²'],
            completed: false
          }
        ]
      }
    ]
  }
];

export const quizzes = [
  {
    id: 'q1',
    chapterId: 'stereostatics',
    title: 'Stereostatics Quiz',
    questions: [
      { question: 'What are the two equilibrium conditions for a planar central force system?', options: ['ΣFx=0, ΣFy=0', 'ΣF=0, ΣM=0', 'F=ma, ΣF=0', 'ΣM=0 only'], correct: 0, explanation: 'For a central force system, the equilibrium conditions are ΣFx=0 and ΣFy=0.' },
      { question: 'What is the unit of force?', options: ['kg', 'N', 'm/s', 'J'], correct: 1, explanation: '1 N = 1 kg·m/s²' },
      { question: 'What does "actio = reactio" mean?', options: ['Forces always occur in pairs', 'Action is greater than reaction', 'Only one force acts', 'Forces cancel out'], correct: 0, explanation: 'Newton\'s Third Law: forces always occur in pairs of equal magnitude and opposite direction.' }
    ]
  },
  {
    id: 'q2',
    chapterId: 'kinematics',
    title: 'Kinematics Quiz',
    questions: [
      { question: 'What is the relationship between velocity and angular velocity in circular motion?', options: ['v = r·ω', 'v = ω/r', 'v = r²·ω', 'v = ω²·r'], correct: 0, explanation: 'v = r·ω — linear velocity equals radius times angular velocity.' },
      { question: 'What is centripetal acceleration?', options: ['a = r·α', 'a = r·ω²', 'a = v·t', 'a = F/m'], correct: 1, explanation: 'Centripetal (normal) acceleration is aₙ = r·ω² = v²/r.' }
    ]
  },
  {
    id: 'q3',
    chapterId: 'kinetics',
    title: 'Kinetics Quiz',
    questions: [
      { question: 'What is Newton\'s Second Law?', options: ['F = m·a', 'E = mc²', 'F = G·m₁·m₂/r²', 'p = m·v'], correct: 0, explanation: 'F = m·a — force equals mass times acceleration.' },
      { question: 'What is conserved in an elastic collision?', options: ['Only momentum', 'Only energy', 'Both momentum and kinetic energy', 'Nothing'], correct: 2, explanation: 'In an elastic collision, both linear momentum and kinetic energy are conserved.' }
    ]
  }
];

export function getTotalLessons(): number {
  return chapters.reduce((total, ch) => total + ch.sections.reduce((s, sec) => s + sec.lessons.length, 0), 0);
}

export function getCompletedLessons(): number {
  return chapters.reduce((total, ch) => total + ch.sections.reduce((s, sec) => s + sec.lessons.filter(l => l.completed).length, 0), 0);
}
