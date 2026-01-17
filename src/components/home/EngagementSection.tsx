import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, MessageSquare, BookOpen } from "lucide-react";

export function EngagementSection() {
  const communityStats = [
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
  ];

  return (
    <div className="px-4 py-6">
      <Card className="shadow-sm border border-border bg-card dark:bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2 text-card-foreground">
            <Users className="h-5 w-5 text-primary" />
            Community Engagement
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {communityStats.map((stat) => (
              <div key={stat.id} className="p-4 rounded-lg bg-accent/50 text-center">
                <stat.icon className="h-8 w-8 mx-auto mb-2 text-primary" />
                <p className="text-2xl font-bold text-primary">{stat.value}</p>
                <p className="text-sm font-medium">{stat.title}</p>
                <p className="text-xs text-muted-foreground">{stat.description}</p>
              </div>
            ))}
          </div>
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