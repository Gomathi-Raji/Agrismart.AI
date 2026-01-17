import { createContext, useContext, useState, ReactNode } from 'react';

// Types
export interface SellerListing {
  id: string;
  productName: string;
  category: string;
  quantity: number;
  unit: string;
  price: number;
  harvestDate: string;
  location: string;
  quality: string;
  organic: boolean;
  status: 'available' | 'reserved' | 'sold';
  createdAt: string;
  description?: string;
  image?: string;
}

export interface BuyerRequest {
  id: string;
  productName: string;
  category: string;
  quantity: number;
  unit: string;
  maxPrice: number;
  urgency: 'low' | 'medium' | 'high';
  location: string;
  status: 'active' | 'fulfilled' | 'cancelled';
  createdAt: string;
  description?: string;
  suppliers?: number;
}

// Initial test data
const initialSellerListings: SellerListing[] = [
  {
    id: "1",
    productName: "Fresh Tomatoes",
    category: "Vegetables",
    quantity: 200,
    unit: "kg",
    price: 20,
    harvestDate: "2025-10-30",
    location: "Coimbatore Farm",
    quality: "Grade A",
    organic: true,
    status: "available",
    createdAt: "2025-10-28",
    description: "Fresh organic tomatoes harvested this morning. Perfect for wholesale buyers."
  },
  {
    id: "2",
    productName: "Premium Rice",
    category: "Crops",
    quantity: 500,
    unit: "kg",
    price: 40,
    harvestDate: "2025-11-05",
    location: "Thanjavur Fields",
    quality: "Premium",
    organic: false,
    status: "available",
    createdAt: "2025-10-28",
    description: "High-quality rice suitable for processing companies and bulk buyers."
  }
];

const initialBuyerRequests: BuyerRequest[] = [
  {
    id: "1",
    productName: "Fresh Tomatoes",
    category: "Vegetables",
    quantity: 500,
    unit: "kg",
    maxPrice: 25,
    urgency: "high",
    location: "Chennai Market",
    status: "active",
    createdAt: "2025-10-28",
    description: "Need fresh tomatoes for retail chain. Grade A quality required.",
    suppliers: 3
  }
];

interface MarketplaceContextType {
  // Seller listings
  sellerListings: SellerListing[];
  addSellerListing: (listing: Omit<SellerListing, 'id' | 'createdAt'>) => void;
  updateSellerListing: (id: string, listing: Partial<SellerListing>) => void;
  deleteSellerListing: (id: string) => void;
  toggleSellerListingStatus: (id: string) => void;

  // Buyer requests
  buyerRequests: BuyerRequest[];
  addBuyerRequest: (request: Omit<BuyerRequest, 'id' | 'createdAt' | 'suppliers'>) => void;
  updateBuyerRequest: (id: string, request: Partial<BuyerRequest>) => void;
  deleteBuyerRequest: (id: string) => void;
  toggleBuyerRequestStatus: (id: string) => void;
}

const MarketplaceContext = createContext<MarketplaceContextType | undefined>(undefined);

export function MarketplaceProvider({ children }: { children: ReactNode }) {
  const [sellerListings, setSellerListings] = useState<SellerListing[]>(initialSellerListings);
  const [buyerRequests, setBuyerRequests] = useState<BuyerRequest[]>(initialBuyerRequests);

  // Seller listing functions
  const addSellerListing = (listing: Omit<SellerListing, 'id' | 'createdAt'>) => {
    const newListing: SellerListing = {
      ...listing,
      id: Date.now().toString(),
      createdAt: new Date().toISOString().split('T')[0]
    };
    setSellerListings(prev => [newListing, ...prev]);
  };

  const updateSellerListing = (id: string, updates: Partial<SellerListing>) => {
    setSellerListings(prev => prev.map(listing =>
      listing.id === id ? { ...listing, ...updates } : listing
    ));
  };

  const deleteSellerListing = (id: string) => {
    setSellerListings(prev => prev.filter(listing => listing.id !== id));
  };

  const toggleSellerListingStatus = (id: string) => {
    setSellerListings(prev => prev.map(listing =>
      listing.id === id
        ? { ...listing, status: listing.status === 'available' ? 'reserved' : 'available' }
        : listing
    ));
  };

  // Buyer request functions
  const addBuyerRequest = (request: Omit<BuyerRequest, 'id' | 'createdAt' | 'suppliers'>) => {
    const newRequest: BuyerRequest = {
      ...request,
      id: Date.now().toString(),
      createdAt: new Date().toISOString().split('T')[0],
      suppliers: Math.floor(Math.random() * 10) + 1 // Random suppliers for demo
    };
    console.log("MarketplaceContext: Adding new buyer request", newRequest);
    setBuyerRequests(prev => {
      const updated = [newRequest, ...prev];
      console.log("MarketplaceContext: Updated buyer requests", updated);
      return updated;
    });
  };

  const updateBuyerRequest = (id: string, updates: Partial<BuyerRequest>) => {
    setBuyerRequests(prev => prev.map(request =>
      request.id === id ? { ...request, ...updates } : request
    ));
  };

  const deleteBuyerRequest = (id: string) => {
    setBuyerRequests(prev => prev.filter(request => request.id !== id));
  };

  const toggleBuyerRequestStatus = (id: string) => {
    setBuyerRequests(prev => prev.map(request =>
      request.id === id
        ? { ...request, status: request.status === 'active' ? 'cancelled' : 'active' }
        : request
    ));
  };

  const value: MarketplaceContextType = {
    sellerListings,
    addSellerListing,
    updateSellerListing,
    deleteSellerListing,
    toggleSellerListingStatus,
    buyerRequests,
    addBuyerRequest,
    updateBuyerRequest,
    deleteBuyerRequest,
    toggleBuyerRequestStatus
  };

  return (
    <MarketplaceContext.Provider value={value}>
      {children}
    </MarketplaceContext.Provider>
  );
}

export function useMarketplace() {
  const context = useContext(MarketplaceContext);
  if (context === undefined) {
    throw new Error('useMarketplace must be used within a MarketplaceProvider');
  }
  return context;
}