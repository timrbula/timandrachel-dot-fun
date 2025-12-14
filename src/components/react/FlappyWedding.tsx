import { useEffect, useRef, useState } from 'react';
import './FlappyWedding.css';

interface GameObject {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Pipe extends GameObject {
  scored: boolean;
}

const FlappyWedding = ({ onScoreSubmitted }: { onScoreSubmitted?: () => void }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [showNameInput, setShowNameInput] = useState(false);
  const [playerName, setPlayerName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [qualifiesForLeaderboard, setQualifiesForLeaderboard] = useState(false);

  // Game state refs
  const gameStateRef = useRef({
    bird: { x: 100, y: 250, width: 40, height: 40, velocity: 0 },
    pipes: [] as Pipe[],
    score: 0,
    frameCount: 0,
  });

  const gameLoopRef = useRef<number | undefined>(undefined);

  // Load high score from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('flappyWeddingHighScore');
    if (saved) setHighScore(parseInt(saved, 10));
  }, []);

  // Game constants - Made easier!
  const GRAVITY = 0.2; // Reduced from 0.5 for slower falling
  const JUMP_STRENGTH = -5; // Reduced from -10 for gentler jumps
  const PIPE_WIDTH = 70; // Reduced from 80 for narrower obstacles
  const PIPE_GAP = 220; // Increased from 180 for bigger gap
  const PIPE_SPEED = 2.5; // Reduced from 3 for slower movement
  const SPAWN_INTERVAL = 110; // Increased from 90 for more time between pipes
  
  // Manhattan building types
  const BUILDING_TYPES = ['empire', 'chrysler', 'onewtc', 'standard'] as const;

