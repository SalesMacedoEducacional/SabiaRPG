import { useState, useEffect } from "react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ChevronRight, Users, Loader2, PlusCircle } from 'lucide-react';
import { useLocation } from "wouter";

interface Turma {
  id: string;
  nome: string;
  serie: string;
  ano_letivo: number;
  ativo: boolean;
  escola_id: string;
  escola_nome?: string;
  total_alunos?: number;
}

interface Escola {
  id: string;
  nome: string;
}

export default function ClassesList() {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [escolas, setEscolas] = useState<Escola[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedEscola, setSelectedEscola] = useState<string>("");
  const [selectedSerie, setSelectedSerie] = useState<string>("");

  const series = ["6º ano", "7º ano", "8º ano", "9º ano", "1º ano", "2º ano", "3º ano"];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Buscar escolas vinculadas ao gestor
        const escolasResponse = await apiRequest("GET", "/api/escolas/gestor");
        const escolasData = await escolasResponse.json();
        setEscolas(Array.isArray(escolasData) ? escolasData : []);
        
        // Buscar turmas
        const turmasResponse = await apiRequest("GET", "/api/turmas");
        const turmasData = await turmasResponse.json();
        console.log("Turmas recebidas:", turmasData);
        
        const turmasList = Array.isArray(turmasData) ? turmasData : [];
        setTurmas(turmasList);
        
      } catch (error) {
        console.error("Erro ao buscar turmas:", error);
        toast({
          title: "Erro ao carregar turmas",
          description: "Não foi possível carregar as informações das turmas",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  const turmasFiltradas = turmas.filter(turma => {
    const escolaMatch = !selectedEscola || turma.escola_id === selectedEscola;
    const serieMatch = !selectedSerie || turma.serie === selectedSerie;
    return escolaMatch && serieMatch;
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-white">Turmas</h1>
        <p className="text-white/70">Gerencie as turmas cadastradas</p>
      </div>
      
      <div className="mb-4 flex justify-between">
        <div className="flex gap-2">
          <select 
            className="bg-[#3a3730] text-white border border-accent/50 rounded px-3 py-1.5 text-sm"
            value={selectedEscola}
            onChange={(e) => setSelectedEscola(e.target.value)}
          >
            <option value="">Todas as escolas</option>
            {escolas.map(escola => (
              <option key={escola.id} value={escola.id}>{escola.nome}</option>
            ))}
          </select>
          
          <select 
            className="bg-[#3a3730] text-white border border-accent/50 rounded px-3 py-1.5 text-sm"
            value={selectedSerie}
            onChange={(e) => setSelectedSerie(e.target.value)}
          >
            <option value="">Todas as séries</option>
            {series.map(serie => (
              <option key={serie} value={serie}>{serie}</option>
            ))}
          </select>
        </div>
        
        <button 
          className="manager-button flex items-center gap-1.5" 
          onClick={() => navigate('/class-registration')}
        >
          <PlusCircle size={16} />
          <span>Nova Turma</span>
        </button>
      </div>

      {turmasFiltradas.length === 0 ? (
        <div className="text-center py-8 text-white/70">
          Nenhuma turma encontrada
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          <div className="bg-[#312e26] border border-accent/50 rounded-lg overflow-hidden">
            <div className="p-4">
              <div className="overflow-x-auto">
                <table className="w-full text-white text-sm">
                  <thead>
                    <tr className="border-b border-accent/30">
                      <th className="text-left py-2 text-accent">Nome da Turma</th>
                      <th className="text-left py-2 text-accent">Série</th>
                      <th className="text-left py-2 text-accent">Escola</th>
                      <th className="text-left py-2 text-accent">Ano Letivo</th>
                      <th className="text-left py-2 text-accent">Alunos</th>
                      <th className="text-left py-2 text-accent">Status</th>
                      <th className="text-left py-2 text-accent">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {turmasFiltradas.map((turma) => (
                      <tr key={turma.id} className="border-b border-white/10 hover:bg-[#3a3730] transition-colors">
                        <td className="py-2 font-medium">{turma.nome}</td>
                        <td className="py-2">{turma.serie}</td>
                        <td className="py-2">{turma.escola_nome || 'Escola não identificada'}</td>
                        <td className="py-2">{turma.ano_letivo}</td>
                        <td className="py-2">
                          <div className="flex items-center gap-1">
                            <Users size={14} />
                            {turma.total_alunos || 0}
                          </div>
                        </td>
                        <td className="py-2">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            turma.ativo ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'
                          }`}>
                            {turma.ativo ? 'Ativa' : 'Inativa'}
                          </span>
                        </td>
                        <td className="py-2">
                          <button className="text-accent hover:text-accent/80 transition-colors">
                            <ChevronRight size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="mt-4 flex justify-between items-center text-white/70 text-sm">
        <span>Total: {turmasFiltradas.length} turma{turmasFiltradas.length !== 1 ? 's' : ''}</span>
      </div>
    </div>
  );
}