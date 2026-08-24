import { useEffect, useRef, useState } from 'react';
import './WeddingQuest.css';

/**
 * WeddingQuest - an 8-bit NES Mario-style cutscene where the groom
 * runs across a level to rescue the bride, they walk off together,
 * and the scene ends with a fireworks finale.
 *
 * Everything is drawn on a single canvas from pixel-art grids, so no
 * external image assets are required.
 */

// Logical resolution (upscaled to fill the canvas element).
const VIEW_W = 256;
const VIEW_H = 192;
const SCALE = 3;

// Color palette (NES-ish).
const C = {
  sky: '#5c94fc',
  cloud: '#ffffff',
  hillDark: '#00a800',
  hillLight: '#00d800',
  ground: '#d07030',
  groundDark: '#a04010',
  brick: '#c84c0c',
  brickShade: '#a03000',
  brickMortar: '#000000',
  skin: '#fcbcb0',
  groomSuit: '#101820',
  groomShirt: '#ffffff',
  groomHair: '#5a3410',
  brideDress: '#ffffff',
  brideVeil: '#f0f0ff',
  brideHair: '#d89020',
  heart: '#f83800',
  gold: '#fcd800',
} as const;

// A tiny sprite framework: 2D arrays of single-char color keys.
type Palette = Record<string, string>;

function drawSprite(
  ctx: CanvasRenderingContext2D,
  grid: string[],
  palette: Palette,
  px: number,
  py: number,
  flip = false,
) {
  const rows = grid.length;
  for (let r = 0; r < rows; r++) {
    const row = grid[r];
    for (let c = 0; c < row.length; c++) {
      const key = row[c];
      const color = palette[key];
      if (!color) continue; // '.' or space = transparent
      const dx = flip ? row.length - 1 - c : c;
      ctx.fillStyle = color;
      ctx.fillRect(px + dx, py + r, 1, 1);
    }
  }
}

// --- Groom sprite (two-frame run cycle) ------------------------------------
const GROOM_PALETTE: Palette = {
  H: C.groomHair,
  S: C.skin,
  B: C.groomSuit,
  W: C.groomShirt,
};

const GROOM_A = [
  '..HHHH..',
  '.HHHHHH.',
  '.HSSSSH.',
  '.SSSSSS.',
  '..BWWB..',
  '.BBWWBB.',
  'BB.WW.BB',
  'B..BB..B',
  '...BB...',
  '..B..B..',
  '.BB..BB.',
];

const GROOM_B = [
  '..HHHH..',
  '.HHHHHH.',
  '.HSSSSH.',
  '.SSSSSS.',
  '..BWWB..',
  '.BBWWBB.',
  '.BBWWBB.',
  '..BBBB..',
  '..B..B..',
  '.B....B.',
  'BB....BB',
];

// Groom holding the bride's hand while standing (idle).
const GROOM_IDLE = [
  '..HHHH..',
  '.HHHHHH.',
  '.HSSSSH.',
  '.SSSSSS.',
  '..BWWB..',
  '.BBWWBB.',
  '.BBWWBB.',
  '..BBBB..',
  '..B..B..',
  '..B..B..',
  '.BB..BB.',
];

// --- Bride sprite ----------------------------------------------------------
const BRIDE_PALETTE: Palette = {
  H: C.brideHair,
  S: C.skin,
  D: C.brideDress,
  V: C.brideVeil,
};

const BRIDE_STAND = [
  '.VVVVVV.',
  'VVHHHHVV',
  '.VHSSHV.',
  '..SSSS..',
  '..DDDD..',
  '.DDDDDD.',
  '.DDDDDD.',
  'DDDDDDDD',
  'DDDDDDDD',
  'DDDDDDDD',
  'DD....DD',
];

// --- Castle / flagpole goal ------------------------------------------------
function drawCastle(ctx: CanvasRenderingContext2D, x: number, groundY: number) {
  const w = 48;
  const h = 44;
  const top = groundY - h;
  // Body
  ctx.fillStyle = C.brick;
  ctx.fillRect(x, top + 12, w, h - 12);
  // Battlements
  for (let i = 0; i < 6; i++) {
    ctx.fillRect(x + i * 8, top + 4, 6, 10);
  }
  // Door
  ctx.fillStyle = C.brickMortar;
  ctx.fillRect(x + w / 2 - 5, groundY - 16, 10, 16);
  ctx.fillStyle = C.gold;
  ctx.fillRect(x + w / 2 - 5, groundY - 20, 10, 4);
  // Brick lines
  ctx.strokeStyle = C.brickShade;
  ctx.lineWidth = 1;
  for (let yy = top + 16; yy < groundY; yy += 6) {
    ctx.beginPath();
    ctx.moveTo(x, yy + 0.5);
    ctx.lineTo(x + w, yy + 0.5);
    ctx.stroke();
  }
}

