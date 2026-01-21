import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Home,
  Camera,
  ShoppingCart,
  TrendingUp,
  Users,
  Cloud,
  Leaf,
  Sparkles,
  MessageCircle,
  User,
  Mic,
  MicOff,
  Search,
  Volume2,
  Settings,
  FileText,
  Shield,
  HeartHandshake,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface PageItem {
  name: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  keywords: string[];
  description: string;
  category: 'main' | 'diagnose' | 'tools' | 'account';
}

const pages: PageItem[] = [
  // Main Navigation
  { name: "Home", path: "/", icon: Home, keywords: ["home", "dashboard", "main", "start", "landing"], description: "Go to homepage", category: 'main' },
  { name: "Buy Products", path: "/buy", icon: ShoppingCart, keywords: ["buy", "shop", "purchase", "products", "marketplace", "store"], description: "Browse and buy products", category: 'main' },
  { name: "Sell Products", path: "/sell", icon: TrendingUp, keywords: ["sell", "list", "upload", "my products", "vendor"], description: "Sell your products", category: 'main' },
  { name: "Community", path: "/community", icon: Users, keywords: ["community", "forum", "discuss", "farmers", "social", "chat"], description: "Join the community", category: 'main' },
  { name: "Weather", path: "/weather", icon: Cloud, keywords: ["weather", "forecast", "rain", "temperature", "climate", "humidity"], description: "Check weather forecast", category: 'main' },
  
  // Diagnose
  { name: "Diagnose Disease", path: "/diagnose", icon: Camera, keywords: ["diagnose", "disease", "plant", "health", "scan", "camera", "detect", "identify", "crop disease"], description: "Scan plant for diseases", category: 'diagnose' },
  { name: "Hybrid Breeding", path: "/hybrid", icon: Leaf, keywords: ["hybrid", "breeding", "crossbreed", "genetics", "variety"], description: "Explore hybrid crops", category: 'diagnose' },
  
  // Tools
  { name: "AI Recommendations", path: "/recommendations", icon: Sparkles, keywords: ["recommendations", "suggest", "ai", "smart", "tips", "advice"], description: "Get AI-powered suggestions", category: 'tools' },
  { name: "Market Analysis", path: "/market-analysis", icon: TrendingUp, keywords: ["market", "analysis", "price", "trends", "mandi", "rates"], description: "View market trends", category: 'tools' },
  { name: "Crops & Hybrids", path: "/crops-hybrid", icon: Leaf, keywords: ["crops", "hybrids", "varieties", "seeds", "cultivation"], description: "Explore crop varieties", category: 'tools' },
  { name: "Government Schemes", path: "/government-schemes", icon: Shield, keywords: ["government", "schemes", "subsidy", "policy", "yojana", "benefits"], description: "View government schemes", category: 'tools' },
  { name: "Buyer Panel", path: "/buyer-panel", icon: ShoppingCart, keywords: ["buyer", "panel", "orders", "purchase history"], description: "Manage your purchases", category: 'tools' },
  { name: "News & Blogs", path: "/blogs", icon: FileText, keywords: ["news", "blogs", "articles", "updates", "read"], description: "Read latest news", category: 'tools' },
  { name: "AI Chatbot", path: "/chatbot", icon: MessageCircle, keywords: ["chatbot", "ai", "assistant", "help", "query", "ask"], description: "Chat with AI assistant", category: 'tools' },
  
  // Account
  { name: "Profile", path: "/user-profile", icon: User, keywords: ["profile", "account", "settings", "my account", "user"], description: "View your profile", category: 'account' },
  { name: "Admin Dashboard", path: "/admin", icon: Settings, keywords: ["admin", "dashboard", "manage", "control panel"], description: "Admin dashboard", category: 'account' },
  { name: "Support", path: "/support", icon: HeartHandshake, keywords: ["support", "help", "contact", "assistance", "feedback"], description: "Get help & support", category: 'account' },
  { name: "Sign In", path: "/role-login", icon: User, keywords: ["login", "sign in", "signin", "authenticate"], description: "Sign in to your account", category: 'account' },
];

// Get SpeechRecognition API (cross-browser)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getSpeechRecognition = (): any => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition || null;
};

interface VoiceSearchCommandProps {
  trigger?: React.ReactNode;
}

