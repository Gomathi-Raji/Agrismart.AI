import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Plus,
  Package,
  CheckCircle,
  DollarSign,
  Leaf,
  Edit,
  Trash2,
  Scale,
  Calendar,
  MapPin
} from "lucide-react";
import { useMarketplace, type SellerListing } from "@/contexts/MarketplaceContext";

const categories = [
  "Vegetables", "Fruits", "Seeds", "Crops", "Organic Produce"
];

const units = ["kg", "quintal", "ton"];

const qualities = ["Grade A", "Grade B", "Premium", "Standard"];

export function ProductManagement() {
  const { sellerListings, addSellerListing, updateSellerListing, deleteSellerListing, toggleSellerListingStatus } = useMarketplace();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingListing, setEditingListing] = useState<SellerListing | null>(null);

  // Form state for creating new listing
  const [newListing, setNewListing] = useState({
    productName: "",
    category: "",
    quantity: "",
    unit: "kg",
    price: "",
    harvestDate: "",
    location: "",
    quality: "Grade A",
    organic: false,
    description: ""
  });

  const handleCreateListing = () => {
    if (!newListing.productName || !newListing.category || !newListing.quantity || !newListing.price || !newListing.harvestDate || !newListing.location) {
      alert("Please fill in all required fields");
      return;
    }

    addSellerListing({
      productName: newListing.productName,
      category: newListing.category,
      quantity: parseInt(newListing.quantity),
      unit: newListing.unit,
      price: parseInt(newListing.price),
      harvestDate: newListing.harvestDate,
      location: newListing.location,
      quality: newListing.quality,
      organic: newListing.organic,
      status: "available",
      description: newListing.description
    });

    setNewListing({
      productName: "",
      category: "",
      quantity: "",
      unit: "kg",
      price: "",
      harvestDate: "",
      location: "",
      quality: "Grade A",
      organic: false,
      description: ""
    });
    setShowCreateForm(false);
  };

  const handleEditListing = (listing: SellerListing) => {
    setEditingListing(listing);
    setNewListing({
      productName: listing.productName,
      category: listing.category,
      quantity: listing.quantity.toString(),
      unit: listing.unit,
      price: listing.price.toString(),
      harvestDate: listing.harvestDate,
      location: listing.location,
      quality: listing.quality,
      organic: listing.organic,
      description: listing.description || ""
    });
    setShowCreateForm(true);
  };

  const handleUpdateListing = () => {
    if (!editingListing) return;

    if (!newListing.productName || !newListing.category || !newListing.quantity || !newListing.price || !newListing.harvestDate || !newListing.location) {
      alert("Please fill in all required fields");
      return;
    }

    updateSellerListing(editingListing.id, {
      productName: newListing.productName,
      category: newListing.category,
      quantity: parseInt(newListing.quantity),
      unit: newListing.unit,
      price: parseInt(newListing.price),
      harvestDate: newListing.harvestDate,
      location: newListing.location,
      quality: newListing.quality,
      organic: newListing.organic,
      description: newListing.description
    });

    setEditingListing(null);
    setNewListing({
      productName: "",
      category: "",
      quantity: "",
      unit: "kg",
      price: "",
      harvestDate: "",
      location: "",
      quality: "Grade A",
      organic: false,
      description: ""
    });
    setShowCreateForm(false);
  };

  const handleCancelForm = () => {
    setShowCreateForm(false);
    setEditingListing(null);
    setNewListing({
      productName: "",
      category: "",
      quantity: "",
      unit: "kg",
      price: "",
      harvestDate: "",
      location: "",
      quality: "Grade A",
      organic: false,
      description: ""
    });
  };

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
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="shadow-elegant">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Listings</p>
                <p className="text-2xl font-bold">{sellerListings.length}</p>
              </div>
              <Package className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-elegant">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Available</p>
                <p className="text-2xl font-bold">{getAvailableListings()}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-elegant">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Value</p>
                <p className="text-2xl font-bold">₹{getTotalValue().toLocaleString()}</p>
              </div>
              <DollarSign className="h-8 w-8 text-warning" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-elegant">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Organic</p>
                <p className="text-2xl font-bold">{sellerListings.filter(l => l.organic).length}</p>
              </div>
              <Leaf className="h-8 w-8 text-info" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Create/Edit Listing Form */}
      {showCreateForm && (
        <Card className="shadow-elegant">
          <CardHeader>
            <CardTitle>{editingListing ? 'Edit Product Listing' : 'Create New Product Listing'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Product Name *</label>
                <Input
                  placeholder="Enter product name"
                  value={newListing.productName}
                  onChange={(e) => setNewListing(prev => ({ ...prev, productName: e.target.value }))}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Category *</label>
                <Select value={newListing.category} onValueChange={(value) => setNewListing(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Quantity *</label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="Enter quantity"
                    value={newListing.quantity}
                    onChange={(e) => setNewListing(prev => ({ ...prev, quantity: e.target.value }))}
                  />
                  <Select value={newListing.unit} onValueChange={(value) => setNewListing(prev => ({ ...prev, unit: value }))}>
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {units.map(unit => (
                        <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Price per {newListing.unit} *</label>
                <Input
                  type="number"
                  placeholder="Enter price"
                  value={newListing.price}
                  onChange={(e) => setNewListing(prev => ({ ...prev, price: e.target.value }))}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Harvest Date *</label>
                <Input
                  type="date"
                  value={newListing.harvestDate}
                  onChange={(e) => setNewListing(prev => ({ ...prev, harvestDate: e.target.value }))}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Quality Grade</label>
                <Select value={newListing.quality} onValueChange={(value) => setNewListing(prev => ({ ...prev, quality: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {qualities.map(quality => (
                      <SelectItem key={quality} value={quality}>{quality}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="md:col-span-2">
                <label className="text-sm font-medium">Location *</label>
                <Input
                  placeholder="Enter farm location"
                  value={newListing.location}
                  onChange={(e) => setNewListing(prev => ({ ...prev, location: e.target.value }))}
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  placeholder="Describe your produce..."
                  value={newListing.description}
                  onChange={(e) => setNewListing(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>

              <div className="md:col-span-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={newListing.organic}
                    onChange={(e) => setNewListing(prev => ({ ...prev, organic: e.target.checked }))}
                    className="rounded"
                  />
                  <span className="text-sm font-medium">Organic Produce</span>
                  <Leaf className="h-4 w-4 text-success" />
                </label>
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button onClick={editingListing ? handleUpdateListing : handleCreateListing}>
                {editingListing ? 'Update Listing' : 'Create Listing'}
              </Button>
              <Button variant="outline" onClick={handleCancelForm}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add New Listing Button */}
      {!showCreateForm && (
        <div className="flex justify-center">
          <Button onClick={() => setShowCreateForm(true)} className="w-full md:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Add New Product Listing
          </Button>
        </div>
      )}

      {/* Product Listings */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Your Product Listings</h3>

        {sellerListings.length === 0 ? (
          <Card className="shadow-elegant">
            <CardContent className="p-8 text-center">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No products listed yet</h3>
              <p className="text-muted-foreground mb-4">Create your first product listing to start selling to bulk buyers.</p>
              <Button onClick={() => setShowCreateForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Listing
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {sellerListings.map((listing) => (
              <Card key={listing.id} className="shadow-elegant">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    {/* Product Header */}
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold text-lg">{listing.productName}</h4>
                        <p className="text-muted-foreground text-sm">{listing.category}</p>
                      </div>
                      <div className="flex gap-1">
                        {listing.organic && (
                          <Badge className="bg-success text-success-foreground text-xs">
                            <Leaf className="h-3 w-3 mr-1" />
                            Organic
                          </Badge>
                        )}
                        <Badge variant={getStatusColor(listing.status) as any} className="text-xs">
                          {listing.status.toUpperCase()}
                        </Badge>
                      </div>
                    </div>

                    {/* Product Details */}
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center gap-1">
                        <Scale className="h-3 w-3" />
                        <span>{listing.quantity} {listing.unit}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        <span>₹{listing.price}/{listing.unit}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(listing.harvestDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        <span className="truncate">{listing.location}</span>
                      </div>
                    </div>

                    {listing.description && (
                      <p className="text-sm text-muted-foreground">{listing.description}</p>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditListing(listing)}
                        className="flex-1"
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant={listing.status === 'available' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => toggleSellerListingStatus(listing.id)}
                        className="flex-1"
                      >
                        {listing.status === 'available' ? 'Available' : 'Reserved'}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteSellerListing(listing.id)}
                        className="p-2"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}