  const drawBird = (ctx: CanvasRenderingContext2D, bird: GameObject) => {
    // Draw bride/groom character (alternating) - emoji style!
    const isBride = Math.floor(Date.now() / 500) % 2 === 0;
    
    ctx.save();
    ctx.translate(bird.x + bird.width / 2, bird.y + bird.height / 2);
    
    // Body (draw first so it's behind the head)
    if (isBride) {
      // Bride - White wedding dress
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      // Dress shape (trapezoid/triangle)
      ctx.moveTo(-8, 15);  // Top left
      ctx.lineTo(-14, 28); // Bottom left (wider)
      ctx.lineTo(14, 28);  // Bottom right
      ctx.lineTo(8, 15);   // Top right
      ctx.closePath();
      ctx.fill();
      
      // Dress outline
      ctx.strokeStyle = '#E0E0E0';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Dress details (lace pattern)
      ctx.strokeStyle = '#FFD700';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(-10, 20);
      ctx.lineTo(10, 20);
      ctx.moveTo(-12, 24);
      ctx.lineTo(12, 24);
      ctx.stroke();
      
      // Arms
      ctx.fillStyle = '#FFD700';
      ctx.beginPath();
      ctx.arc(-12, 18, 4, 0, Math.PI * 2);
      ctx.arc(12, 18, 4, 0, Math.PI * 2);
      ctx.fill();
      
    } else {
      // Groom - Black tuxedo
      ctx.fillStyle = '#000000';
      ctx.fillRect(-10, 15, 20, 15); // Suit jacket
      
      // White shirt
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(-6, 15, 12, 8);
      
      // Bow tie
      ctx.fillStyle = '#FF1493'; // Hot pink bow tie
      ctx.beginPath();
      ctx.moveTo(-6, 18);
      ctx.lineTo(-8, 20);
      ctx.lineTo(-6, 22);
      ctx.lineTo(0, 20);
      ctx.lineTo(6, 22);
      ctx.lineTo(8, 20);
      ctx.lineTo(6, 18);
      ctx.lineTo(0, 20);
      ctx.closePath();
      ctx.fill();
      
      // Jacket buttons
      ctx.fillStyle = '#FFD700';
      ctx.beginPath();
      ctx.arc(0, 24, 2, 0, Math.PI * 2);
      ctx.arc(0, 28, 2, 0, Math.PI * 2);
      ctx.fill();
      
      // Arms
      ctx.fillStyle = '#FFD700';
      ctx.beginPath();
      ctx.arc(-12, 20, 4, 0, Math.PI * 2);
      ctx.arc(12, 20, 4, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Main head circle (larger, emoji-like)
    ctx.fillStyle = '#FFD700'; // Golden/yellow emoji color
    ctx.beginPath();
    ctx.arc(0, 0, 18, 0, Math.PI * 2);
    ctx.fill();
    
    // Add subtle outline
    ctx.strokeStyle = '#FFA500';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Eyes (bigger, more expressive)
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(-6, -3, 3, 0, Math.PI * 2);
    ctx.arc(6, -3, 3, 0, Math.PI * 2);
    ctx.fill();
    
    // Eye shine (makes them look more alive)
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(-5, -4, 1.5, 0, Math.PI * 2);
    ctx.arc(7, -4, 1.5, 0, Math.PI * 2);
    ctx.fill();
    
    // Big smile
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 2, 10, 0.2, Math.PI - 0.2);
    ctx.stroke();
    
    // Rosy cheeks
    ctx.fillStyle = 'rgba(255, 182, 193, 0.6)';
    ctx.beginPath();
    ctx.arc(-10, 3, 4, 0, Math.PI * 2);
    ctx.arc(10, 3, 4, 0, Math.PI * 2);
    ctx.fill();
    
    // Accessory on top
    if (isBride) {
      // Bride - Veil emoji style (white flowing fabric)
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(0, -18, 12, Math.PI, 0);
      ctx.fill();
      
      // Veil detail
      ctx.strokeStyle = '#E0E0E0';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(-10, -18);
      ctx.lineTo(-12, -10);
      ctx.moveTo(10, -18);
      ctx.lineTo(12, -10);
      ctx.stroke();
      
      // Small crown/tiara
      ctx.fillStyle = '#FFD700';
      ctx.beginPath();
      ctx.moveTo(-8, -18);
      ctx.lineTo(-6, -22);
      ctx.lineTo(-4, -18);
      ctx.lineTo(-2, -23);
      ctx.lineTo(0, -18);
      ctx.lineTo(2, -23);
      ctx.lineTo(4, -18);
      ctx.lineTo(6, -22);
      ctx.lineTo(8, -18);
      ctx.fill();
    } else {
      // Groom - Top hat emoji style
      ctx.fillStyle = '#000000';
      // Hat brim
      ctx.fillRect(-12, -18, 24, 3);
      // Hat top
      ctx.fillRect(-9, -28, 18, 10);
      
      // Hat band
      ctx.fillStyle = '#4169E1'; // Royal blue
      ctx.fillRect(-9, -20, 18, 3);
    }
    
    ctx.restore();
  };

  const drawPipe = (ctx: CanvasRenderingContext2D, pipe: Pipe & { buildingType?: string }, isTop: boolean) => {
    const buildingType = pipe.buildingType || 'standard';
    
    if (buildingType === 'empire') {
      // EMPIRE STATE BUILDING - Iconic Art Deco design
      ctx.fillStyle = '#D4D4D4'; // Light gray limestone
      ctx.fillRect(pipe.x, pipe.y, pipe.width, pipe.height);
      
      // Setback design (Art Deco stepped profile)
      ctx.fillStyle = '#B8B8B8';
      const setbackWidth = pipe.width * 0.8;
      ctx.fillRect(pipe.x + (pipe.width - setbackWidth) / 2, pipe.y, setbackWidth, pipe.height * 0.3);
      
      if (!isTop) {
        // Famous spire at top
        const spireWidth = 12;
        const spireHeight = 25;
        ctx.fillStyle = '#FFD700'; // Gold spire
        ctx.fillRect(pipe.x + pipe.width / 2 - spireWidth / 2, pipe.y, spireWidth, spireHeight);
        
        // Antenna on top
        ctx.fillStyle = '#FF0000';
        ctx.fillRect(pipe.x + pipe.width / 2 - 1, pipe.y, 2, 10);
        
        // Observation deck lights
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(pipe.x + pipe.width / 2 - 8, pipe.y + spireHeight, 16, 8);
      }
      
      // Windows in vertical strips (Empire State style)
      ctx.fillStyle = '#FFFF00';
      for (let y = pipe.y + 35; y < pipe.y + pipe.height - 5; y += 8) {
        for (let x = pipe.x + 6; x < pipe.x + pipe.width - 6; x += 8) {
          ctx.fillRect(x, y, 4, 5);
        }
      }
      
      // Gold Art Deco border
      ctx.strokeStyle = '#FFD700';
      ctx.lineWidth = 3;
      ctx.strokeRect(pipe.x, pipe.y, pipe.width, pipe.height);
      
    } else if (buildingType === 'chrysler') {
      // CHRYSLER BUILDING - Distinctive Art Deco crown
      ctx.fillStyle = '#C0C0C0'; // Stainless steel color
      ctx.fillRect(pipe.x, pipe.y, pipe.width, pipe.height);
      
      if (!isTop) {
        // Famous terraced crown with triangular windows
        const crownLevels = 7;
        ctx.fillStyle = '#E8E8E8'; // Bright steel
        for (let i = 0; i < crownLevels; i++) {
          const levelWidth = pipe.width - (i * 6);
          const levelHeight = 4;
          const levelY = pipe.y + (i * 4);
          ctx.fillRect(pipe.x + (pipe.width - levelWidth) / 2, levelY, levelWidth, levelHeight);
          
          // Triangular windows on crown
          ctx.fillStyle = '#FFFFFF';
          const numWindows = Math.max(2, Math.floor(levelWidth / 10));
          for (let w = 0; w < numWindows; w++) {
            const wx = pipe.x + (pipe.width - levelWidth) / 2 + (w * (levelWidth / numWindows)) + 2;
            ctx.beginPath();
            ctx.moveTo(wx, levelY + levelHeight);
            ctx.lineTo(wx + 3, levelY);
            ctx.lineTo(wx + 6, levelY + levelHeight);
            ctx.closePath();
            ctx.fill();
          }
          ctx.fillStyle = '#E8E8E8';
        }
        
        // Eagle gargoyles (simplified as rectangles)
        ctx.fillStyle = '#A0A0A0';
        ctx.fillRect(pipe.x, pipe.y + 30, 8, 8);
        ctx.fillRect(pipe.x + pipe.width - 8, pipe.y + 30, 8, 8);
      }
      
      // Regular windows
      ctx.fillStyle = '#FFFF00';
      for (let y = pipe.y + 40; y < pipe.y + pipe.height - 5; y += 9) {
        for (let x = pipe.x + 8; x < pipe.x + pipe.width - 8; x += 9) {
          ctx.fillRect(x, y, 5, 6);
        }
      }
      
      // Metallic border
      ctx.strokeStyle = '#E8E8E8';
      ctx.lineWidth = 3;
      ctx.strokeRect(pipe.x, pipe.y, pipe.width, pipe.height);
      
    } else if (buildingType === 'onewtc') {
      // ONE WORLD TRADE CENTER - Modern glass design
      ctx.fillStyle = '#A8A8A8'; // Glass/steel
      ctx.fillRect(pipe.x, pipe.y, pipe.width, pipe.height);
      
      // Chamfered edges (tapered design)
      ctx.fillStyle = '#C0C0C0';
      const chamfer = 8;
      ctx.beginPath();
      ctx.moveTo(pipe.x, pipe.y);
      ctx.lineTo(pipe.x + chamfer, pipe.y + pipe.height * 0.2);
      ctx.lineTo(pipe.x, pipe.y + pipe.height * 0.4);
      ctx.closePath();
      ctx.fill();
      
      ctx.beginPath();
      ctx.moveTo(pipe.x + pipe.width, pipe.y);
      ctx.lineTo(pipe.x + pipe.width - chamfer, pipe.y + pipe.height * 0.2);
      ctx.lineTo(pipe.x + pipe.width, pipe.y + pipe.height * 0.4);
      ctx.closePath();
      ctx.fill();
      
      if (!isTop) {
        // Tall spire (408 feet!)
        const spireWidth = 8;
        const spireHeight = 35;
        ctx.fillStyle = '#E0E0E0';
        ctx.fillRect(pipe.x + pipe.width / 2 - spireWidth / 2, pipe.y, spireWidth, spireHeight);
        
        // Beacon light at top
        ctx.fillStyle = '#00FFFF';
        ctx.fillRect(pipe.x + pipe.width / 2 - 3, pipe.y, 6, 8);
        
        // Antenna
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(pipe.x + pipe.width / 2 - 1, pipe.y, 2, 15);
      }
      
      // Modern glass windows (reflective pattern)
      ctx.fillStyle = '#87CEEB'; // Sky blue reflection
      for (let y = pipe.y + 40; y < pipe.y + pipe.height - 5; y += 10) {
        for (let x = pipe.x + 5; x < pipe.x + pipe.width - 5; x += 10) {
          if ((x + y) % 20 === 0) {
            ctx.fillRect(x, y, 8, 8);
          }
        }
      }
      
      // Some lit windows
      ctx.fillStyle = '#FFFF00';
      for (let y = pipe.y + 40; y < pipe.y + pipe.height - 5; y += 10) {
        for (let x = pipe.x + 5; x < pipe.x + pipe.width - 5; x += 10) {
          if (Math.random() > 0.6) {
            ctx.fillRect(x, y, 8, 8);
          }
        }
      }
      
      // White modern border
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 3;
      ctx.strokeRect(pipe.x, pipe.y, pipe.width, pipe.height);
      
    } else {
      // STANDARD NYC BUILDING
      ctx.fillStyle = '#4A4A4A';
      ctx.fillRect(pipe.x, pipe.y, pipe.width, pipe.height);
      
      // Regular windows
      ctx.fillStyle = '#FFFF00';
      for (let y = pipe.y + 10; y < pipe.y + pipe.height - 5; y += 10) {
        for (let x = pipe.x + 8; x < pipe.x + pipe.width - 8; x += 10) {
          if (Math.random() > 0.3) {
            ctx.fillRect(x, y, 5, 6);
          }
        }
      }
      
      ctx.strokeStyle = '#00FFFF';
      ctx.lineWidth = 2;
      ctx.strokeRect(pipe.x, pipe.y, pipe.width, pipe.height);
    }
  };

  const drawBackground = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, frameCount: number) => {
    // Manhattan night sky gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#1a1a2e');
    gradient.addColorStop(0.5, '#16213e');
    gradient.addColorStop(1, '#0f3460');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Stars twinkling
    ctx.fillStyle = '#FFFFFF';
    for (let i = 0; i < 60; i++) {
      const x = (i * 37) % canvas.width;
      const y = (i * 53) % (canvas.height - 100);
      const twinkle = Math.sin(frameCount * 0.05 + i) > 0.5;
      if (twinkle) {
        ctx.fillRect(x, y, 2, 2);
      }
    }
    
    // Yellow taxi cabs moving across (Manhattan traffic!)
    const taxiX = (frameCount * 3) % (canvas.width + 100);
    ctx.fillStyle = '#FFFF00';
    ctx.fillRect(taxiX - 100, canvas.height - 75, 30, 15);
    ctx.fillStyle = '#000000';
    ctx.fillRect(taxiX - 95, canvas.height - 73, 8, 8);
    ctx.fillRect(taxiX - 78, canvas.height - 73, 8, 8);
    
    // Second taxi going opposite direction
    const taxiX2 = canvas.width - ((frameCount * 2.5) % (canvas.width + 100));
    ctx.fillStyle = '#FFFF00';
    ctx.fillRect(taxiX2, canvas.height - 90, 30, 15);
    ctx.fillStyle = '#000000';
    ctx.fillRect(taxiX2 + 5, canvas.height - 88, 8, 8);
    ctx.fillRect(taxiX2 + 22, canvas.height - 88, 8, 8);
    
    // Manhattan skyline silhouette at bottom
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, canvas.height - 60, canvas.width, 60);
    
