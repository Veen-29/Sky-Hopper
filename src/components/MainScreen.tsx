import React from 'react';
import { GameStats, Skin, Hat, Trail } from '../types';
import { playClickSound } from '../utils/audio';
import { ALL_SKINS, ALL_HATS } from './ShopScreen';
import { Coins, Trophy, Award, Target, Gift, Volume2, VolumeX, Music, HelpCircle, Edit3 } from 'lucide-react';

interface MainScreenProps {
  stats: GameStats;
  pilotName: string;
  setPilotName: (name: string) => void;
  onStartGame: () => void;
  onNavigate: (screen: 'shop' | 'missions' | 'achievements' | 'daily' | 'leaderboard') => void;
  onToggleSound: () => void;
  onToggleMusic: () => void;
}

export default function MainScreen({
  stats,
  pilotName,
  setPilotName,
  onStartGame,
  onNavigate,
  onToggleSound,
  onToggleMusic,
}: MainScreenProps) {
  // Find currently equipped items to render previews
  const currentSkin = ALL_SKINS.find((s) => s.id === stats.equippedSkinId) || ALL_SKINS[0];
  const currentHat = ALL_HATS.find((h) => h.id === stats.equippedHatId) || ALL_HATS[0];

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.replace(/[^a-zA-Z0-9\s]/g, '').slice(0, 12);
    setPilotName(rawVal || 'Pilot');
  };

  return (
    <div className="w-full max-w-lg mx-auto bg-white/70 backdrop-blur-lg border-4 border-white p-6 rounded-3xl shadow-2xl relative overflow-hidden select-none text-center">
      
      {/* Decorative Parallax Clouds */}
      <div className="absolute top-4 left-6 w-32 h-14 bg-white/60 rounded-full blur-[1px] pointer-events-none animate-pulse" />
      <div className="absolute top-28 right-4 w-40 h-16 bg-white/60 rounded-full blur-[2px] pointer-events-none animate-pulse" />

      {/* Stats Quick HUD following Immersive UI Design */}
      <div className="flex justify-between items-center mb-6 relative">
        {/* Currency Capsule - Grounded Gold Panel */}
        <div className="bg-white border-4 border-[#FFD700] rounded-full px-5 py-2 shadow-lg flex items-center gap-2.5">
          <div className="w-6 h-6 bg-[#FFD700] rounded-full border-2 border-white flex items-center justify-center shadow-inner">
            <div className="w-3 h-3 bg-[#FFB900] rounded-full" />
          </div>
          <span className="font-extrabold text-[#8B7500] text-sm tracking-wide">{stats.coins}</span>
        </div>

        {/* Record Panel - Translucent Glass */}
        <div className="bg-white/40 backdrop-blur-md border-3 border-white rounded-2xl px-4 py-2 shadow-md flex items-center gap-1.5">
          <Trophy className="w-4 h-4 text-[#2D5A82]" fill="#e0f2fe" />
          <span className="font-extrabold text-[#2D5A82] text-xs uppercase tracking-wide">
            {stats.highScore}m BEST
          </span>
        </div>
      </div>

      {/* Game Title */}
      <div className="mb-4 relative">
        <div className="text-[10px] font-black tracking-widest text-[#2D5A82] uppercase bg-white/50 backdrop-blur-sm inline-block px-3 py-1 rounded-full border-2 border-white mb-2 shadow-sm">
          🌤️ Retro Sky Pilot v1.2.0
        </div>
        <h1 className="text-5xl font-black text-[#2D5A82] drop-shadow-[0_3px_0_#fff] uppercase tracking-tighter leading-none">
          SKY HOPPER
        </h1>
        <p className="text-xs text-[#2D5A82] opacity-80 font-black mt-1 tracking-widest uppercase">
          Classic Folded Glide
        </p>
      </div>

      {/* Interactive Plane Hover Previewer */}
      <div className="my-5 flex flex-col items-center justify-center relative">
        <div className="w-48 h-28 bg-white/40 border-3 border-white/80 rounded-3xl flex flex-col items-center justify-center shadow-inner relative overflow-hidden">
          {/* Animated Horizon strip */}
          <div className="absolute bottom-0 w-full h-8 bg-[#A6DE79]/30 border-t-2 border-[#76C442]/30" />
          
          {/* Plane & Hat combo illustration floating */}
          <div className="transform animate-bounce duration-1200 relative flex flex-col items-center justify-center">
            {/* Equiped Hat Preview */}
            <div className="text-4xl absolute -top-5 z-20 select-none">
              {currentHat.type === 'propeller' && '🚁'}
              {currentHat.type === 'crown' && '👑'}
              {currentHat.type === 'wizard' && '🧙'}
              {currentHat.type === 'pirate' && '🏴‍☠️'}
              {currentHat.type === 'none' && ''}
            </div>
            
            {/* Skin Character emoji preview */}
            <div className="text-5xl select-none z-10 filter drop-shadow-md">
              {currentSkin.type === 'plane' && '✈️'}
              {currentSkin.type === 'rocket' && '🚀'}
              {currentSkin.type === 'penguin' && '🐧'}
              {currentSkin.type === 'duck' && '🦆'}
              {currentSkin.type === 'dragon' && '🐉'}
            </div>
          </div>
        </div>
        <div className="text-xs font-black text-[#2D5A82] mt-2 bg-white/30 px-3 py-0.5 rounded-full uppercase tracking-wider">
          Glider: {currentSkin.name} {currentHat.type !== 'none' && `+ ${currentHat.name}`}
        </div>
      </div>

      {/* Pilot Name input slot */}
      <div className="bg-white border-3 border-white rounded-2xl px-4 py-2 mx-auto max-w-xs mb-6 flex items-center justify-between gap-2 shadow-lg">
        <Edit3 className="w-4 h-4 text-[#2D5A82] shrink-0" />
        <span className="text-[10px] font-black text-[#2D5A82] opacity-75 uppercase mr-1">Callsign:</span>
        <input
          type="text"
          value={pilotName}
          onChange={handleNameChange}
          placeholder="Enter Pilot Name"
          className="text-left font-black text-[#2D5A82] text-sm w-full focus:outline-none uppercase bg-transparent"
        />
      </div>

      {/* Chunky Ready? FLY! Gold Button */}
      <button
        onClick={() => {
          onStartGame();
        }}
        className="w-full max-w-xs bg-[#FFD700] border-b-8 border-[#CCAC00] hover:border-b-4 hover:translate-y-1 rounded-3xl flex flex-col items-center justify-center shadow-lg cursor-pointer transition-all duration-150 py-3 mb-6 mx-auto group active:border-b-0 active:translate-y-2"
      >
        <span className="text-[#8B7500] text-xs font-black leading-none opacity-60 uppercase mb-0.5 tracking-wider">READY?</span>
        <span className="text-[#8B7500] text-3xl font-black tracking-tight uppercase flex items-center gap-1.5">
          FLY! <span className="text-2xl">🛫</span>
        </span>
      </button>

      {/* Sub menu grid - styled as bright 3D buttons resembling the design layout */}
      <div className="grid grid-cols-5 gap-2 max-w-md mx-auto mb-6">
        <button
          onClick={() => onNavigate('shop')}
          title="Sky Outfitters Shop"
          className="bg-[#F27D26] border-b-6 border-[#C1631E] hover:border-b-3 hover:translate-y-0.5 hover:shadow-md text-white px-1 py-2.5 rounded-2xl transition-all flex flex-col items-center justify-center font-black uppercase text-xs active:border-b-0 active:translate-y-1"
        >
          <Coins className="w-5 h-5 text-yellow-250 mb-1" />
          <span className="text-[10px] tracking-tighter">Shop</span>
        </button>

        <button
          onClick={() => onNavigate('missions')}
          title="Flight Missions"
          className="bg-[#00A8FF] border-b-6 border-[#007AC1] hover:border-b-3 hover:translate-y-0.5 hover:shadow-md text-white px-1 py-2.5 rounded-2xl transition-all flex flex-col items-center justify-center font-black uppercase text-xs active:border-b-0 active:translate-y-1"
        >
          <Target className="w-5 h-5 text-white mb-1" />
          <span className="text-[10px] tracking-tighter">Quests</span>
        </button>

        <button
          onClick={() => onNavigate('achievements')}
          title="Flight Medals"
          className="bg-[#76C442] border-b-6 border-[#5EA032] hover:border-b-3 hover:translate-y-0.5 hover:shadow-md text-white px-1 py-2.5 rounded-2xl transition-all flex flex-col items-center justify-center font-black uppercase text-xs active:border-b-0 active:translate-y-1"
        >
          <Award className="w-5 h-5 text-white mb-1" />
          <span className="text-[10px] tracking-tighter">Medals</span>
        </button>

        <button
          onClick={() => onNavigate('daily')}
          title="Cargo Drop Gifts"
          className="bg-[#FF8C00] border-b-6 border-[#CC7000] hover:border-b-3 hover:translate-y-0.5 hover:shadow-md text-white px-1 py-2.5 rounded-2xl transition-all flex flex-col items-center justify-center font-black uppercase text-xs active:border-b-0 active:translate-y-1"
        >
          <Gift className="w-5 h-5 text-white mb-1" />
          <span className="text-[10px] tracking-tighter">Gifts</span>
        </button>

        <button
          onClick={() => onNavigate('leaderboard')}
          title="Leaderboard archives"
          className="bg-[#FFD700] border-b-6 border-[#CCAC00] hover:border-b-3 hover:translate-y-0.5 hover:shadow-md text-[#8B7500] px-1 py-2.5 rounded-2xl transition-all flex flex-col items-center justify-center font-black uppercase text-xs active:border-b-0 active:translate-y-1"
        >
          <Trophy className="w-5 h-5 text-[#8B7500] mb-1" />
          <span className="text-[10px] tracking-tighter">Rank</span>
        </button>
      </div>

      {/* Sound Settings toggles */}
      <div className="flex justify-center items-center gap-4 text-xs font-black text-[#2D5A82] bg-white/40 backdrop-blur-sm border-2 border-white rounded-2xl py-2 px-4 inline-flex mx-auto shadow-sm">
        <button
          onClick={() => {
            onToggleSound();
          }}
          className="flex items-center gap-1 hover:opacity-80 transition-opacity uppercase"
        >
          {stats.soundEffectsEnabled ? (
            <>
              <Volume2 className="w-4 h-4 text-[#2D5A82]" />
              <span>SFX: ON</span>
            </>
          ) : (
            <>
              <VolumeX className="w-4 h-4 text-gray-500" />
              <span className="opacity-60">SFX: OFF</span>
            </>
          )}
        </button>

        <div className="w-px h-4 bg-white/60" />

        <button
          onClick={() => {
            onToggleMusic();
          }}
          className="flex items-center gap-1 hover:opacity-80 transition-opacity uppercase"
        >
          <Music className="w-4 h-4 text-[#2D5A82]" />
          {stats.musicEnabled ? (
            <span>Music: ON</span>
          ) : (
            <span className="opacity-60">Music: OFF</span>
          )}
        </button>
      </div>

      {/* Grass Ground Footer Layer to immerse with the theme */}
      <div className="h-6 bg-[#76C442] border-t-4 border-[#5EA032] -mx-6 -mb-6 mt-6 relative opacity-90 flex items-center justify-center overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#A6DE79]/40" />
        <div className="text-[8px] font-black text-white/50 tracking-widest uppercase">
          Ready to soar
        </div>
      </div>
    </div>
  );
}
