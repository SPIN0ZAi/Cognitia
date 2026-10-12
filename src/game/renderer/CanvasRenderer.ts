/**
 * Cognitia Chase: Maze Agents — Canvas 2D Vector Renderer
 * 
 * High-DPI hardware accelerated 2D vector renderer with
 * Living Laboratory dark graphite aesthetic, phosphor neon glow,
 * distinct geometric silhouettes for colorblind accessibility,
 * and live X-Ray search overlay.
 */

import type { GameEngine } from '../engine/GameEngine';
import type { GhostEntity } from '../engine/types';

export interface RendererOptions {
  showXRay: boolean;
  xRayGhostPersonality?: string;
  enableScanlines: boolean;
  enableBloom: boolean;
}

export class CanvasRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private animFrameTime: number = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Could not get 2D canvas context');
    this.ctx = context;
  }

  public render(engine: GameEngine, options: RendererOptions): void {
    this.animFrameTime = performance.now() * 0.001;
    const ctx = this.ctx;
    const canvas = this.canvas;
    const maze = engine.maze;

    const dpr = window.devicePixelRatio || 1;
    const displayWidth = canvas.clientWidth || 640;
    const displayHeight = canvas.clientHeight || 480;

    if (canvas.width !== displayWidth * dpr || canvas.height !== displayHeight * dpr) {
      canvas.width = displayWidth * dpr;
      canvas.height = displayHeight * dpr;
    }

    ctx.save();
    ctx.scale(dpr, dpr);

    // Calculate tile size and centering offset
    const tileSize = Math.min(
      (displayWidth - 20) / maze.width,
      (displayHeight - 20) / maze.height
    );
    const offsetX = (displayWidth - maze.width * tileSize) / 2;
    const offsetY = (displayHeight - maze.height * tileSize) / 2;

    // Clear background
    ctx.fillStyle = '#06090e';
    ctx.fillRect(0, 0, displayWidth, displayHeight);

    // 1. Draw subtle background laboratory grid
    this.drawLabGrid(ctx, displayWidth, displayHeight);

    // 2. Translate to maze coordinates
    ctx.save();
    ctx.translate(offsetX, offsetY);

    // 3. Render Maze Terrain (Walls, Mud, Ice)
    this.renderTerrain(ctx, maze, tileSize);

    // 4. Render Pellets & Power Nodes
    this.renderPellets(ctx, maze, tileSize);

    // 5. Render X-Ray Search Overlay (if active)
    if (options.showXRay) {
      const focalGhost =
        engine.ghosts.find((g: GhostEntity) => g.personality === options.xRayGhostPersonality) ||
        engine.ghosts[0];
      if (focalGhost) {
        this.renderXRayOverlay(ctx, focalGhost, tileSize);
      }
    }

    // 6. Render Player Agent
    this.renderPlayer(ctx, engine, tileSize);

    // 7. Render Ghosts
    for (const ghost of engine.ghosts) {
      this.renderGhost(ctx, ghost, tileSize);
    }

    ctx.restore(); // Restore maze translation

    // 8. CRT Scanlines & Phosphor Post-processing (if enabled)
    if (options.enableScanlines) {
      this.renderScanlines(ctx, displayWidth, displayHeight);
    }

    ctx.restore(); // Restore DPR scale
  }

  private drawLabGrid(ctx: CanvasRenderingContext2D, w: number, h: number): void {
    ctx.strokeStyle = 'rgba(120, 213, 232, 0.03)';
    ctx.lineWidth = 1;
    const step = 24;
    ctx.beginPath();
    for (let x = 0; x < w; x += step) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
    }
    for (let y = 0; y < h; y += step) {
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
    }
    ctx.stroke();
  }

  private renderTerrain(ctx: CanvasRenderingContext2D, maze: any, tileSize: number): void {
    for (let y = 0; y < maze.height; y++) {
      for (let x = 0; x < maze.width; x++) {
        const tile = maze.getTile(x, y);
        const px = x * tileSize;
        const py = y * tileSize;

        if (tile === 'wall') {
          // Dark circuit wall block
          ctx.fillStyle = '#0b1320';
          ctx.fillRect(px, py, tileSize, tileSize);

          ctx.strokeStyle = '#1e293b';
          ctx.lineWidth = 1;
          ctx.strokeRect(px + 0.5, py + 0.5, tileSize - 1, tileSize - 1);

          // Neon circuit trace highlight on perimeter
          ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)';
          ctx.lineWidth = 1.5;
          ctx.strokeRect(px + 2, py + 2, tileSize - 4, tileSize - 4);
        } else if (tile === 'mud') {
          // High-friction mud corridor (Cost = 3.0)
          ctx.fillStyle = 'rgba(245, 158, 11, 0.12)';
          ctx.fillRect(px, py, tileSize, tileSize);

          ctx.strokeStyle = 'rgba(245, 158, 11, 0.3)';
          ctx.lineWidth = 1;
          ctx.strokeRect(px + 1, py + 1, tileSize - 2, tileSize - 2);

          // Cautionary hatch lines
          ctx.strokeStyle = 'rgba(245, 158, 11, 0.2)';
          ctx.beginPath();
          ctx.moveTo(px + 2, py + tileSize - 2);
          ctx.lineTo(px + tileSize - 2, py + 2);
          ctx.stroke();

          // Cost indicator tag
          ctx.fillStyle = 'rgba(245, 158, 11, 0.5)';
          ctx.font = `${Math.max(7, Math.floor(tileSize * 0.35))}px monospace`;
          ctx.textAlign = 'center';
          ctx.fillText('3x', px + tileSize / 2, py + tileSize / 2 + 3);
        } else if (tile === 'ice') {
          // Low-friction superconductor ice track (Cost = 0.5)
          ctx.fillStyle = 'rgba(120, 213, 232, 0.15)';
          ctx.fillRect(px, py, tileSize, tileSize);

          ctx.strokeStyle = 'rgba(120, 213, 232, 0.4)';
          ctx.lineWidth = 1;
          ctx.strokeRect(px + 1, py + 1, tileSize - 2, tileSize - 2);

          ctx.fillStyle = 'rgba(120, 213, 232, 0.6)';
          ctx.font = `${Math.max(6, Math.floor(tileSize * 0.32))}px monospace`;
          ctx.textAlign = 'center';
          ctx.fillText('.5x', px + tileSize / 2, py + tileSize / 2 + 3);
        }
      }
    }
  }

  private renderPellets(ctx: CanvasRenderingContext2D, maze: any, tileSize: number): void {
    const pulse = Math.sin(this.animFrameTime * 4) * 0.2 + 0.8;

    for (let y = 0; y < maze.height; y++) {
      for (let x = 0; x < maze.width; x++) {
        const tile = maze.getTile(x, y);
        const cx = x * tileSize + tileSize / 2;
        const cy = y * tileSize + tileSize / 2;

        if (tile === 'pellet') {
          // Glowing data point
          ctx.fillStyle = '#78D5E8';
          ctx.beginPath();
          ctx.arc(cx, cy, Math.max(2, tileSize * 0.12), 0, Math.PI * 2);
          ctx.fill();
        } else if (tile === 'power') {
          // Pulsing super power node
          const r = Math.max(4, tileSize * 0.28) * pulse;
          ctx.save();
          ctx.translate(cx, cy);
          ctx.rotate(this.animFrameTime * 2);

          ctx.fillStyle = '#C6F277';
          ctx.shadowColor = '#C6F277';
          ctx.shadowBlur = 8;

          // Diamond shape
          ctx.beginPath();
          ctx.moveTo(0, -r);
          ctx.lineTo(r, 0);
          ctx.lineTo(0, r);
          ctx.lineTo(-r, 0);
          ctx.closePath();
          ctx.fill();

          ctx.restore();
        }
      }
    }
  }

  private renderXRayOverlay(
    ctx: CanvasRenderingContext2D,
    ghost: GhostEntity,
    tileSize: number
  ): void {
    const color = ghost.color;

    // 1. Draw Explored Nodes (Soft footprint glow)
    ctx.fillStyle = `${color}1A`; // ~10% opacity
    for (const tile of ghost.telemetry.exploredTiles) {
      ctx.fillRect(tile.x * tileSize + 1, tile.y * tileSize + 1, tileSize - 2, tileSize - 2);
    }

    // 2. Draw Frontier Nodes (Pulsing radar points)
    const frontierPulse = Math.sin(this.animFrameTime * 6) * 0.3 + 0.7;
    ctx.fillStyle = color;
    for (const f of ghost.telemetry.frontierTiles) {
      const cx = f.x * tileSize + tileSize / 2;
      const cy = f.y * tileSize + tileSize / 2;
      ctx.beginPath();
      ctx.arc(cx, cy, Math.max(2, tileSize * 0.16) * frontierPulse, 0, Math.PI * 2);
      ctx.fill();
    }

    // 3. Draw Planned Path (Vector laser beam)
    if (ghost.path && ghost.path.length > 1) {
      ctx.strokeStyle = color;
      ctx.lineWidth = Math.max(2, tileSize * 0.15);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.shadowColor = color;
      ctx.shadowBlur = 6;

      ctx.beginPath();
      const startPx = ghost.x * tileSize + tileSize / 2;
      const startPy = ghost.y * tileSize + tileSize / 2;
      ctx.moveTo(startPx, startPy);

      for (let i = 1; i < ghost.path.length; i++) {
        const pt = ghost.path[i];
        ctx.lineTo(pt.x * tileSize + tileSize / 2, pt.y * tileSize + tileSize / 2);
      }
      ctx.stroke();

      ctx.shadowBlur = 0; // Reset shadow
    }

    // 4. Target reticle
    const tgt = ghost.telemetry.targetTile;
    const tx = tgt.x * tileSize + tileSize / 2;
    const ty = tgt.y * tileSize + tileSize / 2;
    const reticleR = tileSize * 0.45;

    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(tx, ty, reticleR, 0, Math.PI * 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(tx - reticleR - 3, ty);
    ctx.lineTo(tx + reticleR + 3, ty);
    ctx.moveTo(tx, ty - reticleR - 3);
    ctx.lineTo(tx, ty + reticleR + 3);
    ctx.stroke();
  }

  private renderPlayer(ctx: CanvasRenderingContext2D, engine: GameEngine, tileSize: number): void {
    const p = engine.player;
    const cx = p.x * tileSize + tileSize / 2;
    const cy = p.y * tileSize + tileSize / 2;
    const r = tileSize * 0.4;

    // Invulnerability flashing
    if (p.invulnerableTimer > 0 && Math.floor(this.animFrameTime * 12) % 2 === 0) {
      return;
    }

    ctx.save();
    ctx.translate(cx, cy);

    // Directional rotation
    let angle = 0;
    if (p.dir === 'right') angle = 0;
    else if (p.dir === 'down') angle = Math.PI / 2;
    else if (p.dir === 'left') angle = Math.PI;
    else if (p.dir === 'up') angle = -Math.PI / 2;
    ctx.rotate(angle);

    // Outer radar ring
    ctx.strokeStyle = 'rgba(120, 213, 232, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, 0, r + 2, 0, Math.PI * 2);
    ctx.stroke();

    // Cybernetic probe body (Autonomous Agent)
    const mouthAngle = (Math.sin(this.animFrameTime * 14) * 0.2 + 0.25) * Math.PI;
    ctx.fillStyle = '#78D5E8';
    ctx.shadowColor = '#78D5E8';
    ctx.shadowBlur = 8;

    ctx.beginPath();
    ctx.arc(0, 0, r, mouthAngle, Math.PI * 2 - mouthAngle);
    ctx.lineTo(0, 0);
    ctx.closePath();
    ctx.fill();

    // Inner core sensor eye
    ctx.fillStyle = '#06090e';
    ctx.shadowBlur = 0;
    ctx.beginPath();
    ctx.arc(r * 0.2, -r * 0.4, r * 0.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#C6F277';
    ctx.beginPath();
    ctx.arc(r * 0.25, -r * 0.4, r * 0.1, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  private renderGhost(ctx: CanvasRenderingContext2D, ghost: GhostEntity, tileSize: number): void {
    const cx = ghost.x * tileSize + tileSize / 2;
    const cy = ghost.y * tileSize + tileSize / 2;
    const r = tileSize * 0.42;

    ctx.save();
    ctx.translate(cx, cy);

    // Frightened appearance: flashing cobalt blue / warning white
    let ghostColor = ghost.color;
    if (ghost.mode === 'frightened') {
      const isEnding = ghost.frightenedTimer < 2.5;
      if (isEnding && Math.floor(this.animFrameTime * 8) % 2 === 0) {
        ghostColor = '#F1F5F9';
      } else {
        ghostColor = '#3B82F6';
      }
    }

    ctx.fillStyle = ghostColor;
    ctx.shadowColor = ghostColor;
    ctx.shadowBlur = 8;

    // Distinct geometric silhouettes for colorblind accessibility:
    switch (ghost.personality) {
      case 'bfs': // The Wave: Concentric Diamond Wave
        ctx.beginPath();
        ctx.moveTo(0, -r);
        ctx.lineTo(r, 0);
        ctx.lineTo(0, r);
        ctx.lineTo(-r, 0);
        ctx.closePath();
        ctx.fill();
        break;

      case 'ucs': // The Miser: Hexagon
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
          const a = (i * Math.PI) / 3;
          const hx = Math.cos(a) * r;
          const hy = Math.sin(a) * r;
          if (i === 0) ctx.moveTo(hx, hy);
          else ctx.lineTo(hx, hy);
        }
        ctx.closePath();
        ctx.fill();
        break;

      case 'dfs': // The Plunger: Inverted Triangle / Down Arrow
        ctx.beginPath();
        ctx.moveTo(-r, -r * 0.8);
        ctx.lineTo(r, -r * 0.8);
        ctx.lineTo(0, r);
        ctx.closePath();
        ctx.fill();
        break;

      case 'greedy': // The Gambler: 4-Point Jagged Star
        ctx.beginPath();
        for (let i = 0; i < 8; i++) {
          const a = (i * Math.PI) / 4;
          const rad = i % 2 === 0 ? r : r * 0.45;
          const sx = Math.cos(a) * rad;
          const sy = Math.sin(a) * rad;
          if (i === 0) ctx.moveTo(sx, sy);
          else ctx.lineTo(sx, sy);
        }
        ctx.closePath();
        ctx.fill();
        break;

      case 'astar': // The Strategist: Pentagon
      default:
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
          const a = (i * 2 * Math.PI) / 5 - Math.PI / 2;
          const px = Math.cos(a) * r;
          const py = Math.sin(a) * r;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();
        break;
    }

    // Ghost Sensor Eyes
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#06090e';
    ctx.beginPath();
    ctx.arc(-r * 0.3, -r * 0.1, r * 0.22, 0, Math.PI * 2);
    ctx.arc(r * 0.3, -r * 0.1, r * 0.22, 0, Math.PI * 2);
    ctx.fill();

    // Pupils looking in movement direction
    let pupX = 0;
    let pupY = 0;
    if (ghost.dir === 'left') pupX = -r * 0.08;
    if (ghost.dir === 'right') pupX = r * 0.08;
    if (ghost.dir === 'up') pupY = -r * 0.08;
    if (ghost.dir === 'down') pupY = r * 0.08;

    ctx.fillStyle = ghost.mode === 'frightened' ? '#F43F5E' : '#FFFFFF';
    ctx.beginPath();
    ctx.arc(-r * 0.3 + pupX, -r * 0.1 + pupY, r * 0.1, 0, Math.PI * 2);
    ctx.arc(r * 0.3 + pupX, -r * 0.1 + pupY, r * 0.1, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  private renderScanlines(ctx: CanvasRenderingContext2D, w: number, h: number): void {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.18)';
    for (let y = 0; y < h; y += 4) {
      ctx.fillRect(0, y, w, 1.5);
    }
  }
}
