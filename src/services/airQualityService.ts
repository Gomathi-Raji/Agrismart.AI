export interface AirQualityData {
  location: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  measurements: {
    parameter: string;
    value: number;
    unit: string;
    lastUpdated: Date;
    sourceName: string;
  }[];
  overall: {
    aqi: number;
    category: string;
    color: string;
    dominantPollutant: string;
  };
  pollutants: {
    pm25?: number;
    pm10?: number;
    o3?: number;
    no2?: number;
    so2?: number;
    co?: number;
  };
  health: {
    recommendations: string[];
    riskLevel: 'low' | 'moderate' | 'high' | 'very_high';
    sensitiveGroups: string[];
  };
  sources: {
    industry: number;
    traffic: number;
    residential: number;
    agriculture: number;
    natural: number;
  };
}

export interface AirQualityAlert {
  type: 'warning' | 'alert' | 'emergency';
  title: string;
  message: string;
  affectedPollutants: string[];
  recommendations: string[];
  duration: string;
}

interface OpenAQMeasurement {
  parameter: string;
  value: number;
  unit: string;
  date: {
    utc: string;
  };
  sourceName?: string;
}

interface PollutantLevels {
  pm25?: number;
  pm10?: number;
  o3?: number;
  no2?: number;
  so2?: number;
  co?: number;
}

// OpenAQ API integration
export const getAirQualityData = async (latitude: number, longitude: number): Promise<AirQualityData> => {
  try {
    // Find nearest air quality monitoring station
    const stationsResponse = await fetch(
      `https://api.openaq.org/v2/locations?coordinates=${latitude},${longitude}&radius=50000&limit=5&order_by=distance`
    );

    if (!stationsResponse.ok) {
      throw new Error('Failed to fetch air quality stations');
    }

    const stationsData = await stationsResponse.json();
    const nearestStation = stationsData.results?.[0];

    if (!nearestStation) {
      throw new Error('No air quality monitoring stations found nearby');
    }

    // Get latest measurements for the nearest station
    const measurementsResponse = await fetch(
      `https://api.openaq.org/v2/measurements?location_id=${nearestStation.id}&limit=100&order_by=datetime`
    );

    if (!measurementsResponse.ok) {
      throw new Error('Failed to fetch air quality measurements');
    }

    const measurementsData = await measurementsResponse.json();

    // Process measurements
    const measurements = measurementsData.results || [];
    const latestMeasurements: { [key: string]: OpenAQMeasurement } = {};

    // Group by parameter and get latest value
    measurements.forEach((measurement: OpenAQMeasurement) => {
      const param = measurement.parameter;
      if (!latestMeasurements[param] || new Date(measurement.date.utc) > new Date(latestMeasurements[param].date.utc)) {
        latestMeasurements[param] = measurement;
      }
    });

    // Calculate AQI and category
    const pollutants = {
      pm25: latestMeasurements.pm25?.value || null,
      pm10: latestMeasurements.pm10?.value || null,
      o3: latestMeasurements.o3?.value || null,
      no2: latestMeasurements.no2?.value || null,
      so2: latestMeasurements.so2?.value || null,
      co: latestMeasurements.co?.value || null,
    };

    const { aqi, category, color, dominantPollutant } = calculateAQI(pollutants);

    // Generate health recommendations based on AQI
    const health = generateHealthRecommendations(aqi, category);

    // Estimate emission sources (simplified model based on location and pollutants)
    const sources = estimateEmissionSources(latitude, longitude, pollutants);

    return {
      location: nearestStation.name || 'Unknown Location',
      coordinates: {
        latitude: nearestStation.coordinates?.latitude || latitude,
        longitude: nearestStation.coordinates?.longitude || longitude,
      },
      measurements: Object.values(latestMeasurements).map((measurement: OpenAQMeasurement) => ({
        parameter: measurement.parameter,
        value: measurement.value,
        unit: measurement.unit,
        lastUpdated: new Date(measurement.date.utc),
        sourceName: measurement.sourceName || 'Unknown',
      })),
      overall: {
        aqi,
        category,
        color,
        dominantPollutant,
      },
      pollutants,
      health,
      sources,
    };
  } catch (error) {
    console.error('OpenAQ API error:', error);
    // Return fallback data
    return {
      location: 'Unknown Location',
      coordinates: { latitude, longitude },
      measurements: [],
      overall: {
        aqi: 25,
        category: 'Good',
        color: '#00e400',
        dominantPollutant: 'None',
      },
      pollutants: {},
      health: {
        recommendations: ['Air quality data temporarily unavailable'],
        riskLevel: 'low',
        sensitiveGroups: [],
      },
      sources: {
        industry: 0,
        traffic: 0,
        residential: 0,
        agriculture: 0,
        natural: 0,
      },
    };
  }
};

