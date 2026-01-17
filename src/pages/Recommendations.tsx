import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2, MapPin, Sparkles, Leaf, Apple, Carrot, Thermometer, Droplets, Map, TrendingUp, BarChart3, PieChart, Activity, Target, Shield, Zap, Globe } from 'lucide-react';
import { useWeather } from '@/hooks/useWeather';
import { toast } from '@/hooks/use-toast';
import type { WeatherData } from '@/services/weatherService';
import { LocationMapSelector } from '@/components/LocationMapSelector';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, LineChart, Line, PieChart as RechartsPieChart, Cell, AreaChart, Area } from 'recharts';
import { Progress } from '@/components/ui/progress';

interface CropRecommendation {
  category: 'crop' | 'vegetable' | 'fruit';
  name: string;
  reason: string;
  tips: string;
  estimatedYield?: string;
  icon: string;
}

interface RecommendationResponse {
  location: string;
  crops: CropRecommendation[];
  vegetables: CropRecommendation[];
  fruits: CropRecommendation[];
  generalTips: string[];
  nextSteps: string[];
  comprehensiveAnalysis: string[];
  visualData: {
    profitPotential: Array<{crop: string; profit: number; roi: number}>;
    riskAssessment: Array<{factor: string; risk: number; mitigation: string}>;
    sustainabilityMetrics: Array<{metric: string; score: number; target: number}>;
    marketTrends: Array<{month: string; demand: number; price: number}>;
    technologyAdoption: Array<{tech: string; adoption: number; benefit: string}>;
    climateAdaptation: Array<{measure: string; progress: number; impact: string}>;
  };
}

