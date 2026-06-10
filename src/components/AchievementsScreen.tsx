import React from 'react';
import { Achievement } from '../types';
import { playClickSound } from '../utils/audio';
import { Star, Award, Sparkles, Smile } from 'lucide-react';

interface AchievementsScreenProps {
  achievements: Achievement[];
  onBack: () => void;
  soundEffectsEnabled: boolean;
}

export default function AchievementsScreen({
  achievements,
  onBack,
  soundEffectsEnabled,
}: AchievementsScreenProps) {
  const completedCount = achievements.filter((a) => a.unlocked).length;

  return (
    <div className="w-full max-w-lg mx-auto bg-white/70 backdrop-blur-lg border-4 border-white p-6 rounded-3xl shadow-2xl relative overflow-hidden select-none">
      {/* Decorative stars */}
      <div className="absolute top-10 left-10 w-24 h-24 bg-white/30 rounded-full blur-lg pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-28 h-28 bg-white/30 rounded-full blur-lg pointer-events-none" />

      {/* Header and Back buttons */}
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
        <div className="bg-[#F27D26] text-white text-xs font-black rounded-full px-3.5 py-1.5 border border-[#C1631E] uppercase flex items-center gap-1.5 shadow-md">
          <Award className="w-4 h-4 text-white animate-pulse" />
          <span>
            {completedCount} / {achievements.length} Badges
          </span>
        </div>
      </div>

      <h2 className="text-3xl font-black text-center text-[#2D5A82] mb-6 drop-shadow-[0_2px_0_#fff] uppercase tracking-wider">
        🏆 FLIGHT MEDALS 🏆
      </h2>

      {/* Stamp Album layout */}
      <div className="bg-white/50 backdrop-blur-md border-3 border-white rounded-3xl p-4 grid grid-cols-2 gap-3 max-h-[360px] overflow-y-auto shadow-inner custom-scrollbar relative">
        {achievements.map((ach) => {
          return (
            <div
              key={ach.id}
              className={`p-3.5 rounded-2xl border-3 flex flex-col items-center justify-center text-center transition-all relative ${
                ach.unlocked
                  ? 'border-[#FFD700] bg-[#FFD700]/10 hover:scale-[1.02] shadow-[0_6px_0_#CCAC00]'
                  : 'bg-white/40 border-slate-200 shadow-[0_6px_0_#CBD5E1] opacity-65'
              }`}
            >
              {/* Badge Icon holder */}
              <div
                className={`w-14 h-14 rounded-full flex items-center justify-center text-3xl mb-2 relative border-3 ${
                  ach.unlocked
                    ? 'bg-yellow-300 border-[#FFD700] animate-pulse'
                    : 'bg-slate-200 border-slate-300'
                }`}
              >
                {ach.badgeEmoji}
                {ach.unlocked && (
                  <span className="absolute -top-1 -right-1 bg-[#FFD700] rounded-full p-0.5 border border-white">
                    <Star className="w-3.5 h-3.5 text-white" fill="white" />
                  </span>
                )}
              </div>

              {/* Title and details */}
              <h4
                className={`font-black text-xs uppercase leading-tight ${
                  ach.unlocked ? 'text-amber-800' : 'text-slate-500'
                }`}
              >
                {ach.title}
              </h4>
              <p className="text-[10px] text-gray-700 font-bold mt-1 leading-normal">
                {ach.description}
              </p>
              
              <div className="mt-2 text-[9px] font-black tracking-wide text-[#E26D1E] bg-[#FF8C00]/15 border border-[#FF8C00]/25 px-2 py-0.5 rounded-full uppercase">
                {ach.conditionText}
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-center font-extrabold text-[#2D5A82] text-xs mt-4">
        🏆 Stand proud: your trophy collection is automatically saved on this glider!
      </p>
    </div>
  );
}
