import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import { cn } from '../../lib/utils';

const themeOptions = [
    {
        value: 'system',
        label: 'Automático',
        description: 'Segue o tema do dispositivo',
        icon: Monitor,
    },
    {
        value: 'light',
        label: 'Claro',
        description: 'Visual clássico e suave',
        icon: Sun,
    },
    {
        value: 'dark',
        label: 'Escuro',
        description: 'Elegante e confortável',
        icon: Moon,
    },
];

export default function ThemeSelector() {
    const { theme, setTheme } = useTheme();

    return (
        <div className="bg-card rounded-2xl p-6 shadow-soft border border-border flex flex-col gap-4">
            <div className="flex items-center gap-3 text-primary mb-1">
                <Sun size={24} />
                <h2 className="text-lg font-semibold text-card-foreground">
                    Tema do Aplicativo
                </h2>
            </div>

            <p className="text-sm text-muted-foreground -mt-2">
                Escolha como o BeautyStock aparece para você
            </p>

            <div className="grid grid-cols-3 gap-3 mt-1">
                {themeOptions.map((option) => {
                    const isSelected = theme === option.value;
                    const Icon = option.icon;

                    return (
                        <button
                            key={option.value}
                            onClick={() => setTheme(option.value)}
                            className={cn(
                                "relative flex flex-col items-center gap-2.5 p-4 rounded-2xl border-2 transition-all duration-300 cursor-pointer group",
                                "hover:scale-[1.02] active:scale-[0.98]",
                                isSelected
                                    ? "border-primary bg-primary/5 shadow-md shadow-primary/10 ring-1 ring-primary/20"
                                    : "border-border bg-card hover:border-primary/30 hover:bg-muted/50"
                            )}
                        >
                            {/* Icon Container */}
                            <div
                                className={cn(
                                    "w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300",
                                    isSelected
                                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                                        : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
                                )}
                            >
                                <Icon size={22} strokeWidth={isSelected ? 2.5 : 2} />
                            </div>

                            {/* Label */}
                            <span
                                className={cn(
                                    "text-sm font-semibold transition-colors duration-300",
                                    isSelected
                                        ? "text-primary"
                                        : "text-card-foreground"
                                )}
                            >
                                {option.label}
                            </span>

                            {/* Description (hidden on mobile for space) */}
                            <span className="hidden sm:block text-[11px] text-muted-foreground text-center leading-tight">
                                {option.description}
                            </span>

                            {/* Selected Indicator Dot */}
                            {isSelected && (
                                <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center shadow-sm">
                                    <div className="w-1.5 h-1.5 bg-primary-foreground rounded-full" />
                                </div>
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
