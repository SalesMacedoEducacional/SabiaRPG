import { useEffect, useState } from 'react';
import { useGlobalDataSync } from '@/hooks/useGlobalDataSync';
import { Loader2, Clock, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SyncLoadingOverlayProps {
  className?: string;
  showMetrics?: boolean;
}

export const SyncLoadingOverlay = ({ className, showMetrics = false }: SyncLoadingOverlayProps) => {
  const { isRefreshing, performanceMetrics, mutationCount, lastMutationType } = useGlobalDataSync();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isRefreshing) {
      setVisible(true);
    } else {
      // Fade out after refresh completes
      const timer = setTimeout(() => setVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isRefreshing]);

  const lastMetric = performanceMetrics[performanceMetrics.length - 1];
  const avgDuration = performanceMetrics.length > 0 
    ? performanceMetrics.reduce((sum, m) => sum + m.duration, 0) / performanceMetrics.length
    : 0;

  if (!visible) return null;

  return (
    <div className={cn(
      "fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center transition-opacity duration-300",
      isRefreshing ? "opacity-100" : "opacity-0",
      className
    )}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-sm w-full mx-4">
        <div className="flex items-center space-x-3 mb-4">
          <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Sincronizando dados
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Atualizando informações em tempo real...
            </p>
          </div>
        </div>

        {showMetrics && (
          <div className="space-y-3 pt-3 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
              <span className="flex items-center space-x-1">
                <Zap className="h-3 w-3" />
                <span>Mutações:</span>
              </span>
              <span className="font-mono font-semibold">{mutationCount}</span>
            </div>
            
            {lastMetric && (
              <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
                <span className="flex items-center space-x-1">
                  <Clock className="h-3 w-3" />
                  <span>Última operação:</span>
                </span>
                <span className="font-mono font-semibold">
                  {lastMetric.duration.toFixed(0)}ms
                </span>
              </div>
            )}

            {avgDuration > 0 && (
              <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
                <span>Tempo médio:</span>
                <span className={cn(
                  "font-mono font-semibold",
                  avgDuration < 200 ? "text-green-600" : 
                  avgDuration < 500 ? "text-yellow-600" : "text-red-600"
                )}>
                  {avgDuration.toFixed(0)}ms
                </span>
              </div>
            )}

            {lastMutationType && (
              <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {lastMutationType.replace(/-/g, ' ')}
              </div>
            )}
          </div>
        )}

        <div className="mt-4">
          <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
            <div className="bg-blue-500 h-full rounded-full animate-pulse" style={{ width: '70%' }} />
          </div>
        </div>
      </div>
    </div>
  );
};

// Compact card overlay for individual components
export const CardSyncOverlay = ({ isVisible, className }: { isVisible: boolean; className?: string }) => {
  if (!isVisible) return null;

  return (
    <div className={cn(
      "absolute inset-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg flex items-center justify-center z-10",
      className
    )}>
      <div className="flex items-center space-x-2 text-blue-600 dark:text-blue-400">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm font-medium">Atualizando...</span>
      </div>
    </div>
  );
};

// Performance indicator component
export const PerformanceIndicator = () => {
  const { performanceMetrics } = useGlobalDataSync();
  const [showDetails, setShowDetails] = useState(false);

  const recentMetrics = performanceMetrics.slice(-5);
  const avgDuration = recentMetrics.length > 0 
    ? recentMetrics.reduce((sum, m) => sum + m.duration, 0) / recentMetrics.length
    : 0;

  const getPerformanceColor = (duration: number) => {
    if (duration < 200) return "text-green-500";
    if (duration < 500) return "text-yellow-500";
    return "text-red-500";
  };

  const getPerformanceStatus = (duration: number) => {
    if (duration < 200) return "Excelente";
    if (duration < 500) return "Bom";
    return "Lento";
  };

  if (recentMetrics.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-40">
      <div 
        className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border p-3 cursor-pointer hover:shadow-xl transition-shadow"
        onClick={() => setShowDetails(!showDetails)}
      >
        <div className="flex items-center space-x-2">
          <Clock className={cn("h-4 w-4", getPerformanceColor(avgDuration))} />
          <span className="text-sm font-medium">
            {avgDuration.toFixed(0)}ms
          </span>
          <span className={cn("text-xs", getPerformanceColor(avgDuration))}>
            {getPerformanceStatus(avgDuration)}
          </span>
        </div>

        {showDetails && (
          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 space-y-1">
            <div className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-2">
              Últimas 5 operações:
            </div>
            {recentMetrics.map((metric, index) => (
              <div key={index} className="flex justify-between text-xs">
                <span className="text-gray-600 dark:text-gray-400 truncate max-w-24">
                  {metric.operation.replace(/-/g, ' ')}
                </span>
                <span className={cn("font-mono", getPerformanceColor(metric.duration))}>
                  {metric.duration.toFixed(0)}ms
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};