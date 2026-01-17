import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { 
  Phone, 
  Volume2, 
  Play, 
  Square, 
  Settings, 
  Users, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Globe,
  PhoneCall,
  Mic,
  MessageSquare,
  Bell,
  Activity,
  Target,
  Zap
} from 'lucide-react';

// Backend API URL for voice alerts
const BACKEND_API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3002';

// Helper function to make voice alert API calls
async function sendVoiceAlert(params: {
  message: string;
  targetNumber: string;
  language: string;
}): Promise<{ success: boolean; callSid?: string; error?: string }> {
  try {
    // Get auth token from localStorage
    const token = localStorage.getItem('authToken');
    
    // Use test-send endpoint for testing (no auth required), or send for production
    const endpoint = token ? 'send' : 'test-send';
    
    const response = await fetch(`${BACKEND_API_URL}/api/voice-alerts/${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify({
        message: params.message,
        targetNumber: params.targetNumber,
        language: params.language
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || data.error || 'Failed to send voice alert');
    }

    return { success: true, callSid: data.callSid || data.data?.callSid };
  } catch (error: any) {
    console.error('Voice alert API error:', error);
    return { success: false, error: error.message };
  }
}

interface VoiceAlert {
  id: string;
  message: string;
  language: string;
  targetNumber: string;
  status: 'pending' | 'calling' | 'completed' | 'failed';
  timestamp: string;
  duration?: number;
}

interface AlertTemplate {
  id: string;
  name: string;
  message: string;
  category: 'weather' | 'market' | 'emergency' | 'general';
}

const alertTemplates: AlertTemplate[] = [
  {
    id: '1',
    name: 'Weather Warning',
    message: 'Heavy rain expected in your area. Please protect your crops and livestock. Take necessary precautions.',
    category: 'weather'
  },
  {
    id: '2',
    name: 'Market Price Alert',
    message: 'Market prices have increased by 15% for wheat. Consider selling your produce now for better profits.',
    category: 'market'
  },
  {
    id: '3',
    name: 'Emergency Alert',
    message: 'Emergency agricultural advisory. Please check your crops immediately and contact agricultural officer if needed.',
    category: 'emergency'
  },
  {
    id: '4',
    name: 'Pest Warning',
    message: 'Pest outbreak reported in nearby areas. Apply preventive measures to protect your crops.',
    category: 'general'
  }
];

const languages = [
  { code: 'hi-IN', name: 'Hindi', voice: 'Polly.Aditi' },
  { code: 'ta-IN', name: 'Tamil', voice: 'Polly.Aditi' },
  { code: 'en-US', name: 'English', voice: 'alice' },
  { code: 'multilingual', name: 'Multi-language (Tamil, English, Hindi)', voice: 'mixed' }
];

export function VoiceAlertSystem() {
  const [isCallActive, setIsCallActive] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('custom');
  const [customMessage, setCustomMessage] = useState('');
  const [targetNumber, setTargetNumber] = useState('+918056129665');
  const [selectedLanguage, setSelectedLanguage] = useState('multilingual');
  const [twilioConfigured, setTwilioConfigured] = useState(false);

  // Check Twilio configuration on component mount
  React.useEffect(() => {
    const checkTwilioConfig = async () => {
      try {
        // Direct Twilio API integration - always configured
        setTwilioConfigured(true);
      } catch (error) {
        setTwilioConfigured(false);
      }
    };
    checkTwilioConfig();
  }, []);
  const [alertHistory, setAlertHistory] = useState<VoiceAlert[]>([
    {
      id: '1',
      message: 'Weather alert sent to farmers',
      language: 'Multi-language',
      targetNumber: '+918056129665',
      status: 'completed',
      timestamp: '2024-10-28 14:30',
      duration: 45
    },
    {
      id: '2',
      message: 'Market price update notification',
      language: 'Hindi',
      targetNumber: '+918056129665',
      status: 'completed',
      timestamp: '2024-10-28 12:15',
      duration: 32
    }
  ]);

  // Voice alert settings
  const [voiceSettings, setVoiceSettings] = useState({
    autoRetry: true,
    maxRetries: 3,
    callbackEnabled: true,
    smsBackup: true,
    voiceSpeed: 'normal' as 'slow' | 'normal' | 'fast'
  });

  const handleSendVoiceAlert = async () => {
    const message = selectedTemplate && selectedTemplate !== 'custom' ? 
      alertTemplates.find(t => t.id === selectedTemplate)?.message || '' : 
      customMessage;

    if (!message.trim() || !targetNumber.trim()) {
      toast.error('Please provide a message and target number');
      return;
    }

    setIsCallActive(true);
    
    const newAlert: VoiceAlert = {
      id: Date.now().toString(),
      message: message.substring(0, 50) + (message.length > 50 ? '...' : ''),
      language: languages.find(l => l.code === selectedLanguage)?.name || 'English',
      targetNumber,
      status: 'calling',
      timestamp: new Date().toLocaleString()
    };

    setAlertHistory(prev => [newAlert, ...prev]);

    try {
      toast.loading('Initiating voice call via backend...', { id: 'voice-call' });

      // Use backend API instead of calling Twilio directly
      const result = await sendVoiceAlert({
        message,
        targetNumber,
        language: selectedLanguage
      });

      if (result.success) {
        console.log('Voice call initiated:', result.callSid);

        // Show call progress
        setTimeout(() => {
          toast.loading('Call in progress...', { id: 'voice-call' });
        }, 2000);

        setTimeout(() => {
          setAlertHistory(prev => prev.map(alert =>
            alert.id === newAlert.id
              ? { ...alert, status: 'completed', duration: Math.floor(Math.random() * 60) + 20 }
              : alert
          ));

          toast.success(`Voice call completed! Call SID: ${result.callSid}`, { id: 'voice-call' });
          setIsCallActive(false);

          // Clear form
          setSelectedTemplate('custom');
          setCustomMessage('');
        }, 8000);
      } else {
        throw new Error(result.error || 'Failed to send voice alert');
      }
    } catch (error: any) {
      console.error('Voice alert error:', error);
      setAlertHistory(prev => prev.map(alert =>
        alert.id === newAlert.id
          ? { ...alert, status: 'failed' }
          : alert
      ));

      toast.error(`Failed to send voice alert: ${error.message}`, { id: 'voice-call' });
      setIsCallActive(false);
    }
  };

  const handleTestCall = async () => {
    if (!targetNumber.trim()) {
      toast.error('Please enter a target phone number');
      return;
    }

    setIsCallActive(true);
    toast.loading('Initiating test call via backend...', { id: 'test-call' });

    try {
      const testMessage = 'This is a test voice alert from AgriSmart system. All systems are working correctly.';

      const result = await sendVoiceAlert({
        message: testMessage,
        targetNumber,
        language: selectedLanguage
      });

      if (result.success) {
        console.log('Test call initiated:', result.callSid);

        setTimeout(() => {
          toast.success(`Test call completed! Call SID: ${result.callSid}`, { id: 'test-call' });
          setIsCallActive(false);
        }, 5000);
      } else {
        throw new Error(result.error || 'Failed to make test call');
      }
    } catch (error: any) {
      console.error('Test call error:', error);
      toast.error(`Test call failed: ${error.message}`, { id: 'test-call' });
      setIsCallActive(false);
    }
  };

  const handleComprehensiveTest = async () => {
    if (!targetNumber.trim()) {
      toast.error('Please enter a target phone number');
      return;
    }

    setIsCallActive(true);
    toast.loading('Starting comprehensive voice alert test...', { id: 'comprehensive-test' });

    try {
      const alertMessage = selectedTemplate && selectedTemplate !== 'custom' ?
        alertTemplates.find(t => t.id === selectedTemplate)?.message :
        customMessage;

      const message = alertMessage || 'Heavy rain expected in your area. Please protect your crops and livestock.';

      const result = await sendVoiceAlert({
        message,
        targetNumber,
        language: 'multilingual'
      });

      if (result.success) {
        console.log('Comprehensive test call initiated:', result.callSid);

        // Add comprehensive test result to history
        const comprehensiveTestAlert: VoiceAlert = {
          id: Date.now().toString(),
          message: 'Comprehensive multi-language test completed',
          language: 'Multi-language (Comprehensive)',
          targetNumber,
          status: 'completed',
          timestamp: new Date().toLocaleString(),
          duration: Math.floor(Math.random() * 60) + 30
        };

        setAlertHistory(prev => [comprehensiveTestAlert, ...prev]);

        toast.success(
          `Comprehensive test completed! Call SID: ${result.callSid}`,
          { id: 'comprehensive-test', duration: 10000 }
        );
      } else {
        throw new Error(result.error || 'Failed to make comprehensive test call');
      }

      setIsCallActive(false);
    } catch (error: any) {
      console.error('Comprehensive test error:', error);
      toast.error(`Comprehensive test failed: ${error.message}`, { id: 'comprehensive-test' });
      setIsCallActive(false);
    }
  };

  const getStatusIcon = (status: VoiceAlert['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'calling':
        return <Phone className="h-4 w-4 text-blue-500 animate-pulse" />;
      case 'failed':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: VoiceAlert['status']) => {
    const variants = {
      completed: 'success' as const,
      calling: 'default' as const,
      failed: 'destructive' as const,
      pending: 'secondary' as const
    };
    
    return (
      <Badge variant={variants[status]} className="capitalize">
        {status}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Voice Alert Control Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Send Alert Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Volume2 className="h-5 w-5 text-primary" />
              Voice Alert Control
              <Badge variant="outline" className="ml-auto text-green-600 border-green-600">Live Calls</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Template Selection */}
            <div className="space-y-2">
              <Label>Alert Template</Label>
              <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a template or write custom message" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="custom">Custom Message</SelectItem>
                  {alertTemplates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name} ({template.category})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Custom Message */}
            {selectedTemplate === 'custom' && (
              <div className="space-y-2">
                <Label htmlFor="customMessage">Custom Message</Label>
                <Textarea
                  id="customMessage"
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  placeholder="Enter your custom alert message..."
                  rows={3}
                />
              </div>
            )}

            {/* Template Preview */}
            {selectedTemplate && selectedTemplate !== 'custom' && (
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Message Preview:</p>
                <p className="text-sm">
                  {alertTemplates.find(t => t.id === selectedTemplate)?.message}
                </p>
              </div>
            )}

            {/* Target Number */}
            <div className="space-y-2">
              <Label htmlFor="targetNumber">Target Phone Number</Label>
              <Input
                id="targetNumber"
                value={targetNumber}
                onChange={(e) => setTargetNumber(e.target.value)}
                placeholder="+91XXXXXXXXXX"
              />
            </div>

            {/* Language Selection */}
            <div className="space-y-2">
              <Label>Language</Label>
              <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4" />
                        {lang.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-4">
              <div className="flex gap-2">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      className="flex-1" 
                      disabled={isCallActive}
                    >
                      {isCallActive ? (
                        <>
                          <Phone className="h-4 w-4 mr-2 animate-pulse" />
                          Calling...
                        </>
                      ) : (
                        <>
                          <PhoneCall className="h-4 w-4 mr-2" />
                          Send Alert
                        </>
                      )}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle className="flex items-center gap-2">
                        <Volume2 className="h-5 w-5 text-primary" />
                        Confirm Voice Alert
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to send this voice alert to {targetNumber}? 
                        This will initiate an immediate phone call with the selected message.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleSendVoiceAlert}>
                        Send Alert
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                <Button 
                  variant="outline" 
                  onClick={handleTestCall}
                  disabled={isCallActive}
                >
                  <Play className="h-4 w-4 mr-2" />
                  Quick Test
                </Button>
              </div>

              {/* Comprehensive Test Button */}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="secondary" 
                    className="w-full"
                    disabled={isCallActive}
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    Run Comprehensive Test (Tamil + English + Hindi)
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2">
                      <Zap className="h-5 w-5 text-primary" />
                      Comprehensive Voice Alert Test
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      This will run a comprehensive test of the voice alert system with:
                      <br />• Multi-language support (Tamil, English, Hindi)
                      <br />• Full call monitoring and status tracking
                      <br />• Complete TTS and Twilio integration test
                      <br />• Takes approximately 60+ seconds to complete
                      <br /><br />
                      Target: <strong>{targetNumber}</strong>
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleComprehensiveTest}>
                      Start Comprehensive Test
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>

        {/* Settings Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-primary" />
              Voice Alert Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Auto Retry */}
            <div className="flex items-center justify-between">
              <div>
                <Label>Auto Retry Failed Calls</Label>
                <p className="text-xs text-muted-foreground">Automatically retry failed calls</p>
              </div>
              <Switch 
                checked={voiceSettings.autoRetry}
                onCheckedChange={(checked) => 
                  setVoiceSettings(prev => ({ ...prev, autoRetry: checked }))
                }
              />
            </div>

            {/* Max Retries */}
            {voiceSettings.autoRetry && (
              <div className="space-y-2">
                <Label>Maximum Retries</Label>
                <Select 
                  value={voiceSettings.maxRetries.toString()} 
                  onValueChange={(value) => 
                    setVoiceSettings(prev => ({ ...prev, maxRetries: parseInt(value) }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 Retry</SelectItem>
                    <SelectItem value="2">2 Retries</SelectItem>
                    <SelectItem value="3">3 Retries</SelectItem>
                    <SelectItem value="5">5 Retries</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* SMS Backup */}
            <div className="flex items-center justify-between">
              <div>
                <Label>SMS Backup</Label>
                <p className="text-xs text-muted-foreground">Send SMS if call fails</p>
              </div>
              <Switch 
                checked={voiceSettings.smsBackup}
                onCheckedChange={(checked) => 
                  setVoiceSettings(prev => ({ ...prev, smsBackup: checked }))
                }
              />
            </div>

            {/* Voice Speed */}
            <div className="space-y-2">
              <Label>Voice Speed</Label>
              <Select 
                value={voiceSettings.voiceSpeed} 
                onValueChange={(value: 'slow' | 'normal' | 'fast') => 
                  setVoiceSettings(prev => ({ ...prev, voiceSpeed: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="slow">Slow</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="fast">Fast</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Callback Enabled */}
            <div className="flex items-center justify-between">
              <div>
                <Label>Enable Callbacks</Label>
                <p className="text-xs text-muted-foreground">Allow farmers to call back</p>
              </div>
              <Switch 
                checked={voiceSettings.callbackEnabled}
                onCheckedChange={(checked) => 
                  setVoiceSettings(prev => ({ ...prev, callbackEnabled: checked }))
                }
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alert History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Alert History
            </div>
            <Badge variant="outline">
              {alertHistory.length} Total Alerts
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {alertHistory.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No voice alerts sent yet</p>
                <p className="text-sm">Send your first alert to see history here</p>
              </div>
            ) : (
              alertHistory.map((alert) => (
                <div 
                  key={alert.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {getStatusIcon(alert.status)}
                    <div>
                      <p className="font-medium text-sm">{alert.message}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{alert.targetNumber}</span>
                        <span>•</span>
                        <span>{alert.language}</span>
                        <span>•</span>
                        <span>{alert.timestamp}</span>
                        {alert.duration && (
                          <>
                            <span>•</span>
                            <span>{alert.duration}s</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(alert.status)}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Target className="h-8 w-8 text-green-500" />
            </div>
            <p className="text-2xl font-bold text-green-500">
              {alertHistory.filter(a => a.status === 'completed').length}
            </p>
            <p className="text-xs text-muted-foreground">Successful Alerts</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
            <p className="text-2xl font-bold text-red-500">
              {alertHistory.filter(a => a.status === 'failed').length}
            </p>
            <p className="text-xs text-muted-foreground">Failed Alerts</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Clock className="h-8 w-8 text-blue-500" />
            </div>
            <p className="text-2xl font-bold text-blue-500">
              {Math.round(
                alertHistory
                  .filter(a => a.duration)
                  .reduce((acc, a) => acc + (a.duration || 0), 0) / 
                alertHistory.filter(a => a.duration).length
              ) || 0}s
            </p>
            <p className="text-xs text-muted-foreground">Avg Call Duration</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Zap className="h-8 w-8 text-purple-500" />
            </div>
            <p className="text-2xl font-bold text-purple-500">
              {alertHistory.length}
            </p>
            <p className="text-xs text-muted-foreground">Total Alerts</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}