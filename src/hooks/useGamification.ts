import { useState, useEffect, useCallback } from 'react';
import { useGamification as useGamificationContext } from '@/contexts/GamificationContext';
import { Achievement, Quest, Badge, Challenge, Reward } from '@/types/gamification';

// Hook for managing achievements
export function useAchievements() {
  const { achievements, unlockAchievement, userStats } = useGamificationContext();
  
  const unlockedAchievements = achievements.filter(a => a.unlocked);
  const lockedAchievements = achievements.filter(a => !a.unlocked);
  const recentAchievements = unlockedAchievements
    .filter(a => a.unlockedAt && (Date.now() - a.unlockedAt.getTime()) < 7 * 24 * 60 * 60 * 1000)
    .sort((a, b) => (b.unlockedAt?.getTime() || 0) - (a.unlockedAt?.getTime() || 0));

  const getAchievementsByCategory = useCallback((category: string) => {
    return achievements.filter(a => a.category === category);
  }, [achievements]);

  const getAchievementsByRarity = useCallback((rarity: string) => {
    return achievements.filter(a => a.rarity === rarity);
  }, [achievements]);

  const getProgressPercentage = useCallback((achievement: Achievement) => {
    return (achievement.progress / achievement.maxProgress) * 100;
  }, []);

  const getNextAchievement = useCallback(() => {
    const sortedLocked = lockedAchievements
      .sort((a, b) => (b.progress / b.maxProgress) - (a.progress / a.maxProgress));
    return sortedLocked[0] || null;
  }, [lockedAchievements]);

  return {
    achievements,
    unlockedAchievements,
    lockedAchievements,
    recentAchievements,
    unlockAchievement,
    getAchievementsByCategory,
    getAchievementsByRarity,
    getProgressPercentage,
    getNextAchievement,
    totalAchievements: achievements.length,
    unlockedCount: unlockedAchievements.length,
    completionRate: (unlockedAchievements.length / achievements.length) * 100
  };
}

// Hook for managing quests
export function useQuests() {
  const { activeQuests, completedQuests, completeQuest } = useGamificationContext();
  
  const dailyQuests = activeQuests.filter(q => q.type === 'daily');
  const weeklyQuests = activeQuests.filter(q => q.type === 'weekly');
  const monthlyQuests = activeQuests.filter(q => q.type === 'monthly');
  const specialQuests = activeQuests.filter(q => q.type === 'special');

  const getQuestProgress = useCallback((quest: Quest) => {
    return (quest.progress / quest.maxProgress) * 100;
  }, []);

  const getTimeRemaining = useCallback((quest: Quest) => {
    const now = new Date();
    const timeLeft = quest.endDate.getTime() - now.getTime();
    
    if (timeLeft <= 0) return 'Expired';
    
    const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  }, []);

  const getQuestsByCategory = useCallback((category: string) => {
    return activeQuests.filter(q => q.category === category);
  }, [activeQuests]);

  const canCompleteQuest = useCallback((quest: Quest) => {
    return quest.progress >= quest.maxProgress && !quest.completed;
  }, []);

  return {
    activeQuests,
    completedQuests,
    dailyQuests,
    weeklyQuests,
    monthlyQuests,
    specialQuests,
    completeQuest,
    getQuestProgress,
    getTimeRemaining,
    getQuestsByCategory,
    canCompleteQuest,
    totalActive: activeQuests.length,
    totalCompleted: completedQuests.length
  };
}

