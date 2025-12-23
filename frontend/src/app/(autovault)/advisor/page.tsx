'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useSmartVault } from '@/hooks/use-smart-vault';
import { useGoals } from '@/hooks/use-goals';
import { useDCA } from '@/hooks/use-dca';
import { motion, AnimatePresence } from 'motion/react';
import { Bot, Send, Sparkles, User, Loader2 } from 'lucide-react';
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
                body: JSON.stringify({
                    messages: [...messages, userMessage],
                    context,
                }),
            });

            const data = await response.json();

            if (data.error) {
                throw new Error(data.error);
            }

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

    return (
        <div className="space-y-6 h-[calc(100vh-12rem)]">
            <div>
                <h1 className="text-3xl font-bold">AI Financial Advisor</h1>
                <p className="text-muted-foreground">Get personalized savings advice powered by AI</p>
            </div>

            <div className="grid gap-6 lg:grid-cols-4 h-[calc(100%-5rem)]">
                <Card className="lg:col-span-3 flex flex-col">
                    <CardHeader className="border-b">
                        <CardTitle className="flex items-center gap-2">
                            <Bot className="h-5 w-5 text-primary" />
                            Chat with AutoVault AI
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col p-0">
                        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
                            {messages.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-center py-12">
                                    <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center mb-4">
                                        <Sparkles className="h-8 w-8 text-white" />
                                    </div>
                                    <h3 className="text-lg font-semibold mb-2">Welcome to AutoVault AI</h3>
                                    <p className="text-muted-foreground max-w-md mb-6">
                                        I can help you optimize your savings, analyze your buckets, and provide personalized financial advice.
                                    </p>
                                    <div className="flex flex-wrap gap-2 justify-center">
                                        {QUICK_PROMPTS.map((prompt) => (
                                            <Button
                                                key={prompt.label}
                                                variant="outline"
                                                size="sm"
                                                onClick={() => sendMessage(prompt.prompt)}
                                            >
                                                {prompt.label}
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                            ) : (
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
                                                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                                        <Bot className="h-4 w-4 text-primary" />
                                                    </div>
                                                )}
                                                <div
                                                    className={`rounded-lg px-4 py-2 max-w-[80%] ${message.role === 'user'
                                                            ? 'bg-primary text-primary-foreground'
                                                            : 'bg-muted'
                                                        }`}
                                                >
                                                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                                                </div>
                                                {message.role === 'user' && (
                                                    <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                                                        <User className="h-4 w-4 text-primary-foreground" />
                                                    </div>
                                                )}
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                    {isLoading && (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="flex gap-3"
                                        >
                                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                                <Loader2 className="h-4 w-4 text-primary animate-spin" />
                                            </div>
                                            <div className="bg-muted rounded-lg px-4 py-2">
                                                <p className="text-sm text-muted-foreground">Thinking...</p>
                                            </div>
                                        </motion.div>
                                    )}
                                </div>
                            )}
                        </ScrollArea>
                        <form onSubmit={handleSubmit} className="p-4 border-t flex gap-2">
                            <Input
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Ask about your savings..."
                                disabled={isLoading}
                            />
                            <Button type="submit" disabled={isLoading || !input.trim()}>
                                <Send className="h-4 w-4" />
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                <div className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm">Your Context</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm">
                            <div>
                                <p className="text-muted-foreground">Total Balance</p>
                                <p className="font-medium">${formattedTotalBalance}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">Active Buckets</p>
                                <p className="font-medium">{buckets.filter(b => b.isActive).length}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">Active Goals</p>
                                <p className="font-medium">{goals.filter(g => !g.isWithdrawn).length}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">DCA Strategies</p>
                                <p className="font-medium">{strategies.filter(s => s.isActive).length}</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm">Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {QUICK_PROMPTS.map((prompt) => (
                                <Button
                                    key={prompt.label}
                                    variant="ghost"
                                    size="sm"
                                    className="w-full justify-start"
                                    onClick={() => sendMessage(prompt.prompt)}
                                    disabled={isLoading}
                                >
                                    <Sparkles className="h-3 w-3 mr-2" />
                                    {prompt.label}
                                </Button>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
