import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, Quote, TrendingUp, Award, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";

// Import farmer avatars
import rajeshAvatar from "@/assets/rajesh-kumar-avatar.jpg";
import priyaAvatar from "@/assets/priya-sharma-avatar.jpg";
import lakshmiAvatar from "@/assets/lakshmi-devi-avatar.jpg";

const SUCCESS_STORIES = [
  {
    id: 1,
    name: "Rajesh Kumar",
    location: "Chennai, Tamil Nadu",
    avatar: rajeshAvatar,
    crop: "Tomatoes",
    achievement: "2500% Yield Increase",
    story: "AgriSmart AI helped me identify and treat early blight disease. My tomato yield went from 2 tons to 50 tons per acre!",
    rating: 5,
    beforeAfter: {
      before: "2 tons/acre",
      after: "50 tons/acre",
      improvement: "+2400%"
    },
    badge: "Top Performer"
  },
  {
    id: 2,
    name: "Priya Sharma",
    location: "Pune, Maharashtra",
    avatar: priyaAvatar,
    crop: "Wheat",
    achievement: "40% Cost Reduction",
    story: "Using smart irrigation recommendations, I reduced my water usage by 70% and increased profits by ₹2 lakhs annually.",
    rating: 5,
    beforeAfter: {
      before: "₹8 lakhs/year",
      after: "₹10 lakhs/year",
      improvement: "+25%"
    },
    badge: "Water Champion"
  },
  {
    id: 3,
    name: "Lakshmi Devi",
    location: "Coimbatore, Tamil Nadu",
    avatar: lakshmiAvatar,
    crop: "Rice",
    achievement: "Organic Certification",
    story: "AgriSmart guided me through organic farming transition. Now I get premium prices and government subsidies!",
    rating: 5,
    beforeAfter: {
      before: "₹25/kg",
      after: "₹45/kg",
      improvement: "+80%"
    },
    badge: "Organic Pioneer"
  }
];

export function SuccessStories() {
  const navigate = useNavigate();

  return (
    <div className="px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-foreground">🏆 Success Stories</h2>
          <p className="text-sm text-muted-foreground">Real farmers, real results</p>
        </div>
        <Button variant="ghost" size="sm" onClick={() => navigate('/community')}>
          View All Stories
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {SUCCESS_STORIES.map((story) => (
          <Card key={story.id} className="overflow-hidden hover:shadow-xl transition-all duration-300 group cursor-pointer" onClick={() => navigate('/community')}>
            <div className="relative">
              <div className="bg-gradient-to-br from-green-400 to-blue-500 p-6 text-white">
                <div className="flex items-center gap-3 mb-4">
                  <Avatar className="h-12 w-12 border-2 border-white">
                    <AvatarImage src={story.avatar} alt={story.name} />
                    <AvatarFallback className="bg-white/20 text-white">
                      {story.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">{story.name}</h3>
                    <div className="flex items-center gap-1 text-sm opacity-90">
                      <MapPin className="h-3 w-3" />
                      {story.location}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 mb-2">
                  {[...Array(story.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>

                <Badge className="bg-white/20 text-white border-white/30 mb-3">
                  <Award className="h-3 w-3 mr-1" />
                  {story.badge}
                </Badge>
              </div>

              <div className="absolute -bottom-3 left-6 right-6">
                <div className="bg-white dark:bg-gray-900 rounded-lg p-4 shadow-lg border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-green-600">{story.crop}</span>
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                      {story.achievement}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      {story.beforeAfter.before} → {story.beforeAfter.after}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <CardContent className="p-6 pt-8">
              <div className="relative">
                <Quote className="h-6 w-6 text-gray-300 absolute -top-2 -left-2" />
                <p className="text-sm text-gray-700 dark:text-gray-300 italic leading-relaxed">
                  "{story.story}"
                </p>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                <div className="flex items-center justify-between">
                  <div className="text-center">
                    <div className="text-lg font-bold text-green-600">{story.beforeAfter.improvement}</div>
                    <div className="text-xs text-gray-500">Improvement</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-600">₹{story.beforeAfter.after.split('/')[0].replace('₹', '')}</div>
                    <div className="text-xs text-gray-500">Current Price</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Call to Action */}
      <div className="mt-8 text-center">
        <Card className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20 border-0">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-2">Ready to Join These Success Stories?</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Start your journey with AgriSmart AI and transform your farming today.
            </p>
            <Button className="bg-green-600 hover:bg-green-700">
              Get Started Now
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}