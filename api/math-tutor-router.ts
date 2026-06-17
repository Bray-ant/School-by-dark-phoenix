import { z } from "zod";
import { createRouter, authedQuery, publicQuery } from "./middleware";
import {
  getUserAccessToken,
  callKimiChat,
  MATH_TUTOR_SYSTEM_PROMPT,
} from "./kimi/chat";
import { handleTutorMessage } from "./lib/ai-helpers";

// ── Topic detection ──────────────────────────
function detectMathTopic(q: string): string {
  const lower = q.toLowerCase();

  // Module 1: Multivariable Calculus
  if (/(partial derivative|gradient|hessian|level set|contour|directional|tangent plane|multivariable|partial.*deriv|∂|del\s)/.test(lower))
    return "Module 1 — Multivariable Differential Calculus";
  if (/(limit.*several|limit.*variable|limit.*2d|limit.*two.*var)/.test(lower))
    return "Module 1 — Limits in Several Variables";

  // Module 2: Linear Algebra
  if (/(eigenvalue|eigenvector|eigen|definite|definiteness|positive definite|negative definite|indefinite|convexity|saddle.*point|critical.*point|classify.*extrem)/.test(lower))
    return "Module 2 — Linear Algebra: Eigenvalues, Definiteness & Extrema";
  if (/(matrix|matrices|determinant|characteristic.*polynomial)/.test(lower))
    return "Module 2 — Linear Algebra";

  // Module 3: Complex Functions
  if (/(complex.*exponential|e\^\{?iz\}?|e\^ix|complex.*log|complex.*root|roots?.*unity|roots?.*of.*unity|argument|principal.*arg|arg\s|cauchy.*riemann|c-riemann|cr\s|analytic.*complex|holomorphic)/.test(lower))
    return "Module 3 — Complex Functions";
  if (/(euler.*formula|euler.*identity|e\^\{?i.*pi\}?|cis\s|polar.*form|rectangular.*form|modulus|complex.*number)/.test(lower))
    return "Module 3 — Complex Numbers & Euler's Formula";

  // Module 4: Taylor Polynomials
  if (/(taylor.*polynomial|taylor.*series|taylor.*expansion|maclaurin|remainder.*taylor|lagrange.*error|error.*bound.*taylor)/.test(lower))
    return "Module 4 — Taylor Polynomials";

  // Module 5: Power Series
  if (/(power.*series|radius.*convergence|interval.*convergence|ratio.*test.*series|term.*by.*term|differentiat.*series|integrat.*series)/.test(lower))
    return "Module 5 — Power Series";

  // Module 6: Integration
  if (/(riemann|riemann.*sum|fundamental.*theorem|ftc|lh[ôo]pital|l'hopital|h[ôo]pital|integration.*by.*part|by.*part|substitution.*integral|u-sub|partial.*fraction|partial.*frac|improper.*integral|trapezoid|simpson|midpoint.*rule|numerical.*integration)/.test(lower))
    return "Module 6 — Engineering Integration";

  // Fallback keyword detection
  if (/(partial|gradient|level.*set|contour|hessian|directional)/.test(lower)) return "Module 1 — Multivariable Calculus";
  if (/(eigen|definite|matrix|convex|saddle)/.test(lower)) return "Module 2 — Linear Algebra";
  if (/(complex.*num|imaginary|real.*part|e\^i|euler)/.test(lower)) return "Module 3 — Complex Functions";
  if (/(taylor|maclaurin)/.test(lower)) return "Module 4 — Taylor Polynomials";
  if (/(power.*series|convergence.*series|sum.*infinity)/.test(lower)) return "Module 5 — Power Series";
  if (/(integral|integrat|antiderivative|area.*under|area.*curve)/.test(lower)) return "Module 6 — Integration";
  if (/(limit|continuity|continuous|discontinu)/.test(lower)) return "Module 1 — Limits & Continuity";
  if (/(derivative|differentiat|slope|rate.*change|chain.*rule|product.*rule|quotient.*rule)/.test(lower)) return "Calculus — Differentiation";

  return "General Mathematics";
}

// ── Difficulty detection ─────────────────────
function detectDifficulty(q: string): "Easy" | "Medium" | "Hard" {
  const lower = q.toLowerCase();
  if (/(hard|difficult|advanced|prove|proof|theorem|epsilon|δ|delta.*eps|rigorous|challenging)/.test(lower))
    return "Hard";
  if (/(easy|simple|basic|beginner|quick|simplest)/.test(lower))
    return "Easy";
  return "Medium";
}

// ── Local knowledge base for unauthenticated users ──
function generateLocalMathResponse(question: string, topic: string): string {
  const q = question.toLowerCase();
  const t = topic.toLowerCase();

  // Module 1: Multivariable Calculus
  if (t.includes("multivariable") || t.includes("limit")) {
    if (q.includes("level set") || q.includes("contour")) {
      return `## Level Sets & Pre-images\n\nA **level set** N_c(f) = {x ∈ D : f(x) = c} is the collection of all inputs giving the same output value c. Think of **contour lines** on a topographic map — every point on a contour line is at the same altitude.\n\n**Worked Example 1 (Easy):** f(x,y) = x² + y², c = 4\n→ x² + y² = 4, a **circle** of radius 2 centered at the origin.\n\n**Worked Example 2:** g(x,y) = x² - y, c = 1\n→ y = x² - 1, a **parabola** shifted down by 1.\n\n⚠️ **Common Mistake:** Confusing pre-image f⁻¹(A) (all inputs mapping into a *set* A) with level set (all inputs giving a *single value* c).\n\n**Exercises:**\n1. 🟢 Find the level set of f(x,y) = 2x + 3y for c = 6. What shape is it? *(Answer: a line)*\n2. 🟡 For f(x,y) = x² + y², find f⁻¹([0,1]). Describe geometrically. *(Answer: filled disk radius 1)*\n3. 🔴 For f(x,y,z) = x² + y² + z², describe level sets for c > 0, c = 0, c < 0. *(Answer: sphere, point, empty set)*`;
    }
    if (q.includes("limit") || q.includes("approach")) {
      return `## Limits in Several Variables\n\nIn 1D, you approach from only two directions (left/right). In 2D+, you can approach from **infinitely many paths**. The limit only exists if **all paths give the same value**.\n\n**Worked Example — Limit Does NOT Exist:**\nf(x,y) = (x²-y²)/(x²+y²) as (x,y)→(0,0)\n- Along y = 0: f(x,0) = x²/x² = **1**\n- Along x = 0: f(0,y) = -y²/y² = **-1**\nThree different values → **limit DNE**\n\n**Worked Example — Limit Exists:**\ng(x,y) = 2x²y/(x²+y²)\nUse bound: x²/(x²+y²) ≤ 1, so |g| ≤ 2|y| → 0 ✅\n\n⚠️ **Common Mistake:** Checking only a few paths is **not enough** to prove a limit exists. Use ε-δ or bounding. Checking paths can only *disprove* existence.\n\n**Exercises:**\n1. 🟢 Show that lim_{(x,y)→(0,0)} (x+y) exists and equals 0.\n2. 🟡 Determine whether lim xy/(x²+y²) exists. *(Answer: DNE — approach along y=x gives 1/2, along y=0 gives 0)*\n3. 🔴 Prove using ε-δ that lim x²y/(x²+y²) = 0.`;
    }
    if (q.includes("partial") || q.includes("∂")) {
      return `## Partial Derivatives\n\nA partial derivative ∂f/∂x measures the rate of change when **only x varies** and all other variables are held fixed. Treat every other variable as a constant.\n\n**Worked Example:** f(x,y) = x²y + sin(xy)\n\n**∂f/∂x** (treat y as constant):\n∂/∂x(x²y) = 2xy\n∂/∂x(sin(xy)) = y·cos(xy)  *(chain rule)*\n→ **∂f/∂x = 2xy + y·cos(xy)**\n\n**∂f/∂y** (treat x as constant):\n∂/∂y(x²y) = x²\n∂/∂y(sin(xy)) = x·cos(xy)\n→ **∂f/∂y = x² + x·cos(xy)**\n\n⚠️ **CRITICAL WARNING:** Partial derivatives existing does **NOT** imply continuity. Example: f(x,y) = xy/(x²+y²) for (x,y)≠(0,0), f(0,0)=0. Both partials exist at origin, but the function is **not continuous** there.\n\n**Exercises:**\n1. 🟢 Compute ∂f/∂x and ∂f/∂y for f(x,y) = 3x²y - y³.\n2. 🟡 Compute all partials of f(x,y,z) = x·ln(yz) + z².\n3. 🔴 For f(x,y) = xy/(x²+y²) (defined as 0 at origin), show partials exist at (0,0) but f is not continuous.`;
    }
    if (q.includes("gradient") || q.includes("directional")) {
      return `## Gradient & Directional Derivatives\n\nThe **gradient** ∇f(x) = (∂f/∂x₁, ..., ∂f/∂xₙ) collects all partials into one vector. It always points in the **direction of steepest ascent**.\n\nThe **directional derivative** in direction v (unit vector):\nD_v f(x) = ∇f(x)·v = ‖∇f(x)‖cos θ\n\n**Worked Example:** f(x,y) = x² + y² at (1,2), v = (3/5, 4/5)\nStep 1: ∇f(1,2) = (2·1, 2·2) = (2, 4)\nStep 2: D_v f = (2,4)·(3/5,4/5) = 6/5 + 16/5 = **22/5**\n\n| Angle θ | Result |\n|---------|--------|\n| θ = 0 (same dir) | Max increase = ‖∇f‖ |\n| θ = 90° | No change — tangent to level curve |\n| θ = 180° | Max decrease = −‖∇f‖ |\n\n**Exercises:**\n1. 🟢 Find ∇f for f(x,y) = x³ - 2xy² at (1,1).\n2. 🟡 Find directional derivative of f(x,y) = x²y + y³ at (2,1) in direction v = (1/√2, 1/√2).\n3. 🔴 In which direction does f(x,y,z) = xyz increase most rapidly at (1,2,3)? What is the max rate?`;
    }
    if (q.includes("hessian") || q.includes("second")) {
      return `## Hessian Matrix & Second Derivatives\n\nThe **Hessian** Hf(x) is the matrix of all second-order partial derivatives. It captures the **curvature** — whether the function bends upward (convex), downward (concave), or has mixed behavior (saddle).\n\n**Worked Example:** f(x,y) = x² + 4xy + y²\nFirst: f_x = 2x+4y, f_y = 4x+2y\nSecond: f_xx = 2, f_yy = 2, f_xy = f_yx = 4\nH = [[2, 4], [4, 2]]\n\n**Schwarz's Theorem:** If all second partials are continuous in a neighborhood, then f_xy = f_yx — the Hessian is always **symmetric** for smooth functions.\n\n**Exercises:**\n1. 🟢 Compute Hessian of f(x,y) = x³ + y³.\n2. 🟡 Verify Schwarz's theorem for f(x,y) = x²y³.\n3. 🔴 Compute full Hessian of f(x,y,z) = e^x sin(y) + z²x. Verify symmetry.`;
    }
    return `## Multivariable Differential Calculus\n\nMultivariable calculus extends single-variable concepts to functions of several variables f: ℝⁿ → ℝ. Key topics include:\n\n1. **Level Sets** — f(x,y) = c gives contour curves (like topographic maps)\n2. **Limits** — must check ALL paths (infinitely many in 2D+)\n3. **Partial Derivatives** — rate of change holding other variables constant\n4. **Gradient** ∇f — direction of steepest ascent\n5. **Directional Derivatives** — D_v f = ∇f·v\n6. **Hessian** — matrix of second derivatives for curvature analysis\n7. **Tangent Planes** — z = f(x₀,y₀) + f_x(x-x₀) + f_y(y-y₀)\n\n**Hierarchy:** Total differentiability ⟹ Continuity ⟹ Partial derivatives exist *(none reverse)*\n\nAsk me about any specific topic for a detailed explanation with worked examples!`;
  }

  // Module 2: Linear Algebra
  if (t.includes("linear algebra") || t.includes("eigen") || t.includes("definite")) {
    if (q.includes("eigenvalue") || q.includes("eigenvector")) {
      return `## Eigenvalues & Eigenvectors\n\nAn **eigenvector** v of matrix A satisfies **Av = λv** — it only gets *scaled* (not rotated) by the transformation. The scalar λ is the **eigenvalue**.\n\nTo find: solve **det(A - λI) = 0** (characteristic equation).\n\n**Worked Example:** A = [[2, 0], [0, 3]]\ndet(A - λI) = (2-λ)(3-λ) = 0 → λ₁ = 2, λ₂ = 3\n\nFor λ=2: (A-2I)v = 0 → [[0,0],[0,1]]v = 0 → v₁ = (1, 0)\nFor λ=3: (A-3I)v = 0 → [[-1,0],[0,0]]v = 0 → v₂ = (0, 1)\n\n**Exercises:**\n1. 🟢 Find eigenvalues of A = [[1,2],[0,3]].\n2. 🟡 Find eigenvalues and eigenvectors of A = [[0,1],[-2,3]].\n3. 🔴 For A = [[2,1],[1,2]], find eigenvalues, eigenvectors, and verify A = QDQᵀ.`;
    }
    if (q.includes("definite") || q.includes("convex") || q.includes("saddle")) {
      return `## Definiteness & Convexity\n\n| Eigenvalues | Definiteness | Behavior |\n|-------------|-------------|----------|\n| All λᵢ > 0 | Positive definite | Strictly convex, local min |\n| All λᵢ < 0 | Negative definite | Strictly concave, local max |\n| Mixed signs | Indefinite | Saddle point |\n| All λᵢ ≥ 0 | Positive semidefinite | Convex (not strict) |\n\n**Worked Example:** A = [[2,1],[1,2]]\ndet(A-λI) = (2-λ)² - 1 = 0 → λ₁ = 3, λ₂ = 1\nBoth positive → **positive definite** → strictly convex\n\n**Exercises:**\n1. 🟢 Classify A = [[-3,0],[0,-5]]. *(Negative definite)*\n2. 🟡 Classify A = [[1,2],[2,1]]. *(Indefinite: λ = 3, -1)*\n3. 🔴 For f(x,y) = 2x² + 3xy + 2y², find Hessian and determine convexity.`;
    }
    return `## Linear Algebra for Extrema Classification\n\n**Eigenvalues & Eigenvectors:** Av = λv. Solve det(A-λI) = 0.\n\n**Definiteness Classification:**\n- All λ > 0: Positive definite (strictly convex, local min)\n- All λ < 0: Negative definite (strictly concave, local max)\n- Mixed: Indefinite (saddle point)\n\n**Full Procedure for Finding & Classifying Extrema:**\n1. Compute ∇f(x)\n2. Solve ∇f = 0 → critical points\n3. Compute Hessian H = ∇²f\n4. Evaluate H at each critical point\n5. Check eigenvalues: all + → min, all - → max, mixed → saddle\n6. If f convex: local min = global min\n\n**Worked Example:** f(x,y) = x³ - 3x + y² - 2y\n∇f = (3x²-3, 2y-2) → critical points: (1,1) and (-1,1)\nH = [[6x, 0], [0, 2]]\nAt (1,1): H = [[6,0],[0,2]] → λ = 6,2 → **local minimum**\nAt (-1,1): H = [[-6,0],[0,2]] → λ = -6,2 → **saddle point**`;
  }

  // Module 3: Complex Functions
  if (t.includes("complex")) {
    if (q.includes("euler") || q.includes("e^i") || q.includes("e^{i")) {
      return `## Euler's Formula ⭐\n\n**Theorem:** For all x ∈ ℝ: **e^{ix} = cos x + i sin x**\n\n**Proof sketch:** Plug z = ix into exp(z) = Σ z^k/k!, use i^{2k} = (-1)^k and i^{2k+1} = i(-1)^k, separate even/odd powers to recover cos and sin series.\n\n**Geometric Meaning:** e^{ix} lies on the **unit circle** in ℂ, representing rotation by angle x. As x goes 0 → 2π, you trace the full circle.\n\n**Famous Special Case:** e^{iπ} + 1 = 0 (combines e, i, π, 1, 0)\n\n**Worked Example — Addition Theorem:**\ne^{i(x+y)} = e^{ix}·e^{iy} = (cos x + i sin x)(cos y + i sin y)\n= (cos x cos y - sin x sin y) + i(sin x cos y + cos x sin y)\nComparing real parts: **cos(x+y) = cos x cos y - sin x sin y** ✅\n\n**Exercises:**\n1. 🟢 Compute e^{iπ/2}, e^{iπ}, e^{i3π/2}. Where on the unit circle?\n2. 🟡 Use Euler to derive sin(2x) = 2 sin x cos x.\n3. 🔴 Prove sin(x+y) = sin x cos y + cos x sin y using Euler.`;
    }
    if (q.includes("polar") || q.includes("modulus") || q.includes("argument")) {
      return `## Polar / Exponential Form of Complex Numbers\n\n**Theorem:** Every z ≠ 0 can be written uniquely as: z = |z|·e^{iφ} where φ ∈ (-π, π]\n\n|z| = modulus (distance from origin), φ = Arg(z) = principal argument.\n\n**Multiplication Rule:** z·w = |z||w|·e^{i(Arg z + Arg w)}\n→ Multiply moduli, add arguments.\n\n**Worked Example:** z = 1 + i in polar form\n|z| = √(1²+1²) = √2\nArg(z) = arctan(1/1) = π/4\n→ z = √2 · e^{iπ/4}\n\n⚠️ **Common Mistake:** arg z = {Arg z + 2πk | k ∈ ℤ} is multi-valued. Only Arg z ∈ (-π, π] is unique. Don't confuse arg (set) with Arg (single value).\n\n**Exercises:**\n1. 🟢 Express z = -2 and z = 3i in polar form.\n2. 🟡 Express z = -1 - i in polar form. Find z² using polar form.\n3. 🔴 Express z = (1+i)/(1-i) in polar form without computing rectangular form.`;
    }
    if (q.includes("root") || q.includes("unity")) {
      return `## Roots in ℂ\n\nThe equation zⁿ = a (for a ≠ 0) has exactly **n distinct complex roots**:\nz_k = ⁿ√|a| · e^{i(Arg(a)/n + 2πk/n)}, k = 0, 1, ..., n-1\n\nThese are n equally spaced points on a circle of radius ⁿ√|a|.\n\n**Roots of Unity** (zⁿ = 1): z_k = e^{i·2πk/n}\nFor n=4: z₀=1, z₁=i, z₂=-1, z₃=-i — four corners of a square on unit circle.\n\n**Exercises:**\n1. 🟢 Find all solutions to z² = -4. *(±2i)*\n2. 🟡 Find all cube roots of z³ = 8i.\n3. 🔴 Find all 5th roots of unity. Draw them on the complex plane.`;
    }
    if (q.includes("log")) {
      return `## Complex Logarithm\n\n**Definition:** log w = ln|w| + i(arg w + 2πk), k ∈ ℤ\n\nThe complex logarithm is **multi-valued** — unlike ln x for real x > 0, each w has infinitely many logarithms.\n\n**Principal value:** Log w = ln|w| + i·Arg w (unique, Arg w ∈ (-π, π])\n\n⚠️ **Key Warning:** Log(zw) = Log z + Log w is NOT always true for the principal value — the argument may wrap around π, causing a discrepancy of 2πi.\n\n**Exercises:**\n1. 🟢 Compute Log(e), Log(i), Log(-1).\n2. 🟡 Find all values of log(-e²).\n3. 🔴 Show Log(z·w) ≠ Log z + Log w with a concrete counterexample.`;
    }
    return `## Complex Functions\n\n**Complex Exponential:** e^z = Σ z^k/k! (converges absolutely for all z ∈ ℂ)\nKey properties: e^z ≠ 0, e^{z+w} = e^z·e^w, e^{-z} = 1/e^z\n\n**Euler's Formula:** e^{ix} = cos x + i sin x *(most important result)*\n\n**Polar Form:** z = |z|·e^{iφ} where φ ∈ (-π, π]\nMultiplication: multiply moduli, add arguments\n\n**Roots:** zⁿ = a has exactly n distinct roots, equally spaced on circle ⁿ√|a|\n\n**Complex Log:** log w = ln|w| + i(arg w + 2πk), multi-valued\nPrincipal: Log w = ln|w| + i·Arg w\n\n⚠️ **Common Mistake:** e^z for complex z does NOT behave like e^x geometrically — e^{ix} traces the unit circle!\n\nAsk me about any specific complex function topic for worked examples!`;
  }

  // Module 4: Taylor Polynomials
  if (t.includes("taylor")) {
    return `## Taylor Polynomials\n\n**Core Idea:** Replace complicated functions (eˣ, sin x, ln x) with polynomials that match them near a point, including slope, curvature, and higher-order behavior.\n\n**Definition:** T_n(x) = Σ_{k=0}^n [f^{(k)}(x₀)/k!]·(x-x₀)^k\n\n| Degree | Matches | Captures |\n|--------|---------|----------|\n| T₁ | f(x₀), f'(x₀) | Slope (tangent) |\n| T₂ | + f''(x₀) | Curvature |\n| T₃ | + f'''(x₀) | Rate of curvature change |\n\n**Why 1/k!:** Differentiating A_n(x-x₀)^n n times gives n!·A_n. Need A_n = f^{(n)}(x₀)/n!.\n\n**Worked Examples:**\n- e^x at 0: T₃ = 1 + x + x²/2 + x³/6\n- sin x at 0: T₃ = x - x³/6 (odd powers only)\n- cos x at 0: T₂ = 1 - x²/2 (even powers only)\n- ln x at 1: T₂ = (x-1) - (x-1)²/2\n\n**Remainder:** R_n(x) = f^{(n+1)}(ξ)/(n+1)! · (x-x₀)^{n+1}\n\n⚠️ **Common Mistakes:** Forgetting 1/k!, using wrong x₀, assuming remainder always small.\n\n**Exercises:**\n1. 🟢 Find T₃ for e^x at 0. Approximate e^{0.1}.\n2. 🟡 Find T₄ for cos x at 0. Bound error at x=0.5.\n3. 🔴 Find T₃ for √x at x₀=4. Estimate √4.1 and bound error.`;
  }

  // Module 5: Power Series
  if (t.includes("power series")) {
    return `## Power Series\n\n**Definition:** Σ_{n=0}^∞ a_n(x-x₀)^n = a₀ + a₁(x-x₀) + a₂(x-x₀)² + ...\n\n**Radius of Convergence:** For any power series, ∃! R ∈ [0,∞]:\n- |x-x₀| < R: converges absolutely\n- |x-x₀| > R: diverges\n- |x-x₀| = R: check separately\n\n**Ratio Test:** If lim |a_{n+1}/a_n| = L, then R = 1/L\n\n**Worked Examples:**\n- Σ xⁿ: L=1, R=1, interval (-1,1)\n- Σ xⁿ/3ⁿ: L=1/3, R=3\n- Σ xⁿ/n!: L=0, R=∞ (converges everywhere)\n\n**Operations (within R):**\n- Differentiate: d/dx Σ a_n(x-x₀)^n = Σ n·a_n(x-x₀)^{n-1}\n- Integrate: ∫ Σ a_n(x-x₀)^n = C + Σ [a_n/(n+1)](x-x₀)^{n+1}\n\n⚠️ **Always check endpoints separately!**\n\n**Exercises:**\n1. 🟢 Find R for Σ n·xⁿ. *(R=1)*\n2. 🟡 Find R and check endpoints for Σ xⁿ/n. *(R=1, converges at x=-1, diverges at x=1)*\n3. 🔴 Find interval for Σ n!(x-2)ⁿ. *(R=0, converges only at x=2)*`;
  }

  // Module 6: Integration
  if (t.includes("integration")) {
    if (q.includes("part") || q.includes("by part")) {
      return `## Integration by Parts\n\n**Formula:** ∫ u·v' dx = u·v - ∫ v·u' dx\n\n**LIATE rule** for choosing u (higher priority first):\n**L**ogarithms > **I**nverse trig > **A**lgebraic > **T**rigonometric > **E**xponential\n\n**Worked Example:** ∫ x·eˣ dx\nu = x (algebraic), v' = eˣ → u' = 1, v = eˣ\n= x·eˣ - ∫ eˣ dx = x·eˣ - eˣ + C = **eˣ(x-1) + C**\n\n**Exercises:**\n1. 🟢 Compute ∫ x cos x dx. *(x sin x + cos x + C)*\n2. 🟡 Compute ∫ ln x dx = ∫ 1·ln x dx. *(x ln x - x + C)*\n3. 🔴 Compute ∫ eˣ sin x dx *(apply by parts twice, solve for integral)*`;
    }
    if (q.includes("substitution") || q.includes("u-sub")) {
      return `## Substitution (Change of Variables)\n\n**Formula:** ∫_a^b f(g(x))g'(x)dx = ∫_{g(a)}^{g(b)} f(u)du\n\n**Worked Example:** ∫ 2x cos(x²) dx\nLet u = x², du = 2x dx\n= ∫ cos u du = sin u + C = **sin(x²) + C**\n\n**Exercises:**\n1. 🟢 ∫ 3x² e^{x³} dx. *(e^{x³} + C)*\n2. 🟡 ∫ x/(x²+1) dx. *(½ ln(x²+1) + C)*\n3. 🔴 ∫₀^{π/2} sin x cos x dx using substitution. *(1/2)*`;
    }
    if (q.includes("partial fraction")) {
      return `## Partial Fraction Decomposition\n\n**When:** Rational functions P(x)/Q(x) where deg(P) < deg(Q) and Q factors.\n\n**Procedure:**\n1. Factor denominator Q(x)\n2. Write P/Q = A/(x-a) + B/(x-b) + ...\n3. Multiply through, solve for A, B, ...\n4. Integrate each term\n\n**Worked Example:** ∫ 1/[(x-1)(x+2)] dx\n1/[(x-1)(x+2)] = A/(x-1) + B/(x+2)\n1 = A(x+2) + B(x-1)\nx=1: 1=3A → A=1/3\nx=-2: 1=-3B → B=-1/3\n∫ = (1/3)ln|x-1| - (1/3)ln|x+2| + C = **(1/3)ln|(x-1)/(x+2)| + C**\n\n**Exercises:**\n1. 🟢 Decompose 3/[(x+1)(x+2)] and integrate.\n2. 🟡 ∫ (x+3)/(x²+x-2) dx.\n3. 🔴 ∫ (x²+1)/[(x-1)(x+1)²] dx *(repeated root)*`;
    }
    if (q.includes("lhôpital") || q.includes("l'hopital") || q.includes("hospital") || q.includes("hopital")) {
      return `## L'Hôpital's Rule\n\n**When:** Only for indeterminate forms **0/0** or **∞/∞**.\n\n**Theorem:** If lim f(x) = lim g(x) = 0 (or both → ∞):\nlim f(x)/g(x) = lim f'(x)/g'(x)\n\n**Worked Examples:**\n- lim_{x→0} sin x/x → 0/0 → cos x/1 = **1** ✅\n- lim_{x→∞} ln x/x → ∞/∞ → (1/x)/1 = **0** ✅\n- lim_{x→0⁺} x·ln x → 0·∞ → rewrite as ln x/(1/x) → (1/x)/(-1/x²) = -x → **0** ✅\n\n⚠️ **Common Mistakes:**\n- Applying when form is NOT 0/0 or ∞/∞\n- Differentiating f(x)/g(x) as quotient (differentiate f and g separately!)\n- Forgetting to apply repeatedly if still indeterminate\n\n**Exercises:**\n1. 🟢 lim_{x→0} (eˣ-1)/x *(=1)*\n2. 🟡 lim_{x→0} (1-cos x)/x² *(=1/2)*\n3. 🔴 lim_{x→0⁺} xˣ *(hint: write as e^{x ln x})*`;
    }
    return `## MA1 Engineering Integration\n\n**Fundamental Theorem of Calculus:**\nPart I: F(x) = ∫_a^x f(t)dt → F'(x) = f(x)\nPart II: If F' = f, then ∫_a^b f(x)dx = F(b) - F(a)\n\n**Key Techniques:**\n1. **Integration by Parts:** ∫ u·v' = u·v - ∫ v·u' (LIATE rule)\n2. **Substitution:** ∫ f(g(x))g'(x)dx = ∫ f(u)du\n3. **Partial Fractions:** Decompose P/Q, integrate each term\n4. **L'Hôpital's Rule:** For 0/0 or ∞/∞ limits\n\nAsk me about any specific integration technique for worked examples!`;
  }

  // General fallback
  return `I'm MathMentor, your expert math tutor! I cover 6 modules:\n\n1. **Multivariable Calculus** — level sets, limits, partial derivatives, gradient, Hessian, tangent planes\n2. **Linear Algebra** — eigenvalues, definiteness, classifying extrema\n3. **Complex Functions** — Euler's formula, polar form, roots in ℂ, complex log\n4. **Taylor Polynomials** — approximations, error bounds\n5. **Power Series** — radius of convergence, operations\n6. **Engineering Integration** — by parts, substitution, partial fractions, L'Hôpital\n\nAsk me about any topic — I'll start with intuition, give the definition, work examples, warn about mistakes, and give you exercises!`;
}

// ── Router ───────────────────────────────────
export const mathTutorRouter = createRouter({
  // Public: ask a math question (uses local knowledge base)
  ask: publicQuery
    .input(z.object({
      question: z.string().min(1).max(2000),
    }))
    .mutation(async ({ input }) => {
      const topic = detectMathTopic(input.question);
      const difficulty = detectDifficulty(input.question);
      const response = generateLocalMathResponse(input.question, topic);
      return {
        response,
        topic,
        difficulty,
        sources: ["Project school Learn — Math Modules 1-6"],
      };
    }),

  // Public: explain a concept at different levels
  explain: publicQuery
    .input(z.object({
      concept: z.string().min(1),
      level: z.enum(["beginner", "intermediate", "advanced"]).default("intermediate"),
    }))
    .mutation(async ({ input }) => {
      const topic = detectMathTopic(input.concept);
      let response = generateLocalMathResponse(input.concept, topic);

      // Adjust based on level
      if (input.level === "beginner") {
        response = "🟢 **Beginner-friendly explanation**\n\n" + response;
      } else if (input.level === "advanced") {
        response = "🔴 **Advanced treatment**\n\n" + response
          .replace(/🟢/g, "🟡")
          .replace(/🟡(?!.*🟡)/s, "🔴");
      }

      return { response, topic, concept: input.concept, level: input.level };
    }),

  // Public: detect what topic a question is about
  detectTopic: publicQuery
    .input(z.object({ question: z.string().min(1) }))
    .query(async ({ input }) => {
      return {
        topic: detectMathTopic(input.question),
        difficulty: detectDifficulty(input.question),
      };
    }),

  // Authenticated: enhanced math tutoring with Kimi AI
  tutor: authedQuery
    .input(z.object({
      message: z.string().min(1).max(4000),
      conversationId: z.number().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const topic = detectMathTopic(input.message);
      const result = await handleTutorMessage({
        userId: ctx.user.id,
        message: input.message,
        conversationId: input.conversationId,
        titlePrefix: `[Math] ${topic}: `,
        systemPrompt: MATH_TUTOR_SYSTEM_PROMPT + `\n\nThe student's question is about: ${topic}. Follow the MathMentor teaching structure: intuition → definition → worked example(s) → common mistakes → exercises.`,
        localFallback: (msg) => generateLocalMathResponse(msg, topic),
        fallbackSuffix: "\n\n*(Kimi API temporarily unavailable — using built-in MathMentor knowledge base)*",
      });
      return { ...result, topic };
    }),

  // Authenticated: generate math problems
  generateProblem: authedQuery
    .input(z.object({
      topic: z.string().min(1),
      difficulty: z.enum(["Easy", "Medium", "Hard"]).default("Medium"),
    }))
    .mutation(async ({ ctx, input }) => {
      const accessToken = await getUserAccessToken(ctx.user.id);
      const detectedTopic = detectMathTopic(input.topic);

      if (accessToken) {
        try {
          const prompt = `Generate a ${input.difficulty} difficulty practice problem about ${detectedTopic}. Include the problem statement only (no solution). Make it a clear, well-posed mathematics problem suitable for university students.`;
          const response = await callKimiChat(accessToken, [
            { role: "system", content: MATH_TUTOR_SYSTEM_PROMPT },
            { role: "user", content: prompt },
          ], { temperature: 0.8, max_tokens: 1500 });
          return { problem: response, topic: detectedTopic, difficulty: input.difficulty };
        } catch {
          // fallback below
        }
      }

      // Local problem generation
      const problems: Record<string, Record<string, string>> = {
        "Module 1": {
          Easy: "Find the level set of f(x,y) = 2x + 3y for c = 6. What shape is it?",
          Medium: "Compute ∂f/∂x and ∂f/∂y for f(x,y) = x²y + sin(xy), then find the directional derivative at (1,2) in direction v = (3/5, 4/5).",
          Hard: "Show that f(x,y) = xy/√(x²+y²) (defined as 0 at origin) is NOT totally differentiable at (0,0) even though partial derivatives exist.",
        },
        "Module 2": {
          Easy: "Find the eigenvalues of A = [[1,2],[0,3]] and their corresponding eigenvectors.",
          Medium: "For f(x,y) = x³ - 3x + y² - 2y, find and classify all critical points using the Hessian.",
          Hard: "Prove that a symmetric matrix A is positive definite if and only if all its leading principal minors are positive (Sylvester's Criterion).",
        },
        "Module 3": {
          Easy: "Express z = 1 + i in polar form, then compute z⁶ using De Moivre's theorem.",
          Medium: "Use Euler's formula to prove cos(3θ) = 4cos³θ - 3cosθ.",
          Hard: "Find all values of log(i^i) and determine which is the principal value.",
        },
        "Module 4": {
          Easy: "Find T₃(x) for f(x) = eˣ at x₀ = 0 and use it to approximate e^0.1.",
          Medium: "Find the Taylor polynomial T₄ for f(x) = cos(x) at x₀ = 0 and bound the error at x = 0.5.",
          Hard: "Prove that the Taylor series for f(x) = ln(1+x) converges to f(x) for all x ∈ (-1,1] using the Lagrange remainder.",
        },
        "Module 5": {
          Easy: "Find the radius of convergence for Σ n·xⁿ. Check the endpoints.",
          Medium: "Use the power series for 1/(1-x) = Σ xⁿ to find the series for 1/(1-x)² by differentiation.",
          Hard: "Prove that if a power series Σ aₙxⁿ converges at x = R, then it converges uniformly on [0,R].",
        },
        "Module 6": {
          Easy: "Compute ∫ x·cos(x) dx using integration by parts.",
          Medium: "Evaluate ∫ (x+3)/(x²+x-2) dx using partial fraction decomposition.",
          Hard: "Prove that ∫₀^∞ e^{-x²} dx = √π/2 using the technique of squaring the integral and converting to polar coordinates.",
        },
      };

      const modKey = Object.keys(problems).find(k => detectedTopic.includes(k.replace("Module ",""))) || "Module 1";
      const problem = problems[modKey]?.[input.difficulty]
        || `Generate a ${input.difficulty} problem about ${detectedTopic}.`;

      return { problem, topic: detectedTopic, difficulty: input.difficulty };
    }),
});