function drawHeart(ctx: CanvasRenderingContext2D, x: number, y: number, s: number) {
  ctx.fillStyle = C.heart;
  // simple pixel heart
  const grid = [
    '.XX.XX.',
    'XXXXXXX',
    'XXXXXXX',
    '.XXXXX.',
    '..XXX..',
    '...X...',
  ];
  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < grid[r].length; c++) {
      if (grid[r][c] === 'X') ctx.fillRect(x + c * s, y + r * s, s, s);
    }
  }
}

interface Firework {
  x: number;
  y: number;
  vy: number;
  exploded: boolean;
  life: number;
  color: string;
  particles: { x: number; y: number; vx: number; vy: number }[];
}

const FIREWORK_COLORS = [
  C.gold,
  C.heart,
  '#ff00ff',
  '#00ffff',
  '#00ff00',
  '#ffffff',
];

type Phase = 'run' | 'rescue' | 'walk' | 'finale';

const WeddingQuest = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number | undefined>(undefined);
  const [playing, setPlaying] = useState(false);
  const [done, setDone] = useState(false);
  const runKeyRef = useRef(0);

  const start = () => {
    setDone(false);
    setPlaying(true);
    runKeyRef.current += 1;
  };

  useEffect(() => {
    if (!playing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.imageSmoothingEnabled = false;

    const groundY = VIEW_H - 24;
    const castleX = 300; // world coordinate of the castle
    const brideX = castleX - 20;

    let phase: Phase = 'run';
    let groomX = -20; // world coordinate
    let cameraX = 0;
    let frame = 0;
    let walkX = brideX; // shared x when walking together
    let finaleTimer = 0;
    const fireworks: Firework[] = [];
    let cancelled = false;

    const spawnFirework = () => {
      fireworks.push({
        x: 20 + Math.random() * (VIEW_W - 40),
        y: VIEW_H,
        vy: -(2 + Math.random() * 1.5),
        exploded: false,
        life: 60,
        color: FIREWORK_COLORS[Math.floor(Math.random() * FIREWORK_COLORS.length)],
        particles: [],
      });
    };

    const draw = () => {
      if (cancelled) return;
      frame++;

      // --- Update phase logic ---
      if (phase === 'run') {
        groomX += 1.6;
        cameraX = Math.min(groomX - 60, castleX - VIEW_W + 70);
        cameraX = Math.max(0, cameraX);
        if (groomX >= brideX - 22) {
          groomX = brideX - 22;
          phase = 'rescue';
          finaleTimer = 0;
        }
      } else if (phase === 'rescue') {
        finaleTimer++;
        if (finaleTimer > 70) {
          phase = 'walk';
          walkX = groomX;
        }
      } else if (phase === 'walk') {
        walkX -= 1.4;
        cameraX = Math.max(0, walkX - 60);
        if (walkX <= cameraX + 40) {
          phase = 'finale';
          finaleTimer = 0;
        }
      } else if (phase === 'finale') {
        finaleTimer++;
        if (finaleTimer % 22 === 0) spawnFirework();
        if (finaleTimer > 260 && fireworks.length === 0) {
          cancelled = true;
          setPlaying(false);
          setDone(true);
          return;
        }
      }

      // --- Render ---
      // Sky
      ctx.fillStyle = C.sky;
      ctx.fillRect(0, 0, VIEW_W, VIEW_H);

      // Clouds (parallax)
      ctx.fillStyle = C.cloud;
      const cloudOffset = -(cameraX * 0.3) % 120;
      for (let i = -1; i < 4; i++) {
        const cx = cloudOffset + i * 120 + 20;
        ctx.fillRect(cx, 24, 22, 8);
        ctx.fillRect(cx + 6, 20, 14, 6);
        ctx.fillRect(cx - 6, 28, 10, 4);
      }

      // Hills (parallax)
      const hillOffset = -(cameraX * 0.5) % 128;
      for (let i = -1; i < 4; i++) {
        const hx = hillOffset + i * 128 + 40;
        ctx.fillStyle = C.hillDark;
        ctx.beginPath();
        ctx.moveTo(hx - 30, groundY);
        ctx.lineTo(hx, groundY - 34);
        ctx.lineTo(hx + 30, groundY);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = C.hillLight;
        ctx.beginPath();
        ctx.moveTo(hx - 14, groundY);
        ctx.lineTo(hx, groundY - 22);
        ctx.lineTo(hx + 14, groundY);
        ctx.closePath();
        ctx.fill();
      }

      // Ground
      ctx.fillStyle = C.ground;
      ctx.fillRect(0, groundY, VIEW_W, VIEW_H - groundY);
      ctx.fillStyle = C.groundDark;
      ctx.fillRect(0, groundY, VIEW_W, 3);
      // Ground brick texture
      ctx.fillStyle = C.groundDark;
      const gOff = -cameraX % 16;
      for (let x = gOff; x < VIEW_W; x += 16) {
        ctx.fillRect(x, groundY + 6, 1, VIEW_H - groundY - 6);
      }

      // Castle (screen space)
      drawCastle(ctx, castleX - cameraX, groundY);

      // Bride (stands until rescued, then hidden while walking as pair)
      const brideScreenX = brideX - cameraX;
      if (phase === 'run' || phase === 'rescue') {
        // little bounce when rescued
        const by = groundY - 11 + (phase === 'rescue' ? Math.sin(frame * 0.4) * 1 : 0);
        drawSprite(ctx, BRIDE_STAND, BRIDE_PALETTE, brideScreenX, by);
        if (phase === 'rescue') {
          drawHeart(ctx, brideScreenX - 6, by - 12, 1);
          drawHeart(ctx, brideScreenX + 14, by - 14, 1);
        }
      }

      // Groom
      const groomScreenX = (phase === 'walk' || phase === 'finale' ? walkX : groomX) - cameraX;
      const gy = groundY - 11;
      if (phase === 'run') {
        const runFrame = Math.floor(frame / 6) % 2 === 0 ? GROOM_A : GROOM_B;
        drawSprite(ctx, runFrame, GROOM_PALETTE, groomScreenX, gy);
      } else if (phase === 'rescue') {
        drawSprite(ctx, GROOM_IDLE, GROOM_PALETTE, groomScreenX, gy);
      } else {
        // walking together: groom + bride side by side, gentle bob
        const bob = Math.floor(frame / 8) % 2 === 0 ? 0 : 1;
        drawSprite(ctx, GROOM_IDLE, GROOM_PALETTE, groomScreenX, gy - bob);
        drawSprite(ctx, BRIDE_STAND, BRIDE_PALETTE, groomScreenX + 10, gy - (1 - bob));
        drawHeart(ctx, groomScreenX + 4, gy - 12, 1);
      }

      // Fireworks (finale)
      if (phase === 'finale') {
        for (let i = fireworks.length - 1; i >= 0; i--) {
          const fw = fireworks[i];
          if (!fw.exploded) {
            fw.y += fw.vy;
            fw.vy += 0.03;
            ctx.fillStyle = fw.color;
            ctx.fillRect(fw.x, fw.y, 2, 3);
            if (fw.vy >= -0.2 || fw.y < 40) {
              fw.exploded = true;
              const n = 18;
              for (let p = 0; p < n; p++) {
                const ang = (Math.PI * 2 * p) / n;
                const spd = 1 + Math.random() * 1.4;
                fw.particles.push({
                  x: fw.x,
                  y: fw.y,
                  vx: Math.cos(ang) * spd,
                  vy: Math.sin(ang) * spd,
                });
              }
            }
          } else {
            fw.life--;
            ctx.fillStyle = fw.color;
            for (const pt of fw.particles) {
              pt.x += pt.vx;
              pt.y += pt.vy;
              pt.vy += 0.04;
              ctx.fillRect(pt.x, pt.y, 2, 2);
            }
            if (fw.life <= 0) fireworks.splice(i, 1);
          }
        }
      }

      // "YOU SAVED THE BRIDE!" / finale text
      if (phase === 'rescue' || phase === 'walk' || phase === 'finale') {
        ctx.fillStyle = C.gold;
        ctx.font = '10px monospace';
        ctx.textAlign = 'center';
        const msg =
          phase === 'finale' ? 'HAPPILY EVER AFTER!' : 'RACHEL SAVED!  <3';
        // simple shadow
        ctx.fillStyle = '#000000';
        ctx.fillText(msg, VIEW_W / 2 + 1, 18 + 1);
        ctx.fillStyle = C.gold;
        ctx.fillText(msg, VIEW_W / 2, 18);
        ctx.textAlign = 'left';
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      cancelled = true;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [playing]);

  return (
    <div className="wedding-quest">
      <div className="wq-screen-frame">
        <canvas
          ref={canvasRef}
          width={VIEW_W}
          height={VIEW_H}
          style={{ width: VIEW_W * SCALE, height: VIEW_H * SCALE }}
          className="wq-canvas"
        />
        {!playing && (
          <div className="wq-overlay">
            <div className="wq-title">
              {done ? '★ THE END ★' : "TIM'S QUEST"}
            </div>
            <div className="wq-subtitle">
              {done ? 'Rachel & Tim forever!' : 'Save the bride & light the sky!'}
            </div>
            <button className="wq-start-btn" onClick={start}>
              {done ? '↻ PLAY AGAIN' : '▶ PRESS START'}
            </button>
          </div>
        )}
      </div>
      <p className="wq-caption">
        An 8-bit love story — the groom races through World 1-1 to rescue the
        bride, then the sky lights up. 💕
      </p>
    </div>
  );
};

export default WeddingQuest;

// Made with Bob
