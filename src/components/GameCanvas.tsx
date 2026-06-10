import React, { useRef, useEffect, useState } from 'react';
import { GameStats, Skin, Hat, Trail, Mission, Achievement } from '../types';
import { playCoinSound, playFlapSound, playHitSound, playPowerUpSound } from '../utils/audio';

// Visual helper to look up active skins, hats, and trail attributes
import { ALL_SKINS, ALL_HATS, ALL_TRAILS } from './ShopScreen';

interface GameCanvasProps {
  stats: GameStats;
  score: number;
  setScore: React.Dispatch<React.SetStateAction<number>>;
  coinsThisRun: number;
  setCoinsThisRun: React.Dispatch<React.SetStateAction<number>>;
  obstaclesPassedThisRun: number;
  setObstaclesPassedThisRun: React.Dispatch<React.SetStateAction<number>>;
  distanceThisRun: number;
  setDistanceThisRun: React.Dispatch<React.SetStateAction<number>>;
  isGameOver: boolean;
  isPlaying: boolean;
  onGameOver: (finalScore: number, finalCoins: number) => void;
  onMissionUpdate: (type: string, amount: number) => void;
  onAchievementUnlock: (id: string) => void;
}

// Particle class for fancy flight trails
class TrailParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  alpha: number;
  decay: number;
  type: string;
  angle: number;
  spin: number;

  constructor(x: number, y: number, color: string, type: string) {
    this.x = x;
    this.y = y;
    this.vx = -1.5 - Math.random() * 2; // drift left
    this.vy = (Math.random() - 0.5) * 1.5;
    this.color = color;
    this.size = type === 'bubbles' ? 4 + Math.random() * 6 : 5 + Math.random() * 5;
    this.alpha = 1;
    this.decay = 0.015 + Math.random() * 0.02;
    this.type = type;
    this.angle = Math.random() * Math.PI * 2;
    this.spin = (Math.random() - 0.5) * 0.1;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.alpha -= this.decay;
    this.angle += this.spin;
    if (this.type === 'bubbles') {
      this.vy -= 0.05; // float bubbles slightly upwards
      this.size += 0.05;
    } else if (this.type === 'smoke') {
      this.size += 0.15; // puff expands
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    if (this.alpha <= 0) return;
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.translate(this.x, this.y);

    if (this.type === 'rainbow') {
      ctx.beginPath();
      ctx.arc(0, 0, this.size * 0.8, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.fill();
    } else if (this.type === 'sparkles') {
      // Draw diamond scale
      ctx.rotate(this.angle);
      ctx.beginPath();
      ctx.moveTo(0, -this.size);
      ctx.lineTo(this.size / 2, 0);
      ctx.lineTo(0, this.size);
      ctx.lineTo(-this.size / 2, 0);
      ctx.closePath();
      ctx.fillStyle = '#FBBF24'; // beautiful gold sparkle
      ctx.fill();
    } else if (this.type === 'bubbles') {
      // Draw soap bubbles with shine
      ctx.beginPath();
      ctx.arc(0, 0, this.size, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255,255,255,0.7)';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.fillStyle = 'rgba(219,234,254,0.3)';
      ctx.fill();
      // shine spot
      ctx.beginPath();
      ctx.arc(-this.size/3, -this.size/3, this.size/4, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
    } else if (this.type === 'stars') {
      // Draw 5 point star
      ctx.rotate(this.angle);
      ctx.beginPath();
      ctx.fillStyle = '#FEF08A';
      for (let i = 0; i < 5; i++) {
        ctx.lineTo(Math.cos((18 + i * 72) * Math.PI / 180) * this.size, -Math.sin((18 + i * 72) * Math.PI / 180) * this.size);
        ctx.lineTo(Math.cos((54 + i * 72) * Math.PI / 180) * (this.size / 2), -Math.sin((54 + i * 72) * Math.PI / 180) * (this.size / 2));
      }
      ctx.closePath();
      ctx.fill();
    } else {
      // Smoke puff
      ctx.beginPath();
      ctx.arc(0, 0, this.size, 0, Math.PI * 2);
      ctx.fillStyle = '#CBD5E1';
      ctx.fill();
    }
    ctx.restore();
  }
}

// Particle class for crashing and breaking elements (smoke debris)
class BreakParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  alpha: number;
  decay: number;
  gravity: number;

  constructor(x: number, y: number, color: string) {
    this.x = x;
    this.y = y;
    this.vx = (Math.random() - 0.5) * 6;
    this.vy = (Math.random() - 0.5) * 6 - 2;
    this.color = color;
    this.size = 3 + Math.random() * 5;
    this.alpha = 1;
    this.decay = 0.02 + Math.random() * 0.02;
    this.gravity = 0.15;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.vy += this.gravity;
    this.alpha -= this.decay;
  }

  draw(ctx: CanvasRenderingContext2D) {
    if (this.alpha <= 0) return;
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.restore();
  }
}

// Interfaces for game states
interface GameCoin {
  x: number;
  y: number;
  size: number;
  pulse: number;
  value: number;
  collected: boolean;
}

interface Obstacle {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'windmill' | 'balloon' | 'kites' | 'hot_balloon' | 'bird';
  color: string;
  passed: boolean;
  angle: number; // for rotating windmill sails
  rotationSpeed: number;
  bob: number; // floating balloons
  birdFlap: number;
}

interface GamePowerUp {
  x: number;
  y: number;
  size: number;
  type: 'magnet' | 'giant' | 'double' | 'shield';
  color: string;
}

export default function GameCanvas({
  stats,
  score,
  setScore,
  coinsThisRun,
  setCoinsThisRun,
  obstaclesPassedThisRun,
  setObstaclesPassedThisRun,
  distanceThisRun,
  setDistanceThisRun,
  isGameOver,
  isPlaying,
  onGameOver,
  onMissionUpdate,
  onAchievementUnlock,
}: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Sound, stats and cosmetic configurations
  const soundOn = stats.soundEffectsEnabled;

  // Active configurations
  const curSkin = ALL_SKINS.find((s) => s.id === stats.equippedSkinId) || ALL_SKINS[0];
  const curHat = ALL_HATS.find((h) => h.id === stats.equippedHatId) || ALL_HATS[0];
  const curTrail = ALL_TRAILS.find((t) => t.id === stats.equippedTrailId) || ALL_TRAILS[0];

  // Game Loop States using refs to speed up and keep frame consistent
  const stateRef = useRef({
    // Player coordinates
    playerY: 250,
    playerX: 100,
    playerVy: 0,
    playerRad: 18,
    playerAngle: 0,

    // Constant Physics
    gravity: 0.35,
    lift: -6.8,
    maxFall: 10,
    speedX: 3.5, // screen scroll speed

    // Game Arrays
    obstacles: [] as Obstacle[],
    coins: [] as GameCoin[],
    powerups: [] as GamePowerUp[],
    particles: [] as TrailParticle[],
    breaks: [] as BreakParticle[],

    // PowerUp states with durations (in frames, 60fps = 600 limits)
    magnetFrame: 0,
    giantFrame: 0,
    doubleFrame: 0,
    shieldActive: false,

    // Generator clocks
    obstacleIdCounter: 1,
    timeSinceLastObstacle: 0,
    timeSinceLastCoin: 0,
    timeSinceLastPowerup: 0,
    distanceScroller: 0,

    // Animation / rotation metrics
    visualPropellerAngle: 0,
  });

  // UI state for countdown meters
  const [activeMeters, setActiveMeters] = useState({
    magnet: 0,
    giant: 0,
    double: 0,
    shield: false,
  });

  // React to tap upward flap trigger
  const handleFlap = () => {
    if (!isPlaying || isGameOver) return;
    
    playFlapSound(soundOn);
    const state = stateRef.current;
    
    // Apply lift
    state.playerVy = state.lift;
    
    // Set fly angle
    state.playerAngle = -0.3;

    // Track mission trigger for Dragon skin or standard usage
    if (curSkin.id === 'dragon') {
      onMissionUpdate('use_skin', 1);
    }
  };

  // Touch & click event bindings
  useEffect(() => {
    const handleKeys = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        handleFlap();
      }
    };

    window.addEventListener('keydown', handleKeys);
    return () => window.removeEventListener('keydown', handleKeys);
  }, [isPlaying, isGameOver, stats]);

  // Main high-performance canvas cycle
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const state = stateRef.current;

    // Clear and reset state objects if brand new game started
    if (isPlaying && !isGameOver && state.obstacles.length === 0 && state.coins.length === 0) {
      state.playerY = 220;
      state.playerVy = 0;
      state.playerAngle = 0;
      state.obstacles = [];
      state.coins = [];
      state.powerups = [];
      state.particles = [];
      state.breaks = [];
      state.distanceScroller = 0;
      state.magnetFrame = 0;
      state.giantFrame = 0;
      state.doubleFrame = 0;
      state.shieldActive = curHat.id === 'pirate'; // Pirate Hat gets starter shield
      state.timeSinceLastObstacle = 120; // spawn soon
      state.timeSinceLastCoin = 0;
      state.timeSinceLastPowerup = -200; // delay powerups
      
      setScore(0);
      setCoinsThisRun(0);
      setObstaclesPassedThisRun(0);
      setDistanceThisRun(0);
    }

    const loop = () => {
      if (!isPlaying) {
        // Draw static attract sky scene if idle
        drawIdleSky(ctx, canvas.width, canvas.height);
        animId = requestAnimationFrame(loop);
        return;
      }

      if (isGameOver) {
        // Stop updating core simulation but let existing particles drift
        drawSkyOverlay(ctx, canvas.width, canvas.height);
        drawSimulation(ctx, true);
        animId = requestAnimationFrame(loop);
        return;
      }

      // -- Simulating calculations --
      updatePhysics();
      updateSpawns(canvas.width, canvas.height);
      updateCollisions();

      // -- Frame Render --
      drawSkyOverlay(ctx, canvas.width, canvas.height);
      drawSimulation(ctx, false);

      // Post meters update
      setActiveMeters({
        magnet: Math.max(0, Math.floor(state.magnetFrame / 6)),
        giant: Math.max(0, Math.floor(state.giantFrame / 6)),
        double: Math.max(0, Math.floor(state.doubleFrame / 6)),
        shield: state.shieldActive,
      });

      animId = requestAnimationFrame(loop);
    };

    // Core physics updates
    const updatePhysics = () => {
      // 1. Player gravity
      state.playerVy += state.gravity;
      if (state.playerVy > state.maxFall) state.playerVy = state.maxFall;
      state.playerY += state.playerVy;

      // Rotate airplane slightly based on falling velocity
      state.playerAngle += (state.playerVy * 0.04 - state.playerAngle) * 0.15;

      // Handle ground/ceiling bounds checks
      const ceilingHeight = 20;
      const floorHeight = canvas.height - 75; // above scrolling grass

      if (state.playerY < ceilingHeight) {
        state.playerY = ceilingHeight;
        state.playerVy = 0.5;
      }

      if (state.playerY > floorHeight) {
        // Hit standard floor grass!
        triggerCrash();
      }

      // 2. Increment distances
      state.distanceScroller += state.speedX * 0.12;
      const currentDist = Math.floor(state.distanceScroller);
      setDistanceThisRun(currentDist);
      onMissionUpdate('survival', currentDist);

      // Propeller cap rotating animation
      state.visualPropellerAngle += 0.35 + (state.speedX * 0.1);

      // Decrement active timers
      if (state.magnetFrame > 0) state.magnetFrame--;
      if (state.giantFrame > 0) state.giantFrame--;
      if (state.doubleFrame > 0) state.doubleFrame--;

      // 3. Move trail particles
      state.particles.forEach((p) => p.update());
      state.particles = state.particles.filter((p) => p.alpha > 0);

      // Custom color palette depending on trail selection
      let trailColor = '#38BDF8';
      if (curTrail.type === 'rainbow') {
        const colors = ['#FF5555', '#55FF55', '#5555FF', '#FFFF55'];
        trailColor = colors[Math.floor(Date.now() / 150) % colors.length];
      } else if (curTrail.type === 'stars') {
        trailColor = '#FEF08A';
      } else if (curTrail.type === 'bubbles') {
        trailColor = '#E0F2FE';
      } else if (curTrail.type === 'smoke') {
        trailColor = '#CBD5E1';
      } else if (curTrail.type === 'sparkles') {
        trailColor = '#FBBF24';
      }

      // Emit trail points periodically
      if (Math.random() < 0.6) {
        // Offset exhaust points from the back of plane
        const backX = state.playerX - 16;
        const backY = state.playerY + 2;
        state.particles.push(new TrailParticle(backX, backY, trailColor, curTrail.type));
      }

      // Move breaks particle crumbs
      state.breaks.forEach((bp) => bp.update());
      state.breaks = state.breaks.filter((bp) => bp.alpha > 0);
    };

    // Spawn algorithms for coins, balloons, windmills, and powerups
    const updateSpawns = (width: number, height: number) => {
      // 1. Spawn obstacles (increasing rates over score count)
      state.timeSinceLastObstacle += 1;
      const obstacleSpacing = Math.max(90, 180 - Math.min(80, score * 4));

      if (state.timeSinceLastObstacle >= obstacleSpacing) {
        state.timeSinceLastObstacle = 0;

        const types: ('windmill' | 'balloon' | 'kites' | 'hot_balloon' | 'bird')[] = [
          'windmill',
          'balloon',
          'kites',
          'hot_balloon',
          'bird'
        ];

        // Pick random obstacles
        const randType = types[Math.floor(Math.random() * types.length)];
        let posY = 100 + Math.random() * (height - 300);
        let obsWidth = 45;
        let obsHeight = 90;

        if (randType === 'windmill') {
          posY = height - 165; // Anchored to base grass floor
          obsWidth = 45;
          obsHeight = 110;
        } else if (randType === 'hot_balloon') {
          posY = 50 + Math.random() * 120;
          obsWidth = 60;
          obsHeight = 100;
        } else if (randType === 'bird') {
          posY = 70 + Math.random() * (height - 240);
          obsWidth = 40;
          obsHeight = 30;
        }

        const colors = ['#EF4444', '#F97316', '#3B82F6', '#8B5CF6', '#10B981'];
        const randColor = colors[Math.floor(Math.random() * colors.length)];

        state.obstacles.push({
          id: state.obstacleIdCounter++,
          x: width + 50,
          y: posY,
          width: obsWidth,
          height: obsHeight,
          type: randType,
          color: randColor,
          passed: false,
          angle: Math.random() * Math.PI,
          rotationSpeed: 0.02 + Math.random() * 0.03,
          bob: Math.random() * Math.PI * 2,
          birdFlap: 0,
        });
      }

      // Update obstacles
      state.obstacles.forEach((obs) => {
        // Move obstacles left
        let currentSpeed = state.speedX;
        if (obs.type === 'bird') {
          currentSpeed += 1.8; // Birds fly left double fast!
        }
        obs.x -= currentSpeed;

        // Custom animations
        if (obs.type === 'windmill') {
          obs.angle += obs.rotationSpeed;
        } else if (obs.type === 'balloon' || obs.type === 'hot_balloon') {
          obs.bob += 0.04;
          obs.y += Math.sin(obs.bob) * 0.4; // light breeze bobbing
        } else if (obs.type === 'bird') {
          obs.birdFlap += 0.2;
        }
      });

      // Purge offscreen items
      state.obstacles = state.obstacles.filter((obs) => obs.x > -100);

      // 2. Spawn coins
      state.timeSinceLastCoin += 1;
      const coinSpacing = 45;
      if (state.timeSinceLastCoin >= coinSpacing) {
        state.timeSinceLastCoin = 0;
        
        // Spawn coins in cute pattern queues (sine shapes or horizontal chains)
        if (Math.random() < 0.4) {
          const chainLength = 3 + Math.floor(Math.random() * 4);
          const baseHeight = 120 + Math.random() * (height - 300);
          const blockType = Math.random() < 0.5 ? 'sine' : 'flat';

          for (let i = 0; i < chainLength; i++) {
            let offsetHeight = baseHeight;
            if (blockType === 'sine') {
              offsetHeight += Math.sin(i * 0.8) * 40;
            }

            state.coins.push({
              x: width + 100 + i * 32,
              y: offsetHeight,
              size: 8,
              pulse: Math.random() * Math.PI * 2,
              value: 1,
              collected: false,
            });
          }
        }
      }

      // Update coins
      state.coins.forEach((coin) => {
        // Coin magnet mechanics
        let pullRadius = 90;
        if (curHat.id === 'crown') {
          pullRadius = 140; // Crown extends magnetic suction
        }
        
        const hasMagnetActive = state.magnetFrame > 0;
        const dragDist = hasMagnetActive ? pullRadius + 100 : pullRadius;

        if (hasMagnetActive || curHat.id === 'crown') {
          const dx = state.playerX - coin.x;
          const dy = state.playerY - coin.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < dragDist) {
            // Pull magnet coins fast towards plane
            const force = 6.2 * (1 - dist / dragDist);
            coin.x += (dx / dist) * force;
            coin.y += (dy / dist) * force;
          }
        }

        coin.x -= state.speedX;
        coin.pulse += 0.08;
      });
      state.coins = state.coins.filter((coin) => coin.x > -50 && !coin.collected);

      // 3. Spawn power-ups
      state.timeSinceLastPowerup += 1;
      const powerupSpacing = 650; // spawn rare
      if (state.timeSinceLastPowerup >= powerupSpacing) {
        state.timeSinceLastPowerup = 0;

        const pTypes: ('magnet' | 'giant' | 'double' | 'shield')[] = [
          'magnet',
          'giant',
          'double',
          'shield'
        ];
        const rType = pTypes[Math.floor(Math.random() * pTypes.length)];
        const pColors = {
          magnet: '#EC4899', // Magnet is hot pink
          giant: '#F59E0B',  // Giant is gold orange
          double: '#10B981', // 2x is bright emerald
          shield: '#3B82F6', // Shield is blue
        };

        state.powerups.push({
          x: width + 60,
          y: 150 + Math.random() * (height - 350),
          size: 14,
          type: rType,
          color: pColors[rType],
        });
      }

      // Move powerups
      state.powerups.forEach((pu) => {
        pu.x -= state.speedX;
      });
      state.powerups = state.powerups.filter((pu) => pu.x > -50);
    };

    // Bounding circle collision algorithms
    const updateCollisions = () => {
      const pX = state.playerX;
      const pY = state.playerY;
      const isGiant = state.giantFrame > 0;
      const effectiveRad = isGiant ? state.playerRad * 2.2 : state.playerRad;

      // 1. Obstacles Collision Check
      state.obstacles.forEach((obs) => {
        // Point scoring check
        if (!obs.passed && obs.x < pX) {
          obs.passed = true;
          setScore((prev) => {
            const next = prev + 1;
            onMissionUpdate('reach_score', next);
            return next;
          });
          setObstaclesPassedThisRun((prev) => prev + 1);
        }

        // Bounding check variables
        let collides = false;

        if (obs.type === 'windmill') {
          // Windmill blades collision checks
          // Tower trunk is tall vertical rect, or circle approximation
          const dTrunkX = pX - obs.x;
          const dTrunkY = pY - (obs.y + 60);
          const trunkDist = Math.sqrt(dTrunkX * dTrunkX + dTrunkY * dTrunkY);
          
          if (trunkDist < effectiveRad + 22) {
            collides = true;
          }

          // Blades collision rotation points
          for (let i = 0; i < 4; i++) {
            const angle = obs.angle + (i * Math.PI / 2);
            const bladeLen = 42;
            const bX = obs.x + Math.sin(angle) * (bladeLen * 0.7);
            const bY = obs.y + Math.cos(angle) * (bladeLen * 0.7);

            const dx = pX - bX;
            const dy = pY - bY;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < effectiveRad + 12) {
              collides = true;
              break;
            }
          }
        } else {
          // Standard circular / rectangular bounds box
          const dx = pX - obs.x;
          const dy = pY - obs.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          // Approximate bounds with simple box / sphere offset
          const threshold = effectiveRad + Math.min(obs.width, obs.height) * 0.45;
          if (dist < threshold) {
            collides = true;
          }
        }

        if (collides) {
          if (isGiant) {
            // Dynamic Smash! Destroy obstacle and play break crumbs
            playHitSound(soundOn);
            spawnBreakParticles(obs.x, obs.y, obs.color);
            // Delete obstacle immediately
            state.obstacles = state.obstacles.filter((o) => o.id !== obs.id);
            onMissionUpdate('activate_powerup', 1);
          } else if (state.shieldActive) {
            // Shield absorbs hit
            playHitSound(soundOn);
            spawnBreakParticles(pX, pY, '#60A5FA'); // blue shield sparks
            state.shieldActive = false; // break shield
            // Delete obstacle immediately
            state.obstacles = state.obstacles.filter((o) => o.id !== obs.id);
          } else {
            // Dead crash!
            triggerCrash();
          }
        }
      });

      // 2. Coin gathering check
      state.coins.forEach((coin) => {
        const dx = pX - coin.x;
        const dy = pY - coin.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist <= effectiveRad + coin.size + 4) {
          coin.collected = true;
          playCoinSound(soundOn);

          // Propeller cap multiplies coin values
          let coinMultiplier = 1;
          if (curHat.id === 'propeller') {
            coinMultiplier = 2; // Double rewards
          }
          if (state.doubleFrame > 0) {
            coinMultiplier *= 2; // Further compounding Double PowerUp
          }

          const awardAmount = coin.value * coinMultiplier;
          setCoinsThisRun((prev) => prev + awardAmount);
          onMissionUpdate('collect_coins', awardAmount);

          // Emit small splash sparkles
          for (let s = 0; s < 5; s++) {
            state.particles.push(new TrailParticle(coin.x, coin.y, '#FBBF24', 'sparkles'));
          }
        }
      });

      // 3. Power-Up trigger check
      state.powerups.forEach((pu) => {
        const dx = pX - pu.x;
        const dy = pY - pu.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist <= effectiveRad + pu.size + 4) {
          // Consume power-up
          playPowerUpSound(soundOn);
          pu.x = -150; // delete

          // Wizard Hat adds +3 seconds extra duration to powerups (+180 frames)
          const bonusFrames = curHat.id === 'wizard' ? 180 : 0;
          const basePowerupFrames = 600; // 10 seconds

          if (pu.type === 'magnet') {
            state.magnetFrame = basePowerupFrames + bonusFrames;
          } else if (pu.type === 'giant') {
            state.giantFrame = basePowerupFrames + bonusFrames;
          } else if (pu.type === 'double') {
            state.doubleFrame = basePowerupFrames + bonusFrames;
          } else if (pu.type === 'shield') {
            state.shieldActive = true;
          }

          // Emit visual explosion splash
          for (let j = 0; j < 12; j++) {
            state.particles.push(new TrailParticle(pu.x, pu.y, pu.color, 'sparkles'));
          }
          onMissionUpdate('activate_powerup', 1);
        }
      });
    };

    // Spawn block debris particles
    const spawnBreakParticles = (x: number, y: number, color: string) => {
      for (let i = 0; i < 15; i++) {
        state.breaks.push(new BreakParticle(x, y, color));
      }
    };

    // End run and save stats
    const triggerCrash = () => {
      playHitSound(soundOn);
      onGameOver(score, coinsThisRun);
    };

    // Run active render loop
    animId = requestAnimationFrame(loop);

    return () => cancelAnimationFrame(animId);
  }, [isPlaying, isGameOver, stats]);

  // Visual generator function: attractive static background sky
  const drawIdleSky = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
    // Elegant soft sky-blue gradient
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#7DD3FC'); // Sky Blue
    grad.addColorStop(1, '#BAE6FD'); // Slightly warm soft white
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Dynamic puff clouds logo
    ctx.fillStyle = 'rgba(255,255,255,0.78)';
    drawCloudAt(ctx, w * 0.25, 120, 40);
    drawCloudAt(ctx, w * 0.75, 180, 50);

    // Soft hills
    ctx.fillStyle = '#4ADE80'; // Grass Green
    ctx.beginPath();
    ctx.arc(w / 2, h + 240, h / 2 + 10, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#22C55E'; // Deep hills
    ctx.beginPath();
    ctx.arc(w / 2 - 120, h + 240, h / 2, 0, Math.PI * 2);
    ctx.fill();
  };

  // Base sky drawer
  const drawSkyOverlay = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#38BDF8'); // Vivid Bright Sky Blue
    grad.addColorStop(0.7, '#7DD3FC');
    grad.addColorStop(1, '#D0F2FE'); // Warm floor
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Parallax scrolling layout (Cloud scenery)
    const state = stateRef.current;
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    
    // Slow cloud layers
    const c1X = (w * 0.15 - state.distanceScroller * 0.15) % (w + 160);
    const c1Pos = c1X < -80 ? c1X + w + 160 : c1X;
    drawCloudAt(ctx, c1Pos, 90, 24);

    const c2X = (w * 0.65 - state.distanceScroller * 0.15) % (w + 160);
    const c2Pos = c2X < -80 ? c2X + w + 160 : c2X;
    drawCloudAt(ctx, c2Pos, 160, 32);

    // Medium hills layer (Grass Green base)
    ctx.fillStyle = '#86EFAC'; // Mint rolling hill background
    ctx.beginPath();
    const hillScroll1 = (-state.distanceScroller * 0.2) % w;
    ctx.arc(hillScroll1 + w*0.3, h + 240, w*0.8, 0, Math.PI * 2);
    ctx.arc(hillScroll1 + w*1.3, h + 240, w*0.8, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#4ADE80'; // Bright Grass Green
    ctx.beginPath();
    const hillScroll2 = (-state.distanceScroller * 0.45) % w;
    ctx.arc(hillScroll2 + w*0.1, h + 250, w*0.7, 0, Math.PI * 2);
    ctx.arc(hillScroll2 + w*1.1, h + 250, w*0.7, 0, Math.PI * 2);
    ctx.fill();

    // Floor green base row
    ctx.fillStyle = '#22C55E'; // Deep rich cartoon green
    ctx.fillRect(0, h - 55, w, 55);

    // Decorative grass path outlines
    ctx.fillStyle = '#15803D';
    for (let g = 0; g < w; g += 50) {
      const gOffset = (g - state.distanceScroller * 0.8) % (w + 50);
      const valX = gOffset < -30 ? gOffset + w + 50 : gOffset;
      ctx.beginPath();
      ctx.moveTo(valX, h - 55);
      ctx.lineTo(valX + 10, h - 62);
      ctx.lineTo(valX + 16, h - 55);
      ctx.fill();
    }
  };

  // Cloud drawing shape helper
  const drawCloudAt = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => {
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.arc(x - size * 0.6, y + size * 0.1, size * 0.7, 0, Math.PI * 2);
    ctx.arc(x + size * 0.6, y + size * 0.1, size * 0.7, 0, Math.PI * 2);
    ctx.arc(x - size * 1.1, y + size * 0.3, size * 0.5, 0, Math.PI * 2);
    ctx.arc(x + size * 1.1, y + size * 0.3, size * 0.5, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fill();
  };

  // Drawer routine for overall simulation contents
  const drawSimulation = (ctx: CanvasRenderingContext2D, frozen: boolean) => {
    const state = stateRef.current;

    // 1. Draw drift trail particles
    state.particles.forEach((p) => p.draw(ctx));

    // 2. Draw coins
    state.coins.forEach((coin) => {
      ctx.save();
      ctx.translate(coin.x, coin.y);

      // Rotating gold coin animation effect
      const rotSine = Math.abs(Math.sin(coin.pulse));

      ctx.beginPath();
      ctx.ellipse(0, 0, coin.size * rotSine, coin.size, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#EF4444'; // dark edge
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#D97706';
      ctx.stroke();
      
      ctx.fillStyle = '#FBBF24'; // beautiful pure gold
      ctx.fill();

      // Golden inner core
      ctx.beginPath();
      ctx.ellipse(0, 0, coin.size * 0.6 * rotSine, coin.size * 0.6, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#FEF08A'; // shining core
      ctx.fill();

      ctx.restore();
    });

    // 3. Draw powerups
    state.powerups.forEach((pu) => {
      ctx.save();
      ctx.translate(pu.x, pu.y);

      // Background glowing disk
      ctx.beginPath();
      ctx.arc(0, 0, pu.size + 4, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      
      ctx.beginPath();
      ctx.arc(0, 0, pu.size + 2, 0, Math.PI * 2);
      ctx.fillStyle = pu.color;
      ctx.fill();

      // Icon lettering/signs in pure white
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      if (pu.type === 'magnet') {
        ctx.fillText('🧲', 0, 0);
      } else if (pu.type === 'giant') {
        ctx.fillText('⭐', 0, -1);
      } else if (pu.type === 'double') {
        ctx.fillText('2X', 0, 0);
      } else if (pu.type === 'shield') {
        ctx.fillText('🛡️', 0, 0);
      }

      ctx.restore();
    });

    // 4. Draw Obstacles
    state.obstacles.forEach((obs) => {
      ctx.save();

      if (obs.type === 'windmill') {
        // Red & White rotating custom windmill
        // Draw tower trunk
        ctx.fillStyle = '#CBD5E1'; // Slate gray
        ctx.strokeStyle = '#64748B';
        ctx.lineWidth = 3;
        ctx.beginPath();
        // A conical trapezoid
        ctx.moveTo(obs.x - 14, obs.y + 110);
        ctx.lineTo(obs.x - 6, obs.y);
        ctx.lineTo(obs.x + 6, obs.y);
        ctx.lineTo(obs.x + 14, obs.y + 110);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Cute mini grass roof cone
        ctx.fillStyle = '#EF4444';
        ctx.beginPath();
        ctx.moveTo(obs.x - 10, obs.y);
        ctx.lineTo(obs.x, obs.y - 14);
        ctx.lineTo(obs.x + 10, obs.y);
        ctx.closePath();
        ctx.fill();

        // Rotor pin center
        ctx.beginPath();
        ctx.arc(obs.x, obs.y, 6, 0, Math.PI * 2);
        ctx.fillStyle = '#F59E0B';
        ctx.fill();
        ctx.stroke();

        // 4 beautiful wood sails
        ctx.strokeStyle = '#D97706';
        ctx.lineWidth = 3.5;
        for (let b = 0; b < 4; b++) {
          const sailAngle = obs.angle + (b * Math.PI / 2);
          const sX = obs.x + Math.sin(sailAngle) * 44;
          const sY = obs.y + Math.cos(sailAngle) * 44;

          // stem line
          ctx.beginPath();
          ctx.moveTo(obs.x, obs.y);
          ctx.lineTo(sX, sY);
          ctx.stroke();

          // sail rectangles
          ctx.fillStyle = b % 2 === 0 ? '#FEE2E2' : '#FFFFFF';
          ctx.save();
          ctx.translate(sX, sY);
          ctx.rotate(-sailAngle);
          ctx.fillRect(-6, -10, 12, 16);
          ctx.restore();
        }

      } else if (obs.type === 'balloon') {
        // High density visual toy balloons
        // Draw balloon string
        ctx.strokeStyle = '#64748B';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(obs.x, obs.y);
        ctx.bezierCurveTo(obs.x - 8, obs.y + 20, obs.x + 8, obs.y + 40, obs.x, obs.y + 55);
        ctx.stroke();

        // Sphere body
        ctx.beginPath();
        ctx.arc(obs.x, obs.y, 20, 0, Math.PI * 2);
        ctx.fillStyle = obs.color;
        ctx.shadowColor = 'rgba(0,0,0,0.1)';
        ctx.shadowBlur = 4;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Shine bubble spot
        ctx.beginPath();
        ctx.arc(obs.x - 6, obs.y - 7, 5, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        ctx.fill();

        // Little balloon knot triangle at base
        ctx.fillStyle = obs.color;
        ctx.beginPath();
        ctx.moveTo(obs.x, obs.y + 19);
        ctx.lineTo(obs.x - 5, obs.y + 26);
        ctx.lineTo(obs.x + 5, obs.y + 26);
        ctx.closePath();
        ctx.fill();

      } else if (obs.type === 'hot_balloon') {
        // Beautiful hot air balloons
        const hRad = 24;
        // String attachment ropes
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(obs.x - 12, obs.y + 10);
        ctx.lineTo(obs.x - 8, obs.y + 35);
        ctx.moveTo(obs.x + 12, obs.y + 10);
        ctx.lineTo(obs.x + 8, obs.y + 35);
        ctx.stroke();

        // Basket box
        ctx.fillStyle = '#B45309'; // Wicker brown
        ctx.fillRect(obs.x - 10, obs.y + 35, 20, 14);
        ctx.strokeRect(obs.x - 10, obs.y + 35, 20, 14);

        // Balloon balloon capsule dome
        ctx.beginPath();
        ctx.arc(obs.x, obs.y, hRad, 0, Math.PI, true);
        ctx.lineTo(obs.x - 14, obs.y + hRad);
        ctx.lineTo(obs.x + 14, obs.y + hRad);
        ctx.closePath();
        ctx.fillStyle = obs.color;
        ctx.fill();

        // Fancy stripe detailing
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.ellipse(obs.x, obs.y, 8, hRad, 0, 0, Math.PI * 2);
        ctx.fill();

      } else if (obs.type === 'bird') {
        // Flapping cute bluebirds
        ctx.translate(obs.x, obs.y);
        ctx.fillStyle = '#3B82F6'; // Bird blue
        
        // Circular head value
        ctx.beginPath();
        ctx.arc(0, 0, 12, 0, Math.PI * 2);
        ctx.fill();

        // Orange beak
        ctx.fillStyle = '#F97316';
        ctx.beginPath();
        ctx.moveTo(-10, -2);
        ctx.lineTo(-18, 2);
        ctx.lineTo(-10, 6);
        ctx.closePath();
        ctx.fill();

        // Angry white eyes
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(-4, -4, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(-5, -4, 1.8, 0, Math.PI * 2);
        ctx.fill();

        // Moving flap wings
        ctx.fillStyle = '#1D4ED8';
        const flapper = Math.sin(obs.birdFlap) * 14;
        ctx.beginPath();
        ctx.moveTo(2, -2);
        ctx.lineTo(8, -12 + flapper);
        ctx.lineTo(12, -2);
        ctx.closePath();
        ctx.fill();

      } else if (obs.type === 'kites') {
        // Red/Yellow flowing kites
        ctx.translate(obs.x, obs.y);
        ctx.rotate(0.2);

        // Kite ribbon wood framework diamond
        ctx.fillStyle = '#EF4444';
        ctx.beginPath();
        ctx.moveTo(0, -20);
        ctx.lineTo(15, 0);
        ctx.lineTo(0, 20);
        ctx.lineTo(-15, 0);
        ctx.closePath();
        ctx.fill();

        // Yellow side segments
        ctx.fillStyle = '#FBBF24';
        ctx.beginPath();
        ctx.moveTo(0, -20);
        ctx.lineTo(15, 0);
        ctx.lineTo(0, 0);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(0, 20);
        ctx.lineTo(-15, 0);
        ctx.lineTo(0, 0);
        ctx.closePath();
        ctx.fill();

        // Kite long waving string tail
        ctx.strokeStyle = '#D1D5DB';
        ctx.lineWidth = 1.5;
        const tailSine = Math.sin(state.distanceScroller * 0.5) * 8;
        ctx.beginPath();
        ctx.moveTo(0, 20);
        ctx.quadraticCurveTo(-10 + tailSine, 34, 0 + tailSine, 50);
        ctx.stroke();

        // Little ribbon bows
        ctx.fillStyle = '#F59E0B';
        ctx.fillRect(-4 + tailSine, 30, 8, 4);
        ctx.fillStyle = '#3B82F6';
        ctx.fillRect(-4 + tailSine, 42, 8, 4);
      }

      ctx.restore();
    });

    // 5. Draw Break Sparks Debris
    state.breaks.forEach((bp) => bp.draw(ctx));

    // 6. Draw Player/Plane Screen coordinates
    ctx.save();
    ctx.translate(state.playerX, state.playerY);
    ctx.rotate(state.playerAngle);

    // Scaling size depending on Giant potion status animation
    const isGiant = state.giantFrame > 0;
    if (isGiant) {
      ctx.scale(2.2, 2.2);
    }

    // DRAW THE CHOSEN SKIN CATEGORY
    drawCharacterSkin(ctx, curSkin.type, curSkin.color);

    // DRAW EQUIPPED HAT ON TOP
    if (curHat.id !== 'none') {
      drawHatOutfit(ctx, curHat.type);
    }

    // Draw active bubble shield!
    if (state.shieldActive) {
      ctx.beginPath();
      ctx.arc(0, 0, isGiant ? 22 : 24, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(96,165,250,0.85)';
      ctx.lineWidth = 3;
      ctx.shadowColor = '#60A5FA';
      ctx.shadowBlur = 8;
      ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.fillStyle = 'rgba(191,219,254,0.3)';
      ctx.fill();
    }

    ctx.restore();
  };

  // Internal custom vector illustrations for characters
  const drawCharacterSkin = (ctx: CanvasRenderingContext2D | any, type: string, primaryColor: string) => {
    ctx.strokeStyle = '#0F172A';
    ctx.lineWidth = 2.5;

    if (type === 'plane') {
      // Sleek folded Paper Plane (Origami aesthetic)
      ctx.fillStyle = primaryColor;
      ctx.beginPath();
      // Main core delta fold
      ctx.moveTo(22, 0); // nose
      ctx.lineTo(-14, -12); // top wing tip
      ctx.lineTo(-4, -1);
      ctx.lineTo(-14, 12); // bottom wing tip
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Fold shadow lines
      ctx.fillStyle = 'rgba(15,23,42,0.12)';
      ctx.beginPath();
      ctx.moveTo(22, 0);
      ctx.lineTo(-4, -1);
      ctx.lineTo(-14, 12);
      ctx.closePath();
      ctx.fill();

    } else if (type === 'rocket') {
      // 3D Cartoon Toy Rocket
      // Body Capsule
      ctx.fillStyle = primaryColor;
      ctx.beginPath();
      ctx.arc(4, 0, 10, -Math.PI / 2, Math.PI / 2); // rounded nose
      ctx.lineTo(-16, 10);
      ctx.lineTo(-16, -10);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Rocket fins (Red trim)
      ctx.fillStyle = '#EF4444';
      ctx.beginPath();
      ctx.moveTo(-10, 10);
      ctx.lineTo(-18, 16);
      ctx.lineTo(-16, 5);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(-10, -10);
      ctx.lineTo(-18, -16);
      ctx.lineTo(-16, -5);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Yellow exhaust flame engine trim
      ctx.fillStyle = '#F59E0B';
      ctx.beginPath();
      ctx.rect(-20, -5, 4, 10);
      ctx.fill();
      ctx.stroke();

      // Round glass cockpit hole
      ctx.fillStyle = '#E0F2FE';
      ctx.beginPath();
      ctx.arc(-2, 0, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

    } else if (type === 'penguin') {
      // Adorable round penguin
      ctx.fillStyle = '#1E293B'; // charcoal penguin coat
      ctx.beginPath();
      ctx.arc(0, 0, 13, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // White tuxedo belly
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(-3, 2, 8, 0, Math.PI * 2);
      ctx.fill();

      // Beak (Yellow)
      ctx.fillStyle = '#FBBF24';
      ctx.beginPath();
      ctx.moveTo(-11, -1);
      ctx.lineTo(-17, 2);
      ctx.lineTo(-11, 4);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Bow tie
      ctx.fillStyle = '#EF4444';
      ctx.beginPath();
      ctx.moveTo(-6, -1);
      ctx.lineTo(-9, -4);
      ctx.lineTo(-9, 2);
      ctx.closePath();
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(-1, -1);
      ctx.lineTo(2, -4);
      ctx.lineTo(2, 2);
      ctx.closePath();
      ctx.fill();

      // Tiny cartoon black eyes
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(-6, -4, 2, 0, Math.PI * 2);
      ctx.fill();

    } else if (type === 'duck') {
      // Bright yellow rubber ducky
      ctx.fillStyle = '#FBBF24'; // main yellow
      ctx.beginPath();
      ctx.arc(0, 0, 13, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Orange beak duck profile
      ctx.fillStyle = '#F97316';
      ctx.beginPath();
      ctx.moveTo(-10, -2);
      ctx.lineTo(-19, 2);
      ctx.lineTo(-10, 6);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Duck dynamic wing flap shapes
      ctx.fillStyle = '#F59E0B';
      ctx.beginPath();
      ctx.ellipse(3, 2, 8, 5, -0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Round cartoon cheek spot
      ctx.fillStyle = '#EF4444';
      ctx.beginPath();
      ctx.arc(-4, 2, 2.5, 0, Math.PI * 2);
      ctx.fill();

      // Cute big eye
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(-5, -4, 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(-5, -4, 1.8, 0, Math.PI * 2);
      ctx.fill();

    } else if (type === 'dragon') {
      // Cute Leaf-Green Dragon dragon hatchling
      ctx.fillStyle = '#10B981'; // Green dragon scale
      ctx.beginPath();
      ctx.arc(0, 0, 13, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Tiny yellow horn
      ctx.fillStyle = '#FBBF24';
      ctx.beginPath();
      ctx.moveTo(3, -11);
      ctx.lineTo(8, -19);
      ctx.lineTo(8, -11);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Little cute orange spine spikes on back
      ctx.fillStyle = '#F97316';
      ctx.beginPath();
      ctx.moveTo(10, -5);
      ctx.lineTo(15, -12);
      ctx.lineTo(13, 0);
      ctx.closePath();
      ctx.fill();

      // Dragon mouth/snout front
      ctx.fillStyle = '#059669';
      ctx.beginPath();
      ctx.arc(-9, 1, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Angry fire eyes
      ctx.fillStyle = '#FFEB3B';
      ctx.beginPath();
      ctx.arc(-4, -4, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#EF4444';
      ctx.beginPath();
      ctx.arc(-5, -4, 2, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  // Draw equipped accessories on top of the character coordinates
  const drawHatOutfit = (ctx: CanvasRenderingContext2D, type: string) => {
    ctx.strokeStyle = '#0F172A';
    ctx.lineWidth = 2;

    if (type === 'propeller') {
      // Propeller cap
      ctx.fillStyle = '#EF4444'; // Red dome cap
      ctx.beginPath();
      ctx.arc(0, -10, 7, Math.PI, 0);
      ctx.lineTo(2, -10);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Propeller pin
      ctx.strokeStyle = '#475569';
      ctx.beginPath();
      ctx.moveTo(0, -14);
      ctx.lineTo(0, -19);
      ctx.stroke();

      // Rotating spinner line blade
      ctx.save();
      ctx.translate(0, -19);
      const angle = stateRef.current.visualPropellerAngle;
      ctx.rotate(angle);
      ctx.strokeStyle = '#FFF';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(-9, 0);
      ctx.lineTo(9, 0);
      ctx.stroke();
      ctx.restore();

    } else if (type === 'crown') {
      // Golden crown with gems
      ctx.fillStyle = '#FBBF24'; // gold
      ctx.beginPath();
      ctx.moveTo(-8, -10);
      ctx.lineTo(-10, -19); // left point
      ctx.lineTo(-4, -13);
      ctx.lineTo(0, -22); // center point
      ctx.lineTo(4, -13);
      ctx.lineTo(10, -19); // right point
      ctx.lineTo(8, -10);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Small ruby gems
      ctx.fillStyle = '#EF4444';
      ctx.beginPath();
      ctx.arc(0, -14, 1.5, 0, Math.PI * 2);
      ctx.fill();

    } else if (type === 'wizard') {
      // Tall royal purple wizards hat
      ctx.save();
      ctx.rotate(-0.1);
      ctx.fillStyle = '#6D28D9'; // Royal purple
      ctx.beginPath();
      ctx.moveTo(-9, -9);
      ctx.lineTo(0, -26); // peak tip
      ctx.lineTo(7, -10);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Hat gold buckle brim line
      ctx.strokeStyle = '#FBBF24';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(-11, -9);
      ctx.lineTo(11, -10);
      ctx.stroke();
      ctx.restore();

    } else if (type === 'pirate') {
      // Pirate Captain Tricorne cocked hat
      ctx.fillStyle = '#111827'; // Dark charcoal black
      ctx.beginPath();
      ctx.moveTo(-12, -9);
      ctx.quadraticCurveTo(0, -21, 12, -9);
      ctx.bezierCurveTo(9, -7, -9, -7, -12, -9);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Little yellow skull center badge
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(0, -11, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  return (
    <div
      ref={containerRef}
      className="w-full relative overflow-hidden bg-sky-200 border-4 border-yellow-400 rounded-3xl shadow-[0_12px_0_rgba(202,138,4,1)] cursor-pointer select-none"
      onClick={handleFlap}
      style={{ touchAction: 'none' }}
    >
      <canvas
        ref={canvasRef}
        width={450}
        height={500}
        className="block mx-auto max-w-full select-none"
      />

      {/* POWER-UP HUD INDICATORS overlay in active run */}
      {isPlaying && !isGameOver && (
        <div className="absolute top-4 left-4 flex flex-col gap-2 pointer-events-none select-none">
          {activeMeters.magnet > 0 && (
            <div className="flex items-center gap-1.5 bg-[#EC4899] text-white font-black text-[10px] sm:text-xs rounded-full py-1 px-3 shadow border border-white uppercase tracking-wider animate-pulse">
              <span>🧲 Magnet</span>
              <span className="bg-white/35 rounded px-1.5">{activeMeters.magnet}s</span>
            </div>
          )}
          {activeMeters.giant > 0 && (
            <div className="flex items-center gap-1.5 bg-[#F59E0B] text-white font-black text-[10px] sm:text-xs rounded-full py-1 px-3 shadow border border-white uppercase tracking-wider animate-pulse">
              <span>⭐ Giant</span>
              <span className="bg-white/35 rounded px-1.5">{activeMeters.giant}s</span>
            </div>
          )}
          {activeMeters.double > 0 && (
            <div className="flex items-center gap-1.5 bg-[#10B981] text-white font-black text-[10px] sm:text-xs rounded-full py-1 px-3 shadow border border-white uppercase tracking-wider animate-pulse">
              <span>🪙 2x Coins</span>
              <span className="bg-white/35 rounded px-1.5">{activeMeters.double}s</span>
            </div>
          )}
          {activeMeters.shield && (
            <div className="flex items-center gap-1.5 bg-blue-500 text-white font-black text-[10px] sm:text-xs rounded-full py-1 px-3 shadow border border-white uppercase tracking-wider">
              <span>🛡️ Shield Active</span>
            </div>
          )}
        </div>
      )}

      {/* Active running statistics bottom line */}
      {isPlaying && !isGameOver && (
        <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center text-xs font-black text-[#111] bg-white/95 border-2 border-sky-450/40 rounded-2xl py-2 px-4 shadow-md pointer-events-none select-none">
          <div className="flex items-center gap-1.5">
            <span className="text-sm">🎈</span>
            <span className="text-sky-950 uppercase tracking-wide">Points:</span>
            <span className="text-sky-600 text-sm font-black">{score}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-sm">🪙</span>
            <span className="text-yellow-750 uppercase tracking-wide">Gold:</span>
            <span className="text-yellow-600 text-sm font-black">{coinsThisRun}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-sm">🌫️</span>
            <span className="text-green-750 uppercase tracking-wide">Dist:</span>
            <span className="text-green-600 text-sm font-black">{distanceThisRun}m</span>
          </div>
        </div>
      )}
    </div>
  );
}
