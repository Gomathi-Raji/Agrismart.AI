import { 
  Achievement, 
  Badge, 
  Quest, 
  Challenge, 
  Reward, 
  UserStats, 
  LeaderboardEntry, 
  SeasonalEvent,
  UserLevel,
  StreakInfo,
  GamificationNotification,
  AchievementCategory,
  AchievementRarity,
  BadgeCategory,
  BadgeRarity,
  QuestType,
  QuestCategory,
  QuestDifficulty,
  QuestDuration,
  ChallengeType,
  ChallengeStatus,
  RewardType,
  RewardRarity,
  NotificationType
} from '@/types/gamification';

export const gamificationData = {
  // User Level Information
  userLevel: {
    currentLevel: 12,
    currentXP: 2650,
    xpToNextLevel: 350,
    totalXP: 15650,
    title: "Expert Farmer",
    benefits: [
      "Access to premium AI insights",
      "Priority community support",
      "Advanced weather forecasting",
      "Exclusive market analytics"
    ],
    unlockedFeatures: [
      "advanced_diagnostics",
      "premium_weather",
      "market_predictions",
      "expert_consultations"
    ]
  } as UserLevel,

  // User Statistics
  userStats: {
    totalPoints: 2650,
    weeklyPoints: 240,
    monthlyPoints: 890,
    currentStreak: 12,
    longestStreak: 28,
    lastActiveDate: new Date(),
    totalAchievements: 15,
    rareBadges: 3,
    questsCompleted: 47,
    challengesWon: 8,
    communityRank: 23,
    regionalRank: 156,
    cropsMonitored: 23,
    diseasesDiagnosed: 87,
    successfulHarvests: 12,
    marketDeals: 34,
    communityHelpPoints: 156,
    knowledgeShared: 28,
    sustainabilityScore: 88,
    innovationPoints: 145
  } as UserStats,

  // Streak Information
  streakInfo: {
    current: 12,
    longest: 28,
    lastActiveDate: new Date(),
    streakRewards: [
      {
        id: 'streak_reward_1',
        type: RewardType.POINTS,
        name: '7-Day Streak Bonus',
        description: 'Bonus points for maintaining a 7-day streak',
        value: 100,
        icon: '🔥',
        rarity: RewardRarity.COMMON,
        redeemable: false,
        redeemed: true,
        redeemedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
      }
    ],
    milestones: [
      { days: 7, reward: { id: 'streak_7', type: RewardType.POINTS, name: '7-Day Streak', description: '100 bonus points', value: 100, icon: '🔥', rarity: RewardRarity.COMMON, redeemable: false, redeemed: false }, unlocked: true },
      { days: 14, reward: { id: 'streak_14', type: RewardType.BADGE, name: '14-Day Streak', description: 'Consistency badge', value: 0, icon: '⚡', rarity: RewardRarity.UNCOMMON, redeemable: false, redeemed: false }, unlocked: true },
      { days: 30, reward: { id: 'streak_30', type: RewardType.PREMIUM_FEATURE, name: '30-Day Streak', description: 'Premium feature unlock', value: 0, icon: '👑', rarity: RewardRarity.RARE, redeemable: false, redeemed: false }, unlocked: false }
    ]
  } as StreakInfo,

  // Comprehensive Achievements
  achievements: [
    {
      id: 'green_thumb',
      name: 'Green Thumb',
      description: 'Successfully monitor 5 different crops',
      icon: '🌱',
      category: AchievementCategory.FARMING,
      rarity: AchievementRarity.COMMON,
      unlocked: true,
      unlockedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      progress: 5,
      maxProgress: 5,
      points: 100,
      requirements: [
        { type: 'count', count: 5, description: 'Monitor 5 different crop types' }
      ],
      rewards: [
        { id: 'green_thumb_reward', type: RewardType.POINTS, name: 'Green Thumb Points', description: '100 points for achievement', value: 100, icon: '🌱', rarity: RewardRarity.COMMON, redeemable: false, redeemed: true }
      ],
      hidden: false
    },
    {
      id: 'community_star',
      name: 'Community Star',
      description: 'Help 50+ farmers in the community',
      icon: '⭐',
      category: AchievementCategory.COMMUNITY,
      rarity: AchievementRarity.UNCOMMON,
      unlocked: true,
      unlockedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      progress: 67,
      maxProgress: 50,
      points: 200,
      requirements: [
        { type: 'count', count: 50, description: 'Provide help to 50 farmers' }
      ],
      rewards: [
        { id: 'community_star_reward', type: RewardType.BADGE, name: 'Community Helper Badge', description: 'Special community badge', value: 0, icon: '⭐', rarity: RewardRarity.UNCOMMON, redeemable: false, redeemed: true }
      ],
      hidden: false
    },
    {
      id: 'tech_savvy',
      name: 'Tech Savvy',
      description: 'Use AI diagnosis feature 100 times',
      icon: '💡',
      category: AchievementCategory.TECHNOLOGY,
      rarity: AchievementRarity.RARE,
      unlocked: false,
      progress: 87,
      maxProgress: 100,
      points: 300,
      requirements: [
        { type: 'count', count: 100, description: 'Use AI diagnosis 100 times' }
      ],
      rewards: [
        { id: 'tech_savvy_reward', type: RewardType.PREMIUM_FEATURE, name: 'Advanced AI Access', description: 'Unlock premium AI features', value: 0, icon: '💡', rarity: RewardRarity.RARE, redeemable: false, redeemed: false }
      ],
      hidden: false
    },
    {
      id: 'market_expert',
      name: 'Market Expert',
      description: 'Complete 20 profitable trades',
      icon: '📈',
      category: AchievementCategory.MARKET,
      rarity: AchievementRarity.UNCOMMON,
      unlocked: true,
      unlockedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      progress: 23,
      maxProgress: 20,
      points: 250,
      requirements: [
        { type: 'count', count: 20, description: 'Complete 20 profitable market trades' }
      ],
      rewards: [
        { id: 'market_expert_reward', type: RewardType.CONSULTATION, name: 'Market Expert Consultation', description: 'Free consultation with market expert', value: 500, icon: '📈', rarity: RewardRarity.UNCOMMON, redeemable: true, redeemed: false }
      ],
      hidden: false
    },
    {
      id: 'sustainability_champion',
      name: 'Sustainability Champion',
      description: 'Achieve 90% sustainability score',
      icon: '🌍',
      category: AchievementCategory.SUSTAINABILITY,
      rarity: AchievementRarity.EPIC,
      unlocked: false,
      progress: 88,
      maxProgress: 90,
      points: 500,
      requirements: [
        { type: 'score', score: 90, description: 'Maintain 90% sustainability score' }
      ],
      rewards: [
        { id: 'sustainability_reward', type: RewardType.CERTIFICATION, name: 'Sustainability Certificate', description: 'Official sustainability certification', value: 0, icon: '🌍', rarity: RewardRarity.EPIC, redeemable: false, redeemed: false }
      ],
      hidden: false
    },
    {
      id: 'innovation_pioneer',
      name: 'Innovation Pioneer',
      description: 'Share 3 innovative farming techniques',
      icon: '🚀',
      category: AchievementCategory.INNOVATION,
      rarity: AchievementRarity.LEGENDARY,
      unlocked: false,
      progress: 1,
      maxProgress: 3,
      points: 1000,
      requirements: [
        { type: 'count', count: 3, description: 'Share 3 innovative farming techniques' }
      ],
      rewards: [
        { id: 'innovation_reward', type: RewardType.PREMIUM_FEATURE, name: 'Innovation Lab Access', description: 'Access to exclusive innovation features', value: 0, icon: '🚀', rarity: RewardRarity.LEGENDARY, redeemable: false, redeemed: false }
      ],
      hidden: true
    }
  ] as Achievement[],

  // Badges Collection
  badges: [
    {
      id: 'early_bird',
      name: 'Early Bird',
      description: 'Check crops before 6 AM for 7 consecutive days',
      icon: '🌅',
      category: BadgeCategory.CROP_EXPERT,
      rarity: BadgeRarity.BRONZE,
      earnedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
      points: 50,
      requirements: ['Check crops before 6 AM for 7 days']
    },
    {
      id: 'mentor',
      name: 'Mentor',
      description: 'Guide 10 new farmers to success',
      icon: '🎓',
      category: BadgeCategory.MENTOR,
      rarity: BadgeRarity.GOLD,
      earnedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      points: 200,
      requirements: ['Successfully mentor 10 new farmers']
    },
    {
      id: 'tech_pioneer',
      name: 'Tech Pioneer',
      description: 'First to try 5 new AI features',
      icon: '⚡',
      category: BadgeCategory.TECH_PIONEER,
      rarity: BadgeRarity.PLATINUM,
      earnedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      points: 300,
      requirements: ['Be among first 100 to use 5 new features']
    }
  ] as Badge[],

  // Active Quests
  activeQuests: [
    {
      id: 'daily_monitoring',
      name: 'Daily Crop Check',
      description: 'Monitor all your crops today',
      type: QuestType.DAILY,
      category: QuestCategory.MONITORING,
      difficulty: QuestDifficulty.EASY,
      duration: QuestDuration.DAILY,
      startDate: new Date(),
      endDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
      progress: 2,
      maxProgress: 3,
      completed: false,
      rewards: [
        { id: 'daily_monitoring_reward', type: RewardType.POINTS, name: 'Daily Points', description: '50 points for daily monitoring', value: 50, icon: '📊', rarity: RewardRarity.COMMON, redeemable: false, redeemed: false }
      ],
      requirements: [
        { type: 'complete', target: 'crop_monitoring', count: 3, description: 'Check 3 crop plots' }
      ]
    },
    {
      id: 'weekly_community',
      name: 'Community Helper',
      description: 'Help 5 farmers this week',
      type: QuestType.WEEKLY,
      category: QuestCategory.COMMUNITY,
      difficulty: QuestDifficulty.MEDIUM,
      duration: QuestDuration.WEEKLY,
      startDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
      progress: 3,
      maxProgress: 5,
      completed: false,
      rewards: [
        { id: 'weekly_community_reward', type: RewardType.POINTS, name: 'Community Points', description: '150 points for helping farmers', value: 150, icon: '🤝', rarity: RewardRarity.UNCOMMON, redeemable: false, redeemed: false }
      ],
      requirements: [
        { type: 'interact', target: 'help_farmer', count: 5, description: 'Provide help to 5 different farmers' }
      ]
    },
    {
      id: 'sustainability_focus',
      name: 'Sustainability Focus',
      description: 'Improve your sustainability score this month',
      type: QuestType.MONTHLY,
      category: QuestCategory.SUSTAINABILITY,
      difficulty: QuestDifficulty.HARD,
      duration: QuestDuration.MONTHLY,
      startDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      progress: 82,
      maxProgress: 85,
      completed: false,
      rewards: [
        { id: 'sustainability_quest_reward', type: RewardType.BADGE, name: 'Eco Warrior Badge', description: 'Special sustainability badge', value: 0, icon: '🌿', rarity: RewardRarity.RARE, redeemable: false, redeemed: false }
      ],
      requirements: [
        { type: 'achieve', target: 'sustainability_score', count: 85, description: 'Achieve 85% sustainability score' }
      ]
    }
  ] as Quest[],

  // Available Challenges
  challenges: [
    {
      id: 'harvest_festival_2024',
      name: 'Harvest Festival Challenge',
      description: 'Compete with farmers across India to showcase your best harvest',
      type: ChallengeType.COMMUNITY,
      startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 37 * 24 * 60 * 60 * 1000),
      participants: 1247,
      maxParticipants: 5000,
      rewards: [
        { id: 'harvest_first', type: RewardType.TOOLS, name: 'Premium Farm Tools', description: 'Complete set of premium farming tools', value: 5000, icon: '🛠️', rarity: RewardRarity.LEGENDARY, redeemable: true, redeemed: false },
        { id: 'harvest_second', type: RewardType.SEEDS, name: 'Hybrid Seeds Package', description: 'Premium hybrid seeds collection', value: 2000, icon: '🌾', rarity: RewardRarity.EPIC, redeemable: true, redeemed: false },
        { id: 'harvest_third', type: RewardType.FERTILIZER, name: 'Organic Fertilizer Set', description: 'Premium organic fertilizer kit', value: 1000, icon: '🧪', rarity: RewardRarity.RARE, redeemable: true, redeemed: false }
      ],
      leaderboard: [
        { userId: '1', name: 'Priya Sharma', score: 2850, rank: 1, location: 'Haryana' },
        { userId: '2', name: 'Rajesh Kumar', score: 2650, rank: 2, location: 'Punjab' },
        { userId: '3', name: 'Amit Singh', score: 2400, rank: 3, location: 'UP' }
      ],
      rules: [
        'Submit photos of your best harvest',
        'Include sustainability practices used',
        'Community votes count for 40% of score',
        'Expert panel judges technical aspects'
      ],
      status: ChallengeStatus.UPCOMING
    },
    {
      id: 'innovation_showcase',
      name: 'Farm Innovation Showcase',
      description: 'Share your most innovative farming technique',
      type: ChallengeType.INDIVIDUAL,
      startDate: new Date(),
      endDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
      participants: 89,
      rewards: [
        { id: 'innovation_winner', type: RewardType.CONSULTATION, name: 'Expert Consultation', description: '3-month premium consultation', value: 10000, icon: '👨‍🌾', rarity: RewardRarity.LEGENDARY, redeemable: true, redeemed: false }
      ],
      leaderboard: [
        { userId: '4', name: 'Dr. Lakshmi Devi', score: 450, rank: 1, location: 'Tamil Nadu' },
        { userId: '5', name: 'Harpreet Singh', score: 420, rank: 2, location: 'Haryana' }
      ],
      rules: [
        'Document your innovation with photos/videos',
        'Explain the problem it solves',
        'Show measurable results',
        'Make it replicable by others'
      ],
      status: ChallengeStatus.ACTIVE
    }
  ] as Challenge[],

  // Seasonal Events
  seasonalEvents: [
    {
      id: 'monsoon_2024',
      name: 'Monsoon Preparation Drive',
      description: 'Get ready for monsoon season with double rewards',
      theme: 'monsoon',
      startDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 44 * 24 * 60 * 60 * 1000),
      bonusMultiplier: 2.0,
      specialQuests: [], // Would be populated with monsoon-specific quests
      exclusiveRewards: [
        { id: 'monsoon_expert', type: RewardType.BADGE, name: 'Monsoon Master', description: 'Expert in monsoon farming', value: 0, icon: '🌧️', rarity: RewardRarity.EPIC, redeemable: false, redeemed: false }
      ],
      leaderboard: [],
      active: false
    }
  ] as SeasonalEvent[],

  // Enhanced Leaderboard
  leaderboard: [
    {
      userId: '1',
      name: 'Priya Sharma',
      avatar: '/assets/priya-sharma-avatar.jpg',
      location: 'Haryana',
      points: 2850,
      level: 15,
      badges: [
        { id: 'mentor', name: 'Mentor', description: 'Community leader', icon: '🎓', category: BadgeCategory.MENTOR, rarity: BadgeRarity.GOLD, points: 200, requirements: [] },
        { id: 'innovator', name: 'Innovator', description: 'Innovation pioneer', icon: '💡', category: BadgeCategory.INNOVATOR, rarity: BadgeRarity.PLATINUM, points: 300, requirements: [] }
      ],
      achievements: 23,
      rank: 1,
      change: 0,
      specialty: 'Organic Farming Expert'
    },
    {
      userId: '2',
      name: 'Rajesh Kumar',
      avatar: '/assets/farmer-avatar-1.jpg',
      location: 'Punjab',
      points: 2650,
      level: 12,
      badges: [
        { id: 'tech_pioneer', name: 'Tech Pioneer', description: 'Technology adopter', icon: '⚡', category: BadgeCategory.TECH_PIONEER, rarity: BadgeRarity.SILVER, points: 150, requirements: [] }
      ],
      achievements: 18,
      rank: 2,
      change: 1,
      specialty: 'Tech Integration'
    },
    {
      userId: '3',
      name: 'Amit Singh',
      avatar: '/assets/farmer-avatar-2.jpg',
      location: 'Uttar Pradesh',
      points: 2400,
      level: 11,
      badges: [
        { id: 'community_helper', name: 'Community Helper', description: 'Helps other farmers', icon: '🤝', category: BadgeCategory.COMMUNITY_LEADER, rarity: BadgeRarity.BRONZE, points: 100, requirements: [] }
      ],
      achievements: 15,
      rank: 3,
      change: -1,
      specialty: 'Community Building'
    },
    {
      userId: '4',
      name: 'Dr. Lakshmi Devi',
      avatar: '/assets/lakshmi-devi-avatar.jpg',
      location: 'Tamil Nadu',
      points: 2300,
      level: 13,
      badges: [
        { id: 'researcher', name: 'Researcher', description: 'Agricultural researcher', icon: '🔬', category: BadgeCategory.INNOVATOR, rarity: BadgeRarity.GOLD, points: 250, requirements: [] }
      ],
      achievements: 20,
      rank: 4,
      change: 2,
      specialty: 'Research & Development'
    },
    {
      userId: '5',
      name: 'Harpreet Singh',
      avatar: '/assets/harpreet-singh-avatar.jpg',
      location: 'Haryana',
      points: 2200,
      level: 10,
      badges: [
        { id: 'sustainability', name: 'Eco Warrior', description: 'Sustainable farming advocate', icon: '🌿', category: BadgeCategory.SUSTAINABILITY_CHAMPION, rarity: BadgeRarity.SILVER, points: 175, requirements: [] }
      ],
      achievements: 14,
      rank: 5,
      change: 0,
      specialty: 'Sustainable Agriculture'
    }
  ] as LeaderboardEntry[],

  // Available Rewards
  availableRewards: [
    {
      id: 'premium_consultation',
      type: RewardType.CONSULTATION,
      name: 'Expert Consultation',
      description: '1-hour consultation with agricultural expert',
      value: 500,
      icon: '👨‍🌾',
      rarity: RewardRarity.RARE,
      category: 'consultation',
      redeemable: true,
      redeemed: false
    },
    {
      id: 'premium_seeds',
      type: RewardType.SEEDS,
      name: 'Hybrid Seed Package',
      description: 'Premium hybrid seeds for higher yield',
      value: 300,
      icon: '🌾',
      rarity: RewardRarity.UNCOMMON,
      category: 'farming',
      redeemable: true,
      redeemed: false
    },
    {
      id: 'market_discount',
      type: RewardType.DISCOUNT,
      name: '20% Marketplace Discount',
      description: '20% off on next marketplace purchase',
      value: 200,
      icon: '💰',
      rarity: RewardRarity.COMMON,
      category: 'discount',
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      redeemable: true,
      redeemed: false
    },
    {
      id: 'farming_tools',
      type: RewardType.TOOLS,
      name: 'Basic Tool Kit',
      description: 'Essential farming tools package',
      value: 1000,
      icon: '🛠️',
      rarity: RewardRarity.EPIC,
      category: 'tools',
      redeemable: true,
      redeemed: false
    }
  ] as Reward[],

  // Recent Notifications
  recentNotifications: [
    {
      id: 'notif_1',
      type: NotificationType.ACHIEVEMENT_UNLOCKED,
      title: 'Achievement Unlocked!',
      message: 'You\'ve earned the "Market Expert" achievement for completing 20 profitable trades!',
      icon: '🏆',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      read: false,
      actionUrl: '/achievements',
      data: { achievementId: 'market_expert' }
    },
    {
      id: 'notif_2',
      type: NotificationType.QUEST_COMPLETED,
      title: 'Quest Completed!',
      message: 'You\'ve completed the "Daily Crop Check" quest and earned 50 points!',
      icon: '✅',
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
      read: false,
      actionUrl: '/quests',
      data: { questId: 'daily_monitoring', pointsEarned: 50 }
    },
    {
      id: 'notif_3',
      type: NotificationType.LEVEL_UP,
      title: 'Level Up!',
      message: 'Congratulations! You\'ve reached Level 12 - Expert Farmer!',
      icon: '⬆️',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
      read: true,
      actionUrl: '/profile',
      data: { newLevel: 12, title: 'Expert Farmer' }
    },
    {
      id: 'notif_4',
      type: NotificationType.BADGE_EARNED,
      title: 'New Badge Earned!',
      message: 'You\'ve earned the "Tech Pioneer" badge for being an early adopter!',
      icon: '🏅',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      read: true,
      actionUrl: '/badges',
      data: { badgeId: 'tech_pioneer' }
    }
  ] as GamificationNotification[]
};

