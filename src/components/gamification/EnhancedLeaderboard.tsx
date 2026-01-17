import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLeaderboard } from '@/hooks/useGamification';
import { LeaderboardEntry } from '@/types/gamification';
import { gamificationData } from '@/data/gamificationData';
import { 
  Trophy, 
  Medal, 
  Crown, 
  TrendingUp,
  TrendingDown,
  Minus,
  MapPin,
  Users,
  Award,
  Star,
  Flame,
  Target,
  Calendar,
  Filter,
  Search,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import { Input } from '@/components/ui/input';

interface LeaderboardCardProps {
  entry: LeaderboardEntry;
  isCurrentUser?: boolean;
  rank: number;
}

function LeaderboardCard({ entry, isCurrentUser = false, rank }: LeaderboardCardProps) {
  const getRankIcon = (position: number) => {
    switch (position) {
      case 1: return <Trophy className="h-6 w-6 text-yellow-500" />;
      case 2: return <Medal className="h-6 w-6 text-gray-400" />;
      case 3: return <Medal className="h-6 w-6 text-amber-600" />;
      default: return <div className="text-lg font-bold text-muted-foreground">#{position}</div>;
    }
  };

  const getRankBackground = (position: number) => {
    switch (position) {
      case 1: return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white';
      case 2: return 'bg-gradient-to-r from-gray-300 to-gray-500 text-white';
      case 3: return 'bg-gradient-to-r from-amber-400 to-amber-600 text-white';
      default: return isCurrentUser ? 'bg-blue-50 border-blue-200' : 'bg-background';
    }
  };

  const getChangeIcon = (change: number) => {
    if (change > 0) return <ChevronUp className="h-4 w-4 text-green-500" />;
    if (change < 0) return <ChevronDown className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-muted-foreground" />;
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: rank * 0.1 }}
      whileHover={{ scale: 1.02 }}
    >
      <Card className={`relative overflow-hidden transition-all duration-300 hover:shadow-lg ${getRankBackground(entry.rank)}`}>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            {/* Rank */}
            <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center">
              {getRankIcon(entry.rank)}
            </div>

            {/* Avatar */}
            <Avatar className="h-12 w-12 border-2 border-background">
              <AvatarImage src={entry.avatar} alt={entry.name} />
              <AvatarFallback className="text-sm font-bold">
                {entry.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>

            {/* User Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold truncate">{entry.name}</h3>
                {isCurrentUser && (
                  <Badge variant="secondary" className="text-xs">You</Badge>
                )}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-3 w-3" />
                <span>{entry.location}</span>
                <span>•</span>
                <span className="font-medium">{entry.specialty}</span>
              </div>
              <div className="text-sm font-medium mt-1">
                Level {entry.level}
              </div>
            </div>

            {/* Stats */}
            <div className="text-right space-y-1">
              <div className="text-2xl font-bold">{entry.points.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">points</div>
              <div className="flex items-center gap-1 text-xs">
                {getChangeIcon(entry.change)}
                <span className={entry.change > 0 ? 'text-green-600' : entry.change < 0 ? 'text-red-600' : 'text-muted-foreground'}>
                  {entry.change > 0 ? '+' : ''}{entry.change}
                </span>
              </div>
            </div>

            {/* Badges */}
            <div className="flex-shrink-0">
              <div className="flex gap-1 mb-2">
                {entry.badges.slice(0, 3).map((badge, index) => (
                  <div key={index} className="text-lg" title={badge.name}>
                    {badge.icon}
                  </div>
                ))}
                {entry.badges.length > 3 && (
                  <div className="text-xs text-muted-foreground">
                    +{entry.badges.length - 3}
                  </div>
                )}
              </div>
              <div className="text-xs text-muted-foreground text-center">
                {entry.achievements} achievements
              </div>
            </div>
          </div>
        </CardContent>

        {/* Winner effects for top 3 */}
        {entry.rank <= 3 && (
          <div className="absolute top-0 right-0 w-16 h-16 overflow-hidden">
            <div className={`absolute transform rotate-45 ${
              entry.rank === 1 ? 'bg-yellow-400' :
              entry.rank === 2 ? 'bg-gray-400' : 'bg-amber-500'
            } text-white text-xs font-bold px-8 py-1 top-3 -right-4`}>
              TOP {entry.rank}
            </div>
          </div>
        )}
      </Card>
    </motion.div>
  );
}

interface LeaderboardStatsProps {
  userRank: number;
  totalUsers: number;
  userPoints: number;
  category: string;
  timeframe: string;
}

function LeaderboardStats({ userRank, totalUsers, userPoints, category, timeframe }: LeaderboardStatsProps) {
  const percentile = Math.round(((totalUsers - userRank) / totalUsers) * 100);
  
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardContent className="p-4 text-center">
          <Trophy className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
          <div className="text-2xl font-bold">#{userRank}</div>
          <div className="text-sm text-muted-foreground">Your Rank</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4 text-center">
          <TrendingUp className="h-8 w-8 mx-auto mb-2 text-green-500" />
          <div className="text-2xl font-bold">{percentile}%</div>
          <div className="text-sm text-muted-foreground">Percentile</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4 text-center">
          <Star className="h-8 w-8 mx-auto mb-2 text-blue-500" />
          <div className="text-2xl font-bold">{userPoints.toLocaleString()}</div>
          <div className="text-sm text-muted-foreground">Your Points</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4 text-center">
          <Users className="h-8 w-8 mx-auto mb-2 text-purple-500" />
          <div className="text-2xl font-bold">{totalUsers.toLocaleString()}</div>
          <div className="text-sm text-muted-foreground">Total Farmers</div>
        </CardContent>
      </Card>
    </div>
  );
}

