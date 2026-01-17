import { Card, CardContent } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Cloud, Clock, Leaf, ChevronRight, BarChart3 } from "lucide-react";
import { useWeather } from "@/hooks/useWeather";

export function GreetingSection() {
  const { weatherData, loading: weatherLoading } = useWeather();

  const summaryCards = [
    {
      title: "Weather Today",
      icon: <Cloud className="h-5 w-5 text-blue-500" />,
      content: weatherLoading ? "Loading..." : `${Math.round(weatherData?.current?.temperature_2m || 0)}°C, Clear`,
      subtitle: weatherData?.current?.relative_humidity_2m ? `${Math.round(weatherData.current.relative_humidity_2m)}% humidity` : "Clear skies",
      color: "bg-blue-50 dark:bg-blue-950/20",
      image: null
    },
    {
      title: "Next Task",
      icon: <Clock className="h-5 w-5 text-emerald-600" />,
      content: "Irrigate Wheat Field",
      subtitle: "Due in 2 hours - 2.5 acres",
      color: "bg-emerald-50 dark:bg-emerald-950/20",
      image: null
    },
    {
      title: "Crop Health",
      icon: <Leaf className="h-5 w-5 text-green-500" />,
      content: "85% Healthy",
      subtitle: "Wheat: Good | Tomato: Excellent",
      color: "bg-green-50 dark:bg-green-950/20",
      image: null
    },
    {
      title: "Market Trend",
      icon: <BarChart3 className="h-5 w-5 text-slate-600" />,
      content: "Wheat: +₹120",
      subtitle: "Up 5.2% this week",
      color: "bg-slate-50 dark:bg-slate-950/20",
      image: null
    }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20 border-0 shadow-sm">
        <CardContent className="p-6 md:p-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                  <span className="text-2xl">🌱</span>
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                    Welcome, Farmer!
                  </h1>
                  <p className="text-muted-foreground mt-1">
                    Welcome to your smart farming dashboard
                  </p>
                </div>
              </div>
            </div>

            <div className="hidden md:block">
              <Card className="bg-white/50 dark:bg-gray-900/50 border-0 shadow-sm">
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Summary Cards */}
      <div className="px-4">
        <div className="relative">
          <Carousel className="w-full">
            <CarouselContent className="-ml-2 md:-ml-4">
              {summaryCards.map((card, index) => (
                <CarouselItem key={index} className="pl-2 md:pl-4 basis-4/5 sm:basis-1/2 lg:basis-1/3">
                  <Card className={`${card.color} border-0 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105`}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          {card.icon}
                          <span className="text-sm font-medium text-muted-foreground">
                            {card.title}
                          </span>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="space-y-1">
                        <p className="font-semibold text-foreground leading-tight text-lg">
                          {card.content}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {card.subtitle}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="hidden sm:flex" />
            <CarouselNext className="hidden sm:flex" />
          </Carousel>
        </div>
      </div>
    </div>
  );
}