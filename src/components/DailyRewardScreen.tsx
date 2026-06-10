import React, { useState, useEffect } from 'react';
import { playClickSound, playVictorySound } from '../utils/audio';
import { Gift, Coins, AlertCircle, Clock } from 'lucide-react';

interface DailyRewardScreenProps {
  lastClaimDateStr: string | null;
  onClaimCoins: (amount: number) => void;
  onBack: () => void;
  soundEffectsEnabled: boolean;
}

export default function DailyRewardScreen({
  lastClaimDateStr,
  onClaimCoins,
  onBack,
  soundEffectsEnabled,
}: DailyRewardScreenProps) {
  const [canClaim, setCanClaim] = useState(false);
  const [timeLeftStr, setTimeLeftStr] = useState('');
  const [shaking, setShaking] = useState(false);
  const [claimedRewardAmount, setClaimedRewardAmount] = useState<number | null>(null);

  // Check timers every second
  useEffect(() => {
    const checkClaimable = () => {
      if (!lastClaimDateStr) {
        setCanClaim(true);
        return;
      }

      const lastClaim = new Date(lastClaimDateStr).getTime();
      const nextClaim = lastClaim + 24 * 60 * 60 * 1000; // 24 hours
      const now = Date.now();

      if (now >= nextClaim) {
        setCanClaim(true);
      } else {
        setCanClaim(false);
        const diff = nextClaim - now;
        const hrs = Math.floor(diff / (1000 * 60 * 60));
        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const secs = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeftStr(`${hrs}h ${mins}m ${secs}s`);
      }
    };

    checkClaimable();
    const timer = setInterval(checkClaimable, 1000);
    return () => clearInterval(timer);
  }, [lastClaimDateStr]);

  const handleClaim = () => {
    if (!canClaim) return;
    
    playClickSound(soundEffectsEnabled);
    setShaking(true);

    // Simulate shaking and opening animations (800ms)
    setTimeout(() => {
      const reward = Math.floor(Math.random() * 151) + 50; // 50 to 200 coins
      setShaking(false);
      setClaimedRewardAmount(reward);
      playVictorySound(soundEffectsEnabled);
      onClaimCoins(reward);
      setCanClaim(false);
    }, 1200);
  };

  return (
    <div className="w-full max-w-lg mx-auto bg-white/70 backdrop-blur-lg border-4 border-white p-6 rounded-3xl shadow-2xl relative overflow-hidden select-none">
      {/* Sunburst background effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-yellow-300/10 to-yellow-400/20 rounded-full blur-2xl pointer-events-none" />

      {/* Navigation and Title */}
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
        <div className="bg-white border-2 border-slate-200 text-[#2D5A82] rounded-full px-3.5 py-1 flex items-center gap-1.5 shadow-sm text-xs font-black">
          🎁 Claim Log
        </div>
      </div>

      <h2 className="text-3xl font-black text-center text-[#2D5A82] mb-6 drop-shadow-[0_2px_0_#fff] uppercase tracking-wider">
        🎁 GIFT RADAR 🎁
      </h2>

      {/* Main Container */}
      <div className="bg-white/50 backdrop-blur-md border-3 border-white rounded-3xl p-6 flex flex-col items-center justify-center text-center shadow-inner relative">
        {claimedRewardAmount ? (
          // Success State
          <div className="space-y-4 py-4 animate-fade-in">
            <div className="w-24 h-24 bg-[#76C442] rounded-full flex items-center justify-center mx-auto border-4 border-white shadow-md">
              <Coins className="w-12 h-12 text-white animate-bounce" />
            </div>
            <h3 className="text-2xl font-black text-[#76C442] uppercase">Jackpot Crushed!</h3>
            <p className="font-extrabold text-[#2D5A82] text-base leading-snug">
              You found <span className="text-yellow-600 text-lg">+{claimedRewardAmount} Gold Coins</span> inside the crate!
            </p>
            <p className="text-xs text-gray-500 font-bold">
              Check back tomorrow for another aerial supply drop!
            </p>
            <button
              onClick={() => {
                playClickSound(soundEffectsEnabled);
                setClaimedRewardAmount(null);
              }}
              className="mt-4 bg-[#F27D26] hover:bg-[#FF8D3D] text-white font-black py-2.5 px-6 rounded-2xl border-b-4 border-[#C1631E] active:border-b-0 active:mt-1 transition-all text-xs uppercase cursor-pointer"
            >
              Terrific!
            </button>
          </div>
        ) : (
          // Active Claim state
          <div className="space-y-4 py-2 w-full">
            <div
              className={`w-32 h-32 mx-auto flex items-center justify-center rounded-3xl bg-amber-100/45 border-4 border-amber-300 shadow-md transition-all cursor-pointer select-none ${
                shaking ? 'animate-bounce skew-y-3 rotate-6' : 'hover:scale-105 active:scale-95'
              } ${canClaim ? 'bg-amber-100/80 border-amber-400 animate-pulse' : 'opacity-70 bg-slate-50/20 border-slate-305'}`}
              onClick={handleClaim}
            >
              <span className="text-6xl select-none">
                {canClaim ? '🎁' : '📦'}
              </span>
            </div>

            {canClaim ? (
              <div className="space-y-3">
                <h3 className="text-xl font-black text-amber-600 uppercase">SUPPLY BOX DETECTED!</h3>
                <p className="text-xs text-gray-650 font-bold max-w-sm mx-auto leading-relaxed">
                  A stray helium air crate was caught in your net! Tap below or smash the box above to break the seals.
                </p>
                <button
                  onClick={handleClaim}
                  className="w-full max-w-xs mx-auto bg-[#F27D26] hover:bg-[#FF8D3D] text-white font-black py-3.5 px-6 rounded-2xl border-b-6 border-[#C1631E] hover:border-b-3 hover:translate-y-0.5 active:border-b-0 active:translate-y-1.5 transition-all text-sm uppercase flex items-center justify-center gap-2 cursor-pointer shadow-lg"
                >
                  <Gift className="w-5 h-5 text-white" />
                  Smash Cargo Box!
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <h3 className="text-xl font-black text-slate-500 uppercase">CARGO SECURED</h3>
                <p className="text-xs text-slate-500 font-bold leading-normal">
                  Your last flight supply drop has been claimed successfully. Next breeze drops in:
                </p>
                <div className="inline-flex items-center gap-2 bg-white/70 border border-slate-200 rounded-full px-4 py-2 text-[#2D5A82] shadow-sm">
                  <Clock className="w-4 h-4 text-[#2D5A82] animate-pulse" />
                  <span className="font-extrabold text-sm tracking-widest">{timeLeftStr}</span>
                </div>
                <p className="text-[10px] text-slate-400 font-semibold italic mt-2">
                  Tip: Use coins in the Sky Outfitters shop to equip unique trails.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      <p className="text-center font-extrabold text-[#2D5A82] text-xs mt-4">
        📦 Cargo drops land once every 24 hours of real world time!
      </p>
    </div>
  );
}