export function EnhancedLeaderboard() {
  const { 
    leaderboard, 
    loading, 
    timeframe, 
    category,
    setTimeframe,
    setCategory,
    getUserRank,
    getRegionalRank
  } = useLeaderboard();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [viewMode, setViewMode] = useState<'global' | 'regional'>('global');

  // Using mock data for demonstration
  const mockLeaderboard = gamificationData.leaderboard;
  const userRank = getUserRank();
  const userPoints = 2650; // This would come from user context

  const filteredLeaderboard = mockLeaderboard.filter(entry => {
    const matchesSearch = entry.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.specialty.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRegion = selectedRegion === 'all' || entry.location.toLowerCase().includes(selectedRegion.toLowerCase());
    
    return matchesSearch && matchesRegion;
  });

  const regions = ['all', 'punjab', 'haryana', 'uttar pradesh', 'tamil nadu', 'maharashtra'];
  const categories = ['points', 'achievements', 'community', 'sustainability', 'innovation'];
  const timeframes = ['daily', 'weekly', 'monthly', 'all-time'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Leaderboard</h1>
        <p className="text-muted-foreground">
          Compete with farmers across India and see where you stand!
        </p>
      </div>

      {/* User Stats */}
      <LeaderboardStats
        userRank={userRank}
        totalUsers={5000}
        userPoints={userPoints}
        category={category}
        timeframe={timeframe}
      />

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search farmers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            {/* Filters */}
            <div className="flex gap-2 flex-wrap">
              <select
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value as 'daily' | 'weekly' | 'monthly' | 'all-time')}
                className="px-3 py-2 border rounded-md bg-background"
              >
                {timeframes.map(tf => (
                  <option key={tf} value={tf} className="capitalize">
                    {tf.replace('-', ' ')}
                  </option>
                ))}
              </select>
              
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as 'points' | 'achievements' | 'community' | 'sustainability' | 'innovation')}
                className="px-3 py-2 border rounded-md bg-background"
                aria-label="Select leaderboard category"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat} className="capitalize">
                    {cat}
                  </option>
                ))}
              </select>
              
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="px-3 py-2 border rounded-md bg-background"
                aria-label="Select region filter"
              >
                {regions.map(region => (
                  <option key={region} value={region} className="capitalize">
                    {region === 'all' ? 'All Regions' : region}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* View Mode Toggle */}
      <div className="flex justify-center">
        <div className="flex bg-muted rounded-lg p-1">
          <Button
            variant={viewMode === 'global' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('global')}
            className="flex items-center gap-2"
          >
            <Trophy className="h-4 w-4" />
            Global
          </Button>
          <Button
            variant={viewMode === 'regional' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('regional')}
            className="flex items-center gap-2"
          >
            <MapPin className="h-4 w-4" />
            Regional
          </Button>
        </div>
      </div>

      {/* Top 3 Spotlight */}
      {filteredLeaderboard.length >= 3 && (
        <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-center justify-center">
              <Crown className="h-6 w-6 text-yellow-500" />
              Top Champions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {filteredLeaderboard.slice(0, 3).map((entry, index) => (
                <motion.div
                  key={entry.userId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.2 }}
                  className="text-center"
                >
                  <div className={`relative mb-4 ${index === 0 ? 'order-2 md:order-1' : ''}`}>
                    <Avatar className={`mx-auto ${
                      index === 0 ? 'h-20 w-20' : 'h-16 w-16'
                    } border-4 ${
                      index === 0 ? 'border-yellow-400' :
                      index === 1 ? 'border-gray-400' : 'border-amber-400'
                    }`}>
                      <AvatarImage src={entry.avatar} alt={entry.name} />
                      <AvatarFallback>
                        {entry.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className={`absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center ${
                      index === 0 ? 'bg-yellow-400' :
                      index === 1 ? 'bg-gray-400' : 'bg-amber-400'
                    } text-white font-bold text-sm`}>
                      {index + 1}
                    </div>
                  </div>
                  <h3 className="font-bold text-lg">{entry.name}</h3>
                  <p className="text-sm text-muted-foreground">{entry.location}</p>
                  <p className="text-2xl font-bold text-primary mt-2">
                    {entry.points.toLocaleString()}
                  </p>
                  <div className="flex justify-center gap-1 mt-2">
                    {entry.badges.slice(0, 3).map((badge, badgeIndex) => (
                      <span key={badgeIndex} className="text-lg">{badge.icon}</span>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Full Leaderboard */}
      <div className="space-y-3">
        {filteredLeaderboard.map((entry, index) => (
          <LeaderboardCard
            key={entry.userId}
            entry={entry}
            rank={index}
            isCurrentUser={entry.userId === '2'} // Mock current user
          />
        ))}
        
        {filteredLeaderboard.length === 0 && (
          <div className="text-center py-12">
            <Trophy className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">
              No farmers found matching your search criteria.
            </p>
          </div>
        )}
      </div>

      {/* Load More Button */}
      {filteredLeaderboard.length >= 10 && (
        <div className="text-center">
          <Button variant="outline" size="lg">
            Load More Farmers
          </Button>
        </div>
      )}
    </div>
  );
}