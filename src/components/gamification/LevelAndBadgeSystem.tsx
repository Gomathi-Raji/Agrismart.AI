import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useUserProgress, useBadges } from '@/hooks/useGamification';
import { Badge as BadgeType, BadgeCategory, BadgeRarity, UserLevel } from '@/types/gamification';
import { gamificationData, levelThresholds } from '@/data/gamificationData';
import { 
  Crown, 
  Star, 
  Award,
  Zap,
  TrendingUp,
  Target,
  Medal,
  Sparkles,
  Trophy,
  Shield,
  Flame,
  Leaf,
  BookOpen,
  Users,
  Lightbulb,
  Calendar,
  Lock,
  CheckCircle,
  ArrowUp
} from 'lucide-react';

interface LevelProgressCardProps {
  userLevel: UserLevel;
  levelProgress: number;
  nextLevel: { level: number; title: string; xpRequired: number } | null;
}

function LevelProgressCard({ userLevel, levelProgress, nextLevel }: LevelProgressCardProps) {
  return (
    <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Crown className="h-6 w-6 text-yellow-500" />
          Current Level
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center mb-6">
          <div className="text-4xl font-bold text-blue-600 mb-2">
            Level {userLevel.currentLevel}
          </div>
          <div className="text-xl font-semibold text-blue-700 mb-4">
            {userLevel.title}
          </div>
          
          {/* XP Progress */}
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span>Progress to Next Level</span>
              <span className="font-medium">
                {userLevel.currentXP} / {userLevel.currentXP + userLevel.xpToNextLevel} XP
              </span>
            </div>
            <Progress value={levelProgress} className="h-3" />
            <div className="text-sm text-muted-foreground">
              {userLevel.xpToNextLevel} XP needed for {nextLevel?.title || 'Max Level'}
            </div>
          </div>
        </div>

        {/* Level Benefits */}
        <div className="space-y-3">
          <h4 className="font-medium text-center">Level Benefits</h4>
          <div className="grid grid-cols-1 gap-2">
            {userLevel.benefits.map((benefit, index) => (
              <div key={index} className="flex items-center gap-2 text-sm bg-white/50 rounded-lg p-2">
                <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                <span>{benefit}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Next Level Preview */}
        {nextLevel && (
          <div className="mt-6 p-4 bg-white/70 rounded-lg border-2 border-dashed border-blue-300">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <ArrowUp className="h-5 w-5 text-blue-500" />
                <span className="font-medium">Next: Level {nextLevel.level}</span>
              </div>
              <div className="text-lg font-semibold text-blue-600">
                {nextLevel.title}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface BadgeCardProps {
  badge: BadgeType;
  isEarned: boolean;
}

function BadgeCard({ badge, isEarned }: BadgeCardProps) {
  const getRarityColor = (rarity: BadgeRarity) => {
    switch (rarity) {
      case BadgeRarity.BRONZE: return 'border-amber-600 bg-amber-50';
      case BadgeRarity.SILVER: return 'border-gray-400 bg-gray-50';
      case BadgeRarity.GOLD: return 'border-yellow-500 bg-yellow-50';
      case BadgeRarity.PLATINUM: return 'border-purple-500 bg-purple-50';
      case BadgeRarity.DIAMOND: return 'border-blue-500 bg-blue-50';
      default: return 'border-gray-300 bg-gray-50';
    }
  };

  const getRarityIcon = (rarity: BadgeRarity) => {
    switch (rarity) {
      case BadgeRarity.BRONZE: return <Medal className="h-4 w-4 text-amber-600" />;
      case BadgeRarity.SILVER: return <Medal className="h-4 w-4 text-gray-500" />;
      case BadgeRarity.GOLD: return <Trophy className="h-4 w-4 text-yellow-500" />;
      case BadgeRarity.PLATINUM: return <Crown className="h-4 w-4 text-purple-500" />;
      case BadgeRarity.DIAMOND: return <Sparkles className="h-4 w-4 text-blue-500" />;
      default: return <Star className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card 
        className={`relative overflow-hidden transition-all duration-300 hover:shadow-lg ${
          isEarned ? getRarityColor(badge.rarity) : 'bg-muted/30 border-muted opacity-60'
        }`}
      >
        <CardContent className="p-4 text-center">
          {/* Lock overlay for unearned badges */}
          {!isEarned && (
            <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
              <Lock className="h-8 w-8 text-muted-foreground" />
            </div>
          )}

          <div className={`text-4xl mb-3 ${isEarned ? '' : 'grayscale'}`}>
            {badge.icon}
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-center gap-1">
              {getRarityIcon(badge.rarity)}
              <Badge variant="outline" className="text-xs capitalize">
                {badge.rarity}
              </Badge>
            </div>
            
            <h3 className={`font-semibold ${isEarned ? 'text-foreground' : 'text-muted-foreground'}`}>
              {badge.name}
            </h3>
            
            <p className={`text-sm ${isEarned ? 'text-muted-foreground' : 'text-muted-foreground/70'}`}>
              {badge.description}
            </p>
            
            <div className="flex items-center justify-center gap-2 text-sm">
              <Zap className="h-4 w-4 text-yellow-500" />
              <span className="font-medium">{badge.points} pts</span>
            </div>

            {isEarned && badge.earnedAt && (
              <div className="text-xs text-green-600 mt-2">
                Earned on {badge.earnedAt.toLocaleDateString()}
              </div>
            )}
          </div>

          {/* Glow effect for earned badges */}
          {isEarned && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

interface LevelPathProps {
  currentLevel: number;
  levelThresholds: Array<{ level: number; title: string; xpRequired: number }>;
}

function LevelPath({ currentLevel, levelThresholds }: LevelPathProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Level Progression Path
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {levelThresholds.slice(0, 15).map((threshold, index) => {
            const isUnlocked = threshold.level <= currentLevel;
            const isCurrent = threshold.level === currentLevel;
            const isNext = threshold.level === currentLevel + 1;
            
            return (
              <motion.div
                key={threshold.level}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`flex items-center gap-4 p-3 rounded-lg transition-all ${
                  isCurrent ? 'bg-blue-100 border-2 border-blue-300' :
                  isUnlocked ? 'bg-green-50 border border-green-200' :
                  isNext ? 'bg-yellow-50 border border-yellow-200' :
                  'bg-muted/30 border border-muted'
                }`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                  isCurrent ? 'bg-blue-500 text-white' :
                  isUnlocked ? 'bg-green-500 text-white' :
                  isNext ? 'bg-yellow-500 text-white' :
                  'bg-muted text-muted-foreground'
                }`}>
                  {threshold.level}
                </div>
                
                <div className="flex-1">
                  <h4 className={`font-semibold ${
                    isUnlocked ? 'text-foreground' : 'text-muted-foreground'
                  }`}>
                    {threshold.title}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {threshold.xpRequired.toLocaleString()} XP required
                  </p>
                </div>
                
                <div className="text-right">
                  {isCurrent && (
                    <Badge className="bg-blue-500">Current</Badge>
                  )}
                  {isNext && (
                    <Badge variant="outline" className="border-yellow-500 text-yellow-700">
                      Next
                    </Badge>
                  )}
                  {isUnlocked && !isCurrent && (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  )}
                  {!isUnlocked && !isNext && (
                    <Lock className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

export function LevelAndBadgeSystem() {
  const { userLevel, levelProgress, isNearLevelUp } = useUserProgress();
  const { badges, badgesByCategory, badgesByRarity, totalBadges, rareCount } = useBadges();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedRarity, setSelectedRarity] = useState<string>('all');

  // Mock data for demonstration
  const mockBadges = gamificationData.badges;
  const nextLevelInfo = levelThresholds.find(t => t.level > userLevel.currentLevel) || null;

  const getCategoryIcon = (category: BadgeCategory) => {
    switch (category) {
      case BadgeCategory.CROP_EXPERT: return <Leaf className="h-4 w-4" />;
      case BadgeCategory.COMMUNITY_LEADER: return <Users className="h-4 w-4" />;
      case BadgeCategory.TECH_PIONEER: return <Zap className="h-4 w-4" />;
      case BadgeCategory.MARKET_MASTER: return <TrendingUp className="h-4 w-4" />;
      case BadgeCategory.SUSTAINABILITY_CHAMPION: return <Shield className="h-4 w-4" />;
      case BadgeCategory.MENTOR: return <BookOpen className="h-4 w-4" />;
      case BadgeCategory.INNOVATOR: return <Lightbulb className="h-4 w-4" />;
      case BadgeCategory.SEASONAL: return <Calendar className="h-4 w-4" />;
      default: return <Star className="h-4 w-4" />;
    }
  };

  const filteredBadges = mockBadges.filter(badge => {
    const matchesCategory = selectedCategory === 'all' || badge.category === selectedCategory;
    const matchesRarity = selectedRarity === 'all' || badge.rarity === selectedRarity;
    return matchesCategory && matchesRarity;
  });

  const earnedBadges = filteredBadges.filter(badge => badge.earnedAt);
  const availableBadges = filteredBadges.filter(badge => !badge.earnedAt);

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Crown className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
            <div className="text-2xl font-bold">{userLevel.currentLevel}</div>
            <div className="text-sm text-muted-foreground">Current Level</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Award className="h-8 w-8 mx-auto mb-2 text-purple-500" />
            <div className="text-2xl font-bold">{earnedBadges.length}</div>
            <div className="text-sm text-muted-foreground">Badges Earned</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Sparkles className="h-8 w-8 mx-auto mb-2 text-blue-500" />
            <div className="text-2xl font-bold">{mockBadges.filter(b => ['gold', 'platinum', 'diamond'].includes(b.rarity)).length}</div>
            <div className="text-sm text-muted-foreground">Rare Badges</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-8 w-8 mx-auto mb-2 text-green-500" />
            <div className="text-2xl font-bold">{Math.round((earnedBadges.length / mockBadges.length) * 100)}%</div>
            <div className="text-sm text-muted-foreground">Collection</div>
          </CardContent>
        </Card>
      </div>

      {/* Level Progress Alert */}
      {isNearLevelUp && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-4"
        >
          <div className="flex items-center gap-3">
            <Flame className="h-6 w-6 text-orange-500" />
            <div>
              <h3 className="font-semibold text-orange-800">Almost there!</h3>
              <p className="text-sm text-orange-700">
                You're only {userLevel.xpToNextLevel} XP away from reaching {nextLevelInfo?.title}!
              </p>
            </div>
            <Button size="sm" variant="outline" className="ml-auto">
              View Quests
            </Button>
          </div>
        </motion.div>
      )}

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="badges">Badge Collection</TabsTrigger>
          <TabsTrigger value="progression">Level Path</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <LevelProgressCard
              userLevel={userLevel}
              levelProgress={levelProgress}
              nextLevel={nextLevelInfo}
            />
            
            {/* Recent Badges */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Recent Badges
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {earnedBadges.slice(0, 4).map((badge) => (
                    <BadgeCard key={badge.id} badge={badge} isEarned={true} />
                  ))}
                </div>
                {earnedBadges.length === 0 && (
                  <div className="text-center text-muted-foreground py-8">
                    <Award className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No badges earned yet. Complete quests to earn your first badge!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="badges" className="space-y-6">
          {/* Badge Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex gap-4">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-2 border rounded-md bg-background"
                >
                  <option value="all">All Categories</option>
                  {Object.values(BadgeCategory).map(category => (
                    <option key={category} value={category}>
                      {category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </option>
                  ))}
                </select>
                
                <select
                  value={selectedRarity}
                  onChange={(e) => setSelectedRarity(e.target.value)}
                  className="px-3 py-2 border rounded-md bg-background capitalize"
                >
                  <option value="all">All Rarities</option>
                  {Object.values(BadgeRarity).map(rarity => (
                    <option key={rarity} value={rarity} className="capitalize">
                      {rarity}
                    </option>
                  ))}
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Badge Collection */}
          <div className="space-y-6">
            {earnedBadges.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  Earned Badges ({earnedBadges.length})
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {earnedBadges.map((badge) => (
                    <BadgeCard key={badge.id} badge={badge} isEarned={true} />
                  ))}
                </div>
              </div>
            )}
            
            {availableBadges.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Target className="h-5 w-5 text-muted-foreground" />
                  Available Badges ({availableBadges.length})
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {availableBadges.map((badge) => (
                    <BadgeCard key={badge.id} badge={badge} isEarned={false} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="progression">
          <LevelPath 
            currentLevel={userLevel.currentLevel} 
            levelThresholds={levelThresholds}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}