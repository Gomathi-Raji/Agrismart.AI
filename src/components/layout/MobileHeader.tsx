import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { useNotifications } from "@/contexts/NotificationContext";
import { toast } from "sonner";
import { VoiceSearchCommand } from "@/components/navigation/VoiceSearchCommand";

import { 
  Menu, 
  Search, 
  Bell,
  Cloud,
  Home, 
  Shield,
  Camera, 
  ShoppingCart,
  Languages, 
  Users,
  User,
  TrendingUp,
  Sparkles,
  Leaf,
  MessageCircle,
  Settings,
  LogOut,
  Zap
} from "lucide-react";
import { WeatherWidget } from "./WeatherWidget";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { NotificationTestModal } from "@/components/notifications/NotificationTest";

export function MobileHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { logout, isAuthenticated, userRole } = useAuth();
  const { addNotification } = useNotifications();
  const navigate = useNavigate();
  const location = useLocation();

  // Close menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  // Enhanced navigation handler that immediately closes menu
  const handleNavigation = (path: string) => {
    setIsMenuOpen(false); // Close menu immediately
    navigate(path); // Navigate to the path
  };

  const handleLogout = async () => {
    if (isLoggingOut) return; // Prevent multiple clicks
    
    try {
      setIsLoggingOut(true);
      console.log('Logout initiated...', { isAuthenticated });
      
      // Show loading state
      toast.loading("Signing out...");
      
      // Call our logout function for role-based auth
      console.log('Calling logout function...');
      logout();
      console.log('Logout function completed');
      
      // Close menu and navigate
      setIsMenuOpen(false);
      
      // Show success message
      toast.dismiss();
      toast.success("Signed out successfully");
      
      // Navigate to home
      navigate('/');
      console.log('Navigation to home completed');
    } catch (error) {
      console.error('Logout error:', error);
      toast.dismiss();
      toast.error("Error signing out. Redirecting to home...");
      
      // Fallback: just call our logout function
      logout();
      setIsMenuOpen(false);
      navigate('/');
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleTestPushNotifications = async () => {
    // Show immediate feedback
    toast.loading('Sending test notifications...', { id: 'test-notifications' });
    
    // Check if notifications are supported
    if (!('Notification' in window)) {
      toast.error('Your browser does not support push notifications.', {
        id: 'test-notifications',
      });
      
      addNotification({
        type: 'info',
        priority: 'low',
        title: 'Push Notifications Not Supported',
        message: 'Your browser does not support push notifications. In-app notifications will still work.',
        autoHide: true,
        hideAfter: 5000,
      });
      return;
    }

    // Check if service worker is available
    if (!('serviceWorker' in navigator)) {
      console.warn('Service Worker not supported, falling back to basic notifications');
    }

    // Request notification permission if not granted
    let permission = Notification.permission;
    
    if (permission === 'default') {
      permission = await Notification.requestPermission();
    }
    
    if (permission === 'granted') {
      // Send multiple test notifications with delays
      const notifications = [
        {
          title: '🌡️ High Temperature Alert',
          body: 'Temperature has reached 38°C in your area. Stay hydrated and avoid outdoor work.',
          icon: '/favicon.ico',
          tag: 'weather-temp',
          inApp: {
            type: 'weather' as const,
            priority: 'high' as const,
            title: 'High Temperature Alert',
            message: 'Temperature has reached 38°C in your area. Stay hydrated and avoid outdoor work.',
          }
        },
        {
          title: '💰 Price Alert: Wheat',
          body: 'Wheat prices increased by 12% to ₹2,450/quintal at Delhi Mandi.',
          icon: '/favicon.ico',
          tag: 'price-wheat',
          inApp: {
            type: 'price-alert' as const,
            priority: 'high' as const,
            title: 'Price Alert: Wheat',
            message: 'Wheat prices increased by 12% to ₹2,450/quintal at Delhi Mandi.',
            actionUrl: '/market-analysis',
            actionText: 'View Market',
          }
        },
        {
          title: '🌧️ Heavy Rain Warning',
          body: 'Heavy rainfall expected in next 2 hours. Secure outdoor equipment.',
          icon: '/favicon.ico',
          tag: 'weather-rain',
          inApp: {
            type: 'weather' as const,
            priority: 'medium' as const,
            title: 'Heavy Rain Warning',
            message: 'Heavy rainfall expected in next 2 hours. Secure outdoor equipment.',
            autoHide: true,
            hideAfter: 8000,
          }
        },
        {
          title: '📈 Market Opportunity',
          body: 'Tomato demand high in Mumbai market. Consider selling your stock.',
          icon: '/favicon.ico',
          tag: 'market-tomato',
          inApp: {
            type: 'market' as const,
            priority: 'medium' as const,
            title: 'Market Opportunity',
            message: 'Tomato demand high in Mumbai market. Consider selling your stock.',
            actionUrl: '/marketplace',
            actionText: 'View Marketplace',
            autoHide: true,
            hideAfter: 10000,
          }
        },
      ];

      // Send push notifications with delays
      notifications.forEach((notif, index) => {
        setTimeout(() => {
          // Send browser push notification
          new Notification(notif.title, {
            body: notif.body,
            icon: notif.icon,
            tag: notif.tag,
            badge: '/favicon.ico',
            requireInteraction: index < 2, // Keep high priority notifications visible
          });
          
          // Also add to in-app notifications
          addNotification(notif.inApp);
        }, index * 2000); // 2 second delays between notifications
      });

      // Update toast after all notifications are scheduled
      setTimeout(() => {
        toast.success('4 test notifications sent! Check your browser notifications.', { 
          id: 'test-notifications',
          duration: 5000,
        });
      }, 1000);

    } else {
      toast.error('Notification permission denied. Please enable notifications in browser settings.', {
        id: 'test-notifications',
      });
      
      // Fallback: just add in-app notifications
      addNotification({
        type: 'system',
        priority: 'medium',
        title: 'Push Notifications Disabled',
        message: 'Browser notifications are disabled. Please enable them in your browser settings to receive push notifications.',
        actionText: 'How to Enable',
      });
    }
  };

  const navItems = [
    { name: "Home", path: "/", icon: Home },
    { name: "Diagnose", path: "/diagnose", icon: Camera },
    { name: "Weather", path: "/weather", icon: Cloud },
    { name: "Market Analysis", path: "/market-analysis", icon: TrendingUp },
    { name: "Buy", path: "/buy", icon: ShoppingCart },
    { name: "Sell", path: "/sell", icon: TrendingUp },
    { name: "Community", path: "/community", icon: Users },
    { name: "News & Blogs", path: "/blogs", icon: MessageCircle },
    { name: "Recommendations", path: "/recommendations", icon: Sparkles },
    { name: "Government Schemes", path: "/government-schemes", icon: Users },
    { name: "Crops & Hybrids", path: "/hybrid", icon: Leaf },
    { name: "Support", path: "/support", icon: MessageCircle }
  ];

  return (
    <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-sm border-b border-border shadow-elegant">
      <div className="flex items-center justify-between h-14 px-4">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2 group">
          <img 
            src="/lovable-uploads/logo.png" 
            alt="AgriSmart Logo" 
            className="w-8 h-8 object-contain group-hover:scale-105 transition-transform"
          />
        </Link>

        {/* Right Actions */}
        <div className="flex items-center space-x-2">
          {/* Voice Search Button */}
          <VoiceSearchCommand 
            trigger={
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <Search className="h-4 w-4" />
              </Button>
            }
          />
          
          {/* Notifications */}
          <NotificationBell />
          
          {/* Test Push Notifications Button */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-9 w-9 text-amber-500 hover:text-amber-600 hover:bg-amber-50" 
            title="Test Push Notifications (Dev Tool)"
            onClick={handleTestPushNotifications}
          >
            <Zap className="h-4 w-4" />
          </Button>
          
          {/* Notification Test Modal (Development) */}
          <NotificationTestModal>
            <Button variant="ghost" size="icon" className="h-9 w-9" title="Test Notifications">
              <Settings className="h-4 w-4" />
            </Button>
          </NotificationTestModal>

          {/* Compact Weather Widget */}
          <WeatherWidget />
          
          {/* Hamburger Menu */}
          <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80 p-0">
              <div className="flex flex-col h-full">
                {/* Header */}
                <div className="p-6 border-b border-border">
                  <div className="flex items-center space-x-3">
                    <img 
                      src="/lovable-uploads/logo.png" 
                      alt="AgriSmart Logo" 
                      className="w-10 h-10 object-contain"
                    />
                    <div>
                      <h2 className="font-bold text-xl text-primary">AgriSmart</h2>
                      <p className="text-sm text-muted-foreground">Smart Farming Solutions</p>
                    </div>
                  </div>
                </div>

                {/* Navigation Items */}
                <div className="flex-1 overflow-y-auto py-6">
                  <nav className="px-6 space-y-2">
                    {/* Language Translator */}
                    <div className="px-3 py-2">
                      <div className="elfsight-app-ed03d8f1-e93e-47b7-8b7f-01c1baf28e5a" data-elfsight-app-lazy />
                    </div>

                    {navItems.map((item) => (
                      <button
                        key={item.path}
                        onClick={() => handleNavigation(item.path)}
                        className="flex items-center space-x-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground w-full text-left"
                      >
                        <item.icon className="h-5 w-5" />
                        <span>{item.name}</span>
                      </button>
                    ))}
                  </nav>
                </div>

                {/* User Section */}
                <div className="border-t border-border p-6">
                  {!isAuthenticated ? (
                    <Button 
                      className="w-full" 
                      variant="outline"
                      onClick={() => handleNavigation('/auth')}
                    >
                      <User className="h-4 w-4 mr-2" />
                      Sign In
                    </Button>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">Role Account</p>
                          <p className="text-xs text-muted-foreground">{userRole}</p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1"
                          onClick={() => handleNavigation('/user-profile')}
                        >
                          <Settings className="h-4 w-4 mr-2" />
                          Profile
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={handleLogout}
                          disabled={isLoggingOut}
                          className="flex-1"
                        >
                          <LogOut className="h-4 w-4 mr-2" />
                          {isLoggingOut ? "Signing out..." : "Logout"}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}