# COGNITIA — MAJOR UPDATE: "LEARN & PLAY" + PERSISTENT PROGRESS

This is an addition to the visual redesign prompt. Same rules apply: take as long as you need, I do not mind how heavy it is, wow effect matters, and nothing that already works may break. Follow the issue → feature branch → test → pull request into `dev` workflow, one branch per feature.

There are two features:

1. **A playable maze-chase game ("Learn & Play") that teaches the course by playing.**
2. **Persistent progress, so a returning student sees how much of the course they have done.**

---

# PART 1 — LEARN & PLAY: A MAZE-CHASE GAME THAT TEACHES SEARCH

## 1.1 The idea

A section of Cognitia aimed at gamers. Headline direction: **"Learn. Play. Outsmart the algorithm."**

The classic maze-chase genre is a perfect fit for the course: a maze is a graph, the player is an agent, and the enemies are **search algorithms hunting the player in real time**. Students do not read that BFS expands in layers and A* uses a heuristic. They watch a ghost do it, then try to beat it.

## 1.2 Decision on the source code (read carefully)

I suggested https://github.com/DillonDepeel/Pacman-Source-Code. I checked it: it is **6502 assembly for the Atari version** (`PAC1.ASM`, `PACMAN.ASM`, `PACDAT*.ASM`, ...). It cannot run in a browser and cannot be dropped into a React app. **Do not port it.** It is useful only as optional historical reading for an "origins" panel.

Also, Pac-Man's name, characters, and sprites are Bandai Namco trademarks and copyrights. This is a public university site. So:

- **Build an original game engine from scratch in TypeScript.** Do not copy any repository's code, sprites, or audio.
- **Use original characters, art, names, and sounds.** Make a Pac-Man-style game, not Pac-Man. Suggested working name: **"Cognitia Chase"** or **"Maze Agents"**. The player is an original character (for example a glowing probe or a small agent), and the enemies are the algorithms themselves (see 1.4).
- For reference only (read, learn the structure, do not copy), check licenses before looking:
  - `BaseMax/react-game-pacman`: React 19 + TypeScript + Canvas, MIT licensed. The closest match to our stack. Its README describes four ghosts with different targeting strategies and a start/playing/game-over/win state machine.
  - `platzhersch/pacman-canvas` is CC BY-SA 4.0, which is share-alike. **Do not use or copy it**, to avoid license obligations on our code.
- Research more yourself (GitHub, Reddit r/gamedev, r/javascript, r/reactjs) for good approaches to tile-based movement, fixed-timestep loops, and mobile controls, and record findings and links in `DESIGN.md`.

## 1.3 Technical requirements

- **100% client-side.** No server, no backend, no API calls. It must work offline once loaded.
- **Engine and renderer must be separate.** The game logic (maze graph, movement, collisions, ghost AI, scoring, state machine) is pure TypeScript with no React or DOM dependency, so it is testable and deterministic. React/Canvas only renders state. This mirrors the existing rule that algorithm logic stays separate from visuals.
- **Reuse the course's real search code.** The ghost pathfinding must call the same BFS / UCS / DFS / Greedy / A* implementations the simulators use (or a shared module), so the game is a true demonstration and not a fake. If the simulators' implementations are tied to the Romania graph, refactor them into a generic `Graph` search module without changing their behavior, and prove it with tests.
- **Rendering:** HTML5 Canvas 2D (or PixiJS / Three.js if justified) with `requestAnimationFrame` and a **fixed-timestep update loop** (decoupled from frame rate), so the game feels identical at 60 Hz and 144 Hz.
- **Seeded randomness** so levels and replays are reproducible.
- **Controls:** arrow keys and WASD; swipe and an on-screen D-pad on mobile; pause on `Esc`; auto-pause when the tab loses focus. Do not let arrow keys scroll the page while playing.
- **Audio:** synthesize all sound with the Web Audio API (original, tiny, no audio files). Muted by default with a clear toggle.
- **Accessibility:** keyboard-playable, a "slow mode" speed slider, colorblind-safe ghost/state coding (shapes and patterns, not only color), reduced-motion respected, and a non-game path to the same learning content.
- **Performance:** it may be heavy and flashy, but the game loop must hold a steady frame rate. Keep per-frame allocations low.

