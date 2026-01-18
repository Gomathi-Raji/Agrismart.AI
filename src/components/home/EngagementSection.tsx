import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Users, MessageSquare, BookOpen, MoreVertical } from "lucide-react";
import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";

interface CommunityStat {
  id: number;
  title: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

export function EngagementSection() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<CommunityStat[]>([]);
  const touchStartRef = useRef<{x: number, y: number} | null>(null);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [showMenu, setShowMenu] = useState(false);

  const communityStats: CommunityStat[] = useMemo(() => [
    {
      id: 1,
      title: "Active Farmers",
      value: "12,500+",
      icon: Users,
      description: "Join our growing community"
    },
    {
      id: 2,
      title: "Discussions",
      value: "3,200+",
      icon: MessageSquare,
      description: "Share your knowledge"
    },
    {
      id: 3,
      title: "Resources",
      value: "850+",
      icon: BookOpen,
      description: "Learn from experts"
    }
  ], []);

  useEffect(() => {
    const cached = localStorage.getItem('communityStats');
    if (cached) {
      setStats(JSON.parse(cached));
      setLoading(false);
    } else {
      // Simulate API fetch
      setTimeout(() => {
        setStats(communityStats);
        localStorage.setItem('communityStats', JSON.stringify(communityStats));
        setLoading(false);
      }, 1000);
    }
  }, [communityStats]);

  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault(); // Prevent scrolling during gesture
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
    longPressTimerRef.current = setTimeout(() => {
      setShowMenu(true);
    }, 500);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    if (touchStartRef.current && !showMenu) {
      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - touchStartRef.current.x;
      const deltaY = touch.clientY - touchStartRef.current.y;
      if (Math.abs(deltaX) > 50 && Math.abs(deltaX) > Math.abs(deltaY)) {
        if (deltaX > 0) {
          navigate('/marketplace');
        } else {
          navigate('/diagnose');
        }
      } else if (Math.abs(deltaY) > 50 && Math.abs(deltaY) > Math.abs(deltaX)) {
        if (deltaY < 0) {
          navigate('/weather');
        }
      }
    }
    touchStartRef.current = null;
  };

  const handleMenuClose = () => {
    setShowMenu(false);
  };

  return (
    <div className="px-4 py-6">
      <Card 
        className="shadow-sm border border-border bg-card dark:bg-card"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2 text-card-foreground">
              <Users className="h-5 w-5 text-primary" />
              Community Engagement
            </CardTitle>
            <DropdownMenu open={showMenu} onOpenChange={setShowMenu}>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => { navigate('/community'); handleMenuClose(); }}>
                  View Community
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => { navigate('/support'); handleMenuClose(); }}>
                  Get Support
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => { navigate('/blog'); handleMenuClose(); }}>
                  Read Blog
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="p-4 rounded-lg bg-accent/50 text-center">
                  <Skeleton className="h-8 w-8 mx-auto mb-2" />
                  <Skeleton className="h-6 w-16 mx-auto mb-1" />
                  <Skeleton className="h-4 w-20 mx-auto mb-1" />
                  <Skeleton className="h-3 w-24 mx-auto" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {stats.map((stat) => (
                <div key={stat.id} className="p-4 rounded-lg bg-accent/50 text-center">
                  <stat.icon className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="text-2xl font-bold text-primary">{stat.value}</p>
                  <p className="text-sm font-medium">{stat.title}</p>
                  <p className="text-xs text-muted-foreground">{stat.description}</p>
                </div>
              ))}
            </div>
          )}
          <div className="pt-4">
            <Button className="w-full" size="lg">
              <Users className="h-4 w-4 mr-2" />
              Join Community
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}