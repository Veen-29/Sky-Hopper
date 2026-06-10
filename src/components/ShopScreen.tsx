import React, { useState } from 'react';
import { Skin, Hat, Trail } from '../types';
import { playClickSound } from '../utils/audio';
import { Coins, Check, Lock, ChevronRight, Sparkles, Smile, Crown } from 'lucide-react';

interface ShopScreenProps {
  coins: number;
  unlockedSkinIds: string[];
  unlockedHatIds: string[];
  unlockedTrailIds: string[];
  equippedSkinId: string;
  equippedHatId: string;
  equippedTrailId: string;
  onBuySkin: (id: string, cost: number) => void;
  onBuyHat: (id: string, cost: number) => void;
  onBuyTrail: (id: string, cost: number) => void;
  onEquipSkin: (id: string) => void;
  onEquipHat: (id: string) => void;
  onEquipTrail: (id: string) => void;
  onBack: () => void;
  soundEffectsEnabled: boolean;
}

export const ALL_SKINS: Skin[] = [
  { id: 'classic', name: 'Paper Plane', price: 0, description: 'Your trusty folded voyager. Lightweight and swift!', unlocked: true, color: '#38BDF8', secondaryColor: '#E0F2FE', type: 'plane' },
  { id: 'rocket', name: 'Toy Rocket', price: 150, description: '3-2-1 Liftoff! Emits warm fiery spark particles.', unlocked: false, color: '#EF4444', secondaryColor: '#F59E0B', type: 'rocket' },
  { id: 'penguin', name: 'Flying Penguin', price: 250, description: 'Who says penguins cant fly? Slices through drafts!', unlocked: false, color: '#1E293B', secondaryColor: '#FF6B6B', type: 'penguin' },
  { id: 'duck', name: 'Rubber Duck', price: 200, description: 'Squeak squeak! A lightweight tub explorer in the skies.', unlocked: false, color: '#FBBF24', secondaryColor: '#F97316', type: 'duck' },
  { id: 'dragon', name: 'Tiny Dragon', price: 400, description: 'A cute leaf-green hatchling. Legendary flying spirit!', unlocked: false, color: '#10B981', secondaryColor: '#A7F3D0', type: 'dragon' },
];

export const ALL_HATS: Hat[] = [
  { id: 'none', name: 'No Hat', price: 0, description: 'Fly light and aerodynamic without any weight!', unlocked: true, type: 'none', boosterDesc: 'Pure physics' },
  { id: 'propeller', name: 'Propeller Cap', price: 120, description: 'Spinning top brings luck. Earns +25% extra coins!', unlocked: false, type: 'propeller', boosterDesc: 'Bonus Coin value' },
  { id: 'crown', name: 'Golden Crown', price: 280, description: 'Royal magnet: Draw items from 40% further away!', unlocked: false, type: 'crown', boosterDesc: 'Stretching Magnet' },
  { id: 'wizard', name: 'Wizard Hat', price: 200, description: 'Mystic hat that extends Power-Up shield timers by +3s.', unlocked: false, type: 'wizard', boosterDesc: 'Durable Sheilds' },
  { id: 'pirate', name: 'Pirate Captain', price: 160, description: 'Arrr! Grants custom double speed boost multipliers!', unlocked: false, type: 'pirate', boosterDesc: 'Speed multipliers' },
];

export const ALL_TRAILS: Trail[] = [
  { id: 'sparkles', name: 'Golden Dust', price: 0, description: 'Glinting golden flakes shimmer behind your plane.', unlocked: true, type: 'sparkles' },
  { id: 'rainbow', name: 'Rainbow Ribbon', price: 100, description: 'A gorgeous tri-color neon tape following your tail.', unlocked: false, type: 'rainbow' },
  { id: 'bubbles', name: 'Soap Bubbles', price: 90, description: 'A playful burst of soapy drifting spheres.', unlocked: false, type: 'bubbles' },
  { id: 'stars', name: 'Cosmic Stars', price: 130, description: 'Little twinkling stars fall from your jet stream.', unlocked: false, type: 'stars' },
  { id: 'smoke', name: 'Vapor Jet Puff', price: 60, description: 'Retro cartoon exhaust gas cloud puffs.', unlocked: false, type: 'smoke' },
];

