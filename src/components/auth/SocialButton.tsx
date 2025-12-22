import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SocialButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    icon: React.ReactNode;
    provider: string;
}

export function SocialButton({ icon, provider, className, ...props }: SocialButtonProps) {
    return (
        <Button
            type="button"
            variant="outline"
            className={cn(
                "relative flex w-full items-center justify-center gap-2 rounded-xl border-white/10 bg-white/5 py-6 text-white transition-all hover:bg-white/10 hover:border-white/20 hover:scale-[1.02] active:scale-[0.98]",
                className
            )}
            {...props}
        >
            {icon}
            <span>Continuar com {provider}</span>
        </Button>
    );
}
