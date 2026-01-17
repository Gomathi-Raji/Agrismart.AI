import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuests } from '@/hooks/useGamification';
import { Quest, QuestDifficulty, QuestType } from '@/types/gamification';
import { 
  Target, 
  Clock, 
  Gift, 
  CheckCircle, 
  Calendar,
  Flame,
  Zap,
  Star,
  Trophy,
  ChevronRight,
  Timer,
  Award
} from 'lucide-react';

interface QuestCardProps {
  quest: Quest;
  onView: (quest: Quest) => void;
  onComplete?: (questId: string) => void;
}

function QuestCard({ quest, onView, onComplete }: QuestCardProps) {
  const progressPercentage = (quest.progress / quest.maxProgress) * 100;
  const isCompleted = quest.completed;
  const canComplete = quest.progress >= quest.maxProgress && !quest.completed;

  const getDifficultyColor = (difficulty: QuestDifficulty) => {
    switch (difficulty) {
      case QuestDifficulty.EASY: return 'text-green-600 bg-green-100';
      case QuestDifficulty.MEDIUM: return 'text-yellow-600 bg-yellow-100';
      case QuestDifficulty.HARD: return 'text-orange-600 bg-orange-100';
      case QuestDifficulty.EXPERT: return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTypeIcon = (type: QuestType) => {
    switch (type) {
      case QuestType.DAILY: return <Calendar className="h-4 w-4" />;
      case QuestType.WEEKLY: return <Target className="h-4 w-4" />;
      case QuestType.MONTHLY: return <Trophy className="h-4 w-4" />;
      case QuestType.SPECIAL: return <Star className="h-4 w-4" />;
      default: return <Target className="h-4 w-4" />;
    }
  };

  const getTimeRemaining = () => {
    const now = new Date();
    const timeLeft = quest.endDate.getTime() - now.getTime();
    
    if (timeLeft <= 0) return 'Expired';
    
    const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m left`;
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
          isCompleted ? 'bg-green-50 border-green-200' : 
          canComplete ? 'bg-blue-50 border-blue-200' : 'bg-background'
        }`}
        onClick={() => onView(quest)}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3 flex-1">
              <div className="text-2xl">
                {quest.type === QuestType.DAILY && '📅'}
                {quest.type === QuestType.WEEKLY && '📆'}
                {quest.type === QuestType.MONTHLY && '🗓️'}
                {quest.type === QuestType.SPECIAL && '⭐'}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  {getTypeIcon(quest.type)}
                  <Badge variant="outline" className="text-xs">
                    {quest.type}
                  </Badge>
                  <Badge className={`text-xs ${getDifficultyColor(quest.difficulty)}`}>
                    {quest.difficulty}
                  </Badge>
                </div>
                <CardTitle className="text-lg">{quest.name}</CardTitle>
              </div>
            </div>
            
            <div className="text-right">
              {isCompleted ? (
                <div className="text-green-600">
                  <CheckCircle className="h-6 w-6" />
                </div>
              ) : canComplete ? (
                <Button
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onComplete?.(quest.id);
                  }}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Complete
                </Button>
              ) : (
                <div className="text-muted-foreground text-sm">
                  <Clock className="h-4 w-4 inline mr-1" />
                  {getTimeRemaining()}
                </div>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          <p className="text-sm text-muted-foreground mb-4">{quest.description}</p>
          
          {!isCompleted && (
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium">
                  {quest.progress}/{quest.maxProgress}
                </span>
              </div>
              <Progress 
                value={progressPercentage} 
                className="h-2"
              />
            </div>
          )}
          
          {/* Rewards */}
          <div className="mt-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <Gift className="h-4 w-4" />
              <span>Rewards:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {quest.rewards.map((reward, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {reward.icon} {reward.name}
                </Badge>
              ))}
            </div>
          </div>
          
          {isCompleted && quest.completedAt && (
            <div className="mt-3 text-sm text-green-600 flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Completed on {quest.completedAt.toLocaleDateString()}
            </div>
          )}
        </CardContent>
        
        {/* Progress glow for near completion */}
        {progressPercentage > 80 && !isCompleted && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-400/10 to-transparent animate-pulse" />
        )}
      </Card>
    </motion.div>
  );
}

interface QuestDetailModalProps {
  quest: Quest | null;
  isOpen: boolean;
  onClose: () => void;
  onComplete?: (questId: string) => void;
}

