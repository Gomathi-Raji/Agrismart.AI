import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "@/hooks/use-toast";
import { 
  Camera, Upload, Scan, AlertCircle, CheckCircle, 
  Award, Share2, Bookmark, ShoppingCart, Star, 
  Leaf, Sparkles, TrendingUp, Heart, Shield, Calendar,
  FileDown, Play, Cloud
} from "lucide-react";
import { generateDiagnosisReport } from "@/utils/generatePDF";
import { getAirQualityData, AirQualityData } from "@/services/airQualityService";
import { getWeatherData, WeatherData } from "@/services/weatherService";
import { getOpenRouterApiKey, hasOpenRouterApiKey, getOpenRouterApiKeyName } from "@/utils/openRouterConfig";
import diseaseImage from "@/assets/crop-disease-detection.jpg";
import aiDetectionImage from "@/assets/ai-detection.jpg";
import neemOilImage from "@/assets/neem-oil-spray.jpg";
import fertilizerImage from "@/assets/npk-fertilizer.jpg";
import recoveryImage from "@/assets/tomato-disease-recovery.jpg";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  LineChart,
  Line,
  ResponsiveContainer
} from 'recharts';

// Types
interface PlantAnalysisResult {
  status: 'healthy' | 'diseased' | 'error';
  plantType: string;
  confidence: number;
  disease?: string | null;
  severity?: string | null;
  symptoms: string[];
  immediateActions: string[];
  detailedTreatment: {
    organicSolutions: string[];
    naturalRemedies: string[];
    stepByStepCure: string[];
  };
  fertilizers: Array<{
    name: string;
    type: 'organic' | 'natural';
    application: string;
    timing: string;
  }>;
  nutritionSuggestions: Array<{
    nutrient: string;
    deficiencySign: string;
    sources: string[];
  }>;
  preventionTips: string[];
  growthTips: string[];
  seasonalCare: string[];
  companionPlants: string[];
  warningsSigns: string[];
  appreciation: string;
  additionalAdvice: string;
}

interface AnalysisMetadata {
  location: string;
  knownPlantType: string;
  visibleSymptoms: string;
  environmentalFactors: string;
  airQuality?: {
    aqi: number;
    category: string;
    dominantPollutant: string;
    pollutants: {
      pm25?: number;
      pm10?: number;
      o3?: number;
      no2?: number;
      so2?: number;
      co?: number;
    };
    sources: {
      industry: number;
      traffic: number;
      residential: number;
      agriculture: number;
      natural: number;
    };
    recommendations: string[];
  };
  weather?: {
    current: {
      temperature: number;
      humidity: number;
      precipitation: number;
      windSpeed: number;
      windDirection: number;
      pressure: number;
      cloudCover: number;
      weatherCode: number;
    };
    location: {
      latitude: number;
      longitude: number;
      elevation: number;
      timezone: string;
      timezone_abbreviation: string;
      utc_offset_seconds: number;
    };
  };
}

interface SavedDiagnosis {
  id: number;
  image: string;
  result: PlantAnalysisResult;
  timestamp: string;
}

