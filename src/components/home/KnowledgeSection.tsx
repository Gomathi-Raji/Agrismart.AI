import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, ChevronRight, ExternalLink, Calendar, User } from "lucide-react";

export function KnowledgeSection() {
  const knowledgeItems = [
    {
      id: 1,
      title: "Organic Farming Techniques for Wheat",
      description: "Learn sustainable farming methods to improve crop yield and soil health.",
      author: "Dr. Rajesh Kumar",
      date: "2024-01-15",
      category: "Farming Guide",
      image: "https://images.unsplash.com/photo-1500651230702-0e2d8a49d4ad?w=400&h=300&fit=crop&crop=center"
    },
    {
      id: 2,
      title: "Weather Impact on Crop Diseases",
      description: "Understanding how weather patterns affect pest and disease management.",
      author: "Dr. Priya Sharma",
      date: "2024-01-12",
      category: "Disease Management",
      image: "https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=400&h=300&fit=crop&crop=center"
    },
    {
      id: 3,
      title: "Monsoon Preparation Guide",
      description: "Essential steps to prepare your farm for the upcoming monsoon season.",
      author: "Agriculture Department",
      date: "2024-01-10",
      category: "Seasonal Guide",
      image: "https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?w=400&h=300&fit=crop&crop=center"
    }
  ];

  return (
    <div className="px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-foreground">Knowledge & News</h2>
        <Button variant="ghost" size="sm">
          View All
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>

      <div className="space-y-4">
        {knowledgeItems.map((item) => (
          <Card key={item.id} className="shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex gap-4">
                <div className="w-20 h-20 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-sm text-foreground line-clamp-2 mb-1">
                        {item.title}
                      </h3>
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                        {item.description}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {item.author}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(item.date).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="ml-2">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
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