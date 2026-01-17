import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { 
  ArrowRight,
  Camera,
  ShoppingCart,
  TrendingUp,
  Sparkles,
  Users,
  MessageCircle,
  Cloud,
  Leaf,
  BookOpen,
  Star,
  Award,
  Store
} from "lucide-react";

interface RelatedAction {
  title: string;
  description: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  priority?: 'high' | 'medium' | 'low';
}

interface ContextualNavigationProps {
  currentPage: string;
  className?: string;
  showDescription?: boolean;
  layout?: 'horizontal' | 'vertical' | 'grid';
  maxItems?: number;
}

const relatedActions: Record<string, RelatedAction[]> = {
  "/diagnose": [
    {
      title: "View Recommendations",
      description: "Get personalized farming recommendations",
      path: "/recommendations",
      icon: Sparkles,
      priority: 'high'
    },
    {
      title: "Check Weather",
      description: "Monitor weather conditions for treatment",
      path: "/weather",
      icon: Cloud,
      badge: "Important",
      priority: 'high'
    },
    {
      title: "Buy Treatment",
      description: "Purchase medicines and fertilizers",
      path: "/buy",
      icon: ShoppingCart,
      priority: 'medium'
    },
    {
      title: "Sell Products",
      description: "List your produce for sale",
      path: "/sell",
      icon: Store,
      priority: 'medium'
    },
    {
      title: "Ask Community",
      description: "Get advice from other farmers", 
      path: "/community",
      icon: Users,
      priority: 'medium'
    }
  ],
  "/buy": [
    {
      title: "Market Analysis",
      description: "Check current market prices and trends",
      path: "/market-analysis",
      icon: TrendingUp,
      badge: "Hot",
      priority: 'high'
    },
    {
      title: "Crop Diagnosis",
      description: "Diagnose issues before buying treatment",
      path: "/diagnose",
      icon: Camera,
      priority: 'high'
    },
    {
      title: "Community Reviews",
      description: "Read reviews from other farmers",
      path: "/community",
      icon: Users,
      priority: 'medium'
    },
    {
      title: "Government Schemes",
      description: "Check for subsidies and schemes",
      path: "/government-schemes",
      icon: Star,
      priority: 'medium'
    }
  ],
  "/sell": [
    {
      title: "Market Analysis",
      description: "Check current market prices and trends",
      path: "/market-analysis",
      icon: TrendingUp,
      badge: "Hot",
      priority: 'high'
    },
    {
      title: "Buy Supplies",
      description: "Purchase equipment and supplies",
      path: "/buy",
      icon: ShoppingCart,
      priority: 'high'
    },
    {
      title: "Community Reviews",
      description: "Read reviews from other sellers",
      path: "/community",
      icon: Users,
      priority: 'medium'
    },
    {
      title: "Government Schemes",
      description: "Check for subsidies and schemes",
      path: "/government-schemes",
      icon: Star,
      priority: 'medium'
    }
  ],
  "/market-analysis": [
    {
      title: "Sell in Marketplace",
      description: "List your crops for sale",
      path: "/sell",
      icon: ShoppingCart,
      badge: "Action",
      priority: 'high'
    },
    {
      title: "Get Recommendations",
      description: "Optimize your crop selection",
      path: "/recommendations",
      icon: Sparkles,
      priority: 'high'
    },
    {
      title: "Weather Impact",
      description: "See how weather affects prices",
      path: "/weather",
      icon: Cloud,
      priority: 'medium'
    },
    {
      title: "Community Insights",
      description: "Discuss market trends with farmers",
      path: "/community",
      icon: Users,
      priority: 'medium'
    }
  ],
  "/weather": [
    {
      title: "Crop Recommendations",
      description: "Get weather-based farming advice",
      path: "/recommendations",
      icon: Sparkles,
      badge: "Smart",
      priority: 'high'
    },
    {
      title: "Diagnose Issues",
      description: "Check for weather-related crop issues",
      path: "/diagnose",
      icon: Camera,
      priority: 'high'
    },
    {
      title: "Market Impact",
      description: "See how weather affects crop prices",
      path: "/market-analysis",
      icon: TrendingUp,
      priority: 'medium'
    },
    {
      title: "Community Tips",
      description: "Share weather-related farming tips",
      path: "/community",
      icon: Users,
      priority: 'low'
    }
  ],
  "/community": [
    {
      title: "Share Diagnosis",
      description: "Get help with crop issues",
      path: "/diagnose",
      icon: Camera,
      priority: 'high'
    },
    {
      title: "Market Discussion",
      description: "Discuss current market trends",
      path: "/market-analysis",
      icon: TrendingUp,
      priority: 'medium'
    },
    {
      title: "Read Articles",
      description: "Learn from expert articles",
      path: "/blogs",
      icon: BookOpen,
      priority: 'medium'
    }
  ],
  "/recommendations": [
    {
      title: "Diagnose Crops",
      description: "Check your crops based on recommendations",
      path: "/diagnose",
      icon: Camera,
      priority: 'high'
    },
    {
      title: "Buy Supplies",
      description: "Purchase recommended products",
      path: "/buy",
      icon: ShoppingCart,
      badge: "Action",
      priority: 'high'
    },
    {
      title: "Sell Products",
      description: "List your produce for sale",
      path: "/sell",
      icon: Store,
      priority: 'high'
    },
    {
      title: "Check Weather",
      description: "Monitor conditions for implementation",
      path: "/weather",
      icon: Cloud,
      priority: 'medium'
    },
    {
      title: "Share Results",
      description: "Discuss outcomes with community",
      path: "/community",
      icon: Users,
      priority: 'low'
    }
  ],
  "/blogs": [
    {
      title: "Apply Learnings",
      description: "Use AI diagnosis for mentioned issues",
      path: "/diagnose",
      icon: Camera,
      priority: 'high'
    },
    {
      title: "Discuss Article",
      description: "Share thoughts with community",
      path: "/community",
      icon: Users,
      priority: 'medium'
    }
  ]
};

