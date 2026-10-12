# COGNITIA — TOTAL VISUAL REBUILD
## Art-direct a jaw-dropping, award-level interactive learning environment

I am not asking for a cleaner UI. I want a **wow effect**. When a student opens Cognitia, they should stop and say "how is this a university course site?" Think Awwwards / FWA / Codrops quality, applied to a serious scientific learning tool.

---

# 0. RULES OF ENGAGEMENT (READ FIRST)

**Time and effort**
- I do not mind how long you take. Take hours if needed. Do not rush, do not cut scope to finish sooner, and do not stop at the first version that works.
- Work in phases. After each phase, run the app, look at it, find what is weak, and redo it. Plan for at least three full refinement passes.
- If you hit a limit and must stop, leave a written status in `DESIGN.md` listing what is done, what is half-done, and what is next.

**Performance**
- I do not care if it is heavy. Visual impact matters more than bundle size or load time. WebGL, shaders, particle systems, 3D, large animation libraries and a preloader are all welcome.
- Still protect these three things: (1) simulators must never stutter while stepping, (2) text must stay readable, (3) the app must not crash on a normal laptop. Add graceful fallback when WebGL is unavailable and respect `prefers-reduced-motion`.

**Correctness**
- Spectacle must never change algorithm behavior. Algorithm logic stays untouched and separate from rendering. Preserve all routes, lessons, simulators, search, glossary, exam engine, progress tracking, persistence, academic references, and accessibility.

**Git workflow**
- Follow the company-style flow: create an issue, work on a feature branch, test, open a pull request into `dev`. One branch per major area (design system, dashboard, lessons, Romania simulator, other simulators, timeline, practice, navigation/search).

**Honesty**
- If you cannot browse, install a package, or run a screenshot tool, say so. Never claim you inspected something you did not.

---

# 1. WHAT COGNITIA IS

Interactive learning platform for Intelligent Systems at Universidad de Castilla-La Mancha. Topics: foundations and history of AI; uninformed search (BFS, UCS, DFS, DLS, IDS); informed search (Greedy, A*); heuristics, admissibility, consistency, optimality proofs, effective branching factor; simulators (Romania route search, 8-puzzle, vacuum world, missionaries and cannibals, water jugs, 8-queens, pancake sorting); math explanations, exam exercises, glossary, progress tracking.

It is an application students use for hours, not a landing page. But it can and should have moments of real spectacle: arrival, transitions, simulators, achievements.

---

# 2. ART DIRECTION: "THE LIVING LABORATORY"

**Concept:** a scientific journal, an archival atlas of AI, and a computational instrument panel fused into one living world. Dark, precise, luminous, tactile, and always slightly in motion, as if the interface is thinking.

Signature ideas to explore (pick, combine, or invent better ones):
- **A persistent living background** (WebGL): a slowly evolving search-space field. Nodes and edges that faintly expand like BFS or A* waves, responding to cursor position and scroll. It changes mood per section (calmer in lessons, more energetic in simulators).
- **A pinned, scroll-choreographed intro** where the camera moves through a 3D graph that resolves into the Cognitia mark.
- **Custom magnetic cursor** with context states (over a node, over a button, over a formula, over a draggable item).
- **Instrument-style controls**: buttons that feel like physical hardware (see section 6).
- **Typographic drama**: oversized, tightly set display type for chapter openings; quiet, readable text for the actual reading.
- **Material details**: film grain, fine grid/graph-paper lines, engraved hairlines, subtle scanlines, tick marks like measuring instruments, registration marks, coordinate readouts in the corners.

The design must be recognizable with the logo and name removed.

Do not copy any site. Study references for principles and build an original language.

---

# 3. RESEARCH PHASE (MANDATORY, DO NOT SKIP)

Before writing code: audit the repo (routes, components, tokens, dependencies, assets, current screens). Then research.

**Search Reddit** (r/reactjs, r/webdev, r/threejs, r/creativecoding, r/web_design, r/Frontend, r/learnprogramming) for:
- "best animated React component libraries"
- "awwwards style React site stack"
- "GSAP vs Framer Motion", "Lenis smooth scroll", "react three fiber shaders background"
- "algorithm visualizer UI design"
Read the actual threads and their comments, and note what experienced developers warn about (performance traps, license changes, accessibility issues).

