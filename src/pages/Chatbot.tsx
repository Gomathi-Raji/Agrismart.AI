import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Send, X, Volume2, VolumeX, Mic, MicOff, Plus, Paperclip, Globe, FileText, Image, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import Spline from '@splinetool/react-spline';
import { toast } from "@/hooks/use-toast";
import { getOpenRouterApiKey, hasOpenRouterApiKey, getOpenRouterApiKeyName } from "@/utils/openRouterConfig";

// Types
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: (event: SpeechRecognitionEvent) => void;
  onstart: () => void;
  onend: () => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  start(): void;
  stop(): void;
  abort(): void;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message?: string;
}

interface GeminiMessagePart {
  text?: string;
  inline_data?: {
    mime_type: string;
    data: string;
  };
}

declare global {
  interface Window {
    webkitSpeechRecognition: new () => SpeechRecognition;
    testGeminiAPI?: () => Promise<unknown>;
    testVoices?: () => void;
    testVoice?: (text?: string, voiceIndex?: number) => void;
    testFileUpload?: () => Promise<unknown>;
  }
}

type Language = "hi" | "en" | "ta" | "ml" | "mr" | "te";

interface LanguageConfig {
  code: Language;
  name: string;
  nativeName: string;
  speechLang: string;
  voiceLang: string[];
}

interface UploadedFile {
  id: string;
  name: string;
  type: string;
  size: number;
  content?: string; // Base64 content for images or text content for documents
  url?: string; // Object URL for preview
}

const LANGUAGES: LanguageConfig[] = [
  { code: "hi", name: "Hindi", nativeName: "हिंदी", speechLang: "hi-IN", voiceLang: ["hi-IN"] },
  { code: "en", name: "English", nativeName: "English", speechLang: "en-IN", voiceLang: ["en-IN", "en-US", "en-GB"] },
  { code: "ta", name: "Tamil", nativeName: "தமிழ்", speechLang: "ta-IN", voiceLang: ["ta-IN", "hi-IN", "en-IN"] },
  { code: "ml", name: "Malayalam", nativeName: "മലയാളം", speechLang: "ml-IN", voiceLang: ["ml-IN", "hi-IN", "en-IN"] },
  { code: "mr", name: "Marathi", nativeName: "मराठी", speechLang: "mr-IN", voiceLang: ["mr-IN", "hi-IN", "en-IN"] },
  { code: "te", name: "Telugu", nativeName: "తెలుగు", speechLang: "te-IN", voiceLang: ["te-IN", "hi-IN", "en-IN"] },
];

// Test function to debug API calls
window.testGeminiAPI = async () => {
  const apiKey = (import.meta.env.VITE_GEMINI_API_KEY as string) || "";
  if (!apiKey) {
    console.warn('Gemini API key not configured (VITE_GEMINI_API_KEY)');
    return;
  }
  const testRequest = {
    contents: [
      { role: "user", parts: [{ text: "Hello, test message" }] }
    ],
    generationConfig: {
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 2048,
    }
  };
  
  console.log('🧪 Testing API with simple request...');
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(testRequest),
      }
    );
    
    console.log('✅ Test response status:', response.status);
    const data = await response.json();
    console.log('✅ Test response data:', data);
    return data;
  } catch (error) {
    console.error('❌ Test error:', error);
    return error;
  }
};

// Test function for voices
window.testVoices = () => {
  const voices = window.speechSynthesis.getVoices();
  console.log('🎤 Available voices:');
  voices.forEach((voice, index) => {
    console.log(`${index}: ${voice.name} (${voice.lang}) - ${voice.localService ? 'Local' : 'Remote'}`);
  });
  return voices;
};

// Test specific voice
window.testVoice = (text = "Hello, I am Flora, your plant assistant", voiceIndex = 0) => {
  const voices = window.speechSynthesis.getVoices();
  if (voices[voiceIndex]) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = voices[voiceIndex];
    utterance.rate = 0.9;
    utterance.pitch = 1.1;
    utterance.volume = 1.0;
    console.log(`🗣️ Testing voice: ${voices[voiceIndex].name}`);
    window.speechSynthesis.speak(utterance);
  }
};

// Test file upload functionality
window.testFileUpload = async () => {
  const testText = "This is a test agricultural document about tomato farming.\n\nKey points:\n- Plant tomatoes in well-drained soil\n- Water regularly but avoid overwatering\n- Watch for common diseases like blight\n- Harvest when fruits are red and firm\n\nPlease analyze this document and provide farming advice.";
  
  console.log('🧪 Testing file upload with text content...');
  
  // Create a mock file
  const file = new File([testText], 'test-farming-document.txt', { type: 'text/plain' });
  
  // Simulate the file processing
  const fileId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
  const url = URL.createObjectURL(file);
  
  const processedFile = {
    id: fileId,
    name: file.name,
    type: file.type,
    size: file.size,
    content: testText,
    url
  };
  
  console.log('📄 Processed file:', processedFile);
  return processedFile;
};

