import React from 'react';
import { LeaderboardEntry } from '../types';
import { playClickSound } from '../utils/audio';
import { Trophy, Award, Trash2 } from 'lucide-react';

interface LeaderboardScreenProps {
  entries: LeaderboardEntry[];
  onClearLeaderboard?: () => void;
  onBack: () => void;
  soundEffectsEnabled: boolean;
}

export default function LeaderboardScreen({
  entries,
  onClearLeaderboard,
  onBack,
  soundEffectsEnabled,
}: LeaderboardScreenProps) {
  // Sort entries descending
  const sortedEntries = [...entries]
    .sort((a, b) => b.score - a.score)
    .slice(0, 8);

  return (
    <div className="w-full max-w-lg mx-auto bg-white/70 backdrop-blur-lg border-4 border-white p-6 rounded-3xl shadow-2xl relative overflow-hidden select-none">
      {/* Background decorations */}
      <div className="absolute -top-12 -left-12 w-32 h-32 bg-white/40 rounded-full blur-xl pointer-events-none" />
      <div className="absolute -bottom-10 -right-10 w-44 h-44 bg-white/40 rounded-full blur-xl pointer-events-none" />

      {/* Navigation Headers */}
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
        {onClearLeaderboard && (
          <button
            onClick={() => {
              if (confirm("Reset current scores list?")) {
                playClickSound(soundEffectsEnabled);
                onClearLeaderboard();
              }
            }}
            className="text-red-650 hover:text-red-800 bg-white border border-[#FF4E4E]/30 font-extrabold py-1.5 px-3 rounded-full text-xs transition-colors flex items-center gap-1 shadow-sm cursor-pointer"
          >
            <Trash2 className="w-3 h-3" />
            <span>Reset</span>
          </button>
        )}
      </div>

      <h2 className="text-3xl font-black text-center text-[#2D5A82] mb-6 drop-shadow-[0_2px_0_#fff] uppercase tracking-wider">
        🏆 HALL OF GLIDE 🏆
      </h2>

      {/* Main Table area */}
      <div className="bg-white/50 backdrop-blur-md border-3 border-white rounded-3xl p-4 space-y-1.5 shadow-inner">
        {/* Table Headings */}
        <div className="flex text-[10px] font-black text-[#2D5A82] uppercase px-3 pb-1 border-b border-slate-200">
          <div className="w-12 text-center">Rank</div>
          <div className="flex-1 text-left">Pilot Name</div>
          <div className="w-20 text-right">Altitude</div>
          <div className="w-16 text-right">Coins</div>
        </div>

        {/* Dynamic Records */}
        <div className="space-y-1.5 mt-2">
          {sortedEntries.map((entry, index) => {
            const rank = index + 1;
            const isTop3 = rank <= 3;
            const isSelf = entry.isPlayer;

            return (
              <div
                key={index}
                className={`flex items-center px-3 py-2.5 rounded-xl border-2 transition-all ${
                  isSelf
                    ? 'bg-[#FFD700]/15 border-[#FFD700] shadow-sm'
                    : 'bg-white/40 border-slate-100 hover:bg-white/60'
                }`}
              >
                {/* Rank Column */}
                <div className="w-12 flex justify-center items-center font-black">
                  {rank === 1 && (
                    <span className="text-xl inline-block" title="Gold Medal">🥇</span>
                  )}
                  {rank === 2 && (
                    <span className="text-xl inline-block" title="Silver Medal">🥈</span>
                  )}
                  {rank === 3 && (
                    <span className="text-xl inline-block" title="Bronze Medal">🥉</span>
                  )}
                  {rank > 3 && (
                    <span className="text-slate-500 font-bold text-sm">#{rank}</span>
                  )}
                </div>

                {/* Name */}
                <div className="flex-1 text-left flex items-center gap-1.5 font-sans">
                  <span
                    className={`font-black text-sm uppercase ${
                      isSelf ? 'text-amber-800' : 'text-[#2D5A82]'
                    }`}
                  >
                    {entry.name}
                  </span>
                  {isSelf && (
                    <span className="bg-[#F27D26] text-white text-[8px] font-black uppercase px-1.5 py-0.5 rounded-md">
                      YOU
                    </span>
                  )}
                </div>

                {/* Score */}
                <div className="w-20 text-right">
                  <span className="font-extrabold text-sm text-[#2D5A82]">
                    {entry.score} <span className="text-[10px] text-slate-400">pts</span>
                  </span>
                </div>

                {/* Coin count */}
                <div className="w-16 text-right font-extrabold text-slate-700 text-sm flex items-center justify-end gap-1">
                  <span className="text-yellow-550">🪙</span>
                  <span>{entry.coins}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <p className="text-center font-extrabold text-[#2D5A82] text-xs mt-4 leading-normal">
        🏅 Tap the sky! Pass the windmills to secure your name in the archives.
      </p>
    </div>
  );
}
