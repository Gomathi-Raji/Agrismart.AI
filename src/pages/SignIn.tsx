import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Eye, EyeOff, Mail, Lock, User, Sparkles, ArrowLeft } from "lucide-react";
import heroImage from '@/assets/hero-agriculture.jpg';

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login, loginWithGoogle } = useAuth();

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const success = await login(email, password);
      if (success) {
        navigate("/");
      } else {
        setError("Invalid email or password. Try demo accounts below.");
      }
    } catch (error: unknown) {
      console.error("Sign in error:", error);
      setError("An error occurred during sign in. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError("");

    try {
      const success = await loginWithGoogle();
      if (success) {
        navigate("/");
      } else {
        setError("Google sign in failed. Please try again.");
      }
    } catch (error: unknown) {
      console.error("Google sign in error:", error);
      setError("Google sign in failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemoCredentials = (email: string, password: string) => {
    setEmail(email);
    setPassword(password);
    setError("");
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${heroImage})`,
        }}
      />
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />

      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-8">
          {/* Logo and Header */}
          <div className="text-center">
            <Link to="/" className="flex items-center justify-center space-x-2 mb-6 group">
              <div className="relative">
                <img
                  src="/lovable-uploads/logo.png"
                  alt="AgriSmart Logo"
                  className="w-14 h-14 object-contain drop-shadow-lg group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full animate-pulse" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-3xl text-white drop-shadow-lg">AgriSmart</span>
                <div className="flex items-center justify-center space-x-1">
                  <Sparkles className="h-4 w-4 text-yellow-400" />
                  <span className="text-sm text-white/90 font-medium">Smart Farming Solutions</span>
                </div>
              </div>
            </Link>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 max-w-sm mx-auto">
              <h1 className="text-2xl font-bold text-white mb-2">Welcome Back</h1>
              <p className="text-white/90 text-sm">Sign in to continue your farming journey</p>
            </div>
          </div>

          {/* Main Form Card */}
          <Card className="bg-card backdrop-blur-xl border shadow-elegant">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-xl font-bold text-card-foreground flex items-center justify-center gap-2">
                <Lock className="h-5 w-5 text-primary" />
                Secure Sign In
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Access your AgriSmart account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {error && (
                <Alert variant="destructive" className="border-red-200 bg-red-50">
                  <AlertDescription className="text-red-800">{error}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleEmailSignIn} className="space-y-5">
                {/* Email Field */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-semibold text-card-foreground">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-12 pl-12 bg-muted border-border focus:border-primary focus:ring-primary/20 placeholder:text-muted-foreground"
                      required
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-semibold text-card-foreground">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-12 pl-12 pr-12 bg-muted border-border focus:border-primary focus:ring-primary/20 placeholder:text-muted-foreground"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-muted"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Sign In Button */}
                <Button
                  type="submit"
                  className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Signing in...
                    </div>
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </form>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full bg-gray-200" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full text-gray-600 font-medium border border-gray-200">
                    Or continue with
                  </span>
                </div>
              </div>

              {/* Google Sign In */}
              <Button
                type="button"
                variant="outline"
                className="w-full h-12 bg-card hover:bg-muted border-border hover:border-primary/50 shadow-sm"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
              >
                <svg className="mr-3 h-5 w-5" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                <span className="font-medium">Sign in with Google</span>
                <Badge variant="secondary" className="ml-2 text-xs">Demo</Badge>
              </Button>

              {/* Demo Accounts Section */}
              <div className="space-y-4 pt-4 border-t border-border">
                <div className="flex items-center gap-2 justify-center">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span className="font-semibold text-card-foreground text-sm">Demo Accounts</span>
                </div>
                <div className="grid gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fillDemoCredentials('farmer@demo.com', 'farmer123')}
                    className="h-10 bg-gradient-to-r from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 border-green-200 hover:border-green-300 justify-start"
                  >
                    <div className="flex items-center gap-3 w-full">
                      <div className="p-1 bg-green-100 rounded-lg">
                        <User className="h-3 w-3 text-green-600" />
                      </div>
                      <div className="text-left">
                        <div className="font-medium text-green-800 text-xs">Farmer Account</div>
                        <div className="text-green-600 text-xs">farmer@demo.com</div>
                      </div>
                    </div>
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fillDemoCredentials('buyer@demo.com', 'buyer123')}
                    className="h-10 bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 border-blue-200 hover:border-blue-300 justify-start"
                  >
                    <div className="flex items-center gap-3 w-full">
                      <div className="p-1 bg-blue-100 rounded-lg">
                        <User className="h-3 w-3 text-blue-600" />
                      </div>
                      <div className="text-left">
                        <div className="font-medium text-blue-800 text-xs">Buyer Account</div>
                        <div className="text-blue-600 text-xs">buyer@demo.com</div>
                      </div>
                    </div>
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fillDemoCredentials('admin@demo.com', 'admin123')}
                    className="h-10 bg-gradient-to-r from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 border-purple-200 hover:border-purple-300 justify-start"
                  >
                    <div className="flex items-center gap-3 w-full">
                      <div className="p-1 bg-purple-100 rounded-lg">
                        <User className="h-3 w-3 text-purple-600" />
                      </div>
                      <div className="text-left">
                        <div className="font-medium text-purple-800 text-xs">Admin Account</div>
                        <div className="text-purple-600 text-xs">admin@demo.com</div>
                      </div>
                    </div>
                  </Button>
                </div>
              </div>

              {/* Sign Up Link */}
              <div className="text-center pt-2">
                <span className="text-muted-foreground text-sm">Don't have an account? </span>
                <Link
                  to="/sign-up"
                  className="text-primary hover:text-primary/80 font-semibold hover:underline transition-colors"
                >
                  Sign up here
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Back to Home */}
          <div className="text-center">
            <Link
              to="/"
              className="text-white/90 hover:text-white font-medium inline-flex items-center gap-2 hover:underline transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}