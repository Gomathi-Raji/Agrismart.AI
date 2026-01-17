import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  Achievement, 
  Badge, 
  Quest, 
  Challenge, 
  Reward, 
  UserStats, 
  UserLevel,
  StreakInfo,
  GamificationNotification,
  UserAction,
  QuestProgress,
  AchievementProgress,
  NotificationType,
  AchievementRequirement
} from '@/types/gamification';
import { gamificationData, pointActivities, levelThresholds } from '@/data/gamificationData';

interface GamificationContextType {
  // State
  userLevel: UserLevel;
  userStats: UserStats;
  streakInfo: StreakInfo;
  achievements: Achievement[];
  badges: Badge[];
  activeQuests: Quest[];
  completedQuests: Quest[];
  challenges: Challenge[];
  availableRewards: Reward[];
  notifications: GamificationNotification[];
  
  // Actions
  trackAction: (action: UserAction) => void;
  completeQuest: (questId: string) => void;
  unlockAchievement: (achievementId: string) => void;
  earnBadge: (badgeId: string) => void;
  redeemReward: (rewardId: string) => void;
  markNotificationRead: (notificationId: string) => void;
  updateStreak: () => void;
  
  // Computed values
  currentLevelProgress: number;
  nextLevelInfo: { level: number; title: string; xpRequired: number } | null;
  unreadNotifications: number;
  availablePoints: number;
  
  // Utility functions
  calculateLevel: (totalXP: number) => { level: number; title: string; currentXP: number; xpToNext: number };
  getPointsForAction: (actionType: string) => number;
  checkAchievementProgress: (action: UserAction) => AchievementProgress[];
  checkQuestProgress: (action: UserAction) => QuestProgress[];
}

const GamificationContext = createContext<GamificationContextType | undefined>(undefined);

interface GamificationProviderProps {
  children: ReactNode;
}