**Search GitHub** for similar projects and read their code and READMEs:
- Algorithm and pathfinding visualizers in React (A*, BFS, Dijkstra).
- Awwwards-style portfolios built on React + GSAP + Lenis + React Three Fiber.
- Interactive textbooks and educational platforms.
Extract concrete techniques, not just names. Record findings (with links) in `DESIGN.md` under "Research".

**Check licenses and install requirements** of every library before using it.

## Starting shortlist (from my own research; verify, then decide)

**Component libraries (copy-paste, shadcn-style)**
- **React Bits** (reactbits.dev): 110+ animated components, animated backgrounds, text effects, cursor effects, high customization. Ships in JS/TS and CSS/Tailwind variants, installs via shadcn CLI or jsrepo, and includes reduced-motion handling in many components.
- **Aceternity UI**: dramatic, dark, cinematic effects: spotlights, 3D cards, parallax, animated backgrounds, bento grids. Built on Tailwind + Framer Motion. Use only the free components unless I approve otherwise.
- **Magic UI**: animated beams, orbiting elements, animated lists, shimmer, marquee, number tickers, polished micro-effects. Excellent for connecting nodes visually.
- **shadcn/ui** (+ Radix primitives): accessible foundation for dialogs, command palette, tabs, tooltips, sliders.
- Also evaluate: **Cult UI**, **Kokonut UI**, **Animate UI**, **Motion Primitives**, **21st.dev** community components.

**Motion and scroll**
- **Motion** (Framer Motion) for React state-driven transitions and layout animation.
- **GSAP + ScrollTrigger** for timelines, pinned scroll sequences, and anything choreographed. Verify current license terms.
- **Lenis** for smooth, momentum scrolling, synced to the GSAP ticker.

**3D and shaders**
- **Three.js + @react-three/fiber + @react-three/drei + @react-three/postprocessing** (bloom, chromatic aberration, noise, vignette).
- Custom **GLSL shaders** (domain-warped noise, aurora fields, graph-wave effects). Many strong portfolios do this by hand with no shader library.
- **Leva** for live tuning of parameters while designing.

**Visualization and diagrams**
- **D3** (force layouts, scales, paths) and **visx** for custom data graphics.
- **React Flow (xyflow)** for draggable graph or tree views where appropriate.
- Custom SVG for the Romania map and puzzles. Also **haikei.app** for background shapes.

**Effects and feedback**
- **canvas-confetti** or **tsparticles** for restrained celebration on correct answers and milestones.
- **Rive** or **Lottie** for small, polished animated icons, if justified.

**Icons and type**
- **Phosphor** (multiple weights, great for a duotone/bold system) or **Iconoir**. Pick one family and stay with it. No emoji as icons.
- Fonts from Google Fonts: choose a coherent set, for example a characterful display face for headings, a highly readable text face, an editorial serif for history and quotations, and JetBrains Mono or IBM Plex Mono for traces, formulas, and identifiers.

**Inspiration**: dqnamo.com/kitchen, 21st.dev, reactbits.dev, ui.aceternity.com, magicui.design, Awwwards, Codrops.

## Lessons already found in other people's projects (use them)
1. **Do not drive animation through React state every frame.** Strong GSAP/WebGL portfolios write directly to DOM styles or shader uniforms in the animation callback, which avoids a full React render per frame.
2. **One shared WebGL canvas, not one per element.** Mounting a new WebGL context per title or card is a known performance disaster. Use a single persistent canvas and drive it from the DOM.
3. **One animation clock.** Sync Lenis, GSAP ScrollTrigger, and the R3F render loop on a single ticker.
4. **Keep the algorithm engine as pure, testable functions** (BFS, DFS, A* and others), with React only rendering their step output. This is how the better visualizer projects stay correct and animatable.
5. **Step controls need history.** The best educational visualizers offer play, pause, step forward, step backward, speed control, and a live pseudocode viewer with the current line highlighted.
6. **Teach the failure cases.** One visualizer explicitly shows "why this input breaks the algorithm." Do the same: DFS looping, Greedy being suboptimal, an inadmissible heuristic breaking A*.
7. **Side-by-side comparison** of two algorithms on the same problem is both educational and visually striking.
8. **Hybrid rendering** (normal DOM + WebGL layer) with graceful degradation is the standard pattern for immersive but usable sites.
9. **Bento-style grids with neighbor-aware hover effects**, preloaders, and magnetic cursors are the recurring "Awwwards" signals. Use them, but make them meaningful for learning.

---

# 4. COLOR (STARTING POINT, REFINE FREELY)

Dark, ink-and-graphite, luminous accents.

