import React, { useState, useEffect } from 'react';
import { GameStats, LeaderboardEntry, Mission, Achievement } from './types';
import { playClickSound, playVictorySound, playHitSound, startMusicLoop, stopMusicLoop } from './utils/audio';
import MainScreen from './components/MainScreen';
import ShopScreen, { ALL_SKINS, ALL_HATS, ALL_TRAILS } from './components/ShopScreen';
import MissionsScreen from './components/MissionsScreen';
import AchievementsScreen from './components/AchievementsScreen';
import DailyRewardScreen from './components/DailyRewardScreen';
import LeaderboardScreen from './components/LeaderboardScreen';
import GameCanvas from './components/GameCanvas';
import { Sparkles, Trophy, Award, RotateCcw, Home, PlusCircle, Volume2, Coins, ArrowRight } from 'lucide-react';

const LOCAL_STATS_KEY = 'sky_hopper_stats_v1';
const LOCAL_LEADERBOARD_KEY = 'sky_hopper_leaderboard_v1';
const LOCAL_PILOT_NAME_KEY = 'sky_hopper_pilot_name_v1';

// Initial default active quests
const DEFAULT_MISSIONS: Mission[] = [
  { id: 'm1', text: 'Gather 30 Gold Coins in flight', type: 'collect_coins', target: 30, progress: 0, completed: false, rewardCoins: 60, claimed: false },
  { id: 'm2', text: 'Score 12 altitude points', type: 'reach_score', target: 12, progress: 0, completed: false, rewardCoins: 100, claimed: false },
  { id: 'm3', text: 'Glide safely for a distance of 400 meters', type: 'survival', target: 400, progress: 0, completed: false, rewardCoins: 80, claimed: false },
  { id: 'm4', text: 'Activate 3 active airborne Power-Ups', type: 'activate_powerup', target: 3, progress: 0, completed: false, rewardCoins: 90, claimed: false },
];

// Initial default medals
const DEFAULT_ACHIEVEMENTS: Achievement[] = [
  { id: 'a1', title: 'First Glide', description: 'Launch into the sky and surf over 150m.', unlocked: false, conditionText: 'Fly 150m in a run', badgeEmoji: '🛫' },
  { id: 'a2', title: 'Gold Gatherer', description: 'Accumulate 250 total gold coins of wealth.', unlocked: false, conditionText: 'Earn 250 Coins total', badgeEmoji: '🪙' },
  { id: 'a3', title: 'Sky Kingpin', description: 'Glide your way past a record 20 altitude points.', unlocked: false, conditionText: 'Reach Score of 20', badgeEmoji: '👑' },
  { id: 'a4', title: 'Hats Off!', description: 'Unlock 3 custom skins, hats, or trails!', unlocked: false, conditionText: 'Collect 3 custom items', badgeEmoji: '🧢' },
];

// Initial default bot entries on Leaderboard
const DEFAULT_LEADERBOARD: LeaderboardEntry[] = [
  { name: 'PaperSlayer12', score: 35, coins: 64, date: '2026-06-01' },
  { name: 'WindChaser2k', score: 26, coins: 45, date: '2026-06-03' },
  { name: 'FlappyLegend', score: 21, coins: 32, date: '2026-06-04' },
  { name: 'CloudGrip', score: 15, coins: 22, date: '2026-06-06' },
  { name: 'BreezeGlider', score: 8, coins: 12, date: '2026-06-09' },
];

