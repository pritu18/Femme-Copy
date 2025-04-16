
import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot, Send, X, ChevronDown, ChevronUp } from "lucide-react";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";

// Pre-defined responses for period-related questions
const periodKnowledgeBase = {
  // General period information
  "what is a period": "A menstrual period is the shedding of the uterine lining that occurs approximately every 28 days in women of reproductive age. It's a normal part of the menstrual cycle and typically lasts 3-7 days.",
  "how long do periods last": "Most periods last between 3-7 days, with the heaviest flow usually occurring in the first 1-2 days. However, every woman's cycle is different, and what's normal varies from person to person.",
  "why do periods happen": "Periods are part of the menstrual cycle, which prepares the body for potential pregnancy each month. When pregnancy doesn't occur, the thickened uterine lining is shed through the vagina, resulting in menstrual bleeding.",
  
  // Period symptoms
  "period pain": "Period pain (dysmenorrhea) is caused by uterine contractions and is common. Remedies include heat therapy, over-the-counter pain relievers, gentle exercise, and relaxation techniques. If pain is severe, consult a healthcare provider.",
  "period cramps": "Period cramps are caused by prostaglandins that help the uterus shed its lining. To relieve cramps, try heat therapy (like a heating pad), over-the-counter pain relievers, gentle exercise, staying hydrated, and avoiding caffeine and alcohol.",
  "mood swings": "Mood swings during periods are caused by hormonal fluctuations. Managing them involves regular exercise, adequate sleep, stress reduction techniques, and healthy eating. If mood swings significantly impact your life, consider speaking with a healthcare provider.",
  
  // Period products
  "period products": "Common period products include pads, tampons, menstrual cups, period underwear, and menstrual discs. The best product depends on your flow, comfort level, lifestyle, and personal preference.",
  "menstrual cup": "A menstrual cup is a reusable, bell-shaped silicone cup that collects menstrual blood rather than absorbing it. It can be worn for up to 12 hours, is eco-friendly, and cost-effective over time. There's a learning curve for insertion and removal.",
  
  // Irregular periods
  "irregular periods": "Irregular periods can be caused by stress, weight changes, excessive exercise, hormonal imbalances, PCOS, thyroid issues, or perimenopause. If your periods are consistently irregular, consult a healthcare provider for proper evaluation.",
  "missed period": "Missed periods can be caused by pregnancy, stress, weight changes, hormonal imbalances, excessive exercise, PCOS, thyroid disorders, or perimenopause. If you're sexually active and miss a period, consider taking a pregnancy test.",
  
  // Health concerns
  "heavy bleeding": "Heavy menstrual bleeding (menorrhagia) may indicate fibroids, polyps, hormonal imbalances, or other conditions. If you're soaking through products every hour for several hours, passing large clots, or your period lasts longer than 7 days, consult a healthcare provider.",
  "pms": "Premenstrual syndrome (PMS) includes physical and emotional symptoms that occur before your period. Symptoms can include bloating, breast tenderness, mood swings, and irritability. Management includes regular exercise, stress reduction, and a balanced diet.",
  
  // Nutrition and lifestyle
  "diet during period": "During your period, focus on iron-rich foods (leafy greens, red meat), foods high in omega-3s (salmon, walnuts), fruits, vegetables, whole grains, and plenty of water. Limit caffeine, alcohol, salt, and sugar, which can worsen symptoms.",
  "exercise during period": "Light to moderate exercise during your period can help alleviate cramps and boost mood by releasing endorphins. Good options include walking, swimming, yoga, and stretching. Listen to your body and don't push yourself too hard on heavy flow days.",
  
  // Default responses
  "default": "I'm your period encyclopedia! Ask me about menstrual cycles, period symptoms, management strategies, or any other period-related questions you have."
};

type Message = {
  role: "user" | "bot";
  content: string;
};

