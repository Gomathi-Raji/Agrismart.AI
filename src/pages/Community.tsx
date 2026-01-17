import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useTranslation } from "@/hooks/useTranslation";
import { 
  MessageCircle, 
  Heart, 
  Share2, 
  Calendar, 
  MapPin, 
  Users, 
  Award,
  TrendingUp,
  Search,
  Filter,
  Plus,
  Camera,
  ThumbsUp,
  ThumbsDown,
  Star,
  Clock,
  BookOpen,
  ShoppingCart,
  AlertCircle
} from "lucide-react";

// Import community images
import yieldSuccess from "@/assets/yield-success.jpg";
import knowledgeSharing from "@/assets/knowledge-sharing.jpg";
import agricultureWorkshop from "@/assets/agriculture-workshop.jpg";

// Mock data for demonstration
const mockPosts = [
  {
    id: 1,
    type: "question",
    title: "My tomato plants have yellow leaves - what could be the problem?",
    content: "I've been growing tomatoes for 3 months now, and recently the leaves are turning yellow from the bottom. The plants are getting enough water. What could be causing this?",
    author: {
      name: "Rajesh Kumar",
      location: "Punjab",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
      badge: "Experienced Farmer",
      reputation: 234
    },
    timestamp: "2 hours ago",
    category: "Disease Diagnosis",
    likes: 12,
    replies: 8,
    tags: ["tomatoes", "plant-disease", "yellowing"],
    hasImages: true,
    language: "en",
    postImage: "https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=600&h=300&fit=crop&crop=center"
  },
  {
    id: 2,
    type: "tip",
    title: "Effective Organic Pest Control Using Neem Oil",
    content: "I've been using neem oil spray for the past 2 years and it's incredibly effective against aphids and whiteflies. Mix 2 tablespoons of neem oil with 1 liter of water and spray in the evening.",
    author: {
      name: "Dr. Priya Sharma",
      location: "Maharashtra",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
      badge: "Agri Expert",
      reputation: 1250
    },
    timestamp: "1 day ago",
    category: "Pest Control",
    likes: 45,
    replies: 23,
    tags: ["organic", "pest-control", "neem-oil"],
    hasImages: true,
    language: "en",
    postImage: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&h=300&fit=crop&crop=center"
  },
  {
    id: 3,
    type: "success-story",
    title: "Increased my crop yield by 40% using smart irrigation",
    content: "Sharing my experience with drip irrigation system. Initial investment was ₹25,000 but saved 60% water and increased yield significantly. Happy to answer questions!",
    author: {
      name: "Krishnan Nair",
      location: "Kerala",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
      badge: "Innovation Leader",
      reputation: 578
    },
    timestamp: "3 days ago",
    category: "Success Story",
    likes: 89,
    replies: 34,
    tags: ["irrigation", "water-management", "yield-increase"],
    hasImages: true,
    language: "en",
    postImage: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=600&h=300&fit=crop&crop=center"
  },
  {
    id: 4,
    type: "question",
    title: "Best fertilizer for organic vegetable farming?",
    content: "I'm transitioning to organic farming and looking for recommendations on the best organic fertilizers for vegetables. What has worked well for you?",
    author: {
      name: "Sunita Devi",
      location: "Haryana", 
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face",
      badge: "New Farmer",
      reputation: 45
    },
    timestamp: "5 hours ago",
    category: "Fertilizers",
    likes: 8,
    replies: 12,
    tags: ["organic", "fertilizers", "vegetables"],
    hasImages: false,
    language: "en"
  },
  {
    id: 5,
    type: "tip",
    title: "Monsoon preparation checklist for farmers",
    content: "Essential steps to prepare your farm for monsoon season. From drainage systems to crop protection, here's what I learned after 15 years of farming.",
    author: {
      name: "Ramesh Patel",
      location: "Gujarat",
      avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&h=100&fit=crop&crop=face",
      badge: "Weather Expert",
      reputation: 445
    },
    timestamp: "2 days ago",
    category: "Weather",
    likes: 67,
    replies: 28,
    tags: ["monsoon", "preparation", "drainage"],
    hasImages: false,
    language: "en"
  }
];