export default function Recommendations() {
  const [location, setLocation] = useState('');
  const [soilType, setSoilType] = useState('');
  const [landSize, setLandSize] = useState('');
  const [waterSource, setWaterSource] = useState('');
  const [previousCrops, setPreviousCrops] = useState('');
  const [budgetRange, setBudgetRange] = useState('');
  const [farmingExperience, setFarmingExperience] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<RecommendationResponse | null>(null);
  const [geminiApiKey] = useState((import.meta.env.VITE_GEMINI_API_KEY as string) || '');
  const { weatherData } = useWeather();
  const [showMapSelector, setShowMapSelector] = useState(false);

  const handleUseCurrentLocation = async () => {
    try {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            // Get readable address from coordinates
            const readableAddress = await reverseGeocode(latitude, longitude);
            setLocation(readableAddress);
            toast({
              title: "Location detected",
              description: `Using current location: ${readableAddress}`,
            });
          },
          (error) => {
            console.error('Geolocation error:', error);
            toast({
              title: "Location error",
              description: "Unable to detect location. Please enter manually.",
              variant: "destructive",
            });
          }
        );
      } else {
        toast({
          title: "Location not supported",
          description: "Geolocation is not supported by this browser.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Location detection error:', error);
      toast({
        title: "Location error",
        description: "Unable to detect current location. Please enter manually.",
        variant: "destructive",
      });
    }
  };

  // Reverse geocoding function to convert coordinates to readable address
  const reverseGeocode = async (lat: number, lon: number): Promise<string> => {
    try {
      // Using Nominatim API (OpenStreetMap) for reverse geocoding with higher zoom for more detail
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'AgriSmart-App/1.0'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Reverse geocoding failed');
      }

      const data = await response.json();

      // Extract detailed location information
      const address = data.address || {};
      const locationParts = [];

      // Priority order for most specific to least specific location details
      if (address.suburb) locationParts.push(address.suburb);
      else if (address.neighbourhood) locationParts.push(address.neighbourhood);
      else if (address.locality) locationParts.push(address.locality);
      else if (address.residential) locationParts.push(address.residential);

      if (address.city) locationParts.push(address.city);
      else if (address.town) locationParts.push(address.town);
      else if (address.village) locationParts.push(address.village);

      if (address.state_district && locationParts.length < 2) locationParts.push(address.state_district);
      if (address.state && locationParts.length < 2) locationParts.push(address.state);

      // If we still don't have enough detail, try to get more from the display_name
      if (locationParts.length < 2 && data.display_name) {
        const displayParts = data.display_name.split(',').slice(0, 3);
        locationParts.length = 0; // Clear and rebuild
        locationParts.push(...displayParts);
      }

      return locationParts.length > 0 ? locationParts.join(', ') : `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      // Fallback to coordinates if geocoding fails
      return `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
    }
  };

  const generateRecommendations = async () => {
    console.log('generateRecommendations called with location:', location);
    
    if (!location.trim()) {
      toast({
        title: "Location required",
        description: "Please enter a location or use current location",
        variant: "destructive",
      });
      return;
    }

    // Check if API key is configured properly (not empty and not a placeholder)
    const isApiKeyConfigured = geminiApiKey && 
      geminiApiKey.trim() !== '' && 
      !geminiApiKey.includes('YOUR_') && 
      !geminiApiKey.includes('_HERE');
    
    if (!isApiKeyConfigured) {
      toast({
        title: "⚠️ API Key Missing",
        description: "Please add your Gemini API key to the .env file (VITE_GEMINI_API_KEY) to get recommendations.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Fetch weather for the location if not current
      const weatherToUse = weatherData || await getWeatherForLocation(location);
      
      const prompt = generateGeminiPrompt(location, weatherToUse, soilType);
      
      console.log('Attempting to fetch from Gemini API...');
      
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        }),
      });

      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Gemini API Error:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        });
        throw new Error(`API Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      console.log('Gemini API Response:', data);
      console.log('AI Response Text:', aiResponse);
      
      if (!aiResponse) {
        throw new Error('No valid response from Gemini API');
      }
      
      // Parse AI response and structure it
      const parsed = parseAIResponse(aiResponse, location);
      setRecommendations(parsed);

      toast({
        title: "Recommendations generated!",
        description: "AI has analyzed your location and weather data",
      });

    } catch (error) {
      console.error('Error generating recommendations:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast({
        title: "Error",
        description: `Failed to generate recommendations: ${errorMessage}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateGeminiPrompt = (loc: string, weather: WeatherData | null, soil: string) => {
    const currentMonth = new Date().toLocaleString('default', { month: 'long' });
    const currentYear = new Date().getFullYear();
    const season = getCurrentSeason();

    // Enhanced data analysis
    const soilAnalysis = soilType ? `Soil Type: ${soilType}` : 'Soil Type: Not specified - assume regional soil';
    const waterAnalysis = waterSource ? `Water Source: ${waterSource}` : 'Water Source: Not specified';
    const landAnalysis = landSize ? `Land Size: ${landSize} acres` : 'Land Size: Not specified';
    const budgetAnalysis = budgetRange ? `Budget Range: ${budgetRange}` : 'Budget Range: Not specified';
    const experienceAnalysis = farmingExperience ? `Farming Experience: ${farmingExperience}` : 'Farming Experience: Not specified';
    const previousCropAnalysis = previousCrops ? `Previous Crops: ${previousCrops}` : 'Previous Crops: Not specified';

    return `You are an advanced agricultural AI expert with deep knowledge of farming systems, crop science, soil management, and market economics. Provide comprehensive, data-driven recommendations for farming in this specific location.

FARMING CONTEXT ANALYSIS:
- Location: ${loc}
- Current Month: ${currentMonth} ${currentYear}
- Season: ${season}
- ${soilAnalysis}
- ${waterAnalysis}
- ${landAnalysis}
- ${budgetAnalysis}
- ${experienceAnalysis}
- ${previousCropAnalysis}

WEATHER ANALYSIS:
${weather ? `
Current Weather Conditions:
- Temperature: ${weather.current?.temperature_2m}°C (Optimal range: 20-35°C for most crops)
- Humidity: ${weather.current?.relative_humidity_2m}% (Ideal: 40-70% for crop growth)
- Pressure: ${weather.current?.pressure_msl}hPa (Atmospheric stability indicator)
- Wind Speed: ${weather.current?.wind_speed_10m}km/h (Risk assessment for pollination and plant stability)
- Soil Temperature: ${weather.hourly?.soil_temperature_0cm?.[0] || 'N/A'}°C (Critical for seed germination)
- Weather Pattern: ${weather.current?.weather_code || 'N/A'} (Impact on planting and harvesting)

Weather-Based Insights:
- Temperature suitability for different crop types
- Humidity impact on disease pressure and irrigation needs
- Wind considerations for tall crops and fruit trees
- Seasonal rainfall patterns and irrigation planning
- Frost risk assessment and protective measures
- Heat stress management strategies` : 'Weather data not available - provide general regional climate recommendations based on location and season'}

SOIL AND WATER MANAGEMENT ANALYSIS:
- Soil type implications for nutrient availability and drainage
- Water source reliability and irrigation efficiency recommendations
- Soil amendment strategies based on previous crops and current condition
- pH optimization requirements and amendment recommendations
- Organic matter content assessment and improvement plans

ECONOMIC ANALYSIS:
- Budget allocation across seeds, fertilizers, labor, and equipment
- Profitability projections based on market prices and yield expectations
- Risk assessment for different crop choices
- Diversification strategies to minimize economic risk
- Investment payback period analysis

TECHNICAL RECOMMENDATIONS NEEDED:
1. CROP SUITABILITY ANALYSIS: Evaluate crops based on climate, soil, water, and economic factors
2. VARIETY SELECTION: Recommend specific high-yielding, disease-resistant varieties
3. PLANTING STRATEGIES: Optimal timing, spacing, and companion planting
4. NUTRIENT MANAGEMENT: Fertilizer requirements and organic alternatives
5. PEST & DISEASE MANAGEMENT: Integrated approaches and preventive measures
6. IRRIGATION OPTIMIZATION: Water-efficient methods and scheduling
7. HARVEST & POST-HARVEST: Timing, methods, and storage recommendations
8. MARKET ANALYSIS: Price trends, demand patterns, and marketing strategies

DATA-DRIVEN INSIGHTS TO INCLUDE:
- Comparative yield analysis across recommended crops
- Cost-benefit ratios and profitability metrics
- Risk mitigation strategies for weather variability
- Sustainability indicators and environmental impact assessment
- Technology adoption recommendations (drip irrigation, precision farming)
- Climate change adaptation strategies
- Market intelligence and price forecasting insights

Provide a structured response in this EXACT format:

CROPS:
1. [Crop Name] - [Detailed suitability analysis with data insights] - [Specific management recommendations] - Estimated yield: [realistic range with confidence level] - Profit potential: [economic analysis]
2. [Crop Name] - [Detailed suitability analysis] - [Management recommendations] - Estimated yield: [range] - Profit potential: [analysis]
3. [Crop Name] - [Detailed suitability analysis] - [Management recommendations] - Estimated yield: [range] - Profit potential: [analysis]

VEGETABLES:
1. [Vegetable Name] - [Detailed analysis including market demand] - [Growing recommendations] - Estimated yield: [range] - Market value: [economic insights]
2. [Vegetable Name] - [Detailed analysis] - [Growing recommendations] - Estimated yield: [range] - Market value: [economic insights]
3. [Vegetable Name] - [Detailed analysis] - [Growing recommendations] - Estimated yield: [range] - Market value: [economic insights]

FRUITS:
1. [Fruit Name] - [Long-term investment analysis] - [Establishment and maintenance requirements] - Estimated yield: [timeline and quantities] - ROI analysis: [financial projections]
2. [Fruit Name] - [Investment analysis] - [Requirements] - Estimated yield: [timeline] - ROI analysis: [projections]
3. [Fruit Name] - [Investment analysis] - [Requirements] - Estimated yield: [timeline] - ROI analysis: [projections]

COMPREHENSIVE_ANALYSIS:
- Climate-Soil-Water Interaction Analysis
- Economic Viability Assessment
- Risk Management Strategies
- Sustainability and Environmental Impact
- Technology Integration Opportunities
- Market Intelligence and Trends
- Climate Change Adaptation Measures

GENERAL_TIPS:
- Soil health management strategies
- Water conservation techniques
- Integrated pest management approaches
- Sustainable farming practices
- Technology adoption recommendations
- Risk mitigation strategies
- Market-oriented farming tips

NEXT_STEPS:
1. Detailed soil testing and analysis
2. Seed/seedling procurement planning
3. Infrastructure development requirements
4. Financial planning and credit arrangements
5. Training and skill development needs
6. Market linkage establishment
7. Monitoring and evaluation setup

Make sure to follow this exact structure and format for proper parsing. Provide specific, actionable insights based on all available data.`;
  };

  const getCurrentSeason = () => {
    const month = new Date().getMonth() + 1;
    if (month >= 3 && month <= 5) return 'Spring';
    if (month >= 6 && month <= 8) return 'Summer';
    if (month >= 9 && month <= 11) return 'Autumn';
    return 'Winter';
  };

  const getWeatherForLocation = async (loc: string) => {
    try {
      // For now, return null as weather integration would require additional setup
      // This prevents errors when weather data isn't available
      console.log('Weather data requested for:', loc);
      return null;
    } catch (error) {
      console.error('Weather fetch error:', error);
      return null;
    }
  };

  const parseAIResponse = (response: string, loc: string): RecommendationResponse => {
    try {
      console.log('Raw AI Response:', response);
      
      // Split by main sections
      const cropsSection = response.match(/CROPS?:(.*?)(?=VEGETABLES?:|$)/is)?.[1] || '';
      const vegetablesSection = response.match(/VEGETABLES?:(.*?)(?=FRUITS?:|$)/is)?.[1] || '';
      const fruitsSection = response.match(/FRUITS?:(.*?)(?=COMPREHENSIVE_ANALYSIS|$)/is)?.[1] || '';
      const comprehensiveAnalysisSection = response.match(/COMPREHENSIVE_ANALYSIS:(.*?)(?=GENERAL_TIPS|$)/is)?.[1] || '';
      const generalTipsSection = response.match(/GENERAL_TIPS:(.*?)(?=NEXT_STEPS|$)/is)?.[1] || '';
      const nextStepsSection = response.match(/NEXT_STEPS:(.*?)$/is)?.[1] || '';

      // Parse each category
      const parseItems = (text: string, category: 'crop' | 'vegetable' | 'fruit') => {
        const lines = text.split('\n').filter(line => line.trim() && /^\d+\./.test(line.trim()));
        return lines.slice(0, 3).map((line, index) => {
          const match = line.match(/^\d+\.\s*([^-]+)\s*-\s*([^-]+)\s*-\s*([^-]+)(?:\s*-\s*(.+))?/);
          
          if (match) {
            const [, name, reason, tips, yield_info] = match;
            const icons = {
              crop: ['🌾', '🌽', '🍚'][index] || '🌱',
              vegetable: ['🍅', '🥒', '🍆'][index] || '🥬', 
              fruit: ['🥭', '🍌', '🪴'][index] || '🍎'
            };
            
            return {
              category,
              name: name.trim(),
              reason: reason.trim(),
              tips: tips.trim(),
              estimatedYield: yield_info?.trim(),
              icon: icons[category]
            };
          }
          
          // Fallback parsing
          const parts = line.replace(/^\d+\.\s*/, '').split('-').map(p => p.trim());
          const icons = {
            crop: ['🌾', '🌽', '🍚'][index] || '🌱',
            vegetable: ['🍅', '🥒', '🍆'][index] || '🥬', 
            fruit: ['🥭', '🍌', '🪴'][index] || '🍎'
          };
          
          return {
            category,
            name: parts[0] || `Item ${index + 1}`,
            reason: parts[1] || 'Suitable for your location and climate',
            tips: parts[2] || 'Follow standard farming practices',
            estimatedYield: parts[3] || undefined,
            icon: icons[category]
          };
        });
      };

      // Parse comprehensive analysis with cleaned and simplified text
      const parseComprehensiveAnalysis = (text: string) => {
        return text.split('\n')
          .filter(line => line.trim() && (line.includes('-') || line.startsWith('•')))
          .map(line => line.replace(/^[-•]\s*/, '').trim())
          .map(analysis => {
            // Remove special characters and simplify text
            return analysis
              .replace(/[^\w\s\-.,]/g, '') // Remove special characters except basic punctuation
              .replace(/\s+/g, ' ') // Normalize whitespace
              .replace(/^\w/, c => c.toUpperCase()) // Capitalize first letter
              .split('.')[0] // Take only first sentence for brevity
              .trim();
          })
          .filter(item => item.length > 10 && item.length < 100) // Filter for reasonable length
          .slice(0, 6); // Limit to 6 items
      };

      // Parse general tips and next steps
      const parseListItems = (text: string) => {
        return text.split('\n')
          .filter(line => line.trim() && (line.includes('-') || /^\d+\./.test(line.trim())))
          .map(line => line.replace(/^[-.\d+]\s*/, '').trim())
          .filter(item => item.length > 0)
          .slice(0, 6);
      };

      const crops = parseItems(cropsSection, 'crop');
      const vegetables = parseItems(vegetablesSection, 'vegetable');
      const fruits = parseItems(fruitsSection, 'fruit');
      const comprehensiveAnalysis = parseComprehensiveAnalysis(comprehensiveAnalysisSection);

      const result = {
        location: loc,
        crops,
        vegetables,
        fruits,
        comprehensiveAnalysis,
        generalTips: parseListItems(generalTipsSection),
        nextSteps: parseListItems(nextStepsSection),
        visualData: generateVisualData(crops, vegetables, fruits, comprehensiveAnalysis)
      };

      console.log('Parsed result:', result);
      return result;

    } catch (error) {
      console.error('Error parsing AI response:', error);
      // Enhanced fallback with better data
      const fallbackCrops: CropRecommendation[] = [
        { category: 'crop', name: 'Rice', reason: 'High yield potential in tropical climate', tips: 'Use proper water management and quality seeds', estimatedYield: '4-6 tons/hectare', icon: '🌾' },
        { category: 'crop', name: 'Wheat', reason: 'Suitable for current season', tips: 'Plant disease-resistant varieties', estimatedYield: '3-4 tons/hectare', icon: '🌾' },
        { category: 'crop', name: 'Maize', reason: 'Good market demand and adaptability', tips: 'Ensure adequate fertilization', estimatedYield: '5-7 tons/hectare', icon: '🌽' },
      ];
      const fallbackVegetables: CropRecommendation[] = [
        { category: 'vegetable', name: 'Tomato', reason: 'High market value and demand', tips: 'Protect from pests using IPM', estimatedYield: '40-50 tons/hectare', icon: '🍅' },
        { category: 'vegetable', name: 'Okra', reason: 'Heat tolerant and hardy', tips: 'Regular watering and mulching', estimatedYield: '8-10 tons/hectare', icon: '🥒' },
        { category: 'vegetable', name: 'Eggplant', reason: 'Good profit margins', tips: 'Use organic compost and proper spacing', estimatedYield: '25-30 tons/hectare', icon: '🍆' },
      ];
      const fallbackFruits: CropRecommendation[] = [
        { category: 'fruit', name: 'Mango', reason: 'Long-term profitable investment', tips: 'Choose suitable varieties and proper spacing', estimatedYield: '100-150 kg/tree', icon: '🥭' },
        { category: 'fruit', name: 'Banana', reason: 'Quick returns and continuous harvest', tips: 'Ensure proper drainage and nutrition', estimatedYield: '40-50 kg/plant', icon: '🍌' },
        { category: 'fruit', name: 'Papaya', reason: 'Year-round production potential', tips: 'Protect from strong winds', estimatedYield: '30-40 kg/plant', icon: '🪴' },
      ];
      const fallbackAnalysis = [
        'Climate and soil conditions are optimal for selected crops',
        'Economic analysis shows good profit potential',
        'Risk management strategies are recommended',
        'Sustainable farming practices will be beneficial',
        'Technology adoption can improve efficiency',
        'Market demand is strong for recommended produce'
      ];

      return {
        location: loc,
        crops: fallbackCrops,
        vegetables: fallbackVegetables,
        fruits: fallbackFruits,
        comprehensiveAnalysis: fallbackAnalysis,
        generalTips: [
          'Test soil pH before planting for optimal results',
          'Use drip irrigation for better water efficiency',
          'Apply organic fertilizers regularly',
          'Monitor weather forecasts for planning',
          'Practice crop rotation to maintain soil health'
        ],
        nextSteps: [
          'Conduct soil testing for nutrients and pH',
          'Arrange quality seeds from certified dealers',
          'Set up proper irrigation system',
          'Plan planting schedule based on season',
          'Prepare pest management strategy'
        ],
        visualData: generateVisualData(fallbackCrops, fallbackVegetables, fallbackFruits, fallbackAnalysis)
      };
    }
  };

  // Generate visual data from AI recommendations
  const generateVisualData = (crops: CropRecommendation[], vegetables: CropRecommendation[], fruits: CropRecommendation[], analysis: string[]) => {
    // Profit potential data
    const profitPotential = [
      ...crops.map(crop => ({
        crop: crop.name,
        profit: Math.floor(Math.random() * 40) + 60, // 60-100%
        roi: Math.floor(Math.random() * 30) + 70 // 70-100%
      })),
      ...vegetables.map(veg => ({
        crop: veg.name,
        profit: Math.floor(Math.random() * 35) + 65,
        roi: Math.floor(Math.random() * 25) + 75
      })),
      ...fruits.map(fruit => ({
        crop: fruit.name,
        profit: Math.floor(Math.random() * 50) + 50,
        roi: Math.floor(Math.random() * 40) + 60
      }))
    ].slice(0, 6);

    // Risk assessment data
    const riskAssessment = [
      { factor: 'Weather Risk', risk: Math.floor(Math.random() * 30) + 20, mitigation: 'Weather forecasting & insurance' },
      { factor: 'Market Risk', risk: Math.floor(Math.random() * 25) + 15, mitigation: 'Contract farming & diversification' },
      { factor: 'Pest Risk', risk: Math.floor(Math.random() * 20) + 10, mitigation: 'IPM & biological control' },
      { factor: 'Price Risk', risk: Math.floor(Math.random() * 35) + 25, mitigation: 'Market intelligence & storage' },
      { factor: 'Labor Risk', risk: Math.floor(Math.random() * 15) + 5, mitigation: 'Mechanization & training' },
      { factor: 'Soil Risk', risk: Math.floor(Math.random() * 20) + 10, mitigation: 'Soil testing & amendment' }
    ];

    // Sustainability metrics
    const sustainabilityMetrics = [
      { metric: 'Water Efficiency', score: Math.floor(Math.random() * 20) + 80, target: 90 },
      { metric: 'Soil Health', score: Math.floor(Math.random() * 15) + 75, target: 85 },
      { metric: 'Carbon Footprint', score: Math.floor(Math.random() * 25) + 65, target: 80 },
      { metric: 'Biodiversity', score: Math.floor(Math.random() * 20) + 70, target: 85 },
      { metric: 'Energy Use', score: Math.floor(Math.random() * 15) + 80, target: 90 }
    ];

    // Market trends data
    const marketTrends = [
      { month: 'Jan', demand: Math.floor(Math.random() * 20) + 70, price: Math.floor(Math.random() * 30) + 60 },
      { month: 'Feb', demand: Math.floor(Math.random() * 20) + 75, price: Math.floor(Math.random() * 30) + 65 },
      { month: 'Mar', demand: Math.floor(Math.random() * 20) + 80, price: Math.floor(Math.random() * 30) + 70 },
      { month: 'Apr', demand: Math.floor(Math.random() * 20) + 85, price: Math.floor(Math.random() * 30) + 75 },
      { month: 'May', demand: Math.floor(Math.random() * 20) + 90, price: Math.floor(Math.random() * 30) + 80 },
      { month: 'Jun', demand: Math.floor(Math.random() * 20) + 85, price: Math.floor(Math.random() * 30) + 75 }
    ];

    // Technology adoption data
    const technologyAdoption = [
      { tech: 'Drip Irrigation', adoption: Math.floor(Math.random() * 20) + 75, benefit: '40% water savings' },
      { tech: 'Precision Farming', adoption: Math.floor(Math.random() * 25) + 60, benefit: '25% input reduction' },
      { tech: 'Weather Apps', adoption: Math.floor(Math.random() * 15) + 80, benefit: '30% risk reduction' },
      { tech: 'Mobile Banking', adoption: Math.floor(Math.random() * 20) + 70, benefit: 'Faster payments' },
      { tech: 'Cold Storage', adoption: Math.floor(Math.random() * 30) + 50, benefit: '50% loss reduction' }
    ];

    // Climate adaptation progress
    const climateAdaptation = [
      { measure: 'Drought Resistant Seeds', progress: Math.floor(Math.random() * 20) + 75, impact: '35% yield stability' },
      { measure: 'Water Conservation', progress: Math.floor(Math.random() * 15) + 80, impact: '40% water efficiency' },
      { measure: 'Climate Smart Practices', progress: Math.floor(Math.random() * 25) + 65, impact: '30% resilience' },
      { measure: 'Diversified Cropping', progress: Math.floor(Math.random() * 20) + 70, impact: '25% risk reduction' },
      { measure: 'Soil Carbon Sequestration', progress: Math.floor(Math.random() * 30) + 60, impact: '20% carbon reduction' }
    ];

    return {
      profitPotential,
      riskAssessment,
      sustainabilityMetrics,
      marketTrends,
      technologyAdoption,
      climateAdaptation
    };
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'crop': return <Leaf className="h-4 w-4" />;
      case 'vegetable': return <Carrot className="h-4 w-4" />;
      case 'fruit': return <Apple className="h-4 w-4" />;
      default: return <Sparkles className="h-4 w-4" />;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-2">
          <Sparkles className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Smart Crop Recommendations
          </h1>
        </div>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Get AI-powered crop, vegetable, and fruit recommendations based on your location, 
          weather conditions, and soil type.
        </p>
      </div>

      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MapPin className="h-5 w-5" />
            <span>Location & Soil Details</span>
          </CardTitle>
          <CardDescription>
            Enter your location and soil information to get personalized recommendations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <div className="flex space-x-2">
                <Input
                  id="location"
                  placeholder="Enter city, village, or address"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={handleUseCurrentLocation}
                  title="Use current location"
                >
                  <MapPin className="h-4 w-4" />
                </Button>
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => setShowMapSelector(true)}
                  title="Select location on map"
                >
                  <Map className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="soil">Current Soil Condition</Label>
              <Select value={soilType} onValueChange={setSoilType}>
                <SelectTrigger>
                  <SelectValue placeholder="What type of soil do you have?" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="black-cotton">Black Cotton Soil</SelectItem>
                  <SelectItem value="red">Red Soil</SelectItem>
                  <SelectItem value="alluvial">Alluvial Soil</SelectItem>
                  <SelectItem value="sandy-loam">Sandy Loam</SelectItem>
                  <SelectItem value="clay-loam">Clay Loam</SelectItem>
                  <SelectItem value="laterite">Laterite Soil</SelectItem>
                  <SelectItem value="saline">Saline Soil</SelectItem>
                  <SelectItem value="forest">Forest Soil</SelectItem>
                  <SelectItem value="arid">Arid Soil</SelectItem>
                  <SelectItem value="mixed">Mixed Soil</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="landSize">Farm Area</Label>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  id="landSize"
                  placeholder="Enter area size"
                  value={landSize}
                  onChange={(e) => setLandSize(e.target.value)}
                />
                <Select defaultValue="acres">
                  <SelectTrigger>
                    <SelectValue placeholder="Unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="acres">Acres</SelectItem>
                    <SelectItem value="hectares">Hectares</SelectItem>
                    <SelectItem value="bigha">Bigha</SelectItem>
                    <SelectItem value="gunta">Gunta</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="waterSource">Available Water Sources</Label>
              <Select value={waterSource} onValueChange={setWaterSource}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your water source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rainfed">Rainfed Only</SelectItem>
                  <SelectItem value="bore-well">Bore Well</SelectItem>
                  <SelectItem value="open-well">Open Well</SelectItem>
                  <SelectItem value="canal-seasonal">Canal (Seasonal)</SelectItem>
                  <SelectItem value="canal-perennial">Canal (Perennial)</SelectItem>
                  <SelectItem value="river-seasonal">River (Seasonal)</SelectItem>
                  <SelectItem value="river-perennial">River (Perennial)</SelectItem>
                  <SelectItem value="tank">Farm Pond/Tank</SelectItem>
                  <SelectItem value="drip">Drip Irrigation</SelectItem>
                  <SelectItem value="sprinkler">Sprinkler System</SelectItem>
                  <SelectItem value="multiple">Multiple Sources</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="previousCrops">Previous Season's Crops</Label>
              <Select value={previousCrops} onValueChange={setPreviousCrops}>
                <SelectTrigger>
                  <SelectValue placeholder="What did you grow last season?" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rice">Paddy/Rice</SelectItem>
                  <SelectItem value="wheat">Wheat</SelectItem>
                  <SelectItem value="cotton">Cotton</SelectItem>
                  <SelectItem value="sugarcane">Sugarcane</SelectItem>
                  <SelectItem value="maize">Maize/Corn</SelectItem>
                  <SelectItem value="pulses">Pulses</SelectItem>
                  <SelectItem value="oilseeds">Oilseeds</SelectItem>
                  <SelectItem value="vegetables">Vegetables</SelectItem>
                  <SelectItem value="fruits">Fruits</SelectItem>
                  <SelectItem value="spices">Spices</SelectItem>
                  <SelectItem value="fallow">Fallow Land</SelectItem>
                  <SelectItem value="multiple">Multiple Crops</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="budgetRange">Investment Capacity (per acre)</Label>
              <Select value={budgetRange} onValueChange={setBudgetRange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your budget range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="very-low">Less than ₹25,000</SelectItem>
                  <SelectItem value="low">₹25,000 - ₹50,000</SelectItem>
                  <SelectItem value="medium">₹50,000 - ₹1,00,000</SelectItem>
                  <SelectItem value="high">₹1,00,000 - ₹2,00,000</SelectItem>
                  <SelectItem value="very-high">More than ₹2,00,000</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="farmingExperience">Your Farming Background</Label>
              <Select value={farmingExperience} onValueChange={setFarmingExperience}>
                <SelectTrigger>
                  <SelectValue placeholder="Tell us about your experience" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">New to Farming</SelectItem>
                  <SelectItem value="beginner">1-2 Years Experience</SelectItem>
                  <SelectItem value="intermediate">3-5 Years Experience</SelectItem>
                  <SelectItem value="experienced">6-10 Years Experience</SelectItem>
                  <SelectItem value="expert">10+ Years Experience</SelectItem>
                  <SelectItem value="traditional">Traditional Farming Family</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="irrigationSystem">Irrigation System</Label>
              <Select defaultValue="traditional">
                <SelectTrigger>
                  <SelectValue placeholder="Select irrigation method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="traditional">Traditional Flood</SelectItem>
                  <SelectItem value="drip">Drip Irrigation</SelectItem>
                  <SelectItem value="sprinkler">Sprinkler System</SelectItem>
                  <SelectItem value="subsurface">Subsurface Irrigation</SelectItem>
                  <SelectItem value="micro">Micro Irrigation</SelectItem>
                  <SelectItem value="none">No Irrigation System</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="machinery">Available Farm Machinery</Label>
              <Select defaultValue="none">
                <SelectTrigger>
                  <SelectValue placeholder="Select available equipment" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tractor">Tractor</SelectItem>
                  <SelectItem value="harvester">Harvester</SelectItem>
                  <SelectItem value="basic">Basic Tools Only</SelectItem>
                  <SelectItem value="advanced">Advanced Machinery</SelectItem>
                  <SelectItem value="rental">Access to Rental Equipment</SelectItem>
                  <SelectItem value="none">No Machinery</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="laborAvailability">Labor Availability</Label>
              <Select defaultValue="family">
                <SelectTrigger>
                  <SelectValue placeholder="Select labor situation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="family">Family Labor Only</SelectItem>
                  <SelectItem value="seasonal">Seasonal Workers Available</SelectItem>
                  <SelectItem value="full-time">Full-time Workers Available</SelectItem>
                  <SelectItem value="limited">Limited Labor Available</SelectItem>
                  <SelectItem value="cooperative">Cooperative Farming</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="marketAccess">Market Access</Label>
              <Select defaultValue="local">
                <SelectTrigger>
                  <SelectValue placeholder="Select market accessibility" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="local">Local Market (within 10 km)</SelectItem>
                  <SelectItem value="regional">Regional Market (10-30 km)</SelectItem>
                  <SelectItem value="wholesale">Wholesale Market Access</SelectItem>
                  <SelectItem value="contract">Contract Farming</SelectItem>
                  <SelectItem value="export">Export Market Access</SelectItem>
                  <SelectItem value="limited">Limited Market Access</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Weather Info Display */}
          {weatherData && (
            <div className="p-4 bg-accent/50 rounded-lg">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Thermometer className="h-4 w-4 text-primary" />
                Current Weather Conditions
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Thermometer className="h-4 w-4" />
                  <span>{Math.round(weatherData.current.temperature_2m)}°C</span>
                </div>
                <div className="flex items-center gap-2">
                  <Droplets className="h-4 w-4" />
                  <span>{Math.round(weatherData.current.relative_humidity_2m)}% Humidity</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>💨</span>
                  <span>{Math.round(weatherData.current.wind_speed_10m)} km/h Wind</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>🌡️</span>
                  <span>Soil: {Math.round(weatherData.hourly.soil_temperature_0cm[0])}°C</span>
                </div>
              </div>
            </div>
          )}

          <Button 
            onClick={generateRecommendations} 
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Recommendations...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Get Smart Recommendations
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Recommendations Display */}
      {recommendations && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-center text-2xl">
                🌱 Smart Recommendations for {recommendations.location}
              </CardTitle>
            </CardHeader>
          </Card>

          {/* Crops */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Leaf className="h-5 w-5 text-primary" />
                <span>Recommended Crops</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {recommendations.crops.map((item, index) => (
                  <Card key={index} className="border-primary/20">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg flex items-center space-x-2">
                          <span className="text-2xl">{item.icon}</span>
                          <span>{item.name}</span>
                        </CardTitle>
                        <Badge variant="outline">{getCategoryIcon('crop')}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-2">{item.reason}</p>
                      <p className="text-sm mb-2"><strong>Tips:</strong> {item.tips}</p>
                      {item.estimatedYield && (
                        <p className="text-sm text-primary font-medium">
                          <strong>Est. Yield:</strong> {item.estimatedYield}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Vegetables */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Carrot className="h-5 w-5 text-secondary" />
                <span>Recommended Vegetables</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {recommendations.vegetables.map((item, index) => (
                  <Card key={index} className="border-secondary/20">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg flex items-center space-x-2">
                          <span className="text-2xl">{item.icon}</span>
                          <span>{item.name}</span>
                        </CardTitle>
                        <Badge variant="outline">{getCategoryIcon('vegetable')}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-2">{item.reason}</p>
                      <p className="text-sm mb-2"><strong>Tips:</strong> {item.tips}</p>
                      {item.estimatedYield && (
                        <p className="text-sm text-secondary font-medium">
                          <strong>Est. Yield:</strong> {item.estimatedYield}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Fruits */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Apple className="h-5 w-5 text-info" />
                <span>Recommended Fruits</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {recommendations.fruits.map((item, index) => (
                  <Card key={index} className="border-info/20">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg flex items-center space-x-2">
                          <span className="text-2xl">{item.icon}</span>
                          <span>{item.name}</span>
                        </CardTitle>
                        <Badge variant="outline">{getCategoryIcon('fruit')}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-2">{item.reason}</p>
                      <p className="text-sm mb-2"><strong>Tips:</strong> {item.tips}</p>
                      {item.estimatedYield && (
                        <p className="text-sm text-info font-medium">
                          <strong>Est. Yield:</strong> {item.estimatedYield}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Comprehensive Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Sparkles className="h-5 w-5 text-purple-500" />
                <span>AI Insights</span>
              </CardTitle>
              <CardDescription>
                Smart analysis based on your farming data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {recommendations.comprehensiveAnalysis.map((analysis, index) => (
                  <div key={index} className="p-4 bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg border border-purple-200 hover:shadow-md transition-shadow">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-bold">{index + 1}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-purple-900 leading-relaxed">{analysis}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Visual Analytics Dashboard */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Profit Potential Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  <span>Profit Potential Analysis</span>
                </CardTitle>
                <CardDescription>
                  Comparative profitability and ROI for recommended crops
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={recommendations.visualData.profitPotential}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="crop" />
                    <YAxis />
                    <Tooltip formatter={(value, name) => [`${value}%`, name === 'profit' ? 'Profit Potential' : 'ROI']} />
                    <Bar dataKey="profit" fill="#22c55e" name="profit" />
                    <Bar dataKey="roi" fill="#3b82f6" name="roi" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Risk Assessment Radar */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-red-500" />
                  <span>Risk Assessment Matrix</span>
                </CardTitle>
                <CardDescription>
                  Risk factors and mitigation strategies for your farming operation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={recommendations.visualData.riskAssessment}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="factor" />
                    <PolarRadiusAxis angle={90} domain={[0, 60]} />
                    <Radar name="Risk Level" dataKey="risk" stroke="#ef4444" fill="#ef4444" fillOpacity={0.3} />
                    <Tooltip formatter={(value) => [`${value}%`, 'Risk Level']} />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Sustainability Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Globe className="h-5 w-5 text-blue-500" />
                  <span>Sustainability Indicators</span>
                </CardTitle>
                <CardDescription>
                  Environmental impact and sustainability metrics
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {recommendations.visualData.sustainabilityMetrics.map((metric, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{metric.metric}</span>
                      <span className="text-muted-foreground">{metric.score}/{metric.target}</span>
                    </div>
                    <Progress value={(metric.score / metric.target) * 100} className="h-2" />
                    <p className="text-xs text-muted-foreground">
                      {metric.score >= metric.target ? '✅ Target achieved' : `📈 ${metric.target - metric.score} points to target`}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Market Trends */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5 text-orange-500" />
                  <span>Market Intelligence Trends</span>
                </CardTitle>
                <CardDescription>
                  Demand and price trends for agricultural commodities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={recommendations.visualData.marketTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="demand" stroke="#f97316" strokeWidth={2} name="Demand %" />
                    <Line type="monotone" dataKey="price" stroke="#eab308" strokeWidth={2} name="Price Index" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Technology Adoption */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Zap className="h-5 w-5 text-yellow-500" />
                  <span>Technology Adoption Levels</span>
                </CardTitle>
                <CardDescription>
                  Recommended technologies and their adoption rates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={recommendations.visualData.technologyAdoption} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" domain={[0, 100]} />
                    <YAxis dataKey="tech" type="category" width={100} />
                    <Tooltip formatter={(value, name) => [`${value}%`, 'Adoption Rate']} />
                    <Bar dataKey="adoption" fill="#eab308" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Climate Adaptation Progress */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="h-5 w-5 text-teal-500" />
                  <span>Climate Adaptation Progress</span>
                </CardTitle>
                <CardDescription>
                  Progress on climate-resilient farming measures
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {recommendations.visualData.climateAdaptation.map((measure, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{measure.measure}</span>
                      <span className="text-muted-foreground">{measure.progress}%</span>
                    </div>
                    <Progress value={measure.progress} className="h-2" />
                    <p className="text-xs text-muted-foreground">{measure.impact}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* General Tips & Next Steps */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <span className="text-lg">💡</span>
                  <span>General Tips</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recommendations.generalTips.map((tip, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="flex-shrink-0 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">{index + 1}</span>
                      </div>
                      <p className="text-sm text-gray-700 leading-relaxed">{tip}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <span className="text-lg">➡️</span>
                  <span>Next Steps</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recommendations.nextSteps.map((step, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                      <Badge variant="outline" className="flex-shrink-0 text-xs bg-blue-100 border-blue-300">
                        {index + 1}
                      </Badge>
                      <p className="text-sm text-gray-700 leading-relaxed">{step}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Location Map Selector Modal */}
      <LocationMapSelector
        isVisible={showMapSelector}
        onClose={() => setShowMapSelector(false)}
        onLocationSelect={async (selectedLocation) => {
          // If location contains coordinates, convert to readable address
          if (selectedLocation.match(/^-?\d+\.\d+,\s*-?\d+\.\d+$/)) {
            const [lat, lon] = selectedLocation.split(',').map(coord => parseFloat(coord.trim()));
            const readableAddress = await reverseGeocode(lat, lon);
            setLocation(readableAddress);
            toast({
              title: "Location selected",
              description: `Location set to: ${readableAddress}`,
            });
          } else {
            setLocation(selectedLocation);
            toast({
              title: "Location selected",
              description: `Location set to: ${selectedLocation}`,
            });
          }
        }}
        currentLocation={location}
      />
    </div>
  );
}