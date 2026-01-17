import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAchievements } from '@/hooks/useGamification';
import { Achievement, AchievementCategory, AchievementRarity } from '@/types/gamification';
import { 
  Trophy, 
  Star, 
  Lock, 
  Sparkles, 
  Target,
  TrendingUp,
  Zap,
  Crown,
  Award,
  Filter,
  Search,
  ChevronRight
} from 'lucide-react';
import { Input } from '@/components/ui/input';

interface AchievementCardProps {
  achievement: Achievement;
  onView: (achievement: Achievement) => void;
}

function AchievementCard({ achievement, onView }: AchievementCardProps) {
  const progressPercentage = (achievement.progress / achievement.maxProgress) * 100;
  
  const getRarityColor = (rarity: AchievementRarity) => {
    switch (rarity) {
      case AchievementRarity.COMMON: return 'border-gray-300 bg-gray-50';
      case AchievementRarity.UNCOMMON: return 'border-green-300 bg-green-50';
      case AchievementRarity.RARE: return 'border-blue-300 bg-blue-50';
      case AchievementRarity.EPIC: return 'border-purple-300 bg-purple-50';
      case AchievementRarity.LEGENDARY: return 'border-yellow-300 bg-yellow-50';
      default: return 'border-gray-300 bg-gray-50';
    }
  };

  const getRarityIcon = (rarity: AchievementRarity) => {
    switch (rarity) {
      case AchievementRarity.COMMON: return <Star className="h-4 w-4 text-gray-500" />;
      case AchievementRarity.UNCOMMON: return <Star className="h-4 w-4 text-green-500" />;
      case AchievementRarity.RARE: return <Sparkles className="h-4 w-4 text-blue-500" />;
      case AchievementRarity.EPIC: return <Crown className="h-4 w-4 text-purple-500" />;
      case AchievementRarity.LEGENDARY: return <Trophy className="h-4 w-4 text-yellow-500" />;
      default: return <Star className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card 
        className={`relative overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-lg ${
          achievement.unlocked ? getRarityColor(achievement.rarity) : 'border-muted bg-muted/30'
        }`}
        onClick={() => onView(achievement)}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className={`text-3xl ${achievement.unlocked ? '' : 'grayscale opacity-50'}`}>
                {achievement.icon}
              </div>
              <div className="flex-1">
                <CardTitle className={`text-lg ${achievement.unlocked ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {achievement.name}
                </CardTitle>
                <div className="flex items-center gap-2 mt-1">
                  {getRarityIcon(achievement.rarity)}
                  <Badge variant="outline" className="text-xs capitalize">
                    {achievement.rarity}
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    {achievement.points} pts
                  </Badge>
                </div>
              </div>
            </div>
            {!achievement.unlocked && achievement.hidden && (
              <Lock className="h-5 w-5 text-muted-foreground" />
            )}
            {achievement.unlocked && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring' }}
              >
                <Trophy className="h-5 w-5 text-yellow-500" />
              </motion.div>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          <p className={`text-sm mb-4 ${achievement.unlocked ? 'text-foreground' : 'text-muted-foreground'}`}>
            {achievement.description}
          </p>
          
          {!achievement.unlocked && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium">
                  {achievement.progress}/{achievement.maxProgress}
                </span>
              </div>
              <Progress 
                value={progressPercentage} 
                className="h-2"
              />
            </div>
          )}
          
          {achievement.unlocked && achievement.unlockedAt && (
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Unlocked</span>
              <span>{new Date(achievement.unlockedAt).toLocaleDateString()}</span>
            </div>
          )}
        </CardContent>
        
        {/* Celebration animation for unlocked achievements */}
        {achievement.unlocked && (
          <div className="absolute inset-0 pointer-events-none">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              className="absolute top-2 right-2"
            >
              <Sparkles className="h-4 w-4 text-yellow-400" />
            </motion.div>
          </div>
        )}
      </Card>
    </motion.div>
  );
}

interface AchievementDetailModalProps {
  achievement: Achievement | null;
  isOpen: boolean;
  onClose: () => void;
}

function AchievementDetailModal({ achievement, isOpen, onClose }: AchievementDetailModalProps) {
  if (!achievement) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="bg-background rounded-lg p-6 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">{achievement.icon}</div>
              <h2 className="text-2xl font-bold mb-2">{achievement.name}</h2>
              <Badge variant="outline" className="mb-2 capitalize">
                {achievement.rarity}
              </Badge>
              <p className="text-muted-foreground">{achievement.description}</p>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="font-medium">Points Reward</span>
                <Badge variant="secondary">{achievement.points} pts</Badge>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium">Requirements</h4>
                {achievement.requirements.map((req, index) => (
                  <div key={index} className="text-sm text-muted-foreground">
                    • {req.description}
                  </div>
                ))}
              </div>
              
              {!achievement.unlocked && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{achievement.progress}/{achievement.maxProgress}</span>
                  </div>
                  <Progress value={(achievement.progress / achievement.maxProgress) * 100} />
                </div>
              )}
              
              {achievement.unlocked && (
                <div className="text-center text-green-600 font-medium">
                  <Trophy className="h-5 w-5 inline mr-2" />
                  Unlocked on {achievement.unlockedAt?.toLocaleDateString()}
                </div>
              )}
            </div>
            
            <Button onClick={onClose} className="w-full mt-6">
              Close
            </Button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function AchievementSystem() {
  const { 
    achievements, 
    unlockedAchievements, 
    lockedAchievements,
    recentAchievements,
    getAchievementsByCategory,
    getAchievementsByRarity,
    completionRate
  } = useAchievements();

  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedRarity, setSelectedRarity] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('all');

  const filteredAchievements = achievements.filter(achievement => {
    const matchesSearch = achievement.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         achievement.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || achievement.category === selectedCategory;
    const matchesRarity = selectedRarity === 'all' || achievement.rarity === selectedRarity;
    
    return matchesSearch && matchesCategory && matchesRarity;
  });

  const getTabAchievements = () => {
    switch (activeTab) {
      case 'unlocked':
        return filteredAchievements.filter(a => a.unlocked);
      case 'locked':
        return filteredAchievements.filter(a => !a.unlocked);
      case 'recent':
        return recentAchievements.filter(a => 
          filteredAchievements.some(fa => fa.id === a.id)
        );
      default:
        return filteredAchievements;
    }
  };

  const handleViewAchievement = (achievement: Achievement) => {
    setSelectedAchievement(achievement);
    setShowDetail(true);
  };

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Trophy className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
            <div className="text-2xl font-bold">{unlockedAchievements.length}</div>
            <div className="text-sm text-muted-foreground">Unlocked</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Target className="h-8 w-8 mx-auto mb-2 text-blue-500" />
            <div className="text-2xl font-bold">{achievements.length}</div>
            <div className="text-sm text-muted-foreground">Total</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-8 w-8 mx-auto mb-2 text-green-500" />
            <div className="text-2xl font-bold">{Math.round(completionRate)}%</div>
            <div className="text-sm text-muted-foreground">Complete</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Sparkles className="h-8 w-8 mx-auto mb-2 text-purple-500" />
            <div className="text-2xl font-bold">{recentAchievements.length}</div>
            <div className="text-sm text-muted-foreground">Recent</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search achievements..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border rounded-md bg-background"
              >
                <option value="all">All Categories</option>
                {Object.values(AchievementCategory).map(category => (
                  <option key={category} value={category} className="capitalize">
                    {category.replace('_', ' ')}
                  </option>
                ))}
              </select>
              
              <select
                value={selectedRarity}
                onChange={(e) => setSelectedRarity(e.target.value)}
                className="px-3 py-2 border rounded-md bg-background"
              >
                <option value="all">All Rarities</option>
                {Object.values(AchievementRarity).map(rarity => (
                  <option key={rarity} value={rarity} className="capitalize">
                    {rarity}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Achievement Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="unlocked">Unlocked</TabsTrigger>
          <TabsTrigger value="locked">In Progress</TabsTrigger>
          <TabsTrigger value="recent">Recent</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {getTabAchievements().map((achievement) => (
              <AchievementCard
                key={achievement.id}
                achievement={achievement}
                onView={handleViewAchievement}
              />
            ))}
          </div>
          
          {getTabAchievements().length === 0 && (
            <div className="text-center py-12">
              <Trophy className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No achievements found matching your criteria.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Achievement Detail Modal */}
      <AchievementDetailModal
        achievement={selectedAchievement}
        isOpen={showDetail}
        onClose={() => setShowDetail(false)}
      />
    </div>
  );
}