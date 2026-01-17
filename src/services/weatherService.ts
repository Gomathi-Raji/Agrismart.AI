import { fetchWeatherApi } from 'openmeteo';
import { weatherCache } from '../utils/weatherCache';

// Weather condition mappings for better UX
export interface WeatherData {
  current: {
    time: Date;
    temperature_2m: number;
    relative_humidity_2m: number;
    apparent_temperature: number;
    is_day: number;
    precipitation: number;
    rain: number;
    showers: number;
    weather_code: number;
    pressure_msl: number;
    surface_pressure: number;
    cloud_cover: number;
    wind_speed_10m: number;
    wind_direction_10m: number;
    wind_gusts_10m: number;
  };
  minutely_15: {
    time: Date[];
    temperature_2m: Float32Array;
    relative_humidity_2m: Float32Array;
    dew_point_2m: Float32Array;
    apparent_temperature: Float32Array;
    precipitation: Float32Array;
    wind_gusts_10m: Float32Array;
    visibility: Float32Array;
    cape: Float32Array;
    lightning_potential: Float32Array;
    is_day: Float32Array;
    shortwave_radiation: Float32Array;
    direct_radiation: Float32Array;
    diffuse_radiation: Float32Array;
    direct_normal_irradiance: Float32Array;
    global_tilted_irradiance: Float32Array;
    terrestrial_radiation: Float32Array;
    sunshine_duration: Float32Array;
    freezing_level_height: Float32Array;
    snowfall_height: Float32Array;
    snowfall: Float32Array;
    rain: Float32Array;
    weather_code: Float32Array;
    wind_speed_10m: Float32Array;
    wind_speed_80m: Float32Array;
    wind_direction_10m: Float32Array;
    wind_direction_80m: Float32Array;
  };
  hourly: {
    time: Date[];
    temperature_2m: Float32Array;
    weather_code: Float32Array;
    wind_speed_10m: Float32Array;
    relative_humidity_2m: Float32Array;
    pressure_msl: Float32Array;
    wind_speed_80m: Float32Array;
    dew_point_2m: Float32Array;
    apparent_temperature: Float32Array;
    precipitation_probability: Float32Array;
    precipitation: Float32Array;
    surface_pressure: Float32Array;
    cloud_cover: Float32Array;
    cloud_cover_low: Float32Array;
    cloud_cover_mid: Float32Array;
    cloud_cover_high: Float32Array;
    rain: Float32Array;
    showers: Float32Array;
    snowfall: Float32Array;
    snow_depth: Float32Array;
    visibility: Float32Array;
    evapotranspiration: Float32Array;
    et0_fao_evapotranspiration: Float32Array;
    vapour_pressure_deficit: Float32Array;
    temperature_180m: Float32Array;
    temperature_120m: Float32Array;
    temperature_80m: Float32Array;
    wind_gusts_10m: Float32Array;
    wind_direction_180m: Float32Array;
    wind_direction_120m: Float32Array;
    wind_direction_80m: Float32Array;
    wind_direction_10m: Float32Array;
    wind_speed_180m: Float32Array;
    wind_speed_120m: Float32Array;
    soil_temperature_0cm: Float32Array;
    soil_temperature_6cm: Float32Array;
    soil_temperature_18cm: Float32Array;
    soil_temperature_54cm: Float32Array;
    soil_moisture_0_to_1cm: Float32Array;
    soil_moisture_1_to_3cm: Float32Array;
    soil_moisture_3_to_9cm: Float32Array;
    soil_moisture_9_to_27cm: Float32Array;
    soil_moisture_27_to_81cm: Float32Array;
    uv_index: Float32Array;
    uv_index_clear_sky: Float32Array;
    is_day: Float32Array;
    sunshine_duration: Float32Array;
    wet_bulb_temperature_2m: Float32Array;
    cape: Float32Array;
    lifted_index: Float32Array;
    convective_inhibition: Float32Array;
    freezing_level_height: Float32Array;
    boundary_layer_height: Float32Array;
    total_column_integrated_water_vapour: Float32Array;
    shortwave_radiation: Float32Array;
    direct_radiation: Float32Array;
    direct_normal_irradiance: Float32Array;
    terrestrial_radiation: Float32Array;
    global_tilted_irradiance: Float32Array;
    diffuse_radiation: Float32Array;
    direct_radiation_instant: Float32Array;
    shortwave_radiation_instant: Float32Array;
    diffuse_radiation_instant: Float32Array;
    direct_normal_irradiance_instant: Float32Array;
    global_tilted_irradiance_instant: Float32Array;
    terrestrial_radiation_instant: Float32Array;
  };
  daily: {
    time: Date[];
    weather_code: Float32Array;
    temperature_2m_max: Float32Array;
    temperature_2m_min: Float32Array;
    apparent_temperature_max: Float32Array;
    apparent_temperature_min: Float32Array;
    sunrise: Float32Array;
    sunset: Float32Array;
    daylight_duration: Float32Array;
    sunshine_duration: Float32Array;
    uv_index_max: Float32Array;
    uv_index_clear_sky_max: Float32Array;
    precipitation_sum: Float32Array;
    rain_sum: Float32Array;
    showers_sum: Float32Array;
    snowfall_sum: Float32Array;
    precipitation_hours: Float32Array;
    precipitation_probability_max: Float32Array;
    wind_speed_10m_max: Float32Array;
    wind_gusts_10m_max: Float32Array;
    wind_direction_10m_dominant: Float32Array;
    shortwave_radiation_sum: Float32Array;
    et0_fao_evapotranspiration: Float32Array;
  };
  location: {
    latitude: number;
    longitude: number;
    elevation: number;
    timezone: string;
    timezone_abbreviation: string;
    utc_offset_seconds: number;
  };
}