    // Iconic Manhattan buildings silhouette
    const buildings = [
      { x: 0, h: 40, name: 'standard' },
      { x: 70, h: 55, name: 'standard' }, // Empire State
      { x: 140, h: 35, name: 'standard' },
      { x: 200, h: 50, name: 'chrysler' }, // Chrysler
      { x: 270, h: 45, name: 'empire' },
      { x: 340, h: 58, name: 'onewtc' }, // One WTC
      { x: 410, h: 38, name: 'chrysler' },
      { x: 480, h: 52, name: 'empire' },
      { x: 550, h: 42, name: 'onewtc' },
    ];
    
    buildings.forEach(b => {
      ctx.fillStyle = '#0a0a0a';
      ctx.fillRect(b.x, canvas.height - 60 - b.h, 60, b.h);
      
      // Add distinctive tops for iconic buildings
      if (b.name === 'empire') {
        // Empire State spire
        ctx.fillStyle = '#FFD700';
        ctx.fillRect(b.x + 25, canvas.height - 60 - b.h - 8, 10, 8);
      } else if (b.name === 'chrysler') {
        // Chrysler crown
        ctx.fillStyle = '#C0C0C0';
        for (let i = 0; i < 4; i++) {
          ctx.fillRect(b.x + 15 + (i * 3), canvas.height - 60 - b.h - (4 - i) * 2, 30 - (i * 6), 2);
        }
      } else if (b.name === 'onewtc') {
        // One WTC spire
        ctx.fillStyle = '#E0E0E0';
        ctx.fillRect(b.x + 27, canvas.height - 60 - b.h - 10, 6, 10);
      }
      
      // Building windows
      ctx.fillStyle = '#FFFF00';
      for (let y = canvas.height - 60 - b.h + 5; y < canvas.height - 65; y += 8) {
        for (let x = b.x + 5; x < b.x + 55; x += 10) {
          if (Math.random() > 0.3) {
            ctx.fillRect(x, y, 4, 4);
          }
        }
      }
    });
    
