import { 
  Droplets, 
  Shield, 
  AlertTriangle, 
  CheckCircle,
  Thermometer,
  Wind,
  Sun,
  Sprout,
  Activity
} from "lucide-react";

export interface AgricultureCondition {
  key: string;
  label: string;
  icon: React.ComponentType<{ className?: string; size?: string | number }>;
  color: string;
  bgColor: string;
  borderColor: string;
}

// Get agriculture condition display info
export const getAgricultureConditionInfo = (condition: string): AgricultureCondition => {
  switch (condition) {
    case 'irrigation_needed':
      return {
        key: 'irrigation_needed',
        label: 'Irrigation Needed',
        icon: Droplets,
        color: 'text-blue-700',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200'
      };
    case 'spraying_suitable':
      return {
        key: 'spraying_suitable',
        label: 'Spray Safe',
        icon: Shield,
        color: 'text-green-700',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200'
      };
    case 'field_work_suitable':
      return {
        key: 'field_work_suitable',
        label: 'Field Work OK',
        icon: Activity,
        color: 'text-purple-700',
        bgColor: 'bg-purple-50',
        borderColor: 'border-purple-200'
      };
    case 'frost_risk':
      return {
        key: 'frost_risk',
        label: 'Frost Risk',
        icon: AlertTriangle,
        color: 'text-red-700',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200'
      };
    default:
      return {
        key: condition,
        label: condition.replace('_', ' ').toUpperCase(),
        icon: CheckCircle,
        color: 'text-gray-700',
        bgColor: 'bg-gray-50',
        borderColor: 'border-gray-200'
      };
  }
};

// Get weather severity color based on temperature
export const getTemperatureSeverity = (temp: number): string => {
  if (temp > 40) return 'text-red-600';
  if (temp > 35) return 'text-orange-600';
  if (temp > 30) return 'text-yellow-600';
  if (temp < 0) return 'text-blue-600';
  if (temp < 5) return 'text-cyan-600';
  return 'text-green-600';
};

// Get precipitation intensity color
export const getPrecipitationColor = (precipitation: number): string => {
  if (precipitation > 20) return 'text-blue-700';
  if (precipitation > 10) return 'text-blue-600';
  if (precipitation > 5) return 'text-blue-500';
  if (precipitation > 1) return 'text-blue-400';
  return 'text-gray-400';
};

// Get wind speed severity
export const getWindSeverity = (windSpeed: number): string => {
  if (windSpeed > 20) return 'text-red-600';
  if (windSpeed > 15) return 'text-orange-600';
  if (windSpeed > 10) return 'text-yellow-600';
  return 'text-green-600';
};

// Get UV index color
export const getUVIndexColor = (uvIndex: number): string => {
  if (uvIndex > 10) return 'text-purple-600';
  if (uvIndex > 7) return 'text-red-600';
  if (uvIndex > 5) return 'text-orange-600';
  if (uvIndex > 2) return 'text-yellow-600';
  return 'text-green-600';
};

// Format time for display
export const formatWeatherTime = (date: Date, timezone?: string): string => {
  try {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: timezone,
      timeZoneName: 'short'
    });
  } catch (error) {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }
};

// Format date for display
export const formatWeatherDate = (date: Date, timezone?: string): string => {
  try {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: timezone
    });
  } catch (error) {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
};