// Enhanced daily forecast interface
export interface DailyForecast {
  date: Date;
  weather_code: number;
  temperature_max: number;
  temperature_min: number;
  precipitation_sum: number;
  precipitation_probability: number;
  wind_speed_max: number;
  wind_direction: number;
  uv_index_max: number;
  sunrise: Date;
  sunset: Date;
  daylight_duration: number; // in hours
  agriculture_conditions: {
    irrigation_needed: boolean;
    spraying_suitable: boolean;
    field_work_suitable: boolean;
    frost_risk: boolean;
  };
}

// Enhanced hourly forecast interface
export interface HourlyForecast {
  time: Date;
  temperature: number;
  weatherCode: number;
  condition: string;
  precipitation: number;
  precipitationProbability: number;
  windSpeed: number;
  humidity: number;
  pressure: number;
  visibility: number;
  uvIndex: number;
  soilTemperature: number;
  soilMoisture: number;
  evapotranspiration: number;
}

// Agricultural recommendation interface
export interface AgricultureRecommendation {
  type: 'alert' | 'recommendation' | 'planning';
  category: 'temperature' | 'irrigation' | 'weather' | 'general';
  title: string;
  message: string;
  priority: 'high' | 'medium' | 'low';
  actionItems: string[];
}

export interface LocationData {
  latitude: number;
  longitude: number;
  address: string;
  timezone?: string;
  country?: string;
  region?: string;
}

export const getCurrentLocation = (): Promise<LocationData> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          // Use Mapbox reverse geocoding for better accuracy
          const MAPBOX_API_KEY = 'pk.eyJ1IjoiaGFyaXNod2FyYW4iLCJhIjoiY21hZHhwZGs2MDF4YzJxczh2aDd0cWg1MyJ9.qcu0lpqVlZlC2WFxhwb1Pg';
          const response = await fetch(
            `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${MAPBOX_API_KEY}`
          );
          const data = await response.json();
          const feature = data.features?.[0];
          const address = feature?.place_name || `${latitude.toFixed(6)}°N, ${longitude.toFixed(6)}°E`;
          
          // Extract additional location data
          const context = feature?.context || [];
          const country = context.find((c: { id: string; text: string }) => c.id.startsWith('country'))?.text || 'Unknown';
          const region = context.find((c: { id: string; text: string }) => c.id.startsWith('region'))?.text || 'Unknown';
          
          resolve({
            latitude,
            longitude,
            address,
            country,
            region
          });
        } catch (error) {
          console.error('Reverse geocoding error:', error);
          resolve({
            latitude,
            longitude,
            address: `${latitude.toFixed(6)}°N, ${longitude.toFixed(6)}°E`
          });
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        // Fallback to Chennai coordinates for Indian users
        resolve({
          latitude: 13.0827,
          longitude: 80.2707,
          address: 'Chennai, Tamil Nadu, India',
          country: 'India',
          region: 'Tamil Nadu'
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );
  });
};

