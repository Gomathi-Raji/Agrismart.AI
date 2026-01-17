import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  ComposedChart,
  Area,
  AreaChart,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BarChart3,
  LineChart as LineChartIcon,
  PieChart as PieChartIcon,
  TrendingUp,
  TrendingDown,
  MapPin,
  Calendar,
  DollarSign,
  Download,
  Maximize2,
} from 'lucide-react';
import { MandiPrice } from '@/services/mandiService';
import { format } from 'date-fns';

interface MandiVisualizationsProps {
  data: MandiPrice[];
  isLoading?: boolean;
  selectedCommodity?: string;
  className?: string;
}

// Data interfaces for processed market data
interface MarketData {
  market: string;
  avgPrice: number;
  count: number;
}

interface CommodityData {
  commodity: string;
  min_price: number;
  max_price: number;
  modal_price: number;
  range?: number;
}

interface StateData {
  state: string;
  avgPrice: number;
  count: number;
}

interface MarketActivityData {
  market: string;
  activityScore: number;
  totalVolume: number;
  commodityCount: number;
}

interface VolatilityData {
  commodity: string;
  volatility: number;
  range: number;
}

interface CommodityPricesData {
  commodity: string;
  prices: number[];
  avgPrice?: number;
}

interface StatePricesData {
  state: string;
  prices: number[];
}

interface MarketActivityRawData {
  market: string;
  commodities: Set<string>;
  totalValue: number;
}

interface PriceComparisonData {
  commodity: string;
  min_price: number;
  max_price: number;
  modal_price: number;
  count: number;
}

// AgriSmart Theme Colors for charts
const AGRI_COLORS = [
  'hsl(120, 60%, 25%)', // Primary green
  'hsl(48, 95%, 55%)',  // Secondary yellow  
  'hsl(120, 45%, 35%)', // Primary glow
  'hsl(120, 60%, 35%)', // Success green
  'hsl(200, 80%, 45%)', // Info blue
  'hsl(120, 40%, 88%)', // Accent light
  'hsl(48, 85%, 65%)',  // Secondary glow
  'hsl(120, 50%, 40%)', // Medium green
  'hsl(45, 90%, 60%)',  // Bright yellow
  'hsl(125, 55%, 30%)', // Dark green
];

