'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { HeroSectionCompact } from '@/components/autovault/hero-section';
import { useSmartVault } from '@/hooks/use-smart-vault';
import { useGoals } from '@/hooks/use-goals';
import { useDCA } from '@/hooks/use-dca';
import { motion, AnimatePresence } from 'motion/react';
import { Bot, Send, Sparkles, User, Loader2, Wallet, Target, TrendingUp, MessageSquare } from 'lucide-react';
import { formatEther } from 'viem';
import { QUICK_PROMPTS, type ChatMessage, type FinancialContext } from '@/lib/ai/cerebras';

export default function AdvisorPage() {
    const { buckets, formattedTotalBalance } = useSmartVault();
    const { goals } = useGoals();
    const { strategies } = useDCA();

    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Build financial context for AI
    const context: FinancialContext = {
        totalBalance: formattedTotalBalance,
        buckets: buckets.filter(b => b.isActive).map(b => ({
            name: b.name,
            balance: parseFloat(formatEther(b.balance)).toFixed(2),
            percentage: b.targetPercentage,
        })),
        goals: goals.filter(g => !g.isWithdrawn).map(g => ({
            name: g.name,
            current: parseFloat(formatEther(g.currentAmount)).toFixed(2),
            target: parseFloat(formatEther(g.targetAmount)).toFixed(2),
            progress: g.progressPercent,
        })),
        dcaStrategies: strategies.filter(s => s.isActive).map(s => ({
            token: s.tokenOut.slice(0, 10) + '...',
            amount: parseFloat(formatEther(s.amountPerInterval)).toFixed(2),
            frequency: s.intervalSeconds === 86400 ? 'Daily' : s.intervalSeconds === 604800 ? 'Weekly' : 'Monthly',
        })),
    };

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const sendMessage = async (content: string) => {
        if (!content.trim() || isLoading) return;

        const userMessage: ChatMessage = { role: 'user', content };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await fetch('/api/ai', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: [...messages, userMessage], context }),
            });

            const data = await response.json();
            if (data.error) throw new Error(data.error);

            const assistantMessage: ChatMessage = { role: 'assistant', content: data.response };
            setMessages(prev => [...prev, assistantMessage]);
        } catch (error) {
            const errorMessage: ChatMessage = {
                role: 'assistant',
                content: 'Sorry, I encountered an error. Please try again.',
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        sendMessage(input);
    };

    const activeBuckets = buckets.filter(b => b.isActive).length;
    const activeGoals = goals.filter(g => !g.isWithdrawn).length;
    const activeStrategies = strategies.filter(s => s.isActive).length;

    return (
        <div className="flex flex-col h-full max-h-[calc(100vh-8rem)]">
            {/* Hero Section */}
            <HeroSectionCompact
                title="AI Financial Advisor"
                subtitle="Get personalized savings advice powered by AI"
                accentColor="ai"
            />

            <div className="grid gap-6 lg:grid-cols-4 flex-1 min-h-0 mt-6">
                {/* Chat Area */}
                <Card className="lg:col-span-3 flex flex-col min-h-0 overflow-hidden">
                    <CardHeader className="border-b bg-gradient-ai px-6 py-4 flex-shrink-0">
                        <CardTitle className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg">
                                <Bot className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <span>Chat with AutoVault AI</span>
                                <p className="text-sm font-normal text-muted-foreground">Your personal financial assistant</p>
                            </div>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col p-0 min-h-0 overflow-hidden">
                        <div className="flex-1 overflow-y-auto p-4" ref={scrollRef}>
                            {messages.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-center py-12">
                                    <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mb-6 shadow-xl">
                                        <Sparkles className="h-10 w-10 text-white" />
                                    </div>
                                    <h3 className="text-xl font-semibold mb-2">Welcome to AutoVault AI</h3>
                                    <p className="text-muted-foreground max-w-md mb-8">
                                        I can help you optimize your savings, analyze your buckets, and provide personalized financial advice.
                                    </p>
                                    <div className="flex flex-wrap gap-2 justify-center max-w-lg">
                                        {QUICK_PROMPTS.map((prompt) => (
                                            <Button
                                                key={prompt.label}
                                                variant="outline"
                                                size="sm"
                                                onClick={() => sendMessage(prompt.prompt)}
                                                className="hover:bg-blue-50 hover:border-blue-300 dark:hover:bg-blue-900/20"
                                            >
                                                <MessageSquare className="h-3 w-3 mr-1.5" />
                                                {prompt.label}
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <ChatMessages messages={messages} isLoading={isLoading} />
                            )}
                        </div>
                        <form onSubmit={handleSubmit} className="p-4 border-t bg-muted/30 flex gap-2 flex-shrink-0">
                            <Input
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Ask about your savings..."
                                disabled={isLoading}
                                className="h-11"
                            />
                            <Button type="submit" disabled={isLoading || !input.trim()} className="h-11 px-4 bg-blue-600 hover:bg-blue-700">
                                <Send className="h-4 w-4" />
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Sidebar */}
                <div className="space-y-4 overflow-y-auto">
                    <ContextCard
                        totalBalance={formattedTotalBalance}
                        activeBuckets={activeBuckets}
                        activeGoals={activeGoals}
                        activeStrategies={activeStrategies}
                    />
                    <QuickActionsCard onSendMessage={sendMessage} isLoading={isLoading} />
                </div>
            </div>
        </div>
    );
}

// Chat Messages Component
function ChatMessages({ messages, isLoading }: { messages: ChatMessage[]; isLoading: boolean }) {
    return (
        <div className="space-y-4">
            <AnimatePresence>
                {messages.map((message, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : ''}`}
                    >
                        {message.role === 'assistant' && (
                            <div className="h-9 w-9 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                                <Bot className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            </div>
                        )}
                        <div
                            className={`rounded-2xl px-4 py-3 max-w-[80%] ${message.role === 'user'
                                ? 'bg-blue-600 text-white'
                                : 'bg-muted'
                                }`}
                        >
                            <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                        </div>
                        {message.role === 'user' && (
                            <div className="h-9 w-9 rounded-xl bg-blue-600 flex items-center justify-center flex-shrink-0">
                                <User className="h-4 w-4 text-white" />
                            </div>
                        )}
                    </motion.div>
                ))}
            </AnimatePresence>
            {isLoading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
                    <div className="h-9 w-9 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                        <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />
                    </div>
                    <div className="bg-muted rounded-2xl px-4 py-3">
                        <p className="text-sm text-muted-foreground">Thinking...</p>
                    </div>
                </motion.div>
            )}
        </div>
    );
}

// Context Card Component
function ContextCard({ totalBalance, activeBuckets, activeGoals, activeStrategies }: {
    totalBalance: string;
    activeBuckets: number;
    activeGoals: number;
    activeStrategies: number;
}) {
    return (
        <Card className="overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-blue-400 to-blue-600" />
            <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-blue-500" />
                    Your Context
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                    <p className="text-xs text-muted-foreground">Total Balance</p>
                    <p className="font-semibold text-lg">${totalBalance}</p>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-2 rounded-lg bg-muted/50">
                        <Wallet className="h-4 w-4 mx-auto mb-1 text-primary" />
                        <p className="font-semibold">{activeBuckets}</p>
                        <p className="text-xs text-muted-foreground">Buckets</p>
                    </div>
                    <div className="p-2 rounded-lg bg-muted/50">
                        <Target className="h-4 w-4 mx-auto mb-1 text-purple-500" />
                        <p className="font-semibold">{activeGoals}</p>
                        <p className="text-xs text-muted-foreground">Goals</p>
                    </div>
                    <div className="p-2 rounded-lg bg-muted/50">
                        <TrendingUp className="h-4 w-4 mx-auto mb-1 text-amber-500" />
                        <p className="font-semibold">{activeStrategies}</p>
                        <p className="text-xs text-muted-foreground">DCA</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

// Quick Actions Card Component
function QuickActionsCard({ onSendMessage, isLoading }: { onSendMessage: (msg: string) => void; isLoading: boolean }) {
    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="text-sm">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
                {QUICK_PROMPTS.map((prompt) => (
                    <Button
                        key={prompt.label}
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start hover:bg-blue-50 dark:hover:bg-blue-900/20"
                        onClick={() => onSendMessage(prompt.prompt)}
                        disabled={isLoading}
                    >
                        <Sparkles className="h-3 w-3 mr-2 text-blue-500" />
                        {prompt.label}
                    </Button>
                ))}
            </CardContent>
        </Card>
    );
}
