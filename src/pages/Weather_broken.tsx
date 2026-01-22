import { useMemo, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { 
  Cloud, 
  Sun, 
  CloudRain, 
  CloudSnow,
  Zap,
  Thermometer, 
  Droplets, 
  Wind, 
  Eye,
  Calendar,
  MapPin,
  Bell,
  Leaf,
  Wheat,
  AlertTriangle,
  CheckCircle,
  Info,
  Loader2,
  RefreshCw,
  Map,
  Gauge,
  Zap as Lightning,
  Waves,
  TreePine,
  Sunrise,
  Sunset,
  Shield,
  Activity,
  Target
} from "lucide-react";
import { useWeather } from "@/hooks/useWeather";
import { 
  getWeatherCondition, 
  generateAgricultureRecommendations, 
  processDailyForecast,
  getWeatherCacheStats,
  clearWeatherCache,
  type DailyForecast,
  type AgricultureRecommendation 
} from "@/services/weatherService";
import { WeatherMapModal } from "@/components/WeatherMapModal";
import { WeatherCharts } from "@/components/WeatherCharts";
import { 
  getAgricultureConditionInfo,
  getTemperatureSeverity,
  getPrecipitationColor,
  getWindSeverity,
  getUVIndexColor,
  formatWeatherTime,
  formatWeatherDate
} from "@/utils/weatherUtils";

export default function Weather() {
  const { weatherData, location, loading, error, refetch } = useWeather();
  const [selectedLocation, setSelectedLocation] = useState<{lat: number, lng: number, address: string} | null>(null);
  const [agricultureRecommendations, setAgricultureRecommendations] = useState<AgricultureRecommendation[]>([]);
  const [dailyForecasts, setDailyForecasts] = useState<DailyForecast[]>([]);
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [showCacheStatus, setShowCacheStatus] = useState(false);
  const [showWeatherAlerts, setShowWeatherAlerts] = useState(false);
  const [showCropCalendar, setShowCropCalendar] = useState(false);
  const [showPestForecast, setShowPestForecast] = useState(false);

  // Generate agriculture recommendations and process forecasts when weather data changes
  useEffect(() => {
    if (weatherData) {
      const recommendations = generateAgricultureRecommendations(weatherData);
      const forecasts = processDailyForecast(weatherData);
      setAgricultureRecommendations(recommendations);
      setDailyForecasts(forecasts);
    }
  }, [weatherData]);

  // Icon mapping for weather conditions
  const getWeatherIcon = (iconName: string) => {
    switch (iconName) {
      case 'sun': return Sun;
      case 'cloud': return Cloud;
      case 'cloud-rain': return CloudRain;
      case 'cloud-snow': return CloudSnow;
      case 'zap': return Zap;
      default: return Cloud;
    }
  };

  // Enhanced forecast data using our new daily forecast processing - use upcoming 7 days from current date
  const forecastData = useMemo(() => {
    return dailyForecasts.slice(0, 7).map((forecast, index) => {
      const weatherCondition = getWeatherCondition(forecast.weather_code);
      const WeatherIcon = getWeatherIcon(weatherCondition.icon);

      // Generate date for upcoming days starting from today
      const forecastDate = new Date();
      forecastDate.setDate(forecastDate.getDate() + index);

      return {
        day: index === 0 ? "Today" : forecastDate.toLocaleDateString('en-US', { weekday: 'short' }),
        date: forecastDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        high: Math.round(forecast.temperature_max),
        low: Math.round(forecast.temperature_min),
        condition: weatherCondition.condition,
        icon: WeatherIcon,
        rainChance: Math.round(forecast.precipitation_probability),
        precipitation: forecast.precipitation_sum,
        windSpeed: Math.round(forecast.wind_speed_max),
        uvIndex: Math.round(forecast.uv_index_max),
        sunrise: forecast.sunrise,
        sunset: forecast.sunset,
        agriculture: forecast.agriculture_conditions
      };
    });
  }, [dailyForecasts]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Getting weather data...</p>
        </div>
      </div>
    );
  }

  if (error || !weatherData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-warning mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">{error || "Failed to load weather data"}</p>
          <Button onClick={() => refetch()} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  const currentCondition = getWeatherCondition(weatherData.current.weather_code);
  const CurrentWeatherIcon = getWeatherIcon(currentCondition.icon);

  // Handle location selection from map
  const handleLocationSelect = (lat: number, lng: number, address: string) => {
    setSelectedLocation({ lat, lng, address });
    refetch(lat, lng, address);
    setIsMapOpen(false);
  };

  const currentWeather = {
    temperature: Math.round(weatherData.current.temperature_2m),
    condition: currentCondition.condition,
    humidity: Math.round(weatherData.current.relative_humidity_2m),
    windSpeed: Math.round(weatherData.current.wind_speed_10m),
    visibility: Math.round(weatherData.hourly.visibility[0] / 1000) || 10, // Convert to km
    uvIndex: Math.round(weatherData.hourly.uv_index[0] || 0),
    icon: CurrentWeatherIcon,
    location: selectedLocation?.address || location?.address || "Getting your precise location..."
  };

  // Advanced agricultural data
  const agriculturalData = {
    soilTemperature: 25,
    soilMoisture: 65,
    evapotranspiration: 4.2,
    solarRadiation: 850,
    dewPoint: 18,
    cape: 1250,
    visibility: 10,
    pressure: 1013,
  };

  // Get icon for recommendation type
  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case 'alert': return AlertTriangle;
      case 'recommendation': return Info;
      case 'planning': return CheckCircle;
      default: return Info;
    }
  };

  // Get icon for agriculture category  
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'temperature': return Thermometer;
      case 'irrigation': return Droplets;
      case 'weather': return Cloud;
      case 'general': return Leaf;
      default: return Info;
    }
  };

  const cropRecommendations = [
    {
      crop: "Wheat",
      action: "Sow",
      reason: "Optimal temperature and moisture",
      timing: "Next 7 days",
      icon: Wheat,
      confidence: 95
    },
    {
      crop: "Rice",
      action: "Wait",
      reason: "Need more rainfall for transplanting",
      timing: "Wait 2 weeks",
      icon: Leaf,
      confidence: 80
    },
    {
      crop: "Sugarcane",
      action: "Harvest",
      reason: "Perfect weather for harvesting",
      timing: "This month",
      icon: Leaf,
      confidence: 90
    }
  ];

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-8">
      {/* Header */}
      <div className="bg-gradient-primary text-primary-foreground p-6 md:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">Weather & Farming Guide</h1>
              <p className="text-primary-foreground/90 flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                {currentWeather.location}
              </p>
            </div>
            <Dialog open={isMapOpen} onOpenChange={setIsMapOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                  <Map className="h-4 w-4 mr-2" />
                  Change Location
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Select Weather Location</DialogTitle>
                  <DialogDescription>
                    Choose a location on the map to get weather forecasts and agricultural recommendations for that area.
                  </DialogDescription>
                </DialogHeader>
              <WeatherMapModal 
                onLocationSelect={handleLocationSelect}
                currentLocation={selectedLocation || (location ? {
                  lat: location.latitude,
                  lng: location.longitude,
                  address: location.address
                } : undefined)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>

      <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6 md:space-y-8">
        {/* Current Weather */}
        <Card className="shadow-elegant">
          <CardContent className="p-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Main Weather */}
              <div className="text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-4 mb-4">
                  <CurrentWeatherIcon className="h-16 w-16 text-primary" />
                  <div>
                    <p className="text-4xl font-bold">{currentWeather.temperature}°C</p>
                    <p className="text-muted-foreground">{currentWeather.condition}</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span className="font-medium">{currentWeather.location}</span>
                </div>

                {/* Enhanced timezone and time display */}
                <div className="text-center md:text-left space-y-2">
                  <div className="flex items-center justify-center md:justify-start gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {formatWeatherDate(weatherData.current.time, weatherData.location?.timezone)}
                    </span>
                  </div>
                  <div className="flex items-center justify-center md:justify-start gap-2 text-sm text-muted-foreground">
                    <Activity className="h-4 w-4" />
                    <span>
                      Local Time: {formatWeatherTime(weatherData.current.time, weatherData.location?.timezone)}
                    </span>
                  </div>
                  {weatherData.location?.timezone && (
                    <div className="flex items-center justify-center md:justify-start gap-2 text-xs text-muted-foreground">
                      <span>Timezone: {weatherData.location.timezone}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Weather Details */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2 p-3 bg-accent/50 rounded-lg">
                  <Droplets className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Humidity</p>
                    <p className="font-semibold">{currentWeather.humidity}%</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 p-3 bg-accent/50 rounded-lg">
                  <Wind className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Wind Speed</p>
                    <p className="font-semibold">{currentWeather.windSpeed} km/h</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 p-3 bg-accent/50 rounded-lg">
                  <Eye className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Visibility</p>
                    <p className="font-semibold">{currentWeather.visibility} km</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 p-3 bg-accent/50 rounded-lg">
                  <Sun className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">UV Index</p>
                    <p className="font-semibold">{currentWeather.uvIndex}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Weather Visual Charts */}
            <WeatherCharts weatherData={weatherData} />
          </CardContent>
        </Card>

        {/* 7-Day Enhanced Forecast */}
        <Card className="shadow-elegant">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
              <Calendar className="h-5 w-5 text-primary" />
              7-Day Enhanced Forecast
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 md:px-6 pb-4 md:pb-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3 md:gap-4">
              {forecastData.map((day, index) => {
                const IconComponent = day.icon;
                return (
                  <div key={index} className="text-center p-3 md:p-4 bg-accent/30 rounded-lg hover:bg-accent/50 transition-colors border border-border/50">
                    <p className="font-medium mb-1 text-sm md:text-base">{day.day}</p>
                    {day.date && <p className="text-xs text-muted-foreground mb-2">{day.date}</p>}
                    <IconComponent className="h-6 w-6 md:h-8 md:w-8 mx-auto mb-2 text-primary" />
                    <p className="text-xs md:text-sm text-muted-foreground mb-1">{day.condition}</p>
                    <div className="flex justify-center gap-1 md:gap-2 text-sm mb-2">
                      <span className={`font-semibold ${getTemperatureSeverity(day.high)}`}>{day.high}°</span>
                      <span className={`text-muted-foreground ${getTemperatureSeverity(day.low)}`}>{day.low}°</span>
                    </div>
                    
                    {/* Enhanced weather details */}
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center justify-center gap-1">
                        <Droplets className="h-3 w-3 text-blue-500" />
                        <span>{day.rainChance}%</span>
                      </div>
                      {day.precipitation > 0 && (
                        <div className="flex items-center justify-center gap-1">
                          <CloudRain className={`h-3 w-3 ${getPrecipitationColor(day.precipitation)}`} />
                          <span className={getPrecipitationColor(day.precipitation)}>{day.precipitation.toFixed(1)}mm</span>
                        </div>
                      )}
                      <div className="flex items-center justify-center gap-1">
                        <Wind className={`h-3 w-3 ${getWindSeverity(day.windSpeed)}`} />
                        <span className={getWindSeverity(day.windSpeed)}>{day.windSpeed}km/h</span>
                      </div>
                      <div className="flex items-center justify-center gap-1">
                        <Sun className={`h-3 w-3 ${getUVIndexColor(day.uvIndex)}`} />
                        <span className={getUVIndexColor(day.uvIndex)}>UV {day.uvIndex}</span>
                      </div>
                    </div>

                    {/* Agriculture conditions indicators */}
                    <div className="flex justify-center flex-wrap gap-1 mt-2">
                      {Object.entries(day.agriculture || {}).map(([condition, isActive]) => {
                        if (!isActive) return null;
                        const conditionInfo = getAgricultureConditionInfo(condition);
                        const ConditionIcon = conditionInfo.icon;
                        
                        return (
                          <Badge
                            key={condition}
                            variant="outline"
                            className={`text-xs ${conditionInfo.bgColor} ${conditionInfo.color} ${conditionInfo.borderColor} px-1 py-0`}
                          >
                            <ConditionIcon className="h-2 w-2 mr-1" />
                            <span className="hidden sm:inline">{conditionInfo.label.split(' ')[0]}</span>
                          </Badge>
                        );
                      })}
                    </div>

                    {/* Sunrise/Sunset for today */}
                    {index === 0 && day.sunrise && day.sunset && (
                      <div className="flex justify-center gap-2 mt-2 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Sunrise className="h-3 w-3" />
                          <span className="hidden sm:inline">{formatWeatherTime(day.sunrise)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Sunset className="h-3 w-3" />
                          <span className="hidden sm:inline">{formatWeatherTime(day.sunset)}</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Smart Agriculture Recommendations */}
        <Card className="shadow-elegant">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              Smart Agriculture Recommendations
              <Badge variant="secondary" className="ml-auto">{agricultureRecommendations.length} active</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {agricultureRecommendations.length > 0 ? (
                agricultureRecommendations.map((recommendation, index) => {
                  const IconComponent = getRecommendationIcon(recommendation.type);
                  const CategoryIcon = getCategoryIcon(recommendation.category);
                  
                  return (
                    <div
                      key={index}
                      className={`p-4 rounded-lg border-l-4 ${
                        recommendation.priority === "high"
                          ? "border-red-500 bg-red-50 dark:bg-red-950/20"
                          : recommendation.priority === "medium"
                          ? "border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20"
                          : "border-green-500 bg-green-50 dark:bg-green-950/20"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0">
                          <IconComponent className={`h-5 w-5 ${
                            recommendation.priority === "high"
                              ? "text-red-600"
                              : recommendation.priority === "medium"
                              ? "text-yellow-600"
                              : "text-green-600"
                          }`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-2">
                            <h3 className="font-semibold text-sm md:text-base">{recommendation.title}</h3>
                            <div className="flex flex-wrap gap-1">
                              <Badge variant="outline" className="text-xs">
                                <CategoryIcon className="h-3 w-3 mr-1" />
                                {recommendation.category}
                              </Badge>
                              <Badge variant="outline" className={`text-xs ${
                                recommendation.priority === "high"
                                  ? "border-red-300 text-red-700"
                                  : recommendation.priority === "medium"
                                  ? "border-yellow-300 text-yellow-700"
                                  : "border-green-300 text-green-700"
                              }`}>
                                {recommendation.priority} priority
                              </Badge>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3 leading-relaxed">{recommendation.message}</p>
                          
                          {/* Action items */}
                          {recommendation.actionItems.length > 0 && (
                            <div className="space-y-1">
                              <p className="text-xs font-medium text-muted-foreground">Recommended Actions:</p>
                              <ul className="text-xs space-y-1">
                                {recommendation.actionItems.map((action, actionIndex) => (
                                  <li key={actionIndex} className="flex items-center gap-2">
                                    <Target className="h-3 w-3 text-primary flex-shrink-0" />
                                    <span>{action}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                  <p className="text-lg font-medium mb-2">All Clear!</p>
                  <p>No urgent agricultural recommendations at this time. Conditions look favorable for farming activities.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* AI Crop Recommendations */}
        <Card className="shadow-elegant">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Leaf className="h-5 w-5 text-primary" />
              AI Crop Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              {cropRecommendations.map((rec, index) => (
                <div key={index} className="p-4 bg-gradient-card rounded-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <rec.icon className="h-8 w-8 text-primary" />
                    <div>
                      <h4 className="font-semibold">{rec.crop}</h4>
                      <Badge
                        variant={
                          rec.action === "Sow" || rec.action === "Harvest"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {rec.action}
                      </Badge>
                    </div>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-2">{rec.reason}</p>
                  <p className="text-sm font-medium mb-3">{rec.timing}</p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">AI Confidence</span>
                    <span className="text-sm font-bold text-primary">{rec.confidence}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Advanced Agricultural Data */}
        <Card className="shadow-elegant">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TreePine className="h-5 w-5 text-primary" />
              Advanced Agricultural Data
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4">
              <div className="flex items-center gap-2 p-3 bg-accent/50 rounded-lg">
                <Thermometer className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Soil Temp</p>
                  <p className="font-semibold">{agriculturalData.soilTemperature}°C</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 p-3 bg-accent/50 rounded-lg">
                <Droplets className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Soil Moisture</p>
                  <p className="font-semibold">{agriculturalData.soilMoisture}%</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 p-3 bg-accent/50 rounded-lg">
                <Waves className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Evapotranspiration</p>
                  <p className="font-semibold">{agriculturalData.evapotranspiration} mm</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 p-3 bg-accent/50 rounded-lg">
                <Sun className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Solar Radiation</p>
                  <p className="font-semibold">{agriculturalData.solarRadiation} W/m²</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 p-3 bg-accent/50 rounded-lg">
                <Thermometer className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Dew Point</p>
                  <p className="font-semibold">{agriculturalData.dewPoint}°C</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 p-3 bg-accent/50 rounded-lg">
                <Lightning className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">CAPE</p>
                  <p className="font-semibold">{agriculturalData.cape} J/kg</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 p-3 bg-accent/50 rounded-lg">
                <Eye className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Visibility</p>
                  <p className="font-semibold">{agriculturalData.visibility} km</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 p-3 bg-accent/50 rounded-lg">
                <Gauge className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Pressure</p>
                  <p className="font-semibold">{agriculturalData.pressure} hPa</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="bg-gradient-card">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4">Quick Weather Actions</h3>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Dialog open={isMapOpen} onOpenChange={setIsMapOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="h-auto py-4 flex-col gap-2">
                    <Map className="h-5 w-5" />
                    <span className="text-sm">Change Location</span>
                  </Button>
                </DialogTrigger>
              </Dialog>
              
              <Dialog open={showWeatherAlerts} onOpenChange={setShowWeatherAlerts}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="h-auto py-4 flex-col gap-2">
                    <Bell className="h-5 w-5" />
                    <span className="text-sm">Weather Alerts</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Weather Alerts & Warnings</DialogTitle>
                    <DialogDescription>
                      Current weather alerts and warnings for your location with agricultural impact analysis.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    {agricultureRecommendations.filter(rec => rec.priority === 'high').length > 0 ? (
                      agricultureRecommendations.filter(rec => rec.priority === 'high').map((alert, index) => (
                        <div key={index} className="p-4 bg-red-50 border-l-4 border-red-500 rounded-lg dark:bg-red-950/20">
                          <div className="flex items-center gap-2 mb-2">
                            <AlertTriangle className="h-5 w-5 text-red-600" />
                            <h4 className="font-semibold text-red-800 dark:text-red-200">{alert.title}</h4>
                          </div>
                          <p className="text-red-700 dark:text-red-300 mb-3">{alert.message}</p>
                          <div className="space-y-1">
                            {alert.actionItems.map((action, actionIndex) => (
                              <div key={actionIndex} className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                                <Target className="h-3 w-3" />
                                <span>{action}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                        <p className="text-lg font-medium mb-2">No Active Alerts</p>
                        <p className="text-muted-foreground">Weather conditions are currently stable for agricultural activities.</p>
                      </div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
              
              <Dialog open={showCropCalendar} onOpenChange={setShowCropCalendar}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="h-auto py-4 flex-col gap-2">
                    <Calendar className="h-5 w-5" />
                    <span className="text-sm">Crop Calendar</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Agricultural Calendar</DialogTitle>
                    <DialogDescription>
                      Optimal timing for agricultural activities based on current weather patterns and forecasts.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      {cropRecommendations.map((crop, index) => (
                        <div key={index} className="p-4 border rounded-lg">
                          <div className="flex items-center gap-3 mb-3">
                            <crop.icon className="h-8 w-8 text-primary" />
                            <div>
                              <h4 className="font-semibold">{crop.crop}</h4>
                              <Badge variant={crop.action === "Sow" || crop.action === "Harvest" ? "default" : "secondary"}>
                                {crop.action}
                              </Badge>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{crop.reason}</p>
                          <p className="text-sm font-medium mb-2">{crop.timing}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">AI Confidence</span>
                            <span className="text-sm font-bold text-primary">{crop.confidence}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="space-y-4">
                      <h4 className="font-semibold">Weekly Activity Recommendations</h4>
                      {dailyForecasts.slice(0, 7).map((day, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-accent/50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <span className="font-medium">
                              {index === 0 ? "Today" : day.date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                            </span>
                            <div className="flex gap-2">
                              {day.agriculture_conditions.irrigation_needed && <Badge variant="outline" className="text-xs">Irrigation</Badge>}
                              {day.agriculture_conditions.spraying_suitable && <Badge variant="outline" className="text-xs">Spraying OK</Badge>}
                              {day.agriculture_conditions.field_work_suitable && <Badge variant="outline" className="text-xs">Field Work</Badge>}
                              {day.agriculture_conditions.frost_risk && <Badge variant="destructive" className="text-xs">Frost Risk</Badge>}
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-sm font-medium">{Math.round(day.temperature_max)}°/{Math.round(day.temperature_min)}°</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              
              <Dialog open={showPestForecast} onOpenChange={setShowPestForecast}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="h-auto py-4 flex-col gap-2">
                    <Leaf className="h-5 w-5" />
                    <span className="text-sm">Pest Forecast</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Pest & Disease Forecast</DialogTitle>
                    <DialogDescription>
                      Weather-based risk assessment for common agricultural pests and diseases.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Current Risk Factors</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div className="flex justify-between items-center">
                              <span>Temperature</span>
                              <Badge variant={currentWeather.temperature > 25 && currentWeather.temperature < 35 ? "destructive" : "secondary"}>
                                {currentWeather.temperature > 25 && currentWeather.temperature < 35 ? "High Risk" : "Low Risk"}
                              </Badge>
                            </div>
                            <div className="flex justify-between items-center">
                              <span>Humidity</span>
                              <Badge variant={currentWeather.humidity > 70 ? "destructive" : "secondary"}>
                                {currentWeather.humidity > 70 ? "High Risk" : "Low Risk"}
                              </Badge>
                            </div>
                            <div className="flex justify-between items-center">
                              <span>Rain/Moisture</span>
                              <Badge variant={weatherData.current.precipitation > 0 ? "destructive" : "secondary"}>
                                {weatherData.current.precipitation > 0 ? "High Risk" : "Low Risk"}
                              </Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Prevention Tips</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-2 text-sm">
                            <li className="flex items-start gap-2">
                              <Target className="h-4 w-4 text-primary mt-0.5" />
                              <span>Monitor crops daily during favorable pest conditions</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <Target className="h-4 w-4 text-primary mt-0.5" />
                              <span>Apply preventive treatments before peak risk periods</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <Target className="h-4 w-4 text-primary mt-0.5" />
                              <span>Ensure proper field drainage to reduce humidity</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <Target className="h-4 w-4 text-primary mt-0.5" />
                              <span>Use weather-resistant crop varieties when possible</span>
                            </li>
                          </ul>
                        </CardContent>
                      </Card>
                    </div>
                    
                    <div className="space-y-4">
                      <h4 className="font-semibold">Common Pest Risk Assessment</h4>
                      {[
                        { pest: "Aphids", risk: currentWeather.temperature > 20 && currentWeather.humidity > 60 ? "High" : "Low", conditions: "Warm, humid weather" },
                        { pest: "Fungal Diseases", risk: currentWeather.humidity > 70 ? "High" : "Medium", conditions: "High humidity, moderate temperatures" },
                        { pest: "Leaf Miners", risk: currentWeather.temperature > 25 ? "High" : "Low", conditions: "Warm temperatures, dry conditions" },
                        { pest: "Thrips", risk: currentWeather.temperature > 30 && currentWeather.humidity < 50 ? "High" : "Low", conditions: "Hot, dry weather" }
                      ].map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-accent/50 rounded-lg">
                          <div>
                            <span className="font-medium">{item.pest}</span>
                            <p className="text-sm text-muted-foreground">{item.conditions}</p>
                          </div>
                          <Badge variant={item.risk === "High" ? "destructive" : item.risk === "Medium" ? "default" : "secondary"}>
                            {item.risk} Risk
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Cache Status Display */}
            <div className="mt-6 pt-4 border-t border-border/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">API Cache Status</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    Cache Active
                  </Badge>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setShowCacheStatus(!showCacheStatus)}
                    className="text-xs"
                  >
                    {showCacheStatus ? 'Hide' : 'Show'} Details
                  </Button>
                </div>
              </div>
              
              {showCacheStatus && (
                <div className="mt-3 p-3 bg-accent/30 rounded-lg">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Cache Hits</p>
                      <p className="font-medium">0</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">API Calls</p>
                      <p className="font-medium">1</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Cache Size</p>
                      <p className="font-medium">1 entry</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Last Updated</p>
                      <p className="font-medium">Now</p>
                    </div>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => {
                        clearWeatherCache();
                        refetch();
                      }}
                      className="text-xs"
                    >
                      Clear Cache
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => refetch()}
                      className="text-xs"
                    >
                      <RefreshCw className="h-3 w-3 mr-1" />
                      Refresh Data
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}