export function VoiceSearchCommand({ trigger }: VoiceSearchCommandProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const [transcript, setTranscript] = useState("");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Check for speech recognition support
  useEffect(() => {
    setVoiceSupported(!!getSpeechRecognition());
  }, []);

  // Initialize speech recognition
  const initSpeechRecognition = useCallback(() => {
    const SpeechRecognitionAPI = getSpeechRecognition();
    if (!SpeechRecognitionAPI) return null;

    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      setTranscript("");
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      const results = event.results;
      const latestResult = results[results.length - 1];
      const transcriptText = latestResult[0].transcript;
      
      setTranscript(transcriptText);
      
      // If it's a final result, use it for search
      if (latestResult.isFinal) {
        setSearch(transcriptText);
        handleVoiceCommand(transcriptText);
      }
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      
      if (event.error === 'not-allowed') {
        toast({
          title: "Microphone Access Denied",
          description: "Please allow microphone access to use voice search.",
          variant: "destructive",
        });
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    return recognition;
  }, [toast]);

  // Handle voice command - try to match and navigate
  const handleVoiceCommand = useCallback((voiceText: string) => {
    const normalizedText = voiceText.toLowerCase().trim();
    
    // Check for navigation commands
    const navigationPhrases = [
      { patterns: ["go to", "open", "navigate to", "take me to", "show me", "show"], action: 'navigate' },
    ];

    let targetPage: PageItem | undefined;
    
    // First, try to find direct match with navigation phrase
    for (const phrase of navigationPhrases) {
      for (const pattern of phrase.patterns) {
        if (normalizedText.includes(pattern)) {
          const searchTerm = normalizedText.replace(pattern, '').trim();
          targetPage = findBestMatch(searchTerm);
          break;
        }
      }
      if (targetPage) break;
    }

    // If no navigation phrase found, try direct keyword match
    if (!targetPage) {
      targetPage = findBestMatch(normalizedText);
    }

    if (targetPage) {
      toast({
        title: "🎤 Voice Navigation",
        description: `Navigating to ${targetPage.name}...`,
      });
      setOpen(false);
      setSearch("");
      setTranscript("");
      navigate(targetPage.path);
    }
  }, [navigate, toast]);

  // Find best matching page
  const findBestMatch = (searchText: string): PageItem | undefined => {
    const normalizedSearch = searchText.toLowerCase().trim();
    
    // Exact name match
    let match = pages.find(page => 
      page.name.toLowerCase() === normalizedSearch
    );
    if (match) return match;

    // Keyword match
    match = pages.find(page => 
      page.keywords.some(keyword => 
        normalizedSearch.includes(keyword) || keyword.includes(normalizedSearch)
      )
    );
    if (match) return match;

    // Partial name match
    match = pages.find(page => 
      page.name.toLowerCase().includes(normalizedSearch) ||
      normalizedSearch.includes(page.name.toLowerCase())
    );
    
    return match;
  };

  // Start voice recognition
  const startListening = useCallback(() => {
    if (!voiceSupported) {
      toast({
        title: "Voice Not Supported",
        description: "Your browser doesn't support voice recognition.",
        variant: "destructive",
      });
      return;
    }

    if (recognitionRef.current) {
      recognitionRef.current.abort();
    }

    recognitionRef.current = initSpeechRecognition();
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch (error) {
        console.error('Failed to start speech recognition:', error);
      }
    }
  }, [voiceSupported, initSpeechRecognition, toast]);

  // Stop voice recognition
  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  }, []);

  // Handle page selection
  const handleSelect = useCallback((path: string) => {
    setOpen(false);
    setSearch("");
    setTranscript("");
    navigate(path);
  }, [navigate]);

  // Keyboard shortcut to open search
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  // Filter pages based on search
  const filteredPages = search
    ? pages.filter(page => {
        const searchLower = search.toLowerCase();
        return (
          page.name.toLowerCase().includes(searchLower) ||
          page.keywords.some(k => k.includes(searchLower)) ||
          page.description.toLowerCase().includes(searchLower)
        );
      })
    : pages;

  const groupedPages = {
    main: filteredPages.filter(p => p.category === 'main'),
    diagnose: filteredPages.filter(p => p.category === 'diagnose'),
    tools: filteredPages.filter(p => p.category === 'tools'),
    account: filteredPages.filter(p => p.category === 'account'),
  };

  return (
    <>
      {trigger ? (
        <div onClick={() => setOpen(true)}>{trigger}</div>
      ) : (
        <Button
          variant="outline"
          size="icon"
          onClick={() => setOpen(true)}
          className="relative"
        >
          <Search className="h-4 w-4" />
          <kbd className="pointer-events-none absolute right-1 top-1 hidden h-4 select-none items-center gap-1 rounded border bg-muted px-1 font-mono text-[10px] font-medium opacity-100 sm:flex">
            ⌘K
          </kbd>
        </Button>
      )}

      <CommandDialog open={open} onOpenChange={setOpen}>
        <div className="flex items-center border-b px-3">
          <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={isListening ? "Listening..." : "Search pages or say a command..."}
            className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
          />
          
          {/* Voice Button */}
          {voiceSupported && (
            <Button
              variant={isListening ? "destructive" : "ghost"}
              size="icon"
              onClick={isListening ? stopListening : startListening}
              className={cn(
                "ml-2 shrink-0 transition-all",
                isListening && "animate-pulse"
              )}
            >
              {isListening ? (
                <MicOff className="h-4 w-4" />
              ) : (
                <Mic className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>

        {/* Voice Transcript Display */}
        {isListening && transcript && (
          <div className="flex items-center gap-2 px-4 py-2 bg-primary/5 border-b">
            <Volume2 className="h-4 w-4 text-primary animate-pulse" />
            <span className="text-sm text-muted-foreground">
              Heard: <span className="text-foreground font-medium">"{transcript}"</span>
            </span>
          </div>
        )}

        {/* Voice Listening Indicator */}
        {isListening && !transcript && (
          <div className="flex items-center justify-center gap-2 px-4 py-3 bg-primary/5 border-b">
            <div className="flex items-center gap-1">
              <span className="w-1 h-4 bg-primary rounded-full animate-[pulse_1s_ease-in-out_infinite]"></span>
              <span className="w-1 h-6 bg-primary rounded-full animate-[pulse_1s_ease-in-out_0.2s_infinite]"></span>
              <span className="w-1 h-4 bg-primary rounded-full animate-[pulse_1s_ease-in-out_0.4s_infinite]"></span>
            </div>
            <span className="text-sm text-muted-foreground ml-2">
              Listening... Try saying "Go to Weather" or "Open Diagnose"
            </span>
          </div>
        )}

        <CommandList>
          <CommandEmpty>
            <div className="py-6 text-center">
              <p className="text-sm text-muted-foreground">No pages found.</p>
              {voiceSupported && (
                <p className="text-xs text-muted-foreground mt-2">
                  Try voice search: click the microphone and say "Go to [page name]"
                </p>
              )}
            </div>
          </CommandEmpty>

          {groupedPages.main.length > 0 && (
            <CommandGroup heading="Navigation">
              {groupedPages.main.map((page) => (
                <CommandItem
                  key={page.path}
                  value={page.name}
                  onSelect={() => handleSelect(page.path)}
                  className="flex items-center gap-3 cursor-pointer"
                >
                  <page.icon className="h-4 w-4 text-primary" />
                  <div className="flex flex-col">
                    <span>{page.name}</span>
                    <span className="text-xs text-muted-foreground">{page.description}</span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {groupedPages.diagnose.length > 0 && (
            <>
              <CommandSeparator />
              <CommandGroup heading="Diagnose & Health">
                {groupedPages.diagnose.map((page) => (
                  <CommandItem
                    key={page.path}
                    value={page.name}
                    onSelect={() => handleSelect(page.path)}
                    className="flex items-center gap-3 cursor-pointer"
                  >
                    <page.icon className="h-4 w-4 text-green-600" />
                    <div className="flex flex-col">
                      <span>{page.name}</span>
                      <span className="text-xs text-muted-foreground">{page.description}</span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          )}

          {groupedPages.tools.length > 0 && (
            <>
              <CommandSeparator />
              <CommandGroup heading="Tools & Features">
                {groupedPages.tools.map((page) => (
                  <CommandItem
                    key={page.path}
                    value={page.name}
                    onSelect={() => handleSelect(page.path)}
                    className="flex items-center gap-3 cursor-pointer"
                  >
                    <page.icon className="h-4 w-4 text-blue-600" />
                    <div className="flex flex-col">
                      <span>{page.name}</span>
                      <span className="text-xs text-muted-foreground">{page.description}</span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          )}

          {groupedPages.account.length > 0 && (
            <>
              <CommandSeparator />
              <CommandGroup heading="Account">
                {groupedPages.account.map((page) => (
                  <CommandItem
                    key={page.path}
                    value={page.name}
                    onSelect={() => handleSelect(page.path)}
                    className="flex items-center gap-3 cursor-pointer"
                  >
                    <page.icon className="h-4 w-4 text-purple-600" />
                    <div className="flex flex-col">
                      <span>{page.name}</span>
                      <span className="text-xs text-muted-foreground">{page.description}</span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          )}
        </CommandList>

        {/* Footer with hints */}
        <div className="border-t px-4 py-2 bg-muted/50">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-background border rounded text-[10px]">↑↓</kbd>
                Navigate
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-background border rounded text-[10px]">↵</kbd>
                Select
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-background border rounded text-[10px]">Esc</kbd>
                Close
              </span>
            </div>
            {voiceSupported && (
              <Badge variant="outline" className="text-[10px]">
                <Mic className="h-3 w-3 mr-1" />
                Voice enabled
              </Badge>
            )}
          </div>
        </div>
      </CommandDialog>
    </>
  );
}