    // "MANHATTAN" text in the sky
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.font = 'bold 40px Impact';
    ctx.fillText('', canvas.width / 2 - 120, 80);
  };

  const checkCollision = (bird: GameObject, pipes: Pipe[], canvas: HTMLCanvasElement): boolean => {
    // Check ground and ceiling
    if (bird.y + bird.height > canvas.height - 60 || bird.y < 0) {
      return true;
    }

    // Check pipes
    for (const pipe of pipes) {
      if (
        bird.x + bird.width > pipe.x &&
        bird.x < pipe.x + pipe.width &&
        bird.y + bird.height > pipe.y &&
        bird.y < pipe.y + pipe.height
      ) {
        return true;
      }
    }

    return false;
  };

  const gameLoop = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const state = gameStateRef.current;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background
    drawBackground(ctx, canvas, state.frameCount);

    // Update bird
    state.bird.velocity += GRAVITY;
    state.bird.y += state.bird.velocity;

    // Update pipes
    state.frameCount++;
    
    // Spawn new pipe (Manhattan building)
    if (state.frameCount % SPAWN_INTERVAL === 0) {
      // Create more varied gap positions - force gaps to be in different vertical zones
      const playableHeight = canvas.height - 60 - PIPE_GAP;
      const zones = 5; // Divide playable area into 5 zones
      const zoneHeight = playableHeight / zones;
      
      // Pick a random zone (0-4) and place gap within that zone
      const zone = Math.floor(Math.random() * zones);
      const minHeightInZone = zone * zoneHeight + 50; // Add 50px padding
      const maxHeightInZone = (zone + 1) * zoneHeight - 50; // Subtract 50px padding
      
      // Ensure we have valid bounds
      const minHeight = Math.max(50, minHeightInZone);
      const maxHeight = Math.min(playableHeight - 50, maxHeightInZone);
      
      // Random height within the selected zone
      const topHeight = Math.random() * (maxHeight - minHeight) + minHeight;
      const buildingType = BUILDING_TYPES[Math.floor(Math.random() * BUILDING_TYPES.length)];
      
      state.pipes.push({
        x: canvas.width,
        y: 0,
        width: PIPE_WIDTH,
        height: topHeight,
        scored: false,
        buildingType,
      } as Pipe & { buildingType: string });
      
      state.pipes.push({
        x: canvas.width,
        y: topHeight + PIPE_GAP,
        width: PIPE_WIDTH,
        height: canvas.height - 60 - topHeight - PIPE_GAP,
        scored: false,
        buildingType,
      } as Pipe & { buildingType: string });
    }

    // Move and draw pipes
    state.pipes = state.pipes.filter(pipe => {
      pipe.x -= PIPE_SPEED;
      
      // Score when passing pipe
      if (!pipe.scored && pipe.x + pipe.width < state.bird.x) {
        pipe.scored = true;
        if (pipe.y === 0) { // Only count top pipes
          state.score++;
          setScore(state.score);
        }
      }
      
      drawPipe(ctx, pipe as Pipe & { buildingType?: string }, pipe.y === 0);
      
      return pipe.x + pipe.width > 0;
    });

    // Draw bird
    drawBird(ctx, state.bird);

    // Check collision
    if (checkCollision(state.bird, state.pipes, canvas)) {
      setGameOver(true);
      setGameStarted(false);
      
      // Update high score
      if (state.score > highScore) {
        setHighScore(state.score);
        localStorage.setItem('flappyWeddingHighScore', state.score.toString());
      }
      
      // Check if score qualifies for leaderboard
      checkLeaderboardQualification(state.score);
      
      return;
    }

    // Continue game loop
    gameLoopRef.current = requestAnimationFrame(gameLoop);
  };

  const startGame = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Reset game state
    gameStateRef.current = {
      bird: { x: 100, y: 250, width: 40, height: 40, velocity: 0 },
      pipes: [],
      score: 0,
      frameCount: 0,
    };

    setScore(0);
    setGameOver(false);
    setGameStarted(true);

    // Start game loop
    gameLoopRef.current = requestAnimationFrame(gameLoop);
  };

  const jump = () => {
    if (!gameStarted || gameOver) return;
    gameStateRef.current.bird.velocity = JUMP_STRENGTH;
  };

  const checkLeaderboardQualification = async (finalScore: number) => {
    if (finalScore === 0) return;
    
    try {
      const response = await fetch('/api/game-scores');
      if (!response.ok) {
        console.error(response);
        return;
      }
      
      const data = await response.json();
      const leaderboard = data.leaderboard || [];
      
      // Check if score qualifies for top 10
      if (leaderboard.length < 10 || finalScore > leaderboard[leaderboard.length - 1].score) {
        setQualifiesForLeaderboard(true);
        setShowNameInput(true);
      }
    } catch (error) {
      console.error('Error checking leaderboard:', error);
    }
  };

  const handleSubmitScore = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!playerName.trim() || submitting) return;
    
    setSubmitting(true);
    setSubmitError(null);
    
    try {
      const response = await fetch('/api/game-scores', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: playerName.trim(),
          score: score,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        console.error(response);
        console.error(data);
        throw new Error(data.error || 'Failed to submit score');
      }
      
      setSubmitSuccess(true);
      setShowNameInput(false);
      
      // Call callback to refresh leaderboard
      if (onScoreSubmitted) {
        onScoreSubmitted();
      }
      
      // Reset after a delay
      setTimeout(() => {
        setSubmitSuccess(false);
        setPlayerName('');
      }, 3000);
    } catch (error) {
      console.error('Error submitting score:', error);
      setSubmitError(error instanceof Error ? error.message : 'Failed to submit score');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSkipSubmit = () => {
    setShowNameInput(false);
    setQualifiesForLeaderboard(false);
    setPlayerName('');
  };

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        if (!gameStarted && !gameOver) {
          startGame();
        } else {
          jump();
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameStarted, gameOver]);

  useEffect(() => {
    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, []);

  return (
    <div className="flappy-wedding">
      <div className="game-container">
        <canvas
          ref={canvasRef}
          width={600}
          height={500}
          onClick={() => {
            if (!gameStarted && !gameOver) {
              startGame();
            } else {
              jump();
            }
          }}
          className="game-canvas"
        />
        
        <div className="game-ui">
          <div className="score-display">
            <span className="score-label">Score:</span>
            <span className="score-value">{score}</span>
          </div>
          <div className="high-score-display">
            <span className="score-label">High Score:</span>
            <span className="score-value">{highScore}</span>
          </div>
        </div>

        {!gameStarted && !gameOver && (
          <div className="game-overlay">
            <h2 className="game-title">💕 Flappy Wedding 💕</h2>
            <p className="game-instructions">
              Keep love alive in the city!
            </p>
            <p className="game-instructions manhattan-subtitle">
              🗽 Empire State • Chrysler • One WTC 🗽
            </p>
            <p className="game-instructions">
              Click or press SPACE to start
            </p>
            <button className="geo-button geo-button-primary" onClick={startGame}>
              Start Game
            </button>
          </div>
        )}

        {gameOver && !showNameInput && (
          <div className="game-overlay">
            <h2 className="game-title">Game Over!</h2>
            <p className="final-score">Final Score: {score}</p>
            {score > highScore - 1 && score > 0 && (
              <p className="new-high-score blink">🎉 New High Score! 🎉</p>
            )}
            {submitSuccess && (
              <p className="submit-success blink">✨ Score submitted to leaderboard! ✨</p>
            )}
            <button className="geo-button geo-button-warning" onClick={startGame}>
              Try Again
            </button>
          </div>
        )}

        {showNameInput && (
          <div className="game-overlay">
            <h2 className="game-title">🏆 Top 10 Score! 🏆</h2>
            <p className="final-score">Your Score: {score}</p>
            <p className="leaderboard-qualify-text">
              You made it to the leaderboard! Enter your name:
            </p>
            <form onSubmit={handleSubmitScore} className="name-input-form">
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Enter your name"
                maxLength={50}
                className="name-input"
                autoFocus
                disabled={submitting}
              />
              {submitError && (
                <p className="submit-error">{submitError}</p>
              )}
              <div className="name-input-buttons">
                <button
                  type="submit"
                  className="geo-button geo-button-primary"
                  disabled={submitting || !playerName.trim()}
                >
                  {submitting ? 'Submitting...' : 'Submit Score'}
                </button>
                <button
                  type="button"
                  className="geo-button geo-button-secondary"
                  onClick={handleSkipSubmit}
                  disabled={submitting}
                >
                  Skip
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      <div className="game-info geo-box-neon">
        <h3>How to Play</h3>
        <ul>
          <li>🖱️ Click or press SPACE to make the couple jump</li>
          <li>💕 Don't let Rachel and Tim die!</li>
          <li>🏙️ Dodge Manhattan's iconic skyscrapers!</li>
          <li>🚕 Watch the yellow cabs cruise by</li>
          <li>🎯 Beat your high score!</li>
        </ul>
      </div>
    </div>
  );
};

export default FlappyWedding;

// Made with Bob