const mockEvents = [
  {
    id: 1,
    title: "Smart Farming Workshop - AI in Agriculture",
    description: "Learn how to integrate AI tools for crop monitoring and disease detection",
    date: "2024-02-15",
    time: "10:00 AM", 
    location: "Online Webinar",
    organizer: "AgriTech Foundation",
    attendees: 234,
    type: "workshop",
    isRegistered: false,
    image: "https://images.unsplash.com/photo-1500651230702-0e2d8a49d4ad?w=600&h=300&fit=crop&crop=center"
  },
  {
    id: 2,
    title: "Organic Farming Certification Program",
    description: "3-day certification program for organic farming practices and certification process",
    date: "2024-02-20",
    time: "9:00 AM",
    location: "Bangalore Agricultural Center", 
    organizer: "Organic India",
    attendees: 67,
    type: "certification",
    isRegistered: true,
    image: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600&h=300&fit=crop&crop=center"
  },
  {
    id: 3,
    title: "Regional Farmers Meet - Sustainable Practices",
    description: "Exchange ideas on sustainable farming with local farmers and experts",
    date: "2024-02-25",
    time: "2:00 PM",
    location: "Community Center, Pune",
    organizer: "Farmer's Alliance",
    attendees: 156,
    type: "meetup",
    isRegistered: false,
    image: "https://images.unsplash.com/photo-1500651230702-0e2d8a49d4ad?w=600&h=300&fit=crop&crop=center"
  },
  {
    id: 4,
    title: "Agricultural Innovation Fair 2024",
    description: "Discover latest farming technologies and innovative solutions for modern agriculture",
    date: "2024-03-05",
    time: "10:00 AM",
    location: "Delhi Exhibition Center",
    organizer: "AgriInnovate India",
    attendees: 892,
    type: "exhibition",
    isRegistered: false,
    image: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=600&h=300&fit=crop&crop=center"
  },
  {
    id: 5,
    title: "Q&A Session with Agricultural Experts",
    description: "Interactive session to get your farming questions answered by industry experts",
    date: "2024-02-28",
    time: "4:00 PM",
    location: "Online Interactive Session",
    organizer: "FarmWise Community",
    attendees: 345,
    type: "interactive",
    isRegistered: true,
    image: "https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=600&h=300&fit=crop&crop=center"
  }
];

const topContributors = [
  {
    name: "Dr. Priya Sharma",
    location: "Maharashtra",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
    badge: "Agri Expert",
    reputation: 1250,
    posts: 89,
    solutions: 67
  },
  {
    name: "Krishnan Nair", 
    location: "Kerala",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
    badge: "Innovation Leader",
    reputation: 578,
    posts: 45,
    solutions: 34
  },
  {
    name: "Rajesh Kumar",
    location: "Punjab", 
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
    badge: "Experienced Farmer",
    reputation: 234,
    posts: 23,
    solutions: 18
  },
  {
    name: "Dr. Amit Singh",
    location: "Uttar Pradesh",
    avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&h=100&fit=crop&crop=face",
    badge: "Research Expert",
    reputation: 892,
    posts: 67,
    solutions: 45
  },
  {
    name: "Ramesh Patel",
    location: "Gujarat",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face",
    badge: "Weather Expert", 
    reputation: 445,
    posts: 34,
    solutions: 28
  }
];

const marketplaceCategories = [
  {
    category: "Seeds & Seedlings",
    description: "High-quality seeds for various crops",
    items: 125,
    icon: "🌱",
    image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=300&fit=crop&crop=center"
  },
  {
    category: "Fertilizers",
    description: "Organic and chemical fertilizers", 
    items: 89,
    icon: "🌿",
    image: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&h=300&fit=crop&crop=center"
  },
  {
    category: "Equipment & Tools",
    description: "Farming tools and machinery",
    items: 234,
    icon: "🚜",
    image: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400&h=300&fit=crop&crop=center"
  },
  {
    category: "Fresh Harvest",
    description: "Farm-fresh produce for sale",
    items: 456,
    icon: "🥕",
    image: "https://images.unsplash.com/photo-1500651230702-0e2d8a49d4ad?w=400&h=300&fit=crop&crop=center"
  }
];