| Token | Value |
|---|---|
| bg-primary | `#080B11` |
| bg-secondary | `#0D121A` |
| surface | `#121A24` |
| surface-raised | `#192330` |
| text-primary | `#F0F2F5` |
| text-secondary | `#A0ADBD` |
| border-subtle | `#293545` |
| accent-lime (active, progress, key algorithm events) | `#C6F277` |
| accent-cyan (information, navigation, selected data) | `#78D5E8` |
| accent-amber (warnings, discoveries, emphasis) | `#E9B777` |

- You are allowed to be bolder than a muted palette: glowing gradients, light bloom, aurora fields, and luminous edges are welcome when they carry meaning (for example, the frontier glowing as it grows).
- Keep color semantic: lime = active/expanding, cyan = information/frontier, amber = goal/warning/discovery. Define everything as design tokens (CSS variables + Tailwind theme) so the palette can change in one place.
- Consider a warm-paper material for the history timeline, quotations, and historical documents as a deliberate contrast, not a separate theme.
- Verify text contrast (WCAG AA) everywhere.

---

# 5. TYPOGRAPHY

No default Inter-everywhere. Build a deliberate system: display, text, serif/editorial, mono. Define the scale, line length (about 60 to 75 characters for reading), heading hierarchy, and a proper math treatment (KaTeX or equivalent, consistent sizing, highlighted terms inside formulas). Mono is for traces, identifiers, complexity notation, and code, not ordinary prose.

Display type may be huge and animated (split-text reveals, variable-font weight shifts on hover, scramble/decode effects on headings). Reading text stays calm.

---

# 6. BUTTONS AND CONTROLS: NOT SIMPLE

No plain rectangles with a color change. Every primary control should feel designed, and each family should be distinct but related.

Ideas to explore:
- **Magnetic buttons** that lean toward the cursor, with a spring return.
- **Tactile hardware buttons**: pressed-in depth, travel distance, a small LED indicator that lights when active, an optional click sound (muted by default, toggleable).
- **Fill-sweep and clip-path reveal** hover states, text that rolls or splits on hover.
- **Segmented instrument switches and rotary/slider dials** for algorithm choice and speed, with detents and tick marks.
- **A transport bar** for simulators (step back, play/pause, step forward, speed dial, reset) styled like lab equipment, with a scrubbable timeline of execution steps.
- **Algorithm picker as a "selector wheel" or animated tab strip** with a sliding highlight (shared-layout animation).
- **Ripple, shimmer-border, or beam effects** on key calls to action, used sparingly.
- Distinct states for rest, hover, focus-visible, pressed, active, loading, disabled.

All controls must be keyboard-operable with visible focus.

---

# 7. DESIGN EACH EXPERIENCE FOR ITS PURPOSE

Use a family of layouts. Never reuse one template everywhere.

## A. Arrival and dashboard
- A cinematic entrance: preloader, then the living background resolving into the dashboard. Short enough to skip, and shown once per session.
- A study "mission control" with a strong typographic hierarchy, a visual map of the course (nodes for lessons that light up as completed, with connecting paths), and a prominent, distinctive "next recommended step" treatment.
- Animated counters and progress rings. No wall of identical cards.

## B. Lesson reading
- A beautiful interactive textbook: editorial reading column, sticky contextual table of contents with scroll-spy, margin notes, large chapter openers.
- Differentiated blocks for definitions, theorems, proofs, worked examples, warnings, and common confusions. Not every paragraph in a box.
- Subtle scroll-linked reveals that never hinder reading. Inline mini-diagrams that animate when scrolled into view.
- Lesson markdown must render properly (no raw `*`, `**`, `#`). Replace ASCII-art diagrams with proper CSS/TSX/SVG diagrams.

## C. Algorithm simulators (the centerpiece, the biggest wow)
Treat each as an interactive scientific instrument.

**Romania route search**
- A custom, richly rendered map/graph with glow, depth, and animated edges.
- Distinct node states: unexplored, frontier, expanded, goal, current. Animated expansion waves, and a route that draws itself and pulses when found.
- Edge-cost labels, and live g(n), h(n), f(n) readouts that tick smoothly.
- A frontier / priority-queue inspector where items reorder with layout animation as the algorithm runs.
- Execution trace that explains what happened and why, in plain language plus notation. Live pseudocode with line highlighting.
- Transport controls, algorithm selector, speed dial, step-back, and side-by-side comparison mode.
- Optional 3D or pseudo-3D camera moves that follow the expansion.

