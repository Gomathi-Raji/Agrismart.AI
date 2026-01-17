import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Search,
  Filter,
  Package,
  ShoppingCart,
  DollarSign,
  Eye,
  MapPin,
  Calendar,
  Scale,
  SlidersHorizontal,
  SortAsc,
  Clock
} from "lucide-react";
import { useMarketplace } from "@/contexts/MarketplaceContext";

// Function to get category-specific image from online sources
const getCategoryImage = (category: string) => {
  const images: { [key: string]: string } = {
    'Vegetables': 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&auto=format&fit=crop',
    'Fruits': 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=800&auto=format&fit=crop',
    'Crops': 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=800&auto=format&fit=crop',
    'Seeds': 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=800&auto=format&fit=crop',
    'Grains': 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&auto=format&fit=crop',
    'General': 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&auto=format&fit=crop',
    'Other': 'https://images.unsplash.com/photo-1560493676-04071c5f467b?w=800&auto=format&fit=crop'
  };
  return images[category] || images['General'];
};

// Function to get category color for gradient background
const getCategoryColor = (category: string) => {
  const colors: { [key: string]: string } = {
    'Vegetables': 'from-green-500 to-green-700',
    'Fruits': 'from-orange-500 to-red-500',
    'Crops': 'from-yellow-500 to-amber-600',
    'Seeds': 'from-brown-500 to-amber-700',
    'Grains': 'from-amber-600 to-yellow-700',
    'General': 'from-blue-500 to-indigo-600',
    'Other': 'from-gray-500 to-gray-700'
  };
  return colors[category] || colors['General'];
};

export default function Buy() {
  const { buyerRequests } = useMarketplace();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProductType, setSelectedProductType] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<string>("newest");
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  const filteredRequests = buyerRequests
    .filter((request) => {
      const matchesSearch = request.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           request.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           request.location.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesProductType = !selectedProductType || request.productName === selectedProductType;
      return matchesSearch && matchesProductType;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return a.maxPrice - b.maxPrice;
        case "price-high":
          return b.maxPrice - a.maxPrice;
        case "quantity-low":
          return a.quantity - b.quantity;
        case "quantity-high":
          return b.quantity - a.quantity;
        case "newest":
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'secondary';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'fulfilled': return 'secondary';
      case 'cancelled': return 'outline';
      default: return 'outline';
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-8">
      {/* Header */}
      <div className="bg-gradient-secondary text-secondary-foreground p-6 md:p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Buyer Requirements</h1>
          <p className="text-secondary-foreground/90">Browse bulk purchase requirements from verified buyers</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6 space-y-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="shadow-elegant">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Requests</p>
                  <p className="text-2xl font-bold">{buyerRequests.length}</p>
                </div>
                <ShoppingCart className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-elegant">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Open Requests</p>
                  <p className="text-2xl font-bold">{buyerRequests.filter(r => r.status === 'active').length}</p>
                </div>
                <Package className="h-8 w-8 text-success" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-elegant">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Value</p>
                  <p className="text-2xl font-bold">₹{buyerRequests.reduce((sum, req) => sum + (req.quantity * req.maxPrice), 0).toLocaleString()}</p>
                </div>
                <DollarSign className="h-8 w-8 text-warning" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-elegant">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Matched</p>
                  <p className="text-2xl font-bold">{buyerRequests.filter(r => r.status === 'fulfilled').length}</p>
                </div>
                <Eye className="h-8 w-8 text-info" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search & Filters */}
        <Card className="shadow-elegant">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search Bar */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search requirements..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Desktop Sort Dropdown */}
              <div className="hidden md:block">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-48">
                    <SortAsc className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                    <SelectItem value="quantity-low">Quantity: Low to High</SelectItem>
                    <SelectItem value="quantity-high">Quantity: High to Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Mobile Filter Button */}
              <div className="md:hidden">
                <Button
                  variant="outline"
                  className="w-full"
                >
                  <SlidersHorizontal className="h-4 w-4 mr-2" />
                  Filters & Sort
                </Button>
              </div>

              {/* Info Button */}
              <div className="text-sm text-muted-foreground flex items-center">
                <Eye className="h-4 w-4 mr-2" />
                Browse buyer requirements
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Requests Grid */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">
              {selectedProductType ? `${selectedProductType} Requirements` : "Buyer Requirements"}
            </h2>
            <p className="text-muted-foreground">{filteredRequests.length} requests found</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRequests.map((request) => (
              <Card key={request.id} className="overflow-hidden hover:shadow-xl transition-all duration-300 border-2 hover:border-green-500">
                <div className="relative h-56 overflow-hidden">
                  {/* Category gradient background */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${getCategoryColor(request.category)} opacity-90`}></div>
                  
                  {/* Image overlay */}
                  <img
                    src={getCategoryImage(request.category)}
                    alt={request.productName}
                    className="w-full h-full object-cover opacity-40"
                  />
                  
                  {/* Category badge */}
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-white/90 text-gray-900 font-semibold px-3 py-1 text-sm">
                      {request.category}
                    </Badge>
                  </div>
                  
                  {/* Urgency and Status badges */}
                  <div className="absolute top-4 right-4 flex gap-2">
                    <Badge
                      variant={getUrgencyColor(request.urgency) as any}
                      className="font-semibold"
                    >
                      {request.urgency.toUpperCase()}
                    </Badge>
                    <Badge
                      variant={getStatusColor(request.status) as any}
                      className="font-semibold"
                    >
                      {request.status.toUpperCase()}
                    </Badge>
                  </div>
                  
                  {/* Product name overlay */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                    <h3 className="text-white text-2xl font-bold">{request.productName}</h3>
                  </div>
                </div>

                <CardContent className="p-6">
                  {/* Description */}
                  {request.description && (
                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {request.description}
                    </p>
                  )}

                  {/* Requirement Details Grid */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    {/* Quantity */}
                    <div className="flex items-start gap-2 bg-gray-50 p-3 rounded-lg">
                      <Scale className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-500 font-medium">Quantity Needed</p>
                        <p className="font-semibold text-gray-900">
                          {request.quantity} {request.unit}
                        </p>
                      </div>
                    </div>

                    {/* Max Price */}
                    <div className="flex items-start gap-2 bg-gray-50 p-3 rounded-lg">
                      <DollarSign className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-500 font-medium">Max Price</p>
                        <p className="font-semibold text-gray-900">
                          ₹{request.maxPrice}/{request.unit}
                        </p>
                      </div>
                    </div>

                    {/* Location */}
                    <div className="flex items-start gap-2 bg-gray-50 p-3 rounded-lg">
                      <MapPin className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-500 font-medium">Location</p>
                        <p className="font-semibold text-gray-900">{request.location}</p>
                      </div>
                    </div>

                    {/* Suppliers */}
                    <div className="flex items-start gap-2 bg-gray-50 p-3 rounded-lg">
                      <Package className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-500 font-medium">Interested Suppliers</p>
                        <p className="font-semibold text-gray-900">{request.suppliers || 0} suppliers</p>
                      </div>
                    </div>
                  </div>

                  {/* Posted Date */}
                  <div className="text-xs text-gray-500 mb-4 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Posted on {new Date(request.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      <Eye className="h-4 w-4 mr-1" />
                      View Details
                    </Button>
                    <Button size="sm" className="flex-1 bg-green-600 hover:bg-green-700">
                      <ShoppingCart className="h-4 w-4 mr-1" />
                      Submit Offer
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredRequests.length === 0 && (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No requirements found</h3>
              <p className="text-muted-foreground">No buyer requirements match your current search criteria. Try adjusting your filters.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}