## 1.4 The educational design (this is what makes it special)

**Each enemy is a different search algorithm**, with its own color, shape, and personality:

| Enemy | Algorithm | What it teaches |
|---|---|---|
| The Wave | BFS | Expands in layers, always finds the shortest path in steps |
| The Miser | UCS / Dijkstra | Cost-aware: the maze has weighted tiles (mud, ice) |
| The Plunger | DFS | Dives deep, takes long winding paths, can be fooled; not optimal |
| The Gambler | Greedy Best-First | Fast and eager, follows h(n) only, gets trapped by dead ends |
| The Strategist | A* | Balances g(n) + h(n); optimal when h is admissible |

**X-Ray mode (the signature feature):** a toggle that overlays the selected enemy's live search on the maze: the frontier glowing, expanded tiles fading in behind it, the planned path drawn as a line, and a small HUD with `g(n)`, `h(n)`, `f(n)`, nodes expanded, and path cost. The student sees why the enemy chose that route, in real time.

**Game modes:**

1. **Campaign: "Learn & Play".** Levels map to course lessons. Level 1 introduces one enemy (BFS). Each new level adds an algorithm and a new idea (weighted tiles, dead ends, heuristics). Before or after a level, a short **interactive micro-lesson** explains what the player just experienced, and a **1 to 3 question quiz** gates progress. Completing levels and quizzes marks the matching course sections as done in the progress system (Part 2).
2. **Ghost Lab (sandbox).** Pick an algorithm for an enemy, place walls, set start and goal, and compare two algorithms side by side on the same maze: nodes expanded, path length, time. Include **heuristic experiments**: swap Manhattan for Euclidean, then for an **inadmissible** heuristic (for example 3 × Manhattan) and watch A* return a non-optimal path. This directly supports the admissibility and optimality lessons.
3. **Be the Agent.** Reverse the roles: the student must find the shortest path to a goal themselves, then the game reveals what BFS / A* found, scores the student's path cost against the optimum, and shows how many nodes the algorithm needed.
4. **Survival / arcade.** Classic score-chasing with all five enemies, for the "just let me play" gamers. Local high score only.

**Teach failure cases:** a level where DFS enemy wanders and gets lost, one where Greedy gets stuck in a dead end, one where an inadmissible heuristic misleads A*.

**Progress and rewards (tasteful):** stars for understanding (answering the quiz, beating an enemy using what you learned), not only for score. Achievements such as "Beat the BFS enemy using a path it could not predict" or "Predicted A*'s route correctly three times."

## 1.5 Visual design

Use the same art direction as the redesign ("The Living Laboratory"): dark graphite, luminous lime / cyan / amber accents, instrument-style controls, original arcade-meets-scientific-instrument look: neon phosphor lines, CRT-style scanlines and bloom (toggleable), glowing maze walls drawn like circuit traces, enemies with distinct geometric silhouettes. The game section should feel like a different "room" of the lab, with its own energy, but clearly the same product.

Make the entry point memorable: a game cabinet-style panel on the dashboard labeled "Learn & Play", with an animated attract mode (a tiny autoplay demo of a search chasing the player) and a non-simple "Press Start" button.

## 1.6 Acceptance checks for the game

- Runs with no network after first load.
- Tests prove the ghost search results equal the course simulators' results for the same graph.
- Frame-rate independent movement verified.
- Playable on desktop keyboard and on mobile touch.
- All five algorithm enemies behave according to their definitions (BFS shortest by steps, UCS cheapest by cost, A* optimal with admissible h, and so on).
- No copyrighted names, sprites, or audio.

---

# PART 2 — PERSISTENT PROGRESS ("WELCOME BACK")

## 2.1 Goal

When a student leaves and returns later (same browser), Cognitia shows exactly how much of the course they have done and where to resume. No account, no server, no login.

## 2.2 Storage approach: use `localStorage` (and IndexedDB if needed), not cookies for progress

You said "cookies or whatever". The right tool here is **browser storage**, not cookies:

