import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";

interface AuthInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    icon?: React.ReactNode;
}

// Define translations outside component to avoid recreation
const translations: Record<string, string> = {
    "auth.show_password": "Exibir senha",
    "auth.hide_password": "Ocultar senha"
};

const t = (key: string, fallback: string) => {
    return translations[key] || fallback;
};

export function AuthInput({ label, icon, className, type, ...props }: AuthInputProps) {
    const generatedId = React.useId();
    const inputId = props.id || generatedId;

    // Initialize state deriving from controlled or uncontrolled value
    const [hasValue, setHasValue] = useState(() => {
        return !!(props.value || props.defaultValue);
    });
    const [isFocused, setIsFocused] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const isPassword = type === "password";
    const inputType = isPassword ? (showPassword ? "text" : "password") : type;

    // Sync hasValue with external value changes (controlled component)
    useEffect(() => {
        if (props.value !== undefined) {
            setHasValue(!!props.value);
        }
    }, [props.value]);

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
        setIsFocused(true);
        props.onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        setIsFocused(false);
        // Update functionality to check actual value, prioritizing prop value if controlled
        if (props.value !== undefined) {
            setHasValue(!!props.value);
        } else {
            setHasValue(!!e.target.value);
        }
        props.onBlur?.(e);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // If uncontrolled, update internal state immediately
        if (props.value === undefined) {
            setHasValue(!!e.target.value);
        }
        props.onChange?.(e);
    };



    return (
        <div className="relative mb-4 group">
            <motion.div
                animate={isFocused ? { scale: 1.02 } : { scale: 1 }}
                transition={{ duration: 0.2 }}
                className={cn(
                    "relative flex items-center rounded-xl border bg-black/40 px-4 py-3 transition-colors",
                    isFocused ? "border-purple-500/50 bg-black/60 shadow-[0_0_15px_rgba(168,85,247,0.15)]" : "border-white/10 hover:border-white/20",
                    className
                )}
            >
                {icon && (
                    <div className={cn("mr-3 transition-colors", isFocused ? "text-purple-400" : "text-gray-500")}>
                        {icon}
                    </div>
                )}

                <div className="flex-1 relative">
                    <label
                        htmlFor={inputId}
                        className={cn(
                            "absolute left-0 transition-all duration-200 pointer-events-none",
                            isFocused || hasValue || props.value
                                ? "-top-5 text-[10px] text-purple-400 font-medium tracking-wider uppercase"
                                : "top-0 text-gray-400 text-sm"
                        )}
                    >
                        {label}
                    </label>
                    <input
                        id={inputId}
                        type={inputType}
                        className="w-full bg-transparent text-sm text-white placeholder-transparent focus:outline-none"
                        {...props}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                        onChange={handleChange}
                    />
                </div>

                {isPassword && (
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="ml-2 text-gray-500 hover:text-white transition-colors focus:outline-none"
                        aria-label={showPassword ? t("auth.hide_password", "Ocultar senha") : t("auth.show_password", "Exibir senha")}
                    >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                )}
            </motion.div>
        </div>
    );
}
