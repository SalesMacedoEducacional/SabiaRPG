import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Building,
  Search
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2 } from "lucide-react";

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

// Componente para o card de escolas vinculadas ao gestor
export function EscolasVinculadasCard() {
  const { toast } = useToast();
  const [totalEscolas, setTotalEscolas] = useState<number>(0);
  const [escolasAtivas, setEscolasAtivas] = useState<number>(0);
  const [escolas, setEscolas] = useState<Escola[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const response = await apiRequest("GET", "/api/escolas/gestor");
        const data = await response.json();
        
        console.log("Escolas vinculadas recebidas:", data);
        
        // Filtrar escolas ativas
        const escolasList = Array.isArray(data) ? data : [];
        const ativas = escolasList.filter(escola => escola.ativo !== false);
        
        setEscolas(escolasList);
        setTotalEscolas(escolasList.length);
        setEscolasAtivas(ativas.length);
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

  return (
    <>
      <div className="bg-[#312e26] border border-[#D47C06] rounded-md p-4 flex flex-col hover:border-amber-400 transition-all shadow-md">
        <div className="flex items-center mb-2">
          <div className="rounded-full bg-[#4a4639] p-2 mr-3">
            <Building className="h-5 w-5 text-primary" />
          </div>
          <div className="text-sm font-medium text-white">Total de Escolas Vinculadas</div>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center py-2">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <div className="text-3xl font-bold text-white mt-2">{totalEscolas}</div>
            <div className="text-xs text-accent mt-1">{escolasAtivas} ativas</div>
            
            <Button 
              variant="outline" 
              size="sm" 
              className="bg-[#4a4639] border border-[#D47C06] text-white px-3 py-1.5 mt-3 rounded hover:bg-[#57533f] transition-colors self-start"
              onClick={() => setIsModalOpen(true)}
              disabled={totalEscolas === 0}
            >
              <Search className="h-3 w-3 mr-1" /> Ver Detalhes
            </Button>
          </>
        )}
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl bg-[#312e26] border-[#D47C06] text-white">
          <DialogHeader>
            <DialogTitle className="text-xl text-primary flex items-center">
              <Building className="h-5 w-5 mr-2" /> Escolas Vinculadas
            </DialogTitle>
            <DialogDescription className="text-accent">
              Lista de escolas vinculadas à sua gestão
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="max-h-[60vh]">
            <Table className="border-collapse">
              <TableHeader className="bg-[#43341c]">
                <TableRow>
                  <TableHead className="text-white">Nome da Escola</TableHead>
                  <TableHead className="text-white">Cidade</TableHead>
                  <TableHead className="text-white">Estado</TableHead>
                  <TableHead className="text-white">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {escolas.length > 0 ? (
                  escolas.map((escola) => (
                    <TableRow key={escola.id} className="hover:bg-[#43341c]">
                      <TableCell className="text-white font-medium">{escola.nome}</TableCell>
                      <TableCell className="text-white">
                        {escola.cidades?.nome || escola.cidade || "Não informado"}
                      </TableCell>
                      <TableCell className="text-white">
                        {escola.estados?.sigla || escola.estado || "Não informado"}
                      </TableCell>
                      <TableCell className="text-white">
                        <span className={`px-2 py-1 rounded text-xs ${escola.ativo !== false ? 'bg-green-800/50' : 'bg-red-800/50'}`}>
                          {escola.ativo !== false ? 'Ativa' : 'Inativa'}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                      Nenhuma escola vinculada encontrada
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
}