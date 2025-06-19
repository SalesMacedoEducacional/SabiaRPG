import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useCreateUsuario, useUpdateUsuario, useDeleteUsuario } from '@/hooks/useEnhancedMutations';
import { useGlobalDataSync } from '@/hooks/useGlobalDataSync';
import { CardLoadingOverlay } from '@/components/ui/loading-spinner';
import { apiRequest } from '@/lib/queryClient';
import { 
  Zap, 
  Clock, 
  Activity, 
  Database, 
  RefreshCw, 
  TrendingUp,
  Users,
  School
} from 'lucide-react';

interface PerformanceMetric {
  operation: string;
  startTime: number;
  endTime: number;
  duration: number;
  success: boolean;
}

export default function SyncDemo() {
  const { toast } = useToast();
  const { isRefreshing } = useGlobalDataSync();
  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetric[]>([]);
  const [totalOperations, setTotalOperations] = useState(0);
  const [averageResponseTime, setAverageResponseTime] = useState(0);
  const [mutationCount, setMutationCount] = useState(0);
  const [lastMutationType, setLastMutationType] = useState<string>('');

  // Enhanced mutations
  const createUsuarioMutation = useCreateUsuario();
  const updateUsuarioMutation = useUpdateUsuario();
  const deleteUsuarioMutation = useDeleteUsuario();

  // Performance tracking
  const trackPerformance = (operation: string, startTime: number, success: boolean) => {
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    const metric: PerformanceMetric = {
      operation,
      startTime,
      endTime,
      duration,
      success
    };

    setPerformanceMetrics(prev => [...prev.slice(-9), metric]);
    setTotalOperations(prev => prev + 1);
    
    // Update average response time
    setPerformanceMetrics(current => {
      const totalTime = current.reduce((sum, m) => sum + m.duration, 0);
      setAverageResponseTime(totalTime / current.length);
      return current;
    });
  };

  // Fetch dashboard stats with performance tracking
  const fetchDashboardStats = async () => {
    const startTime = performance.now();
    try {
      const response = await apiRequest('GET', '/api/manager/dashboard-stats');
      if (response.ok) {
        const data = await response.json();
        setDashboardStats(data);
        trackPerformance('Dashboard Load', startTime, true);
      }
    } catch (error) {
      trackPerformance('Dashboard Load', startTime, false);
      console.error('Erro ao carregar dashboard:', error);
    }
  };

  // Demo operations
  const simulateCreateUser = () => {
    const startTime = performance.now();
    const userData = {
      nome: `Demo User ${Date.now()}`,
      email: `demo${Date.now()}@test.com`,
      cpf: `${Math.floor(Math.random() * 100000000000)}`,
      papel: 'aluno' as const,
      senha: 'demo123'
    };

    createUsuarioMutation.mutate(userData, {
      onSuccess: () => {
        trackPerformance('Create User', startTime, true);
        toast({
          title: "Usuário criado",
          description: "Dados sincronizados automaticamente em tempo real"
        });
      },
      onError: () => {
        trackPerformance('Create User', startTime, false);
      }
    });
  };

  const simulateDataRefresh = () => {
    const startTime = performance.now();
    fetchDashboardStats();
    trackPerformance('Manual Refresh', startTime, true);
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  // Real-time stats update when mutations occur
  useEffect(() => {
    if (lastMutationType && mutationCount > 0) {
      setTimeout(() => {
        fetchDashboardStats();
      }, 100);
    }
  }, [mutationCount, lastMutationType]);

  const getPerformanceColor = (duration: number) => {
    if (duration < 100) return 'text-green-400';
    if (duration < 500) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getPerformanceBadge = (duration: number) => {
    if (duration < 100) return 'Excelente';
    if (duration < 500) return 'Bom';
    return 'Lento';
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white mb-2">
          <Zap className="inline h-8 w-8 mr-3 text-yellow-400" />
          Sistema de Sincronização em Tempo Real
        </h1>
        <p className="text-accent">
          Demonstração da performance ultra-otimizada com auto-refresh automático
        </p>
      </div>

      {/* Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <CardLoadingOverlay isLoading={isRefreshing}>
          <Card className="bg-[#4a4639] border-[#D47C06]">
            <CardContent className="p-4 text-center">
              <Activity className="h-8 w-8 mx-auto mb-2 text-blue-400" />
              <div className="text-2xl font-bold text-white">{totalOperations}</div>
              <div className="text-sm text-accent">Total de Operações</div>
            </CardContent>
          </Card>
        </CardLoadingOverlay>

        <Card className="bg-[#4a4639] border-[#D47C06]">
          <CardContent className="p-4 text-center">
            <Clock className="h-8 w-8 mx-auto mb-2 text-green-400" />
            <div className={`text-2xl font-bold ${getPerformanceColor(averageResponseTime)}`}>
              {averageResponseTime.toFixed(1)}ms
            </div>
            <div className="text-sm text-accent">Tempo Médio</div>
          </CardContent>
        </Card>

        <Card className="bg-[#4a4639] border-[#D47C06]">
          <CardContent className="p-4 text-center">
            <Database className="h-8 w-8 mx-auto mb-2 text-purple-400" />
            <div className="text-2xl font-bold text-white">{mutationCount}</div>
            <div className="text-sm text-accent">Mutações Realizadas</div>
          </CardContent>
        </Card>

        <Card className="bg-[#4a4639] border-[#D47C06]">
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-8 w-8 mx-auto mb-2 text-orange-400" />
            <div className="text-2xl font-bold text-white">
              {dashboardStats ? 'Ativo' : 'Carregando'}
            </div>
            <div className="text-sm text-accent">Status do Sistema</div>
          </CardContent>
        </Card>
      </div>

      {/* Current Dashboard Data */}
      {dashboardStats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-[#2a2f3a] border-blue-500">
            <CardContent className="p-4 text-center">
              <School className="h-6 w-6 mx-auto mb-2 text-blue-400" />
              <div className="text-xl font-bold text-white">{dashboardStats.totalEscolas}</div>
              <div className="text-sm text-accent">Escolas</div>
            </CardContent>
          </Card>
          <Card className="bg-[#2a2f3a] border-green-500">
            <CardContent className="p-4 text-center">
              <Users className="h-6 w-6 mx-auto mb-2 text-green-400" />
              <div className="text-xl font-bold text-white">{dashboardStats.totalProfessores}</div>
              <div className="text-sm text-accent">Professores</div>
            </CardContent>
          </Card>
          <Card className="bg-[#2a2f3a] border-yellow-500">
            <CardContent className="p-4 text-center">
              <Users className="h-6 w-6 mx-auto mb-2 text-yellow-400" />
              <div className="text-xl font-bold text-white">{dashboardStats.totalAlunos}</div>
              <div className="text-sm text-accent">Alunos</div>
            </CardContent>
          </Card>
          <Card className="bg-[#2a2f3a] border-purple-500">
            <CardContent className="p-4 text-center">
              <div className="text-xl font-bold text-white">{dashboardStats.turmasAtivas}</div>
              <div className="text-sm text-accent">Turmas Ativas</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Control Buttons */}
      <div className="flex gap-4 justify-center">
        <Button 
          onClick={simulateCreateUser}
          disabled={createUsuarioMutation.isPending}
          className="bg-green-600 hover:bg-green-700"
        >
          {createUsuarioMutation.isPending ? 'Criando...' : 'Simular Criação de Usuário'}
        </Button>
        
        <Button 
          onClick={simulateDataRefresh}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Atualizar Dados
        </Button>
      </div>

      {/* Performance Metrics */}
      <Card className="bg-[#1a1f2a] border-[#D47C06]">
        <CardHeader>
          <CardTitle className="text-white">Métricas de Performance em Tempo Real</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {performanceMetrics.map((metric, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-[#2a2f3a] rounded">
                <div className="flex items-center gap-3">
                  <Badge variant={metric.success ? "default" : "destructive"}>
                    {metric.operation}
                  </Badge>
                  <Badge variant="outline" className={getPerformanceColor(metric.duration)}>
                    {getPerformanceBadge(metric.duration)}
                  </Badge>
                </div>
                <div className={`font-mono ${getPerformanceColor(metric.duration)}`}>
                  {metric.duration.toFixed(2)}ms
                </div>
              </div>
            ))}
            {performanceMetrics.length === 0 && (
              <div className="text-center text-accent py-8">
                Execute uma operação para ver as métricas de performance
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Status Indicators */}
      <div className="flex justify-center gap-4">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${isRefreshing ? 'bg-yellow-400 animate-pulse' : 'bg-green-400'}`}></div>
          <span className="text-sm text-accent">
            {isRefreshing ? 'Sincronizando...' : 'Sistema Online'}
          </span>
        </div>
        {lastMutationType && (
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-400"></div>
            <span className="text-sm text-accent">Última mutação: {lastMutationType}</span>
          </div>
        )}
      </div>
    </div>
  );
}