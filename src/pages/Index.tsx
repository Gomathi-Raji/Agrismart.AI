import { GreetingSection } from "@/components/home/GreetingSection";
import { QuickActionsGrid } from "@/components/home/QuickActionsGrid";
import { AlertsSection } from "@/components/home/AlertsSection";
import { EngagementSection } from "@/components/home/EngagementSection";
import { KnowledgeSection } from "@/components/home/KnowledgeSection";
import { AISuggestionsSection } from "@/components/home/AIsuggestionsSection";
import { FieldIntelligenceMap } from "@/components/cards/FieldIntelligenceMap";
import { MarketplacePreview } from "@/components/home/MarketplacePreview";
import { FarmsPreview } from "@/components/home/FarmsPreview";
import { GovernmentSchemesPreview } from "@/components/home/GovernmentSchemesPreview";
import { CommunityPreview } from "@/components/home/CommunityPreview";
import { MarketAnalysisPreview } from "@/components/home/MarketAnalysisPreview";
import { WeatherPreview } from "@/components/home/WeatherPreview";
import { FeaturedContent } from "@/components/home/FeaturedContent";

const Index = () => {
  return (
    <div className="min-h-screen bg-background dark:bg-background">
      {/* Greeting + Smart Overview */}
      <GreetingSection />

      {/* Quick Actions Grid */}
      <QuickActionsGrid />

      {/* Alerts Section */}
      <AlertsSection />

      {/* Field Intelligence Map */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <FieldIntelligenceMap className="w-full" />
        </div>
      </div>

      {/* Weather Preview */}
      <WeatherPreview />

      {/* Market Analysis Preview */}
      <MarketAnalysisPreview />

      {/* Marketplace Preview */}
      <MarketplacePreview />

      {/* Farms Preview */}
      <FarmsPreview />

      {/* Government Schemes Preview */}
      <GovernmentSchemesPreview />

      {/* Community Preview */}
      <CommunityPreview />

      {/* Featured Content */}
      <FeaturedContent />

      {/* AI Suggestions */}
      <AISuggestionsSection />

      {/* Engagement Features */}
      <EngagementSection />

      {/* Knowledge & News */}
      <KnowledgeSection />
    </div>
  );
};

export default Index;