// Hook for managing rewards and points
export function useRewards() {
  const { 
    availableRewards, 
    redeemReward, 
    userStats, 
    trackAction,
    availablePoints 
  } = useGamificationContext();

  const redeemableRewards = availableRewards.filter(r => r.redeemable && !r.redeemed);
  const redeemedRewards = availableRewards.filter(r => r.redeemed);
  const expiredRewards = availableRewards.filter(r => 
    r.expiresAt && new Date() > r.expiresAt && !r.redeemed
  );

  const canAffordReward = useCallback((reward: Reward) => {
    return availablePoints >= reward.value;
  }, [availablePoints]);

  const getRewardsByCategory = useCallback((category: string) => {
    return availableRewards.filter(r => r.category === category);
  }, [availableRewards]);

  const getRewardsByType = useCallback((type: string) => {
    return availableRewards.filter(r => r.type === type);
  }, [availableRewards]);

  const earnPoints = useCallback((actionType: string, amount?: number) => {
    trackAction({
      type: actionType,
      timestamp: new Date(),
      data: {},
      pointsEarned: amount || 0
    });
  }, [trackAction]);

  return {
    availableRewards,
    redeemableRewards,
    redeemedRewards,
    expiredRewards,
    redeemReward,
    canAffordReward,
    getRewardsByCategory,
    getRewardsByType,
    earnPoints,
    availablePoints,
    totalRewards: availableRewards.length,
    redeemedCount: redeemedRewards.length
  };
}

// Hook for managing leaderboards
export function useLeaderboard() {
  const { userStats } = useGamificationContext();
  
  // This would typically fetch from API, but using mock data for now
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(false);
  const [timeframe, setTimeframe] = useState<'daily' | 'weekly' | 'monthly' | 'all-time'>('weekly');
  const [category, setCategory] = useState<'points' | 'achievements' | 'community' | 'sustainability'>('points');

  const fetchLeaderboard = useCallback(async (newTimeframe?: string, newCategory?: string) => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      // Mock leaderboard data would be set here
      setLoading(false);
    }, 1000);
  }, []);

  const getUserRank = useCallback(() => {
    return userStats.communityRank;
  }, [userStats.communityRank]);

  const getRegionalRank = useCallback(() => {
    return userStats.regionalRank;
  }, [userStats.regionalRank]);

  useEffect(() => {
    fetchLeaderboard(timeframe, category);
  }, [timeframe, category, fetchLeaderboard]);

  return {
    leaderboard,
    loading,
    timeframe,
    category,
    setTimeframe,
    setCategory,
    fetchLeaderboard,
    getUserRank,
    getRegionalRank,
    userRank: getUserRank(),
    regionalRank: getRegionalRank()
  };
}

// Hook for managing badges
export function useBadges() {
  const { badges, earnBadge } = useGamificationContext();
  
  const badgesByCategory = useCallback((category: string) => {
    return badges.filter(b => b.category === category);
  }, [badges]);

  const badgesByRarity = useCallback((rarity: string) => {
    return badges.filter(b => b.rarity === rarity);
  }, [badges]);

  const recentBadges = badges
    .filter(b => b.earnedAt && (Date.now() - b.earnedAt.getTime()) < 7 * 24 * 60 * 60 * 1000)
    .sort((a, b) => (b.earnedAt?.getTime() || 0) - (a.earnedAt?.getTime() || 0));

  const rareBadges = badges.filter(b => ['gold', 'platinum', 'diamond'].includes(b.rarity));

  return {
    badges,
    earnBadge,
    badgesByCategory,
    badgesByRarity,
    recentBadges,
    rareBadges,
    totalBadges: badges.length,
    rareCount: rareBadges.length
  };
}