export default function App() {
  const [screen, setScreen] = useState<'main' | 'playing' | 'shop' | 'missions' | 'achievements' | 'daily' | 'leaderboard'>('main');
  const [stats, setStats] = useState<GameStats | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [pilotName, setPilotName] = useState('ACE PILOT');

  // In-game score trackers
  const [score, setScore] = useState(0);
  const [coinsThisRun, setCoinsThisRun] = useState(0);
  const [obstaclesPassedThisRun, setObstaclesPassedThisRun] = useState(0);
  const [distanceThisRun, setDistanceThisRun] = useState(0);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);

  // Unlocks modal notification states
  const [alertNotification, setAlertNotification] = useState<{ text: string; subtext: string } | null>(null);

  // Initial Load from localstorage
  useEffect(() => {
    // 1. Fetch Stats
    const savedStats = localStorage.getItem(LOCAL_STATS_KEY);
    if (savedStats) {
      try {
        const parsed = JSON.parse(savedStats);
        // Safely fill any missing structure fields if existing v1 exists
        if (!parsed.activeMissions || parsed.activeMissions.length === 0) {
          parsed.activeMissions = DEFAULT_MISSIONS;
        }
        if (!parsed.achievements || parsed.achievements.length === 0) {
          parsed.achievements = DEFAULT_ACHIEVEMENTS;
        }
        setStats(parsed);
      } catch (err) {
        console.error('Stats loading error, resetting:', err);
        resetToDefaults();
      }
    } else {
      resetToDefaults();
    }

    // 2. Fetch Leaderboard
    const savedLeader = localStorage.getItem(LOCAL_LEADERBOARD_KEY);
    if (savedLeader) {
      try {
        setLeaderboard(JSON.parse(savedLeader));
      } catch (e) {
        setLeaderboard(DEFAULT_LEADERBOARD);
      }
    } else {
      setLeaderboard(DEFAULT_LEADERBOARD);
      localStorage.setItem(LOCAL_LEADERBOARD_KEY, JSON.stringify(DEFAULT_LEADERBOARD));
    }

    // 3. Fetch Pilot Name
    const savedName = localStorage.getItem(LOCAL_PILOT_NAME_KEY);
    if (savedName) {
      setPilotName(savedName);
    } else {
      const initial = 'Pilot' + Math.floor(100 + Math.random() * 900);
      setPilotName(initial);
      localStorage.setItem(LOCAL_PILOT_NAME_KEY, initial);
    }
  }, []);

  // Sync background synth loop with current music toggles
  useEffect(() => {
    if (stats) {
      if (stats.musicEnabled && screen === 'main') {
        startMusicLoop(true);
      } else {
        stopMusicLoop();
      }
    }
    return () => stopMusicLoop();
  }, [stats?.musicEnabled, screen]);

  const resetToDefaults = () => {
    const defaults: GameStats = {
      coins: 80, // Start with generous 80 coins
      highScore: 0,
      equippedSkinId: 'classic',
      equippedHatId: 'none',
      equippedTrailId: 'sparkles',
      unlockedSkinIds: ['classic'],
      unlockedHatIds: ['none'],
      unlockedTrailIds: ['sparkles'],
      totalCoinsCollected: false, // flag
      totalObstaclesPassed: 0,
      totalDistanceFlown: 0,
      activeMissions: DEFAULT_MISSIONS,
      achievements: DEFAULT_ACHIEVEMENTS,
      lastDailyRewardClaim: null,
      soundEffectsEnabled: true,
      musicEnabled: true,
    };
    setStats(defaults);
    localStorage.setItem(LOCAL_STATS_KEY, JSON.stringify(defaults));
  };

  // Helper helper to update and write values dynamically
  const saveStats = (newStats: GameStats) => {
    setStats(newStats);
    localStorage.setItem(LOCAL_STATS_KEY, JSON.stringify(newStats));
  };

  // Sound/Music state setters for main dashboard
  const handleToggleSound = () => {
    if (!stats) return;
    const update = { ...stats, soundEffectsEnabled: !stats.soundEffectsEnabled };
    playClickSound(update.soundEffectsEnabled);
    saveStats(update);
  };

  const handleToggleMusic = () => {
    if (!stats) return;
    const update = { ...stats, musicEnabled: !stats.musicEnabled };
    playClickSound(stats.soundEffectsEnabled);
    saveStats(update);
  };

  const handleUpdatePilotName = (name: string) => {
    setPilotName(name);
    localStorage.setItem(LOCAL_PILOT_NAME_KEY, name);
  };

  // -- Run-time mechanics actions --
  const startFlightRun = () => {
    stopMusicLoop(); // disable main lobby music during the loud flight!
    playClickSound(stats?.soundEffectsEnabled);
    setScore(0);
    setCoinsThisRun(0);
    setObstaclesPassedThisRun(0);
    setDistanceThisRun(0);
    setIsGameOver(false);
    setIsPlaying(true);
    setScreen('playing');
  };

  // Finish run and evaluate stats increments
  const handleGameOver = (finalScore: number, collectedGold: number) => {
    if (!stats) return;

    // Save values
    setIsGameOver(true);

    const isNewHigh = finalScore > stats.highScore;
    const finalCoinsPayout = collectedGold;

    // Evaluate stats updates
    const updatedStats = { ...stats };
    updatedStats.coins += finalCoinsPayout;
    if (isNewHigh) {
      updatedStats.highScore = finalScore;
    }

    updatedStats.totalObstaclesPassed += obstaclesPassedThisRun;
    updatedStats.totalDistanceFlown += distanceThisRun;

    // Check Flight Medals
    let awardsUnlocked: string[] = [];
    
    // a1: First Glide (Survive over 150m)
    const medalA = updatedStats.achievements.find((a) => a.id === 'a1');
    if (medalA && !medalA.unlocked && distanceThisRun >= 150) {
      medalA.unlocked = true;
      awardsUnlocked.push('🏆 Unlocked Medal: "First Glide" (+50m distance!)');
    }

    // a2: Gold Gatherer (Accumulate 250 coins)
    const medalB = updatedStats.achievements.find((a) => a.id === 'a2');
    if (medalB && !medalB.unlocked && updatedStats.coins >= 250) {
      medalB.unlocked = true;
      awardsUnlocked.push('🏆 Unlocked Medal: "Gold Gatherer" (250 coins accum!)');
    }

    // a3: Sky Kingpin (Score of 20)
    const medalC = updatedStats.achievements.find((a) => a.id === 'a3');
    if (medalC && !medalC.unlocked && finalScore >= 20) {
      medalC.unlocked = true;
      awardsUnlocked.push('🏆 Unlocked Medal: "Sky Kingpin" (Reach 20 Points!)');
    }

    // a4: Hats Off (3 custom purchases unlocked)
    const totalCustomUnlocks =
      updatedStats.unlockedSkinIds.length +
      updatedStats.unlockedHatIds.length +
      updatedStats.unlockedTrailIds.length - 3; // subtracting base default elements

    const medalD = updatedStats.achievements.find((a) => a.id === 'a4');
    if (medalD && !medalD.unlocked && totalCustomUnlocks >= 3) {
      medalD.unlocked = true;
      awardsUnlocked.push('🏆 Unlocked Medal: "Hats Off!" (Equipped accessories)');
    }

    // Update quest progress in the active missions list
    updatedStats.activeMissions = updatedStats.activeMissions.map((m) => {
      if (m.completed) return m;

      let extraProgress = 0;
      if (m.type === 'collect_coins') {
        extraProgress = collectedGold;
      } else if (m.type === 'reach_score') {
        // target reaches certain absolute score
        if (finalScore > m.progress) {
          m.progress = Math.min(m.target, finalScore);
        }
      } else if (m.type === 'survival') {
        if (distanceThisRun > m.progress) {
          m.progress = Math.min(m.target, distanceThisRun);
        }
      }

      if (extraProgress > 0) {
        m.progress = Math.min(m.target, m.progress + extraProgress);
      }

      if (m.progress >= m.target) {
        m.completed = true;
        // Float alert notifications
        setTimeout(() => {
          triggerInGameNotification(`🎯 Mission Cleared!`, `${m.text} (+${m.rewardCoins} gold)`);
        }, 800);
      }

      return m;
    });

    saveStats(updatedStats);

    // Save entry to leaderboard if of valid altitude
    if (finalScore > 0) {
      const cleanName = pilotName.trim() || 'Pilot';
      const newEntry: LeaderboardEntry = {
        name: cleanName,
        score: finalScore,
        coins: collectedGold,
        date: new Date().toISOString().split('T')[0],
        isPlayer: true,
      };

      const updatedLeader = [...leaderboard, newEntry]
        .sort((a, b) => b.score - a.score)
        .slice(0, 10); // Keep top 10

      setLeaderboard(updatedLeader);
      localStorage.setItem(LOCAL_LEADERBOARD_KEY, JSON.stringify(updatedLeader));
    }

    // Trigger sweet success arpeggio if you beat high scores
    if (isNewHigh) {
      playVictorySound(stats.soundEffectsEnabled);
      triggerInGameNotification('👑 New Personal Best!', `You sets a new altitude of ${finalScore} pts!`);
    } else {
      playHitSound(stats.soundEffectsEnabled);
    }

    // Trigger medal unlocks banner if any achieved during this flight
    if (awardsUnlocked.length > 0) {
      triggerInGameNotification('🏅 Flight Medal Earned!', awardsUnlocked[0]);
    }
  };

  const triggerInGameNotification = (title: string, msg: string) => {
    setAlertNotification({ text: title, subtext: msg });
    setTimeout(() => {
      setAlertNotification(null);
    }, 4500);
  };

  // Quests & progress claimer
  const handleClaimMissionReward = (missionId: string, rewardCoins: number) => {
    if (!stats) return;
    const updated = { ...stats };
    updated.coins += rewardCoins;
    
    // Re-fill the cleared slot with a new procedural mission challenge!
    updated.activeMissions = updated.activeMissions.map((m) => {
      if (m.id === missionId) {
        // Generate new random quest
        const templates = [
          { text: 'Gather 40 Gold Coins in flight', type: 'collect_coins', target: 40, progress: 0, completed: false, rewardCoins: 80, claimed: false },
          { text: 'Score 15 altitude points', type: 'reach_score', target: 15, progress: 0, completed: false, rewardCoins: 120, claimed: false },
          { text: 'Glide safely for a distance of 650 meters', type: 'survival', target: 650, progress: 0, completed: false, rewardCoins: 110, claimed: false },
          { text: 'Activate 4 active airborne Power-Ups', type: 'activate_powerup', target: 4, progress: 0, completed: false, rewardCoins: 130, claimed: false },
          { text: 'Collect 10 coins in a flight with Crown', type: 'collect_coins', target: 10, progress: 0, completed: false, rewardCoins: 50, claimed: false },
        ];
        const randomTemplate = templates[Math.floor(Math.random() * templates.length)];
        return {
          ...randomTemplate,
          id: 'm_' + Math.floor(Math.random() * 10000), // Random fresh ID
        };
      }
      return m;
    });

    saveStats(updated);
    triggerInGameNotification(`🎁 Reward Logged!`, `Received +${rewardCoins} gold coins.`);
  };

  const handleMissionUpdateProgress = (type: string, amount: number) => {
    if (!stats) return;
    const updated = { ...stats };
    let altered = false;

    updated.activeMissions = updated.activeMissions.map((m) => {
      if (m.completed) return m;

      if (type === 'activate_powerup' && m.type === 'activate_powerup') {
        m.progress = Math.min(m.target, m.progress + amount);
        altered = true;
      }
      if (type === 'use_skin' && m.type === 'use_skin') {
        m.progress = Math.min(m.target, m.progress + amount);
        altered = true;
      }

      if (m.progress >= m.target && !m.completed) {
        m.completed = true;
        setTimeout(() => {
          triggerInGameNotification(`🎯 Mission Cleared!`, `${m.text} (+${m.rewardCoins} gold)`);
        }, 600);
      }

      return m;
    });

    if (altered) {
      saveStats(updated);
    }
  };

  // Outfitters dynamic store buying mechanics
  const handleBuySkin = (id: string, price: number) => {
    if (!stats || stats.coins < price) return;
    playClickSound(stats.soundEffectsEnabled);

    const updated = { ...stats };
    updated.coins -= price;
    updated.unlockedSkinIds.push(id);
    updated.equippedSkinId = id; // autoequip

    saveStats(updated);
    triggerInGameNotification('✈️ Outfitter Item Unlocked!', `You have equipped your brand new character skin!`);
  };

  const handleBuyHat = (id: string, price: number) => {
    if (!stats || stats.coins < price) return;
    playClickSound(stats.soundEffectsEnabled);

    const updated = { ...stats };
    updated.coins -= price;
    updated.unlockedHatIds.push(id);
    updated.equippedHatId = id; // autoequip

    saveStats(updated);
    triggerInGameNotification('👑 Hat Accessory Equipped!', `You equipped the premium custom hat!`);
  };

  const handleBuyTrail = (id: string, price: number) => {
    if (!stats || stats.coins < price) return;
    playClickSound(stats.soundEffectsEnabled);

    const updated = { ...stats };
    updated.coins -= price;
    updated.unlockedTrailIds.push(id);
    updated.equippedTrailId = id; // autoequip

    saveStats(updated);
    triggerInGameNotification('🌈 Tail Exhaust trail Equipped!', `Sparkles configured for your paper plane body.`);
  };

  // equips
  const handleEquipSkin = (id: string) => {
    if (!stats) return;
    const updated = { ...stats, equippedSkinId: id };
    saveStats(updated);
    triggerInGameNotification('✈️ Glider Mounted', 'Ready for launching!');
  };

  const handleEquipHat = (id: string) => {
    if (!stats) return;
    const updated = { ...stats, equippedHatId: id };
    saveStats(updated);
    triggerInGameNotification('🎓 Accessory equipped', 'Fitted correctly inside the cockpit!');
  };

  const handleEquipTrail = (id: string) => {
    if (!stats) return;
    const updated = { ...stats, equippedTrailId: id };
    saveStats(updated);
    triggerInGameNotification('✨ Custom Trail Sparkles active', 'Enjoy beautiful custom tail graphics!');
  };

  // Claim cargo drop
  const handleClaimDailyGift = (amount: number) => {
    if (!stats) return;
    const updated = { ...stats };
    updated.coins += amount;
    updated.lastDailyRewardClaim = new Date().toISOString();
    saveStats(updated);
  };

  const handleClearScoreArchive = () => {
    setLeaderboard(DEFAULT_LEADERBOARD);
    localStorage.setItem(LOCAL_LEADERBOARD_KEY, JSON.stringify(DEFAULT_LEADERBOARD));
  };

  if (!stats) {
    return (
      <div className="min-h-screen bg-sky-305 flex items-center justify-center font-sans">
        <div className="text-center p-6 bg-white rounded-3xl border-3 border-sky-400">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="font-extrabold text-sky-950 text-sm">Initializing Sky Hopper Flight Controls...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#4EBFFF] to-[#B0E2FF] py-8 px-4 flex flex-col items-center justify-center font-sans tracking-tight leading-relaxed relative overflow-hidden">
      
      {/* Decorative Sun Glow */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-yellow-100 rounded-full blur-[100px] opacity-40 pointer-events-none" />

      {/* Stylized Puffy Clouds in background */}
      <div className="absolute top-16 left-10 w-48 h-20 bg-white rounded-full opacity-30 blur-sm pointer-events-none" />
      <div className="absolute top-28 left-40 w-32 h-14 bg-white rounded-full opacity-25 blur-sm pointer-events-none" />
      <div className="absolute top-12 right-20 w-56 h-24 bg-white rounded-full opacity-40 pointer-events-none" />
      <div className="absolute top-64 right-1/4 w-40 h-16 bg-white rounded-full opacity-30 pointer-events-none" />
      
      {/* Dynamic slide-in alert logs banner */}
      {alertNotification && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 bg-yellow-400 border-4 border-yellow-600 text-yellow-950 px-6 py-3 rounded-2xl shadow-[0_6px_0_rgba(202,138,4,1)] z-50 flex items-center gap-3 animate-bounce select-none pointer-events-none">
          <div className="text-2xl">🎉</div>
          <div className="text-left select-none">
            <h5 className="font-black text-xs uppercase leading-normal tracking-wider">{alertNotification.text}</h5>
            <p className="font-bold text-[11px] leading-snug">{alertNotification.subtext}</p>
          </div>
        </div>
      )}

      {/* RENDER CURRENT APP SCREEN LAYER */}
      {screen === 'main' && (
        <MainScreen
          stats={stats}
          pilotName={pilotName}
          setPilotName={handleUpdatePilotName}
          onStartGame={startFlightRun}
          onNavigate={(s) => {
            playClickSound(stats.soundEffectsEnabled);
            setScreen(s);
          }}
          onToggleSound={handleToggleSound}
          onToggleMusic={handleToggleMusic}
        />
      )}

      {screen === 'shop' && (
        <ShopScreen
          coins={stats.coins}
          unlockedSkinIds={stats.unlockedSkinIds}
          unlockedHatIds={stats.unlockedHatIds}
          unlockedTrailIds={stats.unlockedTrailIds}
          equippedSkinId={stats.equippedSkinId}
          equippedHatId={stats.equippedHatId}
          equippedTrailId={stats.equippedTrailId}
          onBuySkin={handleBuySkin}
          onBuyHat={handleBuyHat}
          onBuyTrail={handleBuyTrail}
          onEquipSkin={handleEquipSkin}
          onEquipHat={handleEquipHat}
          onEquipTrail={handleEquipTrail}
          onBack={() => setScreen('main')}
          soundEffectsEnabled={stats.soundEffectsEnabled}
        />
      )}

      {screen === 'missions' && (
        <MissionsScreen
          missions={stats.activeMissions}
          onClaimReward={handleClaimMissionReward}
          onBack={() => setScreen('main')}
          soundEffectsEnabled={stats.soundEffectsEnabled}
        />
      )}

      {screen === 'achievements' && (
        <AchievementsScreen
          achievements={stats.achievements}
          onBack={() => setScreen('main')}
          soundEffectsEnabled={stats.soundEffectsEnabled}
        />
      )}

      {screen === 'daily' && (
        <DailyRewardScreen
          lastClaimDateStr={stats.lastDailyRewardClaim}
          onClaimCoins={handleClaimDailyGift}
          onBack={() => setScreen('main')}
          soundEffectsEnabled={stats.soundEffectsEnabled}
        />
      )}

      {screen === 'leaderboard' && (
        <LeaderboardScreen
          entries={leaderboard}
          onClearLeaderboard={handleClearScoreArchive}
          onBack={() => setScreen('main')}
          soundEffectsEnabled={stats.soundEffectsEnabled}
        />
      )}

      {screen === 'playing' && (
        <div className="w-full max-w-lg flex flex-col items-center">
          <GameCanvas
            stats={stats}
            score={score}
            setScore={setScore}
            coinsThisRun={coinsThisRun}
            setCoinsThisRun={setCoinsThisRun}
            obstaclesPassedThisRun={obstaclesPassedThisRun}
            setObstaclesPassedThisRun={setObstaclesPassedThisRun}
            distanceThisRun={distanceThisRun}
            setDistanceThisRun={setDistanceThisRun}
            isGameOver={isGameOver}
            isPlaying={isPlaying}
            onGameOver={handleGameOver}
            onMissionUpdate={handleMissionUpdateProgress}
            onAchievementUnlock={(id) => {}}
          />

          {/* Core active game over screen card */}
          {isGameOver && (
            <div className="mt-6 w-full bg-white/80 backdrop-blur-lg border-4 border-white p-6 rounded-3xl shadow-2xl text-center animate-fade-in z-20">
              <div className="text-4xl mb-2">💥 CRASHED! 💥</div>
              <h2 className="text-2xl font-black text-red-600 uppercase mb-4 tracking-wide">Plane Grounded</h2>
              
              {/* Score stats layout */}
              <div className="grid grid-cols-3 gap-3 bg-white/50 backdrop-blur-md border-2 border-slate-200 rounded-2xl p-4 mb-6 shadow-inner">
                <div>
                  <div className="text-[10px] uppercase font-black text-slate-800">Altitude Score</div>
                  <div className="text-2xl font-black text-[#2D5A82] mt-1">{score}</div>
                </div>
                <div className="border-x border-slate-200">
                  <div className="text-[10px] uppercase font-black text-amber-800">Coins Collected</div>
                  <div className="text-2xl font-black text-yellow-600 mt-1">+{coinsThisRun}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase font-black text-green-800">Distance</div>
                  <div className="text-2xl font-black text-[#76C442] mt-1">{distanceThisRun}m</div>
                </div>
              </div>

              {/* Selection buttons row */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => {
                    startFlightRun();
                  }}
                  className="flex-1 bg-[#F27D26] hover:bg-[#FF8D3D] text-white font-black py-4 px-6 rounded-2xl text-sm uppercase border-b-6 border-[#C1631E] hover:border-b-3 hover:translate-y-0.5 active:border-b-0 active:translate-y-1.5 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  <RotateCcw className="w-4 h-4 text-white" />
                  RESTART RUN!
                </button>
                <button
                  onClick={() => {
                    setScreen('main');
                  }}
                  className="bg-[#2D5A82] hover:bg-[#3d709c] text-white font-black py-4 px-6 rounded-2xl text-sm uppercase border-b-6 border-[#1f405c] hover:border-b-3 hover:translate-y-0.5 active:border-b-0 active:translate-y-1.5 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  <Home className="w-4 h-4 text-white" />
                  MAIN MENU
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
