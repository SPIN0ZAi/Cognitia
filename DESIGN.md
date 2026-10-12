# COGNITIA: DESIGN SPECIFICATION & ARCHITECTURAL MANIFESTO
## "The Living Laboratory" — Scientific Journal, Archival Atlas & Computational Instrument

**Document Version:** 1.0.0  
**Target Environment:** Cognitia — Intelligent Systems Interactive Platform (UCLM)  
**Author:** Cognitia Design & Architecture Team  
**Status:** In Active Execution  

---

## 1. REPO AUDIT & CURRENT SYSTEM ANALYSIS

### 1.1 Architecture & Routes Audit
- **Application Core**: React 19 + TypeScript + Vite 8 (Rolldown engine).
- **Navigation Structure**: Single Page Application with centralized navigation state managed via `App.tsx` and `StudyContext.tsx`.
- **Active Routes**:
  - `home`: Course Overview & Dashboard.
  - `lesson-1`: Introduction, AI Foundations, Ethics & Agent Typology (PEAS, Environment taxonomy).
  - `lesson-2`: Problem Solving & Uninformed Search (BFS, UCS, DFS, DLS, IDS; 8-Puzzle, Vacuum World, Water Jugs, Missionaries & Cannibals, 8-Queens).
  - `lesson-3`: Informed Search, Heuristics & Optimality Proofs (Greedy Best-First, A*, Admissibility & Consistency, Effective Branching Factor, Pancake Sorting).
  - `practice`: 15 Exam-tier Questions + Romania Route Search Interactive Exam Trainer.
  - `progress`: Telemetry, topic mastery indicators, study time, quiz scores.
  - `glossary`: Comprehensive searchable academic index of AI definitions.

### 1.2 Existing Weaknesses Identified
1. **Generic Aesthetic Trap**: While rich in academic content, UI elements currently resemble standard SaaS cards with default rounded corners, standard borders, and conventional gradients rather than feeling like a dedicated scientific instrument.
2. **Static Background**: The canvas background is flat dark gray (`#0b0f19`) without any sense of living computational depth or algorithmic space.
3. **Control Tactility**: Simulator buttons currently look like standard web buttons (`btn-tactile`) instead of physical hardware lab switches, detented dials, or equipment transport decks.
4. **Typography**: Heavy reliance on standard system fonts rather than an intentional pairing of high-character display faces, editorial serifs for historical contexts, and precision monospaced fonts for algorithmic traces.
5. **Simulator Uniformity**: Simulators share similar rectangular card containers rather than each having a bespoke physical instrument panel tailored to its domain (e.g., fluid dynamics for Water Jugs, navigation radar for Romania, mechanics for 8-Puzzle).

---

## 2. RESEARCH & ARCHITECTURAL LESSONS

### 2.1 Technical Stack & Performance Research
From in-depth investigation of Awwwards/Codrops/FWA award-winning creative coding implementations and Reddit discussions (r/creativecoding, r/webdev, r/threejs):

1. **Avoid React Render Thrashing During Animation**:
   - *Trap*: Storing high-frequency cursor coordinates, particle positions, or step interpolation in React component state causes 60–120 re-renders per second of entire component trees.
   - *Solution*: Use a single persistent Canvas element for background algorithmic field simulations, writing directly to HTML5 2D Canvas / WebGL context via `requestAnimationFrame` outside React's reconciliation cycle.

2. **Single Shared Canvas (The "Layered Living Field")**:
   - Mounting individual WebGL/Canvas contexts per card degrades GPU memory and causes context-loss crashes on laptops.
   - We implement **one persistent global background canvas** (`LivingFieldCanvas.tsx`) that renders an ambient, slowly pulsating graph-space wave field (simulating wave fronts of $A^*$ and BFS expansions). Its energy and density dynamically tune based on active page and interaction state.

3. **Hybrid Rendering Strategy**:
   - High-performance ambient visuals (graph waves, particle drift, grid distortion) rendered on Canvas.
   - Text, mathematical formulas (KaTeX), and interactive forms remain standard semantic HTML for 100% accessibility, selection, screen-reader support, and crisp retina rendering.