// Hook for managing challenges
export function useChallenges() {
  const { challenges } = useGamificationContext();
  
  const activeChallenges = challenges.filter(c => c.status === 'active');
  const upcomingChallenges = challenges.filter(c => c.status === 'upcoming');
  const completedChallenges = challenges.filter(c => c.status === 'completed');

  const getTimeRemaining = useCallback((challenge: Challenge) => {
    const now = new Date();
    const timeLeft = challenge.endDate.getTime() - now.getTime();
    
    if (timeLeft <= 0) return 'Ended';
    
    const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    return `${hours}h`;
  }, []);

  const getTimeUntilStart = useCallback((challenge: Challenge) => {
    const now = new Date();
    const timeUntilStart = challenge.startDate.getTime() - now.getTime();
    
    if (timeUntilStart <= 0) return 'Started';
    
    const days = Math.floor(timeUntilStart / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeUntilStart % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `Starts in ${days}d ${hours}h`;
    return `Starts in ${hours}h`;
  }, []);

  const joinChallenge = useCallback((challengeId: string) => {
    // Implementation for joining a challenge
    console.log(`Joining challenge: ${challengeId}`);
  }, []);

  return {
    challenges,
    activeChallenges,
    upcomingChallenges,
    completedChallenges,
    getTimeRemaining,
    getTimeUntilStart,
    joinChallenge,
    totalChallenges: challenges.length,
    activeCount: activeChallenges.length,
    upcomingCount: upcomingChallenges.length
  };
}

// Hook for notifications
export function useGamificationNotifications() {
  const { notifications, markNotificationRead } = useGamificationContext();
  
  const unreadNotifications = notifications.filter(n => !n.read);
  const readNotifications = notifications.filter(n => n.read);
  const recentNotifications = notifications
    .filter(n => (Date.now() - n.timestamp.getTime()) < 24 * 60 * 60 * 1000);

  const markAllAsRead = useCallback(() => {
    unreadNotifications.forEach(n => markNotificationRead(n.id));
  }, [unreadNotifications, markNotificationRead]);

  const getNotificationsByType = useCallback((type: string) => {
    return notifications.filter(n => n.type === type);
  }, [notifications]);

  return {
    notifications,
    unreadNotifications,
    readNotifications,
    recentNotifications,
    markNotificationRead,
    markAllAsRead,
    getNotificationsByType,
    unreadCount: unreadNotifications.length,
    totalCount: notifications.length
  };
}

// Hook for user progress and level management
export function useUserProgress() {
  const { 
    userLevel, 
    userStats, 
    streakInfo, 
    calculateLevel,
    currentLevelProgress,
    nextLevelInfo 
  } = useGamificationContext();

  const getLevelProgress = useCallback(() => {
    return {
      currentLevel: userLevel.currentLevel,
      currentXP: userLevel.currentXP,
      xpToNext: userLevel.xpToNextLevel,
      progress: currentLevelProgress,
      title: userLevel.title,
      nextLevel: nextLevelInfo
    };
  }, [userLevel, currentLevelProgress, nextLevelInfo]);

  const getStreakInfo = useCallback(() => {
    return {
      current: streakInfo.current,
      longest: streakInfo.longest,
      daysUntilReward: 7 - (streakInfo.current % 7),
      streakRewards: streakInfo.streakRewards
    };
  }, [streakInfo]);

  const getWeeklyProgress = useCallback(() => {
    // Calculate weekly progress based on goals
    const weeklyGoal = 500; // points
    const progress = (userStats.weeklyPoints / weeklyGoal) * 100;
    return Math.min(progress, 100);
  }, [userStats.weeklyPoints]);

  const getMonthlyProgress = useCallback(() => {
    // Calculate monthly progress based on goals
    const monthlyGoal = 2000; // points
    const progress = (userStats.monthlyPoints / monthlyGoal) * 100;
    return Math.min(progress, 100);
  }, [userStats.monthlyPoints]);

  return {
    userLevel,
    userStats,
    streakInfo,
    getLevelProgress,
    getStreakInfo,
    getWeeklyProgress,
    getMonthlyProgress,
    calculateLevel,
    isNearLevelUp: userLevel.xpToNextLevel < 100,
    levelProgress: currentLevelProgress
  };
}

// Main useGamification hook that provides access to all gamification features
export function useGamification() {
  return {
    useAchievements,
    useQuests,
    useRewards,
    useLeaderboard,
    useBadges,
    useChallenges,
    useGamificationNotifications,
    useUserProgress
  };
}