// Calculate Air Quality Index based on US EPA standards
const calculateAQI = (pollutants: PollutantLevels) => {
  let maxAQI = 0;
  let dominantPollutant = 'None';

  // PM2.5 breakpoints
  if (pollutants.pm25 !== null) {
    const pm25 = pollutants.pm25;
    let pm25AQI = 0;

    if (pm25 <= 12.0) pm25AQI = Math.round((50 - 0) / (12.0 - 0) * (pm25 - 0) + 0);
    else if (pm25 <= 35.4) pm25AQI = Math.round((100 - 51) / (35.4 - 12.1) * (pm25 - 12.1) + 51);
    else if (pm25 <= 55.4) pm25AQI = Math.round((150 - 101) / (55.4 - 35.5) * (pm25 - 35.5) + 101);
    else if (pm25 <= 150.4) pm25AQI = Math.round((200 - 151) / (150.4 - 55.5) * (pm25 - 55.5) + 151);
    else if (pm25 <= 250.4) pm25AQI = Math.round((300 - 201) / (250.4 - 150.5) * (pm25 - 150.5) + 201);
    else if (pm25 <= 350.4) pm25AQI = Math.round((400 - 301) / (350.4 - 250.5) * (pm25 - 250.5) + 301);
    else pm25AQI = Math.round((500 - 401) / (500.4 - 350.5) * (pm25 - 350.5) + 401);

    if (pm25AQI > maxAQI) {
      maxAQI = pm25AQI;
      dominantPollutant = 'PM2.5';
    }
  }

  // PM10 breakpoints
  if (pollutants.pm10 !== null) {
    const pm10 = pollutants.pm10;
    let pm10AQI = 0;

    if (pm10 <= 54) pm10AQI = Math.round((50 - 0) / (54 - 0) * (pm10 - 0) + 0);
    else if (pm10 <= 154) pm10AQI = Math.round((100 - 51) / (154 - 55) * (pm10 - 55) + 51);
    else if (pm10 <= 254) pm10AQI = Math.round((150 - 101) / (254 - 155) * (pm10 - 155) + 101);
    else if (pm10 <= 354) pm10AQI = Math.round((200 - 151) / (354 - 255) * (pm10 - 255) + 151);
    else if (pm10 <= 424) pm10AQI = Math.round((300 - 201) / (424 - 355) * (pm10 - 355) + 201);
    else if (pm10 <= 504) pm10AQI = Math.round((400 - 301) / (504 - 425) * (pm10 - 425) + 301);
    else pm10AQI = Math.round((500 - 401) / (604 - 505) * (pm10 - 505) + 401);

    if (pm10AQI > maxAQI) {
      maxAQI = pm10AQI;
      dominantPollutant = 'PM10';
    }
  }

  // O3 (8-hour average would be better, but using 1-hour for simplicity)
  if (pollutants.o3 !== null) {
    const o3 = pollutants.o3;
    let o3AQI = 0;

    if (o3 <= 0.054) o3AQI = Math.round((50 - 0) / (0.054 - 0) * (o3 - 0) + 0);
    else if (o3 <= 0.070) o3AQI = Math.round((100 - 51) / (0.070 - 0.055) * (o3 - 0.055) + 51);
    else if (o3 <= 0.085) o3AQI = Math.round((150 - 101) / (0.085 - 0.071) * (o3 - 0.071) + 101);
    else if (o3 <= 0.105) o3AQI = Math.round((200 - 151) / (0.105 - 0.086) * (o3 - 0.086) + 151);
    else o3AQI = 300; // Simplified for higher values

    if (o3AQI > maxAQI) {
      maxAQI = o3AQI;
      dominantPollutant = 'O3';
    }
  }

  // Determine category and color
  let category: string;
  let color: string;

  if (maxAQI <= 50) {
    category = 'Good';
    color = '#00e400';
  } else if (maxAQI <= 100) {
    category = 'Moderate';
    color = '#ffff00';
  } else if (maxAQI <= 150) {
    category = 'Unhealthy for Sensitive Groups';
    color = '#ff7e00';
  } else if (maxAQI <= 200) {
    category = 'Unhealthy';
    color = '#ff0000';
  } else if (maxAQI <= 300) {
    category = 'Very Unhealthy';
    color = '#8f3f97';
  } else {
    category = 'Hazardous';
    color = '#7e0023';
  }

  return { aqi: maxAQI, category, color, dominantPollutant };
};

