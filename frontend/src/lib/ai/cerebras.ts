// Cerebras AI service with load-balanced API key rotation
const API_KEYS = (process.env.CEREBRAS_API_KEYS || process.env.NEXT_PUBLIC_CEREBRAS_API_KEY || '').split(',').filter(Boolean);
let currentKeyIndex = 0;

function getNextApiKey(): string {
    if (API_KEYS.length === 0) {
        throw new Error('No Cerebras API keys configured');
    }
    const key = API_KEYS[currentKeyIndex];
    currentKeyIndex = (currentKeyIndex + 1) % API_KEYS.length;
    return key;
}

export interface FinancialContext {
    totalBalance: string;
    buckets: Array<{ name: string; balance: string; percentage: number }>;
    goals: Array<{ name: string; current: string; target: string; progress: number }>;
    dcaStrategies: Array<{ token: string; amount: string; frequency: string }>;
}

export interface ChatMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

const SYSTEM_PROMPT = `You are AutoVault's AI Financial Advisor, a friendly and knowledgeable assistant helping users manage their programmable savings. You have access to the user's financial data including their bucket allocations, savings goals, and DCA strategies.

Your role is to:
1. Provide personalized savings advice based on their current allocations
2. Suggest optimal bucket distributions for their goals
3. Help them understand DCA strategies and timing
4. Celebrate their progress and milestones
5. Answer questions about their AutoVault setup

Guidelines:
- Be encouraging and supportive
- Give specific, actionable advice
- Use simple language, avoid jargon
- Reference their actual data when giving advice
- Keep responses concise but helpful
- If they ask about features, explain how AutoVault works

Remember: You're helping people build better financial habits through smart automation.`;

export async function getFinancialAdvice(
    messages: ChatMessage[],
    context: FinancialContext
): Promise<string> {
    const apiKey = getNextApiKey();

    const contextMessage = `
Current User Financial Status:
- Total Vault Balance: $${context.totalBalance}
- Buckets: ${context.buckets.map(b => `${b.name} ($${b.balance}, ${b.percentage}%)`).join(', ') || 'None created'}
- Goals: ${context.goals.map(g => `${g.name} ($${g.current}/$${g.target}, ${g.progress}%)`).join(', ') || 'None created'}
- DCA Strategies: ${context.dcaStrategies.map(d => `${d.token} - $${d.amount} ${d.frequency}`).join(', ') || 'None active'}
`;

    const fullMessages: ChatMessage[] = [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'system', content: contextMessage },
        ...messages,
    ];

    const response = await fetch('https://api.cerebras.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model: 'llama3.1-8b',
            messages: fullMessages,
            max_tokens: 500,
            temperature: 0.7,
        }),
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Cerebras API error: ${error}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || 'I apologize, I could not generate a response.';
}

export const QUICK_PROMPTS = [
    { label: 'Optimize Buckets', prompt: 'Can you analyze my bucket distribution and suggest improvements?' },
    { label: 'Goal Timeline', prompt: 'Based on my current savings rate, when will I reach my goals?' },
    { label: 'DCA Strategy', prompt: 'What DCA strategy would you recommend for my situation?' },
    { label: 'Emergency Fund', prompt: 'Do I have enough in my emergency fund? What should I aim for?' },
];
