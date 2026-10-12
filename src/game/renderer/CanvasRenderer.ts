/**
 * Cognitia Chase: Authentic 1980 Arcade Canvas 2D Renderer
 * 
 * Renders the authentic 28x31 playfield with crisp pixel art:
 * - Pure black playfield with neon-blue double-walled arcade labyrinth
 * - Creamy peach pellets and pulsing energizers
 * - Chomping yellow hero with 3-frame mouth cycle and death animation
 * - Rounded ghosts with animated wavy skirts and directional pupils
 * - Blue frightened ghosts with squiggly mouths and white flash cycle
 * - Eaten floating eyes returning to the ghost house
 * - Classic arcade HUD (1UP, HIGH SCORE, READY!, lives counter, fruit indicators)
 * - Optional CRT scanline & phosphor bloom filter
 * - Live X-Ray overlay in Algorithm Mode
 */

import type { GameEngine } from '../engine/GameEngine';
import type { GhostEntity, Direction } from '../engine/types';

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
    const displayWidth = canvas.clientWidth || 560;
    const displayHeight = canvas.clientHeight || 620;

    if (canvas.width !== displayWidth * dpr || canvas.height !== displayHeight * dpr) {
      canvas.width = displayWidth * dpr;
      canvas.height = displayHeight * dpr;
    }

    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.imageSmoothingEnabled = false;

    // Pitch-black arcade playfield
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, displayWidth, displayHeight);

    // 28 columns x 36 rows total aspect ratio (including HUD rows)
    const hudTopRows = 2.5;
    const hudBottomRows = 2.5;
    const totalVirtualRows = maze.height + hudTopRows + hudBottomRows;

    const tileSize = Math.floor(
      Math.min(displayWidth / maze.width, displayHeight / totalVirtualRows)
    );

    const playfieldWidth = maze.width * tileSize;
    const playfieldHeight = maze.height * tileSize;
    const offsetX = Math.floor((displayWidth - playfieldWidth) / 2);
    const offsetY = Math.floor(hudTopRows * tileSize);

    // 1. Draw Top HUD (1UP, HIGH SCORE)
    this.renderTopHud(ctx, engine, offsetX, playfieldWidth, tileSize);

    // 2. Draw Maze Playfield
    ctx.save();
    ctx.translate(offsetX, offsetY);

    this.renderMazeWalls(ctx, maze, tileSize);
    this.renderPellets(ctx, maze, tileSize);
    this.renderFruit(ctx, engine, tileSize);

    // 3. Render X-Ray search overlay if in Algorithm Mode
    if (options.showXRay && engine.targetingMode === 'algorithm') {
      const focalGhost =
        engine.ghosts.find((g: GhostEntity) => g.personality === options.xRayGhostPersonality) ||
        engine.ghosts[0];
      if (focalGhost) {
        this.renderXRayOverlay(ctx, focalGhost, tileSize);
      }
    }

    // 4. Render Player & Ghosts
    this.renderPlayer(ctx, engine, tileSize);
    this.renderGhosts(ctx, engine, tileSize);

    // 5. Draw READY! or GAME OVER alerts in center
    this.renderCenterAlerts(ctx, engine, tileSize);

    ctx.restore();

    // 6. Draw Bottom HUD (Lives & Level Fruit)
    this.renderBottomHud(
      ctx,
      engine,
      offsetX,
      offsetY + playfieldHeight,
      playfieldWidth,
      tileSize
    );

    // 7. Optional CRT Scanlines
    if (options.enableScanlines) {
      this.renderScanlines(ctx, displayWidth, displayHeight);
    }

    ctx.restore();
  }

  private renderTopHud(
    ctx: CanvasRenderingContext2D,
    engine: GameEngine,
    offsetX: number,
    width: number,
    tileSize: number
  ): void {
    ctx.save();
    ctx.font = `bold ${Math.max(10, Math.floor(tileSize * 0.9))}px "JetBrains Mono", monospace`;
    ctx.textAlign = 'left';

    // 1UP
    ctx.fillStyle = '#ffffff';
    ctx.fillText('1UP', offsetX + tileSize * 1, tileSize * 1.2);
    ctx.fillStyle = '#ffff00';
    ctx.fillText(`${engine.score.toString().padStart(2, ' ')}`, offsetX + tileSize * 1, tileSize * 2.2);

    // HIGH SCORE
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('HIGH SCORE', offsetX + width / 2, tileSize * 1.2);
    ctx.fillStyle = '#ffff00';
    ctx.fillText(
      `${Math.max(engine.score, engine.highScore).toString().padStart(2, ' ')}`,
      offsetX + width / 2,
      tileSize * 2.2
    );

    ctx.restore();
  }

  private renderBottomHud(
    ctx: CanvasRenderingContext2D,
    engine: GameEngine,
    offsetX: number,
    bottomY: number,
    width: number,
    tileSize: number
  ): void {
    ctx.save();
    const iconR = tileSize * 0.45;
    const iconY = bottomY + tileSize * 1.2;

    // Remaining lives (yellow pac-man icons)
    ctx.fillStyle = '#ffff00';
    for (let i = 0; i < Math.max(0, engine.player.lives - 1); i++) {
      const iconX = offsetX + tileSize * (1.5 + i * 1.6);
      ctx.beginPath();
      ctx.arc(iconX, iconY, iconR, 0.25 * Math.PI, 1.75 * Math.PI);
      ctx.lineTo(iconX, iconY);
      ctx.closePath();
      ctx.fill();
    }

    // Fruit level indicators at bottom right
    const fruitX = offsetX + width - tileSize * 2;
    this.drawFruitIcon(ctx, fruitX, iconY, tileSize * 0.8, engine.fruit.type);

    ctx.restore();
  }

  private renderMazeWalls(ctx: CanvasRenderingContext2D, maze: any, tileSize: number): void {
    ctx.save();

    for (let y = 0; y < maze.height; y++) {
      for (let x = 0; x < maze.width; x++) {
        const tile = maze.getTile(x, y);

        if (tile === 'wall') {
          const px = x * tileSize;
          const py = y * tileSize;

          // Double neon-blue arcade wall effect
          ctx.strokeStyle = '#2121ff';
          ctx.lineWidth = Math.max(2, Math.floor(tileSize * 0.16));
          ctx.strokeRect(px + 0.5, py + 0.5, tileSize - 1, tileSize - 1);

          ctx.fillStyle = '#0a0a33';
          ctx.fillRect(px + 1, py + 1, tileSize - 2, tileSize - 2);
        } else if (tile === 'door') {
          // Ghost house door: pink horizontal bar
          const px = x * tileSize;
          const py = y * tileSize + tileSize / 2 - 2;
          ctx.fillStyle = '#ffb8ae';
          ctx.fillRect(px, py, tileSize, 4);
        } else if (tile === 'mud') {
          ctx.fillStyle = 'rgba(120, 70, 30, 0.45)';
          ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
        } else if (tile === 'ice') {
          ctx.fillStyle = 'rgba(0, 240, 255, 0.25)';
          ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
        }
      }
    }

    ctx.restore();
  }

  private renderPellets(ctx: CanvasRenderingContext2D, maze: any, tileSize: number): void {
    ctx.save();
    const now = this.animFrameTime;

    for (let y = 0; y < maze.height; y++) {
      for (let x = 0; x < maze.width; x++) {
        const tile = maze.grid[y]?.[x];
        const cx = x * tileSize + tileSize / 2;
        const cy = y * tileSize + tileSize / 2;

        if (tile === 'pellet') {
          // Classic creamy peach square dot
          ctx.fillStyle = '#ffb897';
          const dotSize = Math.max(3, Math.floor(tileSize * 0.22));
          ctx.fillRect(cx - dotSize / 2, cy - dotSize / 2, dotSize, dotSize);
        } else if (tile === 'power') {
          // Pulsing energizer disc (flashes at ~5Hz)
          const pulse = (Math.sin(now * 10) + 1) / 2;
          const r = tileSize * (0.35 + 0.08 * pulse);
          ctx.fillStyle = '#ffb897';
          ctx.beginPath();
          ctx.arc(cx, cy, r, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    ctx.restore();
  }

  private renderFruit(ctx: CanvasRenderingContext2D, engine: GameEngine, tileSize: number): void {
    if (!engine.fruit.active) return;
    const fx = engine.fruit.tile.x * tileSize + tileSize / 2;
    const fy = engine.fruit.tile.y * tileSize + tileSize / 2;
    this.drawFruitIcon(ctx, fx, fy, tileSize * 0.9, engine.fruit.type);
  }

  private drawFruitIcon(
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    size: number,
    type: string
  ): void {
    ctx.save();
    const r = size * 0.4;

    if (type === 'cherry') {
      // Two red cherries with brown stem
      ctx.fillStyle = '#ff0000';
      ctx.beginPath();
      ctx.arc(cx - r * 0.5, cy + r * 0.2, r * 0.55, 0, Math.PI * 2);
      ctx.arc(cx + r * 0.4, cy + r * 0.4, r * 0.55, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#8b5a2b';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx - r * 0.5, cy + r * 0.1);
      ctx.lineTo(cx, cy - r * 0.7);
      ctx.lineTo(cx + r * 0.4, cy + r * 0.3);
      ctx.stroke();
    } else {
      // Strawberry or Peach
      ctx.fillStyle = '#ff3366';
      ctx.beginPath();
      ctx.arc(cx, cy, r * 0.7, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#00ff66';
      ctx.fillRect(cx - 2, cy - r * 0.9, 4, 4);
    }

    ctx.restore();
  }

  private renderPlayer(ctx: CanvasRenderingContext2D, engine: GameEngine, tileSize: number): void {
    const p = engine.player;
    const cx = p.x * tileSize + tileSize / 2;
    const cy = p.y * tileSize + tileSize / 2;
    const r = tileSize * 0.48;

    ctx.save();

    // Death spin sequence
    if (engine.state === 'player_caught') {
      const deathProgress = 1.0 - Math.max(0, p.invulnerableTimer);
      const angleOpen = Math.min(Math.PI * 0.99, deathProgress * Math.PI);
      ctx.fillStyle = '#ffff00';
      ctx.beginPath();
      ctx.arc(cx, cy, r, -Math.PI / 2 + angleOpen, -Math.PI / 2 - angleOpen + Math.PI * 2);
      ctx.lineTo(cx, cy);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
      return;
    }

    // Chomping mouth animation cycle (closed -> mid -> wide)
    const chompPhase = Math.sin(this.animFrameTime * 20);
    const mouthAngle = p.dir === 'none' ? 0.05 : Math.abs(chompPhase) * 0.35 * Math.PI;

    // Rotation angle based on facing direction
    let baseAngle = 0;
    if (p.dir === 'right') baseAngle = 0;
    else if (p.dir === 'down') baseAngle = Math.PI * 0.5;
    else if (p.dir === 'left') baseAngle = Math.PI;
    else if (p.dir === 'up') baseAngle = Math.PI * 1.5;

    ctx.fillStyle = '#ffff00';
    ctx.beginPath();
    ctx.arc(
      cx,
      cy,
      r,
      baseAngle + mouthAngle,
      baseAngle + (Math.PI * 2 - mouthAngle)
    );
    ctx.lineTo(cx, cy);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  private renderGhosts(ctx: CanvasRenderingContext2D, engine: GameEngine, tileSize: number): void {
    const now = this.animFrameTime;

    for (const ghost of engine.ghosts) {
      const gx = ghost.x * tileSize + tileSize / 2;
      const gy = ghost.y * tileSize + tileSize / 2;
      const r = tileSize * 0.46;

      ctx.save();

      if (ghost.mode === 'eaten') {
        // Eaten mode: render only the floating white eyes & pupils
        this.drawGhostEyes(ctx, gx, gy, r, ghost.dir);
      } else if (ghost.mode === 'frightened') {
        // Frightened mode: deep navy blue, flashing white in last 2 seconds
        let bodyColor = '#2121ff';
        let faceColor = '#ffb8ff';

        if (ghost.frightenedTimer < 2.0) {
          const flash = Math.floor(now * 8) % 2 === 0;
          if (flash) {
            bodyColor = '#ffffff';
            faceColor = '#ff0000';
          }
        }

        this.drawGhostBody(ctx, gx, gy, r, bodyColor);
        this.drawFrightenedFace(ctx, gx, gy, r, faceColor);
      } else {
        // Normal mode: personality color + directional eyes
        this.drawGhostBody(ctx, gx, gy, r, ghost.color);
        this.drawGhostEyes(ctx, gx, gy, r, ghost.dir);
      }

      ctx.restore();
    }
  }

  private drawGhostBody(
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    r: number,
    color: string
  ): void {
    ctx.fillStyle = color;
    ctx.beginPath();

    // Dome head
    ctx.arc(cx, cy - r * 0.1, r, Math.PI, 0, false);

    // Straight sides down
    const bottomY = cy + r;
    ctx.lineTo(cx + r, bottomY);

    // 2-frame oscillating wavy skirt
    const waveOffset = Math.sin(this.animFrameTime * 14) * (r * 0.2);
    const skirtWidth = r * 2;
    const waveCount = 3;
    const step = skirtWidth / waveCount;

    for (let i = waveCount; i > 0; i--) {
      const peakX = cx - r + (i - 0.5) * step;
      const peakY = bottomY - r * 0.35 + (i % 2 === 0 ? waveOffset : -waveOffset);
      const endX = cx - r + (i - 1) * step;
      ctx.quadraticCurveTo(peakX, peakY, endX, bottomY);
    }

    ctx.closePath();
    ctx.fill();
  }

  private drawGhostEyes(
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    r: number,
    dir: Direction
  ): void {
    // Pupil offsets based on travel direction
    let ox = 0;
    let oy = 0;
    if (dir === 'left') ox = -r * 0.22;
    else if (dir === 'right') ox = r * 0.22;
    else if (dir === 'up') oy = -r * 0.25;
    else if (dir === 'down') oy = r * 0.25;

    // White eye ovals
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(cx - r * 0.36 + ox * 0.5, cy - r * 0.2 + oy * 0.5, r * 0.3, r * 0.38, 0, 0, Math.PI * 2);
    ctx.ellipse(cx + r * 0.36 + ox * 0.5, cy - r * 0.2 + oy * 0.5, r * 0.3, r * 0.38, 0, 0, Math.PI * 2);
    ctx.fill();

    // Dark blue pupils
    ctx.fillStyle = '#2121ff';
    ctx.beginPath();
    ctx.arc(cx - r * 0.36 + ox, cy - r * 0.2 + oy, r * 0.16, 0, Math.PI * 2);
    ctx.arc(cx + r * 0.36 + ox, cy - r * 0.2 + oy, r * 0.16, 0, Math.PI * 2);
    ctx.fill();
  }

  private drawFrightenedFace(
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    r: number,
    faceColor: string
  ): void {
    // Small dots for eyes
    ctx.fillStyle = faceColor;
    ctx.beginPath();
    ctx.arc(cx - r * 0.3, cy - r * 0.15, r * 0.14, 0, Math.PI * 2);
    ctx.arc(cx + r * 0.3, cy - r * 0.15, r * 0.14, 0, Math.PI * 2);
    ctx.fill();

    // Wavy squiggly mouth
    ctx.strokeStyle = faceColor;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx - r * 0.5, cy + r * 0.35);
    ctx.lineTo(cx - r * 0.25, cy + r * 0.2);
    ctx.lineTo(cx, cy + r * 0.35);
    ctx.lineTo(cx + r * 0.25, cy + r * 0.2);
    ctx.lineTo(cx + r * 0.5, cy + r * 0.35);
    ctx.stroke();
  }

  private renderCenterAlerts(
    ctx: CanvasRenderingContext2D,
    engine: GameEngine,
    tileSize: number
  ): void {
    ctx.save();
    ctx.font = `bold ${Math.floor(tileSize * 1.1)}px "JetBrains Mono", monospace`;
    ctx.textAlign = 'center';

    const cx = (engine.maze.width * tileSize) / 2;
    const cy = 17.5 * tileSize;

    if (engine.state === 'ready') {
      ctx.fillStyle = '#ffff00';
      ctx.fillText('READY!', cx, cy);
    } else if (engine.state === 'game_over') {
      ctx.fillStyle = '#ff0000';
      ctx.fillText('GAME OVER', cx, cy);
    }

    ctx.restore();
  }

  private renderScanlines(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number
  ): void {
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    for (let y = 0; y < height; y += 4) {
      ctx.fillRect(0, y, width, 1.5);
    }
    ctx.restore();
  }

  private renderXRayOverlay(
    ctx: CanvasRenderingContext2D,
    ghost: GhostEntity,
    tileSize: number
  ): void {
    ctx.save();

    // Target reticle
    const tx = ghost.targetTile.x * tileSize + tileSize / 2;
    const ty = ghost.targetTile.y * tileSize + tileSize / 2;

    ctx.strokeStyle = '#ffff00';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(tx, ty, tileSize * 0.6, 0, Math.PI * 2);
    ctx.stroke();

    // Trajectory polyline
    if (ghost.path.length > 1) {
      ctx.strokeStyle = ghost.color;
      ctx.lineWidth = 2.5;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(ghost.x * tileSize + tileSize / 2, ghost.y * tileSize + tileSize / 2);
      for (let i = 1; i < ghost.path.length; i++) {
        ctx.lineTo(ghost.path[i].x * tileSize + tileSize / 2, ghost.path[i].y * tileSize + tileSize / 2);
      }
      ctx.stroke();
      ctx.setLineDash([]);
    }

    ctx.restore();
  }
}