export function ContextualNavigation({ 
  currentPage, 
  className,
  showDescription = true,
  layout = 'horizontal',
  maxItems = 4
}: ContextualNavigationProps) {
  const actions = relatedActions[currentPage]?.slice(0, maxItems) || [];

  if (actions.length === 0) {
    return null;
  }

  const sortedActions = actions.sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    return (priorityOrder[b.priority || 'low'] - priorityOrder[a.priority || 'low']);
  });

  const gridClass = layout === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-4' :
                   layout === 'vertical' ? 'flex flex-col space-y-3' :
                   'flex flex-wrap gap-4';

  return (
    <Card className={cn("shadow-elegant", className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">Related Actions</h3>
          <Badge variant="outline" className="text-xs">
            Smart Suggestions
          </Badge>
        </div>
        
        <div className={gridClass}>
          {sortedActions.map((action, index) => {
            const IconComponent = action.icon;
            
            return (
              <Link
                key={`${action.path}-${index}`}
                to={action.path}
                className="group"
              >
                <div className={cn(
                  "flex items-center space-x-3 p-3 rounded-lg border border-border hover:border-primary/50 bg-card hover:bg-accent/50 transition-all duration-200",
                  layout === 'grid' ? 'h-full' : ''
                )}>
                  <div className={cn(
                    "flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center",
                    action.priority === 'high' ? 'bg-primary/10 text-primary' :
                    action.priority === 'medium' ? 'bg-blue-500/10 text-blue-600' :
                    'bg-muted text-muted-foreground'
                  )}>
                    <IconComponent className="h-5 w-5" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-foreground text-sm group-hover:text-primary transition-colors">
                        {action.title}
                      </h4>
                      {action.badge && (
                        <Badge 
                          variant={action.priority === 'high' ? 'default' : 'secondary'}
                          className="text-xs ml-2"
                        >
                          {action.badge}
                        </Badge>
                      )}
                    </div>
                    {showDescription && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                        {action.description}
                      </p>
                    )}
                  </div>
                  
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all duration-200" />
                </div>
              </Link>
            );
          })}
        </div>
        
        {actions.length > maxItems && (
          <div className="mt-4 text-center">
            <Button variant="ghost" size="sm" className="text-xs">
              View More Suggestions
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}