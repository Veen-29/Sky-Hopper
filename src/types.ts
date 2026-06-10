export interface Skin {
  id: string;
  name: string;
  price: number;
  description: string;
  unlocked: boolean;
  color: string;
  secondaryColor: string;
  type: 'plane' | 'rocket' | 'penguin' | 'duck' | 'dragon';
}

export interface Hat {
  id: string;
  name: string;
  price: number;
  description: string;
  unlocked: boolean;
  type: 'none' | 'propeller' | 'crown' | 'wizard' | 'pirate';
  boosterDesc: string;
}

export interface Trail {
  id: string;
  name: string;
  price: number;
  description: string;
  unlocked: boolean;
  type: 'sparkles' | 'rainbow' | 'bubbles' | 'stars' | 'smoke';
}

export interface Mission {
  id: string;
  text: string;
  type: 'collect_coins' | 'reach_score' | 'survival' | 'use_skin' | 'activate_powerup';
  target: number;
  progress: number;
  completed: boolean;
  rewardCoins: number;
  claimed: boolean;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
  conditionText: string;
  badgeEmoji: string;
}

export interface LeaderboardEntry {
  name: string;
  score: number;
  coins: number;
  date: string;
  isPlayer?: boolean;
}

export interface GameStats {
  coins: number;
  highScore: number;
  equippedSkinId: string;
  equippedHatId: string;
  equippedTrailId: string;
  unlockedSkinIds: string[];
  unlockedHatIds: string[];
  unlockedTrailIds: string[];
  totalCoinsCollected: boolean; // tracker for achievement
  totalObstaclesPassed: number;
  totalDistanceFlown: number;
  activeMissions: Mission[];
  achievements: Achievement[];
  lastDailyRewardClaim: string | null; // ISO Date string
  soundEffectsEnabled: boolean;
  musicEnabled: boolean;
}