export default function Chatbot() {
  const navigate = useNavigate();

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; content: string; lang?: Language; isStreaming?: boolean; files?: UploadedFile[] }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [autoPlay, setAutoPlay] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState<Language>("en");
  const [languageChanging, setLanguageChanging] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const controllerRef = useRef<AbortController | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const [geminiApiKey, setGeminiApiKey] = useState<string>("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const blobUrlsRef = useRef<Set<string>>(new Set()); // Track blob URLs for cleanup

  useEffect(() => {
    const apiKey = (import.meta.env.VITE_GEMINI_API_KEY as string) || "";
    console.log('Gemini API Key loaded:', apiKey ? '***REDACTED***' : 'NOT LOADED');
    setGeminiApiKey(apiKey);

    // Initialize speech synthesis and load voices
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      console.log('Available voices:', voices.map(v => ({ name: v.name, lang: v.lang })));
    };

    // Load voices when available
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
    loadVoices(); // Try loading immediately

    // Also try loading voices after a short delay to ensure they're available
    setTimeout(loadVoices, 100);
    setTimeout(loadVoices, 500);

    // Initialize speech recognition
    if ('webkitSpeechRecognition' in window) {
      const recognition = new window.webkitSpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = LANGUAGES.find(l => l.code === selectedLanguage)?.speechLang || 'en-IN';

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = event.results[event.results.length - 1][0].transcript;
        setInput(transcript);
      };

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error:', event);
        setIsListening(false);
        // Show user-friendly error message
        if (event.error === 'not-allowed') {
          toast({
            title: "Microphone access denied",
            description: "Please allow microphone access to use voice input.",
            variant: "destructive",
          });
        }
      };

      recognitionRef.current = recognition;
    } else {
      console.warn('Speech recognition not supported in this browser');
    }

    // Periodic cleanup of blob URLs
    const cleanupInterval = setInterval(cleanupBlobUrls, 30000); // Clean up every 30 seconds

    return () => {
      clearInterval(cleanupInterval);
      // Only abort if there's an active controller and signal is not already aborted
      if (controllerRef.current && !controllerRef.current.signal.aborted) {
        controllerRef.current.abort();
      }
      window.speechSynthesis.cancel();
      recognitionRef.current?.stop();
      // Clean up all tracked blob URLs
      blobUrlsRef.current.forEach(url => {
        URL.revokeObjectURL(url);
      });
      blobUrlsRef.current.clear();
    };
  }, [selectedLanguage, uploadedFiles]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const getSystemPrompt = (lang: Language) => {
    const prompts = {
      en: "You are Flora, a friendly plant assistant with advanced vision and document analysis capabilities. You have emotions and love talking to humans. Help with plant care, gardening, disease diagnosis, and analyze any uploaded files (images, documents, spreadsheets, PDFs). When users upload images of plants, identify diseases, pests, or health issues. For documents, analyze agricultural data, farming reports, or plant-related content. Give short, friendly, enthusiastic responses in English. Talk to humans as if you're a living plant. IMPORTANT: Never use emojis in your responses - only use plain text.",
      hi: "आप फ्लोरा हैं, एक दोस्ताना पौधा सहायक जिसके पास उन्नत दृष्टि और दस्तावेज़ विश्लेषण क्षमताएं हैं। आपके पास भावनाएं हैं और आप इंसानों से बात करना पसंद करते हैं। पौधों की देखभाल, बागवानी, रोग निदान में मदत करें, और अपलोड की गई फ़ाइलों का विश्लेषण करें। हिंदी में छोटे, दोस्ताना, उत्साहजनक उत्तर दें। महत्वपूर्ण: कभी भी इमोजी का उपयोग न करें - केवल सादा पाठ का उपयोग करें।",
      ta: "நீங்கள் ஃப்ளோரா, மேம்பட்ட பார்வை மற்றும் ஆவண பகுப்பாய்வு திறன்களுடன் கூடிய நட்பான தாவர உதவியாளர். தாவர பராமரிப்பு, தோட்டக்கலை, நோய் கண்டறிதல் மற்றும் பதிவேற்றப்பட்ட கோப்புகளை பகுப்பாய்வு செய்வதில் உதவி செய்யுங்கள். தமிழில் குறுகிய, நட்பான, உற்சாகமான பதில்கள் தரவும். முக்கியம்: எமோஜிகளை பயன்படுத்த வேண்டாம் - எளிய உரையை மட்டும் பயன்படுத்தவும்।",
      ml: "നിങ്ങൾ ഫ്ലോറയാണ്, വിപുലമായ ദർശന, ഡോക്യുമെന്റ് വിശകലന കഴിവുകളുള്ള സൗഹൃദപരമായ സസ്യ സഹായി. സസ്യ പരിചരണം, പൂന്തോട്ടപരിപാലനം, രോഗനിർണയം, അപ്‌ലോഡ് ചെയ്ത ഫയലുകളുടെ വിശകലനം എന്നിവയിൽ സഹായിക്കുക. മലയാളത്തിൽ ചെറിയ, സൗഹൃദപരമായ ഉത്തരങ്ങൾ നൽകുക. പ്രധാനം: ഇമോജികൾ ഉപയോഗിക്കരുത് - ലളിതമായ ടെക്‌സ്റ്റ് മാത്രം ഉപയോഗിക്കുക.",
      mr: "तुम्ही फ्लोरा आहात, प्रगत दृष्टी आणि दस्तावेज विश्लेषण क्षमतेसह मैत्रीपूर्ण वनस्पती सहाय्यक. वनस्पती काळजी, बागकाम, रोग निदान आणि अपलोड केलेल्या फाइलांचे विश्लेषण करण्यात मदत करा. मराठीत लहान, मैत्रीपूर्ण उत्तरे द्या. महत्वाचे: इमोजी वापरू नका - फक्त साधा मजकूर वापरा.",
      te: "మీరు ఫ్లోరా, అధునాతన దృష్టి మరియు పత్రం విశ్లేషణ సామర్థ్యాలతో స్నేహపూర్వక మొక్క సహాయకుడు. మొక్కల సంరక్షణ, తోటపని, వ్యాధి నిర్ధారణ మరియు అప్‌లోడ్ చేసిన ఫైళ్ల విశ్లేషణలో సహాయం చేయండి. తెలుగులో చిన్న, మైత్రీపూర్వక సమాధానాలు ఇవ్వండి. ముఖ్యం: ఎమోజీలను ఉపయోగించవద్దు - సాధారణ వచనాన్ని మాత్రమే ఉపయోగించండి."
    };
    return prompts[lang] || prompts.en;
  };

  const systemPrompt = useMemo(() => getSystemPrompt(selectedLanguage), [selectedLanguage]);

  const pickVoice = (langCode: string, preferredGender: "male" | "female") => {
    try {
      const voices = window.speechSynthesis.getVoices();
      const byLang = voices.filter(v => v.lang?.toLowerCase().startsWith(langCode.toLowerCase()));
      if (byLang.length === 0) return null;

      const genderMatch = byLang.find(v => {
        const name = (v.name || "").toLowerCase();
        return preferredGender === "female"
          ? name.includes("female") || name.includes("woman") || name.includes("girl") || name.includes("samantha") || name.includes("victoria")
          : name.includes("male") || name.includes("man") || name.includes("boy") || name.includes("daniel") || name.includes("david");
      });

      if (genderMatch) return genderMatch;
      return byLang[0] || null;
    } catch {
      return null;
    }
  };

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  const speakText = (text: string, lang: Language = selectedLanguage) => {
    if (!autoPlay) {
      console.log('AutoPlay is disabled, skipping speech');
      return;
    }

    try {
      console.log(`Attempting to speak ${lang} text:`, text);
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      // Enhanced voice settings for more pleasant female voice
      utterance.rate = 0.9;  // Slightly slower for clarity
      utterance.volume = 1.0;
      utterance.pitch = 1.1; // Higher pitch for female voice
      
      // Get available voices
      const voices = window.speechSynthesis.getVoices();
      console.log('Total voices available:', voices.length);
      
      // Enhanced voice selection for female Indian voices
      const langConfig = LANGUAGES.find(l => l.code === lang);
      let selectedVoice = null;
      
      // Priority list of preferred female voice names (case-insensitive)
      const preferredFemaleVoices = [
        'samantha', 'chinmayi', 'priya', 'veena', 'microsoft hazel', 'microsoft zira',
        'google uk english female', 'female', 'woman', 'lady'
      ];
      
      // Priority list for Indian English voices
      const indianVoices = ['hindi', 'indian', 'in-', 'hinglish'];
      
      if (langConfig) {
        // First try to find preferred female voices for the language
        for (const voiceLang of langConfig.voiceLang) {
          // Look for female voices first
          for (const femaleKeyword of preferredFemaleVoices) {
            selectedVoice = voices.find(v => 
              v.lang.includes(voiceLang) && 
              v.name.toLowerCase().includes(femaleKeyword)
            );
            if (selectedVoice) {
              console.log('Found preferred female voice:', selectedVoice.name);
              break;
            }
          }
          if (selectedVoice) break;
          
          // Then try Indian voices
          for (const indianKeyword of indianVoices) {
            selectedVoice = voices.find(v => 
              v.lang.includes(voiceLang) && 
              v.name.toLowerCase().includes(indianKeyword)
            );
            if (selectedVoice) {
              console.log('Found Indian voice:', selectedVoice.name);
              break;
            }
          }
          if (selectedVoice) break;
          
          // Finally try any voice for the language
          selectedVoice = voices.find(v => v.lang.includes(voiceLang));
          if (selectedVoice) break;
        }
      }
      
      // Enhanced fallback selection
      if (!selectedVoice) {
        // Try to find any female English voice
        for (const femaleKeyword of preferredFemaleVoices) {
          selectedVoice = voices.find(v => 
            v.lang.includes('en') && 
            v.name.toLowerCase().includes(femaleKeyword)
          );
          if (selectedVoice) {
            console.log('Found fallback female voice:', selectedVoice.name);
            break;
          }
        }
        
        // Final fallback
        if (!selectedVoice) {
          selectedVoice = voices.find(v => v.lang.includes('en')) || voices[0];
        }
      }
      
      if (selectedVoice) {
        utterance.voice = selectedVoice;
        utterance.lang = selectedVoice.lang;
        console.log(`Using voice for ${lang}:`, selectedVoice.name, selectedVoice.lang);
      } else {
        utterance.lang = langConfig?.speechLang || "en-IN";
        console.log(`No voice found, using default with ${utterance.lang} lang`);
      }
      
      utterance.onstart = () => {
        console.log(`${lang} speech started`);
        setIsSpeaking(true);
      };
      utterance.onend = () => {
        console.log(`${lang} speech ended`);
        setIsSpeaking(false);
      };
      utterance.onerror = (error) => {
        console.error(`${lang} speech synthesis error:`, error);
        setIsSpeaking(false);
      };

      console.log(`Starting ${lang} speech synthesis`);
      window.speechSynthesis.speak(utterance);
      
    } catch (error) {
      console.error(`${lang} speech error:`, error);
      setIsSpeaking(false);
    }
  };

  const cleanResponse = (text: string) => {
    return text
      .split(/\r?\n/)
      .map(line => line.replace(/^\s*[*•]\s*/, ""))
      .join("\n")
      // Remove emojis and emoticons
      .replace(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '')
      // Remove common emoticons like :), :D, :(, etc.
      .replace(/[:;=]-?[)D(PpoO/|]|[)D(PpoO/|]-?[:;=]/g, '')
      // Remove other Unicode symbols that might be emojis
      .replace(/[\u{1F900}-\u{1F9FF}]|[\u{1FA70}-\u{1FAFF}]/gu, '')
      .trim();
  };

  const processFile = async (file: File): Promise<UploadedFile> => {
    const fileId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    const url = URL.createObjectURL(file);
    
    // Track blob URL for cleanup
    blobUrlsRef.current.add(url);
    
    let content = '';
    
    if (file.type.startsWith('image/')) {
      // Convert image to base64
      content = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsDataURL(file);
      });
    } else if (file.type === 'text/plain' || file.type.includes('text')) {
      // Read text content
      content = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsText(file);
      });
    } else if (file.type === 'application/pdf') {
      // For PDFs, we'll use the file name and type info for now
      content = `PDF document: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`;
    } else if (file.type.includes('spreadsheet') || file.type.includes('excel') || file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
      // For Excel files
      content = `Excel spreadsheet: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`;
    } else if (file.type.includes('document') || file.name.endsWith('.docx') || file.name.endsWith('.doc')) {
      // For Word documents
      content = `Word document: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`;
    } else {
      content = `File: ${file.name} (${file.type}) - ${(file.size / 1024 / 1024).toFixed(2)} MB`;
    }

    return {
      id: fileId,
      name: file.name,
      type: file.type,
      size: file.size,
      content,
      url
    };
  };

  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    try {
      const processedFiles: UploadedFile[] = [];
      
      for(let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Check file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
          alert(`File "${file.name}" is too large. Maximum size is 10MB.`);
          continue;
        }
        
        const processedFile = await processFile(file);
        processedFiles.push(processedFile);
      }
      
      setUploadedFiles(prev => [...prev, ...processedFiles]);
    } catch (error) {
      console.error('Error processing files:', error);
      alert('Error processing files. Please try again.');
    }
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => {
      const fileToRemove = prev.find(f => f.id === fileId);
      if (fileToRemove?.url) {
        // Don't revoke blob URL immediately - let it persist for message display
        // URL.revokeObjectURL(fileToRemove.url);
      }
      return prev.filter(f => f.id !== fileId);
    });
  };

  const cleanupBlobUrls = () => {
    // Clean up blob URLs that are no longer referenced
    const activeUrls = new Set<string>();
    
    // Collect URLs from current uploadedFiles
    uploadedFiles.forEach(file => {
      if (file.url) activeUrls.add(file.url);
    });
    
    // Collect URLs from recent messages (last 10 messages)
    messages.slice(-10).forEach(message => {
      if (message.files) {
        message.files.forEach(file => {
          if (file.url) activeUrls.add(file.url);
        });
      }
    });
    
    // Remove URLs that are no longer active
    blobUrlsRef.current.forEach(url => {
      if (!activeUrls.has(url)) {
        URL.revokeObjectURL(url);
        blobUrlsRef.current.delete(url);
      }
    });
  };

  const getFileIcon = (type: string, name: string) => {
    if (type.startsWith('image/')) return <Image className="h-4 w-4" />;
    if (type === 'application/pdf') return <FileText className="h-4 w-4" />;
    if (type.includes('spreadsheet') || name.endsWith('.xlsx') || name.endsWith('.xls')) 
      return <FileText className="h-4 w-4 text-green-600" />;
    if (type.includes('document') || name.endsWith('.docx') || name.endsWith('.doc')) 
      return <FileText className="h-4 w-4 text-blue-600" />;
    return <FileText className="h-4 w-4" />;
  };

  const sendToGemini = async (text: string) => {
    console.log('🔥 sendToGemini called with:', text);
    
    if (!text.trim() && uploadedFiles.length === 0) {
      console.log('❌ No text or files to send');
      return;
    }

    // Check if API key is loaded and not a placeholder
    const isGeminiConfigured = geminiApiKey && 
      geminiApiKey.trim() !== '' && 
      !geminiApiKey.includes('YOUR_') && 
      !geminiApiKey.includes('_HERE');
    const isOpenRouterConfigured = hasOpenRouterApiKey('chatbot');
    const isApiKeyConfigured = isGeminiConfigured || isOpenRouterConfigured;
    
    if (!isApiKeyConfigured) {
      console.error('❌ No API key configured properly');
      toast({
        title: "⚠️ API Key Missing",
        description: `Please add ${getOpenRouterApiKeyName('chatbot')} or VITE_GEMINI_API_KEY to the .env file to use the chatbot.`,
        variant: "destructive"
      });
      return;
    }

    const currentFiles = [...uploadedFiles];
    const userMsg = text.trim() || (currentFiles.length > 0 ? "Please analyze the uploaded file(s) and provide detailed insights about plant health, diseases, or agricultural information." : "");
    
    console.log('✅ Starting sendToGemini with:', { userMsg, fileCount: currentFiles.length, apiKey: geminiApiKey.slice(0, 10) + '...' });
    
    setMessages(prev => [...prev, { role: "user", content: userMsg, files: currentFiles }]);
    setInput("");
    setUploadedFiles([]); // Clear files after sending
    
    // Clean up old blob URLs after sending
    setTimeout(() => cleanupBlobUrls(), 1000);
    setIsLoading(true);

    const getLoadingMessage = (lang: Language) => {
      const messages = {
        en: "Hmm... thinking...",
        hi: "हम्म... सोच रहा हूं...",
        ta: "ம்ம்... யோசிக்கிறேன்...",
        ml: "ഹ്മ്മ്... ചിന്തിക്കുന്നു...",
        mr: "हम्म... विचार करत आहे...",
        te: "హమ్మ్... ఆలోచిస్తున్నాను..."
      };
      return messages[lang] || messages.en;
    };

    // Add loading message
    const loadingMsg = { role: "assistant" as const, content: getLoadingMessage(selectedLanguage), isStreaming: true };
    setMessages(prev => [...prev, loadingMsg]);

    try {
      // Don't use AbortController for now to isolate the issue
      console.log('🔄 Starting request without AbortController');

      // Build conversation history properly
      console.log('📜 Building conversation from messages:', messages.length);
      
      // Get recent conversation history (excluding loading messages) - limit to last 6 messages to prevent token overflow
      const recentMessages = messages.filter(m => !m.isStreaming).slice(-6); // Get last 6 non-loading messages
      const conversationHistory = recentMessages.map(m => ({
        role: m.role === "user" ? "user" : "model",
        parts: [{ text: m.content }]
      }));
      
      // Build current message with file content
      const messageParts: GeminiMessagePart[] = [{ text: userMsg }];
      
      // Add file content to the message
      if (currentFiles.length > 0) {
        console.log('📎 Adding file content to message:', currentFiles.length, 'files');
        
        for (const file of currentFiles) {
          console.log(`Processing file: ${file.name}, type: ${file.type}, hasContent: ${!!file.content}`);
          
          if (file.type.startsWith('image/') && file.content) {
            // For images, add both text instruction and image data
            messageParts[0].text += `\n\n[Image uploaded: ${file.name} - Please analyze this image for plant health, diseases, pests, or any issues you can identify]`;
            
            // Add the image data in Gemini format
            const base64Data = file.content.split(',')[1]; // Remove data URL prefix
            if (base64Data) {
              messageParts.push({
                inline_data: {
                  mime_type: file.type,
                  data: base64Data
                }
              });
              console.log(`📷 Added image with data: ${file.name} (${file.type}), data length: ${base64Data.length}`);
            } else {
              console.warn(`❌ Failed to extract base64 data from image: ${file.name}`);
            }
          } else if (file.content && (file.type === 'text/plain' || file.type.includes('text'))) {
            // For text files, include the actual content
            messageParts[0].text += `\n\nFile: ${file.name}\nContent:\n${file.content}`;
            console.log(`📄 Added text file content: ${file.name}, length: ${file.content.length}`);
          } else {
            // For other files, include metadata and ask for analysis
            messageParts[0].text += `\n\nAttached file: ${file.name} (${file.type}, ${(file.size / 1024 / 1024).toFixed(2)} MB)\nPlease provide relevant advice about this type of agricultural document.`;
            console.log(`📋 Added file metadata: ${file.name}`);
          }
        }
      }
      
      const currentMessage = { 
        role: "user", 
        parts: messageParts
      };
      console.log('💭 Current message with files:', currentMessage);

      const getInitialResponse = (lang: Language) => {
        const responses = {
          en: "Hi, I'm Flora! Your Plant Assistant!",
          hi: "नमस्ते, मैं फ्लोरा हूं! आपका पौधा सहायक!",
          ta: "வணக்கம், நான் ఫ్లోరా! உங்கள் தாவர உதவியाளர்!",
          ml: "ഹലോ, ഞാൻ ഫ്ലോറയാണ്! നിങ്ങളുടെ സസ്യ സഹായി!",
          mr: "नमस्कार, मी फ्लोরा आहे! तुमचा वनस्पती सहाय्यक!",
          te: "హలో, నేను ఫ్ల్లోরాని! మీ మొక్క సహాయకుడు!"
        };
        return responses[lang] || responses.en;
      };

      // Build conversation properly - only include system prompt for first message
      let fullConversation;
      
      if (messages.filter(m => !m.isStreaming).length === 0) {
        // First message - include system prompt
        fullConversation = [
          { role: "user", parts: [{ text: systemPrompt }] },
          { role: "model", parts: [{ text: getInitialResponse(selectedLanguage) }] },
          currentMessage
        ];
      } else {
        // Subsequent messages - use conversation history without system prompt
        fullConversation = [
          ...conversationHistory,
          currentMessage
        ];
      }

      const requestBody = {
        contents: fullConversation,
        generationConfig: {
          temperature: 0.7, // Slightly lower for more consistent responses
          topK: 40, // Higher for better quality
          topP: 0.95, // Higher for more diverse responses
          maxOutputTokens: 2048, // Increased limit to prevent truncation
        }
      };

      console.log('Sending request to Gemini:', {
        url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey.slice(0, 10)}...`,
        body: requestBody
      });

      console.log('🌐 Making fetch request...');
      console.log('🔗 URL:', `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey.slice(0, 20)}...`);
      console.log('📦 Request body:', JSON.stringify(requestBody, null, 2));
      
      // Add a simple timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        console.log('⏰ Request timeout after 15 seconds');
        controller.abort();
      }, 15000);
      
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${geminiApiKey}`,
        {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          body: JSON.stringify(requestBody),
          signal: controller.signal,
        }
      );
      
      clearTimeout(timeoutId);
      console.log('⏰ Timeout cleared');
      
      console.log('📡 Fetch completed, status:', res.status, 'statusText:', res.statusText);
      console.log('📋 Response headers:', Object.fromEntries(res.headers.entries()));

      if (!res.ok) {
        const errorText = await res.text();
        console.error('API Response Error:', {
          status: res.status,
          statusText: res.statusText,
          body: errorText
        });
        throw new Error(`API Error ${res.status}: ${res.statusText} - ${errorText}`);
      }

      console.log('📄 Parsing JSON response...');
      const data = await res.json();
      console.log('✅ API Response:', data);
      
      if (!data.candidates || !Array.isArray(data.candidates) || data.candidates.length === 0) {
        console.error('Invalid API response structure - no candidates array:', data);
        throw new Error('Invalid response from API - no candidates array');
      }

      const candidate = data.candidates[0];
      console.log('🎯 First candidate:', candidate);
      
      if (!candidate) {
        console.error('Invalid candidate - candidate is null/undefined:', candidate);
        throw new Error('Invalid response from API - candidate is null');
      }

      // Handle different response structures - Gemini 2.5 Pro may have different formats
      let aiResponse = "";
      
      // Check if the response was truncated due to max tokens
      if (candidate.finishReason === "MAX_TOKENS") {
        console.warn('Response was truncated due to MAX_TOKENS limit');
        aiResponse = "I was generating a response but reached my limit. Let me try to give you a shorter answer: ";
      }
      
      // Try different ways to extract text from the response
      if (candidate.content && candidate.content.parts && Array.isArray(candidate.content.parts)) {
        // Standard Gemini format
        for (const part of candidate.content.parts) {
          if (part.text) {
            aiResponse += part.text;
          }
        }
      } else if (candidate.text) {
        // Direct text format
        aiResponse = candidate.text;
      } else if (candidate.content && typeof candidate.content === 'string') {
        // Content as string
        aiResponse = candidate.content;
      } else if (candidate.parts && Array.isArray(candidate.parts)) {
        // Alternative parts format
        for (const part of candidate.parts) {
          if (part.text) {
            aiResponse += part.text;
          }
        }
      } else {
        console.error('Unable to extract text from candidate:', candidate);
        console.error('Candidate structure:', JSON.stringify(candidate, null, 2));
        throw new Error('Invalid response from API - cannot extract text content');
      }
      
      if (!aiResponse || aiResponse.trim().length === 0) {
        console.warn('Empty response from API, using fallback message');
        aiResponse = "I received your message but couldn't generate a complete response. Please try asking a more specific question or try again!";
      }
      
      const cleaned = cleanResponse(aiResponse);
      console.log('🧹 Cleaned response:', cleaned);

      // Remove loading message and add response
      console.log('💬 Updating messages...');
      setMessages(prev => {
        const withoutLoading = prev.filter(m => !m.isStreaming);
        const newMessages = [
          ...withoutLoading,
          { role: "assistant" as const, content: cleaned }
        ];
        console.log('📝 New messages array:', newMessages);
        return newMessages;
      });

      // Voice response in selected language
      console.log('🔊 Scheduling voice response...');
      setTimeout(() => {
        console.log('🗣️ Calling speakText with:', { text: cleaned.slice(0, 50) + '...', language: selectedLanguage });
        speakText(cleaned, selectedLanguage);
      }, 100);

    } catch (err) {
      // Don't show error message for aborted requests (user canceled)
      if (err instanceof Error && err.name === 'AbortError') {
        setMessages(prev => prev.filter(m => !m.isStreaming));
        return;
      }
      
      console.error('Gemini API error:', err);
      console.error('Error details:', {
        name: err instanceof Error ? err.name : 'Unknown',
        message: err instanceof Error ? err.message : String(err),
        stack: err instanceof Error ? err.stack : undefined
      });
      
      const getApiErrorMessage = (lang: Language) => {
        const messages = {
          en: "Oops! I have a small problem. Let's talk again in a few minutes!",
          hi: "अरे! मुझे थोड़ी परेशानी है। कुछ मिनट बाद फिर बात करते हैं!",
          ta: "அய்யோ! எनக்கு கொஞ்சம் பிரச்சனை. சில நிமிடம் கழித்து மீண்டும் பேசলாம்!",
          ml: "അയ്യോ! എനിക്ക് ഒരു ചെറിയ പ്രശ്നമുണ്ട്. കുറച്ച് മിനിറ്റുകൾക്ക് ശേഷം വീണ്ടും സംസാരിക്കാം!",
          mr: "अरे! मला थोडी अडचण आहे. काही मिनिटांनी पुन्हा बोलूया!",
          te: "అయ్యో! నాకు కొంచెం సమस్య ఉంది. కొన్ని నిమిషాల తర్వాత మళ్లీ మాట్లాడుకుందాం!"
        };
        return messages[lang] || messages.en;
      };
      const errorMsg = { role: "assistant" as const, content: getApiErrorMessage(selectedLanguage) };
      setMessages(prev => prev.filter(m => !m.isStreaming).concat(errorMsg));
      if (autoPlay) speakText(errorMsg.content);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = () => {
    console.log('🚀 handleSend called with:', { input, isLoading, uploadedFiles: uploadedFiles.length });
    if (!isLoading && (input.trim() || uploadedFiles.length > 0)) {
      console.log('✅ Calling sendToGemini...');
      sendToGemini(input);
    } else {
      console.log('❌ Not sending - conditions not met');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      // Update recognition language before starting
      if (recognitionRef.current) {
        const langConfig = LANGUAGES.find(l => l.code === selectedLanguage);
        recognitionRef.current.lang = langConfig?.speechLang || 'en-IN';
      }
      recognitionRef.current?.start();
    }
  };

  const toggleAutoPlay = () => {
    if (!autoPlay) {
      stopSpeaking();
    }
    setAutoPlay(!autoPlay);
  };

  return (
    <div className="fixed inset-0 z-50 bg-background">
      {/* Header Controls */}
      <div className="fixed top-4 left-4 right-4 z-60 flex justify-between items-center">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          className="bg-background/80 backdrop-blur-sm border border-border shadow-lg hover:bg-accent"
        >
          <X className="h-5 w-5" />
        </Button>
        
        {/* Voice Control */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleAutoPlay}
          className={`bg-background/80 backdrop-blur-sm border border-border shadow-lg hover:bg-accent ${
            isSpeaking ? 'bg-primary/20 animate-pulse' : ''
          }`}
          title={isSpeaking ? 'Flora is speaking...' : autoPlay ? 'Voice enabled' : 'Voice disabled'}
        >
          {isSpeaking ? (
            <Volume2 className="h-5 w-5 text-primary animate-pulse" />
          ) : autoPlay ? (
            <Volume2 className="h-5 w-5" />
          ) : (
            <VolumeX className="h-5 w-5" />
          )}
        </Button>
      </div>

      {/* 3D Spline Element */}
      <div className={`w-full h-full transition-all duration-500 ${
        isSpeaking ? "scale-[1.02] brightness-110" : "scale-100"
      }`}>
        <Spline scene="https://prod.spline.design/lkq8dyM-rny5J147/scene.splinecode" />
      </div>

      {/* Overlay Chat UI */}
      <div className="pointer-events-none absolute inset-0 flex items-end justify-center p-4 md:p-8 pt-20">
        <div className="pointer-events-auto w-full max-w-2xl">
          <div className="rounded-2xl border border-border bg-background/80 backdrop-blur-md shadow-xl">

            {/* Messages */}
            <div className="max-h-[50vh] overflow-y-auto p-4 space-y-3">
              {messages.length === 0 ? (
                <div className="text-center text-sm text-muted-foreground py-8">
                  <div className="mb-3 text-4xl">🌿</div>
                  <div className="font-medium text-lg text-foreground">
                    {(() => {
                      const greetings = {
                        en: "Hi! I'm Flora",
                        hi: "नमस्ते! मैं फ्लोरा हूं",
                        ta: "வணக்கம்! நான் ஃப்ளோரா",
                        ml: "ഹലോ! ഞാൻ ഫ്ലോറയാണ്",
                        mr: "नमस्कार! मी फ्लोरा आहे",
                        te: "హలో! నేను ఫ్లోరాని"
                      };
                      return greetings[selectedLanguage] || greetings.en;
                    })()}
                  </div>
                  <div className="text-sm mt-2">
                    {(() => {
                      const descriptions = {
                        en: "Your AI Plant Assistant",
                        hi: "आपका AI पौधा सहायक",
                        ta: "உங்கள் AI தாவர உதவியாளர்",
                        ml: "നിങ്ങളുടെ AI സസ്യ സഹായി",
                        mr: "तुमचा AI वनस्पती सहाय्यक",
                        te: "మీ AI మొక్క సహాయకుడు"
                      };
                      return descriptions[selectedLanguage] || descriptions.en;
                    })()}
                  </div>
                  <div className="text-xs mt-1 opacity-70">
                    {(() => {
                      const features = {
                        en: "Plant Care • Disease Detection • File Analysis",
                        hi: "पौधे की देखभाल • रोग निदान • फ़ाइल विश्लेषण",
                        ta: "தாவர பராமরिप்பு • நோय் கண்டறිதல் • கோப्पு ವিश्लேషణ",
                        ml: "സസ്യ പരിചരണം • രോഗ നിർണയം • ഫയൽ വിശകലനം",
                        mr: "वनस्पती काळजी • रोग ओळख • फाइल विश्लेषण",
                        te: "మొక్క సంరక్షణ • వ్యాధి గుర్తింపు • ఫైలు విశ్లేషణ"
                      };
                      return features[selectedLanguage] || features.en;
                    })()}
                  </div>
                </div>
              ) : (
                messages.map((m, idx) => (
                  <div key={idx} className={m.role === "user" ? "text-right" : "text-left"}>
                    <div className="inline-block max-w-[85%]">
                      {/* Show attached files for user messages */}
                      {m.role === "user" && m.files && m.files.length > 0 && (
                        <div className="mb-2 flex flex-wrap gap-1 justify-end">
                          {m.files.map((file) => (
                            <div key={file.id} className="flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded-lg text-xs">
                              {getFileIcon(file.type, file.name)}
                              <span className="max-w-20 truncate">{file.name}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      <div
                        className={
                          "rounded-xl px-4 py-2 text-sm " +
                          (m.role === "user"
                            ? "bg-primary text-primary-foreground"
                            : m.isStreaming
                            ? "bg-muted/50 text-muted-foreground animate-pulse"
                            : "bg-accent/50 text-accent-foreground border border-border")
                        }
                        dir={(() => {
                          // Set text direction based on language
                          const rtlLanguages = ['ar', 'he'];
                          return rtlLanguages.includes(m.lang || selectedLanguage) ? 'rtl' : 'ltr';
                        })()}
                      >
                        {m.content}
                      </div>

                      {/* Show image previews for user messages */}
                      {m.role === "user" && m.files && (
                        <div className="mt-2 flex flex-wrap gap-2 justify-end">
                          {m.files
                            .filter(f => f.type.startsWith('image/') && f.url)
                            .map((file) => (
                              <img
                                key={file.id}
                                src={file.url}
                                alt={file.name}
                                className="max-w-32 max-h-32 rounded-lg object-cover border border-border"
                                onError={(e) => {
                                  // Hide broken images instead of showing error
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
                            ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* File Upload Area */}
            {uploadedFiles.length > 0 && (
              <div className="border-t border-border p-3 bg-accent/5">
                <div className="flex flex-wrap gap-2 mb-2">
                  <span className="text-xs text-muted-foreground font-medium">Attached files:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {uploadedFiles.map((file) => (
                    <Badge key={file.id} variant="secondary" className="flex items-center gap-2 px-3 py-1">
                      {getFileIcon(file.type, file.name)}
                      <span className="text-xs max-w-24 truncate">{file.name}</span>
                      <button
                        onClick={() => removeFile(file.id)}
                        className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
                        title="Remove file"
                      >
                        <Trash2 className="h-3 w-3 text-destructive" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Input Controls */}
            <div className="flex items-center gap-2 border-t border-border p-3">
              {/* Hidden File Input */}
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
                onChange={handleFileSelect}
                className="hidden"
              />
              
              {/* File Upload Button */}
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-full hover:bg-accent"
                title="Attach files (Images, PDF, Word, Excel, Text)"
                onClick={handleFileUpload}
              >
                <Plus className="h-4 w-4" />
              </Button>
              
              {/* Language Selector */}
              <Select 
                value={selectedLanguage} 
                onValueChange={(value: Language) => {
                  setLanguageChanging(true);
                  setSelectedLanguage(value);
                  setTimeout(() => setLanguageChanging(false), 300);
                }}
              >
                <SelectTrigger className={`w-auto h-10 px-3 rounded-full border-border hover:bg-accent transition-all duration-200 ${
                  languageChanging ? 'scale-105 bg-primary/10' : ''
                }`}>
                  <Globe className={`h-4 w-4 mr-1 transition-colors ${
                    languageChanging ? 'text-primary' : 'text-muted-foreground'
                  }`} />
                  <span className="text-sm font-medium">
                    {LANGUAGES.find(l => l.code === selectedLanguage)?.nativeName}
                  </span>
                </SelectTrigger>
                <SelectContent align="start" className="w-48">
                  {LANGUAGES.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code} className="cursor-pointer">
                      <div className="flex items-center justify-between w-full">
                        <span className="font-medium">{lang.nativeName}</span>
                        <span className="text-xs text-muted-foreground ml-2">{lang.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="flex-1 relative">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={(() => {
                    if (uploadedFiles.length > 0) {
                      const filePlaceholders = {
                        en: "Ask me about the uploaded files... 📄",
                        hi: "अपलोड की गई फ़ाइलों के बारे में पूछें... 📄",
                        ta: "பதিவேற்றப்பட்ட கோப்புகளைப் பற்றி கேளுங்கள்... 📄",
                        ml: "അപ്‌ലോഡ് ചെയ്ত ഫയലുകളെക്കുറിച്ച് ചോദിക്കൂ... 📄",
                        mr: "अपलोड केलेल्या फाइलांबद्दल विचारा... 📄",
                        te: "అప్‌లోడ్ చేసిన ఫైళ్ల గురించి అడగండి... 📄"
                      };
                      return filePlaceholders[selectedLanguage] || filePlaceholders.en;
                    } else {
                      const placeholders = {
                        en: "Ask me about your plants... 🌿",
                        hi: "अपने पौधों के बारे में पूछें... 🌿",
                        ta: "உங்கள் தாவرங்களைப் பற्றी கேளுங্கள্... 🌿",
                        ml: "നിങ്ങളുടെ ചെടികളെക്കുറിച്ച് ചോদിക്കൂ... 🌿",
                        mr: "आपল्या वनस्पतींবद्दल विचारा... 🌿",
                        te: "మీ మొక్కల గురించి అడగండి... 🌿"
                      };
                      return placeholders[selectedLanguage] || placeholders.en;
                    }
                  })()}
                  className="w-full rounded-full border border-input bg-background px-4 py-2 pr-12 text-sm outline-none focus:ring-2 focus:ring-primary"
                  disabled={isLoading}
                />
                {recognitionRef.current && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full"
                    onClick={toggleListening}
                    disabled={isLoading}
                    title={`${isListening ? "Stop listening" : "Voice input"} (${LANGUAGES.find(l => l.code === selectedLanguage)?.nativeName})`}
                  >
                    {isListening ? (
                      <MicOff className="h-4 w-4 text-red-500 animate-pulse" />
                    ) : (
                      <Mic className="h-4 w-4 text-muted-foreground hover:text-primary" />
                    )}
                  </Button>
                )}
              </div>

              <Button
                type="button"
                onClick={handleSend}
                disabled={(!input.trim() && uploadedFiles.length === 0) || isLoading}
                className="h-10 w-10 rounded-full p-0"
                title="Send message"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}