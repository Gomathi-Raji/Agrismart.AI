import { useNavigate } from "react-router-dom";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

export function FloatingChatbot() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  return (
    <Button
      onClick={() => navigate('/chatbot')}
      className={`fixed right-6 z-50 w-14 h-14 rounded-full ${
        isMobile ? 'bottom-24' : 'bottom-6'
      }`}
      size="icon"
    >
      <MessageCircle className="h-6 w-6" />
    </Button>
  );
}
