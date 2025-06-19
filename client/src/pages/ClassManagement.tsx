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
  Clock,
  Building2
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
    <div className="min-h-screen bg-background-primary">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header moderno */}
        <div className="mb-12">
          <div className="flex items-start justify-between">
            <div className="space-y-6">
              <Button
                variant="ghost"
                onClick={() => setLocation("/manager")}
                className="inline-flex items-center space-x-2 text-primary hover:text-primary-hover hover:bg-background-elevated rounded-lg px-4 py-2 transition-all duration-200 group"
              >
                <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform duration-200" />
                <span className="font-medium">Voltar ao Dashboard</span>
              </Button>
              
              <div>
                <h1 className="text-5xl font-bold text-text-primary mb-3 tracking-tight">
                  Gerenciamento de Turmas
                </h1>
                <p className="text-accent text-xl font-medium">
                  Gerencie as turmas das suas escolas
                </p>
              </div>
            </div>
            
            <Button
              onClick={handleAddTurma}
              className="bg-primary hover:bg-primary-hover text-primary-contrast px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 font-semibold"
              size="lg"
            >
              <Plus className="h-5 w-5 mr-3" />
              Nova Turma
            </Button>
          </div>
        </div>

        {/* Seção de Filtros Modernizada */}
        <div className="backdrop-blur-sm rounded-3xl p-8 border border-primary/30 mb-10">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Filtro por Escola */}
            <div className="lg:col-span-2 space-y-3">
              <label className="text-sm font-semibold text-primary-contrast uppercase tracking-wide">
                Filtrar por Escola
              </label>
              <Select value={selectedEscola} onValueChange={setSelectedEscola}>
                <SelectTrigger className="h-12 bg-transparent border-primary/30 text-text-primary rounded-xl focus:ring-2 focus:ring-primary focus:border-primary/50 transition-all">
                  <SelectValue placeholder="Selecione uma escola" />
                </SelectTrigger>
                <SelectContent className="rounded-xl bg-background-primary border-primary/30">
                  <SelectItem value="todas" className="rounded-lg text-text-primary hover:bg-background-elevated">Todas as escolas</SelectItem>
                  {escolas.map((escola) => (
                    <SelectItem key={escola.id} value={escola.id} className="rounded-lg text-text-primary hover:bg-background-elevated">
                      {escola.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Campo de Busca */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-primary-contrast uppercase tracking-wide">
                Buscar Turmas
              </label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-accent h-5 w-5" />
                <Input
                  type="text"
                  placeholder="Nome, série ou escola..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="h-12 pl-12 bg-transparent border-primary/30 text-text-primary placeholder:text-text-secondary rounded-xl focus:ring-2 focus:ring-primary focus:border-primary/50 transition-all"
                />
              </div>
            </div>
            
            {/* Contador de Resultados */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-text-primary uppercase tracking-wide">
                Resultados
              </label>
              <div className="bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-xl p-4 h-12 flex items-center justify-center">
                <div className="text-center">
                  <span className="text-2xl font-bold text-primary mr-2">
                    {filteredTurmas.length}
                  </span>
                  <span className="text-sm text-accent font-medium">
                    {filteredTurmas.length === 1 ? 'turma' : 'turmas'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Lista de Turmas Modernizada */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="text-accent font-medium">Carregando turmas...</p>
            </div>
          </div>
        ) : filteredTurmas.length === 0 ? (
          <div className="text-center py-20">
            <div className="backdrop-blur-sm rounded-3xl p-12 max-w-md mx-auto border border-primary/30">
              <GraduationCap className="h-20 w-20 text-primary mx-auto mb-6 opacity-60" />
              <h3 className="text-2xl font-bold text-text-primary mb-3">
                {searchTerm || selectedEscola !== "todas" 
                  ? "Nenhuma turma encontrada" 
                  : "Nenhuma turma cadastrada"}
              </h3>
              <p className="text-accent mb-8 text-lg">
                {searchTerm || selectedEscola !== "todas"
                  ? "Tente ajustar os filtros de busca."
                  : "Comece criando sua primeira turma."}
              </p>
              {(!searchTerm && selectedEscola === "todas") && (
                <Button
                  onClick={handleAddTurma}
                  className="bg-primary hover:bg-primary-hover text-primary-contrast px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  <Plus className="h-5 w-5 mr-3" />
                  Criar Primeira Turma
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredTurmas.map((turma) => (
              <Card key={turma.id} className="backdrop-blur-sm border border-primary/30 hover:border-primary/50 transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1 rounded-3xl overflow-hidden">
                <CardHeader className="pb-4 bg-gradient-to-r from-primary/5 to-primary/10">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl font-bold text-text-primary mb-2 line-clamp-1">
                        {turma.nome}
                      </CardTitle>
                      <CardDescription className="text-accent text-sm font-medium flex items-center">
                        <Building2 className="h-4 w-4 mr-2 text-primary" />
                        {turma.escola_nome}
                      </CardDescription>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditTurma(turma)}
                      className="text-primary hover:text-primary-hover hover:bg-primary/10 rounded-xl p-2"
                    >
                      <PenSquare className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                
                <CardContent className="p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-3 text-sm">
                      <div className="bg-primary/10 p-2 rounded-lg">
                        <GraduationCap className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-text-secondary text-xs uppercase tracking-wide font-medium">Série</p>
                        <p className="text-text-primary font-semibold">{turma.serie}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3 text-sm">
                      <div className="bg-primary/10 p-2 rounded-lg">
                        <CalendarDays className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-text-secondary text-xs uppercase tracking-wide font-medium">Ano</p>
                        <p className="text-text-primary font-semibold">{turma.ano_letivo}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3 text-sm">
                      <div className="bg-primary/10 p-2 rounded-lg">
                        <Clock className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-text-secondary text-xs uppercase tracking-wide font-medium">Turno</p>
                        <p className="text-text-primary font-semibold">{turma.turno}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3 text-sm">
                      <div className="bg-primary/10 p-2 rounded-lg">
                        <Users className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-text-secondary text-xs uppercase tracking-wide font-medium">Alunos</p>
                        <p className="text-text-primary font-semibold">{turma.total_alunos}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Dialog para Adicionar/Editar Turma */}
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogContent className="sm:max-w-[500px] bg-background-card border border-primary">
            <DialogHeader>
              <DialogTitle className="text-text-primary">
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