- Cookies are sent to the server with every request, are limited to about 4 KB, and add privacy and consent complexity. Progress data is large and purely client-side.
- `localStorage` persists across visits, is simple, and is private to the browser. Use **IndexedDB** (for example via `idb` or `localforage`) only if data grows beyond comfortable `localStorage` size (large attempt histories, replays).
- A cookie, if used at all, should hold nothing more than a tiny non-identifying flag.

**Privacy and legal:** this is a site run from Spain/EU. Store **only functional data** needed for the feature (progress, preferences, game scores). No analytics, no tracking, no personal identifiers, no third-party scripts reading it. Add a short plain-language note in the UI ("Your progress is saved only in this browser"). Flag in `DESIGN.md` that the project owner should confirm with the university whether any consent notice is required; do not assume.

## 2.3 What to persist

- Lessons and sections completed, and **scroll position / last section viewed** per lesson (for "Resume where you left off").
- Simulator usage (which simulators were run, which algorithms tried, completed challenges).
- Exam / practice attempts: scores, answered questions, mistakes, attempt dates.
- Glossary terms viewed or bookmarked.
- Learn & Play progress: unlocked levels, stars, best scores, achievements, quiz results, Ghost Lab experiments.
- Preferences: calm mode, reduced motion override, sound on/off, game speed, X-ray default.
- `lastVisit` timestamp and a visit streak (quiet, optional, not nagging).

## 2.4 Architecture requirements

- **Inspect and preserve existing persistence first.** The app already has progress tracking. Extend and unify it; do not create a competing second system. Migrate any existing stored keys safely.
- **One storage layer** with a single namespaced key (for example `cognitia:v1`) and a **versioned schema** with migration functions, so future changes never wipe a student's progress.
- **Validate on read** (for example with Zod). If data is corrupt or from an unknown version, recover gracefully and never crash.
- **Work when storage is blocked** (private mode, disabled storage): fall back to in-memory state and show a small, non-annoying notice that progress will not be saved.
- **Debounce writes**; do not write on every frame or scroll event.
- **Cross-tab sync** via the `storage` event, so two open tabs stay consistent.
- Use a store (Zustand with `persist` middleware, or equivalent) so components subscribe to progress instead of reading storage directly.
- **Student control:** an "Export progress" (JSON download), "Import progress", and "Reset progress" (with confirmation) in a settings panel. This also covers moving to another device without accounts.
- Handle date logic with timestamps, not locale strings.

## 2.5 The "welcome back" experience (design it, make it great)

- On the dashboard, a prominent **Resume** element: "Continue: Lesson 2, A* optimality proof, 62% through," with a one-click jump to the exact section.
- An **overall course progress** visualization and **per-lesson progress rings**, building on the "mission control / course map" idea from the redesign: completed lessons lit up, the next recommended step highlighted.
- A **combined progress model** that counts reading, simulators, exam results, and Learn & Play toward course completion, with clear weights documented in `DESIGN.md`.
- First-time visitors see an inviting empty state, not zeros and blank charts.
- Animated, accurate numbers; the progress shown must always match what is stored.

## 2.6 Acceptance checks for progress

- Complete a section, close the browser, reopen: progress and resume position are exactly restored.
- Corrupt the stored JSON by hand: the app recovers without crashing.
- Block storage: the app still works and informs the student.
- Two tabs stay in sync.
- Export, reset, then import restores everything.
- Existing progress from before this update is migrated and not lost.
- Unit tests for the storage layer, schema migration, and progress calculations.

---

# ORDER OF WORK

1. Audit existing progress tracking and search implementations; write findings in `DESIGN.md`.
2. Build the storage layer and migrate existing progress (Part 2). This unlocks the rest.
3. Refactor the search algorithms into a shared generic graph module with tests proving unchanged behavior on the Romania problem.
4. Build the game engine (pure TypeScript) with tests.
5. Build the renderer, X-Ray mode, and controls.
6. Build campaign, Ghost Lab, Be the Agent, and arcade modes.
7. Integrate progress, the dashboard "Learn & Play" entry, and the welcome-back experience.
8. Visual polish, mobile pass, accessibility pass, screenshots, regression checks. Repeat refinement passes until it is genuinely excellent.

Do not claim completion because the build passes. Run the game, play it, and test the persistence by actually closing and reopening. Report honestly anything you could not verify.
