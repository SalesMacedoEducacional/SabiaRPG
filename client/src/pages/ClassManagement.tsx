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
  Clock, 
  BookOpen
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronLeft } from "lucide-react";

interface Escola {
  id: string;
  nome: string;
  codigo_escola?: string;
}

interface Turma {
  id: string;
  nome_turma: string;
  serie: string;
  ano_letivo: number;
  escola_id: string;
  modalidade: string;
  turno: string;
  capacidade: number;
  total_alunos?: number;
  ativo: boolean;
}

// Esquema para validação do formulário de turma
const turmaFormSchema = z.object({
  nome_turma: z.string().min(1, "O nome da turma é obrigatório"),
  serie: z.string().min(1, "A série é obrigatória"),
  ano_letivo: z.coerce.number().min(2023, "O ano letivo deve ser 2023 ou posterior"),
  turno: z.string().min(1, "O turno é obrigatório"),
  modalidade: z.string().min(1, "A modalidade é obrigatória"),
  capacidade: z.coerce.number().min(1, "A capacidade mínima é 1 aluno"),
  escola_id: z.string().min(1, "A escola é obrigatória"),
});

export default function ClassManagement() {
  const [location, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [escolas, setEscolas] = useState<Escola[]>([]);
  const [selectedEscola, setSelectedEscola] = useState<string>("");
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showAddDialog, setShowAddDialog] = useState<boolean>(false);
  const [editTurma, setEditTurma] = useState<Turma | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Form setup
  const form = useForm<z.infer<typeof turmaFormSchema>>({
    resolver: zodResolver(turmaFormSchema),
    defaultValues: {
      nome_turma: "",
      serie: "",
      ano_letivo: new Date().getFullYear(),
      turno: "",
      modalidade: "",
      capacidade: 30,
      escola_id: "",
    },
  });

  // Carregar escolas do gestor
  useEffect(() => {
    const fetchEscolas = async () => {
      try {
        const response = await axios.get("/api/escolas/gestor");
        setEscolas(response.data);
        
        if (response.data.length > 0) {
          setSelectedEscola(response.data[0].id);
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

  // Carregar turmas da escola selecionada
  useEffect(() => {
    if (selectedEscola) {
      const fetchTurmas = async () => {
        try {
          setLoading(true);
          const response = await axios.get(`/api/turmas?escola_id=${selectedEscola}`);
          setTurmas(response.data);
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
    }
  }, [selectedEscola, toast]);

  // Abrir diálogo para adicionar nova turma
  const handleAddTurma = () => {
    form.reset({
      nome_turma: "",
      serie: "",
      ano_letivo: new Date().getFullYear(),
      turno: "",
      modalidade: "",
      capacidade: 30,
      escola_id: selectedEscola,
    });
    setEditTurma(null);
    setShowAddDialog(true);
  };

  // Abrir diálogo para editar turma existente
  const handleEditTurma = (turma: Turma) => {
    form.reset({
      nome_turma: turma.nome_turma,
      serie: turma.serie,
      ano_letivo: turma.ano_letivo,
      turno: turma.turno,
      modalidade: turma.modalidade,
      capacidade: turma.capacidade,
      escola_id: turma.escola_id,
    });
    setEditTurma(turma);
    setShowAddDialog(true);
  };

  // Enviar formulário de turma (criar/editar)
  const onSubmit = async (values: z.infer<typeof turmaFormSchema>) => {
    try {
      if (editTurma) {
        // Atualizar turma existente
        await axios.put(`/api/turmas/${editTurma.id}`, values);
        toast({
          title: "Sucesso",
          description: "Turma atualizada com sucesso!",
        });
      } else {
        // Criar nova turma
        await axios.post("/api/turmas", values);
        toast({
          title: "Sucesso",
          description: "Turma criada com sucesso!",
        });
      }
      
      // Recarregar turmas
      const response = await axios.get(`/api/turmas?escola_id=${selectedEscola}`);
      setTurmas(response.data);
      setShowAddDialog(false);
    } catch (error) {
      console.error("Erro ao salvar turma:", error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar a turma. Tente novamente mais tarde.",
        variant: "destructive",
      });
    }
  };

  // Filtrar turmas por termo de busca
  const filteredTurmas = turmas.filter(turma => 
    turma.nome_turma.toLowerCase().includes(searchTerm.toLowerCase()) ||
    turma.serie.toLowerCase().includes(searchTerm.toLowerCase()) ||
    turma.modalidade.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Encontrar nome da escola selecionada
  const escolaSelecionadaNome = escolas.find(e => e.id === selectedEscola)?.nome || "Selecione uma escola";

  return (
    <div className="container mx-auto py-6 px-4 md:px-6">
      <div className="flex items-center mb-6">
        <Button 
          onClick={() => setLocation("/dashboard")} 
          variant="outline" 
          className="mr-4 bg-transparent border-primary text-parchment hover:bg-dark-light"
        >
          <ChevronLeft className="h-4 w-4 mr-1" /> Voltar ao Dashboard
        </Button>
        <h1 className="text-2xl font-bold text-parchment">Gerenciamento de Turmas</h1>
      </div>

      <Card className="mb-6 bg-dark border border-primary">
        <CardHeader className="border-b border-primary/40 bg-dark">
          <CardTitle className="text-lg text-parchment flex items-center">
            <School className="h-5 w-5 mr-2 text-accent" />
            Escola Selecionada
          </CardTitle>
          <CardDescription className="text-parchment-dark">
            Selecione uma escola para gerenciar suas turmas
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="flex flex-col space-y-4">
            <Select 
              value={selectedEscola} 
              onValueChange={setSelectedEscola}
              disabled={loading || escolas.length === 0}
            >
              <SelectTrigger className="bg-dark-light border-primary text-parchment">
                <SelectValue placeholder="Selecione uma escola" />
              </SelectTrigger>
              <SelectContent className="bg-dark border-primary">
                {escolas.map(escola => (
                  <SelectItem 
                    key={escola.id} 
                    value={escola.id}
                    className="text-parchment hover:bg-dark-light"
                  >
                    {escola.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between items-center mb-4">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-parchment-dark" />
          <Input
            type="text"
            placeholder="Pesquisar turmas..."
            className="pl-9 bg-dark-light border-primary text-parchment"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button 
          onClick={handleAddTurma} 
          className="ml-4 bg-accent hover:bg-accent-dark text-white border border-primary"
          disabled={!selectedEscola || loading}
        >
          <Plus className="h-4 w-4 mr-2" /> Cadastrar Nova Turma
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-parchment">Carregando turmas...</div>
        </div>
      ) : (
        <>
          {filteredTurmas.length === 0 ? (
            <Card className="bg-dark-light border border-primary/50 text-center p-8">
              <CardContent className="pt-6">
                <p className="text-parchment">
                  {searchTerm ? "Nenhuma turma encontrada com os termos de busca." : "Nenhuma turma cadastrada para esta escola."}
                </p>
                <Button 
                  onClick={handleAddTurma} 
                  className="mt-4 bg-accent hover:bg-accent-dark text-white border border-primary"
                  disabled={!selectedEscola}
                >
                  <Plus className="h-4 w-4 mr-2" /> Cadastrar Nova Turma
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTurmas.map((turma) => (
                <Card key={turma.id} className="bg-dark-light border border-primary overflow-hidden">
                  <CardHeader className="bg-dark pb-2 border-b border-primary/60">
                    <CardTitle className="text-lg text-parchment flex items-center">
                      <BookOpen className="h-5 w-5 mr-2 text-accent" />
                      {turma.nome_turma}
                    </CardTitle>
                    <CardDescription className="text-xs text-parchment-dark mt-1">
                      {turma.serie} - {turma.ano_letivo}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="space-y-2 text-sm">
                      <div className="flex items-start">
                        <Clock className="h-4 w-4 mr-2 text-parchment-dark mt-0.5" />
                        <span className="text-parchment">Turno: {turma.turno}</span>
                      </div>
                      <div className="flex items-start">
                        <BookOpen className="h-4 w-4 mr-2 text-parchment-dark mt-0.5" />
                        <span className="text-parchment">Modalidade: {turma.modalidade}</span>
                      </div>
                      <div className="flex items-start">
                        <Users className="h-4 w-4 mr-2 text-parchment-dark mt-0.5" />
                        <span className="text-parchment">
                          Alunos: {turma.total_alunos || 0} / {turma.capacidade}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="border-t border-primary/40 bg-dark pt-3 flex justify-between">
                    <Button 
                      size="sm" 
                      className="text-xs bg-accent hover:bg-accent-dark text-white border border-primary"
                      onClick={() => handleEditTurma(turma)}
                    >
                      <PenSquare className="h-3.5 w-3.5 mr-1" />
                      Editar Turma
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="text-xs border-primary text-parchment hover:bg-dark-light"
                      onClick={() => {
                        // Navegação para detalhes da turma - para implementar futuramente
                        toast({
                          title: "Informação",
                          description: "Funcionalidade de visualizar detalhes será implementada em breve.",
                        });
                      }}
                    >
                      <Users className="h-3.5 w-3.5 mr-1" />
                      Ver Alunos
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      {/* Diálogo para adicionar/editar turma */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="bg-dark border border-primary text-parchment max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl text-accent">
              {editTurma ? "Editar Turma" : "Cadastrar Nova Turma"}
            </DialogTitle>
            <DialogDescription className="text-parchment-dark">
              {editTurma 
                ? "Edite as informações da turma selecionada." 
                : "Preencha as informações para cadastrar uma nova turma."}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="escola_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-parchment">Escola</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={loading || escolas.length === 0 || !!editTurma}
                    >
                      <FormControl>
                        <SelectTrigger className="bg-dark-light border-primary text-parchment">
                          <SelectValue placeholder="Selecione a escola" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-dark border-primary">
                        {escolas.map(escola => (
                          <SelectItem 
                            key={escola.id} 
                            value={escola.id}
                            className="text-parchment hover:bg-dark-light"
                          >
                            {escola.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="nome_turma"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-parchment">Nome da Turma</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Ex: 6º Ano A"
                          className="bg-dark-light border-primary text-parchment"
                        />
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="serie"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-parchment">Série</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Ex: 6º Ano"
                          className="bg-dark-light border-primary text-parchment"
                        />
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="ano_letivo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-parchment">Ano Letivo</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          className="bg-dark-light border-primary text-parchment"
                          min={2023}
                          max={2050}
                        />
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="turno"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-parchment">Turno</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger className="bg-dark-light border-primary text-parchment">
                            <SelectValue placeholder="Selecione o turno" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-dark border-primary">
                          <SelectItem value="Manhã" className="text-parchment hover:bg-dark-light">Manhã</SelectItem>
                          <SelectItem value="Tarde" className="text-parchment hover:bg-dark-light">Tarde</SelectItem>
                          <SelectItem value="Noite" className="text-parchment hover:bg-dark-light">Noite</SelectItem>
                          <SelectItem value="Integral" className="text-parchment hover:bg-dark-light">Integral</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="modalidade"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-parchment">Modalidade</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger className="bg-dark-light border-primary text-parchment">
                            <SelectValue placeholder="Selecione a modalidade" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-dark border-primary">
                          <SelectItem value="Ensino Fundamental I" className="text-parchment hover:bg-dark-light">Ensino Fundamental I</SelectItem>
                          <SelectItem value="Ensino Fundamental II" className="text-parchment hover:bg-dark-light">Ensino Fundamental II</SelectItem>
                          <SelectItem value="Ensino Médio" className="text-parchment hover:bg-dark-light">Ensino Médio</SelectItem>
                          <SelectItem value="EJA" className="text-parchment hover:bg-dark-light">EJA</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="capacidade"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-parchment">Capacidade</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          className="bg-dark-light border-primary text-parchment"
                          min={1}
                          max={100}
                        />
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />
              </div>
              
              <DialogFooter className="pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowAddDialog(false)}
                  className="bg-transparent border-primary text-parchment hover:bg-dark-light"
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit"
                  className="bg-accent hover:bg-accent-dark text-white border border-primary"
                >
                  {editTurma ? "Salvar Alterações" : "Cadastrar Turma"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}