import { useState, useRef, useEffect } from "react";
import axios from "axios";

export default function AiAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "bot",
      text: "👋 Hi! I'm your Student Finance Assistant. I can help you manage incomes, expenses, dues, and planning your day. What would you like to do today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const messagesEndRef = useRef(null);
  const speechSynthesisRef = useRef(null);

  const token = localStorage.getItem("token");

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Safe voice synthesis
  const speak = (text) => {
    try {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        setIsSpeaking(true);

        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);

        speechSynthesisRef.current = utterance;
        window.speechSynthesis.speak(utterance);
      }
    } catch (err) {
      console.warn("Speech synthesis failed:", err);
      setIsSpeaking(false);
    }
  };

  const stopSpeaking = () => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  // --- Bot reply logic ---
  const getBotReply = async (input) => {
    let reply = "🤔 Mr. Christian do not training to do that?";
    const lower = input.toLowerCase();

    if (lower.includes("expense") || lower.includes("spend")) {
      reply =
        "💸 You can add expenses from the Expenses page. Don't forget to stay within your budget!";
    } else if (lower.includes("income") || lower.includes("money")) {
      reply =
        "💰 You can add income from the Income page. Would you like me to guide you there?";
    } else if (lower.includes("due") || lower.includes("dues") || lower.includes("sug")) {
      reply =
        "🏫 You can quickly pay SUG, CSIT, or Tribal dues from your Dashboard shortcuts.";
    } else if (lower.includes("plan") || lower.includes("today") || lower.includes("schedule")) {
      reply =
        "📅 What's your main financial goal for today? Saving or tracking expenses?";
    } else if (lower.includes("hello") || lower.includes("hi") || lower.includes("hey")) {
      reply = "Hello! How can I help you with your finances today?";
    }

    // Budget check with backend
    else if (lower.includes("budget") || lower.includes("limit") || lower.includes("remaining")) {
      try {
        const budgetRes = await axios.get("http://localhost:5000/api/budgets", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const budget = budgetRes.data;
        if (!budget) {
          reply = "⚠️ You don’t have an active budget yet. Would you like to create one?";
        } else {
          const expenseRes = await axios.get("http://localhost:5000/api/expenses/total", {
            headers: { Authorization: `Bearer ${token}` },
          });

          const spent = expenseRes.data.total || 0;
          const percent = ((spent / budget.amount) * 100).toFixed(1);
          const remaining = budget.amount - spent;

          if (percent < 70) {
            reply = `✅ You’ve used ${percent}% of your ${budget.type} budget. Remaining: ₦${remaining}.`;
          } else if (percent >= 70 && percent < 80) {
            reply = `🔔 You’ve used 70% of your ${budget.type} budget. Remaining: ₦${remaining}.`;
          } else if (percent >= 80 && percent < 90) {
            reply = `⚠️ Careful! You’ve used 80% of your ${budget.type} budget. Remaining: ₦${remaining}.`;
          } else if (percent >= 90 && percent < 100) {
            reply = `🚨 Warning! You’ve used 90% of your ${budget.type} budget. Remaining: ₦${remaining}.`;
          } else if (percent >= 100) {
            reply = `❌ You’ve exceeded your ${budget.type} budget by ₦${Math.abs(
              remaining
            )}. Please review your spending.`;
          }
        }
      } catch (err) {
        console.error("Budget fetch error:", err);
        reply = "⚠️ I couldn’t fetch your budget details right now.";
      }
    }

    return reply;
  };

  // Handle user sending a message
  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = { id: Date.now(), sender: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);

    const reply = await getBotReply(input);

    setTimeout(() => {
      const botMsg = { id: Date.now(), sender: "bot", text: reply };
      setMessages((prev) => [...prev, botMsg]);
      speak(reply);
    }, 500);

    setInput("");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleSend();
  };

  // --- Icons ---
  const MessageCircleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
  );
  const XIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
  );
  const SendIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
  );
  const Volume2Icon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
  );
  const VolumeXIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>
  );

  return (
    <div>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-all duration-300 z-50"
        >
          <MessageCircleIcon />
        </button>
      )}

      {isOpen && (
        <div className="fixed bottom-6 right-6 w-80 bg-white shadow-xl rounded-xl flex flex-col border border-gray-200 z-50">
          <div className="flex justify-between items-center p-4 bg-blue-600 text-white rounded-t-xl">
            <h3 className="font-bold text-lg">AI Finance Assistant</h3>
            <div className="flex items-center gap-2">
              <button
                onClick={isSpeaking ? stopSpeaking : () => speak(messages[messages.length - 1].text)}
                className="p-1 rounded-full hover:bg-blue-500 transition-colors"
              >
                {isSpeaking ? <VolumeXIcon /> : <Volume2Icon />}
              </button>
              <button
                onClick={() => {
                  stopSpeaking();
                  setIsOpen(false);
                }}
                className="p-1 rounded-full hover:bg-blue-500 transition-colors"
              >
                <XIcon />
              </button>
            </div>
          </div>

          <div className="flex-1 p-4 overflow-y-auto space-y-3 max-h-80">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`p-3 rounded-lg text-sm max-w-[85%] ${
                  msg.sender === "user" ? "bg-blue-100 ml-auto" : "bg-gray-100 mr-auto"
                }`}
              >
                {msg.text}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-3 border-t flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Ask me anything..."
            />
            <button
              onClick={handleSend}
              disabled={!input.trim()}
              className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <SendIcon />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