const collaborationOpportunities = [
  {
    id: 1,
    type: "farming-group",
    title: "Organic Vegetable Co-op",
    description: "Join our collaborative farming group growing organic vegetables. We share equipment, knowledge, and market our produce together.",
    location: "Maharashtra",
    members: 15,
    leader: "Priya Sharma",
    crops: ["Tomatoes", "Spinach", "Carrots"],
    image: "https://images.unsplash.com/photo-1500651230702-0e2d8a49d4ad?w=400&h=300&fit=crop&crop=center",
    status: "open"
  },
  {
    id: 2,
    type: "equipment-rental",
    title: "Tractor Rental Service",
    description: "Mahindra tractor available for rent. Perfect for plowing and transportation. ₹500/day with operator.",
    location: "Punjab",
    owner: "Rajesh Kumar",
    equipment: "Mahindra 275 DI",
    rate: "₹500/day",
    availability: "Available",
    image: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400&h=300&fit=crop&crop=center"
  },
  {
    id: 3,
    type: "seed-donation",
    title: "Hybrid Tomato Seeds Available",
    description: "Donating 50kg of high-quality hybrid tomato seeds. First come, first served for small farmers.",
    location: "Karnataka",
    donor: "Krishnan Nair",
    quantity: "50kg",
    image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=300&fit=crop&crop=center"
  },
  {
    id: 4,
    type: "farming-group",
    title: "Rice Cultivation Collective",
    description: "Group of 20 farmers working together on rice cultivation. We share irrigation costs and labor during harvest season.",
    location: "West Bengal",
    members: 20,
    leader: "Amit Singh",
    crops: ["Rice", "Wheat"],
    image: "https://images.unsplash.com/photo-1500651230702-0e2d8a49d4ad?w=400&h=300&fit=crop&crop=center",
    status: "full"
  },
  {
    id: 5,
    type: "equipment-rental",
    title: "Sprinkler Irrigation System",
    description: "Modern sprinkler system for rent. Covers 2 acres. Save 40% water compared to traditional methods.",
    location: "Rajasthan",
    owner: "Sunita Devi",
    equipment: "Sprinkler System",
    rate: "₹200/day",
    availability: "Booked until Dec 15",
    image: "https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=400&h=300&fit=crop&crop=center"
  },
  {
    id: 6,
    type: "plant-donation",
    title: "Fruit Tree Saplings",
    description: "Donating mango and guava saplings to fellow farmers. Help establish orchards in your community.",
    location: "Tamil Nadu",
    donor: "Murugan",
    quantity: "100 saplings",
    image: "https://images.unsplash.com/photo-1500651230702-0e2d8a49d4ad?w=400&h=300&fit=crop&crop=center"
  }
];

