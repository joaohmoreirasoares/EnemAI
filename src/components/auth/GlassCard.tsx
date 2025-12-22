import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface GlassCardProps {
    children: ReactNode;
    className?: string;
}

export function GlassCard({ children, className }: GlassCardProps) {
    return (
        <div
            className={cn(
                "relative overflow-hidden rounded-2xl border border-white/10 bg-black/20 backdrop-blur-xl shadow-2xl",
                "before:absolute before:inset-0 before:z-0 before:bg-gradient-to-br before:from-white/5 before:to-transparent before:opacity-50",
                className
            )}
        >
            <div className="relative z-10">{children}</div>
        </div>
    );
}