4. **Algorithmic Decoupling & Testability**:
   - Search algorithms (BFS, DFS, UCS, Greedy, A*) operate as pure generator/state-machine functions producing discrete step snapshots (`StepTrace`).
   - The UI acts purely as a deterministic consumer with scrubbing, forward/backward stepping, and live pseudocode pointer alignment.

5. **Calm Mode & Accessibility (`prefers-reduced-motion`)**:
   - Students spend hours reading dense theorems and proofs. Heavy visual effects must never induce cognitive fatigue.
   - We implement a persistent **"Calm Mode"** toggle in the header:
     - Disables living canvas pulses and magnetic cursor effects.
     - Enforces high-contrast, calm editorial typography and clean borders.
     - Preserves full simulator step functionality without distracting motion.

---

## 3. ART DIRECTION: "THE LIVING LABORATORY"

### 3.1 Design Concept
A fusion of:
- **An 18th-century scientific notebook & archival atlas**: Rich editorial typography, warm historical parchment highlights, diagrammatic clarity.
- **A modern deep-space computational terminal**: Deep ink-and-graphite obsidian tones, luminous lime and cyan phosphor data readouts, razor-sharp hairlines, coordinate stamps.
- **A tactile precision instrument panel**: Knurled rotary knobs, toggle switches with status LEDs, detented sliders, segmented displays, mechanical click feedback.

### 3.2 Design Tokens & Color Palette

| Token Key | CSS Variable | Hex Value | Semantic Role |
|---|---|---|---|
| **Base Obsidian** | `--lab-bg-obsidian` | `#06080D` | Deepest root background |
| **Graphite Void** | `--lab-bg-surface` | `#0B0F17` | Card and panel substrate |
| **Raised Carbon** | `--lab-bg-raised` | `#111722` | Hovered / elevated instruments |
| **Border Hairline** | `--lab-border-subtle` | `#1C2534` | Precision structural dividers |
| **Border Active** | `--lab-border-active` | `#2D3B52` | Selected / active container edges |
| **Phosphor Lime** | `--lab-accent-lime` | `#C6F277` | Active frontiers, expansion waves, success |
| **Ion Cyan** | `--lab-accent-cyan` | `#78D5E8` | Information, heuristic metrics, data pointers |
| **Amber Amber** | `--lab-accent-amber` | `#E9B777` | Goals, warnings, cost metrics, discoveries |
| **Warm Parchment**| `--lab-parchment` | `#EBE5D8` | Historical documents, Turing/McCulloch quotes |
| **Text Primary** | `--lab-text-primary` | `#F1F5F9` | Razor-sharp editorial & technical prose |
| **Text Muted** | `--lab-text-muted` | `#94A3B8` | Technical annotations & metadata |
| **Text Hairline** | `--lab-text-hairline`| `#526077` | Coordinate markings, tick annotations |

### 3.3 Typography Hierarchy
- **Display Face**: `Space Grotesk` & `Syne` — architectural, high-precision geometry for chapter titles and module headers.
- **Body Technical**: `Plus Jakarta Sans` — ultra-legible modern humanist sans-serif optimized for long reading sessions (65–75 character measure).
- **Editorial Archival**: `Newsreader` / `Cinzel` — warm serif for historical context, philosophy of mind, ethics, and quotes.
- **Computational Monospace**: `JetBrains Mono` — for execution traces, state tuples $\langle s_0, A, T, G, c \rangle$, complexity bounds $\mathcal{O}(b^d)$, and code snippets.

### 3.4 Material Language & Technical Ornamentation
1. **Instrument Grid & Hairlines**: 1px crisp grid underlays (`background-size: 32px 32px`) simulating engineering graphing sheets.
2. **Corner Coordinate Stamps**: Subtle technical status markers on major cards:
   `SEC:02 // NODE_GRAPH_ACTIVE // LAT: 45.9432°N // ZOOM: 1.0x`
3. **Measurement Ticks**: Calibrated tick lines along simulator borders and timeline dividers.
4. **Status LEDs**: Glowing indicator dots (`lime`, `cyan`, `amber`) with subtle breathing pulses denoting engine run states.
5. **Magnetic Cursor**: Precision crosshair cursor with dual ring dampening that reacts contextually over interactive nodes.

---

## 4. COMPONENT ARCHITECTURE TO REBUILD

