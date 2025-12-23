import { NextRequest, NextResponse } from 'next/server';
import { getFinancialAdvice, type ChatMessage, type FinancialContext } from '@/lib/ai/cerebras';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { messages, context } = body as {
            messages: ChatMessage[];
            context: FinancialContext;
        };

        if (!messages || !Array.isArray(messages)) {
            return NextResponse.json(
                { error: 'Messages array is required' },
                { status: 400 }
            );
        }

        const response = await getFinancialAdvice(messages, context || {
            totalBalance: '0',
            buckets: [],
            goals: [],
            dcaStrategies: [],
        });

        return NextResponse.json({ response });
    } catch (error) {
        console.error('AI API error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to get AI response' },
            { status: 500 }
        );
    }
}
