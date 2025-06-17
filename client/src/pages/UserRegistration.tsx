import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/context/AuthContext";

// Componentes UI
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Loader2, UserPlus, ArrowRight, Calendar } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { EnhancedDatePicker } from "@/components/ui/enhanced-date-picker";

// Interfaces
interface Turma {
  id: string;
  nome: string;
  serie: string;
}

// Schema de validação do formulário com todos os campos
const userSchema = z.object({
  nome_completo: z.string().min(3, "O nome deve ter pelo menos 3 caracteres"),
  email: z.string().email("E-mail inválido"),
  telefone: z.string().min(14, "Formato de telefone inválido").max(15, "Formato de telefone inválido"),
  data_nascimento: z.date({
    required_error: "A data de nascimento é obrigatória",
  }),
  papel: z.enum(["aluno", "professor", "gestor"], {
    required_error: "Selecione o perfil do usuário",
  }),
  cpf: z.string().min(11, "CPF deve ter pelo menos 11 caracteres"),
  imagem_perfil: z.instanceof(File).optional(),
  // Campos condicionais
  turma_id: z.string().optional(),
  numero_matricula: z.string().optional(),
  escolas_selecionadas: z.array(z.string()).optional(),
}).refine(
  (data) => {
    if (data.papel === "aluno") {
      return data.turma_id && data.numero_matricula && data.cpf;
    }
    if (data.papel === "professor" || data.papel === "gestor") {
      return data.cpf && data.cpf.length >= 11;
    }
    return true;
  },
  {
    message: "Preencha todos os campos obrigatórios para o papel selecionado",
    path: ["papel"],
  }
);

type UserFormData = z.infer<typeof userSchema>;

