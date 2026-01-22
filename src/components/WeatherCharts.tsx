import { useMemo } from "react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ComposedChart
} from "recharts";
import type { TooltipProps } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Thermometer, 
  Droplets, 
  Wind, 
  Sun,
  CloudRain,
  Gauge
} from "lucide-react";
import { WeatherData } from "@/services/weatherService";

interface WeatherChartsProps {
  weatherData: WeatherData | null;
}

export const WeatherCharts: React.FC<WeatherChartsProps> = ({ weatherData }) => {
  // Early return if no weather data
  if (!weatherData) {
    return (
      <Card className="shadow-elegant">
        <CardContent className="flex items-center justify-center h-80">
          <p className="text-muted-foreground">Loading weather charts...</p>
        </CardContent>
      </Card>
    );
  }
  // Process hourly data for the next 24 hours
  const hourlyChartData = useMemo(() => {
    if (!weatherData.hourly || !weatherData.hourly.time) return [];
    
    const hoursToShow = Math.min(24, weatherData.hourly.time.length);
    const data = Array.from({ length: hoursToShow }, (_, i) => {
      // Safety checks for each field
      const time = weatherData.hourly.time[i];
      const temperature = weatherData.hourly.temperature_2m?.[i];
      const humidity = weatherData.hourly.relative_humidity_2m?.[i];
      const precipitation = weatherData.hourly.precipitation?.[i] || 0;
      const windSpeed = weatherData.hourly.wind_speed_10m?.[i];
      const uvIndex = weatherData.hourly.uv_index?.[i] || 0;
      const pressure = weatherData.hourly.pressure_msl?.[i];
      
      return {
        time: time ? time.toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }) : `${i}:00`,
        hour: time ? time.getHours() : i,
        temperature: temperature ? Math.round(temperature) : 0,
        humidity: humidity ? Math.round(humidity) : 0,
        precipitation: typeof precipitation === 'number' ? precipitation : 0,
        windSpeed: windSpeed ? Math.round(windSpeed) : 0,
        uvIndex: typeof uvIndex === 'number' ? Math.round(uvIndex) : 0,
        pressure: pressure ? Math.round(pressure) : 1013
      };
    });
    
    return data;
  }, [weatherData]);

  // Process daily data for 7-day charts - use upcoming 7 days from current date
  const dailyChartData = useMemo(() => {
    if (!weatherData.daily) return [];
    
    const daysToShow = Math.min(7, weatherData.daily.time.length);
    return Array.from({ length: daysToShow }, (_, i) => {
      // Generate date for upcoming days starting from today
      const forecastDate = new Date();
      forecastDate.setDate(forecastDate.getDate() + i);
      
      return {
        day: i === 0 ? 'Today' : forecastDate.toLocaleDateString('en-US', { 
          weekday: 'short',
          month: 'short',
          day: 'numeric'
        }),
        date: forecastDate,
        tempMax: Math.round(weatherData.daily.temperature_2m_max[i]),
        tempMin: Math.round(weatherData.daily.temperature_2m_min[i]),
        precipitation: weatherData.daily.precipitation_sum[i] || 0,
        windMax: Math.round(weatherData.daily.wind_speed_10m_max[i]),
        uvMax: Math.round(weatherData.daily.uv_index_max[i] || 0),
        sunshineHours: Math.round((weatherData.daily.sunshine_duration[i] || 0) / 3600)
      };
    });
  }, [weatherData]);

  const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium text-foreground">{label}</p>
          {payload.map((entry, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry?.color || '#000' }}>
              {entry?.name}: {entry?.value}{(entry?.payload as { unit?: string })?.unit || ''}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* 24-Hour Temperature & Humidity Chart */}
      <Card className="shadow-elegant">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Thermometer className="h-5 w-5 text-primary" />
            24-Hour Temperature & Humidity
            <Badge variant="secondary">Next 24 Hours</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={hourlyChartData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  dataKey="time" 
                  tick={{ fontSize: 12 }}
                  interval="preserveStartEnd"
                />
                <YAxis 
                  yAxisId="temp" 
                  orientation="left" 
                  tick={{ fontSize: 12 }}
                  label={{ value: 'Temperature (°C)', angle: -90, position: 'insideLeft' }}
                />
                <YAxis 
                  yAxisId="humidity" 
                  orientation="right" 
                  tick={{ fontSize: 12 }}
                  label={{ value: 'Humidity (%)', angle: 90, position: 'insideRight' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line 
                  yAxisId="temp"
                  type="monotone" 
                  dataKey="temperature" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={3}
                  name="Temperature (°C)"
                  dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 4 }}
                />
                <Line 
                  yAxisId="humidity"
                  type="monotone" 
                  dataKey="humidity" 
                  stroke="hsl(210, 100%, 56%)" 
                  strokeWidth={2}
                  name="Humidity (%)"
                  dot={{ fill: "hsl(210, 100%, 56%)", strokeWidth: 2, r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* 24-Hour Precipitation & Wind Chart */}
      <Card className="shadow-elegant">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CloudRain className="h-5 w-5 text-primary" />
            24-Hour Precipitation & Wind
            <Badge variant="secondary">Hourly Forecast</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 w-full">
            {hourlyChartData.length > 0 ? (
              <>
                <div className="mb-4 text-sm text-muted-foreground">
                  Data points: {hourlyChartData.length} | 
                  Precipitation range: {Math.min(...hourlyChartData.map(d => d.precipitation))}-{Math.max(...hourlyChartData.map(d => d.precipitation))}mm | 
                  Wind range: {Math.min(...hourlyChartData.map(d => d.windSpeed))}-{Math.max(...hourlyChartData.map(d => d.windSpeed))}km/h
                </div>
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={hourlyChartData}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis 
                      dataKey="time" 
                      tick={{ fontSize: 12 }}
                      interval="preserveStartEnd"
                    />
                    <YAxis 
                      yAxisId="precipitation" 
                      orientation="left" 
                      tick={{ fontSize: 12 }}
                      label={{ value: 'Precipitation (mm)', angle: -90, position: 'insideLeft' }}
                      domain={[0, 'dataMax + 1']}
                    />
                    <YAxis 
                      yAxisId="wind" 
                      orientation="right" 
                      tick={{ fontSize: 12 }}
                      label={{ value: 'Wind Speed (km/h)', angle: 90, position: 'insideRight' }}
                      domain={[0, 'dataMax + 5']}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Area 
                      yAxisId="precipitation"
                      type="monotone" 
                      dataKey="precipitation" 
                      stroke="hsl(210, 100%, 70%)" 
                      fill="hsl(210, 100%, 85%)"
                      fillOpacity={0.6}
                      name="Precipitation (mm)"
                      strokeWidth={2}
                    />
                    <Line 
                      yAxisId="wind"
                      type="monotone" 
                      dataKey="windSpeed" 
                      stroke="hsl(120, 60%, 45%)" 
                      strokeWidth={3}
                      name="Wind Speed (km/h)"
                      dot={{ fill: "hsl(120, 60%, 45%)", strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, stroke: "hsl(120, 60%, 45%)", strokeWidth: 2 }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <div className="text-center">
                  <CloudRain className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No hourly weather data available</p>
                  <p className="text-xs mt-2">Check if weather data is loaded</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 7-Day Daily Overview */}
      <Card className="shadow-elegant">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sun className="h-5 w-5 text-primary" />
            7-Day Weather Overview
            <Badge variant="secondary">Daily Forecast</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyChartData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  dataKey="day" 
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  yAxisId="temp" 
                  orientation="left" 
                  tick={{ fontSize: 12 }}
                  label={{ value: 'Temperature (°C)', angle: -90, position: 'insideLeft' }}
                />
                <YAxis 
                  yAxisId="precipitation" 
                  orientation="right" 
                  tick={{ fontSize: 12 }}
                  label={{ value: 'Precipitation (mm)', angle: 90, position: 'insideRight' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar 
                  yAxisId="temp"
                  dataKey="tempMax" 
                  fill="hsl(var(--primary))" 
                  name="Max Temp (°C)"
                  radius={[4, 4, 0, 0]}
                />
                <Bar 
                  yAxisId="temp"
                  dataKey="tempMin" 
                  fill="hsl(var(--primary))" 
                  fillOpacity={0.5}
                  name="Min Temp (°C)"
                  radius={[4, 4, 0, 0]}
                />
                <Bar 
                  yAxisId="precipitation"
                  dataKey="precipitation" 
                  fill="hsl(210, 100%, 70%)" 
                  name="Precipitation (mm)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* UV Index & Atmospheric Pressure */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="shadow-elegant">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sun className="h-5 w-5 text-primary" />
              UV Index Forecast
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={hourlyChartData.filter((_, i) => i % 2 === 0)}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis 
                    dataKey="time" 
                    tick={{ fontSize: 12 }}
                    interval="preserveStartEnd"
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    label={{ value: 'UV Index', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area 
                    type="monotone" 
                    dataKey="uvIndex" 
                    stroke="hsl(48, 95%, 55%)" 
                    fill="hsl(48, 95%, 75%)"
                    fillOpacity={0.6}
                    name="UV Index"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-elegant">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gauge className="h-5 w-5 text-primary" />
              Atmospheric Pressure
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={hourlyChartData.filter((_, i) => i % 2 === 0)}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis 
                    dataKey="time" 
                    tick={{ fontSize: 12 }}
                    interval="preserveStartEnd"
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    label={{ value: 'Pressure (hPa)', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Line 
                    type="monotone" 
                    dataKey="pressure" 
                    stroke="hsl(120, 60%, 25%)" 
                    strokeWidth={2}
                    name="Pressure (hPa)"
                    dot={{ fill: "hsl(120, 60%, 25%)", strokeWidth: 2, r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};