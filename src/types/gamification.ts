// Gamification System Types for AgriSmart

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: AchievementCategory;
  rarity: AchievementRarity;
  unlocked: boolean;
  unlockedAt?: Date;
  progress: number;
  maxProgress: number;
  points: number;
  requirements: AchievementRequirement[];
  rewards: Reward[];
  hidden: boolean; // Hidden until requirements are close to being met
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: BadgeCategory;
  rarity: BadgeRarity;
  earnedAt?: Date;
  points: number;
  requirements: string[];
}

export interface UserLevel {
  currentLevel: number;
  currentXP: number;
  xpToNextLevel: number;
  totalXP: number;
  title: string;
  benefits: string[];
  unlockedFeatures: string[];
}

export interface Quest {
  id: string;
  name: string;
  description: string;
  type: QuestType;
  category: QuestCategory;
  difficulty: QuestDifficulty;
  duration: QuestDuration;
  startDate: Date;
  endDate: Date;
  progress: number;
  maxProgress: number;
  completed: boolean;
  completedAt?: Date;
  rewards: Reward[];
  requirements: QuestRequirement[];
  prerequisites?: string[]; // Quest IDs
}

export interface Challenge {
  id: string;
  name: string;
  description: string;
  type: ChallengeType;
  startDate: Date;
  endDate: Date;
  participants: number;
  maxParticipants?: number;
  rewards: Reward[];
  leaderboard: ChallengeLeaderboardEntry[];
  rules: string[];
  status: ChallengeStatus;
}

export interface Reward {
  id: string;
  type: RewardType;
  name: string;
  description: string;
  value: number;
  icon: string;
  rarity: RewardRarity;
  category?: string;
  expiresAt?: Date;
  redeemable: boolean;
  redeemed: boolean;
  redeemedAt?: Date;
}

export interface UserStats {
  totalPoints: number;
  weeklyPoints: number;
  monthlyPoints: number;
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: Date;
  totalAchievements: number;
  rareBadges: number;
  questsCompleted: number;
  challengesWon: number;
  communityRank: number;
  regionalRank: number;
  
  // Farming specific stats
  cropsMonitored: number;
  diseasesDiagnosed: number;
  successfulHarvests: number;
  marketDeals: number;
  communityHelpPoints: number;
  knowledgeShared: number;
  sustainabilityScore: number;
  innovationPoints: number;
}

export interface LeaderboardEntry {
  userId: string;
  name: string;
  avatar?: string;
  location: string;
  points: number;
  level: number;
  badges: Badge[];
  achievements: number;
  rank: number;
  change: number; // Position change from last period
  specialty: string; // e.g., "Organic Farming", "Tech Innovation"
}

export interface SeasonalEvent {
  id: string;
  name: string;
  description: string;
  theme: string;
  startDate: Date;
  endDate: Date;
  bonusMultiplier: number;
  specialQuests: Quest[];
  exclusiveRewards: Reward[];
  leaderboard: LeaderboardEntry[];
  active: boolean;
}

export interface GamificationNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  icon: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  data?: Record<string, unknown>;
}

// Enums
export enum AchievementCategory {
  FARMING = 'farming',
  COMMUNITY = 'community',
  TECHNOLOGY = 'technology',
  SUSTAINABILITY = 'sustainability',
  MARKET = 'market',
  KNOWLEDGE = 'knowledge',
  SOCIAL = 'social',
  INNOVATION = 'innovation'
}

export enum AchievementRarity {
  COMMON = 'common',
  UNCOMMON = 'uncommon',
  RARE = 'rare',
  EPIC = 'epic',
  LEGENDARY = 'legendary'
}

export enum BadgeCategory {
  CROP_EXPERT = 'crop_expert',
  COMMUNITY_LEADER = 'community_leader',
  TECH_PIONEER = 'tech_pioneer',
  MARKET_MASTER = 'market_master',
  SUSTAINABILITY_CHAMPION = 'sustainability_champion',
  MENTOR = 'mentor',
  INNOVATOR = 'innovator',
  SEASONAL = 'seasonal'
}

