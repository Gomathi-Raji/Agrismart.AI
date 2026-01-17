import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Suspense, lazy } from "react";
import { Layout } from "@/components/layout/Layout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { FloatingChatbot } from "@/components/FloatingChatbot";
import { Card, CardContent } from "@/components/ui/card";

// Lazy load pages for better performance and error isolation
const Index = lazy(() => import("@/pages/Index"));
const Diagnose = lazy(() => import("@/pages/Diagnose"));
const Buy = lazy(() => import("@/pages/Buy"));
const Sell = lazy(() => import("@/pages/Sell"));
const MarketAnalysis = lazy(() => import("@/pages/MarketAnalysis"));
const UserProfile = lazy(() => import("@/pages/UserProfile"));
const BuyerPanel = lazy(() => import("@/pages/BuyerPanel"));
const GovernmentSchemes = lazy(() => import("@/pages/GovernmentSchemes"));
const Weather = lazy(() => import("@/pages/Weather"));
const Blog = lazy(() => import("@/pages/Blog"));
const Auth = lazy(() => import("@/pages/Auth"));
const RoleLogin = lazy(() => import("@/pages/RoleLogin"));
const SignIn = lazy(() => import("@/pages/SignIn"));
const SignUp = lazy(() => import("@/pages/SignUp"));
const NotFound = lazy(() => import("@/pages/NotFound"));
const Chatbot = lazy(() => import("@/pages/Chatbot"));
const Admin = lazy(() => import("@/pages/Admin"));
const Recommendations = lazy(() => import("@/pages/Recommendations"));
const Hybrid = lazy(() => import("@/pages/Hybrid"));
const Community = lazy(() => import("@/pages/Community"));
const Farms = lazy(() => import("@/pages/Farms"));
const Marketplace = lazy(() => import("@/pages/Marketplace"));
const Offices = lazy(() => import("@/pages/Offices"));
const Support = lazy(() => import("@/pages/Support"));

// Loading component
const PageLoading = () => (
  <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 flex items-center justify-center p-4">
    <Card className="w-full max-w-md">
      <CardContent className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading page...</p>
      </CardContent>
    </Card>
  </div>
);

// Error fallback for lazy loading
const PageError = () => (
  <Layout>
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="text-center py-8">
          <p className="text-destructive mb-4">Failed to load page</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Reload Page
          </button>
        </CardContent>
      </Card>
    </div>
  </Layout>
);

