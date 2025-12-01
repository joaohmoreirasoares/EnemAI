import React from 'react';
import { useAccessibility } from '@/context/AccessibilityContext';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AccessibilityHelperProps {
    children: React.ReactNode;
    description: string;
    className?: string;
    borderClassName?: string;
    badgeClassName?: string;
}

export const AccessibilityHelper = ({
    children,
    description,
    className,
    borderClassName,
    badgeClassName
}: AccessibilityHelperProps) => {
    const { showAccessibility } = useAccessibility();

    if (!showAccessibility) {
        return <>{children}</>;
    }

    return (
        <TooltipProvider>
            <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                    <div className={cn("relative group cursor-help", className)}>
                        {/* Visual Indicator: Dashed Border on Hover/Active */}
                        <div className={cn(
                            "absolute inset-0 border-2 border-dashed border-yellow-400/50 rounded-lg pointer-events-none group-hover:border-yellow-400 transition-colors z-50",
                            borderClassName
                        )} />

                        {/* Floating Badge */}
                        <div className={cn(
                            "absolute -top-2 -right-2 bg-yellow-400 text-black rounded-full p-0.5 shadow-sm z-50",
                            badgeClassName
                        )}>
                            <HelpCircle className="w-3 h-3" />
                        </div>

                        {children}
                    </div>
                </TooltipTrigger>
                <TooltipContent side="top" className="bg-yellow-100 text-black border-yellow-400 max-w-xs z-[60]">
                    <p className="font-medium text-sm">{description}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
};