// Enhanced weather data fetching with 7-day forecast and caching
export const getWeatherData = async (latitude: number, longitude: number): Promise<WeatherData> => {
  // Check cache first
  const cachedData = weatherCache.get(latitude, longitude);
  if (cachedData) {
    return cachedData;
  }

  console.log('Fetching fresh weather data from API for:', latitude, longitude);

  const params = {
    latitude,
    longitude,
    // Current weather
    current: [
      "temperature_2m", "relative_humidity_2m", "apparent_temperature", "is_day", 
      "precipitation", "rain", "showers", "weather_code", "pressure_msl", 
      "surface_pressure", "cloud_cover", "wind_speed_10m", "wind_direction_10m", "wind_gusts_10m"
    ],
    // Hourly data for detailed analysis
    hourly: [
      "temperature_2m", "weather_code", "wind_speed_10m", "relative_humidity_2m", 
      "pressure_msl", "wind_speed_80m", "dew_point_2m", "apparent_temperature", 
      "precipitation_probability", "precipitation", "surface_pressure", "cloud_cover", 
      "cloud_cover_low", "cloud_cover_mid", "cloud_cover_high", "rain", "showers", 
      "snowfall", "snow_depth", "visibility", "evapotranspiration", "et0_fao_evapotranspiration", 
      "vapour_pressure_deficit", "temperature_180m", "temperature_120m", "temperature_80m", 
      "wind_gusts_10m", "wind_direction_180m", "wind_direction_120m", "wind_direction_80m", 
      "wind_direction_10m", "wind_speed_180m", "wind_speed_120m", "soil_temperature_0cm", 
      "soil_temperature_6cm", "soil_temperature_18cm", "soil_temperature_54cm", 
      "soil_moisture_0_to_1cm", "soil_moisture_1_to_3cm", "soil_moisture_3_to_9cm", 
      "soil_moisture_9_to_27cm", "soil_moisture_27_to_81cm", "uv_index", "uv_index_clear_sky", 
      "is_day", "sunshine_duration", "wet_bulb_temperature_2m", "cape", "lifted_index", 
      "convective_inhibition", "freezing_level_height", "boundary_layer_height", 
      "total_column_integrated_water_vapour", "shortwave_radiation", "direct_radiation", 
      "direct_normal_irradiance", "terrestrial_radiation", "global_tilted_irradiance", 
      "diffuse_radiation", "direct_radiation_instant", "shortwave_radiation_instant", 
      "diffuse_radiation_instant", "direct_normal_irradiance_instant", 
      "global_tilted_irradiance_instant", "terrestrial_radiation_instant"
    ],
    // Daily data for 7-day forecast
    daily: [
      "weather_code", "temperature_2m_max", "temperature_2m_min", "apparent_temperature_max", 
      "apparent_temperature_min", "sunrise", "sunset", "daylight_duration", "sunshine_duration", 
      "uv_index_max", "uv_index_clear_sky_max", "precipitation_sum", "rain_sum", "showers_sum", 
      "snowfall_sum", "precipitation_hours", "precipitation_probability_max", 
      "wind_speed_10m_max", "wind_gusts_10m_max", "wind_direction_10m_dominant", 
      "shortwave_radiation_sum", "et0_fao_evapotranspiration"
    ],
    // Minutely data for short-term precision
    minutely_15: [
      "temperature_2m", "relative_humidity_2m", "dew_point_2m", "apparent_temperature", 
      "precipitation", "wind_gusts_10m", "visibility", "cape", "lightning_potential", 
      "is_day", "shortwave_radiation", "direct_radiation", "diffuse_radiation", 
      "direct_normal_irradiance", "global_tilted_irradiance", "terrestrial_radiation", 
      "global_tilted_irradiance_instant", "terrestrial_radiation_instant", 
      "direct_normal_irradiance_instant", "diffuse_radiation_instant", 
      "direct_radiation_instant", "shortwave_radiation_instant", "sunshine_duration", 
      "freezing_level_height", "snowfall_height", "snowfall", "rain", "weather_code", 
      "wind_speed_10m", "wind_speed_80m", "wind_direction_10m", "wind_direction_80m"
    ],
    past_days: 7,        // 7 days of historical data
    forecast_days: 7,    // 7 days of forecast
    timezone: "auto",    // Automatic timezone detection
    temperature_unit: "celsius",
    wind_speed_unit: "kmh",
    precipitation_unit: "mm"
  };

  const url = "https://api.open-meteo.com/v1/forecast";
  const responses = await fetchWeatherApi(url, params);

  // Process first location
  const response = responses[0];

  // Enhanced attributes for timezone and location
  const responseLatitude = response.latitude();
  const responseLongitude = response.longitude();
  const elevation = response.elevation();
  const utcOffsetSeconds = response.utcOffsetSeconds();
  const timezone = response.timezone();
  const timezoneAbbreviation = response.timezoneAbbreviation();

  const current = response.current()!;
  const minutely15 = response.minutely15()!;
  const hourly = response.hourly()!;
  const daily = response.daily()!;

  // Enhanced weather data with proper timezone handling
  const weatherData: WeatherData = {
    current: {
      time: new Date((Number(current.time()) + utcOffsetSeconds) * 1000),
      temperature_2m: current.variables(0)!.value(),
      relative_humidity_2m: current.variables(1)!.value(),
      apparent_temperature: current.variables(2)!.value(),
      is_day: current.variables(3)!.value(),
      precipitation: current.variables(4)!.value(),
      rain: current.variables(5)!.value(),
      showers: current.variables(6)!.value(),
      weather_code: current.variables(7)!.value(),
      pressure_msl: current.variables(8)!.value(),
      surface_pressure: current.variables(9)!.value(),
      cloud_cover: current.variables(10)!.value(),
      wind_speed_10m: current.variables(11)!.value(),
      wind_direction_10m: current.variables(12)!.value(),
      wind_gusts_10m: current.variables(13)!.value(),
    },
    minutely_15: {
      time: [...Array((Number(minutely15.timeEnd()) - Number(minutely15.time())) / minutely15.interval())].map(
        (_, i) => new Date((Number(minutely15.time()) + i * minutely15.interval() + utcOffsetSeconds) * 1000)
      ),
      temperature_2m: minutely15.variables(0)!.valuesArray(),
      relative_humidity_2m: minutely15.variables(1)!.valuesArray(),
      dew_point_2m: minutely15.variables(2)!.valuesArray(),
      apparent_temperature: minutely15.variables(3)!.valuesArray(),
      precipitation: minutely15.variables(4)!.valuesArray(),
      wind_gusts_10m: minutely15.variables(5)!.valuesArray(),
      visibility: minutely15.variables(6)!.valuesArray(),
      cape: minutely15.variables(7)!.valuesArray(),
      lightning_potential: minutely15.variables(8)!.valuesArray(),
      is_day: minutely15.variables(9)!.valuesArray(),
      shortwave_radiation: minutely15.variables(10)!.valuesArray(),
      direct_radiation: minutely15.variables(11)!.valuesArray(),
      diffuse_radiation: minutely15.variables(12)!.valuesArray(),
      direct_normal_irradiance: minutely15.variables(13)!.valuesArray(),
      global_tilted_irradiance: minutely15.variables(14)!.valuesArray(),
      terrestrial_radiation: minutely15.variables(15)!.valuesArray(),
      sunshine_duration: minutely15.variables(22)!.valuesArray(),
      freezing_level_height: minutely15.variables(23)!.valuesArray(),
      snowfall_height: minutely15.variables(24)!.valuesArray(),
      snowfall: minutely15.variables(25)!.valuesArray(),
      rain: minutely15.variables(26)!.valuesArray(),
      weather_code: minutely15.variables(27)!.valuesArray(),
      wind_speed_10m: minutely15.variables(28)!.valuesArray(),
      wind_speed_80m: minutely15.variables(29)!.valuesArray(),
      wind_direction_10m: minutely15.variables(30)!.valuesArray(),
      wind_direction_80m: minutely15.variables(31)!.valuesArray(),
    },
    hourly: {
      time: [...Array((Number(hourly.timeEnd()) - Number(hourly.time())) / hourly.interval())].map(
        (_, i) => new Date((Number(hourly.time()) + i * hourly.interval() + utcOffsetSeconds) * 1000)
      ),
      temperature_2m: hourly.variables(0)!.valuesArray(),
      weather_code: hourly.variables(1)!.valuesArray(),
      wind_speed_10m: hourly.variables(2)!.valuesArray(),
      relative_humidity_2m: hourly.variables(3)!.valuesArray(),
      pressure_msl: hourly.variables(4)!.valuesArray(),
      wind_speed_80m: hourly.variables(5)!.valuesArray(),
      dew_point_2m: hourly.variables(6)!.valuesArray(),
      apparent_temperature: hourly.variables(7)!.valuesArray(),
      precipitation_probability: hourly.variables(8)!.valuesArray(),
      precipitation: hourly.variables(9)!.valuesArray(),
      surface_pressure: hourly.variables(10)!.valuesArray(),
      cloud_cover: hourly.variables(11)!.valuesArray(),
      cloud_cover_low: hourly.variables(12)!.valuesArray(),
      cloud_cover_mid: hourly.variables(13)!.valuesArray(),
      cloud_cover_high: hourly.variables(14)!.valuesArray(),
      rain: hourly.variables(15)!.valuesArray(),
      showers: hourly.variables(16)!.valuesArray(),
      snowfall: hourly.variables(17)!.valuesArray(),
      snow_depth: hourly.variables(18)!.valuesArray(),
      visibility: hourly.variables(19)!.valuesArray(),
      evapotranspiration: hourly.variables(20)!.valuesArray(),
      et0_fao_evapotranspiration: hourly.variables(21)!.valuesArray(),
      vapour_pressure_deficit: hourly.variables(22)!.valuesArray(),
      temperature_180m: hourly.variables(23)!.valuesArray(),
      temperature_120m: hourly.variables(24)!.valuesArray(),
      temperature_80m: hourly.variables(25)!.valuesArray(),
      wind_gusts_10m: hourly.variables(26)!.valuesArray(),
      wind_direction_180m: hourly.variables(27)!.valuesArray(),
      wind_direction_120m: hourly.variables(28)!.valuesArray(),
      wind_direction_80m: hourly.variables(29)!.valuesArray(),
      wind_direction_10m: hourly.variables(30)!.valuesArray(),
      wind_speed_180m: hourly.variables(31)!.valuesArray(),
      wind_speed_120m: hourly.variables(32)!.valuesArray(),
      soil_temperature_0cm: hourly.variables(33)!.valuesArray(),
      soil_temperature_6cm: hourly.variables(34)!.valuesArray(),
      soil_temperature_18cm: hourly.variables(35)!.valuesArray(),
      soil_temperature_54cm: hourly.variables(36)!.valuesArray(),
      soil_moisture_0_to_1cm: hourly.variables(37)!.valuesArray(),
      soil_moisture_1_to_3cm: hourly.variables(38)!.valuesArray(),
      soil_moisture_3_to_9cm: hourly.variables(39)!.valuesArray(),
      soil_moisture_9_to_27cm: hourly.variables(40)!.valuesArray(),
      soil_moisture_27_to_81cm: hourly.variables(41)!.valuesArray(),
      uv_index: hourly.variables(42)!.valuesArray(),
      uv_index_clear_sky: hourly.variables(43)!.valuesArray(),
      is_day: hourly.variables(44)!.valuesArray(),
      sunshine_duration: hourly.variables(45)!.valuesArray(),
      wet_bulb_temperature_2m: hourly.variables(46)!.valuesArray(),
      cape: hourly.variables(47)!.valuesArray(),
      lifted_index: hourly.variables(48)!.valuesArray(),
      convective_inhibition: hourly.variables(49)!.valuesArray(),
      freezing_level_height: hourly.variables(50)!.valuesArray(),
      boundary_layer_height: hourly.variables(51)!.valuesArray(),
      total_column_integrated_water_vapour: hourly.variables(52)!.valuesArray(),
      shortwave_radiation: hourly.variables(53)!.valuesArray(),
      direct_radiation: hourly.variables(54)!.valuesArray(),
      direct_normal_irradiance: hourly.variables(55)!.valuesArray(),
      terrestrial_radiation: hourly.variables(56)!.valuesArray(),
      global_tilted_irradiance: hourly.variables(57)!.valuesArray(),
      diffuse_radiation: hourly.variables(58)!.valuesArray(),
      direct_radiation_instant: hourly.variables(59)!.valuesArray(),
      shortwave_radiation_instant: hourly.variables(60)!.valuesArray(),
      diffuse_radiation_instant: hourly.variables(61)!.valuesArray(),
      direct_normal_irradiance_instant: hourly.variables(62)!.valuesArray(),
      global_tilted_irradiance_instant: hourly.variables(63)!.valuesArray(),
      terrestrial_radiation_instant: hourly.variables(64)!.valuesArray(),
    },
    daily: {
      time: [...Array((Number(daily.timeEnd()) - Number(daily.time())) / 86400)].map(
        (_, i) => new Date((Number(daily.time()) + i * 86400 + utcOffsetSeconds) * 1000)
      ),
      weather_code: daily.variables(0)!.valuesArray(),
      temperature_2m_max: daily.variables(1)!.valuesArray(),
      temperature_2m_min: daily.variables(2)!.valuesArray(),
      apparent_temperature_max: daily.variables(3)!.valuesArray(),
      apparent_temperature_min: daily.variables(4)!.valuesArray(),
      sunrise: daily.variables(5)!.valuesArray(),
      sunset: daily.variables(6)!.valuesArray(),
      daylight_duration: daily.variables(7)!.valuesArray(),
      sunshine_duration: daily.variables(8)!.valuesArray(),
      uv_index_max: daily.variables(9)!.valuesArray(),
      uv_index_clear_sky_max: daily.variables(10)!.valuesArray(),
      precipitation_sum: daily.variables(11)!.valuesArray(),
      rain_sum: daily.variables(12)!.valuesArray(),
      showers_sum: daily.variables(13)!.valuesArray(),
      snowfall_sum: daily.variables(14)!.valuesArray(),
      precipitation_hours: daily.variables(15)!.valuesArray(),
      precipitation_probability_max: daily.variables(16)!.valuesArray(),
      wind_speed_10m_max: daily.variables(17)!.valuesArray(),
      wind_gusts_10m_max: daily.variables(18)!.valuesArray(),
      wind_direction_10m_dominant: daily.variables(19)!.valuesArray(),
      shortwave_radiation_sum: daily.variables(20)!.valuesArray(),
      et0_fao_evapotranspiration: daily.variables(21)!.valuesArray(),
    },
    location: {
      latitude: responseLatitude,
      longitude: responseLongitude,
      elevation: elevation,
      timezone: timezone,
      timezone_abbreviation: timezoneAbbreviation,
      utc_offset_seconds: utcOffsetSeconds,
    }
  };

  // Cache the fresh data
  weatherCache.set(latitude, longitude, weatherData);

  return weatherData;
};