// Point earning activities
export const pointActivities = {
  crop_monitoring: 10,
  disease_diagnosis: 25,
  market_trade: 50,
  community_help: 30,
  knowledge_share: 40,
  quest_completion: 100,
  achievement_unlock: 200,
  daily_login: 5,
  streak_bonus: 20,
  innovation_share: 75,
  sustainability_action: 35,
  mentoring: 60
};

// Level thresholds
export const levelThresholds = [
  { level: 1, xpRequired: 0, title: 'Novice Farmer' },
  { level: 2, xpRequired: 100, title: 'Apprentice Farmer' },
  { level: 3, xpRequired: 250, title: 'Junior Farmer' },
  { level: 4, xpRequired: 500, title: 'Farmer' },
  { level: 5, xpRequired: 800, title: 'Experienced Farmer' },
  { level: 6, xpRequired: 1200, title: 'Skilled Farmer' },
  { level: 7, xpRequired: 1700, title: 'Advanced Farmer' },
  { level: 8, xpRequired: 2300, title: 'Expert Farmer' },
  { level: 9, xpRequired: 3000, title: 'Master Farmer' },
  { level: 10, xpRequired: 3800, title: 'Elite Farmer' },
  { level: 11, xpRequired: 4700, title: 'Champion Farmer' },
  { level: 12, xpRequired: 5700, title: 'Legendary Farmer' },
  { level: 13, xpRequired: 6800, title: 'Agricultural Pioneer' },
  { level: 14, xpRequired: 8000, title: 'Farming Innovator' },
  { level: 15, xpRequired: 9300, title: 'Agricultural Master' }
];