export enum BadgeRarity {
  BRONZE = 'bronze',
  SILVER = 'silver',
  GOLD = 'gold',
  PLATINUM = 'platinum',
  DIAMOND = 'diamond'
}

export enum QuestType {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  SPECIAL = 'special',
  CHAIN = 'chain',
  TUTORIAL = 'tutorial'
}

export enum QuestCategory {
  MONITORING = 'monitoring',
  DIAGNOSIS = 'diagnosis',
  COMMUNITY = 'community',
  MARKET = 'market',
  LEARNING = 'learning',
  SUSTAINABILITY = 'sustainability',
  INNOVATION = 'innovation'
}

export enum QuestDifficulty {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard',
  EXPERT = 'expert'
}

export enum QuestDuration {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  UNLIMITED = 'unlimited'
}

export enum ChallengeType {
  INDIVIDUAL = 'individual',
  TEAM = 'team',
  COMMUNITY = 'community',
  REGIONAL = 'regional',
  GLOBAL = 'global'
}

export enum ChallengeStatus {
  UPCOMING = 'upcoming',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export enum RewardType {
  POINTS = 'points',
  BADGE = 'badge',
  ACHIEVEMENT = 'achievement',
  PREMIUM_FEATURE = 'premium_feature',
  DISCOUNT = 'discount',
  CONSULTATION = 'consultation',
  SEEDS = 'seeds',
  FERTILIZER = 'fertilizer',
  TOOLS = 'tools',
  CERTIFICATION = 'certification'
}

export enum RewardRarity {
  COMMON = 'common',
  UNCOMMON = 'uncommon',
  RARE = 'rare',
  EPIC = 'epic',
  LEGENDARY = 'legendary'
}

export enum NotificationType {
  ACHIEVEMENT_UNLOCKED = 'achievement_unlocked',
  BADGE_EARNED = 'badge_earned',
  LEVEL_UP = 'level_up',
  QUEST_COMPLETED = 'quest_completed',
  CHALLENGE_WON = 'challenge_won',
  REWARD_RECEIVED = 'reward_received',
  STREAK_MILESTONE = 'streak_milestone',
  RANKING_CHANGED = 'ranking_changed'
}

// Requirement types
export interface AchievementRequirement {
  type: 'action' | 'count' | 'streak' | 'score' | 'time';
  action?: string;
  count?: number;
  streak?: number;
  score?: number;
  timeframe?: string;
  description: string;
}

export interface QuestRequirement {
  type: 'action' | 'visit' | 'complete' | 'achieve' | 'interact';
  target: string;
  count: number;
  description: string;
}

export interface ChallengeLeaderboardEntry {
  userId: string;
  name: string;
  score: number;
  rank: number;
  avatar?: string;
  location: string;
}

// User gamification profile
export interface UserGamificationProfile {
  userId: string;
  level: UserLevel;
  stats: UserStats;
  achievements: Achievement[];
  badges: Badge[];
  activeQuests: Quest[];
  completedQuests: Quest[];
  rewards: Reward[];
  notifications: GamificationNotification[];
  preferences: GamificationPreferences;
  streaks: StreakInfo;
}

export interface GamificationPreferences {
  notificationsEnabled: boolean;
  achievementPopups: boolean;
  leaderboardVisible: boolean;
  publicProfile: boolean;
  weeklyDigest: boolean;
  challengeInvites: boolean;
}

export interface StreakInfo {
  current: number;
  longest: number;
  lastActiveDate: Date;
  streakRewards: Reward[];
  milestones: StreakMilestone[];
}

export interface StreakMilestone {
  days: number;
  reward: Reward;
  unlocked: boolean;
}

// Action tracking
export interface UserAction {
  type: string;
  timestamp: Date;
  data: Record<string, unknown>;
  pointsEarned: number;
  questProgress?: QuestProgress[];
  achievementProgress?: AchievementProgress[];
}

export interface QuestProgress {
  questId: string;
  progress: number;
  completed: boolean;
}

export interface AchievementProgress {
  achievementId: string;
  progress: number;
  unlocked: boolean;
}