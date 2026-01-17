import { Loader2, Sprout, Droplets, Sun, Leaf } from "lucide-react";
import { useEffect, useState } from "react";

interface EnhancedLoadingProps {
  message?: string;
  subMessage?: string;
  className?: string;
}

export function EnhancedLoading({ 
  message = "Loading...", 
  subMessage,
  className = "" 
}: EnhancedLoadingProps) {
  const [currentIconIndex, setCurrentIconIndex] = useState(0);
  
  const icons = [
    { icon: Sprout, color: "text-green-500", label: "Growing" },
    { icon: Droplets, color: "text-blue-500", label: "Nurturing" },
    { icon: Sun, color: "text-yellow-500", label: "Energizing" },
    { icon: Leaf, color: "text-emerald-500", label: "Flourishing" }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIconIndex((prev) => (prev + 1) % icons.length);
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  const CurrentIcon = icons[currentIconIndex].icon;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center ${className}`}>
      {/* Enhanced Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background/95 to-background/90 backdrop-blur-md" />
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-green-500/5" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
      
      {/* Loading Content */}
      <div className="relative z-10 text-center space-y-8 max-w-md mx-auto p-8">
        {/* Animated Logo/Icon Section */}
        <div className="relative">
          {/* Pulsing Background Circle */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary/20 to-green-500/20 animate-pulse" />
          </div>
          
          {/* Rotating Border */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-36 h-36 rounded-full border-4 border-transparent bg-gradient-to-r from-primary via-green-500 to-primary bg-clip-border animate-spin" 
                 style={{ animationDuration: '3s' }}>
              <div className="w-full h-full rounded-full bg-background" />
            </div>
          </div>
          
          {/* Central Icon */}
          <div className="relative flex items-center justify-center h-36">
            <div className="relative">
              <Loader2 className="h-12 w-12 text-primary animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <CurrentIcon className={`h-6 w-6 ${icons[currentIconIndex].color} animate-pulse`} />
              </div>
            </div>
          </div>
        </div>

        {/* Text Content */}
        <div className="space-y-4">
          <div className="space-y-2">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-primary to-green-600 bg-clip-text text-transparent">
              AgriSmart
            </h3>
            <p className="text-lg font-medium text-foreground animate-pulse">
              {message}
            </p>
            {subMessage && (
              <p className="text-sm text-muted-foreground">
                {subMessage}
              </p>
            )}
          </div>

          {/* Animated Progress Dots */}
          <div className="flex justify-center gap-2">
            {[0, 1, 2].map((index) => (
              <div
                key={index}
                className="w-2 h-2 rounded-full bg-primary animate-bounce"
                style={{ animationDelay: `${index * 0.2}s` }}
              />
            ))}
          </div>
        </div>

        {/* Agriculture-themed Features */}
        <div className="grid grid-cols-2 gap-4 mt-8 text-xs text-muted-foreground">
          <div className="flex items-center gap-2 opacity-60 animate-pulse">
            <Sprout className="h-3 w-3 text-green-500" />
            <span>Smart Farming</span>
          </div>
          <div className="flex items-center gap-2 opacity-60 animate-pulse" style={{ animationDelay: '0.5s' }}>
            <Droplets className="h-3 w-3 text-blue-500" />
            <span>Weather Insights</span>
          </div>
          <div className="flex items-center gap-2 opacity-60 animate-pulse" style={{ animationDelay: '1s' }}>
            <Sun className="h-3 w-3 text-yellow-500" />
            <span>Market Analysis</span>
          </div>
          <div className="flex items-center gap-2 opacity-60 animate-pulse" style={{ animationDelay: '1.5s' }}>
            <Leaf className="h-3 w-3 text-emerald-500" />
            <span>Crop Guidance</span>
          </div>
        </div>
      </div>
    </div>
  );
}