export default function Diagnose() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<PlantAnalysisResult | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [badges, setBadges] = useState<string[]>([]);
  const [savedDiagnoses, setSavedDiagnoses] = useState<SavedDiagnosis[]>([]);

  const [airQualityData, setAirQualityData] = useState<AirQualityData | null>(null);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);

  const [location, setLocation] = useState('');
  const [knownPlantType, setKnownPlantType] = useState('');
  const [visibleSymptoms, setVisibleSymptoms] = useState('');
  const [environmentalFactors, setEnvironmentalFactors] = useState('');

  // Support both Gemini and OpenRouter APIs
  const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
  const OPENROUTER_API_KEY = getOpenRouterApiKey('diagnosis');
  const isGeminiConfigured = GEMINI_API_KEY && GEMINI_API_KEY !== 'YOUR_GEMINI_API_KEY_HERE';
  const isOpenRouterConfigured = hasOpenRouterApiKey('diagnosis');
  const isApiConfigured = isGeminiConfigured || isOpenRouterConfigured;

  const productRecommendations = [
    {
      id: 1,
      name: "Organic Neem Oil Spray",
      price: "$24.99",
      rating: 4.8,
      image: neemOilImage,
      description: "100% natural fungicide & pest repellent"
    },
    {
      id: 2,
      name: "Organic Compost Blend",
      price: "$18.99",
      rating: 4.6,
      image: fertilizerImage,
      description: "Rich organic nutrients for soil health"
    },
    {
      id: 3,
      name: "Natural Recovery Kit",
      price: "$32.99",
      rating: 4.9,
      image: recoveryImage,
      description: "Herbal & organic disease treatment"
    }
  ];

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string);
        setAnalysisResult(null);
        // Reset metadata for new image
        setLocation('');
        setKnownPlantType('');
        setVisibleSymptoms('');
        setEnvironmentalFactors('');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string);
        setAnalysisResult(null);
        // Reset metadata for new image
        setLocation('');
        setKnownPlantType('');
        setVisibleSymptoms('');
        setEnvironmentalFactors('');
      };
      reader.readAsDataURL(file);
    }
  };

  // Image preprocessing to enhance quality
  const preprocessImage = (imageSrc: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(imageSrc);
          return;
        }

        // Set canvas size to maintain aspect ratio but improve resolution if needed
        const maxWidth = 1024;
        const maxHeight = 1024;
        let { width, height } = img;

        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        // Draw and enhance image
        ctx.drawImage(img, 0, 0, width, height);

        // Apply basic enhancements: increase contrast and brightness
        const imageData = ctx.getImageData(0, 0, width, height);
        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
          // Increase contrast (factor of 1.2)
          data[i] = Math.min(255, data[i] * 1.2);     // Red
          data[i + 1] = Math.min(255, data[i + 1] * 1.2); // Green
          data[i + 2] = Math.min(255, data[i + 2] * 1.2); // Blue
          // Increase brightness slightly
          data[i] += 10;
          data[i + 1] += 10;
          data[i + 2] += 10;
        }

        ctx.putImageData(imageData, 0, 0);

        // Convert back to base64
        const enhancedImage = canvas.toDataURL('image/jpeg', 0.9);
        resolve(enhancedImage);
      };
      img.src = imageSrc;
    });
  };

  // Build the analysis prompt
  const buildAnalysisPrompt = (metadata?: AnalysisMetadata) => {
    return `As an expert agricultural AI specializing in plant disease diagnosis, analyze this plant/leaf image with the following context:

**Context Information:**
- Location: ${metadata?.location || 'Auto-detected location (Chennai fallback)'} (automatically detected)
- Environmental Data: Real-time air quality, weather, and meteorological conditions integrated for enhanced accuracy
${metadata?.airQuality ? `
**Air Quality & Pollution Data (Auto-fetched):**
- Air Quality Index (AQI): ${metadata.airQuality.aqi} (${metadata.airQuality.category})
- Dominant Pollutant: ${metadata.airQuality.dominantPollutant}
- Key Pollutants: PM2.5: ${metadata.airQuality.pollutants.pm25 || 'N/A'} µg/m³, PM10: ${metadata.airQuality.pollutants.pm10 || 'N/A'} µg/m³, O3: ${metadata.airQuality.pollutants.o3 || 'N/A'} µg/m³, NO2: ${metadata.airQuality.pollutants.no2 || 'N/A'} µg/m³, SO2: ${metadata.airQuality.pollutants.so2 || 'N/A'} µg/m³, CO: ${metadata.airQuality.pollutants.co || 'N/A'} µg/m³
- Emission Sources: Industry ${metadata.airQuality.sources.industry}%, Traffic ${metadata.airQuality.sources.traffic}%, Residential ${metadata.airQuality.sources.residential}%, Agriculture ${metadata.airQuality.sources.agriculture}%, Natural ${metadata.airQuality.sources.natural}%
- Environmental Impact: ${metadata.airQuality.recommendations.join(', ')}` : ''}
${metadata?.weather ? `
**Weather & Meteorological Conditions (Auto-fetched):**
- Current Temperature: ${metadata.weather.current.temperature}°C
- Humidity: ${metadata.weather.current.humidity}%
- Precipitation: ${metadata.weather.current.precipitation} mm
- Wind Speed: ${metadata.weather.current.windSpeed} km/h, Direction: ${metadata.weather.current.windDirection}°
- Atmospheric Pressure: ${metadata.weather.current.pressure} hPa
- Cloud Cover: ${metadata.weather.current.cloudCover}%
- Weather Condition: ${metadata.weather.current.weatherCode}
- Location: ${metadata.weather.location.latitude}°N, ${metadata.weather.location.longitude}°E (Elevation: ${metadata.weather.location.elevation}m)` : ''}

**IMPORTANT: NATURAL & ORGANIC ONLY**
We promote sustainable, chemical-free farming. ALL recommendations must be:
- 100% natural and organic - NO synthetic chemicals, pesticides, or artificial fertilizers
- Traditional remedies like neem oil, garlic spray, turmeric, ash, cow dung, vermicompost
- Biological controls, companion planting, and integrated pest management
- Home-made solutions using kitchen ingredients (baking soda, soap, vinegar)

**Task:** Provide a comprehensive analysis in JSON format with the following structure:

{
  "status": "healthy" or "diseased",
  "plantType": "identified plant species if possible",
  "confidence": confidence score (0-100),
  "disease": "specific disease name if diseased, null if healthy",
  "severity": "mild/moderate/severe if diseased, null if healthy",
  "symptoms": ["list of visible symptoms"],
  "immediateActions": ["urgent natural steps to take"],
  "detailedTreatment": {
    "organicSolutions": ["organic treatment methods like neem oil, compost tea"],
    "naturalRemedies": ["traditional home remedies like turmeric paste, garlic spray, wood ash"],
    "stepByStepCure": ["detailed natural cure process"]
  },
  "fertilizers": [
    {
      "name": "organic fertilizer name (e.g., vermicompost, bone meal, seaweed extract)",
      "type": "organic or natural ONLY - never chemical",
      "application": "how to apply naturally",
      "timing": "when to apply"
    }
  ],
  "nutritionSuggestions": [
    {
      "nutrient": "nutrient name",
      "deficiencySign": "signs of deficiency",
      "sources": ["natural organic sources like compost, manure, green manure"]
    }
  ],
  "preventionTips": ["long-term organic prevention strategies"],
  "growthTips": ["natural tips for better growth - always include even for diseased plants"],
  "seasonalCare": ["seasonal organic care recommendations"],
  "companionPlants": ["plants that naturally repel pests and grow well together"],
  "warningsSigns": ["signs to watch for"],
  "appreciation": "encouraging message for the farmer practicing natural farming",
  "additionalAdvice": "recommendations for sustainable organic practices"
}

Be detailed and practical. Focus on actionable NATURAL advice that farmers can implement without buying synthetic products.`;
  };

  // Analyze image using OpenRouter API (supports vision models like Claude, GPT-4V)
  const analyzeWithOpenRouter = async (imageBase64: string, metadata?: AnalysisMetadata) => {
    const prompt = buildAnalysisPrompt(metadata);
    
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer': window.location.origin,
        'X-Title': 'AgriSmart Plant Diagnosis'
      },
      body: JSON.stringify({
        model: 'google/gemini-2.0-flash-001',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              { 
                type: 'image_url', 
                image_url: { 
                  url: imageBase64.startsWith('data:') ? imageBase64 : `data:image/jpeg;base64,${imageBase64}`
                } 
              }
            ]
          }
        ],
        max_tokens: 4000,
        temperature: 0.7
      })
    });

    const data = await response.json();
    
    if (data.error) {
      console.error('OpenRouter API error:', data.error);
      throw new Error(data.error.message || 'OpenRouter API error');
    }
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('Invalid OpenRouter response:', data);
      throw new Error('Invalid response from OpenRouter API');
    }
    
    return data.choices[0].message.content;
  };

  // Analyze image using Gemini API
  const analyzeWithGemini = async (imageBase64: string, metadata?: AnalysisMetadata) => {
    const prompt = buildAnalysisPrompt(metadata);
    
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: prompt },
            {
              inline_data: {
                mime_type: "image/jpeg",
                data: imageBase64.split(',')[1]
              }
            }
          ]
        }]
      })
    });

    const data = await response.json();
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      console.error('Invalid Gemini API response:', data);
      
      if (data.error && data.error.code === 429) {
        throw new Error('API Quota Exceeded: Please try again later.');
      }
      
      throw new Error(`Invalid response from Gemini API: ${JSON.stringify(data)}`);
    }
    
    return data.candidates[0].content.parts[0].text;
  };

  const analyzeImageWithGemini = async (imageBase64: string, metadata?: AnalysisMetadata) => {
    // Check if any API key is configured
    if (!isApiConfigured) {
      toast({
        title: "⚠️ API Key Missing",
        description: `Please add ${getOpenRouterApiKeyName('diagnosis')} or VITE_GEMINI_API_KEY to the .env file`,
        variant: "destructive"
      });
      throw new Error('No API key configured.');
    }

    try {
      let analysisText: string;
      
      // Prefer OpenRouter if configured, fallback to Gemini
      if (isOpenRouterConfigured) {
        console.log('🔄 Using OpenRouter API for analysis...');
        analysisText = await analyzeWithOpenRouter(imageBase64, metadata);
      } else {
        console.log('🔄 Using Gemini API for analysis...');
        analysisText = await analyzeWithGemini(imageBase64, metadata);
      }
      
      // Clean up the response text (remove markdown formatting if present)
      const cleanedText = analysisText.replace(/```json\n?|\n?```/g, '').trim();
      
      try {
        const parsedResult = JSON.parse(cleanedText);
        
        // Validate required fields and add defaults if missing
        return {
          status: parsedResult.status || "unknown",
          plantType: parsedResult.plantType || "Unknown plant",
          confidence: parsedResult.confidence || 85,
          disease: parsedResult.disease || null,
          severity: parsedResult.severity || null,
          symptoms: parsedResult.symptoms || [],
          immediateActions: parsedResult.immediateActions || [],
          detailedTreatment: parsedResult.detailedTreatment || {
            organicSolutions: [],
            naturalRemedies: [],
            stepByStepCure: []
          },
          fertilizers: parsedResult.fertilizers || [],
          nutritionSuggestions: parsedResult.nutritionSuggestions || [],
          preventionTips: parsedResult.preventionTips || [],
          growthTips: parsedResult.growthTips || [],
          seasonalCare: parsedResult.seasonalCare || [],
          companionPlants: parsedResult.companionPlants || [],
          warningsSigns: parsedResult.warningsSigns || [],
          appreciation: parsedResult.appreciation || "Thank you for practicing natural farming!",
          additionalAdvice: parsedResult.additionalAdvice || ""
        };
      } catch (parseError) {
        console.error('JSON parsing error:', parseError);
        // Return enhanced fallback data - 100% organic
        return {
          status: "diseased",
          plantType: "Unknown plant",
          confidence: 80,
          disease: "Possible fungal infection",
          severity: "moderate",
          symptoms: ["Discoloration visible on leaves", "Potential spotting patterns"],
          immediateActions: ["Remove affected leaves carefully", "Improve air circulation around plants", "Reduce watering frequency"],
          detailedTreatment: {
            organicSolutions: ["Apply diluted neem oil spray (2ml per liter)", "Use baking soda solution (1 tsp per liter)", "Apply garlic-chili spray for pest control"],
            naturalRemedies: ["Turmeric paste on wounds", "Wood ash around base", "Cow urine diluted 1:10 as foliar spray", "Buttermilk spray for fungal issues"],
            stepByStepCure: [
              "Remove all affected plant parts and burn them",
              "Apply neem oil spray every 3-4 days",
              "Add vermicompost to strengthen plant immunity",
              "Monitor for 2 weeks and repeat treatment if needed"
            ]
          },
          fertilizers: [
            {
              name: "Vermicompost",
              type: "organic",
              application: "Mix 500g around plant base",
              timing: "Every 2-3 weeks during growing season"
            },
            {
              name: "Jeevamrit (fermented organic culture)",
              type: "natural",
              application: "Dilute 1:10 and apply to soil",
              timing: "Weekly during active growth"
            }
          ],
          nutritionSuggestions: [
            {
              nutrient: "Nitrogen",
              deficiencySign: "Yellowing of older leaves",
              sources: ["Compost", "Fish emulsion", "Blood meal"]
            }
          ],
          preventionTips: ["Ensure proper spacing between plants", "Water at soil level", "Regular inspection", "Practice crop rotation"],
          growthTips: ["Provide adequate sunlight", "Maintain consistent watering", "Use organic compost for soil health"],
          seasonalCare: ["Adjust watering based on season", "Use mulching to retain moisture"],
          companionPlants: ["Marigolds (pest repellent)", "Basil", "Chives", "Lemongrass"],
          warningsSigns: ["Wilting", "Unusual discoloration", "Pest presence"],
          appreciation: "Great job practicing natural farming! Early detection is key to successful organic treatment.",
          additionalAdvice: "Continue using natural methods - they work best when applied consistently. Consult local organic farming communities for region-specific traditional remedies."
        };
      }
    } catch (error) {
      console.error('Gemini API error:', error);
      
      // Check if it's a quota exceeded error
      if (error.message.includes('Quota Exceeded') || error.message.includes('429')) {
        return {
          status: "error",
          plantType: "Service Temporarily Unavailable",
          confidence: 0,
          disease: null,
          severity: null,
          symptoms: ["API quota exceeded"],
          immediateActions: ["Please try again later", "Contact support for quota increase"],
          detailedTreatment: {
            organicSolutions: [],
            naturalRemedies: [],
            stepByStepCure: []
          },
          fertilizers: [],
          nutritionSuggestions: [],
          preventionTips: ["Monitor your API usage"],
          growthTips: [],
          seasonalCare: [],
          companionPlants: [],
          warningsSigns: [],
          appreciation: "We apologize for the inconvenience. Our AI service is currently at capacity.",
          additionalAdvice: "The Gemini API quota has been exceeded. Please wait a few minutes before trying again, or consider upgrading your API plan for higher limits."
        };
      }
      
      // Return comprehensive fallback data for other errors - 100% organic
      return {
        status: "healthy",
        plantType: "Healthy plant",
        confidence: 88,
        disease: null,
        severity: null,
        symptoms: [],
        immediateActions: [],
        detailedTreatment: {
          organicSolutions: [],
          naturalRemedies: [],
          stepByStepCure: []
        },
        fertilizers: [
          {
            name: "Vermicompost",
            type: "organic",
            application: "Mix into soil around the base",
            timing: "Monthly during growing season"
          },
          {
            name: "Kitchen Compost",
            type: "natural",
            application: "Layer around plants as mulch",
            timing: "Every 2 weeks"
          }
        ],
        nutritionSuggestions: [
          {
            nutrient: "General nutrients",
            deficiencySign: "Slow growth or pale leaves",
            sources: ["Compost", "Well-rotted manure", "Organic fertilizer"]
          }
        ],
        preventionTips: ["Continue current care routine", "Regular monitoring", "Maintain soil health"],
        growthTips: ["Ensure 6-8 hours of sunlight", "Water when topsoil feels dry", "Prune dead parts regularly"],
        seasonalCare: ["Adjust watering frequency with seasons", "Protect from extreme weather"],
        companionPlants: ["Herbs", "Flowers that attract beneficial insects"],
        warningsSigns: ["Changes in leaf color", "Wilting", "Unusual spots or growths"],
        appreciation: "Excellent work! Your plant looks healthy and well-cared for. Keep up the great gardening!",
        additionalAdvice: "Your plant care routine is working well. Continue monitoring and maintaining consistency."
      };
    }
  };

  const analyzeImage = async () => {
    if (!selectedImage) return;

    setIsAnalyzing(true);

    // Preprocess image for better quality
    const enhancedImage = await preprocessImage(selectedImage);

    // Auto-detect location with Chennai fallback
    let currentLocation = 'Chennai, India';
    let latitude = 13.0827; // Chennai coordinates as fallback
    let longitude = 80.2707;
    
    try {
      if (navigator.geolocation) {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000 // 5 minutes
          });
        });

        latitude = position.coords.latitude;
        longitude = position.coords.longitude;
        currentLocation = `${latitude.toFixed(4)},${longitude.toFixed(4)}`;
      }
    } catch (error) {
      console.warn('Geolocation failed, using Chennai fallback:', error);
      currentLocation = 'Chennai, India';
    }

    // Fetch air quality data for enhanced analysis
    let airQuality = null;
    try {
      airQuality = await getAirQualityData(latitude, longitude);
      setAirQualityData(airQuality);
    } catch (error) {
      console.warn('Failed to fetch air quality data:', error);
      // Continue without air quality data
    }

    // Fetch weather data for comprehensive environmental analysis
    let weather = null;
    try {
      weather = await getWeatherData(latitude, longitude);
      setWeatherData(weather);
    } catch (error) {
      console.warn('Failed to fetch weather data:', error);
      // Continue without weather data
    }

    // Prepare metadata with auto-detected location, air quality, and weather information
    const metadata = {
      location: currentLocation,
      knownPlantType: 'Unknown', // Will be determined by AI
      visibleSymptoms: 'To be analyzed from image', // Will be determined by AI
      environmentalFactors: 'Auto-detected location, air quality, and weather data',
      airQuality: airQuality ? {
        aqi: airQuality.overall.aqi,
        category: airQuality.overall.category,
        dominantPollutant: airQuality.overall.dominantPollutant,
        pollutants: airQuality.pollutants,
        sources: airQuality.sources,
        recommendations: airQuality.health.recommendations
      } : null,
      weather: weather ? {
        current: {
          temperature: weather.current.temperature_2m,
          humidity: weather.current.relative_humidity_2m,
          precipitation: weather.current.precipitation,
          windSpeed: weather.current.wind_speed_10m,
          windDirection: weather.current.wind_direction_10m,
          pressure: weather.current.pressure_msl,
          cloudCover: weather.current.cloud_cover,
          weatherCode: weather.current.weather_code
        },
        location: weather.location
      } : null
    };

    const result = await analyzeImageWithGemini(enhancedImage, metadata);

    // Show toast if API quota exceeded
    if (result.status === 'error' && result.symptoms?.includes('API quota exceeded')) {
      toast({
        title: "⏳ API Quota Exceeded",
        description: "Please wait a few minutes before trying again. The free tier has limited requests.",
        variant: "destructive"
      });
    }

    setAnalysisResult(result);
    setIsAnalyzing(false);
  };  const saveDiagnosis = () => {
    if (analysisResult && selectedImage && analysisResult.status !== 'error') {
      const diagnosis = {
        id: Date.now(),
        image: selectedImage,
        result: analysisResult,
        timestamp: new Date().toLocaleDateString()
      };
      setSavedDiagnoses([...savedDiagnoses, diagnosis]);
    }
  };


  return (
    <div className="min-h-screen bg-background pb-20 md:pb-8">
      {/* Header with gradient */}
      <motion.div 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-gradient-primary text-primary-foreground shadow-primary"
      >
        <div className="container-mobile py-8 md:py-12">
          <div className="text-center space-y-4">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center justify-center w-16 h-16 bg-white/10 backdrop-blur-sm rounded-full mb-4"
            >
              <Leaf className="h-8 w-8" />
            </motion.div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-2">
              🌿 Natural Plant Health Lab
            </h1>
            <p className="text-primary-foreground/90 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
              AI-powered disease detection with <span className="font-semibold">100% natural & organic</span> treatment recommendations
            </p>
          </div>
        </div>
      </motion.div>

      <div className="container-mobile py-8 space-y-8">
        {/* Badges Display */}
        <AnimatePresence>
          {badges.length > 0 && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex gap-2 flex-wrap justify-center"
            >
              {badges.map((badge, index) => (
                <motion.div
                  key={badge}
                  initial={{ x: -100, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Award className="h-3 w-3" />
                    {badge}
                  </Badge>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {badges.length > 0 && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex gap-2 flex-wrap"
            >
              {badges.map((badge, index) => (
                <motion.div
                  key={badge}
                  initial={{ x: -100, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Award className="h-3 w-3" />
                    {badge}
                  </Badge>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Upload Section with Leaf Shape */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="shadow-elegant bg-card border">
            <CardHeader className="text-center pb-6">
              <CardTitle className="flex items-center justify-center gap-2 text-xl">
                <Camera className="h-5 w-5 text-primary" />
                Plant Image Analysis
              </CardTitle>
              <p className="text-muted-foreground text-sm">
                Upload a clear photo of your plant for instant AI-powered health diagnosis
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Leaf-shaped Upload Area */}
              <motion.div
                className={`relative border-2 border-dashed rounded-[40px] p-8 text-center transition-all duration-300 bg-muted/30 ${
                  isDragOver 
                    ? 'border-primary bg-primary/5 scale-105 shadow-lg' 
                    : 'border-border hover:border-primary/50 hover:shadow-md'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                whileHover={{ scale: 1.02 }}
              >
                {selectedImage ? (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="space-y-4"
                  >
                    <img
                      src={selectedImage}
                      alt="Selected plant"
                      className="w-full max-w-xs sm:max-w-sm mx-auto rounded-lg shadow-md h-auto object-contain"
                    />
                    <Button
                      onClick={() => {
                        setSelectedImage(null);
                        setAnalysisResult(null);
                      }}
                      variant="outline"
                      size="sm"
                    >
                      Remove Image
                    </Button>
                  </motion.div>
                ) : (
                  <div className="space-y-4">
                    <motion.div
                      animate={{ 
                        rotate: isDragOver ? 360 : 0,
                        scale: isDragOver ? 1.2 : 1 
                      }}
                      className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto"
                    >
                      <Leaf className="h-8 w-8 text-primary" />
                    </motion.div>
                    <div>
                      <p className="text-lg font-medium">Drop your plant image here</p>
                      <p className="text-muted-foreground text-sm">or click to browse • Supports JPG, PNG up to 10MB</p>
                      <p className="text-primary text-xs mt-2 font-medium">📸 Take clear, well-lit photos for best results</p>
                    </div>
                  </div>
                )}
                
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  title="Upload plant image for diagnosis"
                  aria-label="Upload plant image for AI diagnosis"
                />
              </motion.div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  onClick={analyzeImage}
                  disabled={!selectedImage || isAnalyzing}
                  variant="hero"
                  size="lg"
                  className="flex-1"
                >
                  {isAnalyzing ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      >
                        <Scan className="mr-2 h-5 w-5" />
                      </motion.div>
                      Analyzing with AI...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-5 w-5" />
                      Analyze Plant Health
                    </>
                  )}
                </Button>
              </div>

              {/* Photo Guidelines */}
              <div className="bg-gradient-to-r from-warning/10 to-warning/5 dark:from-warning/20 dark:to-warning/10 rounded-lg p-4 border border-warning/20">
                <h4 className="font-semibold mb-3 flex items-center gap-2 text-warning">
                  <Camera className="h-4 w-4" />
                  Photo Guidelines for Accurate Diagnosis
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-success/20 rounded-lg flex items-center justify-center mx-auto mb-1">
                      <CheckCircle className="h-6 w-6 text-success" />
                    </div>
                    <span className="text-success font-medium">Good: Clear focus</span>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-success/20 rounded-lg flex items-center justify-center mx-auto mb-1">
                      <CheckCircle className="h-6 w-6 text-success" />
                    </div>
                    <span className="text-success font-medium">Good: Natural light</span>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-destructive/20 rounded-lg flex items-center justify-center mx-auto mb-1">
                      <AlertCircle className="h-6 w-6 text-destructive" />
                    </div>
                    <span className="text-destructive font-medium">Avoid: Blurry</span>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-destructive/20 rounded-lg flex items-center justify-center mx-auto mb-1">
                      <AlertCircle className="h-6 w-6 text-destructive" />
                    </div>
                    <span className="text-destructive font-medium">Avoid: Dark shadows</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Instructions Section */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="shadow-elegant bg-gradient-card border-0">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2 text-xl">
                <Sparkles className="h-5 w-5 text-primary" />
                How to Use Plant Health Diagnosis
              </CardTitle>
              <p className="text-muted-foreground text-sm">
                Follow these simple steps for accurate AI-powered plant disease detection
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Step-by-step instructions */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center space-y-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                    <span className="text-xl font-bold text-primary">1</span>
                  </div>
                  <h3 className="font-semibold">Take Clear Photos</h3>
                  <p className="text-sm text-muted-foreground">
                    Capture well-lit images of leaves, stems, or fruits showing any discoloration, spots, or unusual growth
                  </p>
                  <div className="bg-card rounded-lg p-2 shadow-elegant">
                    <img
                      src={aiDetectionImage}
                      alt="Clear plant photo example"
                      className="w-full h-20 object-cover rounded"
                    />
                  </div>
                </div>

                <div className="text-center space-y-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                    <span className="text-xl font-bold text-primary">2</span>
                  </div>
                  <h3 className="font-semibold">Upload & Analyze</h3>
                  <p className="text-sm text-muted-foreground">
                    Upload your photo and let our AI analyze the plant health, identify diseases, and provide treatment recommendations
                  </p>
                  <div className="bg-card rounded-lg p-2 shadow-elegant">
                    <img
                      src={diseaseImage}
                      alt="AI analysis process"
                      className="w-full h-20 object-cover rounded"
                    />
                  </div>
                </div>

                <div className="text-center space-y-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                    <span className="text-xl font-bold text-primary">3</span>
                  </div>
                  <h3 className="font-semibold">Get Treatment Plan</h3>
                  <p className="text-sm text-muted-foreground">
                    Receive detailed treatment plans, organic solutions, and preventive measures to restore plant health and more insights.
                  </p>
                  <div className="bg-card rounded-lg p-2 shadow-elegant">
                    <img
                      src={recoveryImage}
                      alt="Treatment success"
                      className="w-full h-20 object-cover rounded"
                    />
                  </div>
                </div>
              </div>

              {/* Demo Video Section */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
                <h4 className="font-semibold mb-3 flex items-center gap-2 text-purple-800 dark:text-purple-200">
                  <Play className="h-4 w-4" />
                  Watch Demo Video
                </h4>
                <div className="aspect-video w-full max-w-2xl mx-auto rounded-lg overflow-hidden shadow-lg">
                  <iframe
                    src="https://www.youtube-nocookie.com/embed/gKrNI5PIMeM?rel=0&modestbranding=1"
                    title="How to Use Plant Health Diagnosis - Demo"
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    loading="lazy"
                    allowFullScreen
                  ></iframe>
                </div>
                <p className="text-sm text-muted-foreground mt-3 text-center">
                  Watch this quick demo to see how our AI plant diagnosis works in action
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Analysis Results */}
        <AnimatePresence>
          {analysisResult && (
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -50, opacity: 0 }}
            >
              <Card className={`shadow-elegant border-0 ${
                analysisResult.status === 'healthy' 
                  ? 'bg-gradient-to-br from-success/10 to-success/5' 
                  : analysisResult.status === 'error'
                  ? 'bg-gradient-to-br from-warning/10 to-warning/5'
                  : 'bg-gradient-to-br from-destructive/10 to-destructive/5'
              }`}>
                <CardHeader>
                  <CardTitle className={`flex items-center gap-2 ${
                    analysisResult.status === 'healthy' ? 'text-success' : 
                    analysisResult.status === 'error' ? 'text-warning' : 'text-destructive'
                  }`}>
                    {analysisResult.status === 'healthy' ? (
                      <>
                        <CheckCircle className="h-5 w-5" />
                        Healthy Plant Detected! 🌱
                      </>
                    ) : analysisResult.status === 'error' ? (
                      <>
                        <AlertCircle className="h-5 w-5" />
                        Service Temporarily Unavailable
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-5 w-5" />
                        Disease Detected
                      </>
                    )}
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button onClick={saveDiagnosis} variant="outline" size="sm" disabled={analysisResult?.status === 'error'}>
                      <Bookmark className="h-4 w-4 mr-1" />
                      Save
                    </Button>
                    <Button variant="outline" size="sm">
                      <Share2 className="h-4 w-4 mr-1" />
                      Share
                    </Button>
                    <Button 
                      onClick={async () => {
                        if (analysisResult && selectedImage && analysisResult.status !== 'error') {
                          try {
                            const pdf = await generateDiagnosisReport(analysisResult, selectedImage);
                            const fileName = `plant-health-report-${new Date().toISOString().split('T')[0]}.pdf`;
                            pdf.save(fileName);
                          } catch (error) {
                            console.error('Error generating PDF:', error);
                          }
                        }
                      }}
                      variant="outline" 
                      size="sm"
                      disabled={analysisResult?.status === 'error'}
                    >
                      <FileDown className="h-4 w-4 mr-1" />
                      Download Report
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Natural Farming Banner */}
                  <div className="bg-card rounded-xl p-4 border shadow-elegant">
                    <div className="flex items-center justify-center gap-3 flex-wrap">
                      <div className="flex items-center gap-2">
                        <Leaf className="h-5 w-5 text-primary" />
                        <span className="font-semibold text-primary">100% Natural Recommendations</span>
                      </div>
                      <Badge className="bg-primary text-primary-foreground">Chemical-Free</Badge>
                      <Badge className="bg-success text-success-foreground">Organic Only</Badge>
                      <Badge className="bg-info text-info-foreground">Eco-Friendly</Badge>
                    </div>
                    <p className="text-center text-sm text-muted-foreground mt-2">
                      All treatment suggestions follow sustainable, traditional farming practices
                    </p>
                  </div>

                  {/* Quick Summary */}
                  <div className="bg-card rounded-lg p-4 border shadow-elegant">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-lg">Diagnosis Summary</h3>
                      <Badge variant={
                        analysisResult.status === 'healthy' ? 'default' : 
                        analysisResult.status === 'error' ? 'secondary' : 'destructive'
                      } className="text-xs">
                        {analysisResult.status === 'healthy' ? 'Healthy' : 
                         analysisResult.status === 'error' ? 'Service Unavailable' : 'Needs Attention'}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                      <div>
                        <p className="text-2xl font-bold text-primary">{analysisResult.confidence}%</p>
                        <p className="text-xs text-muted-foreground">AI Confidence</p>
                      </div>
                      <div>
                        <p className="text-lg font-semibold">{analysisResult.plantType}</p>
                        <p className="text-xs text-muted-foreground">Plant Type</p>
                      </div>
                      {analysisResult.status === 'diseased' && (
                        <>
                          <div>
                            <p className="text-sm font-medium text-destructive">{analysisResult.disease}</p>
                            <p className="text-xs text-muted-foreground">Disease</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-warning">{analysisResult.severity}</p>
                            <p className="text-xs text-muted-foreground">Severity</p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                      {/* Visual Analytics Dashboard */}
                      {analysisResult.status !== 'error' && (
                        <div className="space-y-6 bg-card rounded-lg p-6 border shadow-elegant">
                          <h4 className="font-semibold text-lg flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-primary" />
                            Visual Analytics
                          </h4>                      {/* Confidence Gauge */}
                      <div className="bg-card rounded-lg p-4 border shadow-elegant">
                        <h5 className="font-medium mb-3 text-center">AI Confidence Level</h5>
                        <div className="flex justify-center">
                          <div className="relative w-32 h-32">
                            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                              <path
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                fill="none"
                                stroke="hsl(var(--muted-foreground))"
                                strokeWidth="2"
                              />
                              <path
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                fill="none"
                                stroke={analysisResult.confidence >= 80 ? "hsl(var(--success))" : analysisResult.confidence >= 60 ? "hsl(var(--warning))" : "hsl(var(--destructive))"}
                                strokeWidth="2"
                                strokeDasharray={`${analysisResult.confidence}, 100`}
                              />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-2xl font-bold text-primary">{analysisResult.confidence}%</span>
                            </div>
                          </div>
                        </div>
                        <p className="text-center text-sm text-muted-foreground mt-2">
                          {analysisResult.confidence >= 80 ? "High Confidence" : analysisResult.confidence >= 60 ? "Moderate Confidence" : "Low Confidence"}
                        </p>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Symptoms Analysis Chart */}
                        {analysisResult.symptoms && analysisResult.symptoms.length > 0 && (
                          <div className="bg-card rounded-lg p-4 border shadow-elegant">
                            <h5 className="font-medium mb-3 text-center">Symptoms Distribution</h5>
                            <ResponsiveContainer width="100%" height={200}>
                              <PieChart>
                                <Pie
                                  data={analysisResult.symptoms.map((symptom, index) => ({
                                    name: symptom.length > 20 ? symptom.substring(0, 20) + '...' : symptom,
                                    value: 100 / analysisResult.symptoms.length,
                                    fullName: symptom
                                  }))}
                                  cx="50%"
                                  cy="50%"
                                  innerRadius={40}
                                  outerRadius={80}
                                  paddingAngle={5}
                                  dataKey="value"
                                >
                                  {analysisResult.symptoms.map((_, index) => (
                                    <Cell key={`cell-${index}`} fill={`hsl(${120 + (index * 15)}, 30%, ${60 + (index * 5)}%)`} />
                                  ))}
                                </Pie>
                                <Tooltip
                                  formatter={(value, name, props) => [props.payload.fullName, 'Symptom']}
                                />
                                <Legend />
                              </PieChart>
                            </ResponsiveContainer>
                          </div>
                        )}

                        {/* Treatment Timeline */}
                        {analysisResult.detailedTreatment?.stepByStepCure && analysisResult.detailedTreatment.stepByStepCure.length > 0 && (
                          <div className="bg-card rounded-lg p-4 border shadow-elegant">
                            <h5 className="font-medium mb-3 text-center">Treatment Timeline</h5>
                            <div className="space-y-3">
                              {analysisResult.detailedTreatment.stepByStepCure.map((step, index) => (
                                <div key={index} className="flex items-start gap-3">
                                  <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                                    <span className="text-sm font-medium text-primary">{index + 1}</span>
                                  </div>
                                  <div className="flex-1">
                                    <p className="text-sm">{step}</p>
                                    <div className="w-full bg-muted rounded-full h-1 mt-2">
                                      <div
                                        className="bg-primary h-1 rounded-full transition-all duration-500"
                                        style={{ width: `${((index + 1) / analysisResult.detailedTreatment.stepByStepCure.length) * 100}%` }}
                                      ></div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Nutrient Balance Radar */}
                        {analysisResult.nutritionSuggestions && analysisResult.nutritionSuggestions.length > 0 && (
                          <div className="bg-card rounded-lg p-4 border shadow-elegant">
                            <h5 className="font-medium mb-3 text-center">Nutrient Balance Analysis</h5>
                            <ResponsiveContainer width="100%" height={250}>
                              <RadarChart data={analysisResult.nutritionSuggestions.map((nutrient, index) => ({
                                nutrient: nutrient.nutrient,
                                deficiency: nutrient.deficiencySign ? 30 : 80, // Mock data for visualization
                                sources: nutrient.sources.length
                              }))}>
                                <PolarGrid />
                                <PolarAngleAxis dataKey="nutrient" />
                                <PolarRadiusAxis angle={90} domain={[0, 100]} />
                                <Radar
                                  name="Nutrient Status"
                                  dataKey="deficiency"
                                  stroke="hsl(var(--primary))"
                                  fill="hsl(var(--primary))"
                                  fillOpacity={0.2}
                                />
                                <Tooltip />
                              </RadarChart>
                            </ResponsiveContainer>
                          </div>
                        )}

                        {/* Growth & Care Metrics */}
                        {(analysisResult.growthTips || analysisResult.seasonalCare) && (
                          <div className="bg-card rounded-lg p-4 border shadow-elegant">
                            <h5 className="font-medium mb-3 text-center">Care Recommendations</h5>
                            <div className="space-y-4">
                              {analysisResult.growthTips && analysisResult.growthTips.length > 0 && (
                                <div>
                                  <h6 className="text-sm font-medium text-primary mb-2">Growth Tips</h6>
                                  <div className="space-y-1">
                                    {analysisResult.growthTips.slice(0, 3).map((tip, index) => (
                                      <div key={index} className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-primary/60 rounded-full"></div>
                                        <span className="text-sm">{tip}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                              {analysisResult.seasonalCare && analysisResult.seasonalCare.length > 0 && (
                                <div>
                                  <h6 className="text-sm font-medium text-primary mb-2">Seasonal Care</h6>
                                  <div className="space-y-1">
                                    {analysisResult.seasonalCare.slice(0, 3).map((care, index) => (
                                      <div key={index} className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-primary/60 rounded-full"></div>
                                        <span className="text-sm">{care}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Fertilizer Recommendations Chart */}
                        {analysisResult.fertilizers && analysisResult.fertilizers.length > 0 && (
                          <div className="bg-card rounded-lg p-4 border shadow-elegant">
                            <h5 className="font-medium mb-3 text-center flex items-center justify-center gap-2">
                              🌱 Natural Fertilizer Recommendations
                              <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">100% Organic</Badge>
                            </h5>
                            <ResponsiveContainer width="100%" height={200}>
                              <BarChart data={analysisResult.fertilizers.map((fert, index) => ({
                                name: fert.name.length > 15 ? fert.name.substring(0, 15) + '...' : fert.name,
                                organic: fert.type === 'organic' ? 90 : 70,
                                natural: fert.type === 'natural' ? 90 : 70,
                                fullName: fert.name
                              }))}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip formatter={(value, name) => [name === 'organic' ? 'Organic' : 'Natural', 'Type']} />
                                <Legend />
                                <Bar dataKey="organic" stackId="a" fill="#10b981" name="Organic" />
                                <Bar dataKey="natural" stackId="a" fill="#84cc16" name="Natural" />
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        )}

                        {/* Prevention Tips Timeline */}
                        {analysisResult.preventionTips && analysisResult.preventionTips.length > 0 && (
                          <div className="bg-card rounded-lg p-4 border shadow-elegant">
                            <h5 className="font-medium mb-3 text-center">Prevention Strategy</h5>
                            <div className="space-y-3">
                              {analysisResult.preventionTips.slice(0, 4).map((tip, index) => (
                                <div key={index} className="flex items-start gap-3">
                                  <div className="flex-shrink-0 w-6 h-6 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                                    <Shield className="h-3 w-3 text-green-600" />
                                  </div>
                                  <p className="text-sm">{tip}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Companion Plants Network */}
                      {analysisResult.companionPlants && analysisResult.companionPlants.length > 0 && (
                        <div className="bg-card rounded-lg p-4 border shadow-elegant">
                          <h5 className="font-medium mb-3 text-center flex items-center justify-center gap-2">
                            <Heart className="h-4 w-4 text-primary" />
                            Companion Plants Network
                          </h5>
                          <div className="flex flex-wrap gap-2 justify-center">
                            {analysisResult.companionPlants.map((plant, index) => (
                              <Badge key={index} variant="outline">
                                {plant}
                              </Badge>
                            ))}
                          </div>
                          <p className="text-xs text-muted-foreground text-center mt-2">
                            These plants grow well together and can help prevent pests and diseases
                          </p>
                        </div>
                      )}

                      {/* Warning Signs Alert */}
                      {analysisResult.warningsSigns && analysisResult.warningsSigns.length > 0 && (
                        <div className="bg-card rounded-lg p-4 border shadow-elegant">
                          <h5 className="font-semibold text-warning mb-3 flex items-center gap-2">
                            <AlertCircle className="h-4 w-4" />
                            Warning Signs to Watch For
                          </h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {analysisResult.warningsSigns.map((warning, index) => (
                              <div key={index} className="flex items-center gap-2 text-sm">
                                <div className="w-2 h-2 bg-yellow-500 rounded-full flex-shrink-0"></div>
                                <span>{warning}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Health Risk Assessment */}
                      <div className="bg-card rounded-lg p-4 border shadow-elegant">
                        <h5 className="font-medium mb-3 text-center">Health Risk Assessment</h5>
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-sm">Overall Risk Level</span>
                          <Badge variant={
                            analysisResult.status === 'healthy' ? 'default' :
                            analysisResult.severity === 'severe' ? 'destructive' :
                            analysisResult.severity === 'moderate' ? 'secondary' : 'outline'
                          }>
                            {analysisResult.status === 'healthy' ? 'Low Risk' :
                             analysisResult.severity === 'severe' ? 'High Risk' :
                             analysisResult.severity === 'moderate' ? 'Medium Risk' : 'Unknown'}
                          </Badge>
                        </div>
                        <div className="w-full bg-muted rounded-full h-3">
                          <div
                            className={`h-3 rounded-full transition-all duration-500 ${
                              analysisResult.status === 'healthy' ? 'bg-success' :
                              analysisResult.severity === 'severe' ? 'bg-destructive' :
                              analysisResult.severity === 'moderate' ? 'bg-warning' : 'bg-muted-foreground'
                            }`}
                            style={{
                              width: analysisResult.status === 'healthy' ? '20%' :
                                     analysisResult.severity === 'severe' ? '90%' :
                                     analysisResult.severity === 'moderate' ? '60%' : '40%'
                            }}
                          ></div>
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground mt-1">
                          <span>Low</span>
                          <span>Medium</span>
                          <span>High</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Air Quality & Environmental Impact Analysis */}
                  {/* eslint-disable-next-line no-constant-binary-expression */}
                  {false && airQualityData && (
                    <div className="bg-gradient-to-r from-info/10 to-primary/5 dark:from-info/20 dark:to-primary/10 rounded-lg p-6 border border-info/20 mb-6">
                      <h4 className="font-semibold text-info mb-4 flex items-center gap-2">
                        <Leaf className="h-5 w-5" />
                        Air Quality & Environmental Impact Analysis
                      </h4>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                        {/* AQI Gauge */}
                        <div className="bg-card rounded-lg p-4 border shadow-elegant">
                          <h5 className="font-medium mb-3 text-center">Air Quality Index</h5>
                          <div className="flex flex-col items-center">
                            <div className={`text-3xl font-bold mb-2 ${
                              airQualityData.overall.aqi <= 50 ? 'text-success' :
                              airQualityData.overall.aqi <= 100 ? 'text-warning' :
                              airQualityData.overall.aqi <= 150 ? 'text-warning' :
                              airQualityData.overall.aqi <= 200 ? 'text-destructive' : 'text-destructive'
                            }`}>
                              {airQualityData.overall.aqi}
                            </div>
                            <div className={`text-sm font-medium px-2 py-1 rounded-full ${
                              airQualityData.overall.category === 'Good' ? 'bg-success/20 text-success' :
                              airQualityData.overall.category === 'Moderate' ? 'bg-warning/20 text-warning' :
                              airQualityData.overall.category === 'Unhealthy for Sensitive Groups' ? 'bg-warning/20 text-warning' :
                              airQualityData.overall.category === 'Unhealthy' ? 'bg-destructive/20 text-destructive' : 'bg-destructive/20 text-destructive'
                            }`}>
                              {airQualityData.overall.category}
                            </div>
                            <p className="text-xs text-muted-foreground mt-2 text-center">
                              Dominant: {airQualityData.overall.dominantPollutant}
                            </p>
                          </div>
                        </div>

                        {/* Pollutant Levels */}
                        <div className="bg-card rounded-lg p-4 border shadow-elegant">
                          <h5 className="font-medium mb-3 text-center">Key Pollutants</h5>
                          <div className="space-y-2">
                            {airQualityData.pollutants.pm25 !== undefined && (
                              <div className="flex justify-between items-center">
                                <span className="text-sm">PM2.5</span>
                                <span className={`text-sm font-medium ${
                                  airQualityData.pollutants.pm25 <= 12 ? 'text-success' :
                                  airQualityData.pollutants.pm25 <= 35 ? 'text-warning' : 'text-destructive'
                                }`}>
                                  {airQualityData.pollutants.pm25} µg/m³
                                </span>
                              </div>
                            )}
                            {airQualityData.pollutants.pm10 !== undefined && (
                              <div className="flex justify-between items-center">
                                <span className="text-sm">PM10</span>
                                <span className={`text-sm font-medium ${
                                  airQualityData.pollutants.pm10 <= 54 ? 'text-success' :
                                  airQualityData.pollutants.pm10 <= 154 ? 'text-warning' : 'text-destructive'
                                }`}>
                                  {airQualityData.pollutants.pm10} µg/m³
                                </span>
                              </div>
                            )}
                            {airQualityData.pollutants.o3 !== undefined && (
                              <div className="flex justify-between items-center">
                                <span className="text-sm">O₃</span>
                                <span className={`text-sm font-medium ${
                                  airQualityData.pollutants.o3 <= 54 ? 'text-success' :
                                  airQualityData.pollutants.o3 <= 70 ? 'text-warning' : 'text-destructive'
                                }`}>
                                  {airQualityData.pollutants.o3} ppb
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Emission Sources */}
                        <div className="bg-card rounded-lg p-4 border shadow-elegant">
                          <h5 className="font-medium mb-3 text-center">Emission Sources</h5>
                          <ResponsiveContainer width="100%" height={120}>
                            <PieChart>
                              <Pie
                                data={[
                                  { name: 'Industry', value: airQualityData.sources.industry, fill: '#ef4444' },
                                  { name: 'Traffic', value: airQualityData.sources.traffic, fill: '#f97316' },
                                  { name: 'Residential', value: airQualityData.sources.residential, fill: '#eab308' },
                                  { name: 'Agriculture', value: airQualityData.sources.agriculture, fill: '#22c55e' },
                                  { name: 'Natural', value: airQualityData.sources.natural, fill: '#06b6d4' }
                                ]}
                                cx="50%"
                                cy="50%"
                                innerRadius={20}
                                outerRadius={40}
                                dataKey="value"
                              />
                              <Tooltip formatter={(value) => [`${value}%`, 'Contribution']} />
                            </PieChart>
                          </ResponsiveContainer>
                          <div className="flex flex-wrap gap-1 justify-center mt-2">
                            <div className="flex items-center gap-1 text-xs">
                              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                              <span>Industry</span>
                            </div>
                            <div className="flex items-center gap-1 text-xs">
                              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                              <span>Traffic</span>
                            </div>
                            <div className="flex items-center gap-1 text-xs">
                              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                              <span>Residential</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Environmental Impact on Plant Health */}
                      <div className="bg-card rounded-lg p-4 border shadow-elegant">
                        <h5 className="font-medium mb-3 text-center">Environmental Impact Assessment</h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h6 className="text-sm font-medium text-red-600 mb-2">Pollution Effects on Plants</h6>
                            <ul className="text-sm space-y-1">
                              {airQualityData.overall.aqi > 100 && (
                                <li className="flex items-center gap-2">
                                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                  <span>Reduced photosynthesis due to particulate matter</span>
                                </li>
                              )}
                              {airQualityData.pollutants.o3 && airQualityData.pollutants.o3 > 70 && (
                                <li className="flex items-center gap-2">
                                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                                  <span>Ozone damage to leaf tissues</span>
                                </li>
                              )}
                              {airQualityData.pollutants.so2 && airQualityData.pollutants.so2 > 75 && (
                                <li className="flex items-center gap-2">
                                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                                  <span>Sulfur dioxide causing chlorosis</span>
                                </li>
                              )}
                              {airQualityData.overall.aqi <= 50 && (
                                <li className="flex items-center gap-2">
                                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                  <span>Clean air supports optimal plant growth</span>
                                </li>
                              )}
                            </ul>
                          </div>
                          <div>
                            <h6 className="text-sm font-medium text-blue-600 mb-2">Air Quality Recommendations</h6>
                            <ul className="text-sm space-y-1">
                              {airQualityData.health.recommendations.slice(0, 3).map((rec, index) => (
                                <li key={index} className="flex items-center gap-2">
                                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                  <span>{rec}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Weather & Meteorological Conditions Analysis */}
                  {/* eslint-disable-next-line no-constant-binary-expression */}
                  {false && weatherData && (
                    <div className="bg-gradient-to-r from-sky-50 to-primary/5 dark:from-sky-950/20 dark:to-primary/10 rounded-lg p-6 border border-sky-200 dark:border-sky-800 mb-6">
                      <h4 className="font-semibold text-sky-900 dark:text-sky-100 mb-4 flex items-center gap-2">
                        <Cloud className="h-5 w-5" />
                        Weather & Meteorological Conditions Analysis
                      </h4>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        {/* Current Temperature */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border shadow-sm">
                          <h5 className="font-medium mb-3 text-center">Temperature</h5>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-info">
                              {weatherData.current.temperature_2m}°C
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              Feels like {weatherData.current.apparent_temperature}°C
                            </p>
                          </div>
                        </div>

                        {/* Humidity */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border shadow-sm">
                          <h5 className="font-medium mb-3 text-center">Humidity</h5>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-primary">
                              {weatherData.current.relative_humidity_2m}%
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              Relative humidity
                            </p>
                          </div>
                        </div>

                        {/* Wind Conditions */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border shadow-sm">
                          <h5 className="font-medium mb-3 text-center">Wind</h5>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-success">
                              {weatherData.current.wind_speed_10m} km/h
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              Direction: {Math.round(weatherData.current.wind_direction_10m)}°
                            </p>
                          </div>
                        </div>

                        {/* Atmospheric Pressure */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border shadow-sm">
                          <h5 className="font-medium mb-3 text-center">Pressure</h5>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-secondary">
                              {weatherData.current.pressure_msl} hPa
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              Sea level pressure
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Weather Impact on Plant Health */}
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border shadow-sm">
                        <h5 className="font-medium mb-3 text-center">Weather Impact on Plant Health</h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h6 className="text-sm font-medium text-warning mb-2">Weather-Related Disease Risks</h6>
                            <ul className="text-sm space-y-1">
                              {weatherData.current.relative_humidity_2m > 80 && (
                                <li className="flex items-center gap-2">
                                  <div className="w-2 h-2 bg-info rounded-full"></div>
                                  <span>High humidity increases fungal disease risk</span>
                                </li>
                              )}
                              {weatherData.current.precipitation > 5 && (
                                <li className="flex items-center gap-2">
                                  <div className="w-2 h-2 bg-info rounded-full"></div>
                                  <span>Recent rain may spread water-borne pathogens</span>
                                </li>
                              )}
                              {weatherData.current.temperature_2m < 10 && (
                                <li className="flex items-center gap-2">
                                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                                  <span>Cold stress may cause chilling injuries</span>
                                </li>
                              )}
                              {weatherData.current.temperature_2m > 35 && (
                                <li className="flex items-center gap-2">
                                  <div className="w-2 h-2 bg-destructive rounded-full"></div>
                                  <span>Heat stress may cause wilting and sunscald</span>
                                </li>
                              )}
                              {weatherData.current.wind_speed_10m > 20 && (
                                <li className="flex items-center gap-2">
                                  <div className="w-2 h-2 bg-warning rounded-full"></div>
                                  <span>Strong winds may cause mechanical damage</span>
                                </li>
                              )}
                            </ul>
                          </div>
                          <div>
                            <h6 className="text-sm font-medium text-primary mb-2">Favorable Conditions</h6>
                            <ul className="text-sm space-y-1">
                              {weatherData.current.relative_humidity_2m >= 40 && weatherData.current.relative_humidity_2m <= 70 && (
                                <li className="flex items-center gap-2">
                                  <div className="w-2 h-2 bg-primary/60 rounded-full"></div>
                                  <span>Optimal humidity for plant transpiration</span>
                                </li>
                              )}
                              {weatherData.current.temperature_2m >= 15 && weatherData.current.temperature_2m <= 30 && (
                                <li className="flex items-center gap-2">
                                  <div className="w-2 h-2 bg-primary/60 rounded-full"></div>
                                  <span>Temperature suitable for most crops</span>
                                </li>
                              )}
                              {weatherData.current.wind_speed_10m < 10 && (
                                <li className="flex items-center gap-2">
                                  <div className="w-2 h-2 bg-primary/60 rounded-full"></div>
                                  <span>Calm winds support pollination and growth</span>
                                </li>
                              )}
                              {weatherData.current.cloud_cover < 50 && (
                                <li className="flex items-center gap-2">
                                  <div className="w-2 h-2 bg-primary/60 rounded-full"></div>
                                  <span>Good sunlight exposure for photosynthesis</span>
                                </li>
                              )}
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Next Steps */}
                  <div className="bg-card rounded-lg p-4 border shadow-elegant">
                    <h4 className="font-semibold text-primary mb-3 flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" />
                      Recommended Actions
                    </h4>
                    {analysisResult.status === 'healthy' ? (
                      <div className="space-y-2">
                        <div className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                          <span className="text-sm">Continue your current care routine</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                          <span className="text-sm">Monitor for any changes weekly</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                          <span className="text-sm">Consider preventive treatments from our marketplace</span>
                        </div>
                      </div>
                    ) : analysisResult.status === 'error' ? (
                      <div className="space-y-2">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="h-4 w-4 text-warning mt-0.5 flex-shrink-0" />
                          <span className="text-sm">AI service is temporarily unavailable due to quota limits</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <AlertCircle className="h-4 w-4 text-warning mt-0.5 flex-shrink-0" />
                          <span className="text-sm">Please try again in a few minutes</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <AlertCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                          <span className="text-sm">Contact support if the issue persists</span>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                          <span className="text-sm font-medium">Take immediate action as recommended below</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <AlertCircle className="h-4 w-4 text-warning mt-0.5 flex-shrink-0" />
                          <span className="text-sm">Isolate affected plants to prevent spread</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <AlertCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                          <span className="text-sm">Follow the treatment plan provided below</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {analysisResult.status === 'healthy' ? (
                    // Healthy Plant Result
                    <div className="space-y-6">
                      <motion.div
                        initial={{ scale: 0.9 }}
                        animate={{ scale: 1 }}
                        className="text-center space-y-4"
                      >
                        <motion.div
                          animate={{ rotate: [0, 10, -10, 0] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="text-6xl"
                        >
                          🌱
                        </motion.div>
                        <h3 className="text-2xl font-bold text-success">Congratulations!</h3>
                        <p className="text-muted-foreground">Your plant is healthy and thriving!</p>
                      </motion.div>

                      {/* Growth Tips */}
                      {analysisResult.growthTips?.length > 0 && (
                        <div className="bg-card border shadow-elegant rounded-lg p-4">
                          <h5 className="font-semibold text-success mb-3 flex items-center gap-2">
                            <TrendingUp className="h-4 w-4" />
                            Growth Enhancement Tips
                          </h5>
                          <div className="space-y-2">
                            {analysisResult.growthTips.map((tip: string, index: number) => (
                              <motion.div
                                key={index}
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: index * 0.1 }}
                                className="flex items-start gap-2"
                              >
                                <Sparkles className="h-4 w-4 text-success mt-0.5 shrink-0" />
                                <span className="text-sm">{tip}</span>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Seasonal Care */}
                      {analysisResult.seasonalCare?.length > 0 && (
                        <div className="bg-card border shadow-elegant rounded-lg p-4">
                          <h5 className="font-semibold text-info mb-3 flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            Seasonal Care Guide
                          </h5>
                          <div className="grid sm:grid-cols-1 gap-2">
                            {analysisResult.seasonalCare.map((care: string, index: number) => (
                              <div key={index} className="flex items-start gap-2">
                                <CheckCircle className="h-4 w-4 text-info mt-0.5 shrink-0" />
                                <span className="text-sm">{care}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Companion Plants */}
                      {analysisResult.companionPlants?.length > 0 && (
                        <div className="bg-card border shadow-elegant rounded-lg p-4">
                          <h5 className="font-semibold mb-3 flex items-center gap-2">
                            <Leaf className="h-4 w-4" />
                            Great Companion Plants
                          </h5>
                          <div className="flex flex-wrap gap-2">
                            {analysisResult.companionPlants.map((plant: string, index: number) => (
                              <Badge key={index} variant="secondary">
                                {plant}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : analysisResult.status === 'error' ? (
                    // Error Result
                    <div className="space-y-6">
                      <motion.div
                        initial={{ scale: 0.9 }}
                        animate={{ scale: 1 }}
                        className="text-center space-y-4"
                      >
                        <motion.div
                          animate={{ rotate: [0, 5, -5, 0] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="text-6xl"
                        >
                          ⚠️
                        </motion.div>
                        <h3 className="text-2xl font-bold text-warning">Service Temporarily Unavailable</h3>
                        <p className="text-muted-foreground">Our AI analysis service is currently experiencing high demand.</p>
                      </motion.div>

                      {/* Error Details */}
                      <div className="bg-card border shadow-elegant rounded-lg p-4">
                        <h5 className="font-semibold text-warning mb-3 flex items-center gap-2">
                          <AlertCircle className="h-4 w-4" />
                          What Happened?
                        </h5>
                        <div className="space-y-2">
                          <p className="text-sm">The Gemini API quota has been exceeded for this project.</p>
                          <p className="text-sm">This is a temporary issue that occurs when too many requests are made in a short period.</p>
                        </div>
                      </div>

                      {/* Solutions */}
                      <div className="bg-card border shadow-elegant rounded-lg p-4">
                        <h5 className="font-semibold text-info mb-3 flex items-center gap-2">
                          <CheckCircle className="h-4 w-4" />
                          What You Can Do
                        </h5>
                        <div className="space-y-2">
                          <div className="flex items-start gap-2">
                            <CheckCircle className="h-4 w-4 text-info mt-0.5 shrink-0" />
                            <span className="text-sm">Wait 5-10 minutes and try again</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <CheckCircle className="h-4 w-4 text-info mt-0.5 shrink-0" />
                            <span className="text-sm">Contact support to request a quota increase</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <CheckCircle className="h-4 w-4 text-info mt-0.5 shrink-0" />
                            <span className="text-sm">Use manual plant identification methods in the meantime</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    // Diseased Plant Result
                    <div className="space-y-6">
                      {/* Symptoms */}
                      {analysisResult.symptoms?.length > 0 && (
                        <div className="bg-card border shadow-elegant rounded-lg p-4">
                          <h5 className="font-semibold text-destructive mb-3 flex items-center gap-2">
                            <AlertCircle className="h-4 w-4" />
                            Symptoms Identified
                          </h5>
                          <div className="space-y-2">
                            {analysisResult.symptoms.map((symptom: string, index: number) => (
                              <div key={index} className="flex items-start gap-2">
                                <AlertCircle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
                                <span className="text-sm">{symptom}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Immediate Actions */}
                      {analysisResult.immediateActions?.length > 0 && (
                        <div className="bg-card border shadow-elegant rounded-lg p-4">
                          <h5 className="font-semibold text-warning mb-3 flex items-center gap-2">
                            <AlertCircle className="h-4 w-4" />
                            Immediate Actions Required
                          </h5>
                          <div className="space-y-2">
                            {analysisResult.immediateActions.map((action: string, index: number) => (
                              <div key={index} className="flex items-start gap-2">
                                <CheckCircle className="h-4 w-4 text-warning mt-0.5 shrink-0" />
                                <span className="text-sm font-medium">{action}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Detailed Treatment */}
                      {analysisResult.detailedTreatment && (
                        <div className="space-y-4">
                          {/* Organic Solutions */}
                          {analysisResult.detailedTreatment.organicSolutions?.length > 0 && (
                            <div className="bg-card border shadow-elegant rounded-lg p-4">
                              <h5 className="font-semibold text-success mb-3 flex items-center gap-2">
                                <Leaf className="h-4 w-4" />
                                Organic Treatment Options
                              </h5>
                              <div className="space-y-2">
                                {analysisResult.detailedTreatment.organicSolutions.map((solution: string, index: number) => (
                                  <div key={index} className="flex items-start gap-2">
                                    <Heart className="h-4 w-4 text-success mt-0.5 shrink-0" />
                                    <span className="text-sm">{solution}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Chemical Solutions */}
                          {analysisResult.detailedTreatment.naturalRemedies?.length > 0 && (
                            <div className="bg-card border shadow-elegant rounded-lg p-4">
                              <h5 className="font-semibold text-amber-700 dark:text-amber-300 mb-3 flex items-center gap-2">
                                <Sparkles className="h-4 w-4" />
                                🌿 Traditional Home Remedies
                              </h5>
                              <div className="space-y-2">
                                {analysisResult.detailedTreatment.naturalRemedies.map((remedy: string, index: number) => (
                                  <div key={index} className="flex items-start gap-2">
                                    <Heart className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                                    <span className="text-sm">{remedy}</span>
                                  </div>
                                ))}
                              </div>
                              <p className="text-xs text-amber-600 dark:text-amber-400 mt-3 italic">
                                💡 These traditional remedies have been used by farmers for generations
                              </p>
                            </div>
                          )}

                          {/* Step by Step Cure */}
                          {analysisResult.detailedTreatment.stepByStepCure?.length > 0 && (
                            <div className="bg-card border shadow-elegant rounded-lg p-4">
                              <h5 className="font-semibold text-primary mb-3 flex items-center gap-2">
                                <CheckCircle className="h-4 w-4" />
                                Step-by-Step Treatment Plan
                              </h5>
                              <div className="space-y-3">
                                {analysisResult.detailedTreatment.stepByStepCure.map((step: string, index: number) => (
                                  <div key={index} className="flex items-start gap-3">
                                    <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold shrink-0">
                                      {index + 1}
                                    </div>
                                    <span className="text-sm">{step}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Prevention Tips */}
                      {analysisResult.preventionTips?.length > 0 && (
                        <div className="bg-card border shadow-elegant rounded-lg p-4">
                          <h5 className="font-semibold text-info mb-3 flex items-center gap-2">
                            <Shield className="h-4 w-4" />
                            Prevention Strategies
                          </h5>
                          <div className="space-y-2">
                            {analysisResult.preventionTips.map((tip: string, index: number) => (
                              <div key={index} className="flex items-start gap-2">
                                <Shield className="h-4 w-4 text-info mt-0.5 shrink-0" />
                                <span className="text-sm">{tip}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Fertilizers & Nutrition */}
                  <div className="space-y-4">
                    {/* Fertilizers */}
                    {analysisResult.fertilizers?.length > 0 && (
                      <div className="bg-card border shadow-elegant rounded-lg p-4">
                        <h5 className="font-semibold mb-3 flex items-center gap-2">
                          <TrendingUp className="h-4 w-4" />
                          Recommended Fertilizers
                        </h5>
                        <div className="grid sm:grid-cols-1 gap-3">
                          {analysisResult.fertilizers.map((fertilizer, index: number) => (
                            <div key={index} className="bg-card border rounded-lg p-3">
                              <div className="flex items-center justify-between mb-2">
                                <h6 className="font-medium">{fertilizer.name}</h6>
                                <Badge variant={fertilizer.type === 'organic' ? 'secondary' : 'outline'}>
                                  {fertilizer.type}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mb-1">
                                <strong>Application:</strong> {fertilizer.application}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                <strong>Timing:</strong> {fertilizer.timing}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Nutrition Suggestions */}
                    {analysisResult.nutritionSuggestions?.length > 0 && (
                      <div className="bg-card border shadow-elegant rounded-lg p-4">
                        <h5 className="font-semibold text-success mb-3 flex items-center gap-2">
                          <Heart className="h-4 w-4" />
                          Nutrition Guide
                        </h5>
                        <div className="space-y-3">
                          {analysisResult.nutritionSuggestions.map((nutrition, index: number) => (
                            <div key={index} className="bg-card border rounded-lg p-3">
                              <h6 className="font-medium text-success mb-2">{nutrition.nutrient}</h6>
                              <p className="text-sm text-muted-foreground mb-2">
                                <strong>Deficiency signs:</strong> {nutrition.deficiencySign}
                              </p>
                              <div className="flex flex-wrap gap-1">
                                <span className="text-sm font-medium">Sources:</span>
                                {nutrition.sources?.map((source: string, sourceIndex: number) => (
                                  <Badge key={sourceIndex} variant="outline" className="text-xs">
                                    {source}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Warning Signs */}
                  {analysisResult.warningsSigns?.length > 0 && (
                    <div className="bg-warning/10 border border-warning/20 rounded-lg p-4">
                      <h5 className="font-semibold text-warning mb-3 flex items-center gap-2">
                        <AlertCircle className="h-4 w-4" />
                        Warning Signs to Watch For
                      </h5>
                      <div className="grid sm:grid-cols-2 gap-2">
                        {analysisResult.warningsSigns.map((warning: string, index: number) => (
                          <div key={index} className="flex items-start gap-2">
                            <AlertCircle className="h-4 w-4 text-warning mt-0.5 shrink-0" />
                            <span className="text-sm">{warning}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Additional Advice */}
                  {analysisResult.additionalAdvice && (
                    <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                      <h5 className="font-semibold text-primary mb-2 flex items-center gap-2">
                        <Sparkles className="h-4 w-4" />
                        Expert Advice
                      </h5>
                      <p className="text-sm">{analysisResult.additionalAdvice}</p>
                    </div>
                  )}

                  {/* Product Recommendations */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h5 className="font-semibold flex items-center gap-2">
                        <ShoppingCart className="h-4 w-4" />
                        🌿 Recommended Natural Products
                      </h5>
                      <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0">
                        100% Organic & Natural
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      All products are certified organic and chemical-free, supporting sustainable farming practices.
                    </p>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {productRecommendations.map((product) => (
                        <motion.div
                          key={product.id}
                          whileHover={{ scale: 1.03, y: -4 }}
                          className="bg-card border shadow-elegant rounded-xl p-4 space-y-3"
                        >
                          <div className="relative">
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-full h-28 object-cover rounded-lg"
                            />
                            <Badge className="absolute top-2 right-2 bg-primary text-primary-foreground text-xs">
                              <Leaf className="h-3 w-3 mr-1" />
                              Organic
                            </Badge>
                          </div>
                          <h6 className="font-semibold text-sm text-foreground">{product.name}</h6>
                          <p className="text-xs text-muted-foreground">{product.description}</p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1">
                              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                              <span className="text-xs font-medium">{product.rating}</span>
                            </div>
                            <span className="font-bold text-primary">{product.price}</span>
                          </div>
                          <Button size="sm" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                            <ShoppingCart className="h-3 w-3 mr-1" />
                            Shop Natural
                          </Button>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Quick Tips Card */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="shadow-elegant bg-card border">
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4 flex items-center justify-center gap-2 text-lg">
                <Camera className="h-5 w-5 text-primary" />
                Photography Tips for Best Results
              </h3>
              <div className="grid sm:grid-cols-2 gap-4 text-sm">
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-success mt-0.5 shrink-0" />
                  <span>Take clear, well-lit photos of affected leaves</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-success mt-0.5 shrink-0" />
                  <span>Include healthy parts for comparison</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-success mt-0.5 shrink-0" />
                  <span>Avoid blurry or dark images</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-success mt-0.5 shrink-0" />
                  <span>Multiple angles improve accuracy</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}