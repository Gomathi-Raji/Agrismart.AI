import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { BookOpen, TrendingUp, Award, Users, Calendar, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

// Import images
import successStory from "@/assets/yield-success.jpg";
import smartIrrigation from "@/assets/smart-irrigation-article.jpg";
import organicFarming from "@/assets/organic-farming-article.jpg";
import marketAnalytics from "@/assets/market-analytics.jpg";

const FEATURED_CONTENT = [
  {
    id: 1,
    type: "success-story",
    title: "From 2 to 50 Tons: A Farmer's Journey",
    description: "How Rajesh Kumar increased his tomato yield by 2,500% using AgriSmart AI diagnostics",
    author: "Rajesh Kumar",
    image: successStory,
    category: "Success Story",
    readTime: "5 min read",
    likes: 234,
    badge: "Featured"
  },
  {
    id: 2,
    type: "article",
    title: "Smart Irrigation: Saving 70% Water",
    description: "Learn how automated irrigation systems can revolutionize your farming efficiency",
    author: "AgriSmart Team",
    image: smartIrrigation,
    category: "Technology",
    readTime: "8 min read",
    likes: 189,
    badge: "Trending"
  },
  {
    id: 3,
    type: "article",
    title: "Organic Farming: Higher Profits, Better Health",
    description: "Complete guide to transitioning to organic farming with government subsidies",
    author: "Dr. Priya Sharma",
    image: organicFarming,
    category: "Organic Farming",
    readTime: "12 min read",
    likes: 156,
    badge: "Popular"
  }
];

const MARKET_INSIGHTS = [
  {
    title: "Wheat Prices Surge 15%",
    description: "Northern markets see highest prices in 3 months",
    trend: "up",
    change: "+₹250/ton",
    icon: TrendingUp,
    color: "text-emerald-600"
  },
  {
    title: "New Government Scheme",
    description: "₹50,000 subsidy for drip irrigation systems",
    trend: "info",
    change: "Apply Now",
    icon: Award,
    color: "text-slate-600"
  },
  {
    title: "Community Meetup",
    description: "Join 200+ farmers this Saturday in Chennai",
    trend: "event",
    change: "Free Event",
    icon: Users,
    color: "text-indigo-600"
  }
];

export function FeaturedContent() {
  const navigate = useNavigate();

  return (
    <div className="space-y-8">
      {/* Featured Articles Section */}
      <div className="px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-foreground">📖 Featured Content</h2>
            <p className="text-sm text-muted-foreground">Latest insights and success stories</p>
          </div>
          <Button variant="ghost" size="sm" onClick={() => navigate('/blogs')}>
            View All
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURED_CONTENT.map((content) => (
            <Card key={content.id} className="overflow-hidden hover:shadow-lg transition-all duration-300 group cursor-pointer" onClick={() => navigate('/blogs')}>
              <div className="relative">
                <img
                  src={content.image}
                  alt={content.title}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 left-3">
                  <Badge className="bg-white/90 text-gray-900 hover:bg-white">
                    {content.badge}
                  </Badge>
                </div>
                <div className="absolute top-3 right-3">
                  <Badge variant="secondary" className="bg-black/50 text-white border-0">
                    {content.category}
                  </Badge>
                </div>
              </div>

              <CardContent className="p-4">
                <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                  {content.title}
                </h3>
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                  {content.description}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-xs">
                        {content.author.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs text-muted-foreground">{content.author}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <BookOpen className="h-3 w-3" />
                    {content.readTime}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Market Insights & Quick Updates */}
      <div className="px-4 py-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-xl mx-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-foreground">⚡ Quick Updates</h2>
            <p className="text-sm text-muted-foreground">Latest market insights and opportunities</p>
          </div>
          <Button variant="outline" size="sm">
            <Calendar className="h-4 w-4 mr-2" />
            View Calendar
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {MARKET_INSIGHTS.map((insight, index) => {
            const IconComponent = insight.icon;
            return (
              <Card key={index} className="bg-white/50 dark:bg-gray-900/50 border-0 hover:shadow-md transition-all duration-300 cursor-pointer group">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg bg-white dark:bg-gray-800 group-hover:scale-110 transition-transform`}>
                      <IconComponent className={`h-5 w-5 ${insight.color}`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-sm mb-1">{insight.title}</h3>
                      <p className="text-xs text-muted-foreground mb-2">{insight.description}</p>
                      <Badge variant="outline" className={`text-xs ${insight.color} border-current`}>
                        {insight.change}
                      </Badge>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}