// Generate agricultural recommendations based on weather data
export const generateAgricultureRecommendations = (weatherData: WeatherData): AgricultureRecommendation[] => {
  const recommendations: AgricultureRecommendation[] = [];
  const currentTemp = weatherData.current.temperature_2m;
  const currentHumidity = weatherData.current.relative_humidity_2m;
  const currentPrecipitation = weatherData.current.precipitation;
  const currentWindSpeed = weatherData.current.wind_speed_10m;
  const dailyData = weatherData.daily;

  // High temperature alert
  if (currentTemp > 35) {
    recommendations.push({
      type: 'alert',
      category: 'temperature',
      title: 'High Temperature Alert',
      message: 'Extreme heat conditions. Ensure adequate irrigation and consider shade protection for sensitive crops.',
      priority: 'high',
      actionItems: [
        'Increase irrigation frequency',
        'Apply mulching to conserve soil moisture',
        'Provide shade nets for delicate plants',
        'Avoid spraying chemicals during peak hours'
      ]
    });
  }

  // Low temperature alert
  if (currentTemp < 5) {
    recommendations.push({
      type: 'alert',
      category: 'temperature',
      title: 'Cold Weather Alert',
      message: 'Risk of frost damage. Protect sensitive crops and consider covering young plants.',
      priority: 'high',
      actionItems: [
        'Cover sensitive crops with frost cloth',
        'Use water sprinklers for frost protection',
        'Delay planting of warm-season crops',
        'Harvest mature crops before damage occurs'
      ]
    });
  }

  // Precipitation recommendations
  if (currentPrecipitation > 10) {
    recommendations.push({
      type: 'recommendation',
      category: 'irrigation',
      title: 'Heavy Rainfall Advisory',
      message: 'Significant rainfall detected. Monitor field drainage and adjust irrigation schedules.',
      priority: 'medium',
      actionItems: [
        'Ensure proper field drainage',
        'Reduce or skip irrigation for 24-48 hours',
        'Check for waterlogging in low areas',
        'Apply fungicides if humidity remains high'
      ]
    });
  } else if (currentPrecipitation === 0 && currentHumidity < 40) {
    recommendations.push({
      type: 'recommendation',
      category: 'irrigation',
      title: 'Dry Conditions',
      message: 'Low humidity and no precipitation. Increase irrigation and monitor soil moisture.',
      priority: 'medium',
      actionItems: [
        'Increase irrigation frequency',
        'Check soil moisture levels',
        'Apply organic mulch to retain moisture',
        'Consider drip irrigation for efficiency'
      ]
    });
  }

  // Wind speed recommendations
  if (currentWindSpeed > 15) {
    recommendations.push({
      type: 'alert',
      category: 'weather',
      title: 'High Wind Advisory',
      message: 'Strong winds may damage crops and affect spraying operations.',
      priority: 'medium',
      actionItems: [
        'Avoid pesticide/fertilizer spraying',
        'Secure loose structures and equipment',
        'Check and repair plant supports',
        'Delay drone operations'
      ]
    });
  }

  // UV Index recommendations
  const todayUVIndex = dailyData.uv_index_max[0];
  if (todayUVIndex > 8) {
    recommendations.push({
      type: 'recommendation',
      category: 'general',
      title: 'High UV Index',
      message: 'Very high UV levels detected. Protect workers and consider timing of outdoor activities.',
      priority: 'medium',
      actionItems: [
        'Schedule field work for early morning or evening',
        'Ensure workers use sun protection',
        'Consider UV-protective covering for sensitive crops',
        'Monitor for heat stress in plants'
      ]
    });
  }

  // Weekly forecast recommendations
  const weeklyRainSum = dailyData.precipitation_sum.slice(0, 7).reduce((sum, rain) => sum + rain, 0);
  if (weeklyRainSum > 50) {
    recommendations.push({
      type: 'planning',
      category: 'irrigation',
      title: 'Week Ahead: High Rainfall Expected',
      message: 'Significant rainfall expected this week. Plan irrigation and field activities accordingly.',
      priority: 'low',
      actionItems: [
        'Reduce planned irrigation schedules',
        'Prepare drainage systems',
        'Plan harvesting before heavy rain days',
        'Stock up on fungicides for disease prevention'
      ]
    });
  } else if (weeklyRainSum < 5) {
    recommendations.push({
      type: 'planning',
      category: 'irrigation',
      title: 'Week Ahead: Dry Conditions Expected',
      message: 'Low rainfall expected this week. Plan for increased irrigation needs.',
      priority: 'low',
      actionItems: [
        'Schedule additional irrigation',
        'Check irrigation system functionality',
        'Consider water conservation techniques',
        'Monitor soil moisture more frequently'
      ]
    });
  }

  return recommendations;
};

