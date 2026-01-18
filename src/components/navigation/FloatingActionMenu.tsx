import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { 
  Plus,
  X,
  Camera,
  ShoppingCart,
  MessageCircle,
  Cloud,
  Sparkles,
  TrendingUp,
  Users,
  Award,
  Zap
} from "lucide-react";

interface QuickAction {
  id: string;
  title: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  badge?: string;
  description: string;
}

const quickActions: QuickAction[] = [
  {
    id: "diagnose",
    title: "Quick Diagnosis",
    path: "/diagnose",
    icon: Camera,
    color: "bg-blue-500 hover:bg-blue-600",
    badge: "AI",
    description: "Diagnose crop issues instantly"
  },
  {
    id: "sell",
    title: "Sell Products",
    path: "/sell",
    icon: Zap,
    color: "bg-orange-500 hover:bg-orange-600",
    badge: "Sell",
    description: "Sell your produce"
  },
  {
    id: "weather",
    title: "Weather",
    path: "/weather",
    icon: Cloud,
    color: "bg-cyan-500 hover:bg-cyan-600",
    badge: "Live",
    description: "Check weather forecast"
  },
  {
    id: "community",
    title: "Community",
    path: "/community",
    icon: Users,
    color: "bg-purple-500 hover:bg-purple-600",
    badge: "Help",
    description: "Connect with farmers"
  },
  {
    id: "market-analysis",
    title: "Market Trends",
    path: "/market-analysis",
    icon: TrendingUp,
    color: "bg-orange-500 hover:bg-orange-600",
    badge: "Trends",
    description: "Analyze market prices"
  }
];

export function FloatingActionMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Don't show on auth pages or if already on a main feature page
  const hideOnPages = ['/auth', '/role-login', '/admin'];
  if (hideOnPages.includes(location.pathname)) {
    return null;
  }

  const handleActionClick = (path: string) => {
    navigate(path);
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-32 md:bottom-24 right-4 z-40">
      {/* Quick Actions Menu */}
      {isOpen && (
        <Card className="absolute bottom-16 right-16 shadow-2xl border-0 bg-card/95 backdrop-blur-sm">
          <CardContent className="p-3">
            <div className="space-y-2 w-64">
              <div className="text-center mb-3">
                <h4 className="font-semibold text-sm text-foreground">Quick Actions</h4>
              </div>
              
              {quickActions.map((action) => {
                const IconComponent = action.icon;
                const isCurrentPage = location.pathname === action.path;
                
                return (
                  <button
                    key={action.id}
                    onClick={() => handleActionClick(action.path)}
                    disabled={isCurrentPage}
                    className={cn(
                      "w-full flex items-center space-x-3 p-3 rounded-lg text-left",
                      isCurrentPage 
                        ? "bg-primary/10 text-primary cursor-not-allowed opacity-60" 
                        : "hover:bg-accent"
                    )}
                  >
                    <div className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center text-white shadow-sm",
                      isCurrentPage ? "bg-primary/50" : action.color
                    )}>
                      <IconComponent className="h-6 w-6" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h5 className="font-medium text-sm text-foreground">
                          {action.title}
                        </h5>
                        {action.badge && !isCurrentPage && (
                          <Badge variant="secondary" className="text-xs">
                            {action.badge}
                          </Badge>
                        )}
                        {isCurrentPage && (
                          <Badge variant="outline" className="text-xs">
                            Current
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {action.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main FAB Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        size="lg"
        className={cn(
          "h-16 w-16 rounded-full",
          isOpen 
            ? "bg-destructive hover:bg-destructive/90" 
            : "bg-primary hover:bg-primary/90"
        )}
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <Zap className="h-6 w-6" />
        )}
      </Button>
    </div>
  );
}