export default function MandiVisualizations({
  data,
  isLoading = false,
  selectedCommodity,
  className,
}: MandiVisualizationsProps) {
  // Process data for different chart types
  const processedData = {
    priceComparison: getPriceComparisonData(data, selectedCommodity),
    marketComparison: getMarketComparisonData(data, selectedCommodity),
    commodityDistribution: getCommodityDistributionData(data),
    priceRange: getPriceRangeData(data, selectedCommodity),
    stateWiseAverage: getStateWiseAverageData(data),
    topMarkets: getTopMarketsData(data),
  };

  const formatCurrency = (value: number) => `₹${value.toFixed(2)}`;
  const formatTooltip = (value: number, name: string) => [formatCurrency(value), name];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="space-y-2">
              <div className="h-4 bg-muted rounded w-1/3"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-muted rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No data available for visualization</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Summary Cards - AgriSmart Theme */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <Card className="bg-gradient-card border-border/50 shadow-tech">
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-success" />
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Avg. Price</p>
                <p className="text-base md:text-lg font-bold text-primary">
                  {formatCurrency(
                    data.reduce((sum, item) => sum + item.modal_price_per_kg, 0) / data.length
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-border/50 shadow-tech">
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-warning" />
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Highest</p>
                <p className="text-base md:text-lg font-bold text-primary">
                  {formatCurrency(Math.max(...data.map(item => item.max_price_per_kg)))}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-border/50 shadow-tech">
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-info" />
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Lowest</p>
                <p className="text-base md:text-lg font-bold text-primary">
                  {formatCurrency(Math.min(...data.map(item => item.min_price_per_kg)))}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-border/50 shadow-tech">
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Markets</p>
                <p className="text-base md:text-lg font-bold text-primary">
                  {new Set(data.map(item => item.market)).size}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Visualizations - AgriSmart Theme */}
      <Tabs defaultValue="comparison" className="w-full overflow-hidden">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 gap-1 bg-gradient-card">
          <TabsTrigger value="comparison" className="text-xs md:text-sm px-2 md:px-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <BarChart3 className="h-3 w-3 md:h-4 md:w-4 mr-1" />
            <span className="hidden sm:inline">Price</span>
            <span className="sm:hidden">Prices</span>
          </TabsTrigger>
          <TabsTrigger value="markets" className="text-xs md:text-sm px-2 md:px-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <MapPin className="h-3 w-3 md:h-4 md:w-4 mr-1" />
            Markets
          </TabsTrigger>
          <TabsTrigger value="distribution" className="text-xs md:text-sm px-2 md:px-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <PieChartIcon className="h-3 w-3 md:h-4 md:w-4 mr-1" />
            <span className="hidden sm:inline">Distribution</span>
            <span className="sm:hidden">Stats</span>
          </TabsTrigger>
          <TabsTrigger value="trends" className="text-xs md:text-sm px-2 md:px-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <LineChartIcon className="h-3 w-3 md:h-4 md:w-4 mr-1" />
            <span className="hidden sm:inline">Trends</span>
            <span className="sm:hidden">Trend</span>
          </TabsTrigger>
          <TabsTrigger value="analysis" className="text-xs md:text-sm px-2 md:px-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <TrendingUp className="h-3 w-3 md:h-4 md:w-4 mr-1" />
            <span className="hidden sm:inline">Analysis</span>
            <span className="sm:hidden">Insights</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="comparison" className="space-y-4 md:space-y-6 overflow-hidden">
          {/* Price Comparison Chart - AgriSmart Theme */}
          <Card className="bg-gradient-card border-border/50 shadow-tech overflow-hidden">
            <CardHeader className="pb-2 md:pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <CardTitle className="flex items-center gap-2 text-sm md:text-base text-primary">
                    <BarChart3 className="h-4 w-4 md:h-5 md:w-5" />
                    Price Comparison by Commodity
                  </CardTitle>
                  <p className="text-xs md:text-sm text-muted-foreground mt-1">
                    Min, Max, and Modal prices per kg
                  </p>
                </div>
                <Button variant="outline" size="sm" className="h-8 text-xs border-primary/20 hover:bg-primary hover:text-primary-foreground">
                  <Download className="h-3 w-3 mr-1" />
                  Export
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-2 md:p-6 overflow-hidden">
              <div className="w-full overflow-x-auto">
                <ResponsiveContainer width="100%" height={300} minWidth={300}>
                  <BarChart 
                    data={processedData.priceComparison.slice(0, 8)}
                    margin={{ top: 5, right: 5, left: 5, bottom: 60 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" className="opacity-30" />
                    <XAxis 
                      dataKey="commodity" 
                      angle={-45}
                      textAnchor="end"
                      height={80}
                      tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <YAxis 
                      tickFormatter={formatCurrency} 
                      tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <Tooltip 
                      formatter={formatTooltip} 
                      contentStyle={{ 
                        fontSize: '12px', 
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                    <Bar dataKey="min_price" fill={AGRI_COLORS[0]} name="Min Price" />
                    <Bar dataKey="modal_price" fill={AGRI_COLORS[1]} name="Modal Price" />
                    <Bar dataKey="max_price" fill={AGRI_COLORS[2]} name="Max Price" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Price Range Chart - AgriSmart Theme */}
          <Card className="bg-gradient-card border-border/50 shadow-tech overflow-hidden">
            <CardHeader className="pb-2 md:pb-4">
              <CardTitle className="flex items-center gap-2 text-sm md:text-base text-primary">
                <LineChartIcon className="h-4 w-4 md:h-5 md:w-5" />
                Price Range Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2 md:p-6 overflow-hidden">
              <div className="w-full overflow-x-auto">
                <ResponsiveContainer width="100%" height={250} minWidth={300}>
                  <AreaChart 
                    data={processedData.priceRange.slice(0, 8)}
                    margin={{ top: 5, right: 5, left: 5, bottom: 40 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" className="opacity-30" />
                    <XAxis 
                      dataKey="commodity" 
                      tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis 
                      tickFormatter={formatCurrency} 
                      tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <Tooltip 
                      formatter={formatTooltip} 
                      contentStyle={{ 
                        fontSize: '12px',
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="range"
                      stroke={AGRI_COLORS[0]}
                      fill={AGRI_COLORS[0]}
                      fillOpacity={0.3}
                      name="Price Range"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="modal_price" 
                      stroke={AGRI_COLORS[1]} 
                      strokeWidth={2}
                      name="Modal Price"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="markets" className="space-y-4 md:space-y-6 overflow-hidden">
          {/* Market Comparison - AgriSmart Theme */}
          <Card className="bg-gradient-card border-border/50 shadow-tech overflow-hidden">
            <CardHeader className="pb-2 md:pb-4">
              <CardTitle className="flex items-center gap-2 text-sm md:text-base text-primary">
                <MapPin className="h-4 w-4 md:h-5 md:w-5" />
                Market Comparison
                {selectedCommodity && (
                  <Badge variant="secondary" className="text-xs bg-secondary text-secondary-foreground">{selectedCommodity}</Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2 md:p-6 overflow-hidden">
              <div className="w-full overflow-x-auto">
                <ResponsiveContainer width="100%" height={300} minWidth={400}>
                  <BarChart 
                    data={processedData.marketComparison.slice(0, 8)}
                    margin={{ top: 5, right: 5, left: 5, bottom: 80 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" className="opacity-30" />
                    <XAxis 
                      dataKey="market" 
                      angle={-45}
                      textAnchor="end"
                      height={100}
                      tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <YAxis 
                      tickFormatter={formatCurrency} 
                      tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <Tooltip 
                      formatter={formatTooltip} 
                      contentStyle={{ 
                        fontSize: '12px',
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Bar dataKey="avgPrice" fill={AGRI_COLORS[0]} name="Average Price" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* State-wise Average - AgriSmart Theme */}
          <Card className="bg-gradient-card border-border/50 shadow-tech overflow-hidden">
            <CardHeader className="pb-2 md:pb-4">
              <CardTitle className="flex items-center gap-2 text-sm md:text-base text-primary">
                <BarChart3 className="h-4 w-4 md:h-5 md:w-5" />
                State-wise Average Prices
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2 md:p-6 overflow-hidden">
              <div className="w-full overflow-x-auto">
                <ResponsiveContainer width="100%" height={250} minWidth={300}>
                  <BarChart 
                    data={processedData.stateWiseAverage.slice(0, 8)}
                    margin={{ top: 5, right: 5, left: 5, bottom: 40 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" className="opacity-30" />
                    <XAxis 
                      dataKey="state" 
                      tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis 
                      tickFormatter={formatCurrency} 
                      tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <Tooltip 
                      formatter={formatTooltip} 
                      contentStyle={{ 
                        fontSize: '12px',
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Bar dataKey="avgPrice" fill={AGRI_COLORS[2]} name="Average Price" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="distribution" className="space-y-4 md:space-y-6 overflow-hidden">
          {/* Commodity Distribution - AgriSmart Theme */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
            <Card className="bg-gradient-card border-border/50 shadow-tech overflow-hidden">
              <CardHeader className="pb-2 md:pb-4">
                <CardTitle className="flex items-center gap-2 text-sm md:text-base text-primary">
                  <PieChartIcon className="h-4 w-4 md:h-5 md:w-5" />
                  Commodity Distribution
                </CardTitle>
              </CardHeader>
              <CardContent className="p-2 md:p-6 overflow-hidden">
                <div className="w-full overflow-x-auto">
                  <ResponsiveContainer width="100%" height={250} minWidth={250}>
                    <PieChart>
                      <Pie
                        data={processedData.commodityDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name.slice(0, 8)} ${(percent * 100).toFixed(0)}%`}
                        outerRadius="75%"
                        fill={AGRI_COLORS[0]}
                        dataKey="value"
                      >
                        {processedData.commodityDistribution.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={AGRI_COLORS[index % AGRI_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ 
                        fontSize: '12px',
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-card border-border/50 shadow-tech overflow-hidden">
              <CardHeader className="pb-2 md:pb-4">
                <CardTitle className="flex items-center gap-2 text-sm md:text-base text-primary">
                  <MapPin className="h-4 w-4 md:h-5 md:w-5" />
                  Top Markets by Volume
                </CardTitle>
              </CardHeader>
              <CardContent className="p-2 md:p-6 overflow-hidden">
                <div className="w-full overflow-x-auto">
                  <ResponsiveContainer width="100%" height={250} minWidth={300}>
                    <BarChart 
                      data={processedData.topMarkets.slice(0, 8)} 
                      layout="horizontal"
                      margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" className="opacity-30" />
                      <XAxis type="number" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                      <YAxis 
                        dataKey="market" 
                        type="category" 
                        width={60} 
                        tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }}
                      />
                      <Tooltip contentStyle={{ 
                        fontSize: '12px',
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }} />
                      <Bar dataKey="count" fill={AGRI_COLORS[1]} name="Number of Commodities" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Price Volatility Chart */}
          <Card className="bg-gradient-card border-border/50 shadow-tech overflow-hidden">
            <CardHeader className="pb-2 md:pb-4">
              <CardTitle className="flex items-center gap-2 text-sm md:text-base text-primary">
                <TrendingUp className="h-4 w-4 md:h-5 md:w-5" />
                Price Volatility Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2 md:p-6 overflow-hidden">
              <div className="w-full overflow-x-auto">
                <ResponsiveContainer width="100%" height={300} minWidth={400}>
                  <ComposedChart
                    data={getVolatilityData(data)}
                    margin={{ top: 5, right: 5, left: 5, bottom: 60 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" className="opacity-30" />
                    <XAxis 
                      dataKey="commodity" 
                      angle={-45}
                      textAnchor="end"
                      height={80}
                      tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <YAxis 
                      yAxisId="left"
                      tickFormatter={formatCurrency}
                      tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <YAxis 
                      yAxisId="right"
                      orientation="right"
                      tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        fontSize: '12px',
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Legend />
                    <Bar yAxisId="left" dataKey="avgPrice" fill={AGRI_COLORS[0]} name="Avg Price" />
                    <Line yAxisId="right" type="monotone" dataKey="volatility" stroke={AGRI_COLORS[3]} strokeWidth={2} name="Volatility %" />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4 md:space-y-6 overflow-hidden">
          {/* Price Trends Over Time */}
          <Card className="bg-gradient-card border-border/50 shadow-tech overflow-hidden">
            <CardHeader className="pb-2 md:pb-4">
              <CardTitle className="flex items-center gap-2 text-sm md:text-base text-primary">
                <LineChartIcon className="h-4 w-4 md:h-5 md:w-5" />
                Market Trends Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2 md:p-6 overflow-hidden">
              <div className="w-full overflow-x-auto">
                <ResponsiveContainer width="100%" height={300} minWidth={400}>
                  <LineChart
                    data={getTrendData(data)}
                    margin={{ top: 5, right: 5, left: 5, bottom: 40 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" className="opacity-30" />
                    <XAxis 
                      dataKey="commodity" 
                      angle={-45}
                      textAnchor="end"
                      height={60}
                      tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <YAxis 
                      tickFormatter={formatCurrency}
                      tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <Tooltip 
                      formatter={formatTooltip}
                      contentStyle={{ 
                        fontSize: '12px',
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="minPrice" stroke={AGRI_COLORS[4]} strokeWidth={2} name="Min Price" />
                    <Line type="monotone" dataKey="avgPrice" stroke={AGRI_COLORS[0]} strokeWidth={3} name="Avg Price" />
                    <Line type="monotone" dataKey="maxPrice" stroke={AGRI_COLORS[1]} strokeWidth={2} name="Max Price" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Seasonal Patterns */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
            <Card className="bg-gradient-card border-border/50 shadow-tech overflow-hidden">
              <CardHeader className="pb-2 md:pb-4">
                <CardTitle className="flex items-center gap-2 text-sm md:text-base text-primary">
                  <Calendar className="h-4 w-4 md:h-5 md:w-5" />
                  Regional Price Spread
                </CardTitle>
              </CardHeader>
              <CardContent className="p-2 md:p-6 overflow-hidden">
                <div className="w-full overflow-x-auto">
                  <ResponsiveContainer width="100%" height={250} minWidth={300}>
                    <AreaChart
                      data={getRegionalSpreadData(data)}
                      margin={{ top: 5, right: 5, left: 5, bottom: 40 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" className="opacity-30" />
                      <XAxis 
                        dataKey="state" 
                        tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                        angle={-45}
                        textAnchor="end"
                        height={60}
                      />
                      <YAxis 
                        tickFormatter={formatCurrency}
                        tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                      />
                      <Tooltip 
                        formatter={formatTooltip}
                        contentStyle={{ 
                          fontSize: '12px',
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="priceSpread"
                        stackId="1"
                        stroke={AGRI_COLORS[2]}
                        fill={AGRI_COLORS[2]}
                        fillOpacity={0.6}
                        name="Price Spread"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-card border-border/50 shadow-tech overflow-hidden">
              <CardHeader className="pb-2 md:pb-4">
                <CardTitle className="flex items-center gap-2 text-sm md:text-base text-primary">
                  <BarChart3 className="h-4 w-4 md:h-5 md:w-5" />
                  Market Activity Score
                </CardTitle>
              </CardHeader>
              <CardContent className="p-2 md:p-6 overflow-hidden">
                <div className="w-full overflow-x-auto">
                  <ResponsiveContainer width="100%" height={250} minWidth={300}>
                    <BarChart
                      data={getMarketActivityData(data)}
                      margin={{ top: 5, right: 5, left: 5, bottom: 40 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" className="opacity-30" />
                      <XAxis 
                        dataKey="market" 
                        tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }}
                        angle={-45}
                        textAnchor="end"
                        height={60}
                      />
                      <YAxis 
                        tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          fontSize: '12px',
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                      />
                      <Bar dataKey="activityScore" fill={AGRI_COLORS[3]} name="Activity Score" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analysis" className="overflow-hidden">
          <Card className="bg-gradient-card border-border/50 shadow-tech overflow-hidden">
            <CardHeader className="pb-2 md:pb-4">
              <CardTitle className="text-sm md:text-base text-primary">Market Analysis Insights</CardTitle>
            </CardHeader>
            <CardContent className="p-3 md:p-6 overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                {getMarketInsights(data).map((insight, index) => (
                  <div
                    key={index}
                    className={`p-3 md:p-4 rounded-lg border shadow-tech ${
                      insight.type === 'positive' 
                        ? 'border-success/20 bg-success/5' 
                        : insight.type === 'negative'
                        ? 'border-destructive/20 bg-destructive/5'
                        : 'border-primary/20 bg-primary/5'
                    }`}
                  >
                    <div className="flex items-start gap-2 md:gap-3">
                      <insight.icon className={`h-4 w-4 md:h-5 md:w-5 mt-0.5 ${
                        insight.type === 'positive' 
                          ? 'text-success' 
                          : insight.type === 'negative'
                          ? 'text-destructive'
                          : 'text-primary'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium mb-1 text-sm md:text-base truncate text-foreground">{insight.title}</h4>
                        <p className="text-xs md:text-sm text-muted-foreground break-words">{insight.description}</p>
                        {insight.value && (
                          <p className="text-sm md:text-lg font-bold mt-1 md:mt-2 text-primary">{insight.value}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Data processing functions
function getPriceComparisonData(data: MandiPrice[], selectedCommodity?: string) {
  const filteredData = selectedCommodity 
    ? data.filter(item => item.commodity === selectedCommodity)
    : data;

  const grouped = filteredData.reduce((acc, item) => {
    if (!acc[item.commodity]) {
      acc[item.commodity] = {
        commodity: item.commodity,
        min_price: item.min_price_per_kg,
        max_price: item.max_price_per_kg,
        modal_price: item.modal_price_per_kg,
        count: 1,
      };
    } else {
      acc[item.commodity].min_price = Math.min(acc[item.commodity].min_price, item.min_price_per_kg);
      acc[item.commodity].max_price = Math.max(acc[item.commodity].max_price, item.max_price_per_kg);
      acc[item.commodity].modal_price = (acc[item.commodity].modal_price * acc[item.commodity].count + item.modal_price_per_kg) / (acc[item.commodity].count + 1);
      acc[item.commodity].count++;
    }
    return acc;
  }, {} as Record<string, PriceComparisonData>);

  return Object.values(grouped).slice(0, 10); // Top 10
}

function getMarketComparisonData(data: MandiPrice[], selectedCommodity?: string) {
  const filteredData = selectedCommodity 
    ? data.filter(item => item.commodity === selectedCommodity)
    : data;

  const grouped = filteredData.reduce((acc, item) => {
    if (!acc[item.market]) {
      acc[item.market] = {
        market: item.market,
        avgPrice: item.modal_price_per_kg,
        count: 1,
      };
    } else {
      acc[item.market].avgPrice = (acc[item.market].avgPrice * acc[item.market].count + item.modal_price_per_kg) / (acc[item.market].count + 1);
      acc[item.market].count++;
    }
    return acc;
  }, {} as Record<string, MarketData>);

  return Object.values(grouped)
    .sort((a: MarketData, b: MarketData) => b.avgPrice - a.avgPrice)
    .slice(0, 15); // Top 15 markets
}

function getCommodityDistributionData(data: MandiPrice[]) {
  const counts = data.reduce((acc, item) => {
    acc[item.commodity] = (acc[item.commodity] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(counts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8); // Top 8 commodities
}

function getPriceRangeData(data: MandiPrice[], selectedCommodity?: string) {
  const filteredData = selectedCommodity 
    ? data.filter(item => item.commodity === selectedCommodity)
    : data;

  const grouped = filteredData.reduce((acc, item) => {
    if (!acc[item.commodity]) {
      acc[item.commodity] = {
        commodity: item.commodity,
        min_price: item.min_price_per_kg,
        max_price: item.max_price_per_kg,
        modal_price: item.modal_price_per_kg,
      };
    } else {
      acc[item.commodity].min_price = Math.min(acc[item.commodity].min_price, item.min_price_per_kg);
      acc[item.commodity].max_price = Math.max(acc[item.commodity].max_price, item.max_price_per_kg);
    }
    return acc;
  }, {} as Record<string, CommodityData>);

  return Object.values(grouped).map((item: CommodityData) => ({
    ...item,
    range: Number(item.max_price) - Number(item.min_price),
  }));
}

function getStateWiseAverageData(data: MandiPrice[]) {
  const grouped = data.reduce((acc, item) => {
    if (!item.state) return acc;
    
    if (!acc[item.state]) {
      acc[item.state] = {
        state: item.state,
        avgPrice: item.modal_price_per_kg,
        count: 1,
      };
    } else {
      acc[item.state].avgPrice = (acc[item.state].avgPrice * acc[item.state].count + item.modal_price_per_kg) / (acc[item.state].count + 1);
      acc[item.state].count++;
    }
    return acc;
  }, {} as Record<string, StateData>);

  return Object.values(grouped)
    .sort((a: StateData, b: StateData) => b.avgPrice - a.avgPrice)
    .slice(0, 10);
}

function getTopMarketsData(data: MandiPrice[]) {
  const counts = data.reduce((acc, item) => {
    acc[item.market] = (acc[item.market] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(counts)
    .map(([market, count]) => ({ market, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
}

function getVolatilityData(data: MandiPrice[]) {
  const commodityData = data.reduce((acc, item) => {
    if (!acc[item.commodity]) {
      acc[item.commodity] = {
        commodity: item.commodity,
        prices: [],
        avgPrice: 0,
      };
    }
    acc[item.commodity].prices.push(item.modal_price_per_kg);
    return acc;
  }, {} as Record<string, CommodityPricesData>);

  return Object.values(commodityData).map((item: CommodityPricesData) => {
    const avg = item.prices.reduce((sum: number, price: number) => sum + price, 0) / item.prices.length;
    const variance = item.prices.reduce((sum: number, price: number) => sum + Math.pow(price - avg, 2), 0) / item.prices.length;
    const stdDev = Math.sqrt(variance);
    const volatility = (stdDev / avg) * 100;
    
    return {
      commodity: item.commodity,
      avgPrice: avg,
      volatility: volatility,
    };
  }).slice(0, 8);
}

function getTrendData(data: MandiPrice[]) {
  const commodityData = data.reduce((acc, item) => {
    if (!acc[item.commodity]) {
      acc[item.commodity] = {
        commodity: item.commodity,
        prices: [],
      };
    }
    acc[item.commodity].prices.push(item.modal_price_per_kg);
    return acc;
  }, {} as Record<string, CommodityPricesData>);

  return Object.values(commodityData).map((item: CommodityPricesData) => {
    const prices = item.prices;
    return {
      commodity: item.commodity,
      minPrice: Math.min(...prices),
      avgPrice: prices.reduce((sum: number, price: number) => sum + price, 0) / prices.length,
      maxPrice: Math.max(...prices),
    };
  }).slice(0, 10);
}

function getRegionalSpreadData(data: MandiPrice[]) {
  const stateData = data.reduce((acc, item) => {
    if (!item.state) return acc;
    
    if (!acc[item.state]) {
      acc[item.state] = {
        state: item.state,
        prices: [],
      };
    }
    acc[item.state].prices.push(item.modal_price_per_kg);
    return acc;
  }, {} as Record<string, StatePricesData>);

  return Object.values(stateData).map((item: StatePricesData) => {
    const prices = item.prices;
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    return {
      state: item.state,
      priceSpread: max - min,
    };
  }).slice(0, 8);
}

function getMarketActivityData(data: MandiPrice[]) {
  const marketData = data.reduce((acc, item) => {
    if (!acc[item.market]) {
      acc[item.market] = {
        market: item.market,
        commodities: new Set(),
        totalValue: 0,
      };
    }
    acc[item.market].commodities.add(item.commodity);
    acc[item.market].totalValue += item.modal_price_per_kg;
    return acc;
  }, {} as Record<string, MarketActivityRawData>);

  return Object.values(marketData).map((item: MarketActivityRawData) => {
    const activityScore = item.commodities.size * (item.totalValue / item.commodities.size);
    return {
      market: item.market.slice(0, 15) + (item.market.length > 15 ? '...' : ''),
      activityScore: Math.round(activityScore),
    };
  }).sort((a: MarketActivityData, b: MarketActivityData) => b.activityScore - a.activityScore).slice(0, 8);
}

function getMarketInsights(data: MandiPrice[]) {
  const insights = [];

  // Highest priced commodity
  const highestPriced = data.reduce((max, item) => 
    Number(item.modal_price_per_kg) > Number(max.modal_price_per_kg) ? item : max
  );

  insights.push({
    title: 'Highest Priced',
    description: `${highestPriced.commodity} in ${highestPriced.market}`,
    value: formatCurrency(highestPriced.modal_price_per_kg),
    type: 'neutral' as const,
    icon: TrendingUp,
  });

  // Most markets
  const marketCounts = data.reduce((acc, item) => {
    acc[item.commodity] = new Set([...(acc[item.commodity] || []), item.market]);
    return acc;
  }, {} as Record<string, Set<string>>);

  const mostMarkets = Object.entries(marketCounts)
    .map(([commodity, markets]) => ({ commodity, count: (markets as Set<string>).size }))
    .sort((a, b) => b.count - a.count)[0];

  insights.push({
    title: 'Widest Market Reach',
    description: `${mostMarkets.commodity} available in most markets`,
    value: `${mostMarkets.count} markets`,
    type: 'positive' as const,
    icon: MapPin,
  });

  // Price volatility
  const volatility = data.reduce((acc, item) => {
    const range = item.max_price_per_kg - item.min_price_per_kg;
    const volatilityPercent = (range / item.modal_price_per_kg) * 100;
    
    if (!acc[item.commodity] || volatilityPercent > acc[item.commodity].volatility) {
      acc[item.commodity] = {
        commodity: item.commodity,
        volatility: volatilityPercent,
        range: range,
      };
    }
    return acc;
  }, {} as Record<string, VolatilityData>);

  const mostVolatile = Object.values(volatility)
    .sort((a: VolatilityData, b: VolatilityData) => b.volatility - a.volatility)[0] as VolatilityData;

  insights.push({
    title: 'Most Volatile',
    description: `${mostVolatile.commodity} shows highest price variation`,
    value: `${mostVolatile.volatility.toFixed(1)}% variation`,
    type: 'negative' as const,
    icon: TrendingDown,
  });

  return insights;
}

function formatCurrency(value: number) {
  return `₹${value.toFixed(2)}`;
}