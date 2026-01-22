import { useMemo, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { EnhancedLoading } from '@/components/common/EnhancedLoading';
import { RealtimeSyncIndicator } from '@/components/weather/RealtimeSyncIndicator';
import { useRealtimeWeather } from '@/hooks/useRealtimeWeather';
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
  Target,
  Bug,
  Database,
  Sprout
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
  // Use real-time weather hook with enhanced sync capabilities
  const {
    weatherData,
    location,
    loading,
    error,
    syncStatus,
    config,
    refreshWeatherData,
    updateLocation,
    toggleAutoRefresh,
    updateRefreshInterval,
    clearCache,
    getCacheStats
  } = useRealtimeWeather();
  
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

  // Get cache data
  const cacheData = useMemo(() => {
    return getCacheStats();
  }, [getCacheStats]);

  if (loading) {
    return <EnhancedLoading />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Weather Data Unavailable</h2>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => refreshWeatherData()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!weatherData) {
    return null;
  }

  const currentWeather = {
    temperature: Math.round(weatherData.current.temperature_2m),
    condition: getWeatherCondition(weatherData.current.weather_code),
    humidity: weatherData.current.relative_humidity_2m,
    windSpeed: Math.round(weatherData.current.wind_speed_10m),
    location: typeof location === 'string' ? location : location?.address || "Unknown Location",
    feelsLike: Math.round(weatherData.current.apparent_temperature),
    uvIndex: 0, // Default value as property doesn't exist
    pressure: Math.round(weatherData.current.surface_pressure),
    visibility: 10, // Default value as property doesn't exist
    precipitation: weatherData.current.precipitation || 0
  };

  const conditionText = typeof currentWeather.condition === 'string' ? 
    currentWeather.condition : currentWeather.condition.condition;

  const CurrentWeatherIcon = conditionText.includes('cloud') ? Cloud :
                           conditionText.includes('rain') ? CloudRain :
                           conditionText.includes('snow') ? CloudSnow :
                           conditionText.includes('storm') ? Zap : Sun;

  // Simple forecast data from daily forecasts - use upcoming 7 days from current date
  const forecastData = dailyForecasts.slice(0, 7).map((forecast, index) => {
    const conditionText = getWeatherCondition(forecast.weather_code || 0);
    const condition = typeof conditionText === 'string' ? conditionText : conditionText.condition;

    // Generate date for upcoming days starting from today
    const forecastDate = new Date();
    forecastDate.setDate(forecastDate.getDate() + index);

    return {
      day: index === 0 ? 'Today' :
           index === 1 ? 'Tomorrow' :
           forecastDate.toLocaleDateString('en-US', { weekday: 'short' }),
      date: index === 0 ? '' : forecastDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      high: Math.round(forecast.temperature_max || 25),
      low: Math.round(forecast.temperature_min || 15),
      condition: condition,
      icon: condition.includes('cloud') ? Cloud :
            condition.includes('rain') ? CloudRain :
            condition.includes('snow') ? CloudSnow :
            condition.includes('storm') ? Zap : Sun,
      rainChance: Math.round(forecast.precipitation_probability || 0),
      precipitation: forecast.precipitation_sum || 0,
      windSpeed: Math.round(forecast.wind_speed_max || 10),
      uvIndex: Math.round(forecast.uv_index_max || 5),
      agriculture: forecast.agriculture_conditions || {},
      sunrise: forecast.sunrise,
      sunset: forecast.sunset
    };
  });

  // Enhanced agricultural data
  const agriculturalData = {
    soilTemperature: 25,
    soilMoisture: 65,
    evapotranspiration: 4.2,
    solarRadiation: 850,
    dewPoint: 18,
    cape: 1250,
    visibility: 10,
    pressure: 1013
  };

  // Crop recommendations
  const cropRecommendations = [
    {
      crop: "Rice",
      action: "Monitor",
      reason: "Good weather conditions for rice cultivation. Monitor water levels.",
      timing: "Current phase: Vegetative growth",
      confidence: 85,
      icon: Wheat
    },
    {
      crop: "Wheat",
      action: "Harvest",
      reason: "Optimal harvesting conditions with low humidity and good weather.",
      timing: "Next 7 days",
      confidence: 92,
      icon: Wheat
    },
    {
      crop: "Tomatoes",
      action: "Sow",
      reason: "Temperature and humidity levels are perfect for tomato planting.",
      timing: "Within next 14 days",
      confidence: 78,
      icon: Leaf
    }
  ];

  // Helper functions for icons
  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case 'irrigation': return Droplets;
      case 'fertilizer': return Sprout;
      case 'pest': return Bug;
      case 'harvest': return Wheat;
      default: return Info;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'water': return Droplets;
      case 'nutrition': return Sprout;
      case 'protection': return Shield;
      case 'timing': return Calendar;
      default: return Activity;
    }
  };

  const handleLocationSelect = (lat: number, lng: number, address: string) => {
    setSelectedLocation({ lat, lng, address });
    setIsMapOpen(false);
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-8">
      {/* Header */}
      <div className="bg-gradient-primary text-primary-foreground p-6 md:p-8">
        <div className="max-w-6xl mx-auto">
          {/* Real-time Sync Indicator */}
          <div className="mb-4">
            <RealtimeSyncIndicator
              syncStatus={syncStatus}
              onRefresh={refreshWeatherData}
              onToggleAutoRefresh={toggleAutoRefresh}
              onUpdateInterval={updateRefreshInterval}
              refreshInterval={config.autoRefreshInterval}
              compact={true}
              className="bg-white/10 border-white/20"
            />
          </div>
          
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-2">Weather & Farming Guide</h1>
              <p className="text-primary-foreground/90 flex items-center gap-2 text-sm md:text-base">
                <MapPin className="h-4 w-4" />
                {currentWeather.location}
              </p>
            </div>
            <Dialog open={isMapOpen} onOpenChange={setIsMapOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20 w-full sm:w-auto">
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
                  currentLocation={undefined}
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6 md:space-y-8">
        {/* Current Weather */}
        <Card className="shadow-elegant">
          <CardContent className="p-4 md:p-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Main Weather */}
              <div className="text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-4 mb-4">
                  <CurrentWeatherIcon className="h-12 w-12 md:h-16 md:w-16 text-primary" />
                  <div>
                    <p className="text-3xl md:text-4xl font-bold">{currentWeather.temperature}°C</p>
                    <p className="text-muted-foreground text-sm md:text-base">{conditionText}</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span className="font-medium text-sm md:text-base">{currentWeather.location}</span>
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
                    <span>Last updated: {formatWeatherTime(weatherData.current.time, weatherData.location?.timezone)}</span>
                  </div>
                </div>
              </div>

              {/* Weather Details Grid */}
              <div className="grid grid-cols-2 gap-3 md:gap-4">
                <div className="text-center p-3 bg-accent/30 rounded-lg">
                  <Thermometer className="h-4 w-4 md:h-5 md:w-5 mx-auto mb-1 text-primary" />
                  <p className="text-xs text-muted-foreground">Feels like</p>
                  <p className="font-semibold text-sm md:text-base">{currentWeather.feelsLike}°C</p>
                </div>
                <div className="text-center p-3 bg-accent/30 rounded-lg">
                  <Droplets className="h-4 w-4 md:h-5 md:w-5 mx-auto mb-1 text-blue-500" />
                  <p className="text-xs text-muted-foreground">Humidity</p>
                  <p className="font-semibold text-sm md:text-base">{currentWeather.humidity}%</p>
                </div>
                <div className="text-center p-3 bg-accent/30 rounded-lg">
                  <Wind className="h-4 w-4 md:h-5 md:w-5 mx-auto mb-1 text-primary" />
                  <p className="text-xs text-muted-foreground">Wind Speed</p>
                  <p className="font-semibold text-sm md:text-base">{currentWeather.windSpeed} km/h</p>
                </div>
                <div className="text-center p-3 bg-accent/30 rounded-lg">
                  <Sun className="h-4 w-4 md:h-5 md:w-5 mx-auto mb-1 text-yellow-500" />
                  <p className="text-xs text-muted-foreground">UV Index</p>
                  <p className="font-semibold text-sm md:text-base">{currentWeather.uvIndex}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Weather Charts */}
        <WeatherCharts weatherData={weatherData} />

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
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
              <Bell className="h-5 w-5 text-primary" />
              Smart Agriculture Recommendations
              <Badge variant="secondary" className="ml-auto text-xs">{agricultureRecommendations.length} active</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 md:px-6 pb-4 md:pb-6">
            <div className="space-y-3 md:space-y-4">
              {agricultureRecommendations.length > 0 ? (
                agricultureRecommendations.map((recommendation, index) => {
                  const IconComponent = getRecommendationIcon(recommendation.type);
                  const CategoryIcon = getCategoryIcon(recommendation.category);
                  
                  return (
                    <div
                      key={index}
                      className={`p-3 md:p-4 rounded-lg border-l-4 ${
                        recommendation.priority === "high"
                          ? "border-red-500 bg-red-50 dark:bg-red-950/20"
                          : recommendation.priority === "medium"
                          ? "border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20"
                          : "border-green-500 bg-green-50 dark:bg-green-950/20"
                      }`}
                    >
                      <div className="flex items-start gap-2 md:gap-3">
                        <div className="flex-shrink-0">
                          <IconComponent className={`h-4 w-4 md:h-5 md:w-5 ${
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
                                  <li key={actionIndex} className="flex items-start gap-2">
                                    <Target className="h-3 w-3 text-primary flex-shrink-0 mt-0.5" />
                                    <span className="leading-relaxed">{action}</span>
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
                <div className="text-center py-6 md:py-8 text-muted-foreground">
                  <CheckCircle className="h-10 w-10 md:h-12 md:w-12 mx-auto mb-3 md:mb-4 text-green-500" />
                  <p className="text-base md:text-lg font-medium mb-2">All Clear!</p>
                  <p className="text-sm md:text-base">No urgent agricultural recommendations at this time. Conditions look favorable for farming activities.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* AI Crop Recommendations */}
        <Card className="shadow-elegant">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
              <Leaf className="h-5 w-5 text-primary" />
              AI Crop Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 md:px-6 pb-4 md:pb-6">
            <div className="grid md:grid-cols-3 gap-4 md:gap-6">
              {cropRecommendations.map((rec, index) => (
                <div key={index} className="p-3 md:p-4 bg-gradient-card rounded-lg">
                  <div className="flex items-center gap-2 md:gap-3 mb-3">
                    <rec.icon className="h-6 w-6 md:h-8 md:w-8 text-primary" />
                    <div>
                      <h4 className="font-semibold text-sm md:text-base">{rec.crop}</h4>
                      <Badge
                        variant={
                          rec.action === "Sow" || rec.action === "Harvest"
                            ? "default"
                            : "secondary"
                        }
                        className="text-xs"
                      >
                        {rec.action}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-xs md:text-sm text-muted-foreground mb-2 leading-relaxed">{rec.reason}</p>
                  <p className="text-xs md:text-sm font-medium mb-2">{rec.timing}</p>
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
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
              <TreePine className="h-5 w-5 text-primary" />
              Advanced Agricultural Data
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 md:px-6 pb-4 md:pb-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
              <div className="flex items-center gap-2 p-3 bg-accent/50 rounded-lg">
                <Thermometer className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                <div>
                  <p className="text-xs md:text-sm text-muted-foreground">Soil Temp</p>
                  <p className="font-semibold text-sm md:text-base">{agriculturalData.soilTemperature}°C</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 p-3 bg-accent/50 rounded-lg">
                <Droplets className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                <div>
                  <p className="text-xs md:text-sm text-muted-foreground">Soil Moisture</p>
                  <p className="font-semibold text-sm md:text-base">{agriculturalData.soilMoisture}%</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 p-3 bg-accent/50 rounded-lg">
                <Waves className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                <div>
                  <p className="text-xs md:text-sm text-muted-foreground">Evapotranspiration</p>
                  <p className="font-semibold text-sm md:text-base">{agriculturalData.evapotranspiration} mm</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 p-3 bg-accent/50 rounded-lg">
                <Sun className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                <div>
                  <p className="text-xs md:text-sm text-muted-foreground">Solar Radiation</p>
                  <p className="font-semibold text-sm md:text-base">{agriculturalData.solarRadiation} W/m²</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 p-3 bg-accent/50 rounded-lg">
                <Thermometer className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                <div>
                  <p className="text-xs md:text-sm text-muted-foreground">Dew Point</p>
                  <p className="font-semibold text-sm md:text-base">{agriculturalData.dewPoint}°C</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 p-3 bg-accent/50 rounded-lg">
                <Lightning className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                <div>
                  <p className="text-xs md:text-sm text-muted-foreground">CAPE</p>
                  <p className="font-semibold text-sm md:text-base">{agriculturalData.cape} J/kg</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 p-3 bg-accent/50 rounded-lg">
                <Eye className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                <div>
                  <p className="text-xs md:text-sm text-muted-foreground">Visibility</p>
                  <p className="font-semibold text-sm md:text-base">{agriculturalData.visibility} km</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 p-3 bg-accent/50 rounded-lg">
                <Gauge className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                <div>
                  <p className="text-xs md:text-sm text-muted-foreground">Pressure</p>
                  <p className="font-semibold text-sm md:text-base">{agriculturalData.pressure} hPa</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="bg-gradient-card">
          <CardContent className="p-4 md:p-6">
            <h3 className="font-semibold mb-4 text-base md:text-lg">Quick Weather Actions</h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
              <Dialog open={showWeatherAlerts} onOpenChange={setShowWeatherAlerts}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="h-auto py-3 md:py-4 flex-col gap-2">
                    <Bell className="h-4 w-4 md:h-5 md:w-5" />
                    <span className="text-xs md:text-sm">Weather Alerts</span>
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
                  <Button variant="outline" className="h-auto py-3 md:py-4 flex-col gap-2">
                    <Calendar className="h-4 w-4 md:h-5 md:w-5" />
                    <span className="text-xs md:text-sm">Crop Calendar</span>
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
                  </div>
                </DialogContent>
              </Dialog>
              
              <Dialog open={showPestForecast} onOpenChange={setShowPestForecast}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="h-auto py-3 md:py-4 flex-col gap-2">
                    <Bug className="h-4 w-4 md:h-5 md:w-5" />
                    <span className="text-xs md:text-sm">Pest Forecast</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Pest & Disease Forecast</DialogTitle>
                    <DialogDescription>
                      Weather-based pest and disease risk assessment for your crops.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="p-4 border rounded-lg">
                        <div className="flex items-center gap-2 mb-3">
                          <Bug className="h-5 w-5 text-yellow-600" />
                          <h4 className="font-semibold">Aphid Risk</h4>
                          <Badge variant="outline" className="text-yellow-700 border-yellow-300">Medium</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          Moderate temperatures and humidity levels create favorable conditions for aphid populations.
                        </p>
                        <p className="text-sm font-medium text-yellow-700">
                          Monitor plants closely and consider preventive measures.
                        </p>
                      </div>
                      
                      <div className="p-4 border rounded-lg">
                        <div className="flex items-center gap-2 mb-3">
                          <Shield className="h-5 w-5 text-green-600" />
                          <h4 className="font-semibold">Fungal Disease Risk</h4>
                          <Badge variant="outline" className="text-green-700 border-green-300">Low</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          Current weather conditions are not conducive to fungal disease development.
                        </p>
                        <p className="text-sm font-medium text-green-700">
                          Continue regular crop monitoring.
                        </p>
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              <Button 
                variant="outline" 
                className="h-auto py-3 md:py-4 flex-col gap-2"
                onClick={() => setShowCacheStatus(!showCacheStatus)}
              >
                <Database className="h-4 w-4 md:h-5 md:w-5" />
                <span className="text-xs md:text-sm">Cache Status</span>
              </Button>
            </div>

            {/* Cache Status */}
            {showCacheStatus && cacheData && (
              <div className="mt-6">
                <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                  <Database className="h-4 w-4" />
                  Cache Status
                </h4>
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
                        refreshWeatherData();
                      }}
                      className="text-xs"
                    >
                      Clear Cache
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => refreshWeatherData()}
                      className="text-xs"
                    >
                      <RefreshCw className="h-3 w-3 mr-1" />
                      Refresh Data
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}