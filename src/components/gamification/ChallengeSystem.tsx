import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useChallenges } from '@/hooks/useGamification';
import { Challenge, ChallengeType, ChallengeStatus } from '@/types/gamification';
import { 
  Users, 
  Trophy, 
  Clock, 
  User,
  Globe,
  MapPin,
  Calendar,
  Award,
  Crown,
  Target,
  Flame,
  Star,
  ChevronRight,
  Timer,
  Medal
} from 'lucide-react';

interface ChallengeCardProps {
  challenge: Challenge;
  onView: (challenge: Challenge) => void;
  onJoin?: (challengeId: string) => void;
}

function ChallengeCard({ challenge, onView, onJoin }: ChallengeCardProps) {
  const isActive = challenge.status === ChallengeStatus.ACTIVE;
  const isUpcoming = challenge.status === ChallengeStatus.UPCOMING;
  const isCompleted = challenge.status === ChallengeStatus.COMPLETED;
  
  const getStatusColor = (status: ChallengeStatus) => {
    switch (status) {
      case ChallengeStatus.ACTIVE: return 'text-green-600 bg-green-100';
      case ChallengeStatus.UPCOMING: return 'text-blue-600 bg-blue-100';
      case ChallengeStatus.COMPLETED: return 'text-gray-600 bg-gray-100';
      case ChallengeStatus.CANCELLED: return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTypeIcon = (type: ChallengeType) => {
    switch (type) {
      case ChallengeType.INDIVIDUAL: return <User className="h-4 w-4" />;
      case ChallengeType.TEAM: return <Users className="h-4 w-4" />;
      case ChallengeType.COMMUNITY: return <Globe className="h-4 w-4" />;
      case ChallengeType.REGIONAL: return <MapPin className="h-4 w-4" />;
      case ChallengeType.GLOBAL: return <Globe className="h-4 w-4" />;
      default: return <Target className="h-4 w-4" />;
    }
  };

  const getTimeInfo = () => {
    const now = new Date();
    
    if (isUpcoming) {
      const timeUntilStart = challenge.startDate.getTime() - now.getTime();
      const days = Math.floor(timeUntilStart / (1000 * 60 * 60 * 24));
      const hours = Math.floor((timeUntilStart % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      
      if (days > 0) return `Starts in ${days}d ${hours}h`;
      return `Starts in ${hours}h`;
    }
    
    if (isActive) {
      const timeLeft = challenge.endDate.getTime() - now.getTime();
      const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
      const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      
      if (days > 0) return `${days}d ${hours}h left`;
      return `${hours}h left`;
    }
    
    return 'Ended';
  };

  const participationPercentage = challenge.maxParticipants 
    ? (challenge.participants / challenge.maxParticipants) * 100 
    : 0;

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
          isActive ? 'bg-green-50 border-green-200' : 
          isUpcoming ? 'bg-blue-50 border-blue-200' : 'bg-background'
        }`}
        onClick={() => onView(challenge)}
      >
        {/* Challenge Type Badge */}
        <div className="absolute top-4 right-4">
          <Badge className={getStatusColor(challenge.status)}>
            {challenge.status}
          </Badge>
        </div>

        <CardHeader className="pb-3">
          <div className="flex items-center gap-3 pr-20">
            <div className="text-3xl">
              {challenge.type === ChallengeType.INDIVIDUAL && '🏃'}
              {challenge.type === ChallengeType.TEAM && '👥'}
              {challenge.type === ChallengeType.COMMUNITY && '🌍'}
              {challenge.type === ChallengeType.REGIONAL && '🗺️'}
              {challenge.type === ChallengeType.GLOBAL && '🌐'}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                {getTypeIcon(challenge.type)}
                <Badge variant="outline" className="text-xs">
                  {challenge.type}
                </Badge>
              </div>
              <CardTitle className="text-xl">{challenge.name}</CardTitle>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          <p className="text-sm text-muted-foreground mb-4">{challenge.description}</p>
          
          {/* Challenge Stats */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{challenge.participants}</div>
              <div className="text-xs text-muted-foreground">Participants</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-secondary">{challenge.rewards.length}</div>
              <div className="text-xs text-muted-foreground">Rewards</div>
            </div>
          </div>

          {/* Participation Progress */}
          {challenge.maxParticipants && (
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Participation</span>
                <span className="font-medium">
                  {challenge.participants}/{challenge.maxParticipants}
                </span>
              </div>
              <Progress value={participationPercentage} className="h-2" />
            </div>
          )}
          
          {/* Time Info */}
          <div className="flex items-center justify-between text-sm mb-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{getTimeInfo()}</span>
            </div>
            {challenge.leaderboard.length > 0 && (
              <div className="flex items-center gap-2">
                <Trophy className="h-4 w-4 text-yellow-500" />
                <span className="text-sm font-medium">
                  {challenge.leaderboard[0]?.name} leading
                </span>
              </div>
            )}
          </div>

          {/* Top Rewards Preview */}
          <div className="space-y-2">
            <div className="text-sm font-medium">Top Rewards:</div>
            <div className="flex flex-wrap gap-2">
              {challenge.rewards.slice(0, 3).map((reward, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {reward.icon} {reward.name}
                </Badge>
              ))}
              {challenge.rewards.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{challenge.rewards.length - 3} more
                </Badge>
              )}
            </div>
          </div>

          {/* Action Button */}
          <div className="mt-4">
            {isUpcoming && (
              <Button
                size="sm"
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation();
                  onJoin?.(challenge.id);
                }}
                className="w-full"
              >
                Join Challenge
              </Button>
            )}
            {isActive && (
              <Button
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onView(challenge);
                }}
                className="w-full"
              >
                View Details
              </Button>
            )}
            {isCompleted && (
              <Button
                size="sm"
                variant="secondary"
                onClick={(e) => {
                  e.stopPropagation();
                  onView(challenge);
                }}
                className="w-full"
              >
                View Results
              </Button>
            )}
          </div>
        </CardContent>
        
        {/* Active challenge glow */}
        {isActive && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-green-400/10 to-transparent animate-pulse" />
        )}
      </Card>
    </motion.div>
  );
}

interface ChallengeDetailModalProps {
  challenge: Challenge | null;
  isOpen: boolean;
  onClose: () => void;
  onJoin?: (challengeId: string) => void;
}

function ChallengeDetailModal({ challenge, isOpen, onClose, onJoin }: ChallengeDetailModalProps) {
  if (!challenge) return null;

  const isActive = challenge.status === ChallengeStatus.ACTIVE;
  const isUpcoming = challenge.status === ChallengeStatus.UPCOMING;
  
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
            className="bg-background rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center mb-6">
              <div className="text-4xl mb-4">
                {challenge.type === ChallengeType.INDIVIDUAL && '🏃'}
                {challenge.type === ChallengeType.TEAM && '👥'}
                {challenge.type === ChallengeType.COMMUNITY && '🌍'}
                {challenge.type === ChallengeType.REGIONAL && '🗺️'}
                {challenge.type === ChallengeType.GLOBAL && '🌐'}
              </div>
              <h2 className="text-2xl font-bold mb-2">{challenge.name}</h2>
              <div className="flex justify-center gap-2 mb-2">
                <Badge variant="outline">{challenge.type}</Badge>
                <Badge className={getStatusColor(challenge.status)}>
                  {challenge.status}
                </Badge>
              </div>
              <p className="text-muted-foreground">{challenge.description}</p>
            </div>
            
            <div className="space-y-6">
              {/* Challenge Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-muted rounded-lg">
                  <Users className="h-6 w-6 mx-auto mb-2 text-blue-500" />
                  <div className="text-2xl font-bold">{challenge.participants}</div>
                  <div className="text-sm text-muted-foreground">Participants</div>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <Calendar className="h-6 w-6 mx-auto mb-2 text-green-500" />
                  <div className="text-lg font-bold">
                    {Math.ceil((challenge.endDate.getTime() - challenge.startDate.getTime()) / (1000 * 60 * 60 * 24))}
                  </div>
                  <div className="text-sm text-muted-foreground">Days Duration</div>
                </div>
              </div>

              {/* Leaderboard */}
              {challenge.leaderboard.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-medium flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-yellow-500" />
                    Leaderboard
                  </h4>
                  <div className="space-y-2">
                    {challenge.leaderboard.slice(0, 5).map((entry, index) => (
                      <div key={entry.userId} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                        <div className="text-lg font-bold w-8 text-center">
                          {index === 0 && '🥇'}
                          {index === 1 && '🥈'}
                          {index === 2 && '🥉'}
                          {index > 2 && `#${index + 1}`}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{entry.name}</p>
                          <p className="text-sm text-muted-foreground">{entry.location}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">{entry.score}</p>
                          <p className="text-xs text-muted-foreground">points</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Rules */}
              <div className="space-y-2">
                <h4 className="font-medium">Challenge Rules</h4>
                <div className="space-y-1">
                  {challenge.rules.map((rule, index) => (
                    <div key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                      <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                      {rule}
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Rewards */}
              <div className="space-y-3">
                <h4 className="font-medium flex items-center gap-2">
                  <Award className="h-5 w-5 text-purple-500" />
                  Rewards
                </h4>
                <div className="grid grid-cols-1 gap-3">
                  {challenge.rewards.map((reward, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                      <span className="text-2xl">{reward.icon}</span>
                      <div className="flex-1">
                        <p className="font-medium">{reward.name}</p>
                        <p className="text-sm text-muted-foreground">{reward.description}</p>
                      </div>
                      {reward.value > 0 && (
                        <Badge variant="secondary">₹{reward.value}</Badge>
                      )}
                      <Badge className="capitalize">
                        {index === 0 ? '1st' : index === 1 ? '2nd' : index === 2 ? '3rd' : `${index + 1}th`}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <Button onClick={onClose} variant="outline" className="flex-1">
                Close
              </Button>
              {isUpcoming && onJoin && (
                <Button 
                  onClick={() => {
                    onJoin(challenge.id);
                    onClose();
                  }}
                  className="flex-1"
                >
                  Join Challenge
                </Button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  function getStatusColor(status: ChallengeStatus) {
    switch (status) {
      case ChallengeStatus.ACTIVE: return 'text-green-600 bg-green-100';
      case ChallengeStatus.UPCOMING: return 'text-blue-600 bg-blue-100';
      case ChallengeStatus.COMPLETED: return 'text-gray-600 bg-gray-100';
      case ChallengeStatus.CANCELLED: return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  }
}

export function ChallengeSystem() {
  const { 
    challenges,
    activeChallenges,
    upcomingChallenges,
    completedChallenges,
    joinChallenge
  } = useChallenges();

  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [activeTab, setActiveTab] = useState('active');

  const handleViewChallenge = (challenge: Challenge) => {
    setSelectedChallenge(challenge);
    setShowDetail(true);
  };

  const handleJoinChallenge = (challengeId: string) => {
    joinChallenge(challengeId);
  };

  const getTabChallenges = () => {
    switch (activeTab) {
      case 'active':
        return activeChallenges;
      case 'upcoming':
        return upcomingChallenges;
      case 'completed':
        return completedChallenges;
      default:
        return challenges;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Flame className="h-8 w-8 mx-auto mb-2 text-green-500" />
            <div className="text-2xl font-bold">{activeChallenges.length}</div>
            <div className="text-sm text-muted-foreground">Active</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Clock className="h-8 w-8 mx-auto mb-2 text-blue-500" />
            <div className="text-2xl font-bold">{upcomingChallenges.length}</div>
            <div className="text-sm text-muted-foreground">Upcoming</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Trophy className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
            <div className="text-2xl font-bold">{completedChallenges.length}</div>
            <div className="text-sm text-muted-foreground">Completed</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Star className="h-8 w-8 mx-auto mb-2 text-purple-500" />
            <div className="text-2xl font-bold">{challenges.length}</div>
            <div className="text-sm text-muted-foreground">Total</div>
          </CardContent>
        </Card>
      </div>

      {/* Challenge Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {getTabChallenges().map((challenge) => (
              <ChallengeCard
                key={challenge.id}
                challenge={challenge}
                onView={handleViewChallenge}
                onJoin={handleJoinChallenge}
              />
            ))}
          </div>
          
          {getTabChallenges().length === 0 && (
            <div className="text-center py-12">
              <Trophy className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">
                No challenges in this category at the moment.
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Challenge Detail Modal */}
      <ChallengeDetailModal
        challenge={selectedChallenge}
        isOpen={showDetail}
        onClose={() => setShowDetail(false)}
        onJoin={handleJoinChallenge}
      />
    </div>
  );
}