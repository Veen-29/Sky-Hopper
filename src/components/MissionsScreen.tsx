import React from 'react';
import { Mission } from '../types';
import { playClickSound, playVictorySound } from '../utils/audio';
import { Trophy, CheckCircle, Gift, ChevronRight } from 'lucide-react';

interface MissionsScreenProps {
  missions: Mission[];
  onClaimReward: (missionId: string, rewardCoins: number) => void;
  onBack: () => void;
  soundEffectsEnabled: boolean;
}

export default function MissionsScreen({
  missions,
  onClaimReward,
  onBack,
  soundEffectsEnabled,
}: MissionsScreenProps) {
  return (
    <div className="w-full max-w-lg mx-auto bg-white/70 backdrop-blur-lg border-4 border-white p-6 rounded-3xl shadow-2xl relative overflow-hidden select-none">
      {/* Background clouds */}
      <div className="absolute -top-10 -right-10 w-36 h-36 bg-white/40 rounded-full blur-xl pointer-events-none" />
      <div className="absolute -bottom-12 -left-12 w-44 h-44 bg-white/40 rounded-full blur-xl pointer-events-none" />

      {/* Back button */}
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
        <span className="font-extrabold text-xs text-[#2D5A82] bg-white rounded-full px-3.5 py-1.5 border border-slate-200 uppercase flex items-center gap-1 shadow-sm">
          🎯 Flight Permits
        </span>
      </div>

      <h2 className="text-3xl font-black text-center text-[#2D5A82] mb-6 drop-shadow-[0_2px_0_#fff] uppercase tracking-wider">
        🎯 SKY MISSIONS 🎯
      </h2>

      {/* Quest lists */}
      <div className="bg-white/50 backdrop-blur-md border-3 border-white rounded-3xl p-4 space-y-3.5 max-h-[380px] overflow-y-auto shadow-inner custom-scrollbar relative">
        {missions.length === 0 ? (
          <div className="text-center py-6">
            <p className="font-bold text-[#2D5A82] text-sm">All flight licenses completed! Check back soon for fresh air currents.</p>
          </div>
        ) : (
          missions.map((mission) => {
            const isCompleted = mission.progress >= mission.target;
            const progressPct = Math.min(100, Math.floor((mission.progress / mission.target) * 100));

            return (
              <div
                key={mission.id}
                className={`p-3.5 rounded-2xl border-3 flex flex-col justify-between gap-3 transition-colors ${
                  mission.claimed
                    ? 'border-slate-100 bg-slate-100/30 opacity-60'
                    : isCompleted
                    ? 'border-[#76C442] bg-[#76C442]/10 shadow-[0_4px_12px_rgba(118,196,66,0.1)]'
                    : 'border-white bg-white/40 hover:bg-white/60'
                }`}
              >
                <div className="flex justify-between items-start gap-2">
                  <div className="flex items-start gap-2.5">
                    <div className="text-2xl mt-0.5 shrink-0">
                      {mission.type === 'collect_coins' && '🪙'}
                      {mission.type === 'reach_score' && '🎈'}
                      {mission.type === 'survival' && '🌫️'}
                      {mission.type === 'use_skin' && '✈️'}
                      {mission.type === 'activate_powerup' && '⚡'}
                    </div>
                    <div className="text-left">
                      <h4 className="font-extrabold text-[#2D5A82] text-sm leading-snug">
                        {mission.text}
                      </h4>
                      <p className="text-[11px] font-black text-amber-600 mt-0.5">
                        Reward: +{mission.rewardCoins} Coins
                      </p>
                    </div>
                  </div>
                  {isCompleted && !mission.claimed && (
                    <span className="bg-[#76C442]/20 border border-[#76C442]/30 text-[#4D8028] text-[10px] px-1.5 py-0.5 rounded-full font-black uppercase shrink-0 animate-pulse">
                      Ready!
                    </span>
                  )}
                  {mission.claimed && (
                    <span className="text-slate-450 text-xs font-extrabold leading-normal text-right">
                      Claimed &bull; Done
                    </span>
                  )}
                </div>

                {/* Progress bar */}
                {!mission.claimed && (
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-[10px] font-extrabold text-[#2D5A82]">
                      <span>Progress</span>
                      <span>
                        {mission.progress} / {mission.target} ({progressPct}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 border border-slate-200 h-3.5 rounded-full overflow-hidden p-0.5 shadow-inner">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          isCompleted ? 'bg-[#76C442]' : 'bg-[#2D5A82]'
                        }`}
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Action footer */}
                {!mission.claimed && isCompleted && (
                  <button
                    onClick={() => {
                      playVictorySound(soundEffectsEnabled);
                      onClaimReward(mission.id, mission.rewardCoins);
                    }}
                    className="w-full font-black py-2.5 px-4 rounded-xl text-xs uppercase bg-[#76C442] hover:bg-[#86D651] text-white border-b-4 border-[#5EA032] active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                  >
                    <Gift className="w-4 h-4 text-white" />
                    Claim Gold Logs!
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>

      <p className="text-center font-extrabold text-[#2D5A82] text-xs mt-4 leading-normal">
        🏅 Accomplished pilots complete daily logs. Keep your glide clean!
      </p>
    </div>
  );
}
