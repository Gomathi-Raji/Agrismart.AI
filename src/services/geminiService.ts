import { WeatherData } from './weatherService';
import { MandiPrice } from './mandiService';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

export interface GeminiSuggestion {
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  actionable: boolean;
  category: 'weather' | 'pest' | 'market' | 'irrigation' | 'fertilizer' | 'general';
}

interface CropHealthData {
  status: string;
  plantType: string;
  confidence: number;
  disease?: string | null;
  severity?: string | null;
  symptoms: string[];
  immediateActions: string[];
  detailedTreatment: {
    organicSolutions: unknown[];
    naturalRemedies: unknown[];
    stepByStepCure: unknown[];
  };
  fertilizers: unknown[];
  nutritionSuggestions: unknown[];
  preventionTips: unknown[];
  growthTips: unknown[];
  seasonalCare: unknown[];
  companionPlants: unknown[];
  warningsSigns: unknown[];
  appreciation: string;
  additionalAdvice: string;
}

export const generateAISuggestions = async (
  farmerProfile: {
    name: string;
    crops: string[];
    location: string;
    farmSize: string;
  },
  currentWeather: WeatherData,
  cropHealth: CropHealthData[],
  marketPrices: MandiPrice[]
): Promise<GeminiSuggestion[]> => {
  try {
    const prompt = `
You are an AI agricultural advisor for Smart Agriculture Platform. Generate 3-4 personalized farming suggestions for:

Farmer: ${farmerProfile.name}
Location: ${farmerProfile.location}
Crops: ${farmerProfile.crops.join(', ')}
Farm Size: ${farmerProfile.farmSize}

Current Context:
- Weather: ${currentWeather?.current?.temperature_2m}°C, ${currentWeather?.current?.weather_code}
- Crop Health: ${cropHealth.map(c => `${c.plantType}: ${c.confidence}% (${c.status})`).join(', ')}
- Market Prices: ${marketPrices.map(p => `${p.commodity}: ₹${p.modal_price}`).join(', ')}

Provide practical, actionable suggestions in JSON format:
[
  {
    "title": "Brief suggestion title",
    "description": "Detailed explanation with specific actions",
    "priority": "high|medium|low",
    "actionable": true|false,
    "category": "weather|pest|market|irrigation|fertilizer|general"
  }
]

Focus on immediate actions the farmer can take today or this week. Be specific about quantities, timing, and methods when possible.
`;

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const suggestions = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!suggestions) {
      throw new Error('No suggestions received from Gemini API');
    }

    // Parse JSON response
    const cleanJson = suggestions.replace(/```json\n?|\n?```/g, '').trim();
    return JSON.parse(cleanJson);
  } catch (error) {
    console.error('Error generating AI suggestions:', error);
    
    // Fallback suggestions
    return [
      {
        title: "Monitor crop health",
        description: "Check your crops daily for any signs of pest or disease, especially during humid weather.",
        priority: "medium" as const,
        actionable: true,
        category: "general" as const
      },
      {
        title: "Optimize irrigation",
        description: "Adjust watering schedule based on current weather conditions to prevent over or under-watering.",
        priority: "high" as const,
        actionable: true,
        category: "irrigation" as const
      }
    ];
  }
};

export const generateSmartReminders = async (tasks: unknown[], weather: WeatherData, crops: string[]) => {
  try {
    const prompt = `
Generate 2-3 smart farming reminders based on:
Tasks: ${tasks.map((t: unknown) => `${(t as {title: string; time: string}).title} at ${(t as {title: string; time: string}).time}`).join(', ')}
Weather: ${weather?.current?.temperature_2m}°C, ${weather?.current?.weather_code}
Crops: ${crops.join(', ')}

Return JSON array of reminders:
[
  {
    "title": "Reminder title",
    "message": "Detailed message with timing",
    "priority": "high|medium|low",
    "time": "suggested time"
  }
]
`;

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.6,
          maxOutputTokens: 512,
        }
      })
    });

    const data = await response.json();
    const reminders = data.candidates?.[0]?.content?.parts?.[0]?.text;
    const cleanJson = reminders?.replace(/```json\n?|\n?```/g, '').trim();
    return JSON.parse(cleanJson || '[]');
  } catch (error) {
    console.error('Error generating smart reminders:', error);
    return [
      {
        title: "Morning Tasks",
        message: "Don't forget to complete your scheduled farming tasks",
        priority: "medium",
        time: "8:00 AM"
      }
    ];
  }
};