// Generate health recommendations based on AQI
const generateHealthRecommendations = (aqi: number, category: string) => {
  let recommendations: string[] = [];
  let riskLevel: 'low' | 'moderate' | 'high' | 'very_high' = 'low';
  let sensitiveGroups: string[] = [];

  if (aqi <= 50) {
    recommendations = [
      'Air quality is good. No special precautions needed.',
      'Enjoy outdoor activities.',
      'Open windows for ventilation.'
    ];
    riskLevel = 'low';
  } else if (aqi <= 100) {
    recommendations = [
      'Air quality is acceptable. Sensitive individuals should consider limiting prolonged outdoor exertion.',
      'Keep windows closed during peak pollution hours.',
      'Consider using air purifiers indoors.'
    ];
    riskLevel = 'moderate';
    sensitiveGroups = ['People with respiratory issues', 'Children', 'Elderly'];
  } else if (aqi <= 150) {
    recommendations = [
      'Members of sensitive groups may experience health effects.',
      'Limit outdoor activities, especially for children and elderly.',
      'Wear masks when outdoors.',
      'Keep windows closed and use air conditioning.'
    ];
    riskLevel = 'high';
    sensitiveGroups = ['Children', 'Elderly', 'People with heart or lung disease', 'Pregnant women'];
  } else if (aqi <= 200) {
    recommendations = [
      'Everyone may begin to experience health effects.',
      'Avoid outdoor activities.',
      'Stay indoors with windows closed.',
      'Use air purifiers and masks.',
      'Limit physical exertion.'
    ];
    riskLevel = 'high';
    sensitiveGroups = ['All individuals'];
  } else {
    recommendations = [
      'Health alert: everyone may experience serious health effects.',
      'Avoid all outdoor activities.',
      'Stay indoors with air filtration.',
      'Seek medical attention if experiencing symptoms.',
      'Follow local health authority guidelines.'
    ];
    riskLevel = 'very_high';
    sensitiveGroups = ['All individuals'];
  }

  return { recommendations, riskLevel, sensitiveGroups };
};

// Estimate emission sources based on location and pollutants
const estimateEmissionSources = (latitude: number, longitude: number, pollutants: PollutantLevels) => {
  // Simplified estimation based on location type and pollutant levels
  // In a real implementation, this would use more sophisticated models

  let industry = 20;
  let traffic = 25;
  let residential = 30;
  let agriculture = 15;
  const natural = 10;

  // Adjust based on pollutant levels
  if (pollutants.no2 && pollutants.no2 > 40) {
    traffic += 20; // High NO2 indicates traffic pollution
    industry -= 10;
  }

  if (pollutants.so2 && pollutants.so2 > 20) {
    industry += 25; // High SO2 indicates industrial pollution
    traffic -= 15;
  }

  if (pollutants.pm25 && pollutants.pm25 > 35) {
    residential += 15; // High PM2.5 can indicate residential heating/cooking
    agriculture -= 10;
  }

  // Rural vs urban adjustment (simplified)
  const isLikelyUrban = Math.abs(latitude - 13.0827) < 1 && Math.abs(longitude - 80.2707) < 1; // Near Chennai
  if (isLikelyUrban) {
    traffic += 15;
    industry += 10;
    agriculture -= 15;
    residential += 5;
  } else {
    agriculture += 20;
    traffic -= 10;
    industry -= 15;
    residential -= 5;
  }

  // Normalize to 100%
  const total = industry + traffic + residential + agriculture + natural;
  return {
    industry: Math.round((industry / total) * 100),
    traffic: Math.round((traffic / total) * 100),
    residential: Math.round((residential / total) * 100),
    agriculture: Math.round((agriculture / total) * 100),
    natural: Math.round((natural / total) * 100),
  };
};

// Generate air quality alerts
export const generateAirQualityAlerts = (airQualityData: AirQualityData): AirQualityAlert[] => {
  const alerts: AirQualityAlert[] = [];

  if (airQualityData.overall.aqi > 150) {
    alerts.push({
      type: 'emergency',
      title: 'Severe Air Quality Alert',
      message: `Air quality is ${airQualityData.overall.category.toLowerCase()} with AQI of ${airQualityData.overall.aqi}. Immediate action required.`,
      affectedPollutants: [airQualityData.overall.dominantPollutant],
      recommendations: airQualityData.health.recommendations,
      duration: 'Until AQI improves below 150',
    });
  } else if (airQualityData.overall.aqi > 100) {
    alerts.push({
      type: 'alert',
      title: 'Poor Air Quality Warning',
      message: `Air quality is ${airQualityData.overall.category.toLowerCase()} with AQI of ${airQualityData.overall.aqi}. Take precautions.`,
      affectedPollutants: [airQualityData.overall.dominantPollutant],
      recommendations: airQualityData.health.recommendations,
      duration: 'Until AQI improves below 100',
    });
  } else if (airQualityData.overall.aqi > 50) {
    alerts.push({
      type: 'warning',
      title: 'Moderate Air Quality Notice',
      message: `Air quality is ${airQualityData.overall.category.toLowerCase()} with AQI of ${airQualityData.overall.aqi}. Sensitive individuals should take precautions.`,
      affectedPollutants: [airQualityData.overall.dominantPollutant],
      recommendations: airQualityData.health.recommendations,
      duration: 'Until AQI improves below 50',
    });
  }

  return alerts;
};