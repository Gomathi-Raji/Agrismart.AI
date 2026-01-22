// Weather service for backend API integration
const API_BASE_URL = import.meta.env.DEV ? '/api' : 'http://localhost:3002/api';

export interface WeatherCurrent {
  location: {
    city: string;
    state: string;
    country: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  temperature: {
    current: number;
    feelsLike: number;
    min: number;
    max: number;
    unit: string;
  };
  humidity: number;
  pressure: number;
  wind: {
    speed: number;
    direction: number;
    unit: string;
  };
  visibility: number;
  uvIndex: number;
  conditions: {
    main: string;
    description: string;
    icon: string;
  };
  precipitation: {
    probability: number;
    amount: number;
    type: string;
  };
  sunrise: string;
  sunset: string;
  lastUpdated: string;
  source: string;
}

export interface WeatherForecast {
  location: {
    city: string;
    state: string;
    country: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  forecast: Array<{
    date: string;
    temperature: {
      min: number;
      max: number;
      unit: string;
    };
    humidity: number;
    wind: {
      speed: number;
      direction: number;
      unit: string;
    };
    conditions: {
      main: string;
      description: string;
      icon: string;
    };
    precipitation: {
      probability: number;
      amount: number;
      type: string;
    };
    uvIndex: number;
  }>;
  lastUpdated: string;
  source: string;
}

export interface WeatherAlert {
  location: {
    city: string;
    state: string;
    country: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  alert: {
    title: string;
    description: string;
    severity: string;
    urgency: string;
    areas: string[];
    startTime: string;
    endTime: string;
    source: string;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WeatherHistory {
  location: {
    city: string;
    state: string;
    country: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  history: Array<{
    date: string;
    temperature: {
      min: number;
      max: number;
      unit: string;
    };
    humidity: number;
    wind: {
      speed: number;
      direction: number;
      unit: string;
    };
    conditions: {
      main: string;
      description: string;
      icon: string;
    };
    precipitation: {
      probability: number;
      amount: number;
      type: string;
    };
    uvIndex: number;
  }>;
  lastUpdated: string;
  source: string;
}

export interface WeatherAlertSubscription {
  location: {
    lat?: number;
    lng?: number;
    city?: string;
  };
  alertTypes: string[];
  notificationMethods: {
    email?: boolean;
    sms?: boolean;
    push?: boolean;
  };
}

export interface WeatherAlertUnsubscription {
  location: {
    lat?: number;
    lng?: number;
    city?: string;
  };
}

class WeatherService {
  private async request(endpoint: string, options?: RequestInit) {
    const url = `${API_BASE_URL}${endpoint}`;
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`Weather API error: ${response.statusText}`);
    }

    return response.json();
  }

  async getCurrentWeather(params?: {
    lat?: number;
    lng?: number;
    city?: string;
  }): Promise<WeatherCurrent> {
    const queryParams = new URLSearchParams();
    if (params?.lat) queryParams.append('lat', params.lat.toString());
    if (params?.lng) queryParams.append('lng', params.lng.toString());
    if (params?.city) queryParams.append('city', params.city);

    const data = await this.request(`/weather/current?${queryParams}`);
    return data.weather;
  }

  async getWeatherForecast(params?: {
    lat?: number;
    lng?: number;
    city?: string;
    days?: number;
  }): Promise<WeatherForecast> {
    const queryParams = new URLSearchParams();
    if (params?.lat) queryParams.append('lat', params.lat.toString());
    if (params?.lng) queryParams.append('lng', params.lng.toString());
    if (params?.city) queryParams.append('city', params.city);
    if (params?.days) queryParams.append('days', params.days.toString());

    const data = await this.request(`/weather/forecast?${queryParams}`);
    return data.forecast;
  }

  async getWeatherHistory(params: {
    lat?: number;
    lng?: number;
    city?: string;
    startDate: string;
    endDate: string;
  }): Promise<WeatherHistory> {
    const queryParams = new URLSearchParams();
    if (params?.lat) queryParams.append('lat', params.lat.toString());
    if (params?.lng) queryParams.append('lng', params.lng.toString());
    if (params?.city) queryParams.append('city', params.city);
    queryParams.append('startDate', params.startDate);
    queryParams.append('endDate', params.endDate);

    const data = await this.request(`/weather/history?${queryParams}`);
    return data.history;
  }

  async getWeatherAlerts(params?: {
    lat?: number;
    lng?: number;
    city?: string;
  }): Promise<WeatherAlert[]> {
    const queryParams = new URLSearchParams();
    if (params?.lat) queryParams.append('lat', params.lat.toString());
    if (params?.lng) queryParams.append('lng', params.lng.toString());
    if (params?.city) queryParams.append('city', params.city);

    const data = await this.request(`/weather/alerts?${queryParams}`);
    return data.alerts;
  }

  async subscribeWeatherAlerts(
    subscription: WeatherAlertSubscription,
    token: string
  ): Promise<{ success: boolean; message: string }> {
    return this.request('/weather/subscribe-alerts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(subscription),
    });
  }

  async unsubscribeWeatherAlerts(
    data: WeatherAlertUnsubscription,
    token: string
  ): Promise<{ success: boolean; message: string }> {
    return this.request('/weather/unsubscribe-alerts', {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
  }
}

export const weatherService = new WeatherService();