// Process daily forecast data for enhanced visualization
export const processDailyForecast = (weatherData: WeatherData): DailyForecast[] => {
  const dailyForecasts: DailyForecast[] = [];
  
  // Ensure daily data exists
  if (!weatherData?.daily?.time) {
    console.warn('Daily weather data is not available');
    return [];
  }
  
  for (let i = 0; i < Math.min(weatherData.daily.time.length, 7); i++) {
    try {
      const date = weatherData.daily.time[i];
      const sunrise = weatherData.daily.sunrise?.[i] ? new Date(weatherData.daily.sunrise[i] * 1000) : new Date();
      const sunset = weatherData.daily.sunset?.[i] ? new Date(weatherData.daily.sunset[i] * 1000) : new Date();
      
      const forecast: DailyForecast = {
        date,
        weather_code: weatherData.daily.weather_code?.[i] || 0,
        temperature_max: weatherData.daily.temperature_2m_max?.[i] || 0,
        temperature_min: weatherData.daily.temperature_2m_min?.[i] || 0,
        precipitation_sum: weatherData.daily.precipitation_sum?.[i] || 0,
        precipitation_probability: weatherData.daily.precipitation_probability_max?.[i] || 0,
        wind_speed_max: weatherData.daily.wind_speed_10m_max?.[i] || 0,
        wind_direction: weatherData.daily.wind_direction_10m_dominant?.[i] || 0,
        uv_index_max: weatherData.daily.uv_index_max?.[i] || 0,
        sunrise,
        sunset,
        daylight_duration: (weatherData.daily.daylight_duration?.[i] || 0) / 3600, // Convert to hours
        agriculture_conditions: {
          irrigation_needed: (weatherData.daily.precipitation_sum?.[i] || 0) < 2 && (weatherData.daily.et0_fao_evapotranspiration?.[i] || 0) > 4,
          spraying_suitable: (weatherData.daily.wind_speed_10m_max?.[i] || 0) < 10 && (weatherData.daily.precipitation_probability_max?.[i] || 0) < 30,
          field_work_suitable: (weatherData.daily.precipitation_sum?.[i] || 0) < 1 && (weatherData.daily.wind_speed_10m_max?.[i] || 0) < 15,
          frost_risk: (weatherData.daily.temperature_2m_min?.[i] || 0) < 2
        }
      };
      
      dailyForecasts.push(forecast);
    } catch (error) {
      console.error(`Error processing daily forecast for day ${i}:`, error);
      // Continue processing other days
    }
  }
  
  return dailyForecasts;
};

