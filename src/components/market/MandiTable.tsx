import { useState, useMemo, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Download,
  Filter,
  MapPin,
  TrendingUp,
  TrendingDown,
  Calendar,
  MoreVertical,
  Eye,
  Bookmark,
  Share,
  X,
} from 'lucide-react';
import { MandiPrice, getCommodityCategory } from '@/services/mandiService';
import { format, parseISO } from 'date-fns';

interface MandiTableProps {
  data: MandiPrice[];
  isLoading?: boolean;
  onRowClick?: (item: MandiPrice) => void;
  className?: string;
}

type SortField = 'commodity' | 'market' | 'state' | 'price' | 'date';
type SortDirection = 'asc' | 'desc';

export default function MandiTable({
  data,
  isLoading = false,
  onRowClick,
  className,
}: MandiTableProps) {
  const [sortField, setSortField] = useState<SortField>('commodity');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [viewMode, setViewMode] = useState<'cards' | 'compact'>('cards'); // Mobile view mode
  
  // Filter states
  const [commodityFilter, setCommodityFilter] = useState<string>('all');
  const [stateFilter, setStateFilter] = useState<string>('all');
  const [districtFilter, setDistrictFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  // Log data for debugging
  console.log('MandiTable received data:', data ? data.length : 0, 'records');
  if (data && data.length > 0) {
    console.log('MandiTable first record:', data[0]);
  }

  // Sort data
  const sortedData = [...data].sort((a, b) => {
    let aValue: string | number | Date, bValue: string | number | Date;

    switch (sortField) {
      case 'commodity':
        aValue = a.commodity.toLowerCase();
        bValue = b.commodity.toLowerCase();
        break;
      case 'market':
        aValue = a.market.toLowerCase();
        bValue = b.market.toLowerCase();
        break;
      case 'state':
        aValue = (a.state || '').toLowerCase();
        bValue = (b.state || '').toLowerCase();
        break;
      case 'price':
        aValue = a.modal_price_per_kg;
        bValue = b.modal_price_per_kg;
        break;
      case 'date':
        aValue = new Date(a.price_date);
        bValue = new Date(b.price_date);
        break;
      default:
        return 0;
    }

    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  // Filter data
  const filteredData = useMemo(() => {
    return sortedData.filter((item) => {
      const matchesCommodity = commodityFilter === 'all' || item.commodity.toLowerCase() === commodityFilter.toLowerCase();
      const matchesState = stateFilter === 'all' || (item.state || '').toLowerCase() === stateFilter.toLowerCase();
      const matchesDistrict = districtFilter === 'all' || (item.district || '').toLowerCase() === districtFilter.toLowerCase();
      
      return matchesCommodity && matchesState && matchesDistrict;
    });
  }, [sortedData, commodityFilter, stateFilter, districtFilter]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [commodityFilter, stateFilter, districtFilter]);

  // Get unique values for filter dropdowns
  const uniqueCommodities = useMemo(() => {
    const commodities = [...new Set(data.map(item => item.commodity))].sort();
    return commodities;
  }, [data]);

  const uniqueStates = useMemo(() => {
    const states = [...new Set(data.map(item => item.state).filter(Boolean))].sort();
    return states;
  }, [data]);

  const uniqueDistricts = useMemo(() => {
    const districts = [...new Set(data.map(item => item.district).filter(Boolean))].sort();
    return districts;
  }, [data]);

  // Pagination with filtered data
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleRowSelect = (index: number) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedRows(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedRows.size === paginatedData.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(paginatedData.map((_, index) => index)));
    }
  };

  const clearFilters = () => {
    setCommodityFilter('all');
    setStateFilter('all');
    setDistrictFilter('all');
    setCurrentPage(1);
  };

  const hasActiveFilters = commodityFilter !== 'all' || stateFilter !== 'all' || districtFilter !== 'all';

  const formatPrice = (price: number) => `₹${price.toFixed(2)}`;
  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'MMM dd, yyyy');
    } catch {
      return dateString;
    }
  };

  const getPriceChangeIndicator = (item: MandiPrice) => {
    const range = item.max_price_per_kg - item.min_price_per_kg;
    const changePercent = (range / item.modal_price_per_kg) * 100;
    
    if (changePercent > 20) {
      return { icon: TrendingUp, color: 'text-destructive', label: 'High Volatility' };
    } else if (changePercent > 10) {
      return { icon: TrendingUp, color: 'text-warning', label: 'Medium Volatility' };
    } else {
      return { icon: TrendingUp, color: 'text-success', label: 'Stable' };
    }
  };

  const getCategoryBadge = (commodity: string) => {
    const category = getCommodityCategory(commodity);
    const colors = {
      fruits: 'bg-warning/10 text-warning border-warning/20',
      vegetables: 'bg-success/10 text-success border-success/20',
      cereals: 'bg-secondary/10 text-secondary-foreground border-secondary/20',
      pulses: 'bg-info/10 text-info border-info/20',
      oilseeds: 'bg-primary/10 text-primary border-primary/20',
      spices: 'bg-destructive/10 text-destructive border-destructive/20',
      other: 'bg-muted text-muted-foreground border-border',
    };
    
    return (
      <Badge className={colors[category as keyof typeof colors] || colors.other}>
        {category}
      </Badge>
    );
  };

  const exportData = () => {
    const csvContent = [
      ['Commodity', 'Variety', 'Market', 'District', 'State', 'Min Price (₹/kg)', 'Max Price (₹/kg)', 'Modal Price (₹/kg)', 'Date'].join(','),
      ...filteredData.map(item => [
        item.commodity,
        item.variety || '',
        item.market,
        item.district || '',
        item.state || '',
        item.min_price_per_kg.toFixed(2),
        item.max_price_per_kg.toFixed(2),
        item.modal_price_per_kg.toFixed(2),
        item.price_date,
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mandi_prices_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <div className="animate-pulse">
            <div className="h-6 bg-muted rounded w-1/4 mb-2"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-12 bg-muted rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`${className} bg-gradient-card border-border/50 shadow-tech overflow-hidden`}>
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg md:text-xl text-primary">
              <Filter className="h-5 w-5" />
              <span>Mandi Price Data</span>
              <Badge variant="secondary" className="text-xs bg-secondary text-secondary-foreground">
                {filteredData.length} {hasActiveFilters ? 'filtered' : 'total'}
              </Badge>
            </CardTitle>
            <p className="text-xs md:text-sm text-muted-foreground mt-1">
              Real-time commodity prices from various mandis across India
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={exportData} className="text-xs border-primary/20 hover:bg-primary hover:text-primary-foreground">
              <Download className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Export CSV</span>
              <span className="sm:hidden">Export</span>
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Filter Controls */}
        <div className="mb-4 space-y-3">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              Filters
              {hasActiveFilters && (
                <Badge variant="secondary" className="ml-1 h-5 w-5 rounded-full p-0 text-xs">
                  {(commodityFilter !== 'all' ? 1 : 0) + (stateFilter !== 'all' ? 1 : 0) + (districtFilter !== 'all' ? 1 : 0)}
                </Badge>
              )}
            </Button>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4 mr-1" />
                Clear Filters
              </Button>
            )}
          </div>

          {showFilters && (
            <Card className="p-4 bg-muted/50">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="commodity-filter" className="text-sm font-medium">
                    Commodity
                  </Label>
                  <Select value={commodityFilter} onValueChange={setCommodityFilter}>
                    <SelectTrigger id="commodity-filter">
                      <SelectValue placeholder="All Commodities" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Commodities</SelectItem>
                      {uniqueCommodities.map((commodity) => (
                        <SelectItem key={commodity} value={commodity}>
                          {commodity}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="state-filter" className="text-sm font-medium">
                    State
                  </Label>
                  <Select value={stateFilter} onValueChange={setStateFilter}>
                    <SelectTrigger id="state-filter">
                      <SelectValue placeholder="All States" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All States</SelectItem>
                      {uniqueStates.map((state) => (
                        <SelectItem key={state} value={state}>
                          {state}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="district-filter" className="text-sm font-medium">
                    District
                  </Label>
                  <Select value={districtFilter} onValueChange={setDistrictFilter}>
                    <SelectTrigger id="district-filter">
                      <SelectValue placeholder="All Districts" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Districts</SelectItem>
                      {uniqueDistricts.map((district) => (
                        <SelectItem key={district} value={district}>
                          {district}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Mobile Summary Stats - AgriSmart Theme */}
        <div className="block md:hidden mb-4">
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-gradient-card border-border/50 shadow-tech p-3 rounded-lg text-center">
              <div className="text-xs text-primary font-medium">Total Records</div>
              <div className="text-xl font-bold text-primary">{filteredData.length}</div>
            </div>
            <div className="bg-gradient-card border-border/50 shadow-tech p-3 rounded-lg text-center">
              <div className="text-xs text-success font-medium">Avg Price/kg</div>
              <div className="text-xl font-bold text-success">
                {filteredData.length > 0 
                  ? formatPrice(filteredData.reduce((sum, item) => sum + item.modal_price_per_kg, 0) / filteredData.length)
                  : '₹0.00'
                }
              </div>
            </div>
          </div>
          
          {/* Mobile View Toggle - AgriSmart Theme */}
          <div className="flex items-center justify-center gap-2 mb-4">
            <Button
              variant={viewMode === 'cards' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('cards')}
              className="text-xs flex-1 bg-primary hover:bg-primary/90 data-[state=open]:bg-primary"
            >
              Card View
            </Button>
            <Button
              variant={viewMode === 'compact' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('compact')}
              className="text-xs flex-1 bg-primary hover:bg-primary/90 data-[state=open]:bg-primary"
            >
              Compact
            </Button>
          </div>
        </div>

        {/* Table Controls - Mobile Optimized */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2 order-2 sm:order-1">
            <Label className="text-xs md:text-sm">Show:</Label>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-2 py-1 border rounded text-xs md:text-sm"
              aria-label="Number of entries to show per page"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span className="text-xs md:text-sm text-muted-foreground">entries</span>
          </div>

          {selectedRows.size > 0 && (
            <div className="flex items-center gap-2 order-1 sm:order-2">
              <span className="text-xs md:text-sm text-muted-foreground">
                {selectedRows.size} selected
              </span>
              <Button variant="outline" size="sm" className="text-xs">
                <Download className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Export Selected</span>
                <span className="sm:hidden">Export</span>
              </Button>
            </div>
          )}
        </div>

        {/* Mobile Layout - Cards or Compact */}
        <div className="block md:hidden space-y-3">
          {viewMode === 'cards' ? (
            // Card View
            paginatedData.map((item, index) => {
              const changeIndicator = getPriceChangeIndicator(item);
              const globalIndex = startIndex + index;
              
              return (
                <Card
                  key={globalIndex}
                  className={`cursor-pointer hover:shadow-md transition-shadow ${
                    selectedRows.has(index) ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => onRowClick?.(item)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-primary mb-1">
                          {item.commodity}
                        </h3>
                        {item.variety && (
                          <p className="text-sm text-muted-foreground mb-1">
                            Variety: {item.variety}
                          </p>
                        )}
                        <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                          <MapPin className="h-4 w-4" />
                          <span>{item.market}</span>
                          {item.district && <span>, {item.district}</span>}
                        </div>
                        {item.state && (
                          <Badge variant="outline" className="mb-2">
                            {item.state}
                          </Badge>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-green-600 mb-1">
                          {formatPrice(item.modal_price_per_kg * 100)}
                        </div>
                        <div className="text-xs text-muted-foreground mb-1">
                          per quintal
                        </div>
                        <div className="text-sm font-semibold text-green-700">
                          {formatPrice(item.modal_price_per_kg)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          per kg
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div className="bg-red-50 p-2 rounded">
                        <div className="text-xs text-red-600 font-medium">Min Price</div>
                        <div className="text-sm font-bold text-red-700">
                          {formatPrice(item.min_price_per_kg * 100)}/quintal
                        </div>
                        <div className="text-xs text-red-600">
                          {formatPrice(item.min_price_per_kg)}/kg
                        </div>
                      </div>
                      <div className="bg-green-50 p-2 rounded">
                        <div className="text-xs text-green-600 font-medium">Max Price</div>
                        <div className="text-sm font-bold text-green-700">
                          {formatPrice(item.max_price_per_kg * 100)}/quintal
                        </div>
                        <div className="text-xs text-green-600">
                          {formatPrice(item.max_price_per_kg)}/kg
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between pt-2 border-t">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">
                          {formatDate(item.price_date)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <changeIndicator.icon className={`h-4 w-4 ${changeIndicator.color}`} />
                        <span className={`text-xs font-medium ${changeIndicator.color}`}>
                          {changeIndicator.label}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mt-3">
                      <input
                        type="checkbox"
                        checked={selectedRows.has(index)}
                        onChange={(e) => {
                          e.stopPropagation();
                          handleRowSelect(index);
                        }}
                        className="rounded w-4 h-4"
                        aria-label={`Select row ${index + 1}`}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => e.stopPropagation()}
                        className="text-xs"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          ) : (
            // Compact View
            paginatedData.map((item, index) => {
              const globalIndex = startIndex + index;
              
              return (
                <div
                  key={globalIndex}
                  className={`p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors ${
                    selectedRows.has(index) ? 'bg-muted border-primary' : ''
                  }`}
                  onClick={() => onRowClick?.(item)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <input
                          type="checkbox"
                          checked={selectedRows.has(index)}
                          onChange={(e) => {
                            e.stopPropagation();
                            handleRowSelect(index);
                          }}
                          className="rounded w-4 h-4"
                          aria-label={`Select ${item.commodity} row`}
                        />
                        <h4 className="font-semibold text-sm truncate">
                          {item.commodity}
                        </h4>
                        {item.state && (
                          <Badge variant="outline" className="text-xs">
                            {item.state}
                          </Badge>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground truncate">
                        {item.market}
                        {item.district && `, ${item.district}`}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatDate(item.price_date)}
                      </div>
                    </div>
                    <div className="text-right ml-3">
                      <div className="text-lg font-bold text-green-600">
                        {formatPrice(item.modal_price_per_kg * 100)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        per quintal
                      </div>
                      <div className="text-sm font-semibold text-green-700 mt-1">
                        {formatPrice(item.modal_price_per_kg)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        per kg
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
          
          {paginatedData.length === 0 && (
            <div className="text-center py-12">
              <Filter className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No data found matching your criteria</p>
            </div>
          )}
        </div>

        {/* Desktop Table Layout - Hidden on mobile */}
        <div className="hidden md:block rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40px] hidden sm:table-cell">
                  <input
                    type="checkbox"
                    checked={selectedRows.size === paginatedData.length && paginatedData.length > 0}
                    onChange={handleSelectAll}
                    className="rounded"
                    aria-label="Select all rows"
                  />
                </TableHead>
                <TableHead className="min-w-[120px]">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort('commodity')}
                    className="font-semibold text-xs md:text-sm"
                  >
                    Commodity
                    <ArrowUpDown className="h-3 w-3 md:h-4 md:w-4 ml-1" />
                  </Button>
                </TableHead>
                <TableHead className="hidden md:table-cell">Variety</TableHead>
                <TableHead className="hidden lg:table-cell">Category</TableHead>
                <TableHead className="min-w-[100px]">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort('market')}
                    className="font-semibold text-xs md:text-sm"
                  >
                    Market
                    <ArrowUpDown className="h-3 w-3 md:h-4 md:w-4 ml-1" />
                  </Button>
                </TableHead>
                <TableHead className="hidden sm:table-cell">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort('state')}
                    className="font-semibold text-xs md:text-sm"
                  >
                    State
                    <ArrowUpDown className="h-3 w-3 md:h-4 md:w-4 ml-1" />
                  </Button>
                </TableHead>
                <TableHead className="text-right min-w-[140px]">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort('price')}
                    className="font-semibold text-xs md:text-sm"
                  >
                    Price (₹/quintal, ₹/kg)
                    <ArrowUpDown className="h-3 w-3 md:h-4 md:w-4 ml-1" />
                  </Button>
                </TableHead>
                <TableHead className="text-center hidden lg:table-cell">Range</TableHead>
                <TableHead className="hidden sm:table-cell">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort('date')}
                    className="font-semibold text-xs md:text-sm"
                  >
                    Date
                    <ArrowUpDown className="h-3 w-3 md:h-4 md:w-4 ml-1" />
                  </Button>
                </TableHead>
                <TableHead className="w-[40px]">
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.map((item, index) => {
                const changeIndicator = getPriceChangeIndicator(item);
                const globalIndex = startIndex + index;
                
                return (
                  <TableRow
                    key={globalIndex}
                    className={`cursor-pointer hover:bg-muted/50 ${
                      selectedRows.has(index) ? 'bg-muted' : ''
                    }`}
                    onClick={() => onRowClick?.(item)}
                  >
                    <TableCell className="hidden sm:table-cell">
                      <input
                        type="checkbox"
                        checked={selectedRows.has(index)}
                        onChange={(e) => {
                          e.stopPropagation();
                          handleRowSelect(index);
                        }}
                        className="rounded"
                        aria-label={`Select ${item.commodity} row`}
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      <div className="space-y-1">
                        <div className="text-sm md:text-base">{item.commodity}</div>
                        <div className="text-xs text-muted-foreground md:hidden">
                          {item.market}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground hidden md:table-cell">
                      {item.variety || 'N/A'}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {getCategoryBadge(item.commodity)}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm">{item.market}</span>
                      </div>
                      {item.district && (
                        <div className="text-xs text-muted-foreground">
                          {item.district}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Badge variant="outline" className="text-xs">
                        {item.state || 'N/A'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="space-y-1">
                        <div className="font-bold text-sm md:text-lg">
                          {formatPrice(item.modal_price_per_kg * 100)}/quintal
                        </div>
                        <div className="text-xs md:text-sm text-muted-foreground">
                          {formatPrice(item.modal_price_per_kg)}/kg
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Range: {formatPrice(item.min_price_per_kg * 100)} - {formatPrice(item.max_price_per_kg * 100)}/quintal
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-center hidden lg:table-cell">
                      <div className="flex items-center justify-center gap-1">
                        <changeIndicator.icon className={`h-4 w-4 ${changeIndicator.color}`} />
                        <span className={`text-xs ${changeIndicator.color}`}>
                          {changeIndicator.label}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs md:text-sm">
                          {formatDate(item.price_date)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Bookmark className="h-4 w-4 mr-2" />
                            Add to Watchlist
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Share className="h-4 w-4 mr-2" />
                            Share
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {paginatedData.length === 0 && (
            <div className="text-center py-12">
              <Filter className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No data found matching your criteria</p>
            </div>
          )}
        </div>

        {/* Pagination - Mobile Optimized */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-4">
            <div className="text-xs md:text-sm text-muted-foreground text-center sm:text-left">
              Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredData.length)} of {filteredData.length} entries
              {hasActiveFilters && ` (filtered from ${data.length} total)`}
            </div>
            <div className="flex items-center justify-center gap-1 sm:gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="text-xs"
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="hidden sm:inline ml-1">Previous</span>
              </Button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(3, totalPages) }, (_, i) => {
                  const page = i + 1;
                  return (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                      className="text-xs w-8 h-8"
                    >
                      {page}
                    </Button>
                  );
                })}
                {totalPages > 3 && (
                  <>
                    <span className="px-1 text-xs">...</span>
                    <Button
                      variant={currentPage === totalPages ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(totalPages)}
                      className="text-xs w-8 h-8"
                    >
                      {totalPages}
                    </Button>
                  </>
                )}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="text-xs"
              >
                <span className="hidden sm:inline mr-1">Next</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}