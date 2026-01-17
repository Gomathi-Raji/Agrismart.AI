import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Search,
  Filter,
  Package,
  CheckCircle,
  DollarSign,
  Leaf,
  Scale,
  Calendar,
  MapPin,
  Eye,
  SortAsc
} from "lucide-react";
import marketplaceImage from "@/assets/marketplace.jpg";
import { useMarketplace } from "@/contexts/MarketplaceContext";

export default function Sell() {
  const { sellerListings } = useMarketplace();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<string>("newest");

  const filteredListings = sellerListings
    .filter((listing) => {
      const matchesSearch = listing.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           listing.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           listing.location.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = !selectedCategory || listing.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return a.price - b.price;
        case "price-high":
          return b.price - a.price;
        case "quantity-low":
          return a.quantity - b.quantity;
        case "quantity-high":
          return b.quantity - a.quantity;
        case "newest":
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'default';
      case 'reserved': return 'secondary';
      case 'sold': return 'outline';
      default: return 'outline';
    }
  };

  const getTotalValue = () => {
    return sellerListings.reduce((sum, listing) => sum + (listing.quantity * listing.price), 0);
  };

  const getAvailableListings = () => {
    return sellerListings.filter(l => l.status === 'available').length;
  };

  return (
    <div className='min-h-screen bg-background pb-20 md:pb-8'>
      {/* Header */}
      <div className='bg-gradient-secondary text-secondary-foreground p-6 md:p-8'>
        <div className='max-w-6xl mx-auto'>
          <h1 className='text-3xl md:text-4xl font-bold mb-2'>Marketplace</h1>
          <p className='text-secondary-foreground/90'>Browse fresh produce listings from verified sellers</p>
        </div>
      </div>

      <div className='max-w-6xl mx-auto p-6 space-y-8'>
        {/* Statistics Cards */}
        <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
          <Card className='shadow-elegant'>
            <CardContent className='p-4'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm text-muted-foreground'>Total Listings</p>
                                    <p className='text-2xl font-bold'>{sellerListings.length}</p>
                </div>
                <Package className='h-8 w-8 text-primary' />
              </div>
            </CardContent>
          </Card>

          <Card className='shadow-elegant'>
            <CardContent className='p-4'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm text-muted-foreground'>Available</p>
                  <p className='text-2xl font-bold'>{getAvailableListings()}</p>
                </div>
                <CheckCircle className='h-8 w-8 text-success' />
              </div>
            </CardContent>
          </Card>

          <Card className='shadow-elegant'>
            <CardContent className='p-4'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm text-muted-foreground'>Total Value</p>
                  <p className='text-2xl font-bold'>₹{getTotalValue().toLocaleString()}</p>
                </div>
                <DollarSign className='h-8 w-8 text-warning' />
              </div>
            </CardContent>
          </Card>

          <Card className='shadow-elegant'>
            <CardContent className='p-4'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm text-muted-foreground'>Organic</p>
                  <p className='text-2xl font-bold'>{sellerListings.filter(l => l.organic).length}</p>
                </div>
                <Leaf className='h-8 w-8 text-info' />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Create Listing Form */}
        {/* Removed - CRUD operations moved to User Profile */}        {/* Search & Filters */}
        <Card className='shadow-elegant'>
          <CardContent className='p-6'>
            <div className='flex flex-col lg:flex-row gap-4'>
              {/* Search Bar */}
              <div className='relative flex-1'>
                <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground' />
                <Input
                  placeholder='Search products...'
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className='pl-10'
                />
              </div>

              {/* Desktop Sort Dropdown */}
              <div className='hidden md:block'>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className='w-48'>
                    <SortAsc className='h-4 w-4 mr-2' />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='newest'>Newest First</SelectItem>
                    <SelectItem value='price-low'>Price: Low to High</SelectItem>
                    <SelectItem value='price-high'>Price: High to Low</SelectItem>
                    <SelectItem value='quantity-low'>Quantity: Low to High</SelectItem>
                    <SelectItem value='quantity-high'>Quantity: High to Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Mobile Filter Button */}
              <div className="md:hidden">
                <Button
                  variant="outline"
                  className="w-full"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filters & Sort
                </Button>
              </div>

              {/* Info Button */}
              <div className="text-sm text-muted-foreground flex items-center">
                <Eye className="h-4 w-4 mr-2" />
                Browse available products
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Listings Grid */}
        <div className='space-y-4'>
          <div className='flex justify-between items-center'>
            <h2 className='text-2xl font-semibold'>
              {selectedCategory ? `${selectedCategory} Products` : 'Available Products'}
            </h2>
            <p className='text-muted-foreground'>{filteredListings.length} listings found</p>
          </div>

          <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {filteredListings.map((listing) => (
              <Card key={listing.id} className='shadow-elegant hover:shadow-glow transition-all duration-300'>
                <div className='relative'>
                  <img
                    src={marketplaceImage}
                    alt={listing.productName}
                    className='w-full h-32 object-cover rounded-t-lg'
                  />
                  <div className='absolute top-2 right-2 flex gap-1'>
                    {listing.organic && (
                      <Badge className='bg-success text-success-foreground text-xs'>
                        <Leaf className='h-3 w-3 mr-1' />
                        Organic
                      </Badge>
                    )}
                    <Badge variant={getStatusColor(listing.status) as any} className='text-xs'>
                      {listing.status.toUpperCase()}
                    </Badge>
                  </div>
                </div>

                <CardContent className='p-4'>
                  <div className='space-y-3'>
                    {/* Product Info */}
                    <div>
                      <div className='flex justify-between items-start'>
                        <div>
                          <h3 className='font-semibold text-lg'>{listing.productName}</h3>
                          <p className='text-muted-foreground text-sm'>{listing.category}</p>
                        </div>
                        <Badge variant='outline' className='text-xs'>
                          {listing.quality}
                        </Badge>
                      </div>
                      {listing.description && (
                        <p className='text-sm text-muted-foreground mt-1'>{listing.description}</p>
                      )}
                    </div>

                    {/* Details */}
                    <div className='grid grid-cols-2 gap-2 text-sm'>
                      <div className='flex items-center gap-1'>
                        <Scale className='h-3 w-3' />
                        <span>{listing.quantity} {listing.unit}</span>
                      </div>
                      <div className='flex items-center gap-1'>
                        <DollarSign className='h-3 w-3' />
                        <span>₹{listing.price}/{listing.unit}</span>
                      </div>
                      <div className='flex items-center gap-1'>
                        <Calendar className='h-3 w-3' />
                        <span>{new Date(listing.harvestDate).toLocaleDateString()}</span>
                      </div>
                      <div className='flex items-center gap-1'>
                        <MapPin className='h-3 w-3' />
                        <span className='truncate'>{listing.location}</span>
                      </div>
                    </div>

                    {/* Actions */}
                                        {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View Details
                      </Button>
                      <Button
                        variant="default"
                        size="sm"
                        className="flex-1"
                      >
                        Contact Seller
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredListings.length === 0 && (
            <div className='text-center py-12'>
              <Package className='h-12 w-12 text-muted-foreground mx-auto mb-4' />
              <h3 className='text-lg font-medium mb-2'>No listings found</h3>
              <p className='text-muted-foreground'>No products match your current search criteria. Try adjusting your filters.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
