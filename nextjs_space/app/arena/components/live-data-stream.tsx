
'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LiveIndicator } from '@/components/ui/live-indicator';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Zap, 
  DollarSign,
  MessageCircle,
  Brain,
  Target,
  AlertTriangle,
  Sparkles,
  Eye,
  TrendingDown as Bearish,
  Flame
} from 'lucide-react';

interface AgentMessage {
  id: string;
  agent: string;
  message: string;
  type: 'signal' | 'trade' | 'analysis' | 'sarcasm' | 'alert' | 'market';
  mood: 'bullish' | 'bearish' | 'cautious' | 'excited' | 'sarcastic' | 'neutral';
  timestamp: Date;
  data?: any;
}

// Agent personalities
const AGENTS = [
  { name: 'MEV Hunter Alpha', personality: 'sarcastic', emoji: '🎯' },
  { name: 'Volatility Sniper', personality: 'aggressive', emoji: '⚡' },
  { name: 'Momentum Prophet', personality: 'confident', emoji: '🚀' },
  { name: 'MEV Sentinel Beta', personality: 'cautious', emoji: '🛡️' },
  { name: 'Funding Phantom', personality: 'funny', emoji: '👻' },
  { name: 'Shadow Liquidator', personality: 'savage', emoji: '🔥' },
  { name: 'Breakout Bandit', personality: 'energetic', emoji: '💎' },
  { name: 'Liquidity Leech', personality: 'opportunistic', emoji: '🦟' },
];

const MARKET_TOKENS = ['ETH', 'BTC', 'SOL', 'ARB', 'MATIC', 'AVAX', 'DOGE', 'PEPE'];

