import { useState, useEffect } from "react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ChevronRight, School, Loader2 } from 'lucide-react';

// Interface para os dados de escolas
interface Escola {
  id: string;
  nome: string;
  cidade: string;
  ativo?: boolean;
  estado?: string;
  endereco?: string;
  telefone?: string;
  email?: string;
  diretor?: string;
  cidades?: { nome: string };
  estados?: { nome: string; sigla: string };
}

export default function SchoolsList() {
  const { toast } = useToast();
  const [escolas, setEscolas] = useState<Escola[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const response = await apiRequest("GET", "/api/escolas/gestor");
        const data = await response.json();
        
        console.log("Escolas vinculadas recebidas para lista:", data);
        
        // Filtrar escolas ativas se necessário
        const escolasList = Array.isArray(data) ? data : [];
        setEscolas(escolasList);
      } catch (error) {
        console.error("Erro ao buscar escolas vinculadas:", error);
        toast({
          title: "Erro ao carregar escolas",
          description: "Não foi possível carregar as informações de escolas vinculadas",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  if (escolas.length === 0) {
    return (
      <div className="text-center py-8 text-white/70">
        Nenhuma escola vinculada encontrada
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {escolas.map((escola) => (
        <div 
          key={escola.id} 
          className="bg-[#3a3730] rounded-md p-3 flex items-center justify-between hover:bg-[#42403a] transition-colors cursor-pointer"
        >
          <div className="flex items-center">
            <div className="bg-accent/20 p-2 rounded-md mr-3">
              <School className="h-5 w-5 text-accent" />
            </div>
            <div>
              <p className="text-white text-sm font-medium">{escola.nome}</p>
              <p className="text-white/70 text-xs">
                {escola.cidade}, {escola.estado}
              </p>
            </div>
          </div>
          <ChevronRight size={16} className="text-accent" />
        </div>
      ))}
    </div>
  );
}