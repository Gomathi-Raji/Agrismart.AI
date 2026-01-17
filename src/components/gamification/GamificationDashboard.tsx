import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Trophy, 
  Star, 
  Target, 
  Gift, 
  TrendingUp, 
  Calendar, 
  Users, 
  Zap, 
  Award,
  Crown,
  Flame,
  Clock,
  ChevronRight,
  Eye
} from 'lucide-react';
import { useGamification } from '@/hooks/useGamification';
import { AchievementRarity, BadgeRarity, RewardType } from '@/types/gamification';

interface DashboardStatsProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
  color?: string;
}

const DashboardStat: React.FC<DashboardStatsProps> = ({ 
  label, 
  value, 
  icon, 
  trend, 
  color = "text-primary" 
}) => (
  <Card className="shadow-sm border border-border bg-card">
    <CardContent className="p-4 sm:p-6">
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-muted-foreground mb-1">{label}</p>
          <p className="text-xl sm:text-2xl font-bold text-foreground truncate">{value}</p>
          {trend && (
            <p className={`text-xs mt-1 ${color}`}>
              {trend}
            </p>
          )}
        </div>
        <div className={`${color} ml-3 flex-shrink-0`}>
          {icon}
        </div>
      </div>
    </CardContent>
  </Card>
);

const getRarityColor = (rarity: AchievementRarity | BadgeRarity) => {
  switch (rarity) {
    case 'legendary': return 'text-warning border-warning/20 dark:border-warning/30';
    case 'epic': return 'text-info border-info/20 dark:border-info/30';
    case 'rare': return 'text-primary border-primary/20 dark:border-primary/30';
    case 'uncommon': return 'text-success border-success/20 dark:border-success/30';
    default: return 'text-muted-foreground border-border';
  }
};

const GamificationDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const {
    useUserProgress,
    useAchievements,
    useQuests,
    useChallenges,
    useRewards,
    useLeaderboard,
    useBadges
  } = useGamification();

  const { userLevel, userStats, levelProgress } = useUserProgress();
  const { achievements, recentAchievements } = useAchievements();
  const { activeQuests, completedQuests } = useQuests();
  const { activeChallenges } = useChallenges();
  const { availableRewards, redeemedRewards } = useRewards();
  const { userRank } = useLeaderboard();
  const { badges, recentBadges } = useBadges();

  const weeklyStreak = 7; // This would come from context
  const monthlyGoalProgress = 75; // This would come from context

  const personalizedRecommendations = [
    {
      id: 1,
      type: 'achievement',
      title: 'Close to Crop Master!',
      description: 'Complete 3 more crop health assessments to unlock this achievement',
      action: 'Start Assessment',
      progress: 70,
      priority: 'high'
    },
    {
      id: 2,
      type: 'quest',
      title: 'Daily Quest Available',
      description: 'Share farming knowledge in the community forum',
      action: 'Join Discussion',
      timeLeft: '18h remaining',
      priority: 'medium'
    },
    {
      id: 3,
      type: 'challenge',
      title: 'Eco-Warrior Challenge',
      description: 'Join this week\'s sustainability challenge',
      action: 'Join Challenge',
      participants: 234,
      priority: 'high'
    },
    {
      id: 4,
      type: 'reward',
      title: 'New Rewards Available',
      description: 'You have enough points for premium consultations',
      action: 'Browse Rewards',
      points: 2500,
      priority: 'low'
    }
  ];

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'high': return 'border-l-destructive';
    case 'medium': return 'border-l-warning';
    default: return 'border-l-info';
  }
};

