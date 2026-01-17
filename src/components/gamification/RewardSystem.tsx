import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { useRewards } from '@/hooks/useGamification';
import { Reward, RewardType, RewardRarity } from '@/types/gamification';
import { 
  Gift, 
  Coins, 
  ShoppingCart, 
  Check,
  Clock,
  Star,
  Crown,
  Zap,
  Search,
  Filter,
  Sparkles,
  Award,
  Target,
  TrendingUp,
  Calendar,
  AlertCircle
} from 'lucide-react';

interface RewardCardProps {
  reward: Reward;
  onRedeem: (rewardId: string) => void;
  canAfford: boolean;
}

function RewardCard({ reward, onRedeem, canAfford }: RewardCardProps) {
  const [isRedeeming, setIsRedeeming] = useState(false);
  
  const getRarityColor = (rarity: RewardRarity) => {
    switch (rarity) {
      case RewardRarity.COMMON: return 'border-gray-300 bg-gray-50';
      case RewardRarity.UNCOMMON: return 'border-green-300 bg-green-50';
      case RewardRarity.RARE: return 'border-blue-300 bg-blue-50';
      case RewardRarity.EPIC: return 'border-purple-300 bg-purple-50';
      case RewardRarity.LEGENDARY: return 'border-yellow-300 bg-yellow-50';
      default: return 'border-gray-300 bg-gray-50';
    }
  };

  const getRarityIcon = (rarity: RewardRarity) => {
    switch (rarity) {
      case RewardRarity.COMMON: return <Star className="h-4 w-4 text-gray-500" />;
      case RewardRarity.UNCOMMON: return <Star className="h-4 w-4 text-green-500" />;
      case RewardRarity.RARE: return <Sparkles className="h-4 w-4 text-blue-500" />;
      case RewardRarity.EPIC: return <Crown className="h-4 w-4 text-purple-500" />;
      case RewardRarity.LEGENDARY: return <Award className="h-4 w-4 text-yellow-500" />;
      default: return <Star className="h-4 w-4 text-gray-500" />;
    }
  };

  const handleRedeem = async () => {
    if (!canAfford || reward.redeemed || isRedeeming) return;
    
    setIsRedeeming(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      onRedeem(reward.id);
    } finally {
      setIsRedeeming(false);
    }
  };

  const isExpired = reward.expiresAt && new Date() > reward.expiresAt;
  const isRedeemed = reward.redeemed;

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card 
        className={`relative overflow-hidden transition-all duration-300 hover:shadow-lg ${
          isRedeemed ? 'opacity-60 bg-gray-50' :
          isExpired ? 'opacity-50 bg-red-50 border-red-200' :
          getRarityColor(reward.rarity)
        }`}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3 flex-1">
              <div className={`text-3xl ${isRedeemed || isExpired ? 'grayscale' : ''}`}>
                {reward.icon}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  {getRarityIcon(reward.rarity)}
                  <Badge variant="outline" className="text-xs capitalize">
                    {reward.rarity}
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    {reward.type.replace('_', ' ')}
                  </Badge>
                </div>
                <CardTitle className={`text-lg ${isRedeemed || isExpired ? 'text-muted-foreground' : ''}`}>
                  {reward.name}
                </CardTitle>
              </div>
            </div>
            
            <div className="text-right">
              {reward.value > 0 && (
                <div className="flex items-center gap-1 mb-2">
                  <Coins className="h-4 w-4 text-yellow-500" />
                  <span className="font-bold text-lg">{reward.value}</span>
                </div>
              )}
              {isRedeemed && (
                <Badge variant="secondary" className="bg-green-100 text-green-700">
                  <Check className="h-3 w-3 mr-1" />
                  Redeemed
                </Badge>
              )}
              {isExpired && !isRedeemed && (
                <Badge variant="secondary" className="bg-red-100 text-red-700">
                  <Clock className="h-3 w-3 mr-1" />
                  Expired
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          <p className={`text-sm mb-4 ${isRedeemed || isExpired ? 'text-muted-foreground' : ''}`}>
            {reward.description}
          </p>
          
          {reward.expiresAt && !isRedeemed && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
              <Calendar className="h-4 w-4" />
              <span>
                Expires: {reward.expiresAt.toLocaleDateString()}
              </span>
            </div>
          )}
          
          {reward.redeemedAt && (
            <div className="flex items-center gap-2 text-sm text-green-600 mb-4">
              <Check className="h-4 w-4" />
              <span>
                Redeemed on: {reward.redeemedAt.toLocaleDateString()}
              </span>
            </div>
          )}

          <div className="space-y-2">
            {!isRedeemed && !isExpired && (
              <Button
                onClick={handleRedeem}
                disabled={!canAfford || isRedeeming}
                className={`w-full ${
                  canAfford 
                    ? 'bg-primary hover:bg-primary/90' 
                    : 'opacity-50 cursor-not-allowed'
                }`}
                size="sm"
              >
                {isRedeeming ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="mr-2"
                    >
                      <Zap className="h-4 w-4" />
                    </motion.div>
                    Redeeming...
                  </>
                ) : canAfford ? (
                  <>
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Redeem
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-4 w-4 mr-2" />
                    Insufficient Points
                  </>
                )}
              </Button>
            )}
            
            {!canAfford && !isRedeemed && !isExpired && reward.value > 0 && (
              <div className="text-xs text-center text-muted-foreground">
                Need {reward.value - (/* current points would be passed as prop */0)} more points
              </div>
            )}
          </div>
        </CardContent>
        
        {/* Shimmer effect for legendary rewards */}
        {reward.rarity === RewardRarity.LEGENDARY && !isRedeemed && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-400/20 to-transparent animate-pulse" />
        )}
      </Card>
    </motion.div>
  );
}