const PeriodChatbot = () => {
  const [messages, setMessages] = useState<Message[]>([
    { role: "bot", content: "Hi there! I'm your period encyclopedia. How can I help you today?" }
  ]);
  const [input, setInput] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkScreenWidth = () => {
      setIsMobileView(window.innerWidth < 768);
    };
    
    // Initial check
    checkScreenWidth();
    
    // Add event listener
    window.addEventListener('resize', checkScreenWidth);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkScreenWidth);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const findBestResponse = (query: string): string => {
    // Convert to lowercase for case-insensitive matching
    const normalizedQuery = query.toLowerCase();
    
    // Check for exact matches first
    for (const [key, response] of Object.entries(periodKnowledgeBase)) {
      if (normalizedQuery.includes(key)) {
        return response;
      }
    }
    
    // Check for partial matches (at least 3 characters)
    for (const [key, response] of Object.entries(periodKnowledgeBase)) {
      const keyWords = key.split(" ");
      for (const word of keyWords) {
        if (word.length > 3 && normalizedQuery.includes(word)) {
          return response;
        }
      }
    }
    
    // If no match is found, return the default response
    return periodKnowledgeBase.default;
  };

  const handleSendMessage = () => {
    if (input.trim() === "") return;
    
    // Add user message
    const userMessage: Message = { role: "user", content: input };
    setMessages(prev => [...prev, userMessage]);
    
    // Find appropriate response
    const botResponse = findBestResponse(input.toLowerCase());
    
    // Add bot response with a slight delay to simulate thinking
    setTimeout(() => {
      const botMessage: Message = { role: "bot", content: botResponse };
      setMessages(prev => [...prev, botMessage]);
    }, 700);
    
    // Clear input field
    setInput("");
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  const toggleChatbot = () => {
    setIsOpen(!isOpen);
  };

  const renderMessages = () => (
    <ScrollArea className="h-[350px] pr-4">
      <div className="space-y-4 pt-1 pb-3">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`rounded-lg px-4 py-2 max-w-[85%] ${
                msg.role === "user"
                  ? "bg-femme-pink text-white"
                  : "bg-slate-100 text-femme-burgundy"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
    </ScrollArea>
  );

  const renderChatInput = () => (
    <div className="flex gap-2 mt-2">
      <Input
        placeholder="Ask about periods..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyPress={handleKeyPress}
        className="rounded-full border-femme-taupe"
      />
      <Button
        size="icon"
        className="rounded-full bg-femme-pink hover:bg-femme-burgundy"
        onClick={handleSendMessage}
      >
        <Send className="h-4 w-4" />
      </Button>
    </div>
  );

  // Mobile view using Drawer component
  if (isMobileView) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Drawer open={isOpen} onOpenChange={setIsOpen}>
          <DrawerTrigger asChild>
            <Button 
              className="rounded-full h-14 w-14 bg-femme-pink shadow-lg hover:bg-femme-burgundy"
              onClick={toggleChatbot}
            >
              <Bot className="h-6 w-6" />
            </Button>
          </DrawerTrigger>
          <DrawerContent className="max-h-[85vh]">
            <div className="px-4 py-4">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <Bot className="h-5 w-5 text-femme-pink" />
                  <h3 className="text-lg font-medium text-femme-burgundy">Nirmala</h3>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-femme-burgundy" 
                  onClick={() => setIsOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              {renderMessages()}
              {renderChatInput()}
            </div>
          </DrawerContent>
        </Drawer>
      </div>
    );
  }

  // Desktop view
  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen ? (
        <Card className="w-[350px] shadow-lg border-femme-taupe">
          <CardHeader className="p-4 pb-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-femme-pink" />
                <CardTitle className="text-lg text-femme-burgundy">Nirmala</CardTitle>
              </div>
              <Button variant="ghost" size="icon" onClick={toggleChatbot}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <CardDescription className="text-femme-burgundy/60 text-xs">
              Ask me anything about periods!
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-2">
            {renderMessages()}
          </CardContent>
          <CardFooter className="p-4 pt-0">
            {renderChatInput()}
          </CardFooter>
        </Card>
      ) : (
        <Button
          className="rounded-full h-14 w-14 bg-femme-pink shadow-lg hover:bg-femme-burgundy"
          onClick={toggleChatbot}
        >
          <Bot className="h-6 w-6" />
        </Button>
      )}
    </div>
  );
};

export default PeriodChatbot;

