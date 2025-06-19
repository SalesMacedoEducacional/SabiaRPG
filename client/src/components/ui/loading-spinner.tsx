import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  text?: string;
  overlay?: boolean;
}

export const LoadingSpinner = ({ 
  size = "md", 
  className, 
  text,
  overlay = false 
}: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6", 
    lg: "h-8 w-8"
  };

  const textSizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg"
  };

  const spinner = (
    <div className={cn(
      "flex items-center justify-center gap-2",
      overlay && "absolute inset-0 bg-background/80 backdrop-blur-sm z-10",
      className
    )}>
      <Loader2 className={cn("animate-spin text-primary", sizeClasses[size])} />
      {text && (
        <span className={cn("text-muted-foreground", textSizeClasses[size])}>
          {text}
        </span>
      )}
    </div>
  );

  return spinner;
};

// Componente específico para cards de dados
export const CardLoadingOverlay = ({ isLoading, children }: { 
  isLoading: boolean; 
  children: React.ReactNode;
}) => {
  return (
    <div className="relative">
      {children}
      {isLoading && (
        <LoadingSpinner 
          overlay 
          size="sm" 
          text="Atualizando..."
          className="rounded-lg"
        />
      )}
    </div>
  );
};

// Skeleton para tabelas
export const TableSkeleton = ({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) => {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex space-x-4">
          {Array.from({ length: cols }).map((_, j) => (
            <div 
              key={j} 
              className="h-4 bg-muted animate-pulse rounded flex-1"
            />
          ))}
        </div>
      ))}
    </div>
  );
};