export function GamificationProvider({ children }: GamificationProviderProps) {
  // Initialize state from gamification data
  const [userLevel, setUserLevel] = useState<UserLevel>(gamificationData.userLevel);
  const [userStats, setUserStats] = useState<UserStats>(gamificationData.userStats);
  const [streakInfo, setStreakInfo] = useState<StreakInfo>(gamificationData.streakInfo);
  const [achievements, setAchievements] = useState<Achievement[]>(gamificationData.achievements);
  const [badges, setBadges] = useState<Badge[]>(gamificationData.badges);
  const [activeQuests, setActiveQuests] = useState<Quest[]>(gamificationData.activeQuests);
  const [completedQuests, setCompletedQuests] = useState<Quest[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>(gamificationData.challenges);
  const [availableRewards, setAvailableRewards] = useState<Reward[]>(gamificationData.availableRewards);
  const [notifications, setNotifications] = useState<GamificationNotification[]>(gamificationData.recentNotifications);

  // Calculate level from total XP
  const calculateLevel = (totalXP: number) => {
    let currentLevel = 1;
    let currentTitle = 'Novice Farmer';
    let xpForCurrentLevel = 0;
    let xpForNextLevel = levelThresholds[1].xpRequired;

    for (let i = 0; i < levelThresholds.length; i++) {
      if (totalXP >= levelThresholds[i].xpRequired) {
        currentLevel = levelThresholds[i].level;
        currentTitle = levelThresholds[i].title;
        xpForCurrentLevel = levelThresholds[i].xpRequired;
        xpForNextLevel = i < levelThresholds.length - 1 ? levelThresholds[i + 1].xpRequired : totalXP;
      } else {
        break;
      }
    }

    return {
      level: currentLevel,
      title: currentTitle,
      currentXP: totalXP - xpForCurrentLevel,
      xpToNext: xpForNextLevel - totalXP
    };
  };

  // Get points for specific action
  const getPointsForAction = (actionType: string): number => {
    return pointActivities[actionType as keyof typeof pointActivities] || 0;
  };

  // Track user action and update stats
  const trackAction = (action: UserAction) => {
    const points = getPointsForAction(action.type);
    
    // Update user stats
    setUserStats(prev => ({
      ...prev,
      totalPoints: prev.totalPoints + points,
      weeklyPoints: prev.weeklyPoints + points,
      monthlyPoints: prev.monthlyPoints + points,
      lastActiveDate: new Date(),
      // Update specific stats based on action type
      ...(action.type === 'crop_monitoring' && { cropsMonitored: prev.cropsMonitored + 1 }),
      ...(action.type === 'disease_diagnosis' && { diseasesDiagnosed: prev.diseasesDiagnosed + 1 }),
      ...(action.type === 'market_trade' && { marketDeals: prev.marketDeals + 1 }),
      ...(action.type === 'community_help' && { communityHelpPoints: prev.communityHelpPoints + points }),
      ...(action.type === 'knowledge_share' && { knowledgeShared: prev.knowledgeShared + 1 }),
    }));

    // Check quest progress
    const questProgress = checkQuestProgress(action);
    questProgress.forEach(progress => {
      if (progress.completed) {
        completeQuest(progress.questId);
      }
    });

    // Check achievement progress
    const achievementProgress = checkAchievementProgress(action);
    achievementProgress.forEach(progress => {
      if (progress.unlocked) {
        unlockAchievement(progress.achievementId);
      }
    });

    // Update level if necessary
    const newTotalXP = userStats.totalPoints + points;
    const levelInfo = calculateLevel(newTotalXP);
    if (levelInfo.level > userLevel.currentLevel) {
      setUserLevel(prev => ({
        ...prev,
        currentLevel: levelInfo.level,
        title: levelInfo.title,
        currentXP: levelInfo.currentXP,
        xpToNextLevel: levelInfo.xpToNext,
        totalXP: newTotalXP
      }));

      // Add level up notification
      addNotification({
        id: `level_up_${Date.now()}`,
        type: NotificationType.LEVEL_UP,
        title: 'Level Up!',
        message: `Congratulations! You've reached Level ${levelInfo.level} - ${levelInfo.title}!`,
        icon: '⬆️',
        timestamp: new Date(),
        read: false,
        actionUrl: '/profile',
        data: { newLevel: levelInfo.level, title: levelInfo.title }
      });
    }
  };

  // Complete quest
  const completeQuest = (questId: string) => {
    setActiveQuests(prev => {
      const questIndex = prev.findIndex(q => q.id === questId);
      if (questIndex === -1) return prev;

      const quest = prev[questIndex];
      const updatedQuest = { ...quest, completed: true, completedAt: new Date() };
      
      // Move to completed quests
      setCompletedQuests(prevCompleted => [...prevCompleted, updatedQuest]);
      
      // Give rewards
      quest.rewards.forEach(reward => {
        if (reward.type === 'points') {
          setUserStats(prevStats => ({
            ...prevStats,
            totalPoints: prevStats.totalPoints + reward.value
          }));
        }
      });

      // Add notification
      addNotification({
        id: `quest_complete_${Date.now()}`,
        type: NotificationType.QUEST_COMPLETED,
        title: 'Quest Completed!',
        message: `You've completed "${quest.name}" and earned rewards!`,
        icon: '✅',
        timestamp: new Date(),
        read: false,
        actionUrl: '/quests',
        data: { questId, rewards: quest.rewards }
      });

      // Remove from active quests
      return prev.filter(q => q.id !== questId);
    });
  };

  // Unlock achievement
  const unlockAchievement = (achievementId: string) => {
    setAchievements(prev => {
      const achievementIndex = prev.findIndex(a => a.id === achievementId);
      if (achievementIndex === -1 || prev[achievementIndex].unlocked) return prev;

      const updatedAchievements = [...prev];
      updatedAchievements[achievementIndex] = {
        ...updatedAchievements[achievementIndex],
        unlocked: true,
        unlockedAt: new Date()
      };

      const achievement = updatedAchievements[achievementIndex];

      // Give points
      setUserStats(prevStats => ({
        ...prevStats,
        totalPoints: prevStats.totalPoints + achievement.points,
        totalAchievements: prevStats.totalAchievements + 1
      }));

      // Add notification
      addNotification({
        id: `achievement_${Date.now()}`,
        type: NotificationType.ACHIEVEMENT_UNLOCKED,
        title: 'Achievement Unlocked!',
        message: `You've earned the "${achievement.name}" achievement!`,
        icon: '🏆',
        timestamp: new Date(),
        read: false,
        actionUrl: '/achievements',
        data: { achievementId, points: achievement.points }
      });

      return updatedAchievements;
    });
  };

  // Earn badge
  const earnBadge = (badgeId: string) => {
    // Implementation for earning badges (similar to achievements)
    // This would typically be called from achievement unlocking or specific actions
  };

  // Redeem reward
  const redeemReward = (rewardId: string) => {
    setAvailableRewards(prev =>
      prev.map(reward =>
        reward.id === rewardId
          ? { ...reward, redeemed: true, redeemedAt: new Date() }
          : reward
      )
    );

    addNotification({
      id: `reward_redeemed_${Date.now()}`,
      type: NotificationType.REWARD_RECEIVED,
      title: 'Reward Redeemed!',
      message: 'You have successfully redeemed your reward.',
      icon: '🎁',
      timestamp: new Date(),
      read: false
    });
  };

  // Mark notification as read
  const markNotificationRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );
  };

  // Update streak
  const updateStreak = () => {
    const today = new Date();
    const lastActive = new Date(streakInfo.lastActiveDate);
    const daysDifference = Math.floor((today.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24));

    if (daysDifference === 1) {
      // Consecutive day - increase streak
      setStreakInfo(prev => ({
        ...prev,
        current: prev.current + 1,
        longest: Math.max(prev.longest, prev.current + 1),
        lastActiveDate: today
      }));
    } else if (daysDifference > 1) {
      // Streak broken - reset
      setStreakInfo(prev => ({
        ...prev,
        current: 1,
        lastActiveDate: today
      }));
    }
    // If daysDifference === 0, it's the same day, no change needed
  };

  // Check quest progress for an action
  const checkQuestProgress = (action: UserAction): QuestProgress[] => {
    const progressUpdates: QuestProgress[] = [];

    activeQuests.forEach(quest => {
      quest.requirements.forEach(req => {
        if (req.target === action.type) {
          const newProgress = Math.min(quest.progress + 1, quest.maxProgress);
          const completed = newProgress >= quest.maxProgress;
          
          progressUpdates.push({
            questId: quest.id,
            progress: newProgress,
            completed
          });

          // Update the quest in state
          setActiveQuests(prev =>
            prev.map(q =>
              q.id === quest.id ? { ...q, progress: newProgress } : q
            )
          );
        }
      });
    });

    return progressUpdates;
  };

  // Check achievement progress for an action
  const checkAchievementProgress = (action: UserAction): AchievementProgress[] => {
    const progressUpdates: AchievementProgress[] = [];

    achievements.forEach(achievement => {
      if (achievement.unlocked) return;

      achievement.requirements.forEach(req => {
        if (req.type === 'count' && action.type === getActionTypeFromRequirement(req)) {
          const newProgress = Math.min(achievement.progress + 1, achievement.maxProgress);
          const unlocked = newProgress >= achievement.maxProgress;

          progressUpdates.push({
            achievementId: achievement.id,
            progress: newProgress,
            unlocked
          });

          // Update achievement progress
          setAchievements(prev =>
            prev.map(a =>
              a.id === achievement.id ? { ...a, progress: newProgress } : a
            )
          );
        }
      });
    });

    return progressUpdates;
  };

  // Helper function to map requirements to action types  
  const getActionTypeFromRequirement = (req: AchievementRequirement): string => {
    // This would map requirement descriptions to action types
    // For now, returning a simple mapping
    if (req.description.includes('monitor')) return 'crop_monitoring';
    if (req.description.includes('diagnosis')) return 'disease_diagnosis';
    if (req.description.includes('trade')) return 'market_trade';
    if (req.description.includes('help')) return 'community_help';
    return '';
  };

  // Add notification helper
  const addNotification = (notification: GamificationNotification) => {
    setNotifications(prev => [notification, ...prev]);
  };

  // Computed values
  const currentLevelProgress = userLevel.totalXP > 0 ? 
    ((userLevel.currentXP) / (userLevel.currentXP + userLevel.xpToNextLevel)) * 100 : 0;

  const nextLevelInfo = (() => {
    const nextLevelThreshold = levelThresholds.find(t => t.level > userLevel.currentLevel);
    return nextLevelThreshold || null;
  })();

  const unreadNotifications = notifications.filter(n => !n.read).length;
  const availablePoints = userStats.totalPoints;

  // Update streak on mount and daily
  useEffect(() => {
    updateStreak();
  }, []);

  const contextValue: GamificationContextType = {
    // State
    userLevel,
    userStats,
    streakInfo,
    achievements,
    badges,
    activeQuests,
    completedQuests,
    challenges,
    availableRewards,
    notifications,
    
    // Actions
    trackAction,
    completeQuest,
    unlockAchievement,
    earnBadge,
    redeemReward,
    markNotificationRead,
    updateStreak,
    
    // Computed values
    currentLevelProgress,
    nextLevelInfo,
    unreadNotifications,
    availablePoints,
    
    // Utility functions
    calculateLevel,
    getPointsForAction,
    checkAchievementProgress,
    checkQuestProgress
  };

  return (
    <GamificationContext.Provider value={contextValue}>
      {children}
    </GamificationContext.Provider>
  );
}

// Custom hook to use gamification context
export function useGamification() {
  const context = useContext(GamificationContext);
  if (context === undefined) {
    throw new Error('useGamification must be used within a GamificationProvider');
  }
  return context;
}