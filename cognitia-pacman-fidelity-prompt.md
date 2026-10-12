# COGNITIA — LEARN & PLAY: FIX THE GAME SO IT PLAYS LIKE THE CLASSIC

The first version of the game feels like a weird imitation. The goal now is a game that **plays, feels and looks like a classic 1980 arcade maze chase**, down to the rules and timings, while using assets we are allowed to publish. Replace the current game logic where it deviates. Keep the existing storage layer, progress system, and the "ghosts are search algorithms" teaching layer.

Take as long as you need. Do not stop at "close enough". Play the game next to a reference video of classic arcade gameplay and keep fixing differences until the feel is right.

## 1. Authentic mechanics (read the Pac-Man Dossier and implement it exactly)

Read "The Pac-Man Dossier" (Jamey Pittman) and any other documentation of the arcade rules you can find. Record sources in `DESIGN.md`. Implement:

**Board and movement**
- Tile-based maze, 28 x 31 tiles, with the two side tunnels (wrap-around, ghosts slow down inside them), the ghost house with its door, and four power pellets in the corners.
- Movement is on a tile grid with sub-tile pixel positions. The player can pre-turn (buffer the next direction before reaching an intersection and corner-cut like the arcade game).
- Speeds are percentages of a base speed and change by level and state (player, ghosts, frightened ghosts, tunnel). Use the documented speed tables per level.
- Eating a dot briefly slows the player (the one-frame pause per dot, three for pellets).

**Ghost behavior (this is the heart of it)**
- Ghosts decide direction **at each tile** by picking the neighbor tile closest (straight-line distance) to their target tile. They can **never reverse** except when the mode changes. Tie-break order: up, left, down, right. Some tiles forbid turning upward.
- Four personalities with distinct targets: one chases the player directly; one targets a few tiles ahead of the player (including the documented upward-direction overflow quirk); one uses the first ghost's position plus a vector from the player to compute a flanking target; one chases when far and retreats to its corner when near (within 8 tiles).
- Mode schedule: scatter and chase phases with the documented per-level timings, then the frightened mode after a power pellet (duration and flash count by level, random turns, slower speed), and eyes returning to the house after being eaten.
- Ghost house logic: staggered release based on dot counters, then timers, with the documented exit rules. The first ghost's "speed up" behavior when few dots remain.
- Scoring: 10 / 50 for dots and pellets, 200 / 400 / 800 / 1600 for consecutive ghosts, bonus fruit appearing at the documented dot counts with its per-level values, extra life at 10,000.
- Level progression and difficulty curve as documented.

**Teaching layer (keep, but do not break the feel)**
- Add a toggle **"Algorithm mode"**. Classic mode uses the authentic targeting rules above. Algorithm mode swaps each ghost's decision for one of the course algorithms (BFS, UCS, DFS, Greedy, A*) with the X-Ray overlay. Default is Classic, so the game feels right out of the box. The classic chase rule itself is a heuristic (straight-line distance to a target), and a "Why does it work?" panel should connect it to h(n) and Greedy search.

## 2. Look and feel: arcade-authentic, with original assets

Make it unmistakably a classic arcade game in spirit and quality:
- Pixel-accurate, crisp pixel art with integer scaling, no smoothing, a dark playfield, bright neon-blue maze walls, small pale dots, the classic yellow round chomping hero with the mouth-open/close cycle, ghosts as rounded-top characters with wavy skirts, animated eyes that look in their travel direction, blue frightened ghosts that flash white near the end, and eyes-only returning ghosts.
- Classic HUD layout: 1UP, HIGH SCORE, lives, fruit level indicator, READY! intro, and the death animation.
- Optional CRT filter (scanlines, subtle bloom) toggle.
- Draw all sprites yourself as original pixel art (sprite sheets or code-drawn). Use your own names for the characters if needed. Do not copy sprite sheets, maze images, logos, or audio files from the original game, from emulators, from ROMs, or from other people's repositories.

## 3. Sound

- Build a Web Audio chiptune sound engine: a continuous munching pattern when eating dots, a siren that rises as dots are eaten, a distinct frightened-mode loop, ghost-eaten and fruit sounds, a short intro jingle, and a death sequence. Compose them yourself with square/triangle waves, in the spirit of classic arcade audio.
- Do not use, extract, or copy audio files or melodies from the original game or any ROM.
- Muted by default on first visit, with a clear toggle, and resume audio on first user gesture.

## 4. Acceptance

- Side by side with reference gameplay footage, the ghost routes, mode changes, speeds and scoring behave the same.
- Unit tests for ghost targeting, the no-reverse rule, tie-break order, mode timers, scoring chain, and fruit appearance.
- Fixed-timestep loop, stable 60 FPS, keyboard and touch controls, works offline, state saved through the existing progress system.
- Report honestly any mechanic you could not verify against documentation.