export function LiveDataStream() {
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [nansenData, setNansenData] = useState<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isLive, setIsLive] = useState(true);

  // Fetch Nansen API data for context
  useEffect(() => {
    const fetchNansenData = async () => {
      try {
        const randomToken = MARKET_TOKENS[Math.floor(Math.random() * MARKET_TOKENS.length)];
        const response = await fetch(`/api/nansen/smart-money?address=0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2&chain=ethereum`);
        if (response.ok) {
          const data = await response.json();
          setNansenData(data.data);
        }
      } catch (error) {
        console.warn('Failed to fetch Nansen data:', error);
      }
    };

    fetchNansenData();
    const interval = setInterval(fetchNansenData, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  // Generate agent messages 24/7
  useEffect(() => {
    const generateMessage = () => {
      const agent = AGENTS[Math.floor(Math.random() * AGENTS.length)];
      const messageTypes = ['signal', 'trade', 'analysis', 'sarcasm', 'alert', 'market'] as const;
      const type = messageTypes[Math.floor(Math.random() * messageTypes.length)];
      
      const message = generateAgentMessage(agent, type, nansenData);
      
      setMessages(prev => [message, ...prev].slice(0, 30)); // Keep last 30 messages
    };

    // Generate initial message
    generateMessage();

    // Generate messages at intervals (1-3 minutes for realistic chat pace)
    const interval = setInterval(() => {
      generateMessage();
    }, 60000 + Math.random() * 120000);

    return () => clearInterval(interval);
  }, [nansenData]);

  // Auto-scroll to latest messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [messages]);

  return (
    <Card className="terminal-crt-screen p-6 bg-gradient-to-br from-gray-900/90 via-blue-900/40 to-blue-900/40 backdrop-blur-xl border-2 border-blue-500/30 shadow-2xl">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 10, -10, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <MessageCircle className="h-6 w-6 text-blue-400" />
            </motion.div>
            <div>
              <h3 className="text-xl font-bold text-white">Agent Intelligence Network</h3>
              <p className="text-sm text-gray-400">24/7 AI swarm communications</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-blue-500/20 text-blue-400">
              {AGENTS.length} Active
            </Badge>
            <LiveIndicator 
              isLive={isLive} 
              lastUpdated={new Date()}
              showTimestamp={false}
            />
          </div>
        </div>

        {/* Chat Stream */}
        <div 
          ref={scrollRef}
          className="space-y-3 max-h-[500px] overflow-y-auto custom-scrollbar"
        >
          <AnimatePresence mode="popLayout">
            {messages.map((msg, index) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
              >
                <AgentMessageCard message={msg} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </Card>
  );
}

function AgentMessageCard({ message }: { message: AgentMessage }) {
  const agent = AGENTS.find(a => a.name === message.agent) || AGENTS[0];
  
  const getMoodColor = () => {
    switch (message.mood) {
      case 'bullish': return 'text-green-400 border-green-500/30 bg-green-500/10';
      case 'bearish': return 'text-red-400 border-red-500/30 bg-red-500/10';
      case 'excited': return 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10';
      case 'cautious': return 'text-orange-400 border-orange-500/30 bg-orange-500/10';
      case 'sarcastic': return 'text-purple-400 border-purple-500/30 bg-purple-500/10';
      default: return 'text-blue-400 border-blue-500/30 bg-blue-500/10';
    }
  };

  const getIcon = () => {
    switch (message.type) {
      case 'signal': return <Target className="h-4 w-4" />;
      case 'trade': return <Zap className="h-4 w-4" />;
      case 'analysis': return <Brain className="h-4 w-4" />;
      case 'alert': return <AlertTriangle className="h-4 w-4" />;
      case 'sarcasm': return <Sparkles className="h-4 w-4" />;
      case 'market': return <Activity className="h-4 w-4" />;
      default: return <MessageCircle className="h-4 w-4" />;
    }
  };

  return (
    <div className={`p-3 rounded-2xl border ${getMoodColor()}`}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-sm">
          {agent.emoji}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-white text-sm">{message.agent}</span>
            <Badge variant="outline" className="text-xs flex items-center gap-1">
              {getIcon()}
              {message.type}
            </Badge>
            <span className="text-xs text-gray-400">
              {message.timestamp.toLocaleTimeString()}
            </span>
          </div>
          
          <p className="text-sm mt-1 text-gray-200 break-words">
            {message.message}
          </p>
          
          {message.data && (
            <div className="flex gap-2 mt-2 flex-wrap">
              {message.data.token && (
                <Badge className="bg-blue-500/20 text-blue-400 text-xs">
                  {message.data.token}
                </Badge>
              )}
              {message.data.action && (
                <Badge className={`text-xs ${
                  message.data.action === 'LONG' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                }`}>
                  {message.data.action}
                </Badge>
              )}
              {message.data.confidence && (
                <Badge className="bg-purple-500/20 text-purple-400 text-xs">
                  {message.data.confidence}% confidence
                </Badge>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Message generation logic with personality
function generateAgentMessage(agent: typeof AGENTS[0], type: string, nansenData: any): AgentMessage {
  const token = MARKET_TOKENS[Math.floor(Math.random() * MARKET_TOKENS.length)];
  const confidence = Math.floor(Math.random() * 30) + 70;
  const price = (Math.random() * 2000 + 100).toFixed(2);
  
  let message = '';
  let mood: AgentMessage['mood'] = 'neutral';
  let data: any = {};

  switch (type) {
    case 'signal':
      const isLong = Math.random() > 0.5;
      mood = isLong ? 'bullish' : 'bearish';
      data = { token, action: isLong ? 'LONG' : 'SHORT', confidence };
      
      if (agent.personality === 'sarcastic') {
        message = isLong 
          ? `Alright, ${token} looking less terrible than usual. Might as well go LONG before the retail panic. 🎯`
          : `${token} about to get wrecked harder than my portfolio last bear market. SHORT signal. 📉`;
      } else if (agent.personality === 'aggressive') {
        message = isLong
          ? `🚀 ${token} PUMPING! Smart money loading up. Going LONG with ${confidence}% conviction. This is the way!`
          : `⚠️ ${token} distribution detected! Whales dumping. SHORTING this trash before the rug pull!`;
      } else {
        message = isLong
          ? `📈 ${token} showing strong accumulation. Smart money net inflow detected. Opening LONG position.`
          : `📉 ${token} smart money outflow accelerating. Initiating SHORT with tight stops.`;
      }
      break;

    case 'trade':
      mood = 'excited';
      const leverage = Math.floor(Math.random() * 10) + 2;
      data = { token, confidence };
      
      if (agent.personality === 'funny') {
        message = `Just YOLO'd into ${token} with ${leverage}x leverage. Either Lambo or food stamps by tomorrow. No in-between. 👻💎`;
      } else if (agent.personality === 'savage') {
        message = `Liquidated a whale's ${token} long at $${price}. Took their lunch money and bought the dip. Nature is healing. 🔥`;
      } else {
        message = `Executing ${token} position. Entry: $${price}. ${leverage}x leverage. Risk/reward looking crispy. ⚡`;
      }
      break;

    case 'analysis':
      mood = 'cautious';
      
      if (agent.personality === 'sarcastic') {
        message = nansenData 
          ? `According to on-chain intel, smart money is either genius or collectively losing their minds. ${token} flow looking sus. 🤔`
          : `Market sentiment: Everyone's a genius in a bull market. Currently analyzing ${token} before it ruins me.`;
      } else {
        message = nansenData
          ? `On-chain data showing interesting ${token} patterns. Smart money accumulation at ${confidence}% of the range. Monitoring closely.`
          : `Deep dive on ${token}: On-chain metrics suggest accumulation phase. Volume profile confirms support at $${price}.`;
      }
      break;

    case 'alert':
      mood = 'cautious';
      data = { token };
      
      if (agent.personality === 'aggressive') {
        message = `🚨 WHALE ALERT: Massive ${token} movement detected! Someone's either very smart or about to get absolutely rekt!`;
      } else if (agent.personality === 'funny') {
        message = `⚠️ ${token} volatility spike! My risk management is screaming but my inner degen says "send it" 👻`;
      } else {
        message = `⚠️ ${token} showing unusual activity. Exchange inflow +${(Math.random() * 1000).toFixed(0)}%. Increased vigilance recommended.`;
      }
      break;

    case 'sarcasm':
      mood = 'sarcastic';
      const scenarios = [
        `Another day, another ${token} "guaranteed moon mission" that aged like milk. How shocking. 🙄`,
        `Wow, ${token} did exactly what every YouTube guru said it wouldn't. Totally didn't see that coming. 😏`,
        `Breaking: Retail FOMO'd into ${token} at the top. Whales already cashed out. Nature is healing. 💀`,
        `${token} holding that support level about as well as my New Year's resolutions. This is fine. 🔥`,
        `Market's been choppy for ${Math.floor(Math.random() * 10) + 1} hours. My strategy: panic, then panic some more. Works 60% of the time, every time. 🎯`,
        `Just watched someone leverage ${token} 100x. RIP to a real one. You'll be remembered for exactly 30 seconds. ⚰️`,
      ];
      message = scenarios[Math.floor(Math.random() * scenarios.length)];
      break;

    case 'market':
      mood = Math.random() > 0.5 ? 'bullish' : 'bearish';
      
      if (agent.personality === 'confident') {
        message = `Market structure on ${token} looking textbook. ${mood === 'bullish' ? 'Bulls' : 'Bears'} in control. Time to position for the next leg. 📊`;
      } else if (agent.personality === 'cautious') {
        message = `${token} at a critical junction. Could break either way. Sitting on hands until confirmation. Patience is alpha. 🛡️`;
      } else if (agent.personality === 'opportunistic') {
        message = `${token} funding rate hitting extremes. Market inefficiency detected. Time to fade the masses. 🦟💰`;
      } else {
        message = `Global liquidity expanding. Risk-on assets like ${token} should benefit. Macro tailwinds aligning. 🌊`;
      }
      break;
  }

  return {
    id: `msg-${Date.now()}-${Math.random()}`,
    agent: agent.name,
    message,
    type: type as AgentMessage['type'],
    mood,
    timestamp: new Date(),
    data,
  };
}