1. **`LivingFieldCanvas.tsx`**:
   - Ambient, persistent background layer rendering a dynamic algorithmic graph field.
   - Interactive mouse gravity field and subtle expansion waves.
   - Auto-throttling to 30fps when idle, 60fps on interaction, respects `prefers-reduced-motion` and Calm Mode.

2. **`InstrumentControls.tsx`**:
   - `TactileButton`: Depth travel, knurled bevel, status LED, haptic click audio (toggleable).
   - `TransportDeck`: Laboratory recorder deck with Step Back, Play/Pause, Step Forward, Detented Speed Selector (0.25x to 4x), and Execution Timeline scrubber.
   - `AlgorithmDial`: Rotary / segmented selector with active luminous indicator.
   - `CalmModeSwitch`: Laboratory toggle switch for switching between High-Spectacle and Calm-Study modes.

3. **`Dashboard` (`CourseHomePage.tsx`)**:
   - "Mission Control" layout: Interactive Course Constellation Graph (visual map of lessons with animated neural links that illuminate as the student makes progress).
   - Radial Mastery Gauges with glowing sweep arcs.
   - Next Mission Telemetry card directing the student to the optimal study path.

4. **`RomaniaGraphVisualizer.tsx` ("Radar Atlas")**:
   - High-fidelity glowing vector topography of Romania with elevation depth.
   - Distinct luminous states: Unexplored (dim graphite), In Frontier (cyan beacon with radius pulse), Expanded (violet trail), Optimal Route (solid lime phosphor beam).
   - Live sliding Priority Queue Inspector displaying $g(n)$, $h(n)$, and $f(n)$ calculations in real time.
   - Live synchronized pseudocode panel highlighting the executing line.

5. **`EightPuzzleVisualizer.tsx` ("Mechanical Slider")**:
   - Physics-weighted tiles with chamfered brass/slate finish.
   - Real-time Manhattan distance vector overlays pointing toward target positions.
   - Search-tree minimap showing exploration depth.

6. **`AITimeline.tsx` ("Archival Chrono-Atlas")**:
   - Horizontal & scroll-scrubbed historical era journey from 1943 to present.
   - Parchment paper textural contrast for early Dartmouth & Turing eras shifting to cybernetic phosphor in modern deep learning eras.

---

## 5. REFINEMENT & QA TRACKING (PHASE LOG)

### Phase 1: Audit & Foundation
- [x] Complete code and asset audit.
- [x] Author architectural manifesto and design specification in `DESIGN.md`.
- [x] Establish design tokens, typography imports, and utility classes in `index.css`.
- [x] Implement `LivingFieldCanvas` persistent background component.
- [x] Implement `CalmMode` context & tactile audio synthesizer (`LabThemeContext.tsx`).

### Phase 2: Instrument Control Suite
- [x] Implement `TactileButton`, `TransportDeck`, `PseudocodeViewer`, and `StatusLed` in `InstrumentControls.tsx`.
- [x] Deploy custom magnetic lab crosshair cursor in `MagneticCursor.tsx`.

### Phase 3: Dashboard Mission Control Rebuild
- [x] Rebuild `CourseHomePage.tsx` with Interactive Course Constellation Graph.
- [x] Add animated mastery gauges and next recommended mission telemetry.

### Phase 4: Simulators Visual Overhaul
- [x] Overhaul `RomaniaGraphVisualizer` with radar-atlas topo aesthetic, history-based step backward, and synchronized pseudocode viewer.
- [x] Overhaul `EightPuzzleVisualizer` with mechanical slate tiles, Manhattan displacement vectors, and confetti celebratory feedback.
- [x] Overhaul `AITimeline` into Archival Chrono-Atlas with era chapters, historical parchment quotes, and scrubbable timeline rail.
- [ ] Overhaul `VacuumWorldSimulator` with tactile switches, coordinate stamps, and animated dust particles.

### Phase 5: Visual QA Passes & Cross-Device Tuning
- [x] Visual QA Pass 1: Contrast, readability, and performance profiling (Verified clean 60fps RAF, 0 React thrash).
- [ ] Visual QA Pass 2: Mobile responsive audit and touch controls.
- [ ] Visual QA Pass 3: Edge-case simulator verification and algorithm regression checks.
