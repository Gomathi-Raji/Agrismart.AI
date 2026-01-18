import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth, UserRole } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Leaf, Shield, Store, User, ArrowLeft, Eye, EyeOff, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import heroImage from '@/assets/hero-agriculture.jpg';

export default function RoleLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>(null);
  const [error, setError] = useState('');
  const [showCredentials, setShowCredentials] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { demoLogin } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!role) {
      setError('Please select a role');
      return;
    }

    const success = await demoLogin(username, password, role);
    if (success) {
      toast({
        title: "Login Successful",
        description: `Welcome, ${role}!`,
      });

      // Navigate to appropriate panel
      switch (role) {
        case 'admin':
          navigate('/admin');
          break;
        case 'buyer':
          navigate('/buyer-panel');
          break;
        case 'farmer':
          navigate('/user-profile');
          break;
      }
    } else {
      setError('Invalid credentials for the selected role');
    }
  };

  const roleIcons = {
    admin: Shield,
    buyer: Store,
    farmer: User
  };

  const roleDescriptions = {
    admin: "Manage platform and users",
    buyer: "Purchase crops and supplies",
    farmer: "Manage farm and sell produce"
  };

  const credentials = {
    admin: { username: 'admin', password: 'admin123' },
    buyer: { username: 'buyer', password: 'buyer123' },
    farmer: { username: 'farmer', password: 'farmer123' }
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
          </div>

          {/* Main Form Card */}
          <Card className="bg-card backdrop-blur-xl border shadow-elegant">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-xl font-bold text-card-foreground flex items-center justify-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Secure Login
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Role Selection */}
                <div className="space-y-3">
                  <Label className="text-sm font-semibold text-card-foreground">Select Your Role</Label>
                  <Select value={role || ''} onValueChange={(value: UserRole) => setRole(value)}>
                    <SelectTrigger className="h-12 bg-muted border-border focus:border-primary focus:ring-primary/20">
                      <SelectValue placeholder="Choose your role to continue" />
                    </SelectTrigger>
                    <SelectContent className="bg-card backdrop-blur-xl border shadow-elegant">
                      <SelectItem value="farmer" className="py-3 hover:bg-primary/10">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-green-100 rounded-lg">
                            <User className="h-4 w-4 text-green-600" />
                          </div>
                          <div>
                            <div className="font-semibold text-card-foreground">Farmer</div>
                            <div className="text-xs text-muted-foreground">{roleDescriptions.farmer}</div>
                          </div>
                        </div>
                      </SelectItem>
                      <SelectItem value="buyer" className="py-3 hover:bg-primary/10">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <Store className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <div className="font-semibold text-card-foreground">Buyer</div>
                            <div className="text-xs text-muted-foreground">{roleDescriptions.buyer}</div>
                          </div>
                        </div>
                      </SelectItem>
                      <SelectItem value="admin" className="py-3 hover:bg-primary/10">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-purple-100 rounded-lg">
                            <Shield className="h-4 w-4 text-purple-600" />
                          </div>
                          <div>
                          <div className="font-semibold text-card-foreground">Administrator</div>
                          <div className="text-xs text-muted-foreground">{roleDescriptions.admin}</div>
                          </div>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Username Field */}
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-sm font-semibold text-card-foreground">Username</Label>
                  <Input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your username"
                    className="h-12 bg-muted border-border focus:border-primary focus:ring-primary/20 placeholder:text-muted-foreground"
                    required
                  />
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-semibold text-card-foreground">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="h-12 bg-muted border-border focus:border-primary focus:ring-primary/20 placeholder:text-muted-foreground pr-12"
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

                {/* Error Alert */}
                {error && (
                  <Alert variant="destructive" className="border-red-200 bg-red-50">
                    <AlertDescription className="text-red-800">{error}</AlertDescription>
                  </Alert>
                )}

                {/* Login Button */}
                <Button
                  type="submit"
                  className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                  disabled={!role}
                >
                  {role ? `Login as ${role.charAt(0).toUpperCase() + role.slice(1)}` : 'Select Role to Continue'}
                </Button>
              </form>

              {/* Demo Credentials Section */}
              <div className="space-y-4 pt-4 border-t border-border">
                <Button
                  variant="outline"
                  onClick={() => setShowCredentials(!showCredentials)}
                  className="w-full h-10 bg-card hover:bg-muted border-border hover:border-primary/50"
                >
                  {showCredentials ? 'Hide' : 'Show'} Demo Credentials
                </Button>

                {showCredentials && (
                  <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-xl p-4 border border-primary/20">
                    <div className="flex items-center gap-2 mb-3">
                      <Sparkles className="h-4 w-4 text-primary" />
                      <span className="font-semibold text-card-foreground text-sm">Demo Credentials</span>
                    </div>
                    <div className="grid gap-3">
                      {Object.entries(credentials).map(([roleKey, cred]) => (
                        <div key={roleKey} className="bg-card rounded-lg p-3 border border-border">
                          <div className="flex items-center space-x-2 mb-2">
                            {React.createElement(roleIcons[roleKey as UserRole], { className: "h-4 w-4 text-primary" })}
                            <span className="font-medium text-card-foreground capitalize text-sm">{roleKey}</span>
                            <Badge variant="secondary" className="text-xs">Demo</Badge>
                          </div>
                          <div className="space-y-1 text-xs text-muted-foreground ml-6">
                            <div>Username: <code className="bg-muted px-2 py-1 rounded text-card-foreground">{cred.username}</code></div>
                            <div>Password: <code className="bg-muted px-2 py-1 rounded text-card-foreground">{cred.password}</code></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
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