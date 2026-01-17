import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Achievement } from '@/types/gamification';
import { Trophy, Sparkles, Star, Crown, Zap, X } from 'lucide-react';
import confetti from 'canvas-confetti';

interface AchievementUnlockNotificationProps {
  achievement: Achievement | null;
  isVisible: boolean;
  onClose: () => void;
  onViewAll?: () => void;
}

export function AchievementUnlockNotification({ 
  achievement, 
  isVisible, 
  onClose, 
  onViewAll 
}: AchievementUnlockNotificationProps) {
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (isVisible && achievement) {
      // Trigger confetti animation
      const colors = {
        common: ['#6b7280', '#9ca3af'],
        uncommon: ['#22c55e', '#16a34a'],
        rare: ['#3b82f6', '#1d4ed8'],
        epic: ['#a855f7', '#7c3aed'],
        legendary: ['#f59e0b', '#d97706']
      };

      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: colors[achievement.rarity] || colors.common
      });

      // Auto-show details after animation
      const timer = setTimeout(() => setShowDetails(true), 800);
      return () => clearTimeout(timer);
    }
  }, [isVisible, achievement]);

  const getRarityIcon = () => {
    if (!achievement) return <Trophy className="h-8 w-8" />;
    
    switch (achievement.rarity) {
      case 'common': return <Star className="h-8 w-8 text-gray-500" />;
      case 'uncommon': return <Star className="h-8 w-8 text-green-500" />;
      case 'rare': return <Sparkles className="h-8 w-8 text-blue-500" />;
      case 'epic': return <Crown className="h-8 w-8 text-purple-500" />;
      case 'legendary': return <Trophy className="h-8 w-8 text-yellow-500" />;
      default: return <Star className="h-8 w-8 text-gray-500" />;
    }
  };

  const getRarityGradient = () => {
    if (!achievement) return 'from-gray-400 to-gray-600';
    
    switch (achievement.rarity) {
      case 'common': return 'from-gray-400 to-gray-600';
      case 'uncommon': return 'from-green-400 to-green-600';
      case 'rare': return 'from-blue-400 to-blue-600';
      case 'epic': return 'from-purple-400 to-purple-600';
      case 'legendary': return 'from-yellow-400 to-yellow-600';
      default: return 'from-gray-400 to-gray-600';
    }
  };

  if (!achievement) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }}
            transition={{ 
              type: 'spring', 
              stiffness: 260, 
              damping: 20,
              duration: 0.8
            }}
            className="relative"
          >
            <Card className={`max-w-md w-full bg-gradient-to-br ${getRarityGradient()} border-0 text-white shadow-2xl`}>
              <CardContent className="p-8 text-center relative overflow-hidden">
                {/* Background Sparkles */}
                <div className="absolute inset-0 overflow-hidden">
                  {[...Array(12)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ 
                        opacity: [0, 1, 0], 
                        scale: [0, 1, 0],
                        x: Math.random() * 300 - 150,
                        y: Math.random() * 200 - 100
                      }}
                      transition={{
                        duration: 2,
                        delay: i * 0.1,
                        repeat: Infinity,
                        repeatDelay: 2
                      }}
                      className="absolute"
                    >
                      <Sparkles className="h-4 w-4" />
                    </motion.div>
                  ))}
                </div>

                {/* Close Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="absolute top-4 right-4 text-white/80 hover:text-white hover:bg-white/20"
                >
                  <X className="h-4 w-4" />
                </Button>

                {/* Achievement Icon with Glow */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: 'spring' }}
                  className="relative mb-6"
                >
                  <div className="text-6xl mb-4 relative">
                    <motion.div
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      {achievement.icon}
                    </motion.div>
                    
                    {/* Glow effect */}
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1.5, opacity: 0.3 }}
                      transition={{ delay: 0.5 }}
                      className="absolute inset-0 bg-white rounded-full blur-xl"
                    />
                  </div>
                  
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    {getRarityIcon()}
                  </motion.div>
                </motion.div>

                {/* Achievement Title */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  <h2 className="text-2xl font-bold mb-2">Achievement Unlocked!</h2>
                  <h3 className="text-xl font-semibold mb-2">{achievement.name}</h3>
                  <Badge variant="secondary" className="mb-4 bg-white/20 text-white border-white/30">
                    {achievement.rarity.toUpperCase()}
                  </Badge>
                </motion.div>

                {/* Achievement Details */}
                <AnimatePresence>
                  {showDetails && (
                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.8 }}
                      className="space-y-4"
                    >
                      <p className="text-white/90">{achievement.description}</p>
                      
                      <div className="flex items-center justify-center gap-4">
                        <div className="flex items-center gap-2">
                          <Zap className="h-4 w-4" />
                          <span className="font-semibold">{achievement.points} Points</span>
                        </div>
                      </div>

                      {/* Rewards */}
                      {achievement.rewards && achievement.rewards.length > 0 && (
                        <div className="text-sm">
                          <p className="font-medium mb-2">Rewards:</p>
                          {achievement.rewards.map((reward, index) => (
                            <div key={index} className="flex items-center justify-center gap-2">
                              <span>{reward.icon}</span>
                              <span>{reward.name}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Action Buttons */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 1 }}
                  className="flex gap-3 mt-6"
                >
                  <Button
                    onClick={onClose}
                    variant="secondary"
                    className="flex-1 bg-white/20 text-white border-white/30 hover:bg-white/30"
                  >
                    Continue
                  </Button>
                  {onViewAll && (
                    <Button
                      onClick={() => {
                        onViewAll();
                        onClose();
                      }}
                      variant="secondary"
                      className="flex-1 bg-white text-gray-800 hover:bg-white/90"
                    >
                      View All
                    </Button>
                  )}
                </motion.div>
              </CardContent>
            </Card>

            {/* Floating Celebration Icons */}
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ 
                  scale: 0, 
                  x: 0, 
                  y: 0,
                  rotate: 0
                }}
                animate={{ 
                  scale: [0, 1, 0],
                  x: (Math.random() - 0.5) * 400,
                  y: (Math.random() - 0.5) * 400,
                  rotate: Math.random() * 360
                }}
                transition={{
                  duration: 3,
                  delay: 0.5 + i * 0.1,
                  ease: "easeOut"
                }}
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
              >
                <div className="text-2xl">
                  {['🎉', '✨', '🎊', '⭐', '🏆', '🎯', '💫', '🌟'][i]}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Hook to manage achievement notifications
export function useAchievementNotifications() {
  const [notifications, setNotifications] = useState<Achievement[]>([]);
  const [currentNotification, setCurrentNotification] = useState<Achievement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  const showNotification = (achievement: Achievement) => {
    setNotifications(prev => [...prev, achievement]);
  };

  const processNextNotification = () => {
    if (notifications.length > 0 && !isVisible) {
      const next = notifications[0];
      setCurrentNotification(next);
      setIsVisible(true);
      setNotifications(prev => prev.slice(1));
    }
  };

  const hideNotification = () => {
    setIsVisible(false);
    setCurrentNotification(null);
    // Process next notification after a delay
    setTimeout(processNextNotification, 500);
  };

  // Process notifications queue
  useEffect(() => {
    processNextNotification();
  }, [notifications.length]);

  return {
    currentNotification,
    isVisible,
    showNotification,
    hideNotification,
    hasNotifications: notifications.length > 0
  };
}