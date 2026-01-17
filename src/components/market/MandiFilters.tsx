import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Filter,
  MapPin,
  Search,
  X,
  ChevronDown,
  SlidersHorizontal,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { 
  COMMODITY_CATEGORIES, 
  MandiPrice, 
  FilterOptions, 
  INDIAN_STATES, 
  getMarketsByState, 
  getDistrictsByState,
  searchMarketsWithChennaiSupport,
  getChennaiMarketAlternatives
} from '@/services/mandiService';

interface MandiFiltersProps {
  data: MandiPrice[];
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  isLoading?: boolean;
  className?: string;
}

export default function MandiFilters({
  data,
  filters,
  onFiltersChange,
  isLoading = false,
  className,
}: MandiFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Extract unique values from data
  const uniqueCommodities = [...new Set(data.map(item => item.commodity).filter(Boolean))].sort();

  // Use comprehensive state list instead of just data-based states
  const availableStates = INDIAN_STATES;
  
  // Filter districts and markets by selected state using helper functions
  const filteredDistricts = filters.state ? getDistrictsByState(data, filters.state) : [];
  const filteredMarkets = filters.state ? getMarketsByState(data, filters.state) : 
                         filters.district ? [...new Set(data.filter(item => item.district === filters.district).map(item => item.market).filter(Boolean))].sort() :
                         [...new Set(data.map(item => item.market).filter(Boolean))].sort();

  const updateFilter = (key: keyof FilterOptions, value: string | Date | number | boolean | undefined) => {
    const newFilters = { ...filters, [key]: value };
    
    // Reset dependent filters
    if (key === 'state') {
      newFilters.district = undefined;
    }
    
    onFiltersChange(newFilters);
  };

  const clearFilter = (key: keyof FilterOptions) => {
    updateFilter(key, undefined);
  };

  const clearAllFilters = () => {
    onFiltersChange({});
  };

  const getActiveFiltersCount = () => {
    return Object.values(filters).filter(value => 
      value !== undefined && value !== '' && value !== null
    ).length;
  };

  return (
    <Card className={`${className} bg-gradient-card border-border/50 shadow-tech overflow-hidden`}>
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <CardTitle className="flex items-center gap-2 text-lg md:text-xl text-primary">
            <Filter className="h-5 w-5" />
            <span>Filter & Search</span>
            {getActiveFiltersCount() > 0 && (
              <Badge variant="secondary" className="bg-secondary text-secondary-foreground">{getActiveFiltersCount()}</Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            {getActiveFiltersCount() > 0 && (
              <Button variant="outline" size="sm" onClick={clearAllFilters} className="border-primary/20 hover:bg-primary hover:text-primary-foreground">
                <X className="h-4 w-4 mr-1" />
                Clear
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="border-primary/20 hover:bg-primary hover:text-primary-foreground"
            >
              <SlidersHorizontal className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Advanced</span>
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Search Bar - Enhanced for Mobile with Chennai Suggestion */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search commodities, markets, states..."
            value={filters.search || ''}
            onChange={(e) => updateFilter('search', e.target.value)}
            className="pl-10 h-12 md:h-10 text-base md:text-sm"
          />
          {/* Chennai Search Suggestion - Enhanced */}
          {filters.search?.toLowerCase().includes('chennai') && (
            <div className="absolute top-full left-0 right-0 mt-1 p-4 bg-card border rounded-lg shadow-lg z-10">
              <div className="space-y-3">
                <div className="text-sm text-muted-foreground">
                  <strong className="text-primary">Chennai markets not available in government data.</strong> 
                  <br />Try these nearby Uzhavar Sandhais (farmer markets):
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      updateFilter('search', '');
                      updateFilter('state', 'Tamil Nadu');
                      updateFilter('district', 'Chengalpattu');
                    }}
                    className="text-xs justify-start"
                  >
                    <MapPin className="h-3 w-3 mr-1" />
                    Chengalpattu (45km)
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      updateFilter('search', 'Guduvancheri');
                      updateFilter('state', 'Tamil Nadu');
                    }}
                    className="text-xs justify-start"
                  >
                    <MapPin className="h-3 w-3 mr-1" />
                    Guduvancheri (30km)
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      updateFilter('search', 'Kundrathur');
                      updateFilter('state', 'Tamil Nadu');
                    }}
                    className="text-xs justify-start"
                  >
                    <MapPin className="h-3 w-3 mr-1" />
                    Kundrathur (25km)
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      updateFilter('search', '');
                      updateFilter('state', 'Tamil Nadu');
                    }}
                    className="text-xs justify-start"
                  >
                    <MapPin className="h-3 w-3 mr-1" />
                    All Tamil Nadu
                  </Button>
                </div>
                <div className="text-xs text-muted-foreground border-t pt-2">
                  <strong>Note:</strong> Koyambedu wholesale market prices not available via government API. 
                  Contact local traders or check market bulletins for current rates.
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Recent Data Toggle */}
                {/* Recent Data Toggle - Mobile Optimized */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-muted/30 rounded-lg">
          <div className="flex items-center space-x-2">
            <Label htmlFor="recent-data" className="text-sm md:text-base font-medium">
              Show only last 3 days data (recent)
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              size="sm"
              variant={filters.onlyRecentData !== false ? "default" : "outline"}
              className="h-10 px-4"
              onClick={() => updateFilter('onlyRecentData', filters.onlyRecentData === false ? true : false)}
            >
              {filters.onlyRecentData !== false ? "ON" : "OFF"}
            </Button>
          </div>
        </div>

        {/* Basic Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Commodity Selection */}
          <div className="space-y-2">
            <Label>Commodity</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  className="w-full justify-between"
                >
                  {filters.commodity || "Select commodity..."}
                  <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput placeholder="Search commodities..." />
                  <CommandEmpty>No commodity found.</CommandEmpty>
                  <CommandGroup className="max-h-64 overflow-auto">
                    {uniqueCommodities.map((commodity) => (
                      <CommandItem
                        key={commodity}
                        onSelect={() => updateFilter('commodity', commodity)}
                      >
                        {commodity}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
            {filters.commodity && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => clearFilter('commodity')}
                className="w-full"
              >
                <X className="h-3 w-3 mr-1" />
                Clear
              </Button>
            )}
          </div>

          {/* State Selection */}
          <div className="space-y-2">
            <Label>State</Label>
            <Select
              value={filters.state || ''}
              onValueChange={(value) => updateFilter('state', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select state..." />
              </SelectTrigger>
              <SelectContent>
                {availableStates.map((state) => (
                  <SelectItem key={state} value={state}>
                    {state}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {filters.state && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => clearFilter('state')}
                className="w-full"
              >
                <X className="h-3 w-3 mr-1" />
                Clear
              </Button>
            )}
          </div>

          {/* District Selection */}
          <div className="space-y-2">
            <Label>District</Label>
            <Select
              value={filters.district || ''}
              onValueChange={(value) => updateFilter('district', value)}
              disabled={!filters.state}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select district..." />
              </SelectTrigger>
              <SelectContent>
                {filteredDistricts.map((district) => (
                  <SelectItem key={district} value={district}>
                    {district}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {filters.district && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => clearFilter('district')}
                className="w-full"
              >
                <X className="h-3 w-3 mr-1" />
                Clear
              </Button>
            )}
          </div>

          {/* Sort By */}
          <div className="space-y-2">
            <Label>Sort By</Label>
            <Select
              value={filters.sortBy || ''}
              onValueChange={(value) => updateFilter('sortBy', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sort by..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="commodity">Commodity A-Z</SelectItem>
                <SelectItem value="price_asc">Price Low to High</SelectItem>
                <SelectItem value="price_desc">Price High to Low</SelectItem>
                <SelectItem value="date">Date (Latest)</SelectItem>
                <SelectItem value="market">Market A-Z</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Advanced Filters */}
        {showAdvanced && (
          <>
            <Separator />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

            </div>
          </>
        )}

        {/* Active Filters Display */}
        {getActiveFiltersCount() > 0 && (
          <>
            <Separator />
            <div>
              <Label className="text-sm font-medium mb-2 block">Active Filters</Label>
              <div className="flex flex-wrap gap-2">
                {filters.commodity && (
                  <Badge variant="secondary" className="gap-1">
                    {filters.commodity}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => clearFilter('commodity')}
                    />
                  </Badge>
                )}
                {filters.state && (
                  <Badge variant="secondary" className="gap-1">
                    {filters.state}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => clearFilter('state')}
                    />
                  </Badge>
                )}
                {filters.district && (
                  <Badge variant="secondary" className="gap-1">
                    {filters.district}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => clearFilter('district')}
                    />
                  </Badge>
                )}
                {filters.search && (
                  <Badge variant="secondary" className="gap-1">
                    Search: {filters.search}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => clearFilter('search')}
                    />
                  </Badge>
                )}
                {filters.onlyRecentData === false && (
                  <Badge variant="secondary" className="gap-1">
                    Historical data
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => clearFilter('onlyRecentData')}
                    />
                  </Badge>
                )}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}