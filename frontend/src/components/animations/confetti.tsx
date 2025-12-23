'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface ConfettiPiece {
    id: number;
    x: number;
    color: string;
    delay: number;
    rotation: number;
}

interface ConfettiProps {
    trigger: boolean;
    onComplete?: () => void;
}

const COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export function Confetti({ trigger, onComplete }: ConfettiProps) {
    const [pieces, setPieces] = useState<ConfettiPiece[]>([]);

    useEffect(() => {
        if (trigger) {
            const newPieces: ConfettiPiece[] = Array.from({ length: 50 }, (_, i) => ({
                id: i,
                x: Math.random() * 100,
                color: COLORS[Math.floor(Math.random() * COLORS.length)],
                delay: Math.random() * 0.5,
                rotation: Math.random() * 360,
            }));
            setPieces(newPieces);

            const timer = setTimeout(() => {
                setPieces([]);
                onComplete?.();
            }, 3000);

            return () => clearTimeout(timer);
        }
    }, [trigger, onComplete]);

    return (
        <AnimatePresence>
            {pieces.map((piece) => (
                <motion.div
                    key={piece.id}
                    className="fixed pointer-events-none z-50"
                    style={{ left: `${piece.x}%`, top: -20 }}
                    initial={{ y: 0, opacity: 1, rotate: 0 }}
                    animate={{
                        y: window.innerHeight + 100,
                        opacity: [1, 1, 0],
                        rotate: piece.rotation + 720,
                    }}
                    exit={{ opacity: 0 }}
                    transition={{
                        duration: 2.5,
                        delay: piece.delay,
                        ease: [0.25, 0.46, 0.45, 0.94],
                    }}
                >
                    <div
                        className="w-3 h-3 rounded-sm"
                        style={{ backgroundColor: piece.color }}
                    />
                </motion.div>
            ))}
        </AnimatePresence>
    );
}

export function MilestoneConfetti({ milestone }: { milestone: number }) {
    const [show, setShow] = useState(true);

    if (!show) return null;

    return (
        <>
            <Confetti trigger={true} onComplete={() => setShow(false)} />
            <motion.div
                className="fixed inset-0 flex items-center justify-center z-40 pointer-events-none"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
            >
                <div className="bg-background/90 backdrop-blur-sm rounded-2xl p-8 text-center shadow-2xl border">
                    <motion.div
                        className="text-6xl mb-4"
                        animate={{ rotate: [0, -10, 10, -10, 0] }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        🎉
                    </motion.div>
                    <h2 className="text-2xl font-bold mb-2">Milestone Reached!</h2>
                    <p className="text-muted-foreground">{milestone}% of your goal complete</p>
                </div>
            </motion.div>
        </>
    );
}