// Wrapper for lazy components with error boundary
const LazyWrapper = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<PageLoading />}>
    {children}
  </Suspense>
);

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Home page */}
        <Route 
          path="/" 
          element={
            <LazyWrapper>
              <Layout><Index /></Layout>
            </LazyWrapper>
          } 
        />
        
        {/* Public pages */}
        <Route 
          path="/diagnose" 
          element={
            <LazyWrapper>
              <Layout><Diagnose /></Layout>
            </LazyWrapper>
          } 
        />
        <Route 
          path="/buy" 
          element={
            <LazyWrapper>
              <Layout><Buy /></Layout>
            </LazyWrapper>
          } 
        />
        <Route 
          path="/sell" 
          element={
            <LazyWrapper>
              <Layout><Sell /></Layout>
            </LazyWrapper>
          } 
        />
        <Route 
          path="/market-analysis" 
          element={
            <LazyWrapper>
              <Layout><MarketAnalysis /></Layout>
            </LazyWrapper>
          } 
        />
        <Route 
          path="/government-schemes" 
          element={
            <LazyWrapper>
              <Layout><GovernmentSchemes /></Layout>
            </LazyWrapper>
          } 
        />
        <Route 
          path="/weather" 
          element={
            <LazyWrapper>
              <Layout><Weather /></Layout>
            </LazyWrapper>
          } 
        />
        <Route 
          path="/recommendations" 
          element={
            <LazyWrapper>
              <Layout><Recommendations /></Layout>
            </LazyWrapper>
          } 
        />
        <Route 
          path="/blogs" 
          element={
            <LazyWrapper>
              <Layout><Blog /></Layout>
            </LazyWrapper>
          } 
        />
        <Route 
          path="/hybrid" 
          element={
            <LazyWrapper>
              <Layout><Hybrid /></Layout>
            </LazyWrapper>
          } 
        />
        <Route 
          path="/community" 
          element={
            <LazyWrapper>
              <Layout><Community /></Layout>
            </LazyWrapper>
          } 
        />
        <Route 
          path="/farms" 
          element={
            <LazyWrapper>
              <Layout><Farms /></Layout>
            </LazyWrapper>
          } 
        />
        <Route 
          path="/marketplace" 
          element={
            <LazyWrapper>
              <Layout><Marketplace /></Layout>
            </LazyWrapper>
          } 
        />
        <Route 
          path="/offices" 
          element={
            <LazyWrapper>
              <Layout><Offices /></Layout>
            </LazyWrapper>
          } 
        />
        <Route 
          path="/support" 
          element={
            <LazyWrapper>
              <Layout><Support /></Layout>
            </LazyWrapper>
          } 
        />

        {/* Authentication pages */}
        <Route 
          path="/auth" 
          element={
            <LazyWrapper>
              <Auth />
            </LazyWrapper>
          } 
        />
        <Route 
          path="/role-login" 
          element={
            <LazyWrapper>
              <RoleLogin />
            </LazyWrapper>
          } 
        />
        <Route 
          path="/sign-in" 
          element={
            <LazyWrapper>
              <SignIn />
            </LazyWrapper>
          } 
        />
        <Route 
          path="/sign-up" 
          element={
            <LazyWrapper>
              <SignUp />
            </LazyWrapper>
          } 
        />
        <Route 
          path="/chatbot" 
          element={
            <LazyWrapper>
              <Chatbot />
            </LazyWrapper>
          } 
        />

        {/* Protected routes */}
        <Route 
          path="/user-profile" 
          element={
            <LazyWrapper>
              <ProtectedRoute requiredRole="farmer">
                <Layout><UserProfile /></Layout>
              </ProtectedRoute>
            </LazyWrapper>
          } 
        />
        <Route 
          path="/buyer-panel" 
          element={
            <LazyWrapper>
              <ProtectedRoute requiredRole="buyer">
                <Layout><BuyerPanel /></Layout>
              </ProtectedRoute>
            </LazyWrapper>
          } 
        />
        <Route 
          path="/admin" 
          element={
            <LazyWrapper>
              <ProtectedRoute requiredRole="admin">
                <Admin />
              </ProtectedRoute>
            </LazyWrapper>
          } 
        />

        {/* Alias routes for consistency */}
        <Route 
          path="/crops-hybrid" 
          element={
            <LazyWrapper>
              <Layout><Hybrid /></Layout>
            </LazyWrapper>
          } 
        />

        {/* Legal pages */}
        <Route 
          path="/privacy" 
          element={
            <LazyWrapper>
              <Layout>
                <div className="p-8 text-center">
                  <h1 className="text-2xl">Privacy Policy - Coming Soon</h1>
                </div>
              </Layout>
            </LazyWrapper>
          } 
        />
        <Route 
          path="/terms" 
          element={
            <LazyWrapper>
              <Layout>
                <div className="p-8 text-center">
                  <h1 className="text-2xl">Terms of Service - Coming Soon</h1>
                </div>
              </Layout>
            </LazyWrapper>
          } 
        />
        <Route 
          path="/cookies" 
          element={
            <LazyWrapper>
              <Layout>
                <div className="p-8 text-center">
                  <h1 className="text-2xl">Cookie Policy - Coming Soon</h1>
                </div>
              </Layout>
            </LazyWrapper>
          } 
        />

        {/* Catch-all route - MUST be last */}
        <Route 
          path="*" 
          element={
            <LazyWrapper>
              <Layout><NotFound /></Layout>
            </LazyWrapper>
          } 
        />
      </Routes>
      <FloatingChatbot />
    </BrowserRouter>
  );
}