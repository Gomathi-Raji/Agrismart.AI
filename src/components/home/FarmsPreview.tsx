import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Leaf, Users, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";

const NEARBY_FARMS = [
  { name: 'Chennai Organic Farm', distance: '2.3 km', type: 'Organic Vegetables', rating: 4.8 },
  { name: 'Poonamallee Organic Farm', distance: '3.1 km', type: 'Certified Organic', rating: 4.6 },
  { name: 'Guindy Experimental Farm', distance: '4.2 km', type: 'Research Farm', rating: 4.9 },
];

export function FarmsPreview() {
  const navigate = useNavigate();

  return (
    <div className="px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-foreground dark:text-foreground">🌾 Nearby Farms</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/farms')}
          className="text-primary hover:text-primary/80"
        >
          View All
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <Card className="bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Farms</p>
                <p className="text-2xl font-bold text-green-600">25</p>
              </div>
              <Leaf className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Within 10km</p>
                <p className="text-2xl font-bold text-blue-600">18</p>
              </div>
              <MapPin className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Rating</p>
                <p className="text-2xl font-bold text-amber-700">4.6</p>
              </div>
              <TrendingUp className="h-8 w-8 text-amber-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-3">
        {NEARBY_FARMS.map((farm, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/farms')}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium text-sm">{farm.name}</h3>
                    <Badge variant="secondary" className="text-xs">⭐ {farm.rating}</Badge>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {farm.distance}
                    </span>
                    <span className="flex items-center gap-1">
                      <Leaf className="h-3 w-3" />
                      {farm.type}
                    </span>
                  </div>
                </div>
                <Button size="sm" variant="outline" className="text-xs">
                  Visit Farm
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}