import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import axios from "axios";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter 
} from "@/components/ui/card";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage,
  FormDescription
} from "@/components/ui/form";
import { useAuth } from "@/hooks/use-auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { 
  School, 
  Plus, 
  Search, 
  PenSquare, 
  Users, 
  CalendarDays, 
  ArrowLeft,
  GraduationCap,
  Clock
} from "lucide-react";

interface Escola {
  id: string;
  nome: string;
  cidade: string;
  estado: string;
  codigo_escola: string;
}

interface Turma {
  id: string;
  nome: string;
  serie: string;
  ano_letivo: number;
  turno: string;
  modalidade?: string;
  descricao?: string;
  total_alunos: number;
  escola_id: string;
  escola_nome: string;
}

// Schema de validação para turma
const turmaFormSchema = z.object({
  nome: z.string().min(1, "O nome da turma é obrigatório"),
  serie: z.string().min(1, "A série é obrigatória"),
  ano_letivo: z.coerce.number().min(2023, "O ano letivo deve ser 2023 ou posterior"),
  turno: z.string().min(1, "O turno é obrigatório"),
  modalidade: z.string().min(1, "A modalidade é obrigatória"),
  descricao: z.string().optional(),
  escola_id: z.string().min(1, "A escola é obrigatória"),
});

