import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, TrendingUp, Activity, Eye } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { AlunosAtivosModal } from "./AlunosAtivosModal";

interface AlunosAtivosStats {
  ativos7Dias: number;
  ativos30Dias: number;
  taxaEngajamento: number;
  totalAlunos: number;
}

export function AlunosAtivosCard() {
  const [stats, setStats] = useState<AlunosAtivosStats>({
    ativos7Dias: 0,
    ativos30Dias: 0,
    taxaEngajamento: 0,
    totalAlunos: 0
  });
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchAlunosAtivos = async () => {
    try {
      setLoading(true);
      const response: any = await apiRequest('/api/alunos-ativos', {
        method: 'GET'
      });
      setStats(response);
    } catch (error) {
      console.error('Erro ao buscar alunos ativos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlunosAtivos();
    
    // Refresh automático a cada 5 minutos
    const interval = setInterval(fetchAlunosAtivos, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <Card className="bg-gradient-to-br from-amber-50 to-orange-100 border-amber-200 hover:shadow-lg transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-amber-800">
            ALUNOS ATIVOS
          </CardTitle>
          <Activity className="h-4 w-4 text-amber-600" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Contadores principais */}
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-lg font-bold text-amber-900">
                  {loading ? "..." : stats.ativos7Dias}
                </div>
                <div className="text-xs text-amber-700">Últimos 7 dias</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-amber-900">
                  {loading ? "..." : stats.ativos30Dias}
                </div>
                <div className="text-xs text-amber-700">Últimos 30 dias</div>
              </div>
            </div>

            {/* Taxa de Engajamento */}
            <div className="border-t border-amber-200 pt-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-amber-700">Taxa de Engajamento</span>
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-3 h-3 text-green-600" />
                  <span className="font-semibold text-amber-900">
                    {loading ? "..." : `${stats.taxaEngajamento}%`}
                  </span>
                </div>
              </div>
            </div>

            {/* Botão Ver Detalhes */}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setIsModalOpen(true)}
              className="w-full mt-3 border-amber-300 text-amber-800 hover:bg-amber-50"
            >
              <Eye className="w-4 h-4 mr-2" />
              Ver Detalhes
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Modal de detalhes */}
      <AlunosAtivosModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        stats={stats}
      />
    </>
  );
}