export default function UserRegistration() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [escolas, setEscolas] = useState<any[]>([]);
  const [formStep, setFormStep] = useState(0);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [escolasSelecionadas, setEscolasSelecionadas] = useState<string[]>([]);
  const [showSchoolSelection, setShowSchoolSelection] = useState(false);

  // Inicializar formulário com react-hook-form e validação de zod
  const form = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      nome_completo: "",
      email: "",
      telefone: "",
      papel: undefined,
    },
  });

  const papel = form.watch("papel");

  // Carregar turmas e escolas disponíveis
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Buscar turmas
        const turmasResponse = await apiRequest("GET", "/api/turmas");
        if (turmasResponse.ok) {
          const turmasData = await turmasResponse.json();
          setTurmas(turmasData);
        }

        // Buscar escolas disponíveis
        const escolasResponse = await apiRequest("GET", "/api/escolas/todas");
        if (escolasResponse.ok) {
          const escolasData = await escolasResponse.json();
          setEscolas(escolasData);
        }
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        toast({
          title: "Erro ao carregar dados",
          description: "Não foi possível obter algumas informações necessárias.",
          variant: "destructive",
        });
      }
    };

    fetchData();
  }, [toast]);

  // Função para aplicar máscara de telefone
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 11) value = value.slice(0, 11);
    
    if (value.length <= 10) {
      // Formato (99) 9999-9999
      value = value.replace(/^(\d{2})(\d)/g, "($1) $2");
      value = value.replace(/(\d)(\d{4})$/, "$1-$2");
    } else {
      // Formato (99) 99999-9999
      value = value.replace(/^(\d{2})(\d)/g, "($1) $2");
      value = value.replace(/(\d)(\d{4})$/, "$1-$2");
    }
    
    form.setValue("telefone", value);
  };

  // Função para aplicar máscara de CPF
  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 11) value = value.slice(0, 11);
    
    value = value.replace(/^(\d{3})(\d)/, "$1.$2");
    value = value.replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3");
    value = value.replace(/\.(\d{3})(\d)/, ".$1-$2");
    
    form.setValue("cpf", value);
  };

  // Função para ir para a tela de seleção de escolas
  const goToSchoolSelection = () => {
    const formValues = form.getValues();
    if (formValues.papel === "professor" || formValues.papel === "gestor") {
      setShowSchoolSelection(true);
    }
  };

  // Função para voltar para o formulário principal
  const goBackToForm = () => {
    setShowSchoolSelection(false);
  };

  // Função para toggle de seleção de escola
  const toggleEscolaSelection = (escolaId: string) => {
    setEscolasSelecionadas(prev => {
      if (prev.includes(escolaId)) {
        return prev.filter(id => id !== escolaId);
      } else {
        return [...prev, escolaId];
      }
    });
  };

  // Função de envio do formulário
  const onSubmit = async (data: UserFormData) => {
    // Para professores e gestores, verificar se precisamos ir para seleção de escolas
    if ((data.papel === "professor" || data.papel === "gestor") && !showSchoolSelection && escolasSelecionadas.length === 0) {
      goToSchoolSelection();
      return;
    }

    setIsSubmitting(true);
    
    try {
      console.log('Dados do formulário antes do envio:', data);
      
      const formData = new FormData();
      
      // Adicionar campos básicos comuns a todos os papéis
      formData.append("nome_completo", data.nome_completo);
      formData.append("email", data.email);
      formData.append("telefone", data.telefone);
      formData.append("data_nascimento", data.data_nascimento.toISOString());
      formData.append("papel", data.papel);
      
      // CPF é obrigatório para todos os papéis
      if (data.cpf) {
        console.log('Adicionando CPF ao FormData:', data.cpf);
        formData.append("cpf", data.cpf);
      }

      // Adicionar campos específicos com base no papel selecionado
      if (data.papel === "aluno" && data.turma_id && data.numero_matricula) {
        formData.append("turma_id", data.turma_id);
        formData.append("numero_matricula", data.numero_matricula);
      }

      // Adicionar escolas selecionadas para professores e gestores
      if ((data.papel === "professor" || data.papel === "gestor") && escolasSelecionadas.length > 0) {
        formData.append("escolas_selecionadas", JSON.stringify(escolasSelecionadas));
      }
      
      // Log do FormData para debug
      console.log('FormData entries:');
      for (let [key, value] of formData.entries()) {
        console.log(key, value);
      }
      
      // Adicionar imagem de perfil se disponível
      if (data.imagem_perfil) {
        formData.append("imagem_perfil", data.imagem_perfil);
      }
      
      // Enviar formulário para a API
      const response = await apiRequest("POST", "/api/usuarios", formData, true);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erro ao cadastrar usuário");
      }
      
      toast({
        title: "Usuário cadastrado com sucesso!",
        description: "O novo usuário foi adicionado ao sistema.",
      });
      
      // Opções após cadastro
      form.reset();
      setFormStep(0);
      
    } catch (error) {
      console.error("Erro ao cadastrar usuário:", error);
      toast({
        title: "Erro ao cadastrar usuário",
        description: error instanceof Error ? error.message : "Ocorreu um erro ao processar sua solicitação",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Verificar permissão para acessar esta página
  useEffect(() => {
    if (user && user.role !== 'manager') {
      toast({
        title: "Acesso negado",
        description: "Você não tem permissão para acessar esta página.",
        variant: "destructive",
      });
      setLocation("/");
    }
  }, [user, setLocation, toast]);

  return (
    <div className="container mx-auto p-4 max-w-4xl min-h-screen py-10">
      <div className="mb-8 border-b border-primary/40 pb-4">
        <h1 className="text-3xl font-bold mb-2 text-parchment font-medieval">CADASTRO DE USUÁRIOS</h1>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setLocation("/manager")}
            className="border-primary text-parchment hover:bg-dark-light"
          >
            Voltar ao Dashboard
          </Button>
        </div>
      </div>

      <Card className="w-full border border-primary shadow-md bg-dark-light">
        <CardHeader className="space-y-1 border-b border-primary/60 bg-dark">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-dark p-3 rounded-full border border-accent">
              <UserPlus className="h-10 w-10 text-accent" />
            </div>
          </div>
          <CardTitle className="text-2xl text-center text-parchment font-medieval">Cadastrar Novo Usuário</CardTitle>
          <CardDescription className="text-center text-parchment-dark">
            Preencha os dados do novo usuário para cadastrá-lo na plataforma SABIÁ RPG
          </CardDescription>
        </CardHeader>

        <CardContent className="pb-4 p-6">
          {!showSchoolSelection ? (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {formStep === 0 && (
                <div className="space-y-6">
                  <div className="border border-primary/40 rounded-md p-4 bg-dark shadow-sm space-y-4">
                    <FormField
                      control={form.control}
                      name="papel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-parchment font-medium">Perfil do Usuário</FormLabel>
                          <Select
                            onValueChange={(value) => {
                              field.onChange(value);
                              // Reset campos específicos ao trocar o papel
                              if (value === "aluno") {
                                form.setValue("cpf", "");
                              } else if (value === "professor") {
                                form.setValue("turma_id", "");
                                form.setValue("numero_matricula", "");
                              } else {
                                form.setValue("turma_id", "");
                                form.setValue("numero_matricula", "");
                                form.setValue("cpf", "");
                              }
                            }}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="border-primary bg-dark text-parchment focus:ring-accent">
                                <SelectValue placeholder="Selecione o perfil" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-dark border border-primary text-parchment">
                              <SelectItem value="aluno" className="focus:bg-dark-light focus:text-parchment">Aluno</SelectItem>
                              <SelectItem value="professor" className="focus:bg-dark-light focus:text-parchment">Professor</SelectItem>
                              <SelectItem value="gestor" className="focus:bg-dark-light focus:text-parchment">Gestor</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription className="text-parchment-dark">
                            O perfil determina as permissões do usuário na plataforma
                          </FormDescription>
                          <FormMessage className="text-destructive" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="nome_completo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-parchment font-medium">Nome Completo</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Ex: Maria Silva Santos" 
                              {...field} 
                              className="border-primary bg-dark text-parchment placeholder:text-parchment-dark focus:border-accent focus:ring-accent"
                            />
                          </FormControl>
                          <FormMessage className="text-destructive" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-parchment font-medium">E-mail</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="Ex: maria.silva@exemplo.com"
                              {...field}
                              className="border-primary bg-dark text-parchment placeholder:text-parchment-dark focus:border-accent focus:ring-accent"
                            />
                          </FormControl>
                          <FormMessage className="text-destructive" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="telefone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-parchment font-medium">Telefone</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="(99) 99999-9999"
                              value={field.value}
                              onChange={(e) => {
                                field.onChange(e);
                                handlePhoneChange(e);
                              }}
                              className="border-primary bg-dark text-parchment placeholder:text-parchment-dark focus:border-accent focus:ring-accent"
                            />
                          </FormControl>
                          <FormMessage className="text-destructive" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="data_nascimento"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel className="text-parchment font-medium">Data de Nascimento</FormLabel>
                          <FormControl>
                            <EnhancedDatePicker
                              value={field.value}
                              onChange={field.onChange}
                              placeholder="Digite ou selecione a data (dd/mm/aaaa)"
                              maxDate={new Date()}
                              disabled={(date: Date) => date > new Date()}
                              className="w-full"
                            />
                          </FormControl>
                          <FormMessage className="text-red-400" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="cpf"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-parchment font-medium">CPF</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="123.456.789-00" 
                              value={field.value}
                              onChange={(e) => {
                                field.onChange(e);
                                handleCpfChange(e);
                              }}
                              className="border-primary bg-dark text-parchment placeholder:text-parchment-dark focus:border-accent focus:ring-accent"
                            />
                          </FormControl>
                          <FormDescription className="text-parchment-dark">
                            O CPF será usado como senha temporária inicial
                          </FormDescription>
                          <FormMessage className="text-destructive" />
                        </FormItem>
                      )}
                    />

                    <div className="pt-4 border-t border-primary/40 mt-4">
                      <Button
                        type="button"
                        className="w-full bg-accent hover:bg-accent-dark text-white border border-primary shadow-md"
                        onClick={() => {
                          // Validar os campos da primeira etapa antes de avançar
                          form.trigger(['nome_completo', 'email', 'telefone', 'data_nascimento', 'papel']);
                          const hasErrors = !!form.formState.errors.nome_completo || 
                                          !!form.formState.errors.email ||
                                          !!form.formState.errors.telefone ||
                                          !!form.formState.errors.data_nascimento ||
                                          !!form.formState.errors.papel;
                          
                          if (!hasErrors && form.getValues('papel')) {
                            setFormStep(1);
                          }
                        }}
                      >
                        Próximo
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {formStep === 1 && (
                <div className="space-y-6 mt-1">
                  <div className="border border-primary/40 rounded-md p-4 bg-dark shadow-sm space-y-4">
                    {papel === "aluno" && (
                      <>
                        <FormField
                          control={form.control}
                          name="turma_id"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-parchment font-medium">Turma</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger className="border-primary bg-dark text-parchment focus:ring-accent">
                                    <SelectValue placeholder="Selecione a turma" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent className="bg-dark border border-primary text-parchment">
                                  {turmas.map((turma) => (
                                    <SelectItem key={turma.id} value={turma.id} className="focus:bg-dark-light focus:text-parchment">
                                      {turma.nome} ({turma.serie})
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage className="text-destructive" />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="numero_matricula"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-parchment font-medium">Número de Matrícula</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="Ex: 202400123" 
                                  {...field} 
                                  className="border-primary bg-dark text-parchment placeholder:text-parchment-dark focus:border-accent focus:ring-accent"
                                />
                              </FormControl>
                              <FormMessage className="text-destructive" />
                            </FormItem>
                          )}
                        />
                      </>
                    )}



                    <div className="flex gap-2 pt-4 border-t border-primary/40 mt-4">
                      <Button
                        type="button"
                        variant="outline"
                        className="w-1/2 border-primary text-parchment hover:bg-dark-light"
                        onClick={() => setFormStep(0)}
                      >
                        Voltar
                      </Button>
                      <Button
                        type="submit"
                        className="w-1/2 bg-accent hover:bg-accent-dark text-white border border-primary shadow-md"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Cadastrando...
                          </>
                        ) : (
                          "Cadastrar Usuário"
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </form>
            </Form>
          ) : (
            // Tela de seleção de escolas
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <h3 className="text-xl font-semibold text-parchment">
                  Selecionar Escolas
                </h3>
                <p className="text-parchment-dark">
                  Selecione pelo menos uma escola para vincular o {form.getValues("papel")}
                </p>
              </div>

              <div className="grid gap-3 max-h-96 overflow-y-auto">
                {escolas.map((escola) => (
                  <div
                    key={escola.id}
                    onClick={() => toggleEscolaSelection(escola.id)}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      escolasSelecionadas.includes(escola.id)
                        ? "border-accent bg-accent/10 text-accent"
                        : "border-primary/40 bg-dark hover:bg-dark-light text-parchment"
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                        escolasSelecionadas.includes(escola.id)
                          ? "border-accent bg-accent"
                          : "border-primary/40"
                      }`}>
                        {escolasSelecionadas.includes(escola.id) && (
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        )}
                      </div>
                      <div>
                        <h4 className="font-medium">{escola.nome}</h4>
                        {escola.endereco && (
                          <p className="text-sm opacity-75">{escola.endereco}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-3 pt-4 border-t border-primary/40">
                <Button
                  type="button"
                  variant="outline"
                  onClick={goBackToForm}
                  className="flex-1 border-primary text-parchment hover:bg-dark-light"
                >
                  Voltar
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    if (escolasSelecionadas.length > 0) {
                      const formData = form.getValues();
                      onSubmit(formData);
                    }
                  }}
                  disabled={escolasSelecionadas.length === 0}
                  className="flex-1 bg-accent hover:bg-accent-dark text-white"
                >
                  Cadastrar {form.getValues("papel")} ({escolasSelecionadas.length} escola{escolasSelecionadas.length !== 1 ? 's' : ''} selecionada{escolasSelecionadas.length !== 1 ? 's' : ''})
                </Button>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-center text-sm text-parchment-dark border-t border-primary/40 bg-dark py-4">
          Todos os campos marcados são obrigatórios para o cadastro
        </CardFooter>
      </Card>
    </div>
  );
}