export default function ClassManagement() {
  const [location, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [escolas, setEscolas] = useState<Escola[]>([]);
  const [selectedEscola, setSelectedEscola] = useState<string | undefined>(undefined);
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showAddDialog, setShowAddDialog] = useState<boolean>(false);
  const [editTurma, setEditTurma] = useState<Turma | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Form setup
  const form = useForm<z.infer<typeof turmaFormSchema>>({
    resolver: zodResolver(turmaFormSchema),
    defaultValues: {
      nome: "",
      serie: "",
      ano_letivo: new Date().getFullYear(),
      turno: "",
      modalidade: "",
      descricao: "",
      escola_id: "",
    },
  });

  // Carregar escolas do gestor
  useEffect(() => {
    const fetchEscolas = async () => {
      try {
        const response = await axios.get("/api/escolas-cadastro");
        setEscolas(response.data.escolas);
        
        if (response.data.escolas.length > 0) {
          setSelectedEscola(response.data.escolas[0].id);
        }
      } catch (error) {
        console.error("Erro ao carregar escolas:", error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar as escolas. Tente novamente mais tarde.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchEscolas();
  }, [toast]);

  // Carregar turmas do gestor
  useEffect(() => {
    const fetchTurmas = async () => {
      try {
        setLoading(true);
        const response = await axios.get("/api/turmas");
        console.log("Turmas retornadas da API:", response.data);
        if (response.data.turmas) {
          setTurmas(response.data.turmas);
        } else {
          setTurmas([]);
        }
      } catch (error) {
        console.error("Erro ao carregar turmas:", error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar as turmas. Tente novamente mais tarde.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTurmas();
  }, [toast]);

  // Abrir diálogo para adicionar nova turma
  const handleAddTurma = () => {
    form.reset({
      nome: "",
      serie: "",
      ano_letivo: new Date().getFullYear(),
      turno: "",
      modalidade: "",
      descricao: "",
      escola_id: selectedEscola,
    });
    setEditTurma(null);
    setShowAddDialog(true);
  };

  // Abrir diálogo para editar turma
  const handleEditTurma = (turma: Turma) => {
    form.reset({
      nome: turma.nome,
      serie: turma.serie,
      ano_letivo: turma.ano_letivo,
      turno: turma.turno,
      modalidade: turma.modalidade || "",
      descricao: turma.descricao || "",
      escola_id: turma.escola_id,
    });
    setEditTurma(turma);
    setShowAddDialog(true);
  };

  // Salvar turma (criar ou editar)
  const handleSaveTurma = async (data: z.infer<typeof turmaFormSchema>) => {
    try {
      if (editTurma) {
        // Editar turma existente
        await axios.put(`/api/turmas/${editTurma.id}`, data);
        toast({
          title: "Sucesso",
          description: "Turma atualizada com sucesso!",
        });
      } else {
        // Criar nova turma
        await axios.post("/api/turmas", data);
        toast({
          title: "Sucesso",
          description: "Turma criada com sucesso!",
        });
      }

      // Recarregar turmas filtradas pela escola selecionada
      const response = await axios.get("/api/turmas");
      setTurmas(response.data.turmas || []);
      setShowAddDialog(false);
    } catch (error) {
      console.error("Erro ao salvar turma:", error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar a turma. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  // Filtrar turmas baseado na escola selecionada e termo de busca
  const filteredTurmas = turmas.filter((turma) => {
    const matchesSearch = turma.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         turma.serie.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         turma.escola_nome.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSchool = !selectedEscola || selectedEscola === "todas" || turma.escola_id === selectedEscola;
    
    return matchesSearch && matchesSchool;
  });

  const escolaSelecionadaNome = escolas.find((e) => e.id === selectedEscola)?.nome || "";

  return (
    <div className="min-h-screen bg-[#2b2518] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={() => setLocation("/manager")}
              className="flex items-center space-x-2 text-[#D47C06] hover:text-amber-400 hover:bg-[#4a4639]"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Voltar ao Dashboard</span>
            </Button>
          </div>
          
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white mb-2">
              Gerenciamento de Turmas
            </h1>
            <p className="text-accent">
              Gerencie as turmas das suas escolas
            </p>
          </div>
          
          <Button
            onClick={handleAddTurma}
            className="bg-[#D47C06] hover:bg-amber-500 text-white flex items-center space-x-2 border border-[#D47C06]"
          >
            <Plus className="h-5 w-5" />
            <span>Nova Turma</span>
          </Button>
        </div>

        {/* Filtros */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-white">
              Filtrar por Escola
            </label>
            <Select
              value={selectedEscola}
              onValueChange={setSelectedEscola}
            >
              <SelectTrigger className="bg-[#4a4639] border-[#D47C06] text-white hover:bg-[#57533f]">
                <SelectValue placeholder="Todas as escolas" />
              </SelectTrigger>
              <SelectContent className="bg-[#4a4639] border-[#D47C06]">
                <SelectItem value="todas" className="text-white hover:bg-[#57533f]">Todas as escolas</SelectItem>
                {escolas.map((escola) => (
                  <SelectItem key={escola.id} value={escola.id} className="text-white hover:bg-[#57533f]">
                    {escola.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-white">
              Buscar Turmas
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-accent" />
              <Input
                placeholder="Nome da turma, série..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-[#4a4639] border-[#D47C06] text-white placeholder:text-accent"
              />
            </div>
          </div>
          
          <div className="flex items-end">
            <div className="bg-[#312e26] border border-[#D47C06] p-4 rounded-lg shadow-sm w-full">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">
                  {filteredTurmas.length}
                </div>
                <div className="text-sm text-accent">
                  Turmas encontradas
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Lista de Turmas */}
        {loading ? (
          <div className="text-center py-12">
            <div className="text-accent">Carregando turmas...</div>
          </div>
        ) : filteredTurmas.length === 0 ? (
          <div className="text-center py-12">
            <GraduationCap className="h-16 w-16 text-accent mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              Nenhuma turma encontrada
            </h3>
            <p className="text-accent mb-4">
              {searchTerm 
                ? "Nenhuma turma corresponde aos critérios de busca."
                : "Comece criando sua primeira turma."}
            </p>
            {!searchTerm && (
              <Button
                onClick={handleAddTurma}
                className="bg-[#D47C06] hover:bg-amber-500 text-white border border-[#D47C06]"
              >
                <Plus className="h-4 w-4 mr-2" />
                Criar primeira turma
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTurmas.map((turma) => (
              <Card key={turma.id} className="bg-[#312e26] border border-[#D47C06] hover:border-amber-400 transition-all shadow-md">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg font-semibold text-white mb-1">
                        {turma.nome}
                      </CardTitle>
                      <CardDescription className="text-accent text-sm">
                        {turma.escola_nome}
                      </CardDescription>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditTurma(turma)}
                      className="text-primary hover:text-amber-400 hover:bg-[#4a4639]"
                    >
                      <PenSquare className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-3">
                  <div className="flex items-center space-x-2 text-sm text-accent">
                    <GraduationCap className="h-4 w-4 text-[#D47C06]" />
                    <span>{turma.serie}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-sm text-accent">
                    <CalendarDays className="h-4 w-4 text-[#D47C06]" />
                    <span>Ano Letivo: {turma.ano_letivo}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-sm text-accent">
                    <Clock className="h-4 w-4 text-[#D47C06]" />
                    <span>Turno: {turma.turno}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-sm text-accent">
                    <Users className="h-4 w-4 text-[#D47C06]" />
                    <span>{turma.total_alunos} alunos</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Dialog para Adicionar/Editar Turma */}
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogContent className="sm:max-w-[500px] bg-[#2b2518] border border-[#D47C06]">
            <DialogHeader>
              <DialogTitle className="text-white">
                {editTurma ? "Editar Turma" : "Nova Turma"}
              </DialogTitle>
              <DialogDescription className="text-accent">
                {editTurma 
                  ? "Edite as informações da turma abaixo." 
                  : "Preencha as informações para criar uma nova turma."}
              </DialogDescription>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSaveTurma)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="escola_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Escola</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-[#4a4639] border-[#D47C06] text-white">
                            <SelectValue placeholder="Selecione uma escola" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-[#4a4639] border-[#D47C06]">
                          {escolas.map((escola) => (
                            <SelectItem key={escola.id} value={escola.id} className="text-white hover:bg-[#57533f]">
                              {escola.nome}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="nome"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Nome da Turma</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: 3° Ano A" {...field} className="bg-[#4a4639] border-[#D47C06] text-white placeholder:text-accent" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="serie"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Série</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-[#4a4639] border-[#D47C06] text-white">
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-[#4a4639] border-[#D47C06]">
                            <SelectItem value="Ensino Fundamental" className="text-white hover:bg-[#57533f]">Ensino Fundamental</SelectItem>
                            <SelectItem value="Ensino Médio" className="text-white hover:bg-[#57533f]">Ensino Médio</SelectItem>
                            <SelectItem value="EJA" className="text-white hover:bg-[#57533f]">EJA</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="ano_letivo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Ano Letivo</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="2023"
                            max="2030"
                            {...field}
                            className="bg-[#4a4639] border-[#D47C06] text-white placeholder:text-accent"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="turno"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Turno</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-[#4a4639] border-[#D47C06] text-white">
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-[#4a4639] border-[#D47C06]">
                            <SelectItem value="Manhã" className="text-white hover:bg-[#57533f]">Manhã</SelectItem>
                            <SelectItem value="Tarde" className="text-white hover:bg-[#57533f]">Tarde</SelectItem>
                            <SelectItem value="Noite" className="text-white hover:bg-[#57533f]">Noite</SelectItem>
                            <SelectItem value="Integral" className="text-white hover:bg-[#57533f]">Integral</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="modalidade"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Modalidade</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-[#4a4639] border-[#D47C06] text-white">
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-[#4a4639] border-[#D47C06]">
                            <SelectItem value="Presencial" className="text-white hover:bg-[#57533f]">Presencial</SelectItem>
                            <SelectItem value="Remoto" className="text-white hover:bg-[#57533f]">Remoto</SelectItem>
                            <SelectItem value="Híbrido" className="text-white hover:bg-[#57533f]">Híbrido</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="descricao"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Descrição (Opcional)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Informações adicionais sobre a turma"
                          {...field}
                          className="bg-[#4a4639] border-[#D47C06] text-white placeholder:text-accent"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowAddDialog(false)}
                    className="border-[#D47C06] text-white hover:bg-[#4a4639]"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    className="bg-[#D47C06] hover:bg-amber-500 text-white border border-[#D47C06]"
                  >
                    {editTurma ? "Salvar Alterações" : "Criar Turma"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}