function QuestDetailModal({ quest, isOpen, onClose, onComplete }: QuestDetailModalProps) {
  if (!quest) return null;

  const progressPercentage = (quest.progress / quest.maxProgress) * 100;
  const canComplete = quest.progress >= quest.maxProgress && !quest.completed;
  
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
            className="bg-background rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center mb-6">
              <div className="text-4xl mb-4">
                {quest.type === QuestType.DAILY && '📅'}
                {quest.type === QuestType.WEEKLY && '📆'}
                {quest.type === QuestType.MONTHLY && '🗓️'}
                {quest.type === QuestType.SPECIAL && '⭐'}
              </div>
              <h2 className="text-2xl font-bold mb-2">{quest.name}</h2>
              <div className="flex justify-center gap-2 mb-2">
                <Badge variant="outline">{quest.type}</Badge>
                <Badge className={getDifficultyColor(quest.difficulty)}>
                  {quest.difficulty}
                </Badge>
              </div>
              <p className="text-muted-foreground">{quest.description}</p>
            </div>
            
            <div className="space-y-4">
              {/* Progress */}
              {!quest.completed && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{quest.progress}/{quest.maxProgress}</span>
                  </div>
                  <Progress value={progressPercentage} />
                </div>
              )}
              
              {/* Requirements */}
              <div className="space-y-2">
                <h4 className="font-medium">Requirements</h4>
                {quest.requirements.map((req, index) => (
                  <div key={index} className="text-sm text-muted-foreground flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      quest.progress > index ? 'bg-green-500' : 'bg-gray-300'
                    }`} />
                    {req.description}
                  </div>
                ))}
              </div>
              
              {/* Time Remaining */}
              <div className="flex justify-between items-center text-sm">
                <span>Time Remaining</span>
                <span className="font-medium">
                  <Timer className="h-4 w-4 inline mr-1" />
                  {getTimeRemaining()}
                </span>
              </div>
              
              {/* Rewards */}
              <div className="space-y-2">
                <h4 className="font-medium">Rewards</h4>
                <div className="grid grid-cols-1 gap-2">
                  {quest.rewards.map((reward, index) => (
                    <div key={index} className="flex items-center gap-3 p-2 bg-muted rounded-lg">
                      <span className="text-lg">{reward.icon}</span>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{reward.name}</p>
                        <p className="text-xs text-muted-foreground">{reward.description}</p>
                      </div>
                      {reward.value > 0 && (
                        <Badge variant="secondary">{reward.value}</Badge>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              
              {quest.completed && (
                <div className="text-center text-green-600 font-medium">
                  <CheckCircle className="h-5 w-5 inline mr-2" />
                  Completed on {quest.completedAt?.toLocaleDateString()}
                </div>
              )}
            </div>
            
            <div className="flex gap-3 mt-6">
              <Button onClick={onClose} variant="outline" className="flex-1">
                Close
              </Button>
              {canComplete && onComplete && (
                <Button 
                  onClick={() => {
                    onComplete(quest.id);
                    onClose();
                  }}
                  className="flex-1"
                >
                  Complete Quest
                </Button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  function getDifficultyColor(difficulty: QuestDifficulty) {
    switch (difficulty) {
      case QuestDifficulty.EASY: return 'text-green-600 bg-green-100';
      case QuestDifficulty.MEDIUM: return 'text-yellow-600 bg-yellow-100';
      case QuestDifficulty.HARD: return 'text-orange-600 bg-orange-100';
      case QuestDifficulty.EXPERT: return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  }

  function getTimeRemaining() {
    if (!quest) return '';
    const now = new Date();
    const timeLeft = quest.endDate.getTime() - now.getTime();
    
    if (timeLeft <= 0) return 'Expired';
    
    const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m left`;
  }
}

export function QuestSystem() {
  const { 
    activeQuests,
    completedQuests,
    dailyQuests,
    weeklyQuests,
    monthlyQuests,
    specialQuests,
    completeQuest,
    getQuestProgress,
    canCompleteQuest
  } = useQuests();

  const [selectedQuest, setSelectedQuest] = useState<Quest | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [activeTab, setActiveTab] = useState('active');

  const handleViewQuest = (quest: Quest) => {
    setSelectedQuest(quest);
    setShowDetail(true);
  };

  const handleCompleteQuest = (questId: string) => {
    completeQuest(questId);
  };

  const getTabQuests = () => {
    switch (activeTab) {
      case 'daily':
        return dailyQuests;
      case 'weekly':
        return weeklyQuests;
      case 'monthly':
        return monthlyQuests;
      case 'special':
        return specialQuests;
      case 'completed':
        return completedQuests;
      default:
        return activeQuests;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Target className="h-8 w-8 mx-auto mb-2 text-blue-500" />
            <div className="text-2xl font-bold">{activeQuests.length}</div>
            <div className="text-sm text-muted-foreground">Active</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
            <div className="text-2xl font-bold">{completedQuests.length}</div>
            <div className="text-sm text-muted-foreground">Completed</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Flame className="h-8 w-8 mx-auto mb-2 text-orange-500" />
            <div className="text-2xl font-bold">{dailyQuests.length}</div>
            <div className="text-sm text-muted-foreground">Daily</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Star className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
            <div className="text-2xl font-bold">{specialQuests.length}</div>
            <div className="text-sm text-muted-foreground">Special</div>
          </CardContent>
        </Card>
      </div>

      {/* Quest Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-6 w-full">
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="daily">Daily</TabsTrigger>
          <TabsTrigger value="weekly">Weekly</TabsTrigger>
          <TabsTrigger value="monthly">Monthly</TabsTrigger>
          <TabsTrigger value="special">Special</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          <div className="space-y-4">
            {getTabQuests().map((quest) => (
              <QuestCard
                key={quest.id}
                quest={quest}
                onView={handleViewQuest}
                onComplete={handleCompleteQuest}
              />
            ))}
          </div>
          
          {getTabQuests().length === 0 && (
            <div className="text-center py-12">
              <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">
                {activeTab === 'completed' 
                  ? 'No completed quests yet. Start completing some quests!'
                  : 'No active quests in this category.'
                }
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Quest Detail Modal */}
      <QuestDetailModal
        quest={selectedQuest}
        isOpen={showDetail}
        onClose={() => setShowDetail(false)}
        onComplete={handleCompleteQuest}
      />
    </div>
  );
}