interface PointsEarningCardProps {
  activity: {
    name: string;
    description: string;
    points: number;
    icon: string;
    category: string;
  };
}

function PointsEarningCard({ activity }: PointsEarningCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="text-2xl">{activity.icon}</div>
          <div className="flex-1">
            <h4 className="font-medium">{activity.name}</h4>
            <p className="text-sm text-muted-foreground">{activity.description}</p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1">
              <Coins className="h-4 w-4 text-yellow-500" />
              <span className="font-bold text-lg">{activity.points}</span>
            </div>
            <Badge variant="outline" className="text-xs">
              {activity.category}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function RewardSystem() {
  const { 
    availableRewards,
    redeemableRewards,
    redeemedRewards,
    expiredRewards,
    redeemReward,
    canAffordReward,
    getRewardsByCategory,
    getRewardsByType,
    availablePoints
  } = useRewards();

  const [activeTab, setActiveTab] = useState('available');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedRarity, setSelectedRarity] = useState('all');

  // Mock data for point earning activities
  const pointEarningActivities = [
    {
      name: 'Daily Crop Monitoring',
      description: 'Check and update crop health status',
      points: 10,
      icon: '🌱',
      category: 'farming'
    },
    {
      name: 'Disease Diagnosis',
      description: 'Use AI to diagnose crop diseases',
      points: 25,
      icon: '🔬',
      category: 'technology'
    },
    {
      name: 'Community Help',
      description: 'Answer questions and help other farmers',
      points: 30,
      icon: '🤝',
      category: 'community'
    },
    {
      name: 'Market Trade',
      description: 'Complete successful marketplace transactions',
      points: 50,
      icon: '💰',
      category: 'market'
    },
    {
      name: 'Knowledge Sharing',
      description: 'Share farming tips and techniques',
      points: 40,
      icon: '📚',
      category: 'knowledge'
    },
    {
      name: 'Sustainability Action',
      description: 'Implement eco-friendly farming practices',
      points: 35,
      icon: '🌍',
      category: 'sustainability'
    }
  ];

  const filteredRewards = availableRewards.filter(reward => {
    const matchesSearch = reward.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         reward.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || reward.category === selectedCategory;
    const matchesRarity = selectedRarity === 'all' || reward.rarity === selectedRarity;
    
    return matchesSearch && matchesCategory && matchesRarity;
  });

  const getTabRewards = () => {
    switch (activeTab) {
      case 'available':
        return filteredRewards.filter(r => r.redeemable && !r.redeemed);
      case 'redeemed':
        return redeemedRewards.filter(r => 
          filteredRewards.some(fr => fr.id === r.id)
        );
      case 'expired':
        return expiredRewards.filter(r => 
          filteredRewards.some(fr => fr.id === r.id)
        );
      default:
        return filteredRewards;
    }
  };

  return (
    <div className="space-y-6">
      {/* Points Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="md:col-span-2">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-yellow-100 rounded-full">
                <Coins className="h-8 w-8 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Available Points</p>
                <p className="text-3xl font-bold text-yellow-600">{availablePoints}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Gift className="h-8 w-8 mx-auto mb-2 text-blue-500" />
            <div className="text-2xl font-bold">{redeemableRewards.length}</div>
            <div className="text-sm text-muted-foreground">Available</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Check className="h-8 w-8 mx-auto mb-2 text-green-500" />
            <div className="text-2xl font-bold">{redeemedRewards.length}</div>
            <div className="text-sm text-muted-foreground">Redeemed</div>
          </CardContent>
        </Card>
      </div>

      {/* Earning Points Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Earn Points
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pointEarningActivities.map((activity, index) => (
              <PointsEarningCard key={index} activity={activity} />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search rewards..."
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
                <option value="consultation">Consultation</option>
                <option value="farming">Farming</option>
                <option value="discount">Discount</option>
                <option value="tools">Tools</option>
              </select>
              
              <select
                value={selectedRarity}
                onChange={(e) => setSelectedRarity(e.target.value)}
                className="px-3 py-2 border rounded-md bg-background"
              >
                <option value="all">All Rarities</option>
                {Object.values(RewardRarity).map(rarity => (
                  <option key={rarity} value={rarity} className="capitalize">
                    {rarity}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reward Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="available">Available</TabsTrigger>
          <TabsTrigger value="redeemed">Redeemed</TabsTrigger>
          <TabsTrigger value="expired">Expired</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {getTabRewards().map((reward) => (
              <RewardCard
                key={reward.id}
                reward={reward}
                onRedeem={redeemReward}
                canAfford={canAffordReward(reward)}
              />
            ))}
          </div>
          
          {getTabRewards().length === 0 && (
            <div className="text-center py-12">
              <Gift className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">
                {activeTab === 'available' && 'No rewards available matching your criteria.'}
                {activeTab === 'redeemed' && 'You haven\'t redeemed any rewards yet.'}
                {activeTab === 'expired' && 'No expired rewards.'}
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}