// Cache management utilities
export const clearWeatherCache = (): void => {
  weatherCache.clear();
};

export const getWeatherCacheStats = () => {
  return weatherCache.getStats();
};

export const updateWeatherCacheConfig = (config: Partial<import('../utils/weatherCache').CacheConfig>): void => {
  weatherCache.updateConfig(config);
};

// Weather code to condition mapping
export const getWeatherCondition = (code: number): { condition: string; icon: string } => {
  const weatherCodes: Record<number, { condition: string; icon: string }> = {
    0: { condition: "Clear sky", icon: "sun" },
    1: { condition: "Mainly clear", icon: "sun" },
    2: { condition: "Partly cloudy", icon: "cloud" },
    3: { condition: "Overcast", icon: "cloud" },
    45: { condition: "Fog", icon: "cloud" },
    48: { condition: "Depositing rime fog", icon: "cloud" },
    51: { condition: "Light drizzle", icon: "cloud-rain" },
    53: { condition: "Moderate drizzle", icon: "cloud-rain" },
    55: { condition: "Dense drizzle", icon: "cloud-rain" },
    56: { condition: "Light freezing drizzle", icon: "cloud-rain" },
    57: { condition: "Dense freezing drizzle", icon: "cloud-rain" },
    61: { condition: "Slight rain", icon: "cloud-rain" },
    63: { condition: "Moderate rain", icon: "cloud-rain" },
    65: { condition: "Heavy rain", icon: "cloud-rain" },
    66: { condition: "Light freezing rain", icon: "cloud-rain" },
    67: { condition: "Heavy freezing rain", icon: "cloud-rain" },
    71: { condition: "Slight snow fall", icon: "cloud-snow" },
    73: { condition: "Moderate snow fall", icon: "cloud-snow" },
    75: { condition: "Heavy snow fall", icon: "cloud-snow" },
    77: { condition: "Snow grains", icon: "cloud-snow" },
    80: { condition: "Slight rain showers", icon: "cloud-rain" },
    81: { condition: "Moderate rain showers", icon: "cloud-rain" },
    82: { condition: "Violent rain showers", icon: "cloud-rain" },
    85: { condition: "Slight snow showers", icon: "cloud-snow" },
    86: { condition: "Heavy snow showers", icon: "cloud-snow" },
    95: { condition: "Thunderstorm", icon: "zap" },
    96: { condition: "Thunderstorm with slight hail", icon: "zap" },
    99: { condition: "Thunderstorm with heavy hail", icon: "zap" },
  };

  return weatherCodes[code] || { condition: "Unknown", icon: "cloud" };
};