const getPriorityBadgeColor = (priority: string) => {
  switch (priority) {
    case 'high': return 'bg-destructive/10 text-destructive border-destructive/20';
    case 'medium': return 'bg-warning/10 text-warning border-warning/20';
    default: return 'bg-info/10 text-info border-info/20';
  }
};

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-8">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-6">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-2">
              Gamification Dashboard
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              Track your progress and achievements on your agricultural journey
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <Badge variant="outline" className="text-sm">
              Level {userLevel.currentLevel}
            </Badge>
            <Badge variant="default" className="text-sm px-3 py-1">
              {userStats.totalPoints.toLocaleString()} Points
            </Badge>
          </div>
        </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <DashboardStat
          label="Current Level"
          value={userLevel.currentLevel}
          icon={<Crown size={20} className="sm:w-6 sm:h-6" />}
          trend={`${levelProgress}% to next level`}
          color="text-primary"
        />
        <DashboardStat
          label="Active Streak"
          value={`${weeklyStreak} days`}
          icon={<Flame size={20} className="sm:w-6 sm:h-6" />}
          trend="Keep it up!"
          color="text-warning"
        />
        <DashboardStat
          label="Leaderboard Rank"
          value={`#${userRank}`}
          icon={<Trophy size={20} className="sm:w-6 sm:h-6" />}
          trend={userRank > 0 ? `+${userRank} this week` : `${userRank} this week`}
          color="text-info"
        />
        <DashboardStat
          label="Achievements"
          value={`${achievements.filter(a => a.unlocked).length}/${achievements.length}`}
          icon={<Award size={20} className="sm:w-6 sm:h-6" />}
          trend={`${recentAchievements.length} recent`}
          color="text-success"
        />
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6 sm:space-y-8">
        <div className="overflow-x-auto">
          <TabsList className="grid w-full grid-cols-5 h-12">
            <TabsTrigger 
              value="overview" 
              className="text-xs sm:text-sm font-medium"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="achievements" 
              className="text-xs sm:text-sm font-medium"
            >
              <span className="hidden sm:inline">Achievements</span>
              <span className="sm:hidden">Awards</span>
            </TabsTrigger>
            <TabsTrigger 
              value="quests" 
              className="text-xs sm:text-sm font-medium"
            >
              Quests
            </TabsTrigger>
            <TabsTrigger 
              value="rewards" 
              className="text-xs sm:text-sm font-medium"
            >
              Rewards
            </TabsTrigger>
            <TabsTrigger 
              value="progress" 
              className="text-xs sm:text-sm font-medium"
            >
              Progress
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6 sm:space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Level Progress Card */}
            <Card className="lg:col-span-2 shadow-elegant">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-lg sm:text-xl">
                  <div className="p-2 bg-primary/10 rounded-xl">
                    <TrendingUp className="text-primary" size={20} />
                  </div>
                  Level Progress
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Your journey to becoming an agricultural expert
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-card-foreground">
                    Level {userLevel.currentLevel}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    Level {userLevel.currentLevel + 1}
                  </span>
                </div>
                <div className="space-y-2">
                  <Progress 
                    value={levelProgress} 
                    className="h-3 bg-muted" 
                  />
                  <div className="flex justify-between text-xs sm:text-sm text-muted-foreground">
                    <span>{userLevel.currentXP} XP</span>
                    <span>{userLevel.xpToNextLevel} XP to next level</span>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl p-4 sm:p-6 border border-primary/20">
                  <h4 className="font-semibold mb-3 text-card-foreground flex items-center gap-2">
                    <Star size={16} className="text-primary" />
                    Next Level Benefits:
                  </h4>
                  <ul className="text-sm text-muted-foreground space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="text-primary font-bold">•</span>
                      Unlock Premium Market Analytics
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary font-bold">•</span>
                      Access to Expert Consultation Credits
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary font-bold">•</span>
                      Priority Support for Plant Disease Detection
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="shadow-elegant">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-lg sm:text-xl">
                  <div className="p-2 bg-primary/10 rounded-xl">
                    <Clock className="text-primary" size={20} />
                  </div>
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentAchievements.slice(0, 3).map((achievement) => (
                  <div 
                    key={achievement.id} 
                    className="flex items-center gap-3 p-3 bg-gradient-to-r from-success/5 to-success/10 dark:from-success/10 dark:to-success/20 rounded-xl border border-success/20 dark:border-success/30"
                  >
                    <div className="p-2 bg-success/20 dark:bg-success/30 rounded-lg">
                      <Trophy size={16} className="text-success" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-card-foreground truncate">
                        {achievement.name}
                      </p>
                      <p className="text-xs text-success font-medium">
                        Achievement unlocked!
                      </p>
                    </div>
                  </div>
                ))}
                {completedQuests.slice(0, 2).map((quest) => (
                  <div 
                    key={quest.id} 
                    className="flex items-center gap-3 p-3 bg-gradient-to-r from-info/5 to-info/10 dark:from-info/10 dark:to-info/20 rounded-xl border border-info/20 dark:border-info/30"
                  >
                    <div className="p-2 bg-info/20 dark:bg-info/30 rounded-lg">
                      <Target size={16} className="text-info" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-card-foreground truncate">
                        {quest.name}
                      </p>
                      <p className="text-xs text-info font-medium">
                        Quest completed!
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Personalized Recommendations */}
          <Card className="shadow-elegant">
            <CardHeader className="pb-6">
              <CardTitle className="flex items-center gap-3 text-lg sm:text-xl">
                <div className="p-2 bg-primary/10 rounded-xl">
                  <Zap className="text-primary" size={20} />
                </div>
                Personalized Recommendations
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Actions to boost your progress and earn more rewards
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                {personalizedRecommendations.map((rec) => (
                  <div
                    key={rec.id}
                    className={`border-l-4 rounded-xl p-4 sm:p-6 shadow-sm hover:shadow-elegant transition-all duration-200 ${getPriorityColor(rec.priority)}`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="font-semibold text-card-foreground text-sm sm:text-base leading-tight">
                        {rec.title}
                      </h4>
                      <Badge className={`text-xs font-medium px-2 py-1 rounded-full ${getPriorityBadgeColor(rec.priority)}`}>
                        {rec.priority.charAt(0).toUpperCase() + rec.priority.slice(1)}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                      {rec.description}
                    </p>
                    
                    {rec.progress && (
                      <div className="mb-4">
                        <div className="flex justify-between text-xs font-medium mb-2">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="text-primary">{rec.progress}% complete</span>
                        </div>
                        <Progress value={rec.progress} className="h-2" />
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between pt-2">
                      <div className="text-xs text-muted-foreground space-y-1">
                        {rec.timeLeft && (
                          <div className="flex items-center gap-1">
                            <Clock size={10} />
                            <span>{rec.timeLeft}</span>
                          </div>
                        )}
                        {rec.participants && (
                          <div className="flex items-center gap-1">
                            <Users size={10} />
                            <span>{rec.participants} participants</span>
                          </div>
                        )}
                        {rec.points && (
                          <div className="flex items-center gap-1">
                            <Star size={10} />
                            <span>{rec.points} points needed</span>
                          </div>
                        )}
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="text-xs hover:bg-primary hover:text-primary-foreground transition-colors duration-200 border-primary/20 hover:border-primary"
                      >
                        {rec.action}
                        <ChevronRight size={12} className="ml-1" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Monthly Progress */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            <Card className="shadow-elegant">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-lg sm:text-xl">
                  <div className="p-2 bg-secondary/10 rounded-xl">
                    <Calendar className="text-secondary" size={20} />
                  </div>
                  Monthly Goal
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-card-foreground">
                      Complete 20 farming activities
                    </span>
                    <span className="text-sm font-bold text-primary bg-primary/10 px-2 py-1 rounded-full">
                      15/20
                    </span>
                  </div>
                  <div className="space-y-2">
                    <Progress value={monthlyGoalProgress} className="h-3" />
                    <p className="text-sm text-muted-foreground">
                      {monthlyGoalProgress}% complete • 5 activities remaining
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-secondary/5 to-secondary/10 dark:from-secondary/10 dark:to-secondary/20 rounded-xl p-4 border border-secondary/20 dark:border-secondary/30">
                    <div className="flex items-center gap-2 mb-2">
                      <Gift size={16} className="text-secondary" />
                      <p className="text-sm font-semibold text-secondary">
                        Reward Preview
                      </p>
                    </div>
                    <p className="text-xs text-secondary-foreground">
                      1000 bonus points + Exclusive monthly badge
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-elegant">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-lg sm:text-xl">
                  <div className="p-2 bg-info/10 rounded-xl">
                    <Users className="text-info" size={20} />
                  </div>
                  Community Standing
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/20 rounded-xl border border-primary/10">
                    <Avatar className="h-12 w-12 border-2 border-primary/20">
                      <AvatarImage src="/api/placeholder/48/48" />
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                        YU
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-semibold text-card-foreground">You</p>
                      <p className="text-sm text-primary font-medium">Rank #{userRank}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg text-card-foreground">
                        {userStats.totalPoints.toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground">points</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-border">
                      <span className="text-sm text-muted-foreground">Regional Rank</span>
                      <span className="font-medium text-card-foreground">#12</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-border">
                      <span className="text-sm text-muted-foreground">Category Leader</span>
                      <span className="font-medium text-card-foreground">Crop Health</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-sm text-muted-foreground">Weekly Change</span>
                      <span className="font-medium text-success flex items-center gap-1">
                        <TrendingUp size={12} />
                        +3 positions
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Achievements Tab */}
        <TabsContent value="achievements" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="shadow-elegant">
              <CardHeader>
                <CardTitle>Recent Achievements</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentAchievements.map((achievement) => (
                  <div key={achievement.id} className="flex items-center gap-4 p-3 bg-gradient-to-r from-success/5 to-success/10 dark:from-success/10 dark:to-success/20 rounded-lg">
                    <div className="text-success">
                      <Trophy size={24} />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-card-foreground">{achievement.name}</h4>
                      <p className="text-sm text-muted-foreground">{achievement.description}</p>
                      <Badge className={`mt-1 text-xs ${getRarityColor(achievement.rarity)}`}>
                        {achievement.rarity}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-card-foreground">+{achievement.points} pts</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="shadow-elegant">
              <CardHeader>
                <CardTitle>Progress Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-card-foreground">Achievements Unlocked</span>
                  <span className="text-lg font-bold text-card-foreground">
                    {achievements.filter(a => a.unlocked).length}/{achievements.length}
                  </span>
                </div>
                <Progress 
                  value={(achievements.filter(a => a.unlocked).length / achievements.length) * 100} 
                  className="h-3" 
                />
                
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="text-center p-3 bg-warning/5 dark:bg-warning/10 rounded-lg border border-warning/20 dark:border-warning/30">
                    <p className="text-2xl font-bold text-warning">
                      {achievements.filter(a => a.rarity === 'legendary' && a.unlocked).length}
                    </p>
                    <p className="text-xs text-muted-foreground">Legendary</p>
                  </div>
                  <div className="text-center p-3 bg-info/5 dark:bg-info/10 rounded-lg border border-info/20 dark:border-info/30">
                    <p className="text-2xl font-bold text-info">
                      {achievements.filter(a => a.rarity === 'epic' && a.unlocked).length}
                    </p>
                    <p className="text-xs text-muted-foreground">Epic</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Quests Tab */}
        <TabsContent value="quests" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 shadow-elegant">
              <CardHeader>
                <CardTitle>Active Quests</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {activeQuests.slice(0, 4).map((quest) => (
                  <div key={quest.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-medium text-card-foreground">{quest.name}</h4>
                        <p className="text-sm text-muted-foreground">{quest.description}</p>
                      </div>
                      <Badge className={`text-xs ${
                        quest.type === 'daily' ? 'bg-success/10 dark:bg-success/20 text-success border border-success/20 dark:border-success/30' :
                        quest.type === 'weekly' ? 'bg-info/10 dark:bg-info/20 text-info border border-info/20 dark:border-info/30' :
                        'bg-warning/10 dark:bg-warning/20 text-warning border border-warning/20 dark:border-warning/30'
                      }`}>
                        {quest.type}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="text-card-foreground">{quest.progress}/{quest.maxProgress}</span>
                      </div>
                      <Progress value={(quest.progress / quest.maxProgress) * 100} className="h-2" />
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <div className="text-sm text-muted-foreground">
                        <Clock size={14} className="inline mr-1" />
                        {quest.duration}
                      </div>
                      <div className="text-sm font-medium text-success">
                        +{quest.rewards.find(r => r.type === RewardType.POINTS)?.value || 0} XP
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="shadow-elegant">
              <CardHeader>
                <CardTitle>Quest Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center p-4 bg-gradient-to-br from-info/5 to-info/10 dark:from-info/10 dark:to-info/20 rounded-lg border border-info/20 dark:border-info/30">
                  <p className="text-2xl font-bold text-info">{activeQuests.length}</p>
                  <p className="text-sm text-muted-foreground">Active Quests</p>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-success/5 to-success/10 dark:from-success/10 dark:to-success/20 rounded-lg border border-success/20 dark:border-success/30">
                  <p className="text-2xl font-bold text-success">{completedQuests.length}</p>
                  <p className="text-sm text-muted-foreground">Completed This Week</p>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Weekly Goal</span>
                    <span className="font-medium text-card-foreground">5/7</span>
                  </div>
                  <Progress value={71} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Rewards Tab */}
        <TabsContent value="rewards" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="shadow-elegant">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gift className="text-primary" size={20} />
                  Available Rewards
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {availableRewards.slice(0, 4).map((reward) => (
                  <div key={reward.id} className="flex items-center gap-4 p-3 border rounded-lg">
                    <div className="text-primary">
                      <Gift size={20} />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-card-foreground">{reward.name}</h4>
                      <p className="text-sm text-muted-foreground">{reward.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-card-foreground">{reward.value} pts</p>
                      <Button 
                        size="sm" 
                        disabled={userStats.totalPoints < reward.value}
                        className="mt-1"
                      >
                        {userStats.totalPoints >= reward.value ? 'Redeem' : 'Need More'}
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="shadow-elegant">
              <CardHeader>
                <CardTitle>Recent Rewards</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {redeemedRewards.slice(0, 3).map((reward) => (
                  <div key={reward.id} className="flex items-center gap-4 p-3 bg-gradient-to-r from-success/5 to-success/10 dark:from-success/10 dark:to-success/20 rounded-lg">
                    <div className="text-success">
                      <Gift size={20} />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-card-foreground">{reward.name}</h4>
                      <p className="text-sm text-muted-foreground">Redeemed recently</p>
                    </div>
                    <Badge variant="outline" className="text-success border-success">
                      Used
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Progress Tab */}
        <TabsContent value="progress" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="shadow-elegant">
              <CardHeader>
                <CardTitle>Badge Collection</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-4">
                  {badges.slice(0, 8).map((badge) => (
                    <div key={badge.id} className="text-center">
                      <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-2 ${getRarityColor(badge.rarity)}`}>
                        <Star size={24} />
                      </div>
                      <p className="text-xs font-medium text-card-foreground">{badge.name}</p>
                      <Badge className={`text-xs mt-1 ${getRarityColor(badge.rarity)}`}>
                        {badge.rarity}
                      </Badge>
                    </div>
                  ))}
                </div>
                <div className="mt-4 text-center">
                  <Button variant="outline" size="sm">
                    <Eye size={16} className="mr-2" />
                    View All Badges
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-elegant">
              <CardHeader>
                <CardTitle>Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-gradient-to-br from-success/5 to-success/10 dark:from-success/10 dark:to-success/20 rounded-lg border border-success/20 dark:border-success/30">
                    <p className="text-xl font-bold text-success">
                      {userStats.questsCompleted}
                    </p>
                    <p className="text-xs text-muted-foreground">Quests Completed</p>
                  </div>
                  <div className="text-center p-3 bg-gradient-to-br from-warning/5 to-warning/10 dark:from-warning/10 dark:to-warning/20 rounded-lg border border-warning/20 dark:border-warning/30">
                    <p className="text-xl font-bold text-warning">
                      {userStats.challengesWon}
                    </p>
                    <p className="text-xs text-muted-foreground">Challenges Won</p>
                  </div>
                  <div className="text-center p-3 bg-gradient-to-br from-info/5 to-info/10 dark:from-info/10 dark:to-info/20 rounded-lg border border-info/20 dark:border-info/30">
                    <p className="text-xl font-bold text-info">
                      {userStats.currentStreak}
                    </p>
                    <p className="text-xs text-muted-foreground">Day Streak</p>
                  </div>
                  <div className="text-center p-3 bg-gradient-to-br from-secondary/5 to-secondary/10 dark:from-secondary/10 dark:to-secondary/20 rounded-lg border border-secondary/20 dark:border-secondary/30">
                    <p className="text-xl font-bold text-secondary">
                      {userStats.communityHelpPoints}
                    </p>
                    <p className="text-xs text-muted-foreground">Helpful Votes</p>
                  </div>
                </div>
                
                <div className="space-y-3 mt-6">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Knowledge Sharing</span>
                      <span className="text-card-foreground">85%</span>
                    </div>
                    <Progress value={85} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Community Engagement</span>
                      <span className="text-card-foreground">92%</span>
                    </div>
                    <Progress value={92} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Learning Progress</span>
                      <span className="text-card-foreground">78%</span>
                    </div>
                    <Progress value={78} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
      </div>
    </div>
  );
};

export default GamificationDashboard;