export default function ShopScreen({
  coins,
  unlockedSkinIds,
  unlockedHatIds,
  unlockedTrailIds,
  equippedSkinId,
  equippedHatId,
  equippedTrailId,
  onBuySkin,
  onBuyHat,
  onBuyTrail,
  onEquipSkin,
  onEquipHat,
  onEquipTrail,
  onBack,
  soundEffectsEnabled
}: ShopScreenProps) {
  const [activeTab, setActiveTab] = useState<'chars' | 'hats' | 'trails'>('chars');

  const handleTabClick = (tab: 'chars' | 'hats' | 'trails') => {
    playClickSound(soundEffectsEnabled);
    setActiveTab(tab);
  };

  const isSkinUnlocked = (id: string) => unlockedSkinIds.includes(id);
  const isHatUnlocked = (id: string) => unlockedHatIds.includes(id);
  const isTrailUnlocked = (id: string) => unlockedTrailIds.includes(id);

  return (
    <div className="w-full max-w-lg mx-auto bg-white/70 backdrop-blur-lg border-4 border-white p-6 rounded-3xl shadow-2xl relative overflow-hidden select-none">
      {/* Background Cloud Decoration */}
      <div className="absolute -top-10 -left-10 w-40 h-40 bg-white/40 rounded-full blur-xl pointer-events-none" />
      <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-white/40 rounded-full blur-xl pointer-events-none" />

      {/* Header Panel with Premium Back & Currency meter */}
      <div className="flex justify-between items-center mb-6 relative">
        <button
          onClick={() => {
            playClickSound(soundEffectsEnabled);
            onBack();
          }}
          className="bg-[#FF4E4E] hover:bg-[#FF6B6B] text-white font-extrabold py-2 px-5 rounded-2xl border-b-4 border-[#C83737] hover:border-b-2 hover:translate-y-0.5 active:border-b-0 active:translate-y-1 transition-all text-sm uppercase flex items-center shadow-md cursor-pointer"
        >
          &larr; Back
        </button>
        <div className="bg-white border-4 border-[#FFD700] rounded-full px-5 py-1.5 flex items-center gap-2 shadow-lg">
          <div className="w-6 h-6 bg-[#FFD700] rounded-full border-2 border-white flex items-center justify-center shadow-inner">
            <div className="w-3 h-3 bg-[#FFB900] rounded-full" />
          </div>
          <span className="font-extrabold text-[#8B7500] text-sm tracking-wide">{coins}</span>
        </div>
      </div>

      <h2 className="text-3xl font-black text-center text-[#2D5A82] mb-6 drop-shadow-[0_2px_0_#fff] uppercase tracking-wider">
        ✈️ SKY OUTFITTERS ✈️
      </h2>

      {/* Navigation Tabs with proper chunky 3D buttons from theme instructions */}
      <div className="grid grid-cols-3 gap-2 mb-6">
        <button
          onClick={() => handleTabClick('chars')}
          className={`py-3 rounded-2xl font-black text-xs sm:text-sm tracking-wide uppercase border-b-6 transition-all cursor-pointer ${
            activeTab === 'chars'
              ? 'bg-[#F27D26] text-white border-[#C1631E] hover:bg-[#FF8D3D]'
              : 'bg-white hover:bg-slate-50 text-[#2D5A82] border-slate-300'
          }`}
        >
          Characters
        </button>
        <button
          onClick={() => handleTabClick('hats')}
          className={`py-3 rounded-2xl font-black text-xs sm:text-sm tracking-wide uppercase border-b-6 transition-all cursor-pointer ${
            activeTab === 'hats'
              ? 'bg-[#F27D26] text-white border-[#C1631E] hover:bg-[#FF8D3D]'
              : 'bg-white hover:bg-slate-50 text-[#2D5A82] border-slate-300'
          }`}
        >
          Hats
        </button>
        <button
          onClick={() => handleTabClick('trails')}
          className={`py-3 rounded-2xl font-black text-xs sm:text-sm tracking-wide uppercase border-b-6 transition-all cursor-pointer ${
            activeTab === 'trails'
              ? 'bg-[#F27D26] text-white border-[#C1631E] hover:bg-[#FF8D3D]'
              : 'bg-white hover:bg-slate-50 text-[#2D5A82] border-slate-300'
          }`}
        >
          Trails
        </button>
      </div>

      {/* Shop Content area with premium list frames */}
      <div className="bg-white/50 backdrop-blur-md border-3 border-white rounded-3xl p-4 max-h-[380px] overflow-y-auto space-y-3 shadow-inner custom-scrollbar relative">
        
        {/* CHARACTER TAB */}
        {activeTab === 'chars' &&
          ALL_SKINS.map((skin) => {
            const unlocked = isSkinUnlocked(skin.id);
            const equipped = equippedSkinId === skin.id;

            return (
              <div
                key={skin.id}
                className={`p-3.5 rounded-2xl border-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 transition-all ${
                  equipped
                    ? 'border-[#76C442] bg-[#76C442]/10 shadow-[inner_0_4px_10px_rgba(118,196,66,0.1)]'
                    : 'border-white bg-white/40 hover:bg-white/60'
                }`}
              >
                <div className="flex gap-3 items-center">
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center border-2 border-dashed border-[#2D5A82]/30 shrink-0 shadow-sm"
                    style={{ backgroundColor: skin.color }}
                  >
                    <span className="text-2xl font-serif">
                      {skin.type === 'plane' && '✈️'}
                      {skin.type === 'rocket' && '🚀'}
                      {skin.type === 'penguin' && '🐧'}
                      {skin.type === 'duck' && '🦆'}
                      {skin.type === 'dragon' && '🐉'}
                    </span>
                  </div>
                  <div className="text-left">
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-extrabold text-[#2D5A82] text-base">{skin.name}</h4>
                      {equipped && (
                        <span className="bg-[#76C442]/25 text-[#4D8028] text-[10px] px-1.5 py-0.5 rounded-md font-bold uppercase flex items-center gap-0.5 border border-[#76C442]/50">
                          <Check className="w-3 h-3" /> Active
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-700 leading-tight mt-0.5">{skin.description}</p>
                  </div>
                </div>

                {/* Purchase or Equip Button */}
                <div className="flex items-center justify-end shrink-0">
                  {unlocked ? (
                    <button
                      onClick={() => {
                        playClickSound(soundEffectsEnabled);
                        onEquipSkin(skin.id);
                      }}
                      disabled={equipped}
                      className={`w-full sm:w-auto font-black px-4 py-2 rounded-2xl text-xs uppercase border-b-4 tracking-wider transition-all cursor-pointer ${
                        equipped
                          ? 'bg-[#76C442] border-[#5EA032] text-white cursor-default'
                          : 'bg-white hover:bg-[#F8FAFC] text-[#2D5A82] border-slate-300'
                      }`}
                    >
                      {equipped ? 'Selected' : 'Equip'}
                    </button>
                  ) : (
                    <button
                      onClick={() => onBuySkin(skin.id, skin.price)}
                      disabled={coins < skin.price}
                      className={`w-full sm:w-auto flex items-center justify-center gap-1 px-4 py-2 rounded-2xl text-xs font-black uppercase text-white border-b-4 select-none cursor-pointer ${
                        coins >= skin.price
                          ? 'bg-[#FFD700] hover:bg-[#FFE34D] border-[#CCAC00] hover:border-b-2 active:border-[#CCAC00] active:border-b-0 active:translate-y-1'
                          : 'bg-slate-300 border-slate-400 cursor-not-allowed opacity-75'
                      }`}
                    >
                      <Coins className="w-3.5 h-3.5" />
                      <span>{skin.price}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}

        {/* HAT TAB */}
        {activeTab === 'hats' &&
          ALL_HATS.map((hat) => {
            const unlocked = isHatUnlocked(hat.id);
            const equipped = equippedHatId === hat.id;

            return (
              <div
                key={hat.id}
                className={`p-3.5 rounded-2xl border-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 transition-all ${
                  equipped
                    ? 'border-[#76C442] bg-[#76C442]/10 shadow-[inner_0_4px_10px_rgba(118,196,66,0.1)]'
                    : 'border-white bg-white/40 hover:bg-white/60'
                }`}
              >
                <div className="flex gap-3 items-center">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center border-2 border-dashed border-[#F27D26]/30 shrink-0 bg-[#FF8C00]/10 text-xl font-bold shadow-sm">
                    {hat.type === 'none' && '💨'}
                    {hat.type === 'propeller' && '🚁'}
                    {hat.type === 'crown' && '👑'}
                    {hat.type === 'wizard' && '🧙'}
                    {hat.type === 'pirate' && '🏴‍☠️'}
                  </div>
                  <div className="text-left">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h4 className="font-extrabold text-[#2D5A82] text-base">{hat.name}</h4>
                      <span className="bg-[#FF8C00]/15 text-[#C1631E] border border-[#FF8C00]/30 text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                        {hat.boosterDesc}
                      </span>
                    </div>
                    <p className="text-xs text-gray-700 leading-tight mt-0.5">{hat.description}</p>
                  </div>
                </div>

                <div className="flex items-center justify-end shrink-0">
                  {unlocked ? (
                    <button
                      onClick={() => {
                        playClickSound(soundEffectsEnabled);
                        onEquipHat(hat.id);
                      }}
                      disabled={equipped}
                      className={`w-full sm:w-auto font-black px-4 py-2 rounded-2xl text-xs uppercase border-b-4 tracking-wider transition-all cursor-pointer ${
                        equipped
                          ? 'bg-[#76C442] border-[#5EA032] text-white cursor-default'
                          : 'bg-white hover:bg-[#F8FAFC] text-[#2D5A82] border-slate-300'
                      }`}
                    >
                      {equipped ? 'Selected' : 'Equip'}
                    </button>
                  ) : (
                    <button
                      onClick={() => onBuyHat(hat.id, hat.price)}
                      disabled={coins < hat.price}
                      className={`w-full sm:w-auto flex items-center justify-center gap-1 px-4 py-2 rounded-2xl text-xs font-black uppercase text-white border-b-4 select-none cursor-pointer ${
                        coins >= hat.price
                          ? 'bg-[#FFD700] hover:bg-[#FFE34D] border-[#CCAC00] hover:border-b-2 active:border-[#CCAC00] active:border-b-0 active:translate-y-1'
                          : 'bg-slate-300 border-slate-400 cursor-not-allowed opacity-75'
                      }`}
                    >
                      <Coins className="w-3.5 h-3.5" />
                      <span>{hat.price}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}

        {/* TRAIL TAB */}
        {activeTab === 'trails' &&
          ALL_TRAILS.map((trail) => {
            const unlocked = isTrailUnlocked(trail.id);
            const equipped = equippedTrailId === trail.id;

            return (
              <div
                key={trail.id}
                className={`p-3.5 rounded-2xl border-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 transition-all ${
                  equipped
                    ? 'border-[#76C442] bg-[#76C442]/10 shadow-[inner_0_4px_10px_rgba(118,196,66,0.1)]'
                    : 'border-white bg-white/40 hover:bg-white/60'
                }`}
              >
                <div className="flex gap-3 items-center">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center border-2 border-dashed border-[#FFD700]/30 shrink-0 bg-[#FFD700]/10 text-xl font-bold shadow-sm">
                    {trail.type === 'sparkles' && '✨'}
                    {trail.type === 'rainbow' && '🌈'}
                    {trail.type === 'bubbles' && '🧼'}
                    {trail.type === 'stars' && '⭐'}
                    {trail.type === 'smoke' && '💨'}
                  </div>
                  <div className="text-left">
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-extrabold text-[#2D5A82] text-base">{trail.name}</h4>
                    </div>
                    <p className="text-xs text-gray-700 leading-tight mt-0.5">{trail.description}</p>
                  </div>
                </div>

                <div className="flex items-center justify-end shrink-0">
                  {unlocked ? (
                    <button
                      onClick={() => {
                        playClickSound(soundEffectsEnabled);
                        onEquipTrail(trail.id);
                      }}
                      disabled={equipped}
                      className={`w-full sm:w-auto font-black px-4 py-2 rounded-2xl text-xs uppercase border-b-4 tracking-wider transition-all cursor-pointer ${
                        equipped
                          ? 'bg-[#76C442] border-[#5EA032] text-white cursor-default'
                          : 'bg-white hover:bg-[#F8FAFC] text-[#2D5A82] border-slate-300'
                      }`}
                    >
                      {equipped ? 'Selected' : 'Equip'}
                    </button>
                  ) : (
                    <button
                      onClick={() => onBuyTrail(trail.id, trail.price)}
                      disabled={coins < trail.price}
                      className={`w-full sm:w-auto flex items-center justify-center gap-1 px-4 py-2 rounded-2xl text-xs font-black uppercase text-[#8B7500] border-[#CCAC00] border-b-4 select-none cursor-pointer ${
                        coins >= trail.price
                          ? 'bg-[#FFD700] hover:bg-[#FFE34D] border-[#CCAC00] hover:border-b-2 active:border-[#CCAC00] active:border-b-0 active:translate-y-1'
                          : 'bg-[#FFD700]/10 border-slate-400 cursor-not-allowed opacity-75'
                      }`}
                    >
                      <Coins className="w-3.5 h-3.5" />
                      <span>{trail.price}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
      </div>

      <p className="text-center font-extrabold text-[#2D5A82] text-xs mt-4">
        📢 Propeller caps boost coin worth dynamically! Complete missions for extra gold.
      </p>
    </div>
  );
}
