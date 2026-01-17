import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MessageCircle, Heart, Users, TrendingUp, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";

const RECENT_POSTS = [
  {
    id: 1,
    type: "question",
    title: "My tomato plants have yellow leaves - what could be the problem?",
    author: "Rajesh Kumar",
    time: "2h ago",
    likes: 12,
    replies: 8,
    category: "Crop Health"
  },
  {
    id: 2,
    type: "discussion",
    title: "Best practices for organic farming in Chennai region",
    author: "Priya Sharma",
    time: "4h ago",
    likes: 24,
    replies: 15,
    category: "Organic Farming"
  },
  {
    id: 3,
    type: "success",
    title: "Harvested 50kg of tomatoes this season!",
    author: "Mohan Reddy",
    time: "6h ago",
    likes: 31,
    replies: 12,
    category: "Success Story"
  },
];

export function CommunityPreview() {
  const navigate = useNavigate();

  return (
    <div className="px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-foreground dark:text-foreground">👥 Community</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/community')}
          className="text-primary hover:text-primary/80"
        >
          View All
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Members</p>
                <p className="text-2xl font-bold text-blue-600">1,247</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Posts Today</p>
                <p className="text-2xl font-bold text-green-600">89</p>
              </div>
              <MessageCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-950/20 dark:to-pink-950/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Help Requests</p>
                <p className="text-2xl font-bold text-red-600">23</p>
              </div>
              <Heart className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-3">
        {RECENT_POSTS.map((post) => (
          <Card key={post.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/community')}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-xs">
                    {post.author.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className="text-xs">
                      {post.category}
                    </Badge>
                    <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {post.time}
                    </span>
                  </div>
                  <h3 className="font-medium text-sm mb-1 line-clamp-2">{post.title}</h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">by {post.author}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      <Heart className="h-3 w-3" />
                      {post.likes}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageCircle className="h-3 w-3" />
                      {post.replies} replies
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}