**8-puzzle**: physical-feeling sliding tiles with weight and spring, a heuristic overlay (Manhattan distance arrows), and a search-tree minimap.
**Vacuum world**: animated agent with a trail, dust particles, a state-space graph beside it.
**Water jugs**: liquid simulation with believable fill and pour motion and a state-transition diagram.
**Missionaries and cannibals**: animated boat crossing and a state graph.
**8-queens**: board with attack-line visualization and conflict heat.
**Pancake sorting**: stack with flip animations and cost counters.

Each simulator gets its own visual treatment. They share a design language but not a layout.

## D. Proofs and formulas
- Step-by-step proof states that reveal progressively, with highlighted inequalities, annotations, and connectors between assumptions and conclusions.
- For A* optimality: a visual number line or diagram showing f(n) ≤ C* < f(G₂) so the argument is understandable at a glance.
- Not decorative cards. Precision first.

## E. History of AI timeline
- A custom chronological experience: horizontal or scroll-pinned timeline, eras as distinct visual chapters, dramatic date typography, parallax layers, the warm-paper material, and clear distinction between event types (breakthrough, winter, theory, system).
- Not a vertical list of identical cards.

## F. Practice and exams
- Clear distinct states: unanswered, selected, correct, incorrect, explained.
- Satisfying but tasteful feedback: a precise animation and a small confetti or glow on correct answers, calm explanatory reveal on mistakes, a progress trace across the exam. No noisy gamification.

## G. Navigation and search
- A precise, deliberate navigation system with a strong "you are here" identity (lesson, section, scroll position).
- A global command palette (Cmd/Ctrl+K) with instant results, keyboard navigation, grouped results, and highlighted matches.
- SVG icons from one family only.

---

# 8. MOTION PHILOSOPHY

Be ambitious, but make motion explain cause and effect, especially in the simulators.
- Page and route transitions that feel directed (shared elements, wipes, or clip-path reveals).
- Scroll choreography with Lenis + GSAP ScrollTrigger.
- Cursor-reactive fields and magnetic elements.
- Smooth number and progress updates.
- Always provide a reduced-motion alternative and a toggle for "calm mode" that disables heavy effects for long study sessions. Heavy visuals may be the default, but long reading must remain comfortable.

---

# 9. AVOID LAZY DEFAULTS

Do not ship: a centered hero plus three identical cards, the same rounded rectangle around everything, purple-to-blue gradients, random blobs or floating particles with no meaning, glassmorphism everywhere, glowing borders on everything, emoji icons, generic stock illustrations, endless badges and pills, identical layouts for every lesson, or animation that gets in the way of reading or operating controls.

Spectacle is welcome. **Meaningless** spectacle is not. Every effect must either explain something, orient the user, or deliver a deliberate emotional beat.

---

# 10. PHASES

1. **Audit**: repo, components, tokens, weak areas, constraints.
2. **Research**: Reddit, GitHub, docs, licenses (section 3). Log findings in `DESIGN.md`.
3. **Art direction**: tokens, type, icons, materials, motion rules, written into `DESIGN.md`.
4. **Visual exploration**: build at least three genuinely different direction prototypes for one screen (for example the Romania simulator or the dashboard). Compare them honestly and choose.
5. **Implementation**: design system first, then the dashboard, one lesson, and the Romania simulator to full quality, then roll the same language across everything else.
6. **Visual QA**: run the real app, take screenshots at desktop and mobile sizes, list the three weakest things you see, fix them, and repeat at least three times.
7. **Regression checks**: build, type check, tests, and interaction checks for routes, simulators, search, glossary, exams, and progress persistence.

---

# 11. DEFINITION OF DONE

- Would someone stop scrolling and say "wow" in the first five seconds?
- Is there a recognizable identity with the name hidden?
- Do the simulators feel like instruments, and are they more informative than a static diagram?
- Are the buttons memorable and still accessible?
- Is reading still comfortable, and does calm mode work?
- Do all icons, colors, motion, and components belong to one language?
- Did you inspect real screenshots and correct them?
- Does everything still work, with algorithm correctness unchanged?

If it still looks like a template that could belong to any university app, it is not finished. Keep going.

---

# FINAL INSTRUCTION

Take creative responsibility. Make bold decisions. Do not ask me to choose colors, components, or layouts. Research, experiment, build, look at the result, and improve it. There is no time limit. Spend as long as it takes to make Cognitia genuinely exceptional.

Begin with the audit and your research findings, present your proposed art direction, then implement it.