export default function Community() {
  const { t, language } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState("discussions");
  const [newPostContent, setNewPostContent] = useState("");
  const [newPostTitle, setNewPostTitle] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  
  // Update search query when URL params change
  useEffect(() => {
    const search = searchParams.get("search");
    if (search) {
      setSearchQuery(search);
    }
  }, [searchParams]);

  // Filter posts based on search query
  const filteredPosts = mockPosts.filter(post => {
    if (!searchQuery.trim()) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      post.title.toLowerCase().includes(query) ||
      post.content.toLowerCase().includes(query) ||
      post.author.name.toLowerCase().includes(query) ||
      post.category.toLowerCase().includes(query) ||
      post.tags.some(tag => tag.toLowerCase().includes(query))
    );
  });

  const categories = [
    { id: "all", name: language === 'ta' ? "அனைத்தும்" : "All", count: 156 },
    { id: "disease-diagnosis", name: language === 'ta' ? "நோய் கண்டறிதல்" : "Disease Diagnosis", count: 45 },
    { id: "pest-control", name: language === 'ta' ? "பூச்சி கட்டுப்பாடு" : "Pest Control", count: 32 },
    { id: "irrigation", name: language === 'ta' ? "நீர்ப்பாசனம்" : "Irrigation", count: 28 },
    { id: "fertilizers", name: language === 'ta' ? "உரங்கள்" : "Fertilizers", count: 23 },
    { id: "market-prices", name: language === 'ta' ? "சந்தை விலைகள்" : "Market Prices", count: 19 },
    { id: "success-stories", name: language === 'ta' ? "வெற்றிக் கதைகள்" : "Success Stories", count: 15 }
  ];

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-8">
      {/* Hero Section */}
      <div className="relative bg-card border-b border-border p-6 md:p-8 mb-8">
        <div
          className="absolute inset-0 opacity-10 bg-cover bg-center"
          style={{ backgroundImage: `url(https://images.unsplash.com/photo-1500651230702-0e2d8a49d4ad?w=1200&h=400&fit=crop&crop=center)` }}
        />
        <div className="relative max-w-6xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold mb-2 text-foreground">
            {language === 'ta' ? 'விவசாயிகள் சமூகம்' : 'Farmers Community'}
          </h1>
          <p className="text-muted-foreground text-lg mb-4">
            {language === 'ta' 
              ? 'அறிவைப் பகிர்ந்துகொள்ளுங்கள், கற்றுக்கொள்ளுங்கள் மற்றும் ஒன்றாக வளருங்கள்' 
              : 'Share knowledge, learn together, and grow as one farming community'}
          </p>
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>12,500+ {language === 'ta' ? 'உறுப்பினர்கள்' : 'Members'}</span>
            </div>
            <div className="flex items-center gap-1">
              <MessageCircle className="h-4 w-4" />
              <span>2,340 {language === 'ta' ? 'விவாதங்கள்' : 'Discussions'}</span>
            </div>
            <div className="flex items-center gap-1">
              <Award className="h-4 w-4" />
              <span>890 {language === 'ta' ? 'நிபுணர்கள்' : 'Experts'}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4 md:p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
            <TabsTrigger value="discussions" className="text-xs md:text-sm">
              <MessageCircle className="h-4 w-4 mr-1 md:mr-2" />
              <span className="hidden sm:inline">{language === 'ta' ? 'விவாதங்கள்' : 'Discussions'}</span>
              <span className="sm:hidden">Talk</span>
            </TabsTrigger>
            <TabsTrigger value="knowledge" className="text-xs md:text-sm">
              <BookOpen className="h-4 w-4 mr-1 md:mr-2" />
              <span className="hidden sm:inline">{language === 'ta' ? 'அறிவு பகிர்வு' : 'Knowledge'}</span>
              <span className="sm:hidden">Learn</span>
            </TabsTrigger>
            <TabsTrigger value="events" className="text-xs md:text-sm">
              <Calendar className="h-4 w-4 mr-1 md:mr-2" />
              <span className="hidden sm:inline">{language === 'ta' ? 'நிகழ்வுகள்' : 'Events'}</span>
              <span className="sm:hidden">Events</span>
            </TabsTrigger>
            <TabsTrigger value="collaboration" className="text-xs md:text-sm">
              <Users className="h-4 w-4 mr-1 md:mr-2" />
              <span className="hidden sm:inline">{language === 'ta' ? 'ஒத்துழைப்பு' : 'Collaboration'}</span>
              <span className="sm:hidden">Collab</span>
            </TabsTrigger>
          </TabsList>

          {/* Discussions Tab */}
          <TabsContent value="discussions" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Main Content */}
              <div className="lg:col-span-3 space-y-6">
                {/* Search and Filters */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder={language === 'ta' ? 'விவாதங்களைத் தேடுங்கள்...' : 'Search discussions...'}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Button variant="outline" size="sm" className="sm:size-default">
                    <Filter className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">{language === 'ta' ? 'வடிகட்டி' : 'Filter'}</span>
                  </Button>
                  <Button size="sm" className="sm:size-default">
                    <Plus className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">{language === 'ta' ? 'புதிய கேள்வி' : 'New Question'}</span>
                    <span className="sm:hidden">Post</span>
                  </Button>
                </div>

                {/* Posts Feed */}
                <div className="space-y-4 sm:space-y-6">
                  {searchQuery && (
                    <div className="text-sm text-muted-foreground">
                      Found {filteredPosts.length} result{filteredPosts.length !== 1 ? 's' : ''} for "{searchQuery}"
                    </div>
                  )}
                  {filteredPosts.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">
                        {searchQuery ? "No posts found matching your search." : "No posts available."}
                      </p>
                    </div>
                  ) : (
                    filteredPosts.map((post) => (
                      <Card key={post.id} className="shadow-sm hover:shadow-md transition-shadow">
                        <CardContent className="p-4 sm:p-6">
                          <div className="flex items-start gap-3 sm:gap-4">
                            <Avatar className="w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0">
                              <AvatarImage src={post.author.avatar} />
                              <AvatarFallback>{post.author.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                            </Avatar>
                            
                            <div className="flex-1 space-y-3 min-w-0">
                              {/* Author Info */}
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2 min-w-0">
                                  <h4 className="font-medium text-sm sm:text-base truncate">{post.author.name}</h4>
                                  <Badge variant="secondary" className="text-xs flex-shrink-0">
                                    {post.author.badge}
                                  </Badge>
                                </div>
                                <Badge variant="outline" className="text-xs flex-shrink-0">{post.category}</Badge>
                              </div>
                              
                              {/* Location and timestamp - mobile responsive */}
                              <div className="text-xs sm:text-sm text-muted-foreground">
                                {post.author.location} • {post.timestamp}
                              </div>

                              {/* Post Content */}
                              <div>
                                <h3 className="text-base sm:text-lg font-semibold mb-2 leading-tight">{post.title}</h3>
                                <p className="text-muted-foreground mb-3 text-sm sm:text-base leading-relaxed">{post.content}</p>
                                
                                {/* Post Image - Mobile Optimized */}
                                {post.postImage && (
                                  <div className="mb-3 rounded-lg overflow-hidden max-w-full">
                                    <img 
                                      src={post.postImage} 
                                      alt={post.title}
                                      className="w-full h-32 sm:h-40 md:h-48 object-cover hover:scale-105 transition-transform duration-200"
                                      loading="lazy"
                                    />
                                  </div>
                                )}
                                
                                {/* Tags */}
                                <div className="flex flex-wrap gap-1 mb-3">
                                  {post.tags.map((tag) => (
                                    <Badge key={tag} variant="outline" className="text-xs">
                                      #{tag}
                                    </Badge>
                                  ))}
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-2 sm:gap-4 pt-2 border-t">
                                  <Button variant="ghost" size="sm" className="text-muted-foreground text-xs sm:text-sm">
                                    <ThumbsUp className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                                    {post.likes}
                                  </Button>
                                  <Button variant="ghost" size="sm" className="text-muted-foreground text-xs sm:text-sm">
                                    <MessageCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                                    {post.replies} <span className="hidden sm:inline">{language === 'ta' ? 'பதில்கள்' : 'Replies'}</span>
                                  </Button>
                                  <Button variant="ghost" size="sm" className="text-muted-foreground text-xs sm:text-sm">
                                    <Share2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                                    <span className="hidden sm:inline">{language === 'ta' ? 'பகிர்' : 'Share'}</span>
                                  </Button>
                                  {post.hasImages && (
                                    <Badge variant="outline" className="text-xs ml-auto">
                                      <Camera className="h-3 w-3 mr-1" />
                                      <span className="hidden sm:inline">{language === 'ta' ? 'படங்கள்' : 'Images'}</span>
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-1 space-y-6">
                {/* Categories - Mobile Horizontal Scroll */}
                <Card className="shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Filter className="h-5 w-5" />
                      {language === 'ta' ? 'வகைகள்' : 'Categories'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {/* Mobile: Horizontal scroll, Desktop: Vertical list */}
                    <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0">
                      {categories.map((category) => (
                        <Button
                          key={category.id}
                          variant={selectedCategory === category.id ? "default" : "ghost"}
                          size="sm"
                          onClick={() => setSelectedCategory(category.id)}
                          className="flex-shrink-0 lg:w-full lg:justify-start whitespace-nowrap"
                        >
                          {category.name}
                          <Badge variant="outline" className="ml-2 text-xs">
                            {category.count}
                          </Badge>
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card className="shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Plus className="h-5 w-5 text-primary" />
                      Quick Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-2">
                    <Button size="sm" variant="outline" className="w-full justify-start">
                      <Plus className="h-4 w-4 mr-2" />
                      Ask Question
                    </Button>
                    <Button size="sm" variant="outline" className="w-full justify-start">
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Answer Question
                    </Button>
                    <Button size="sm" variant="outline" className="w-full justify-start">
                      <Share2 className="h-4 w-4 mr-2" />
                      Share Success Story (+50 XP)
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Knowledge Tab */}
          <TabsContent value="knowledge" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="shadow-sm hover:shadow-md transition-shadow">
                <div className="aspect-video relative overflow-hidden rounded-t-lg">
                  <img 
                    src={knowledgeSharing} 
                    alt="Knowledge Sharing"
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-2">Crop Disease Prevention Guide</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Comprehensive guide on preventing common crop diseases using organic and chemical methods.
                  </p>
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary">Disease Prevention</Badge>
                    <Button variant="outline" size="sm">Read More</Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-sm hover:shadow-md transition-shadow">
                <div className="aspect-video relative overflow-hidden rounded-t-lg">
                  <img 
                    src={agricultureWorkshop} 
                    alt="Agriculture Workshop"
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-2">Smart Irrigation Techniques</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Learn about water-efficient irrigation methods that can increase your crop yield.
                  </p>
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary">Water Management</Badge>
                    <Button variant="outline" size="sm">Read More</Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-sm hover:shadow-md transition-shadow">
                <div className="aspect-video relative overflow-hidden rounded-t-lg">
                  <img 
                    src={yieldSuccess} 
                    alt="Yield Success"
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-2">Organic Fertilizer Guide</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Complete guide to organic fertilizers and their application for different crops.
                  </p>
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary">Organic Farming</Badge>
                    <Button variant="outline" size="sm">Read More</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Events Tab */}
          <TabsContent value="events" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {mockEvents.map((event) => (
                <Card key={event.id} className="shadow-sm hover:shadow-md transition-shadow">
                  <div className="aspect-video relative overflow-hidden rounded-t-lg">
                    <img 
                      src={event.image} 
                      alt={event.title}
                      className="w-full h-full object-cover"
                    />
                    {event.isRegistered && (
                      <Badge className="absolute top-3 right-3 bg-success text-success-foreground">
                        Registered
                      </Badge>
                    )}
                  </div>
                  
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <Badge variant="outline">{event.type}</Badge>
                      <div className="text-right text-sm text-muted-foreground">
                        <div>{event.date}</div>
                        <div>{event.time}</div>
                      </div>
                    </div>
                    
                    <h3 className="font-semibold mb-2">{event.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{event.description}</p>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        {event.location}
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        {event.attendees} attendees
                      </div>
                    </div>
                    
                    <Button 
                      className="w-full" 
                      variant={event.isRegistered ? "outline" : "default"}
                    >
                      {event.isRegistered ? "View Details" : "Register Now"}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Collaboration Tab */}
          <TabsContent value="collaboration" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {collaborationOpportunities.map((opportunity) => (
                <Card key={opportunity.id} className="shadow-sm hover:shadow-md transition-shadow">
                  <div className="aspect-video relative overflow-hidden rounded-t-lg">
                    <img
                      src={opportunity.image}
                      alt={opportunity.title}
                      className="w-full h-full object-cover"
                    />
                    <Badge className={`absolute top-3 right-3 ${
                      opportunity.type === 'farming-group' ? 'bg-blue-500' :
                      opportunity.type === 'equipment-rental' ? 'bg-green-500' :
                      'bg-purple-500'
                    } text-white`}>
                      {opportunity.type === 'farming-group' ? 'Group' :
                       opportunity.type === 'equipment-rental' ? 'Rental' :
                       'Donation'}
                    </Badge>
                  </div>

                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <Badge variant="outline" className="capitalize">
                        {opportunity.type.replace('-', ' ')}
                      </Badge>
                      <div className="text-right text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4 inline mr-1" />
                        {opportunity.location}
                      </div>
                    </div>

                    <h3 className="font-semibold mb-2">{opportunity.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{opportunity.description}</p>

                    <div className="space-y-2 mb-4">
                      {opportunity.type === 'farming-group' && (
                        <>
                          <div className="flex items-center gap-2 text-sm">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            {opportunity.members} members • Leader: {opportunity.leader}
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {opportunity.crops.map((crop) => (
                              <Badge key={crop} variant="outline" className="text-xs">
                                {crop}
                              </Badge>
                            ))}
                          </div>
                        </>
                      )}

                      {opportunity.type === 'equipment-rental' && (
                        <>
                          <div className="flex items-center gap-2 text-sm">
                            <span className="font-medium">Owner:</span> {opportunity.owner}
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <span className="font-medium">Equipment:</span> {opportunity.equipment}
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <span className="font-medium text-green-600">{opportunity.rate}</span>
                            <Badge variant={opportunity.availability === 'Available' ? 'default' : 'secondary'} className="text-xs">
                              {opportunity.availability}
                            </Badge>
                          </div>
                        </>
                      )}

                      {(opportunity.type === 'seed-donation' || opportunity.type === 'plant-donation') && (
                        <>
                          <div className="flex items-center gap-2 text-sm">
                            <Heart className="h-4 w-4 text-red-500" />
                            <span className="font-medium">Donor:</span> {opportunity.donor}
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <span className="font-medium">Quantity:</span> {opportunity.quantity}
                          </div>
                          <Badge variant="outline" className="text-xs bg-red-50 text-red-700 border-red-200">
                            {opportunity.type}
                          </Badge>
                        </>
                      )}
                    </div>

                    <Button
                      className="w-full"
                      variant={opportunity.status === 'full' || opportunity.availability?.includes('Booked') ? "outline" : "default"}
                      disabled={opportunity.status === 'full'}
                    >
                      {opportunity.type === 'farming-group'
                        ? (opportunity.status === 'open' ? 'Join Group' : 'Group Full')
                        : opportunity.type === 'equipment-rental'
                        ? (opportunity.availability === 'Available' ? 'Book Now' : 'Check Availability')
                        : 'Request Donation'
                      }
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}